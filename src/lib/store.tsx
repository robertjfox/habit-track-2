"use client";

import { useSyncExternalStore } from "react";
import type { AppState, Category, Habit } from "./types";

const STORAGE_KEY = "habit-tracker";

// The Work category is hidden on weekends and its history strip omits them.
export const WORK_CATEGORY_ID = "cat-work";

const EMPTY_STATE: AppState = {
  categories: [],
  habits: [],
  completions: {},
};

const SEED_CATEGORIES: Category[] = [
  { id: "cat-work", name: "Work", color: "#6366f1", createdAt: 0 },
  { id: "cat-health", name: "Health", color: "#10b981", createdAt: 1 },
  { id: "cat-personal", name: "Personal", color: "#f59e0b", createdAt: 2 },
];

const SEED_HABITS: Habit[] = [
  { id: "h-w1", categoryId: "cat-work", name: "Distribution", emoji: "🚚", createdAt: 0 },
  { id: "h-wrec", categoryId: "cat-work", name: "Recruiting", emoji: "🤝", createdAt: 1 },
  { id: "h-w5", categoryId: "cat-work", name: "Work with the buyers", emoji: "🛍️", createdAt: 4 },
  { id: "h-w6", categoryId: "cat-work", name: "Facilities mgmt", emoji: "🔨", createdAt: 5 },
  { id: "h-w7", categoryId: "cat-work", name: "Broker outreach", emoji: "🏢", createdAt: 6 },
  { id: "h-w8", categoryId: "cat-work", name: "Technology", emoji: "💻", createdAt: 15 },
  { id: "h-he1", categoryId: "cat-health", name: "Run", emoji: "🏃", createdAt: 7 },
  { id: "h-he2", categoryId: "cat-health", name: "Lift", emoji: "💪", createdAt: 8 },
  { id: "h-he3", categoryId: "cat-health", name: "Stretch", emoji: "🤸", createdAt: 9 },
  { id: "h-he6", categoryId: "cat-health", name: "Tennis", emoji: "🎾", createdAt: 19 },
  { id: "h-he7", categoryId: "cat-health", name: "Golf", emoji: "⛳", createdAt: 20 },
  { id: "h-p1", categoryId: "cat-personal", name: "Meditate", emoji: "🧘", createdAt: 11 },
  { id: "h-p2", categoryId: "cat-personal", name: "Read 30 mins", emoji: "📖", createdAt: 12 },
  { id: "h-p6", categoryId: "cat-personal", name: "Journal 1 page", emoji: "📓", createdAt: 17 },
];

// Seed habits removed after they were already persisted; stripped on load so
// they disappear from existing installs too.
const REMOVED_HABIT_IDS = new Set([
  "h-p3",
  "h-w2",
  "h-w3",
  "h-w4",
  "h-he4",
  "h-he5",
  "h-p4",
  "h-p5",
]);

// Fresh installs start with the categories and habits, but no completion
// history.
function createSeed(): AppState {
  return {
    categories: SEED_CATEGORIES,
    habits: SEED_HABITS,
    completions: {},
  };
}

export type Snapshot = { ready: boolean } & AppState;

const SERVER_SNAPSHOT: Snapshot = { ready: false, ...EMPTY_STATE };

let snapshot: Snapshot = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// All day math is pinned to US Eastern time so the "today" boundary and
// history are consistent regardless of the device's local timezone.
const TZ = "America/New_York";

const KEY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const LONG_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "long",
  month: "long",
  day: "numeric",
});

// Returns the Eastern-time calendar date for an instant as "YYYY-MM-DD".
export function dayKey(date: Date = new Date()): string {
  return KEY_FMT.format(date);
}

export function todayKey(): string {
  return dayKey();
}

// Shifts a "YYYY-MM-DD" key by whole days, staying on the ET calendar.
// Anchoring at noon UTC keeps us far from the ET midnight boundary, so
// daylight-saving transitions never bump us onto the wrong date.
export function shiftKey(key: string, deltaDays: number): string {
  const base = new Date(`${key}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return dayKey(base);
}

export function formatDayLong(key: string): string {
  return LONG_FMT.format(new Date(`${key}T12:00:00Z`));
}

// Day of week for a "YYYY-MM-DD" key (0 = Sunday … 6 = Saturday). The weekday
// of a calendar date is timezone-independent, so UTC is fine here.
export function weekdayOf(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isWeekend(key: string): boolean {
  const w = weekdayOf(key);
  return w === 0 || w === 6;
}

function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const habits = (parsed.habits ?? []).filter(
      (h) => !REMOVED_HABIT_IDS.has(h.id)
    );
    // Backfill seed habits added after data was first persisted.
    const presentIds = new Set(habits.map((h) => h.id));
    for (const seed of SEED_HABITS) {
      if (!presentIds.has(seed.id) && !REMOVED_HABIT_IDS.has(seed.id)) {
        habits.push(seed);
      }
    }
    const completions = Object.fromEntries(
      Object.entries(parsed.completions ?? {}).filter(
        ([key]) => !REMOVED_HABIT_IDS.has(key.split("|")[0])
      )
    );
    return {
      categories: parsed.categories ?? [],
      habits,
      completions,
    };
  } catch {
    return createSeed();
  }
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  snapshot = { ready: true, ...loadState() };
}

function persist() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        categories: snapshot.categories,
        habits: snapshot.habits,
        completions: snapshot.completions,
      })
    );
  } catch {
    // ignore quota / serialization errors
  }
}

function setState(updater: (prev: AppState) => AppState) {
  const next = updater(snapshot);
  snapshot = { ready: true, ...next };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  ensureInitialized();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Snapshot {
  ensureInitialized();
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export const actions = {
  addCategory(name: string, color: string) {
    setState((s) => ({
      ...s,
      categories: [
        ...s.categories,
        { id: uid("cat"), name: name.trim(), color, createdAt: Date.now() },
      ],
    }));
  },
  updateCategory(
    id: string,
    patch: Partial<Pick<Category, "name" | "color">>
  ) {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  },
  deleteCategory(id: string) {
    setState((s) => {
      const habitIds = new Set(
        s.habits.filter((h) => h.categoryId === id).map((h) => h.id)
      );
      const completions = Object.fromEntries(
        Object.entries(s.completions).filter(
          ([key]) => !habitIds.has(key.split("|")[0])
        )
      );
      return {
        categories: s.categories.filter((c) => c.id !== id),
        habits: s.habits.filter((h) => h.categoryId !== id),
        completions,
      };
    });
  },
  addHabit(categoryId: string, name: string, emoji: string) {
    setState((s) => ({
      ...s,
      habits: [
        ...s.habits,
        {
          id: uid("h"),
          categoryId,
          name: name.trim(),
          emoji: emoji.trim() || "✅",
          createdAt: Date.now(),
        },
      ],
    }));
  },
  updateHabit(id: string, patch: Partial<Pick<Habit, "name" | "emoji">>) {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
  },
  deleteHabit(id: string) {
    setState((s) => {
      const completions = Object.fromEntries(
        Object.entries(s.completions).filter(([key]) => key.split("|")[0] !== id)
      );
      return {
        ...s,
        habits: s.habits.filter((h) => h.id !== id),
        completions,
      };
    });
  },
  toggleCompletion(habitId: string, day: string) {
    const key = `${habitId}|${day}`;
    setState((s) => {
      const next = { ...s.completions };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { ...s, completions: next };
    });
  },
};

export function useStore() {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const isComplete = (habitId: string, day: string) =>
    !!state.completions[`${habitId}|${day}`];

  return {
    ready: state.ready,
    state,
    isComplete,
    ...actions,
  };
}

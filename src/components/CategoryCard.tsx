"use client";

import { useState } from "react";
import type { Category, Habit } from "@/lib/types";
import { useStore, shiftKey } from "@/lib/store";
import { AddHabitModal } from "./AddHabitModal";
import { HabitIcon } from "./HabitIcon";

const TRAIL_DAYS = 30;

// Returns the last `n` day keys ending at (and including) `endKey`, oldest first.
function trailingDayKeys(endKey: string, n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(shiftKey(endKey, -i));
  }
  return keys;
}

export function CategoryCard({
  category,
  habits,
  day,
}: {
  category: Category;
  habits: Habit[];
  day: string;
}) {
  const { addHabit, toggleCompletion, isComplete } = useStore();
  const [adding, setAdding] = useState(false);

  const done = habits.filter((h) => isComplete(h.id, day)).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header
        className="flex items-center justify-between gap-2 px-4 py-3"
        style={{ backgroundColor: `${category.color}1a` }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="font-semibold">{category.name}</h2>
          <span className="text-xs text-muted">
            {done}/{habits.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAdding(true)}
            aria-label="Add habit"
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-lg leading-none text-muted active:scale-95 hover:bg-black/5 dark:hover:bg-white/10"
          >
            +
          </button>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {habits.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted">
            No habits yet. Add one above.
          </li>
        )}
        {habits.map((habit) => {
          const complete = isComplete(habit.id, day);
          return (
            <li
              key={habit.id}
              className="transition-colors"
              style={{
                backgroundColor: complete ? `${category.color}33` : undefined,
              }}
            >
              <button
                onClick={() => toggleCompletion(habit.id, day)}
                aria-pressed={complete}
                aria-label={`${habit.name}: ${complete ? "done" : "not done"}`}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center"
                  title={habit.name}
                >
                  <HabitIcon id={habit.id} emoji={habit.emoji} size={22} />
                </span>
                <div className="flex flex-1 gap-[2px]">
                  {trailingDayKeys(day, TRAIL_DAYS).map((k) => {
                    const d = isComplete(habit.id, k);
                    return (
                      <span
                        key={k}
                        className="h-6 flex-1 rounded-[2px]"
                        style={{
                          backgroundColor: d ? category.color : "var(--border)",
                          opacity: d ? 1 : 0.4,
                        }}
                      />
                    );
                  })}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <AddHabitModal
        open={adding}
        categoryName={category.name}
        onClose={() => setAdding(false)}
        onSubmit={(name, emoji) => addHabit(category.id, name, emoji)}
      />
    </section>
  );
}

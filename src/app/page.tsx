"use client";

import { useMemo, useState } from "react";
import { useStore, todayKey, shiftKey, formatDayLong } from "@/lib/store";
import { CategoryCard } from "@/components/CategoryCard";

export default function Home() {
  const { ready, state } = useStore();
  const [selected, setSelected] = useState<string>(() => todayKey());

  const day = selected;
  const isToday = day === todayKey();

  const shiftDay = (delta: number) => {
    setSelected((prev) => {
      const next = shiftKey(prev, delta);
      const today = todayKey();
      return next > today ? today : next;
    });
  };

  const label =
    day === todayKey()
      ? "Today"
      : day === shiftKey(todayKey(), -1)
        ? "Yesterday"
        : formatDayLong(day);

  const orderedCategories = useMemo(
    () => [...state.categories].sort((a, b) => a.createdAt - b.createdAt),
    [state.categories]
  );

  return (
    <div className="mx-auto min-h-full max-w-md px-4 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-center justify-between gap-2">
        <button
          onClick={() => shiftDay(-1)}
          aria-label="Previous day"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-lg text-muted active:scale-95"
        >
          ‹
        </button>

        <p className="text-lg font-semibold">{label}</p>

        <button
          onClick={() => shiftDay(1)}
          disabled={isToday}
          aria-label="Next day"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-lg text-muted active:scale-95 disabled:opacity-30 disabled:active:scale-100"
        >
          ›
        </button>
      </header>

      {!ready ? (
        <p className="text-muted">Loading…</p>
      ) : orderedCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted">No habits to show.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderedCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              habits={state.habits
                .filter((h) => h.categoryId === cat.id)
                .sort((a, b) => a.createdAt - b.createdAt)}
              day={day}
            />
          ))}
        </div>
      )}
    </div>
  );
}

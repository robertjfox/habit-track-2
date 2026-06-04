"use client";

import { useState } from "react";
import { Modal } from "./Modal";

const EMOJI_SUGGESTIONS = [
  "✅", "💧", "🏋️", "🧠", "📚", "🏃", "🧘", "🥗",
  "😴", "✍️", "💊", "🚭", "🎯", "🎸", "🧹", "☎️",
];

export function AddHabitModal({
  open,
  categoryName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  categoryName: string;
  onClose: () => void;
  onSubmit: (name: string, emoji: string) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");

  const submit = () => {
    if (!name.trim()) return;
    onSubmit(name, emoji);
    setName("");
    setEmoji("✅");
    onClose();
  };

  return (
    <Modal open={open} title={`New habit in ${categoryName}`} onClose={onClose}>
      <div className="mb-4 flex gap-3">
        <div className="shrink-0">
          <label className="mb-1 block text-sm font-medium text-muted">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
            className="h-12 w-14 rounded-xl border border-border bg-background text-center text-2xl outline-none focus:border-foreground/40"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-muted">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Drink water"
            className="h-12 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-foreground/40"
          />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {EMOJI_SUGGESTIONS.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-xl hover:bg-border/50"
            style={{ borderColor: emoji === e ? "var(--foreground)" : undefined }}
          >
            {e}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="w-full rounded-xl bg-foreground py-3 font-semibold text-background disabled:opacity-40"
      >
        Add habit
      </button>
    </Modal>
  );
}

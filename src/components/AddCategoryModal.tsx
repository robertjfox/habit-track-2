"use client";

import { useState } from "react";
import { Modal } from "./Modal";

const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

export function AddCategoryModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit(name, color);
    setName("");
    setColor(PALETTE[0]);
    onClose();
  };

  return (
    <Modal open={open} title="New category" onClose={onClose}>
      <label className="mb-1 block text-sm font-medium text-muted">Name</label>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="e.g. Work, Health, Personal"
        className="mb-4 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground/40"
      />

      <label className="mb-2 block text-sm font-medium text-muted">Color</label>
      <div className="mb-5 flex flex-wrap gap-2">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className="h-9 w-9 rounded-full ring-offset-2 ring-offset-card transition"
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 0 2px var(--card), 0 0 0 4px ${c}` : "none",
            }}
          />
        ))}
      </div>

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="w-full rounded-xl bg-foreground py-3 font-semibold text-background disabled:opacity-40"
      >
        Add category
      </button>
    </Modal>
  );
}

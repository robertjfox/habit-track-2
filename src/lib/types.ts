export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

export type Habit = {
  id: string;
  categoryId: string;
  name: string;
  emoji: string;
  createdAt: number;
};

// Map of `${habitId}|${YYYY-MM-DD}` -> true when completed that day.
export type Completions = Record<string, boolean>;

export type AppState = {
  categories: Category[];
  habits: Habit[];
  completions: Completions;
};

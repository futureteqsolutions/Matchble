import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("Matchgle-theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("Matchgle-theme", theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));


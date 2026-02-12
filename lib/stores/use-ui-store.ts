import { create } from "zustand";

type UiState = {
  isNavOpen: boolean;
  setNavOpen: (value: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isNavOpen: false,
  setNavOpen: (value) => set({ isNavOpen: value }),
}));

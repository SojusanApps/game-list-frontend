import { create } from "zustand";

/** Why the user is being asked to sign in; picks the copy shown in the prompt. */
export type LoginReason = "addToList" | "follow" | "review" | "addToCollection" | "favorite" | "friend" | "page";

interface OpenOptions {
  reason?: LoginReason;
  /** In-app path (with search) to return to after signing in; defaults to the current page. */
  redirectTo?: string;
}

interface LoginPromptState {
  isOpen: boolean;
  reason?: LoginReason;
  redirectTo?: string;
  open: (options?: OpenOptions) => void;
  close: () => void;
}

export const useLoginPromptStore = create<LoginPromptState>()(set => ({
  isOpen: false,
  open: options => set({ isOpen: true, reason: options?.reason, redirectTo: options?.redirectTo }),
  close: () => set({ isOpen: false }),
}));

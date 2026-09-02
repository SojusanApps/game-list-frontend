import { create } from "zustand";

import { useAuthStore } from "@/features/auth/store/authStore";

interface DraftState {
  /** Draft form values keyed by modal type + the entity id(s) the modal operates on. */
  drafts: Record<string, unknown>;
  setDraft: (key: string, values: unknown) => void;
  getDraft: (key: string) => unknown;
  clearDraft: (key: string) => void;
  clearAllDrafts: () => void;
}

/**
 * In-memory (per-tab, per-session) store for unsaved modal form drafts.
 *
 * Modals mirror their form values here while the form is dirty so that closing the
 * modal — by overlay click, Escape, Cancel or the X — does not lose what the user
 * typed. A draft is removed only when its owning mutation succeeds (see
 * {@link useModalDraft}). Deliberately NOT persisted to localStorage: the drafts
 * should not outlive a reload. See docs/adr/0006-in-memory-modal-drafts.md.
 */
export const useDraftStore = create<DraftState>()((set, get) => ({
  drafts: {},
  setDraft: (key, values) => set(state => ({ drafts: { ...state.drafts, [key]: values } })),
  getDraft: key => get().drafts[key],
  clearDraft: key =>
    set(state => {
      if (!(key in state.drafts)) {
        return state;
      }
      const next = { ...state.drafts };
      delete next[key];
      return { drafts: next };
    }),
  clearAllDrafts: () => set({ drafts: {} }),
}));

// Drafts belong to the user who typed them. A Keycloak logout normally triggers a
// full-page redirect that discards this store anyway; this subscription is the
// safety net for any logout path that leaves the page mounted.
useAuthStore.subscribe((state, prev) => {
  if (prev.isAuthenticated && !state.isAuthenticated) {
    useDraftStore.getState().clearAllDrafts();
  }
});

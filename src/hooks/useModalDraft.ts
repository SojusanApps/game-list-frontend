import { useForm, type UseFormInput, type UseFormReturnType } from "@mantine/form";
import * as React from "react";

import { useDraftStore } from "@/lib/draftStore";

type FormValues = Record<string, unknown>;

interface UseModalDraftParams<Values extends FormValues> {
  /** Stable identifier for this draft: modal type + entity id(s), e.g. `"game-review:42"`. */
  draftKey: string;
  /** Whether the modal is currently open. Seeding and mirroring only run while open. */
  opened: boolean;
  /** Values shown when there is no draft — server/props data for edit modals, blanks for create. */
  baseline: Values;
  /** Extra `useForm` options (`validate`, `validateInputOnChange`, ...). */
  formOptions?: Omit<UseFormInput<Values>, "initialValues" | "mode">;
}

interface UseModalDraftResult<Values extends FormValues> {
  form: UseFormReturnType<Values>;
  /** True when a draft was restored on open — i.e. the notice/"Discard" bar should show. */
  hasDraft: boolean;
  /** Drop the draft and restore the baseline. Keeps the modal open. */
  discardDraft: () => void;
  /** Drop the draft, accepting the current values as saved. Call on mutation success. */
  clearDraft: () => void;
}

/**
 * Backs a modal form with an in-memory draft (see {@link useDraftStore}).
 *
 * While the modal is open and the values diverge from the baseline, they are mirrored
 * into the draft store, so closing the modal — deliberately or by accident — keeps
 * what the user typed. Reopening restores it. The draft is removed only by
 * {@link clearDraft} (on mutation success) or {@link discardDraft} (the user's
 * explicit "Discard").
 */
export function useModalDraft<Values extends FormValues>({
  draftKey,
  opened,
  baseline,
  formOptions,
}: UseModalDraftParams<Values>): UseModalDraftResult<Values> {
  // `hasDraft` reflects only a draft that was present when the modal opened (a
  // *restored* one). Content typed during the current session is not a "restored
  // draft" — clearing the field or Cancel is enough there — so it doesn't show the bar.
  const [hasDraft, setHasDraft] = React.useState(() => opened && draftKey in useDraftStore.getState().drafts);

  const form = useForm<Values>({
    ...formOptions,
    initialValues: (useDraftStore.getState().drafts[draftKey] as Values | undefined) ?? baseline,
  });

  // The caller usually passes a fresh `baseline` object each render; keep the latest
  // one reachable from effects without making it a dependency.
  const baselineRef = React.useRef(baseline);
  baselineRef.current = baseline;
  const baselineKey = JSON.stringify(baseline);

  // The baseline JSON the form is currently sitting on. Updated on (re)seed and when a
  // late-arriving baseline is adopted; the mirror effect compares against this.
  const appliedBaselineKeyRef = React.useRef(baselineKey);
  // Set by (re)seeding so the mirror effect skips the render where `form.values` is
  // still the pre-seed snapshot (`setValues` lands a render later).
  const skipMirrorRef = React.useRef(false);

  const { setValues, setInitialValues, resetDirty } = form;

  // Seed the form when the modal opens (or the target entity changes): restore a
  // stored draft if there is one, otherwise fall back to the baseline.
  React.useEffect(() => {
    if (!opened) {
      setHasDraft(false);
      return;
    }
    const draft = useDraftStore.getState().drafts[draftKey] as Values | undefined;
    setHasDraft(draft !== undefined);
    setInitialValues(baselineRef.current);
    setValues(draft ?? baselineRef.current);
    resetDirty(baselineRef.current);
    appliedBaselineKeyRef.current = baselineKey;
    skipMirrorRef.current = true;
    // `baselineKey` drives only `appliedBaselineKeyRef`, not a re-seed — a late
    // baseline is handled by the adopt effect, and re-seeding here would clobber
    // an in-progress edit.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [opened, draftKey, setValues, setInitialValues, resetDirty]);

  // Adopt a baseline that arrives/changes after open (async server data) — but only
  // when there is no draft and the user has not edited away from the applied baseline.
  React.useEffect(() => {
    if (
      !opened ||
      baselineKey === appliedBaselineKeyRef.current ||
      draftKey in useDraftStore.getState().drafts ||
      JSON.stringify(form.values) !== appliedBaselineKeyRef.current
    ) {
      return;
    }
    setInitialValues(baselineRef.current);
    setValues(baselineRef.current);
    resetDirty(baselineRef.current);
    appliedBaselineKeyRef.current = baselineKey;
    skipMirrorRef.current = true;
    // oxlint-disable-next-line react/exhaustive-deps
  }, [baselineKey, opened, draftKey, form.values, setValues, setInitialValues, resetDirty]);

  // Mirror the values into the store while they diverge from the applied baseline, so
  // any close keeps them; drop the entry once the form matches the baseline again.
  React.useEffect(() => {
    if (!opened) {
      return;
    }
    if (skipMirrorRef.current) {
      skipMirrorRef.current = false;
      return;
    }
    if (JSON.stringify(form.values) === appliedBaselineKeyRef.current) {
      useDraftStore.getState().clearDraft(draftKey);
    } else {
      useDraftStore.getState().setDraft(draftKey, form.values);
    }
    // oxlint-disable-next-line react/exhaustive-deps
  }, [opened, draftKey, form.values]);

  const discardDraft = React.useCallback(() => {
    useDraftStore.getState().clearDraft(draftKey);
    setHasDraft(false);
    setInitialValues(baselineRef.current);
    setValues(baselineRef.current);
    resetDirty(baselineRef.current);
    appliedBaselineKeyRef.current = JSON.stringify(baselineRef.current);
    skipMirrorRef.current = true;
  }, [draftKey, setValues, setInitialValues, resetDirty]);

  const clearDraft = React.useCallback(() => {
    // Just drop the stored entry. The mirror effect reacts only to `form.values`
    // changes, so it won't re-create the draft for a modal that stays open after a
    // successful submit until the user actually edits again.
    useDraftStore.getState().clearDraft(draftKey);
    setHasDraft(false);
  }, [draftKey]);

  return { form, hasDraft, discardDraft, clearDraft };
}

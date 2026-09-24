import * as React from "react";

/**
 * `useState` that goes back to `resetValue` whenever any of `deps` changes
 * (compared with `Object.is`, like effect deps).
 *
 * The reset happens during render rather than in an effect, so the stale value
 * is never committed — e.g. a changed filter never renders (or fetches) the old
 * page number first.
 * See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useResettableState<T>(
  resetValue: T,
  deps: readonly unknown[],
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState(resetValue);
  const [prevDeps, setPrevDeps] = React.useState(deps);

  if (deps.length !== prevDeps.length || deps.some((dep, i) => !Object.is(dep, prevDeps[i]))) {
    setPrevDeps(deps);
    setState(resetValue);
  }

  return [state, setState];
}

# Gender-neutral Polish copy instead of a gendered translation branch

**Status**: accepted

## Context

Several Polish strings addressed or described the user with masculine grammar
(`"Dotarłeś do końca"`, `"Gotowy na odkrywanie?"`, `"Dołączył:"`, FAQ questions
phrased as `"Jak powinienem…"`). English is effectively ungendered, so this only
affected `pl/`.

A `gender` field does exist on `UserDetail` (free-form string from the backend,
often empty, editable only in Sojusan Auth), and i18next has a built-in `context`
feature that would let keys resolve to `key_male` / `key_female`. So a future
reader might reasonably ask "why didn't they just branch on `user.gender`?".

## Decision

We reword the affected Polish strings to be gender-neutral (present/future 2nd
person, impersonal, or nominal forms) rather than wiring copy to the `gender`
field or i18next `context`. This covers strings about a target/viewed user too.

Reasons:

- `gender` is frequently empty and unvalidated; most reads would fall back to a
  default anyway, so the branch would rarely fire.
- Much of this copy (404 page, FAQ, login-required modal) is shown to anonymous
  visitors where there is no user to read a gender from.
- A gendered branch means every such key needs two maintained variants forever,
  and the fallback still has to pick a gender — neutral phrasing removes the
  problem instead of defaulting it.

## Consequences

- New/edited `pl/` strings that address or describe a person must follow the
  gender-neutral rules in [`docs/localization.md`](../localization.md). There is
  no automated check for this — it is a review concern.
- The `gender` field remains display-only (the icon + tooltip on the profile
  info card); it is deliberately not consumed by i18n.

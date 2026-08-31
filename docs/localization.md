# Localization (i18n)

The app supports **English (en)** and **Polish (pl)**. Every user-visible string **must** be localized — no hardcoded UI text is allowed.

## Setup

- Library: `react-i18next` + `i18next`. Initialized in `src/lib/i18n.ts` (`defaultNS: "common"`).
- 9 namespaces: `common`, `auth`, `validation`, `admin`, `games`, `collections`, `users`, `notifications`, `ranking`.
- Translation files: `src/locales/{en,pl}/<namespace>.json`. Both files must be kept in sync (same keys).
- TypeScript enforces key existence at build time via `src/locales/i18next.d.ts`. Wrong keys → TS error.
- Verify after changes: `pnpm build` + `npx vitest run tests/locales/` (14 locale parity tests).

## In React components

```tsx
const { t } = useTranslation("namespace");
<Text>{t("section.key")}</Text>;
```

## In utility/module-level code (outside React)

```ts
import i18n from "@/lib/i18n";
i18n.t("section.key"); // uses defaultNS "common"
i18n.t("section.key", { ns: "other" });
```

## Pluralization

- EN: `key_one`, `key_other` suffixes.
- PL: `key_one`, `key_few` (2–4, 22–24…), `key_many` (5+, 11–14…), `key_other`. Always add all four.
- Call: `t("key", { count: n })` — i18next picks the correct suffix automatically.

## Word-order differences (username in titles)

When EN and PL have different word order (e.g. `"John's List"` vs `"Lista Jana"`), use the `Trans` component:

- JSON key uses `<0>{{username}}</0>` as the colored-span marker.
- Add a separate plain-string key (no markers) for `<PageMeta title="..." />`.

```tsx
import { Trans } from "react-i18next";
<Trans
  i18nKey="section.titleKey"
  ns="namespace"
  values={{ username }}
  components={[<span style={{ color: "var(--mantine-color-primary-6)" }} key="u" />]}
/>;
```

## Gender-neutral Polish

Polish copy that speaks **to** or **about** a person must not assume a gender. We do
**not** branch on the user's `gender` field for copy — see
[ADR 0005](adr/0005-gender-neutral-polish-copy.md). Masculine is **not** the default.

Rules for `pl/` strings:

- Address the reader with **present/future 2nd person** (`grasz`, `udostępnisz`,
  `zaloguj się`) — these carry no gender. Avoid past tense (`grałeś`/`grałaś`),
  `powinienem`, `sam`.
- Prefer **impersonal/nominal** forms for prose and labels: `należy się zachowywać`
  (not `powinieneś`), `Data dołączenia:` (not `Dołączył:`), `Ta czynność wymaga
zalogowania` (not `musisz być zalogowany`).
- Drop gendered adjectives/participles (`gotowy`, `zalogowany`, `zbanowany`). Reword
  around a neuter noun (`Konto zbanowane`) or rephrase (`Czas na odkrywanie?`).
- This applies to strings about a **target/viewed user** too — their gender is
  equally unknown.

## Checklist for new components / pages

1. No raw string literals in JSX or returned UI values.
2. Add the key to **both** `en` and `pl` JSON files before using it.
3. For PL plural keys, include `_one`, `_few`, `_many`, `_other`.
4. PL strings addressing/describing a person: gender-neutral (see above).
5. Run `pnpm build` to confirm no TS key errors.

import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * AGENTS.md: every user-visible string must be localized. This scans the app's JSX for the two ways a
 * literal English string typically sneaks in — text between tags, and literal `alt`/`aria-label`/
 * `placeholder`/`title`/`label` props — so a missing `t(...)` fails here rather than showing up in Polish.
 */
const CHECKED_ATTRIBUTES = new Set(["alt", "aria-label", "placeholder", "title", "label", "description"]);

// Every component file as source text. The generated client and tests are not UI.
const SOURCES = import.meta.glob(["/src/**/*.tsx", "!/src/client/**", "!/src/**/*.test.tsx"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Literals that are not translatable prose: brand names, the "versus" label and keyboard key names.
const ALLOWED = new Set<string>(["IGDB", "Sojusan", "GameList", "VS", "Enter", "Enter / 3"]);

/** Text that contains at least one letter reads as a sentence or label; punctuation-only text does not. */
function isProse(text: string): boolean {
  // HTML entities such as &middot; are separators, not words.
  return /\p{L}{2,}/u.test(text.replaceAll(/&\w+;/g, " "));
}

function findLiterals([file, code]: [string, string]): string[] {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const report = (node: ts.Node, text: string) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    const entry = `${file}:${line + 1} "${text.trim()}"`;
    if (!ALLOWED.has(entry) && !ALLOWED.has(text.trim())) found.push(entry);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && isProse(node.text)) {
      report(node, node.text.replaceAll(/\s+/g, " "));
    } else if (
      ts.isJsxAttribute(node) &&
      CHECKED_ATTRIBUTES.has(node.name.getText()) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      isProse(node.initializer.text)
    ) {
      report(node, node.initializer.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe("hard-coded UI strings", () => {
  it("has no untranslated JSX text or accessibility-label literals", () => {
    const violations = Object.entries(SOURCES).flatMap(entry => findLiterals(entry));
    expect(violations).toEqual([]);
  });
});

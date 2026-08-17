import { describe, expect, it } from "vitest";

import { checkKeyParity } from "@/locales/checkKeyParity";

describe("checkKeyParity", () => {
  it("returns empty array when all EN keys exist in PL", () => {
    const en = { greeting: "Hello", farewell: "Goodbye" };
    const pl = { greeting: "Cześć", farewell: "Do widzenia" };

    expect(checkKeyParity(en, pl)).toEqual([]);
  });

  it("returns the missing key when PL omits one EN key", () => {
    const en = { greeting: "Hello", farewell: "Goodbye" };
    const pl = { greeting: "Cześć" };

    expect(checkKeyParity(en, pl)).toEqual(["farewell"]);
  });

  it("checks nested keys recursively and reports dot-separated paths", () => {
    const en = { nav: { login: "Login", logout: "Logout" } };
    const pl = { nav: { login: "Zaloguj" } };

    expect(checkKeyParity(en, pl)).toEqual(["nav.logout"]);
  });

  it("does not flag Polish-only plural suffixes (_few, _many) present in PL but absent in EN", () => {
    const en = { match_one: "match", match_other: "matches" };
    const pl = {
      match_one: "mecz",
      match_few: "mecze",
      match_many: "meczów",
      match_other: "mecze",
    };

    expect(checkKeyParity(en, pl)).toEqual([]);
  });

  it("reports EN plural keys missing from PL", () => {
    const en = { duel_one: "duel", duel_other: "duels" };
    const pl = { duel_one: "pojedynek" };

    expect(checkKeyParity(en, pl)).toEqual(["duel_other"]);
  });
});

import { describe, expect, it } from "vitest";

import { isSharedCollection } from "@/features/collections/utils/sharedCollection";

const ownedBy = (id: number) => ({ user: { id } }) as Parameters<typeof isSharedCollection>[0];

describe("isSharedCollection", () => {
  it("is false for a collection the viewer owns", () => {
    expect(isSharedCollection(ownedBy(5), 5)).toBe(false);
  });

  it("is true for a collection owned by someone else", () => {
    expect(isSharedCollection(ownedBy(9), 5)).toBe(true);
  });

  it("is false when there is no signed-in viewer", () => {
    expect(isSharedCollection(ownedBy(9), null)).toBe(false);
  });
});

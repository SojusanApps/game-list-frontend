import { beforeEach, describe, expect, it, vi } from "vitest";

import { ModeEnum, TypeEnum, VisibilityEnum } from "@/client";
import { setCollectionFavorite } from "@/features/collections/api/collection";
import { buildCollectionPayload } from "@/features/collections/utils/collectionPayload";

const { favoriteCreate, favoriteDestroy } = vi.hoisted(() => ({
  favoriteCreate: vi.fn<() => Promise<unknown>>(),
  favoriteDestroy: vi.fn<() => Promise<unknown>>(),
}));

vi.mock("@/client", async importOriginal => ({
  ...(await importOriginal<typeof import("@/client")>()),
  CollectionService: {
    collectionCollectionsFavoriteCreate: favoriteCreate,
    collectionCollectionsFavoriteDestroy: favoriteDestroy,
  },
}));

const noContent = () => ({ error: undefined, response: new Response(null, { status: 204 }) });

describe("setCollectionFavorite", () => {
  beforeEach(() => {
    favoriteCreate.mockReset().mockResolvedValue(noContent());
    favoriteDestroy.mockReset().mockResolvedValue(noContent());
  });

  it("favorites via POST when favorite is true", async () => {
    await setCollectionFavorite(7, true);

    expect(favoriteCreate).toHaveBeenCalledWith({ path: { id: 7 } });
    expect(favoriteDestroy).not.toHaveBeenCalled();
  });

  it("unfavorites via DELETE when favorite is false", async () => {
    await setCollectionFavorite(7, false);

    expect(favoriteDestroy).toHaveBeenCalledWith({ path: { id: 7 } });
    expect(favoriteCreate).not.toHaveBeenCalled();
  });

  it("throws when the collection is not visible to the user (404)", async () => {
    favoriteCreate.mockResolvedValue({
      error: { detail: "Not found." },
      response: new Response(null, { status: 404 }),
    });

    await expect(setCollectionFavorite(7, true)).rejects.toThrow("Not found.");
  });
});

describe("buildCollectionPayload", () => {
  const values = {
    name: "Best RPGs",
    description: "Favorites of mine",
    visibility: VisibilityEnum.PUB,
    mode: ModeEnum.C,
    type: TypeEnum.NOR,
    collaborators: ["3", "5"],
  };

  it("never carries is_favorite, even if a stale draft still has it", () => {
    const payload = buildCollectionPayload({ ...values, is_favorite: true } as typeof values);

    expect(payload).not.toHaveProperty("is_favorite");
  });

  it("converts collaborator ids to numbers and drops form-only state", () => {
    const payload = buildCollectionPayload({ ...values, collaboratorObjects: [{}] } as typeof values);

    expect(payload.collaborators).toEqual([3, 5]);
    expect(payload).not.toHaveProperty("collaboratorObjects");
  });
});

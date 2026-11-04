import { describe, expect, it } from "vitest";

import { getYouTubeEmbedURL, getYouTubeThumbnailURL } from "@/features/games/utils/youtube";

describe("youtube helpers", () => {
  it("builds the ytimg thumbnail URL", () => {
    expect(getYouTubeThumbnailURL("dQw4w9WgXcQ")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("builds a nocookie autoplay embed URL", () => {
    expect(getYouTubeEmbedURL("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    );
  });

  it("encodes unsafe ids", () => {
    expect(getYouTubeEmbedURL("a/b?c")).toContain("/embed/a%2Fb%3Fc?");
  });
});

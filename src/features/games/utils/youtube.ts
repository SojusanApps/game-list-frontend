/** Thumbnail for a YouTube video (480×360, always available; letterbox bars are cropped by the caller). */
export function getYouTubeThumbnailURL(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

/** Privacy-friendly embed URL that starts playing as soon as the player loads. */
export function getYouTubeEmbedURL(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
}

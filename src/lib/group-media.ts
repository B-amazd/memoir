interface MediaItem {
  id: string
  url: string
  mediaType: string
}

export function groupMedia(media: MediaItem[], groupSize = 3): MediaItem[][] {
  const groups: MediaItem[][] = []
  for (let i = 0; i < media.length; i += groupSize) {
    groups.push(media.slice(i, i + groupSize))
  }
  return groups
}
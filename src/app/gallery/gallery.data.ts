export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  alt?: string;             // for images
  thumbUrl: string;         // small thumb (webp/avif recommended)
  srcUrl: string;           // full image OR video mp4
  posterUrl?: string;       // for videos (recommended)
  width?: number;           // optional for better CLS
  height?: number;          // optional for better CLS
}

export const GALLERY_ITEMS: MediaItem[] = [
  {
    id: 'img-1',
    type: 'image',
    title: 'Sunset Cruise',
    alt: 'Sunset yacht cruise in Goa',
    thumbUrl: 'assets/gallery/thumbs/sunset.webp',
    srcUrl: 'assets/gallery/full/sunset.webp',
    width: 1600,
    height: 900,
  },
  {
    id: 'vid-1',
    type: 'video',
    title: 'Yacht Walkthrough',
    thumbUrl: 'assets/gallery/thumbs/walkthrough.webp',
    srcUrl: 'assets/gallery/videos/walkthrough.mp4',
    posterUrl: 'assets/gallery/posters/walkthrough.webp',
  },
];

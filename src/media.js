import media from './content/optimized-media.json'

export function imageSource(src, width = 960) {
  const image = media.images[src]
  return image?.sources.find(source => source.width >= width)?.src || image?.src || src
}

export function imageAttributes(src) {
  const image = media.images[src]
  return image ? {
    src: image.src,
    srcSet: image.sources.map(source => `${source.src} ${source.width}w`).join(', '),
    width: image.width,
    height: image.height,
  } : { src }
}

export function videoSource(src) {
  const video = media.videos[src]
  return (window.matchMedia('(max-width: 760px)').matches && video?.mobile) || video?.src || src
}

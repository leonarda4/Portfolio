import { imageAttributes } from '../media'

export default function ResponsiveImage({ src, sizes = '(max-width: 760px) calc(100vw - 48px), 680px', ...props }) {
  return <img {...imageAttributes(src)} sizes={sizes} decoding="async" {...props} />
}

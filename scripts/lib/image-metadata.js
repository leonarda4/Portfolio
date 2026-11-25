import { readFile } from 'node:fs/promises'

// Read dimensions from the file itself so social metadata follows asset updates.
// Social cards use PNG or JPEG; SVG artwork uses the site's raster fallback.
export async function imageMetadata(path) {
  const data = await readFile(path)
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { type: 'image/png', width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
  }
  if (data.readUInt16BE(0) === 0xffd8) {
    let offset = 2
    while (offset + 4 < data.length) {
      if (data[offset++] !== 0xff) break
      while (data[offset] === 0xff) offset++
      const marker = data[offset++]
      if (marker === 0xda || marker === 0xd9) break
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
      const length = data.readUInt16BE(offset)
      if (length < 2 || offset + length > data.length) break
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { type: 'image/jpeg', height: data.readUInt16BE(offset + 3), width: data.readUInt16BE(offset + 5) }
      }
      offset += length
    }
  }
  throw new Error(`Cannot read PNG/JPEG dimensions: ${path}`)
}

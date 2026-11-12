import { melodramaPath } from './playful/brush'
import { SUPPORTING_PALETTE } from '../../design-system/playful-palette'

// Match the reference with the same filled, irregular brush as visitor drawings.
// Coordinates are anchored to the Resume label at its desktop 48px type size.
const marks = [
  [[1173, 585], [1193, 588], [1222, 596], [1250, 606], [1288, 620]],
  [[1267, 579], [1269, 597], [1284, 616], [1288, 620], [1283, 623], [1264, 628], [1244, 644]],
  [[1354, 480], [1357, 505], [1366, 533], [1376, 555], [1386, 575]],
  [[1340, 542], [1361, 556], [1381, 571], [1386, 575], [1389, 570], [1398, 555], [1409, 536]],
  [[1525, 463], [1517, 483], [1511, 509], [1506, 534], [1503, 557]],
  [[1478, 519], [1487, 538], [1498, 552], [1503, 557], [1509, 553], [1520, 543], [1543, 535]],
  [[1290, 792], [1384, 782], [1492, 774], [1600, 762], [1720, 748], [1812, 738], [1860, 738], [1872, 739], [1871, 741], [1860, 742], [1771, 751], [1664, 770], [1554, 790], [1442, 813], [1340, 829], [1287, 835], [1280, 837], [1282, 838], [1294, 838], [1373, 834], [1484, 831], [1584, 824], [1673, 820]],
].map((points, index) => melodramaPath(points.map(([x, y]) => ({ x: (x - 1340) / 1.875, y: (y - 640) / 1.875, pressure: .5 })), index * .73 + .4))

export default function ResumeScribbles() {
  return <svg className="resume-scribbles" viewBox="-105 -115 400 230" fill={SUPPORTING_PALETTE.find(color => color.name === 'Lilac').crayon} aria-hidden="true" focusable="false">
    {marks.map((path, index) => <path key={index} d={path} />)}
  </svg>
}

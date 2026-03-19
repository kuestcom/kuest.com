import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import DottedMap from 'dotted-map'

const outputPath = join(process.cwd(), 'public', 'assets', 'images', 'world-map-dotted.svg')

const map = new DottedMap({
  height: 72,
  grid: 'diagonal',
  projection: { name: 'equalEarth' },
})

const svg = map.getSVG({
  shape: 'circle',
  color: '#0e1117',
  radius: 0.23,
})

await writeFile(outputPath, `${svg}\n`, 'utf8')

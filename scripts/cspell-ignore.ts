import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const word = process.argv[2]
if (!word) {
  console.error('Please provide a word to ignore.')
  process.exit(1)
}

const configPath = resolve(__dirname, '../cspell.config.json')
if (!fs.existsSync(configPath)) {
  console.error('cspell.config.json not found!')
  process.exit(1)
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

config.words = config.words || []
if (!config.words.includes(word)) {
  config.words.push(word)
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`Added "${word}" to cspell words.`)
} else {
  console.log(`"${word}" is already in cspell words.`)
}

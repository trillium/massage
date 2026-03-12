#!/usr/bin/env tsx

/**
 * Render a Handlebars proposal template from YAML data.
 *
 * Input:  proposals/coderabbit-miami-2026/proposal.yml
 *         proposals/coderabbit-miami-2026/template.hbs
 * Output: proposals/coderabbit-miami-2026/output/proposal.html
 *
 * Image handling:
 *   Any flat string-map under `logos` or `photos` in the YAML is resolved
 *   relative to the proposal directory, read from disk, and injected as a
 *   base64 data URI into `logos_b64.*` / `photos_b64.*` respectively.
 *   The template then renders <img src="{{photos_b64.cover}}"> etc. without
 *   any external file references in the output HTML.
 *   Missing files are silently skipped (the key is left undefined).
 *
 * Usage: pnpm run render:proposal
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'
import Handlebars from 'handlebars'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const PROPOSAL_DIR = path.join(root, 'proposals', 'coderabbit-miami-2026')
const YAML_PATH = path.join(PROPOSAL_DIR, 'proposal.yml')
const TEMPLATE_PATH = path.join(PROPOSAL_DIR, 'template.hbs')
const OUTPUT_DIR = path.join(PROPOSAL_DIR, 'output')
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'proposal.html')

function mimeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.svg':
      return 'image/svg+xml'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    default:
      return 'image/png'
  }
}

function toDataUri(filePath: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined
  const buf = fs.readFileSync(filePath)
  const mime = mimeForExt(path.extname(filePath))
  return `data:${mime};base64,${buf.toString('base64')}`
}

function inlineImageMap(
  map: Record<string, string> | undefined,
  label: string
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  if (!map) return out
  for (const [key, relPath] of Object.entries(map)) {
    const absPath = path.resolve(PROPOSAL_DIR, relPath)
    const uri = toDataUri(absPath)
    if (uri) {
      out[key] = uri
      console.log(`  ${label} [${key}] → inlined (${Math.round(uri.length / 1024)}kb)`)
    } else {
      console.warn(`  ${label} [${key}] → file not found at ${absPath}, skipping`)
    }
  }
  return out
}

function main() {
  console.log('Reading YAML data...')
  const rawYaml = fs.readFileSync(YAML_PATH, 'utf8')
  const data = yaml.load(rawYaml) as Record<string, unknown>

  data.logos_b64 = inlineImageMap(data.logos as Record<string, string> | undefined, 'Logo')
  data.photos_b64 = inlineImageMap(data.photos as Record<string, string> | undefined, 'Photo')

  console.log('Reading Handlebars template...')
  const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8')
  const template = Handlebars.compile(rawTemplate)

  console.log('Rendering...')
  const html = template(data)

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_PATH, html, 'utf8')
  console.log(`Done → ${path.relative(root, OUTPUT_PATH)}`)
}

main()

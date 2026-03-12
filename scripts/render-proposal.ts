#!/usr/bin/env tsx

/**
 * Render a Handlebars proposal template from YAML data.
 *
 * Input:  proposals/coderabbit-miami-2026/proposal.yml
 *         proposals/coderabbit-miami-2026/template.hbs
 * Output: proposals/coderabbit-miami-2026/output/proposal.html
 *
 * Logo handling:
 *   If `logos.trillium` and/or `logos.coderabbit` are set in the YAML,
 *   the script resolves those paths relative to the proposal directory,
 *   reads the files, and injects base64 data URIs into `logos_b64.*` so
 *   the template can render <img src="{{logos_b64.trillium}}"> without
 *   depending on external file references in the output HTML.
 *   Missing logo files are silently skipped (the key is left undefined).
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

function main() {
  console.log('Reading YAML data...')
  const rawYaml = fs.readFileSync(YAML_PATH, 'utf8')
  const data = yaml.load(rawYaml) as Record<string, unknown>

  // Resolve logo paths → base64 data URIs
  const logos = data.logos as Record<string, string> | undefined
  if (logos) {
    const logos_b64: Record<string, string | undefined> = {}
    for (const [key, relPath] of Object.entries(logos)) {
      const absPath = path.resolve(PROPOSAL_DIR, relPath)
      const uri = toDataUri(absPath)
      if (uri) {
        logos_b64[key] = uri
        console.log(`  Logo [${key}] → inlined (${Math.round(uri.length / 1024)}kb)`)
      } else {
        console.warn(`  Logo [${key}] → file not found at ${absPath}, skipping`)
      }
    }
    data.logos_b64 = logos_b64
  }

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

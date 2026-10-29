import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export const OPT_OUT_LABEL = 'no-screenshots-needed'

const UI_FILE_RULES = [
  { name: 'page/component', test: (f) => /^(app|components|features|layouts)\/.+\.tsx$/.test(f) },
  { name: 'stylesheet', test: (f) => /\.(css|scss)$/.test(f) },
  { name: 'public asset', test: (f) => /^public\//.test(f) },
  { name: 'printable/handout', test: (f) => /^print\//.test(f) && !/\.md$/.test(f) },
]

const NON_UI_FILE = /(\.(test|spec)\.[jt]sx?$|(^|\/)__tests__\/|(^|\/)app\/api\/)/

const IMAGE_PATTERNS = [
  /!\[[^\]]*\]\([^)\s]+[^)]*\)/,
  /<img\b[^>]*\bsrc\s*=/i,
  /https:\/\/github\.com\/user-attachments\/(assets|files)\/[^\s)"']+/,
  /https:\/\/user-images\.githubusercontent\.com\/[^\s)"']+/,
]

export function findUiFiles(changedFiles) {
  return changedFiles.filter(
    (file) => !NON_UI_FILE.test(file) && UI_FILE_RULES.some((rule) => rule.test(file))
  )
}

export function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '')
}

export function hasImage(body) {
  const visibleBody = stripHtmlComments(body ?? '')
  return IMAGE_PATTERNS.some((pattern) => pattern.test(visibleBody))
}

export function evaluate({ changedFiles, body, labels }) {
  const uiFiles = findUiFiles(changedFiles)
  if (labels.includes(OPT_OUT_LABEL)) {
    return {
      ok: true,
      message: `Opt-out label "${OPT_OUT_LABEL}" present: screenshots not required.`,
    }
  }
  if (uiFiles.length === 0) {
    return { ok: true, message: 'No visible UI files changed: screenshots not required.' }
  }
  if (hasImage(body)) {
    return {
      ok: true,
      message: `Screenshot found in PR description for ${uiFiles.length} UI file(s).`,
    }
  }
  const list = uiFiles.map((file) => `  - ${file}`).join('\n')
  return {
    ok: false,
    message: [
      'This PR changes visible UI but the description has no image.',
      'Edit the PR description and add before/after screenshots (drag-drop an image, ![alt](url), or <img>).',
      `If screenshots genuinely do not apply, add the "${OPT_OUT_LABEL}" label.`,
      'Files that need screenshots:',
      list,
    ].join('\n'),
  }
}

function gh(args) {
  return execFileSync('gh', ['api', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function loadPullRequest(repo, number) {
  const pr = JSON.parse(gh([`repos/${repo}/pulls/${number}`]))
  const files = JSON.parse(
    gh([`repos/${repo}/pulls/${number}/files`, '--paginate', '--slurp'])
  ).flat()
  return {
    body: pr.body ?? '',
    labels: pr.labels.map((label) => label.name),
    changedFiles: files.flatMap((file) => [file.filename, file.previous_filename].filter(Boolean)),
  }
}

function main() {
  const { GITHUB_REPOSITORY: repo, PR_NUMBER: number } = process.env
  if (!repo || !number) throw new Error('GITHUB_REPOSITORY and PR_NUMBER are required')
  const result = evaluate(loadPullRequest(repo, number))
  console.log(result.message)
  process.exit(result.ok ? 0 : 1)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()

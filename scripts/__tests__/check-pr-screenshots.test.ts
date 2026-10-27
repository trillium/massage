import { evaluate, findUiFiles, hasImage, OPT_OUT_LABEL } from '../check-pr-screenshots.mjs'

const uiChange = ['app/pricing/page.tsx']

describe('findUiFiles', () => {
  it('flags pages, components, styles, public assets and print files', () => {
    const files = [
      'app/pricing/page.tsx',
      'components/Header.tsx',
      'features/booking/Form.tsx',
      'css/tailwind.css',
      'public/static/logo.png',
      'print/qr/handout.png',
    ]
    expect(findUiFiles(files)).toEqual(files)
  })

  it('ignores api routes, tests, libs, docs and print markdown', () => {
    const files = [
      'app/api/book/route.ts',
      'components/__tests__/Header.test.tsx',
      'features/booking/Form.spec.tsx',
      'lib/dates.ts',
      'README.md',
      'print/README.md',
      '.github/workflows/ci.yml',
    ]
    expect(findUiFiles(files)).toEqual([])
  })
})

describe('hasImage', () => {
  it.each([
    ['markdown image', '![before](https://example.com/a.png)'],
    ['img tag', '<img width="300" src="https://example.com/a.png" />'],
    ['user-attachments url', 'see https://github.com/user-attachments/assets/1234-abcd'],
  ])('accepts %s', (_name, body) => {
    expect(hasImage(body)).toBe(true)
  })

  it.each([
    ['empty body', ''],
    ['null body', null],
    ['plain link', '[shot](https://example.com/a.png)'],
    ['image only inside html comment', '<!-- ![x](https://example.com/a.png) -->'],
    ['template placeholder text', '## Screenshots\n\nBefore / after here'],
  ])('rejects %s', (_name, body) => {
    expect(hasImage(body)).toBe(false)
  })
})

describe('evaluate', () => {
  it('passes when no UI files changed', () => {
    const result = evaluate({ changedFiles: ['lib/dates.ts'], body: '', labels: [] })
    expect(result.ok).toBe(true)
  })

  it('fails and lists the files when UI changed without an image', () => {
    const result = evaluate({ changedFiles: uiChange, body: 'no pics', labels: [] })
    expect(result.ok).toBe(false)
    expect(result.message).toContain('app/pricing/page.tsx')
  })

  it('passes when UI changed and the body has an image', () => {
    const result = evaluate({
      changedFiles: uiChange,
      body: '![a](https://x.io/a.png)',
      labels: [],
    })
    expect(result.ok).toBe(true)
  })

  it('passes with the opt-out label and says so', () => {
    const result = evaluate({ changedFiles: uiChange, body: '', labels: [OPT_OUT_LABEL] })
    expect(result.ok).toBe(true)
    expect(result.message).toContain(OPT_OUT_LABEL)
  })
})

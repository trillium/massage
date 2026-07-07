import fs from 'node:fs'
import path from 'node:path'

const dir = path.dirname(new URL(import.meta.url).pathname)
const evergreen = process.argv.includes('--evergreen')
const out = path.join(dir, 'output', evergreen ? 'instagram-evergreen' : 'instagram-fifafan50')

const content = JSON.parse(fs.readFileSync(path.join(dir, 'content', 'captions.json'), 'utf8'))
const HOOKS: Record<string, string> = content.hooks
const OFFER_CAPTIONS: Record<string, string[]> = content.offers[evergreen ? 'evergreen' : 'promo']

const CTA_PROMO = [
  'Comment SOCCER and I’ll DM you the booking link + how to apply the code.\n\n50% off (up to $100) with code FIFAFAN50 at Airbnb checkout · Book by July 21',
  'Want the link? Comment SOCCER — it lands in your DMs with the 3-step code instructions.\n\nCode FIFAFAN50 at Airbnb checkout · 50% off up to $100 · through July 21',
  'Link is in my bio, or comment SOCCER and I’ll send it straight to you.\n\nFIFAFAN50 at Airbnb checkout = 50% off (up to $100) · ends July 21',
  'Comment SOCCER for the direct booking link.\n\nEnter FIFAFAN50 at Airbnb checkout — verify the discount before you finalize · Book by July 21',
]

const TAGS_PROMO = [
  '#LAmassage #InHomeMassage #MobileMassage #LosAngeles #SummerOfSoccer #MatchDay #Recovery #SelfCare',
  '#MassageTherapy #LosAngelesMassage #MobileMassage #SoccerSummer #PostMatchRecovery #TreatYourself #LA',
  '#InHomeMassage #LAWellness #SportsMassage #DeepTissue #SummerOfSoccer #RecoveryDay #LosAngeles',
]

const PHOTO_CAPTIONS_PROMO = [
  'Photo slots: pair with a short line about the moment (setup, hands, the room) + the same CTA block. Example: “The office today. Your living room tomorrow? Comment SOCCER for the link. FIFAFAN50 · 50% off up to $100 · by July 21”',
  'Not every photo needs the offer — 2 of every 3 photo posts can breathe (pure craft/behind-the-scenes) so the grid doesn’t read as 60 ads. Keep the code in bio + stories regardless.',
]

const CTA_EVERGREEN = [
  'Comment MASSAGE and I’ll DM you the booking link.\n\nIn-home massage, anywhere in LA · Table or chair · Book on Airbnb (link in bio)',
  'Link in bio, or comment MASSAGE and it lands in your DMs.\n\nI bring the table, linens, and music — you supply the living room.',
  'Want the link? Comment MASSAGE — I’ll send it straight to you.\n\nBook on Airbnb · Table or chair · Anywhere in LA',
  'Comment MASSAGE for the direct booking link.\n\nIn-home sessions across LA · Short notice OK · Book on Airbnb',
]

const TAGS_EVERGREEN = [
  '#LAmassage #InHomeMassage #MobileMassage #LosAngeles #Recovery #SelfCare #MassageTherapy',
  '#MassageTherapy #LosAngelesMassage #MobileMassage #TreatYourself #DeepTissue #LA #Wellness',
  '#InHomeMassage #LAWellness #SportsMassage #DeepTissue #RecoveryDay #LosAngeles #SelfCareSunday',
]

const PHOTO_CAPTIONS_EVERGREEN = [
  'Photo slots: pair with a short line about the moment (setup, hands, the room) + the same CTA block. Example: "The office today. Your living room tomorrow? Comment MASSAGE for the link."',
  'Not every photo needs a pitch — 2 of every 3 photo posts can breathe (pure craft/behind-the-scenes) so the grid doesn’t read as 60 ads. Keep the booking link in bio + stories regardless.',
]

const CTA = evergreen ? CTA_EVERGREEN : CTA_PROMO
const TAGS = evergreen ? TAGS_EVERGREEN : TAGS_PROMO
const PHOTO_CAPTIONS = evergreen ? PHOTO_CAPTIONS_EVERGREEN : PHOTO_CAPTIONS_PROMO

const order = fs.readFileSync(path.join(out, 'POSTING-ORDER.txt'), 'utf8').split('\n')
const lines: string[] = [
  evergreen
    ? '# Evergreen captions (no promo) — copy/paste per post'
    : '# FIFAFAN50 captions — copy/paste per post',
  '',
]
const offerUse: Record<string, number> = {}
let cta = 0
let missing = 0

for (const l of order) {
  const m = l.match(/^post (\d+): (.+)$/)
  if (!m) continue
  const [, post, file] = m
  lines.push(`## post ${post} — ${file}`)
  if (file === '[YOUR PHOTO]') {
    lines.push('(your photo — see PHOTO NOTES at bottom)', '')
    continue
  }
  const review = file.match(/(?:review|text)-(.+)\.png/)?.[1]
  const offer = file.match(/offer-(\d\d-[a-z]+)\.png/)?.[1]
  let body = ''
  if (review) body = HOOKS[review] ?? ''
  if (offer) {
    const use = offerUse[offer] ?? 0
    offerUse[offer] = use + 1
    body = OFFER_CAPTIONS[offer][use % 2]
  }
  if (!body) missing++
  lines.push(body || '(TODO: write hook)', '', CTA[cta % CTA.length], '', TAGS[cta % TAGS.length], '')
  cta++
}

lines.push('## PHOTO NOTES', ...PHOTO_CAPTIONS)
fs.writeFileSync(path.join(out, 'CAPTIONS.md'), lines.join('\n'))
console.log('CAPTIONS.md written,', cta, 'captions,', missing, 'missing hooks')

import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(path.dirname(new URL(import.meta.url).pathname), 'content')
const reviews = JSON.parse(fs.readFileSync(path.join(dir, 'reviews.json'), 'utf8'))
const outDir = path.join(dir, 'assets', 'avatars')
fs.mkdirSync(outDir, { recursive: true })

for (let i = 0; i < reviews.length; i++) {
  const r = reviews[i]
  if (!r.avatar) continue
  const res = await fetch(r.avatar.replace('profile_x_medium', 'profile_large'))
  if (!res.ok) { console.error(i, r.name, res.status); continue }
  const file = `${String(i).padStart(2, '0')}.jpg`
  fs.writeFileSync(path.join(outDir, file), Buffer.from(await res.arrayBuffer()))
  r.avatarFile = `assets/avatars/${file}`
}
fs.writeFileSync(path.join(dir, 'reviews.json'), JSON.stringify(reviews, null, 2))
console.log('done', reviews.filter((r: { avatarFile?: string }) => r.avatarFile).length)

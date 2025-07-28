import { writeFileSync, mkdirSync } from 'fs'
import ratings from '../data/ratings.js'
import nspell from 'nspell'
import dictionary from 'dictionary-en'
import { execSync } from 'child_process'
import cliProgress from 'cli-progress'

const filename = './data/ratings.js'

const quickDictionary = {
  10: '10',
  30: '30',
  54: '54',
  90: '90',
  madsage: 'massage',
  advices: 'advice',
  pre: 'pre',
  rebook: 'rebook',
  mins: 'mins',
  ive: "I've",
  aporoach: 'approach',
  masage: 'massage',
  massgae: 'massage',
  conncted: 'connected',
  al: 'all',
  "'5": "'5",
  "Star'": "Star'",
  everytime: 'every time',
  ot: 'of',
  didnt: "didn't",
  werent: "weren't",
  Wattana: 'Wattana',
  dobt: 'doubt',
  kbow: 'know',
  thst: 'that',
  hsd: 'had',
  Thsbk: 'Thank',
  Lol: 'Lol',
  Yeay: 'Yeay',
  trillium: 'Trillium',
  Trillium: 'Trillium',
}

const newDictionary = {}

function spellcheck(comment) {
  const spell = nspell(dictionary)
  spell.remove('trillium')
  spell.remove('Trillium')
  spell.remove('Trillion')
  spell.remove('trillion')
  const words = comment.split(' ')
  const correctedWords = words.map((word) =>
    spell.correct(word) ? word : spell.suggest(word)[0] || word
  )
  return correctedWords.join(' ')
}

function generateRatingsCopy() {
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  progressBar.start(ratings.length, 0)

  const ratingsCopy = ratings.map((item, index) => {
    progressBar.update(index + 1)
    // preserve punctuation
    let spellcheckedComment
    let spellchecked

    if (item.comment) {
      // split comment on any punctuation
      const punctuationRegex = /([.,!?;:@#$%^&*()\-=_+])/g
      // spellcheck each part
      const splitComment = item.comment.split(punctuationRegex)
      const spellcheckedParts = splitComment.map((part) => {
        if (punctuationRegex.test(part)) {
          return part
        } else {
          const checked = spellcheck(part)

          // break word into smaller parts
          // compare each word
          // if there is a conflict
          // add that word to quickDictionary
          const parts_original = part.split(' ')
          const parts_changed_ = checked.split(' ')

          for (let i = 0; i < parts_original.length; i++) {
            const oldWord = parts_original[i]
            let newWord = parts_changed_[i]
            if (oldWord !== newWord) {
              // if oldWord is a key of quickDictionary use that instead of the nspell changed word
              if (quickDictionary[oldWord]) {
                const corrected = quickDictionary[oldWord]
                parts_changed_[i] = corrected
              } else {
                newDictionary[parts_original[i]] = newWord
              }
            }
          }
          const newChecked = parts_changed_.join(' ')
          return newChecked
        }
      })
      // rejoin with the original punctuation as before
      spellcheckedComment = spellcheckedParts.join('')
      if (spellcheckedComment !== item.comment) {
        spellchecked = spellcheckedComment
      }
    }
    const { rating, date, comment, name, source, helpful } = item

    // trying to preserve item order in json doc
    const outItem = {}
    outItem.rating = rating
    outItem.date = date
    if (comment) {
      outItem.comment = comment
    }
    if (spellchecked) {
      outItem.spellcheck = spellchecked
    }
    outItem.name = name
    outItem.source = source
    if (helpful) {
      outItem.helpful = helpful
    }
    return outItem
  })

  progressBar.stop()

  // do not wrap key names in any quotationmarks
  const fileContent = `const ratings = ${JSON.stringify(ratingsCopy, null, 2)}
  
  export default ratings`

  writeFileSync(filename, fileContent)

  // Run ESLint on the file
  execSync(`pnpm eslint --fix ${filename}`, { stdio: 'inherit' })
}

generateRatingsCopy()

console.log('New unknown words seen', JSON.stringify(newDictionary, null, 2))

declare module 'nspell' {
  interface Nspell {
    correct(word: string): boolean
    suggest(word: string): string[]
    remove(word: string): void
  }
  export default function nspell(dictionary: { aff: Buffer; dic: Buffer }): Nspell
}

declare module 'dictionary-en' {
  const dictionary: { aff: Buffer; dic: Buffer }
  export default dictionary
}

declare module 'nspell' {
  interface Nspell {
    correct(word: string): boolean
    suggest(word: string): string[]
  }
  export default function nspell(aff: Buffer, dic: Buffer): Nspell
}

function createAnchorTag(url: string, text: string): string {
  return `<a href="${url}">${text}</a>`
}

export const parts = [
  'Trillium Smith',
  '818.738.5344',
  'Trillium Massage',
  createAnchorTag(
    'https://trilliummassage.la/?utm_source=email&utm_medium=signature&utm_campaign=personal_signature',
    'trilliummassage.la'
  ),
]

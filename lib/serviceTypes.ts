export type GroupType = 'table' | 'event'

export type ServiceType = {
  name: string
  id: string
  description: string
  duration: number[]
  image: string
  group: GroupType
  footerHrefText: string
  bookHref: string
  contactHref: string
  type?: string
}

export type ServiceTypePriced = ServiceType & { price: number[] }

export type LinkType = {
  text: string
  href: string
}

export type LinkTypeObject = {
  [key in GroupType]: LinkType[]
}

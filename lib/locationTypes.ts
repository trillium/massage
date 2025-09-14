export type LocationObject = {
  street: string
  city: string
  zip: string
}

export type LocationWarningType = {
  message: string
} & ({ city: string } | { zip: string })

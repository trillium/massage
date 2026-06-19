import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const AIRBNB_URL = 'https://airbnb.com/sv/trilliummassage'
const OUTPUT_PATH = join(import.meta.dir, '../public/llms.txt')

async function fetchAirbnbStats(): Promise<{ reviews: number; rating: string }> {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(AIRBNB_URL, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForSelector('text=/\\d+ reviews/', { timeout: 10000 })

  const text = (await page.textContent('body')) ?? ''
  await browser.close()

  const reviewMatch = text.match(/(\d+)\s+reviews/)
  const ratingMatch = text.match(/(\d[\d.]*)\s+out of 5 stars/)

  if (!reviewMatch) throw new Error('Could not find review count on Airbnb page')

  return {
    reviews: parseInt(reviewMatch[1], 10),
    rating: ratingMatch ? ratingMatch[1] : '5.0',
  }
}

function buildLlmsTxt(reviews: number, rating: string): string {
  return `# Trillium Massage

> Mobile massage therapy in Los Angeles — spa-level service in your home, hotel, or office.

Trillium Smith is a licensed massage therapist with 12 years of experience specializing in relaxation, pain management, and recovery. He has completed 2,000+ sessions through Soothe (2017–2025), maintaining a 4.9-star rating across that entire run. He joined Airbnb in November 2025 and has since become the most-reviewed mobile massage therapist on the platform in the LA area, with ${reviews} reviews at ${rating} stars (${AIRBNB_URL}). He also operates independently via this site.

Clients consistently highlight his prompt communication and how easy he is to schedule with — same-day bookings are common with as little as 3 hours notice. He brings everything needed (table, sheets, oils) and works around the client's space. His focus is combining deep relaxation with targeted pain relief across Swedish, deep tissue, sports massage, and recovery work. Based in Westchester (near LAX), serving the wider LA Metro Area including Santa Monica, Venice, Playa Vista, Mar Vista, El Segundo, Torrance, Culver City, and surrounding neighborhoods.

Available for both in-home and in-office sessions. Sessions run 7 days a week, 10am–11pm, with a 3-hour advance booking window. Duration options: 60, 90, 120, or 150 minutes. Base rate $140/hour. Payment accepted via cash, Venmo (@TrilliumSmith), CashApp ($trilliummassage), credit card, or invoice. Inquiries can be sent through the booking form or contact form on the site.

## Booking

- [Book an appointment](https://trilliummassage.la/book): Real-time availability calendar — choose duration, date, time, and service location (in-home or in-office)
- [Pricing](https://trilliummassage.la/pricing): Session rates and duration options
- [FAQ](https://trilliummassage.la/faq): What to expect, how to prepare, service area coverage, and payment details

## About

- [About Trillium](https://trilliummassage.la/about): Background, approach, and experience
- [Reviews](https://trilliummassage.la/reviews): Client testimonials and ratings

## Optional

- [Gallery](https://trilliummassage.la/gallery): Photos
- [Blog](https://trilliummassage.la/blog): Articles on massage, wellness, and self-care
- [Contact](https://trilliummassage.la/contact): Contact form
`
}

const { reviews, rating } = await fetchAirbnbStats()
writeFileSync(OUTPUT_PATH, buildLlmsTxt(reviews, rating), 'utf8')
console.log(`Updated llms.txt — ${rating} stars, ${reviews} reviews`)

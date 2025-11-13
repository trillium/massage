type ContentItem = {
  type: 'text' | 'image' | 'list' | 'link' | 'imageMosaic'
  content?: string
  src?: string
  alt?: string
  width?: number
  height?: number
  items?: string[]
  href?: string
  text?: string
  // DynamicGridMasonry specific properties
  images?: string[] // Array of image URLs
  layout?: 'vertical' | 'horizontal'
  largestColumn?: 'left' | 'right'
  containerHeight?: string
  gap?: string
}

export type FAQItem = {
  id: string
  q: string
  a: string | ContentItem[]
}

export const questions: FAQItem[] = [
  {
    id: 'what_to_expect',
    q: 'What should I expect during a tarot reading?',
    a: [
      {
        type: 'text',
        content:
          'A tarot reading is a personalized, intuitive experience where we explore your questions or areas of focus through the symbolism and wisdom of the tarot cards:',
      },
      {
        type: 'list',
        items: [
          'A welcoming, non-judgmental space for open discussion',
          'Insightful card interpretations tailored to your situation',
          'Guidance to help you gain clarity and perspective',
          'Time for questions and reflection throughout the session',
          'A compassionate approach that honors your unique journey',
        ],
      },
    ],
  },
  {
    id: 'booking_appointment',
    q: 'How do I book a reading through your website, phone, or email?',
    a: [
      {
        type: 'text',
        content: 'You can easily schedule a reading through several methods:',
      },
      {
        type: 'list',
        items: [
          'Online booking through my website',
          'Call me directly for assistance',
          'Send me an email',
          'Text message for quick scheduling',
        ],
      },
      {
        type: 'link',
        href: '/book',
        text: 'Click here to book online',
      },
    ],
  },
  {
    id: 'book_online',
    q: 'Do I have to book online?',
    a: "Nope! The calendar is here for your convenience, but you're welcome to reach out to me by phone or text to schedule if you prefer that.",
  },
  {
    id: 'types_of_readings',
    q: 'What types of tarot readings do you offer?',
    a: [
      {
        type: 'text',
        content: 'I offer various types of readings to suit your needs and questions:',
      },
      {
        type: 'list',
        items: [
          'General readings for overall life guidance',
          'Focused question readings for specific concerns',
          'Relationship readings exploring connections and dynamics',
          'Career and life path guidance',
          'Past-present-future explorations',
          'Custom spreads tailored to your unique situation',
        ],
      },
    ],
  },
  {
    id: 'prepare_session',
    q: 'How should I prepare for a tarot reading?',
    a: [
      {
        type: 'text',
        content: 'Here are some tips to help you get the most from your reading:',
      },
      {
        type: 'list',
        items: [
          'Find a quiet, comfortable space where you can focus',
          'Come with an open mind and clear intentions',
          'Prepare specific questions if you have them (but general readings are also welcome)',
          'Minimize distractions during your session',
          'Bring a notebook if you like to take notes',
        ],
      },
    ],
  },
  {
    id: 'session_duration',
    q: 'How long do tarot readings typically last?',
    a: [
      {
        type: 'text',
        content: 'Readings are available in different durations to meet your needs:',
      },
      {
        type: 'list',
        items: [
          '30 minutes - Perfect for a quick insight or single question',
          '60 minutes - Most popular, allows for comprehensive exploration of multiple areas',
          '90+ minutes - Deep dive into complex situations or multiple topics',
        ],
      },
    ],
  },
  {
    id: 'bring_anything',
    q: 'Do I need to bring anything to the reading?',
    a: "You don't need to bring anything! I provide all materials including the tarot deck, any reference materials, and a comfortable space. You're welcome to bring a notebook if you'd like to take notes.",
  },
  {
    id: 'service_areas',
    q: 'What areas do you service for readings?',
    a: "I serve the greater Los Angeles Area, based out of Westchester by LAX. Feel free to contact me if you're unsure.",
  },
  {
    id: 'pricing_and_payment',
    q: 'What are your pricing and payment options?',
    a: [
      {
        type: 'text',
        content: 'Pricing varies by session length and can be found on the booking page.',
      },
      {
        type: 'text',
        content: 'I accept multiple payment methods:',
      },
      {
        type: 'list',
        items: ['Cash', 'Credit cards', 'Online payments'],
      },
      {
        type: 'link',
        href: '/book',
        text: 'View current pricing',
      },
    ],
  },
  {
    id: 'cancellation_policy',
    q: 'What is your cancellation and rescheduling policy?',
    a: "Please do your best to provide at least 24 hours' notice for cancellations or rescheduling. A fee may apply for late cancellations, and I may require prepayment for future sessions if cancellations occur late.",
  },
  {
    id: 'spreads_used',
    q: 'What card spreads do you use in readings?',
    a: [
      {
        type: 'text',
        content: 'I use a variety of spreads depending on your questions and needs:',
      },
      {
        type: 'list',
        items: [
          'Celtic Cross - comprehensive exploration of a situation',
          'Three-Card Spread - past, present, future or situation, action, outcome',
          'Relationship Spread - exploring dynamics between people',
          'Decision-Making Spread - when facing choices',
          'Custom spreads designed specifically for your unique question',
        ],
      },
    ],
  },
  {
    id: 'specific_questions',
    q: 'Can I ask specific questions during the reading?',
    a: 'Absolutely! Specific questions often lead to the most insightful readings. You can prepare questions in advance or ask them as they arise during the session. Both focused question readings and more general open-ended explorations are welcome.',
  },
  {
    id: 'packages_and_gift_certificates',
    q: 'Do you offer reading packages or gift certificates?',
    a: 'Yes, I offer packages for multiple sessions at a discounted rate, and gift certificates are available for special occasions.',
  },
  {
    id: 'reading_approach',
    q: 'What is your approach to tarot reading?',
    a: 'My approach is intuitive, compassionate, and empowering. I believe tarot is a tool for self-reflection and gaining clarity, not fortune-telling. I create a safe, non-judgmental space where you can explore your questions and receive guidance that honors your free will and personal journey.',
  },
  {
    id: 'confidentiality',
    q: 'Is my reading confidential?',
    a: 'Yes, absolutely. Everything shared during your reading is completely confidential. I create a safe space where you can speak freely about your concerns and questions.',
  },
]

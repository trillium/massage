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
    id: 'space_needed',
    q: 'How much space is needed to set up your massage table or chair?',
    a: "I'll need roughly a 6-foot by 8-foot space for the table, and a 5-foot by 5-foot space for the chair. I've worked in smaller spaces before and can do so if that's all that is available.",
  },
  {
    id: 'booking_appointment',
    q: 'How do I book an appointment through your website, phone, or email?',
    a: [
      {
        type: 'text',
        content: 'You can easily schedule an appointment through several methods:',
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
    id: 'provide_equipment',
    q: 'Do I need to provide any equipment for the massage session?',
    a: [
      {
        type: 'text',
        content: 'No need! I bring everything required for your session:',
      },
      {
        type: 'list',
        items: [
          'Professional massage table or chair',
          'Fresh, clean sheets and linens',
          'High-quality massage oils and lotions',
          'Relaxing background music and speaker',
          'All necessary sanitation supplies',
        ],
      },
    ],
  },
  {
    id: 'service_areas',
    q: 'What areas do you service for in-home massages?',
    a: "I serve the greater Los Angeles Area, based out of Westchester by LAX. Feel free to contact me if you're unsure.",
  },
  {
    id: 'types_of_massage',
    q: 'What types of massage therapy do you offer in-home?',
    a: [
      {
        type: 'text',
        content:
          'I offer a variety of massage techniques, all customized to fit your specific needs:',
      },
      {
        type: 'list',
        items: [
          'Swedish massage for relaxation',
          'Deep tissue massage for muscle tension',
          'Sports massage for athletes and active individuals',
          'Stretching and mobility work',
          'Custom combination sessions',
        ],
      },
    ],
  },
  {
    id: 'prepare_session',
    q: 'What should I do to prepare for an in-home massage session?',
    a: [
      {
        type: 'text',
        content: 'Here are some tips to prepare for your session:',
      },
      {
        type: 'list',
        items: [
          'Ensure the room is at a comfortable temperature',
          'Minimize noise and distractions',
          'Clear the designated space for the massage table/chair',
          'Have water available to stay hydrated',
          'Feel free to play your preferred music, or I can provide my own',
        ],
      },
    ],
  },
  {
    id: 'session_duration',
    q: 'How long do the massage sessions typically last?',
    a: [
      {
        type: 'text',
        content: 'Sessions are available in different durations to meet your needs:',
      },
      {
        type: 'list',
        items: [
          '60 minutes - Perfect for targeting specific areas',
          '90 minutes - Most popular, allows full body relaxation',
          '120 minutes - Ultimate relaxation experience',
        ],
      },
      {
        type: 'text',
        content:
          'It often takes 30 to 45 minutes to fully relax during a massage, so I recommend booking at least a 90-minute session for the best experience.',
      },
    ],
  },
  {
    id: 'pricing_and_payment',
    q: 'What are your pricing and payment options?',
    a: [
      {
        type: 'text',
        content: 'Pricing varies by session length and type and can be found on the booking page.',
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
        type: 'text',
        content:
          'Tips are always appreciated, but my prices are set to fairly compensate me for the work provided.',
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
    id: 'health_conditions',
    q: 'Are there any health conditions that would prevent me from getting a massage?',
    a: "Certain conditions, like recent surgeries or severe skin issues, might require a doctor's approval. When in doubt, consult with your physician first.",
  },
  {
    id: 'what_to_wear',
    q: 'What should I wear during the massage?',
    a: 'Wear whatever makes you comfortable. Many clients choose to undress to their comfort level and are draped appropriately during the session.',
  },
  {
    id: 'packages_and_gift_certificates',
    q: 'Do you offer massage packages or gift certificates?',
    a: 'Yes, I offer packages for multiple sessions at a discounted rate, and gift certificates are available for special occasions.',
  },
  {
    id: 'health_concerns',
    q: 'What if I have specific health concerns or injuries?',
    a: 'Please inform me of any health concerns or injuries in advance. I can tailor the session to accommodate your needs safely.',
  },
  {
    id: 'hygiene_and_safety',
    q: 'What precautions do you take for hygiene and safety?',
    a: [
      {
        type: 'text',
        content: 'I adhere to strict sanitation practices to ensure your safety:',
      },
      {
        type: 'list',
        items: [
          'Thoroughly cleaning all equipment between sessions',
          'Using fresh, clean sheets for every client',
          'Following personal hygiene protocols',
          'Sanitizing hands and equipment regularly',
          'Maintaining professional health and safety standards',
        ],
      },
    ],
  },
]

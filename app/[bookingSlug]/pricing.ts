export type Pricing = {
  [key: number]: number;
};

export type Slugs = {
  [category: string]: {
    pricing: Pricing;
  };
};

const slugs = {
  app: {
    pricing: {
      60: 100,
      90: 150,
      120: 200,
      150: 250,
    },
  },
  get: {
    pricing: {
      60: 110,
      90: 110 * 1.5,
      120: 110 * 2,
      150: 110 * 2.5,
    },
  },
  spa: {
    pricing: {
      60: 120,
      90: 120 * 1.5,
      120: 120 * 2,
      150: 120 * 2.5,
    },
  },
  req: {
    pricing: {
      60: 130,
      90: 130 * 1.5,
      120: 130 * 2,
      150: 130 * 2.5,
    },
  },
  book: {
    pricing: {
      60: 140,
      90: 140 * 1.5,
      120: 140 * 2,
      150: 140 * 2.5,
    },
  },
}

export default slugs

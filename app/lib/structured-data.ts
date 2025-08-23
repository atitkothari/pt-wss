interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description: string;
}

interface WebPageData {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}

interface ProductData {
  name: string;
  description: string;
  url: string;
  image: string;
  brand: string;
  category: string;
  offers: {
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

interface LocalBusinessData {
  name: string;
  description: string;
  url: string;
  telephone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  sameAs: string[];
}

export function generateOrganizationSchema(data: OrganizationData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: [
      'https://twitter.com/wheelstrategy',
      'https://www.linkedin.com/company/wheelstrategy',
      'https://www.facebook.com/wheelstrategyoptions',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@wheelstrategyoptions.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    foundingDate: '2023',
    industry: 'Financial Services',
    knowsAbout: [
      'Options Trading',
      'Wheel Strategy',
      'Covered Calls',
      'Cash Secured Puts',
      'Options Screening',
      'Premium Income',
    ],
  };
}

export function generateWebPageSchema(data: WebPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url: data.url,
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'Wheel Strategy Options Screener',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Advanced options trading screener for the wheel strategy',
    },
  };
}

export function generateBreadcrumbSchema(paths: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: paths.map((path, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: path.name,
      item: path.url,
    })),
  };
}

export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function generateProductSchema(data: ProductData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image,
    brand: {
      '@type': 'Brand',
      name: data.brand,
    },
    category: data.category,
    offers: {
      '@type': 'Offer',
      price: data.offers.price,
      priceCurrency: data.offers.priceCurrency,
      availability: data.offers.availability,
      url: data.offers.url,
    },
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    featureList: [
      'Advanced Options Screening',
      'Real-time Data',
      'Custom Filters',
      'Trade Tracking',
      'Portfolio Management',
      'Risk Analysis',
    ],
  };
}

export function generateLocalBusinessSchema(data: LocalBusinessData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    description: data.description,
    url: data.url,
    telephone: data.telephone,
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      ...data.geo,
    },
    sameAs: data.sameAs,
    openingHours: 'Mo-Fr 09:00-17:00',
    priceRange: '$$',
    areaServed: 'Worldwide',
  };
}

export function generateHowToSchema(steps: { name: string; text: string; url?: string; image?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Use Wheel Strategy Options Screener',
    description: 'Step-by-step guide to using our options screener for maximum profits',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
      ...(step.image && { image: step.image }),
    })),
  };
} 
// Centralized pricing info for all plans and display values
export const pricingInfo = {
  regular: {
    monthly: {
      price: 19.99,
      priceStr: "$19.99",
      lineThrough: "$19.99",
      totalPrice: 19.99,
    },
    quarterly: {
      price: 11.99,
      priceStr: "$11.99",
      lineThrough: "$19.99",   
      totalPrice: 35.97,
    },
    yearly: {
      price: 16.50,
      priceStr: "$16.50",
      lineThrough: "$19.99",
      yearlyEquivalent: 198,
      yearlyEquivalentStr: "$198/year",
      lineThroughYear: "$240",
      totalPrice: 198,
    }
  },
  limitedTime: {
    monthly: {
      price: 14.99,
      priceStr: "$14.99",
      lineThrough: "$19.99",
      totalPrice: 14.99,
    },
    quarterly: {
      price: 11.99,
      priceStr: "$11.99",
      lineThrough: "$19.99",     
      totalPrice: 35.97,
    },
    yearly: {
      price: 8.33,
      priceStr: "$8.33",
      lineThrough: "$19.99",
      yearlyEquivalent: 99.99,
      yearlyEquivalentStr: "$99.99/year",
      lineThroughYear: "$240",
      totalPrice: 99.99,
    }
  },
  // Add more plans or tiers here if needed
}; 
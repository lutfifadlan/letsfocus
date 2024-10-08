export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    yearly: true,
    maxTasksPerMonth: 100,
  },
  'PRO-MONTHLY': {
    name: "Pro",
    price: 3,
    discountedPrice: 2,
    yearly: false,
    maxTasksPerMonth: -1,
    features: [
      "Search emails to unsubscribe by sender and content",
      "Advanced email analysis with charts and statistics",
      "Scheduled email fetching (coming soon)",
    ],
  },
  'PRO-YEARLY': {
    name: "Pro",
    price: 24,
    discountedPrice: 16,
    yearly: true,
    maxTasksPerMonth: -1,
    features: [
      "Search emails to unsubscribe by sender and content",
      "Advanced email analysis with charts and statistics",
      "Scheduled email fetching (coming soon)",
    ],
  },
};

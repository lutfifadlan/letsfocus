export type PaymentMethod = 'xendit' | 'lemonsqueezy';

export interface PaymentOption {
  name: string;
  currency: string;
  pricePerCredit: number;
  image: string;
}

export interface PendingPayment {
  credits: number;
  paymentMethod: PaymentMethod;
  totalPrice: number;
}

export const paymentOptions: Record<PaymentMethod, PaymentOption> = {
  xendit: {
    name: 'Xendit',
    currency: 'IDR',
    pricePerCredit: 15000,
    image: '/xendit.png',
  },
  lemonsqueezy: {
    name: 'Lemon Squeezy',
    currency: 'USD',
    pricePerCredit: 1,
    image: '/lemonsqueezy.png',
  },
};

export interface LemonSqueezyCheckoutPayload {
  data: {
    id: string; // Order ID
    type: string; // The type of resource, e.g., "orders"
    links: {
      self: string; // Link to the order in Lemon Squeezy
    };
    attributes: {
      tax: number; // Tax amount
      urls: {
        receipt: string; // Receipt URL
      };
      total: number; // Total amount in cents
      status: string; // Payment status, e.g., "paid"
      tax_usd: number; // Tax amount in USD
      currency: string; // Currency code, e.g., "USD"
      refunded: boolean; // Whether the order was refunded
      store_id: number; // Store ID
      subtotal: number; // Subtotal amount in cents
      tax_name: string; // Name of the tax
      tax_rate: number; // Tax rate as a percentage
      setup_fee: number; // Setup fee in cents
      test_mode: boolean; // Whether the transaction was in test mode
      total_usd: number; // Total amount in USD
      user_name: string; // Name of the customer
      created_at: string; // Timestamp of when the order was created
      identifier: string; // Unique order identifier
      updated_at: string; // Timestamp of when the order was last updated
      user_email: string; // Email address of the customer
      customer_id: number; // Customer ID
      refunded_at: string | null; // Timestamp when refunded, null if not refunded
      order_number: number; // Order number
      subtotal_usd: number; // Subtotal in USD
      currency_rate: string; // Conversion rate for the currency
      setup_fee_usd: number; // Setup fee in USD
      tax_formatted: string; // Formatted tax amount, e.g., "$0.00"
      tax_inclusive: boolean; // Whether the tax is inclusive
      discount_total: number; // Total discount applied in cents
      refunded_amount: number; // Total refunded amount in cents
      total_formatted: string; // Formatted total, e.g., "$1.00"
      first_order_item: {
        id: number; // ID of the order item
        price: number; // Price of the item in cents
        order_id: number; // Order ID
        price_id: number; // Price ID
        quantity: number; // Quantity of the item
        test_mode: boolean; // Whether the item is in test mode
        created_at: string; // Timestamp when the item was created
        product_id: number; // Product ID
        updated_at: string; // Timestamp when the item was last updated
        variant_id: number; // Variant ID
        product_name: string; // Name of the product
        variant_name: string; // Name of the variant
      };
      status_formatted: string; // Formatted status, e.g., "Paid"
      discount_total_usd: number; // Discount total in USD
      subtotal_formatted: string; // Formatted subtotal, e.g., "$1.00"
      refunded_amount_usd: number; // Refunded amount in USD
      setup_fee_formatted: string; // Formatted setup fee, e.g., "$0.00"
      discount_total_formatted: string; // Formatted discount total, e.g., "$0.00"
      refunded_amount_formatted: string; // Formatted refunded amount, e.g., "$0.00"
    };
    relationships: {
      store: {
        links: {
          self: string;
          related: string;
        };
      };
      customer: {
        links: {
          self: string;
          related: string;
        };
      };
      "order-items": {
        links: {
          self: string;
          related: string;
        };
      };
      "license-keys": {
        links: {
          self: string;
          related: string;
        };
      };
      subscriptions: {
        links: {
          self: string;
          related: string;
        };
      };
      "discount-redemptions": {
        links: {
          self: string;
          related: string;
        };
      };
    };
  };
  meta: {
    test_mode: boolean; // Whether the webhook is in test mode
    event_name: string; // Event name, e.g., "order_created"
    webhook_id: string; // Unique webhook ID
    custom_data: {
      credits: string; // Credits added from custom data
      user_id: string; // User ID from custom data
    };
  };
}


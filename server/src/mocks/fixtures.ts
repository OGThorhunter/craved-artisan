export type Vendor = {
  id: string;
  name: string;
  city: string;
  state: string;
  tagline?: string;
  verified?: boolean;
};

export type Product = {
  id: string;
  vendorId: string;
  title: string;
  price: number;
  imageUrl: string;
  tags: string[];
  availability: "in_stock" | "low" | "out";
};

export const vendors: Vendor[] = [
  { id: "seed-vendor-id", name: "Rose Creek Bakery", city: "Locust Grove", state: "GA", tagline: "Slow-fermented sourdough", verified: true },
  { id: "green-grove", name: "Green Grove Soaps", city: "McDonough", state: "GA" }
];

export const products: Product[] = [
  { id: "prod-sourdough-1", vendorId: "seed-vendor-id", title: "Country Sourdough Loaf", price: 8.5, imageUrl: "/img/bread1.jpg", tags: ["#bread","#sourdough"], availability: "in_stock" },
  { id: "prod-granola-1", vendorId: "seed-vendor-id", title: "Honey Almond Granola", price: 12, imageUrl: "/img/granola.jpg", tags: ["#granola","#breakfast"], availability: "low" },
  { id: "prod-soap-1", vendorId: "green-grove", title: "Lavender Goat Milk Soap", price: 7, imageUrl: "/img/soap.jpg", tags: ["#soap","#handmade"], availability: "in_stock" }
];

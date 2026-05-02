import { DealStatus, Marketplace } from "@prisma/client";

export const categoryOptions = ["sneakers", "electronics", "collectibles", "accessories"] as const;

export const marketplaceOptions = [
  { value: Marketplace.EBAY, label: "eBay" },
  { value: Marketplace.STOCKX, label: "StockX" },
  { value: Marketplace.GOAT, label: "GOAT" },
  { value: Marketplace.FACEBOOK_MARKETPLACE, label: "Facebook Marketplace" },
] as const;

export const dealStatusOptions = [
  { value: DealStatus.SAVED, label: "Saved" },
  { value: DealStatus.PURCHASED, label: "Purchased" },
  { value: DealStatus.LISTED, label: "Listed" },
  { value: DealStatus.SOLD, label: "Sold" },
] as const;

export const dashboardNavigation = [
  { href: "/app", label: "Overview" },
  { href: "/app/leads", label: "Lead Feed" },
  { href: "/app/calculator", label: "Calculator" },
  { href: "/app/deals", label: "Deals" },
  // TODO(W2-1-approval): add Listing Generator nav link here
  // Proposed entry: { href: "/app/listing-generator", label: "Listing Generator" }
  // Insert after Deals, before Settings, so it sits with the core workflow items.
  { href: "/app/settings", label: "Settings" },
  { href: "/app/alerts", label: "Alerts" },
];

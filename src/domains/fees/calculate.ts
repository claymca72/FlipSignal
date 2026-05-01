import { Marketplace } from "@prisma/client";

export type ProfitInput = {
  cost: number;
  tax: number;
  shippingCost: number;
  marketplace: Marketplace;
  expectedSalePrice: number;
};

type MarketplaceFeeProfile = {
  marketplace: Marketplace;
  label: string;
  description: string;
  baseFeePercent: number;
  paymentFeePercent: number;
  fixedFee: number;
  defaultShippingCost: number;
};

export const marketplaceFeeProfiles: MarketplaceFeeProfile[] = [
  {
    marketplace: Marketplace.EBAY,
    label: "eBay",
    description: "General marketplace fee with payment processing baked in.",
    baseFeePercent: 0.1325,
    paymentFeePercent: 0.0299,
    fixedFee: 0.3,
    defaultShippingCost: 12,
  },
  {
    marketplace: Marketplace.STOCKX,
    label: "StockX",
    description: "Resale marketplace fee plus payment processing.",
    baseFeePercent: 0.12,
    paymentFeePercent: 0.03,
    fixedFee: 0,
    defaultShippingCost: 14,
  },
  {
    marketplace: Marketplace.GOAT,
    label: "GOAT",
    description: "Consignment-style resale fee for footwear and streetwear.",
    baseFeePercent: 0.124,
    paymentFeePercent: 0.029,
    fixedFee: 0,
    defaultShippingCost: 15,
  },
  {
    marketplace: Marketplace.FACEBOOK_MARKETPLACE,
    label: "Facebook Marketplace",
    description: "Local and shipped checkout fee estimate.",
    baseFeePercent: 0.1,
    paymentFeePercent: 0,
    fixedFee: 0,
    defaultShippingCost: 8,
  },
];

export function getMarketplaceFeeProfile(marketplace: Marketplace) {
  return marketplaceFeeProfiles.find((profile) => profile.marketplace === marketplace) ?? marketplaceFeeProfiles[0];
}

export function calculateProfitBreakdown(input: ProfitInput) {
  const profile = getMarketplaceFeeProfile(input.marketplace);
  const fees =
    input.expectedSalePrice * profile.baseFeePercent +
    input.expectedSalePrice * profile.paymentFeePercent +
    profile.fixedFee;

  const totalCost = input.cost + input.tax + input.shippingCost;
  const netProfit = input.expectedSalePrice - fees - totalCost;
  const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const marginPercent = input.expectedSalePrice > 0 ? (netProfit / input.expectedSalePrice) * 100 : 0;

  const variableFeeRate = profile.baseFeePercent + profile.paymentFeePercent;
  const breakEvenPrice =
    variableFeeRate < 1 ? (totalCost + profile.fixedFee) / (1 - variableFeeRate) : input.expectedSalePrice;

  return {
    profile,
    fees: Number(fees.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    roiPercent: Number(roiPercent.toFixed(2)),
    marginPercent: Number(marginPercent.toFixed(2)),
    breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
  };
}

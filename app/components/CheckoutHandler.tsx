"use client";

import { useCheckoutConversion } from "@/app/hooks/useCheckoutConversion";

export function CheckoutHandler() {
  useCheckoutConversion();
  return null;
}

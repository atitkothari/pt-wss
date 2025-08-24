"use client";

import { useState, useEffect } from "react";
import { DiscoverSection } from "./DiscoverSection";
import { DiscoverSectionSkeleton } from "./DiscoverSectionSkeleton";

export function DiscoverSectionWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <DiscoverSectionSkeleton />;
  }

  return <DiscoverSection />;
}

"use client";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { useUserAccess } from "../hooks/useUserAccess";

export function ProAnnouncementBanner() {
  const { status, loading } = useUserAccess();

  if (loading) return null;
  if (status === "active") return null;

  return (
    <AnnouncementBanner
      id="fifty-percent-off-announcement-trial"
      message="🎉 Get 50% OFF first month! Get it for <s>$19.99</s> $9.99 (Code: 50OFF)"
      link={{
        text: "Upgrade to Pro",
        href: "/pricing",
      }}
      analyticsEventName="upgrade_to_pro_banner"
      className="bg-gradient-to-r from-blue-600 to-blue-500"
      countdownDate={new Date("2025-07-27")}
    />
  );
} 
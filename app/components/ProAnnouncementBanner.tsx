"use client";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { useUserAccess } from "../hooks/useUserAccess";
import { addDays } from "date-fns";

export function ProAnnouncementBanner() {
  const { status } = useUserAccess();

  // Only show banner to non-pro users
  if (status === "active") {
    return null;
  }

  // Set countdown to end on September 2nd at 12am
  const countdownDate = new Date("2025-09-02T00:00:00");

  return (
    <AnnouncementBanner
      id="25-percent-off-promo-2024"
      message="🎉 Get additional 25% off ($6.25/month)! Use code <strong>LABORDAY25</strong> at checkout"
      link={{
        text: "Upgrade Now",
        href: "/pricing",
      }}
      dismissDuration={1} // Can be dismissed for 1 day
      className="bg-gradient-to-r from-green-600 to-emerald-600"
      analyticsEventName="25_percent_off_banner_click"
      countdownDate={countdownDate}
    />
  );
}

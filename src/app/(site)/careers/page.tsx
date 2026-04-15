import { Metadata } from "next";
import { CareersContent } from "@/components/sections/CareersContent";

export const metadata: Metadata = {
  title: "Careers — Grow with Pacific | Pacific Surfaces",
  description:
    "Join our dynamic team and grow your career with Pacific Surfaces. Explore exciting opportunities across departments and locations.",
};

export default function CareersPage() {
  return <CareersContent />;
}

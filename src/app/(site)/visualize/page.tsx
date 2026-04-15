import type { Metadata } from "next";
import { VisualizeClient } from "@/components/visualize/VisualizeClient";

export const metadata: Metadata = {
  title: "Visualiser — See Pacific slabs in your space",
  description:
    "Upload a photo of your kitchen or bath and preview any Pacific Surfaces slab in place. Auto-detect finds your countertop — you pick the stone.",
};

export default function VisualizePage() {
  return <VisualizeClient />;
}

import type { Metadata } from "next";
import { Showroom } from "@/components/visualize/Showroom";

export const metadata: Metadata = {
  title: "Showroom — A 3D room with Pacific slabs",
  description:
    "Walk around a Pacific 3D showroom. Swap quartz slabs onto the island, vanity, or hearth in real time, and see how the stone reads from every angle.",
};

export default function ShowroomPage() {
  return <Showroom />;
}

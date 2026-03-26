"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import for the Map implementation to avoid SSR errors
const LeafletMapImpl = dynamic(
  () => import("./LeafletMapImpl"),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />
  }
);

interface MarkerData {
  position: [number, number];
  content?: string | React.ReactNode;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  markers?: MarkerData[];
  className?: string;
}

export default function LeafletMap(props: LeafletMapProps) {
  return <LeafletMapImpl {...props} />;
}

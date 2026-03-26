import React, { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const LeafletMapImpl = memo(({
  center,
  zoom,
  markers = [],
  className = "h-full w-full",
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);

      // Fix for default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    } else {
      leafletMap.current.setView(center, zoom);
    }

    // Clear existing markers if we were tracking them, 
    // but here we'll just handle markers once for simplicity or recreate them
    // In a real app we'd track layer groups, but for event detail it's usually 1 marker.
    
    markers.forEach(marker => {
      const m = L.marker(marker.position).addTo(leafletMap.current!);
      if (marker.content) {
        if (typeof marker.content === 'string') {
          m.bindPopup(marker.content);
        } else {
          // For complex React nodes, we'd need renderToStaticMarkup, 
          // but for basic usage strings are fine.
          m.bindPopup("Location Details");
        }
      }
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [center, zoom, markers]);

  return <div ref={mapRef} className={className} style={{ minHeight: '200px' }} />;
});

export default LeafletMapImpl;

import { MapPin } from 'lucide-react';

interface GoogleMapsButtonProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  name: string;
}

export default function GoogleMapsButton({ coordinates, name }: GoogleMapsButtonProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  
  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      title={`Open ${name} in Google Maps`}
    >
      <MapPin className="w-4 h-4" />
      <span>Map</span>
    </a>
  );
} 
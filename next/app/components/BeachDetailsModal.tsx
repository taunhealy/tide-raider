import { Beach } from "@/app/types/beaches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/Dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DEFAULT_PROFILE_IMAGE,
  WAVE_TYPE_ICONS,
  WaveType,
} from "@/app/lib/constants";

interface BeachDetailsModalProps {
  beach: Beach;
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

const getTideIcon = (tide: string) => {
  switch (tide.toLowerCase()) {
    case "low":
      return "🌊";
    case "mid":
      return "🌊🌊";
    case "high":
      return "🌊🌊🌊";
    case "all":
      return "🌊↕️";
    default:
      return "🌊";
  }
};

const truncateText = (text: string, limit: number) => {
  const words = text.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  return text;
};

export default function BeachDetailsModal({
  beach,
  isOpen,
  onClose,
  isSubscribed,
  onSubscribe,
}: BeachDetailsModalProps) {
  const router = useRouter();

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    window.location.href = "/pricing";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative w-[54px] h-[54px] rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              <Image
                src={
                  WAVE_TYPE_ICONS[beach.waveType as WaveType] ??
                  DEFAULT_PROFILE_IMAGE
                }
                alt={`${beach.waveType || "Default"} icon`}
                fill
                className="object-cover"
              />
            </div>
            <DialogTitle className="text-lg font-semibold font-primary">
              {beach.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="relative aspect-video w-full mb-4">
          <Image
            src={
              WAVE_TYPE_ICONS[beach.waveType as WaveType] ||
              "/images/hero-cover.jpg"
            }
            alt={beach.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        <div className="grid grid-cols-2 gap-6 py-4 border-b border-gray-200">
          {/* Details Section */}
          <div className="space-y-3">
            <DetailItem label="Region" value={beach.region} />
            <DetailItem label="Location" value={beach.location} />
            <DetailItem
              label="Distance"
              value={`${beach.distanceFromCT}km from CT`}
            />
            <DetailItem label="Wave Type" value={beach.waveType} />
            <DetailItem label="Difficulty" value={beach.difficulty} />
            <DetailItem
              label="Wave Size"
              value={`${beach.swellSize.min}-${beach.swellSize.max}m`}
            />
            <DetailItem
              label="Optimal Tide"
              value={
                <span aria-label={`Optimal Tide: ${beach.optimalTide}`}>
                  {getTideIcon(beach.optimalTide)} {beach.optimalTide}
                </span>
              }
            />
          </div>

          <div className="space-y-3">
            <DetailItem
              label="Optimal Wind"
              value={beach.optimalWindDirections.join(", ")}
            />
            <DetailItem
              label="Optimal Swell"
              value={`${beach.optimalSwellDirections.min}°-${beach.optimalSwellDirections.max}°`}
            />
            <DetailItem
              label="Ideal Swell Period"
              value={`${beach.idealSwellPeriod.min}-${beach.idealSwellPeriod.max}s`}
            />
            <DetailItem
              label="Water Temp"
              value={`${beach.waterTemp.winter}°-${beach.waterTemp.summer}°C`}
            />
            <DetailItem label="Hazards" value={beach.hazards.join(", ")} />
            <DetailItem
              label="Crime Risk"
              value={
                <span title={`Crime Risk: ${beach.crimeLevel}`}>
                  {beach.crimeLevel === "High"
                    ? "💀"
                    : beach.crimeLevel === "Medium"
                      ? "⚠️"
                      : "👮"}
                </span>
              }
            />
            <DetailItem
              label="Shark Attacks"
              value={
                <span
                  title={
                    beach.sharkAttack.hasAttack
                      ? beach.sharkAttack.incidents
                          ?.map((i) => `${i.date}: ${i.outcome} - ${i.details}`)
                          .join("\n")
                      : "No shark attacks reported"
                  }
                  className="cursor-help"
                >
                  {beach.sharkAttack.hasAttack ? "🦈" : "❌"}
                </span>
              }
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-2 pt-4 mb-5">
          <h4 className="font-medium text-base mb-3 font-primary">
            Description
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed font-primary">
            {beach.description}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div mb-4>
      <span className="text-gray-500 text-sm uppercase tracking-tight font-primary">
        {label}
      </span>
      <div className="text-gray-900 font-medium font-primary mt-1">{value}</div>
    </div>
  );
}

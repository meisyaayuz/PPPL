import { LucideIcon } from "lucide-react";

interface EnvironmentalIndicatorProps {
  icon: LucideIcon;
  label: string;
  value: string;
  level: "rendah" | "sedang" | "tinggi" | "baik" | "buruk" | "aman" | "hati-hati" | "berbahaya";
  progress?: number; // 0-100
}

export function EnvironmentalIndicator({
  icon: Icon,
  label,
  value,
  level,
  progress,
}: EnvironmentalIndicatorProps) {
  const getColor = () => {
    switch (level) {
      case "rendah":
      case "baik":
      case "aman":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: "text-green-600",
          badge: "bg-green-100 text-green-800",
          progressBg: "bg-green-200",
          progressFill: "bg-gradient-to-r from-green-400 to-emerald-500",
        };
      case "sedang":
      case "hati-hati":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          icon: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-800",
          progressBg: "bg-yellow-200",
          progressFill: "bg-gradient-to-r from-yellow-400 to-orange-500",
        };
      case "tinggi":
      case "buruk":
      case "berbahaya":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: "text-red-600",
          badge: "bg-red-100 text-red-800",
          progressBg: "bg-red-200",
          progressFill: "bg-gradient-to-r from-red-400 to-pink-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          icon: "text-gray-600",
          badge: "bg-gray-100 text-gray-800",
          progressBg: "bg-gray-200",
          progressFill: "bg-gradient-to-r from-gray-400 to-gray-500",
        };
    }
  };

  const colors = getColor();

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-4 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${colors.badge}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className={`text-xs ${colors.text} mt-0.5`}>{value}</p>
          </div>
        </div>
        <span className={`${colors.badge} text-xs font-bold uppercase px-2.5 py-1 rounded-full`}>
          {level}
        </span>
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className={`h-2 ${colors.progressBg} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${colors.progressFill} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{progress}%</p>
        </div>
      )}
    </div>
  );
}

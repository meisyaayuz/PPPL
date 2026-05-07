interface EnvironmentalGaugeProps {
  value: number; // 0-100
  label: string;
  level: "rendah" | "sedang" | "tinggi" | "baik" | "buruk";
  icon?: React.ReactNode;
  unit?: string;
}

export function EnvironmentalGauge({ value, label, level, icon, unit }: EnvironmentalGaugeProps) {
  const getColor = () => {
    switch (level) {
      case "rendah":
      case "baik":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          ring: "text-green-500",
          gradient: "from-green-400 to-emerald-500",
        };
      case "sedang":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          ring: "text-yellow-500",
          gradient: "from-yellow-400 to-orange-500",
        };
      case "tinggi":
      case "buruk":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          ring: "text-red-500",
          gradient: "from-red-400 to-pink-500",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          ring: "text-gray-500",
          gradient: "from-gray-400 to-gray-500",
        };
    }
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`${colors.bg} rounded-2xl p-4 flex flex-col items-center justify-center`}>
      {/* Circular Progress */}
      <div className="relative w-28 h-28 mb-3">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/40"
          />
          {/* Progress circle */}
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={colors.gradient.split(" ")[0].replace("from-", "")} stopColor="currentColor" />
              <stop offset="100%" className={colors.gradient.split(" ")[1].replace("to-", "")} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <div className={`${colors.text} mb-1`}>{icon}</div>}
          <div className={`text-2xl font-bold ${colors.text}`}>
            {value}
            {unit && <span className="text-sm">{unit}</span>}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {level}
        </span>
      </div>
    </div>
  );
}

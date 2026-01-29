import React from "react";

interface KpiCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change: number;
  trend: "up" | "down";
  period: string;
}

const KpiCard = ({
  icon,
  value,
  label,
  change,
  trend,
  period,
}: KpiCardProps) => {
  
  const isUp = trend === "up";

  return (
    <div className="bg-white shadow rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="w-16 h-16 rounded-full bg-[#ffd100] flex items-center justify-center text-[#2f1107]">
        {icon}
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        <span className="text-[#2f1107] text-3xl font-bold">
          {value}
        </span>

        <span className="text-[#202124] font-medium text-base">
          {label}
        </span>

        <span
          className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"
            }`}
        >
          {isUp ? "▲" : "▼"} {Math.abs(change)}% · {period}
        </span>
      </div>
    </div>
  );
};

export default KpiCard;
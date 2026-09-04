import React from "react";
import { Link } from "react-router-dom";
import { ActivityItem } from "../../types";

interface ActivityTimelineProps {
  items: ActivityItem[];
  title?: string;
  maxItems?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  items,
  title = "Recent Activity",
  maxItems = 5,
}) => {
  const displayedItems = items.slice(0, maxItems);

  const getDotColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-500";
      case "info":
        return "bg-blue-500";
      case "ai":
        return "bg-cyan-500";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
      <h3 className="text-base font-bold text-[#071A33] mb-5" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <div className="space-y-4">
        {displayedItems.map((item, i) => (
          <div key={item.id || i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getDotColor(item.type)}`} />
              {i < displayedItems.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 mt-1 min-h-[24px]" />
              )}
            </div>
            <div className="flex-1 pb-1">
              {item.link ? (
                <Link
                  to={item.link}
                  className="text-sm text-gray-800 hover:text-blue-600 transition-colors leading-snug font-medium block"
                >
                  {item.event}
                </Link>
              ) : (
                <p className="text-sm text-gray-800 leading-snug font-medium">{item.event}</p>
              )}
              <span className="text-xs text-gray-400 mt-1 inline-block">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

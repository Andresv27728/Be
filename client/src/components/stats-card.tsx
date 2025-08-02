import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  gradientClass: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "positive", 
  gradientClass 
}: StatsCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  }[changeType];

  const changeIcon = {
    positive: "fas fa-arrow-up",
    negative: "fas fa-arrow-down",
    neutral: "fas fa-minus"
  }[changeType];

  return (
    <Card className="glass-card shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`w-12 h-12 ${gradientClass} rounded-lg flex items-center justify-center`}>
            <i className={`${icon} text-white`}></i>
          </div>
        </div>
        {change && (
          <div className={`mt-4 flex items-center ${changeColor}`}>
            <i className={`${changeIcon} text-xs mr-1`}></i>
            <span className="text-sm">{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

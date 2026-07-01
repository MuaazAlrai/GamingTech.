import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "./ui/utils";

type Priority = "low" | "medium" | "high" | "urgent";

interface PriorityIndicatorProps {
  priority: Priority;
  showIcon?: boolean;
  className?: string;
}

const priorityConfig: Record<Priority, {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  low: {
    label: "Low",
    color: "text-success",
    icon: Info,
  },
  medium: {
    label: "Medium",
    color: "text-warning",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "text-destructive",
    icon: AlertTriangle,
  },
  urgent: {
    label: "Urgent",
    color: "text-destructive",
    icon: AlertTriangle,
  },
};

export function PriorityIndicator({ 
  priority, 
  showIcon = true,
  className 
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1.5", config.color, className)}>
      {showIcon && <Icon className="h-4 w-4" />}
      <span className="font-medium capitalize">{config.label}</span>
    </div>
  );
}

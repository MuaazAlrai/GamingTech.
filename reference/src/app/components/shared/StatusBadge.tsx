import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  // Repair Statuses
  "Received": { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/10" },
  "Diagnosing": { color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-500/10" },
  "Waiting Approval": { color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-500/10" },
  "Waiting Parts": { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10" },
  "Repairing": { color: "text-cyan-700 dark:text-cyan-400", bg: "bg-cyan-500/10" },
  "Testing": { color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-500/10" },
  "Ready": { color: "text-green-700 dark:text-green-400", bg: "bg-green-500/10" },
  "Delivered": { color: "text-gray-700 dark:text-gray-400", bg: "bg-gray-500/10" },
  "Cancelled": { color: "text-red-700 dark:text-red-400", bg: "bg-red-500/10" },
  
  // Part Statuses
  "Ordered": { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/10" },
  "In Transit": { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10" },
  "Arrived": { color: "text-green-700 dark:text-green-400", bg: "bg-green-500/10" },
  
  // Stock Statuses
  "In Stock": { color: "text-green-700 dark:text-green-400", bg: "bg-green-500/10" },
  "Low Stock": { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10" },
  "Out of Stock": { color: "text-red-700 dark:text-red-400", bg: "bg-red-500/10" },
};

export function StatusBadge({ status, variant = "outline" }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: "text-gray-700 dark:text-gray-400", bg: "bg-gray-500/10" };
  
  return (
    <Badge variant={variant} className={`${config.bg} ${config.color} border-transparent`}>
      {status}
    </Badge>
  );
}

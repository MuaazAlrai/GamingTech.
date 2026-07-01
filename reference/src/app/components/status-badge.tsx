import { Badge } from "./ui/badge";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  PackageCheck,
  Truck,
  HelpCircle
} from "lucide-react";

type RepairStatus = 
  | "received" 
  | "diagnosing" 
  | "waiting_approval" 
  | "waiting_parts"
  | "repairing" 
  | "testing" 
  | "ready" 
  | "delivered"
  | "cancelled";

interface StatusBadgeProps {
  status: RepairStatus;
}

const statusConfig: Record<RepairStatus, { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline"; 
  icon: React.ComponentType<{ className?: string }> 
}> = {
  received: { 
    label: "Received", 
    variant: "secondary", 
    icon: Clock 
  },
  diagnosing: { 
    label: "Diagnosing", 
    variant: "default", 
    icon: AlertCircle 
  },
  waiting_approval: { 
    label: "Waiting Approval", 
    variant: "outline", 
    icon: HelpCircle 
  },
  waiting_parts: { 
    label: "Waiting Parts", 
    variant: "destructive", 
    icon: XCircle 
  },
  repairing: { 
    label: "Repairing", 
    variant: "default", 
    icon: AlertCircle 
  },
  testing: { 
    label: "Testing", 
    variant: "default", 
    icon: PackageCheck 
  },
  ready: { 
    label: "Ready", 
    variant: "outline", 
    icon: CheckCircle2 
  },
  delivered: { 
    label: "Delivered", 
    variant: "secondary", 
    icon: Truck 
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "destructive", 
    icon: XCircle 
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

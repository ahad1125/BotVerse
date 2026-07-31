import { toast } from "sonner";
import {
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const typeConfig = {
  info: {
    icon: <Info className="w-4 h-4 text-neutral-400 shrink-0" />,
    className: "bg-neutral-900 text-neutral-200 border-neutral-800",
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />,
    className: "bg-neutral-900 text-neutral-200 border-neutral-800",
  },
  error: {
    icon: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
    className: "bg-neutral-900 text-neutral-200 border-neutral-800",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
    className: "bg-neutral-900 text-neutral-200 border-neutral-800",
  },
  loading: {
    icon: (
      <Loader2 className="w-4 h-4 text-neutral-400 shrink-0 animate-spin" />
    ),
    className: "bg-neutral-900 text-neutral-200 border-neutral-800",
  },
};
export const notify = (message, type = "info", options = {}) => {
  const config = typeConfig[type] || type.info;

  return toast(message, {
    icon: config.icon,
    closeButton: true,
    className: config.className,
    ...options,
  });
};

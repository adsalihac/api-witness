import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium font-mono transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700",
        success: "bg-emerald-100 text-emerald-700",
        danger: "bg-red-100 text-red-700",
        warning: "bg-amber-100 text-amber-700",
        info: "bg-blue-100 text-blue-700",
        purple: "bg-violet-100 text-violet-700",
        indigo: "bg-indigo-100 text-indigo-700",
        get: "bg-emerald-100 text-emerald-700",
        post: "bg-blue-100 text-blue-700",
        put: "bg-amber-100 text-amber-700",
        patch: "bg-violet-100 text-violet-700",
        delete: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

export function MethodBadge({ method }: { method: string }) {
  const variantMap: Record<string, string> = {
    get: "get",
    post: "post",
    put: "put",
    patch: "patch",
    delete: "delete",
  };
  const v = variantMap[method.toLowerCase()] || "default";
  return <Badge variant={v as any}>{method}</Badge>;
}

export function StatusBadge({ status }: { status: number }) {
  return (
    <Badge variant={status >= 400 || status === 0 ? "danger" : "success"}>
      {status || "ERR"}
    </Badge>
  );
}

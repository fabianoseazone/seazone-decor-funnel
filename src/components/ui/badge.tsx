import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Seazone custom variants
        coral: "border-transparent bg-seazone-coral/15 text-seazone-coral font-bold",
        success: "border-transparent bg-seazone-success/15 text-seazone-success font-bold",
        premium: "border-seazone-gold/30 bg-seazone-gold/10 text-seazone-gold font-bold",
        navy: "border-transparent bg-seazone-navy text-primary-foreground",
        free: "border-seazone-success/30 bg-seazone-success/15 text-seazone-success font-bold uppercase tracking-wider",
        cashflow: "border-seazone-success/40 bg-seazone-success/10 text-seazone-success font-semibold px-4 py-2",
        glass: "border-white/20 bg-white/10 backdrop-blur-xl text-foreground/80 font-medium tracking-wide shadow-[0_0_20px_hsl(220_80%_60%/0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

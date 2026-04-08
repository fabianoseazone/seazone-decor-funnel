import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card shadow-card",
        elevated: "bg-card shadow-elevated hover:shadow-lg hover:-translate-y-1",
        glass: "glass-card",
        premium: "bg-card shadow-elevated border-2 border-seazone-coral/40 ring-4 ring-seazone-coral/10 hover:border-seazone-coral/60 hover:shadow-lg hover:-translate-y-1",
        selected: "bg-card shadow-elevated border-2 border-seazone-coral ring-4 ring-seazone-coral/20",
        navy: "bg-hero text-primary-foreground border-white/10",
        // Glassmorphism package tiers
        "glass-base": "bg-white/60 backdrop-blur-2xl border-white/30 shadow-[0_8px_32px_-8px_hsl(220_50%_12%/0.08)] hover:shadow-[0_16px_48px_-12px_hsl(220_50%_12%/0.12)] hover:-translate-y-1",
        "glass-accent": "bg-white/65 backdrop-blur-2xl border-seazone-coral/20 shadow-[0_8px_32px_-8px_hsl(8_100%_68%/0.1)] ring-1 ring-seazone-coral/10 hover:shadow-[0_16px_48px_-12px_hsl(8_100%_68%/0.15)] hover:border-seazone-coral/30 hover:-translate-y-1",
        "glass-premium": "bg-white/70 backdrop-blur-2xl border-seazone-gold/25 shadow-[0_8px_32px_-8px_hsl(45_90%_55%/0.12)] ring-1 ring-seazone-gold/15 hover:shadow-[0_16px_48px_-12px_hsl(45_90%_55%/0.2)] hover:border-seazone-gold/40 hover:-translate-y-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

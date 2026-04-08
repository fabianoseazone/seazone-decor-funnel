import { Check } from "lucide-react";
import { FUNNEL_STEPS } from "@/types/funnel";
import { useFunnel } from "@/contexts/FunnelContext";
import { cn } from "@/lib/utils";

export function FunnelStepper() {
  const { currentStep, setCurrentStep } = useFunnel();

  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {FUNNEL_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && setCurrentStep(index)}
                disabled={!isClickable}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-seazone-success border-seazone-success",
                  isCurrent && "bg-seazone-coral border-seazone-coral scale-110",
                  !isCompleted && !isCurrent && "bg-secondary border-border",
                  isClickable && "cursor-pointer hover:scale-105",
                  !isClickable && "cursor-not-allowed opacity-50"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <span className={cn(
                    "text-sm font-bold",
                    isCurrent ? "text-accent-foreground" : "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                )}
              </button>

              {/* Step Label (hidden on mobile) */}
              <div className="hidden md:block absolute mt-16 -ml-8 w-24 text-center">
                <span className={cn(
                  "text-xs font-medium",
                  isCurrent ? "text-seazone-coral" : "text-muted-foreground"
                )}>
                  {step.shortLabel}
                </span>
              </div>

              {/* Connector Line */}
              {index < FUNNEL_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      index < currentStep ? "bg-seazone-success" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Label */}
      <div className="md:hidden text-center mt-4">
        <span className="text-sm font-medium text-seazone-coral">
          {FUNNEL_STEPS[currentStep].label}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          ({currentStep + 1}/{FUNNEL_STEPS.length})
        </span>
      </div>
    </div>
  );
}

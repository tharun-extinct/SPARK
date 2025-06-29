import React from "react";
import { cn } from "@/lib/utils";

interface TextShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: number;
}

export function TextShimmer({
  children,
  className,
  duration = 2,
  ...props
}: TextShimmerProps) {
  return (
    <div
      className={cn(
        "relative inline-flex overflow-hidden rounded-md [--base-color:theme(colors.primary.DEFAULT)] [--base-gradient-color:theme(colors.primary.foreground)]",
        className
      )}
      style={{
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)",
      }}
      {...props}
    >
      <span className="animate-text-shimmer bg-[linear-gradient(90deg,var(--base-gradient-color)_33%,var(--base-color)_85%,var(--base-gradient-color)_100%)] bg-[length:200%_100%] text-transparent bg-clip-text relative z-0"
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {children}
      </span>
    </div>
  );
}

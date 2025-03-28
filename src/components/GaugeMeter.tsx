
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GaugeMeterProps {
  value: number;
  percentage: number; // Added percentage value
  max: number;
  threshold: {
    critical: number;
    warning: number;
  };
  size?: "sm" | "md" | "lg";
  label?: string;
  animate?: boolean;
}

export default function GaugeMeter({
  value,
  percentage,
  max,
  threshold,
  size = "lg",
  label = "Gas Level",
  animate = true,
}: GaugeMeterProps) {
  const [angle, setAngle] = useState(0);
  
  // Calculate angle based on percentage
  useEffect(() => {
    // Convert value to percentage of max, then to angle
    // Gauge spans from -120 to 120 degrees (240 degree spread)
    const percentageValue = Math.min(1, Math.max(0, value / max));
    const newAngle = -120 + (percentageValue * 240);
    
    setAngle(newAngle);
  }, [value, max]);
  
  // Determine color based on thresholds
  const getColorClass = () => {
    if (value <= threshold.critical) return "text-gas-low";
    if (value <= threshold.warning) return "text-gas-medium";
    return "text-gas-high";
  };

  // Size classes
  const sizeClasses = {
    sm: "w-48 h-28",
    md: "w-64 h-36",
    lg: "w-80 h-44",
  };

  // Determine pressure status text
  const getStatusText = () => {
    if (value <= threshold.critical) return "Low";
    if (value <= threshold.warning) return "Medium";
    return "Good";
  };

  return (
    <div className={cn("relative mx-auto", sizeClasses[size])}>
      {/* Gauge background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full bg-secondary rounded-t-full overflow-hidden">
          {/* Gauge segments */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 flex">
            <div className="w-1/3 h-full bg-gas-low/20 rounded-bl-full" />
            <div className="w-1/3 h-full bg-gas-medium/20" />
            <div className="w-1/3 h-full bg-gas-high/20 rounded-br-full" />
          </div>
          
          {/* Ticks */}
          <div className="absolute bottom-0 left-0 right-0 h-full">
            {Array.from({ length: 11 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute bottom-0 w-[2px] h-[12px] bg-gray-400"
                style={{ 
                  left: `${5 + (i * 9)}%`,
                  transform: `translateX(-50%) rotate(${-120 + (i * 24)}deg)`,
                  transformOrigin: 'bottom center' 
                }}
              />
            ))}
          </div>
          
          {/* Needle with dynamic rotation */}
          <div 
            className="gas-gauge-needle"
            style={{ 
              transform: `rotate(${angle}deg)`,
              animation: animate ? 'rotate-gauge 1s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              '--rotation-angle': `${angle}deg`
            } as React.CSSProperties}
          >
            <div className="absolute -top-1 -left-[3px] w-[7px] h-[7px] rounded-full bg-foreground" />
          </div>
          
          {/* Center pivot */}
          <div className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full bg-foreground transform -translate-x-1/2" />
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-[-40px] left-0 right-0 text-center">
        <div className="text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={cn("pressure-text", getColorClass())}>
          {percentage.toFixed(1)}% <span className="text-sm ml-1">({value.toFixed(1)} kPa)</span>
        </div>
        <div className={cn("text-sm font-medium", getColorClass())}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GaugeMeterProps {
  value: number;
  percentage: number;
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
    // Gauge spans from -130 to 130 degrees (260 degree spread)
    const percentageValue = Math.min(1, Math.max(0, value / max));
    const newAngle = -130 + (percentageValue * 260);
    
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
    sm: "w-48 h-32",
    md: "w-64 h-44",
    lg: "w-80 h-52",
  };

  // Determine pressure status text
  const getStatusText = () => {
    if (value <= threshold.critical) return "Low";
    if (value <= threshold.warning) return "Medium";
    return "Good";
  };

  // Get gradient classes for the gauge fill based on percentage
  const getGaugeBackground = () => {
    if (percentage <= 30) return "from-gas-low to-gas-low/70";
    if (percentage <= 70) return "from-gas-medium to-gas-medium/70";
    return "from-gas-high to-gas-high/70";
  };

  return (
    <div className={cn("relative mx-auto", sizeClasses[size])}>
      {/* Gauge outer ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full bg-secondary/30 rounded-t-full overflow-hidden border-4 border-secondary shadow-inner">
          {/* Gauge background */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 flex bg-secondary/50">
            {/* Colored segments */}
            <div className="w-1/3 h-full bg-gas-low/20 rounded-bl-full" />
            <div className="w-1/3 h-full bg-gas-medium/20" />
            <div className="w-1/3 h-full bg-gas-high/20 rounded-br-full" />
          </div>

          {/* Gauge fill */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-r transition-all duration-500 ease-out",
              getGaugeBackground()
            )} 
            style={{ 
              height: `${Math.min(50, percentage / 2)}%`, 
              borderTopLeftRadius: percentage < 40 ? '0' : '100px',
              borderTopRightRadius: percentage < 40 ? '0' : '100px',
            }}
          />
          
          {/* Ticks */}
          <div className="absolute bottom-0 left-0 right-0 h-full">
            {Array.from({ length: 11 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "absolute bottom-0 h-[15px] rounded-full transition-colors",
                  i === 0 ? "w-[3px] bg-gas-low" :
                  i === 5 ? "w-[3px] bg-gas-medium" :
                  i === 10 ? "w-[3px] bg-gas-high" :
                  "w-[2px] bg-gray-400/50"
                )}
                style={{ 
                  left: `${5 + (i * 9)}%`,
                  transform: `translateX(-50%) rotate(${-130 + (i * 26)}deg)`,
                  transformOrigin: 'bottom center',
                  height: i % 5 === 0 ? '20px' : '10px'
                }}
              />
            ))}
          </div>
          
          {/* Labels for significant points */}
          <div className="absolute bottom-1 left-[5%] text-[10px] font-medium text-gas-low">0</div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gas-medium">50%</div>
          <div className="absolute bottom-1 right-[5%] text-[10px] font-medium text-gas-high">100%</div>
          
          {/* Needle with dynamic rotation and shadow */}
          <div 
            className="gas-gauge-needle drop-shadow-md"
            style={{ 
              transform: `rotate(${angle}deg)`,
              animation: animate ? 'rotate-gauge 1s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              '--rotation-angle': `${angle}deg`
            } as React.CSSProperties}
          >
            <div className="absolute -top-1 -left-[3px] w-[7px] h-[7px] rounded-full bg-foreground shadow-lg" />
          </div>
          
          {/* Center pivot with 3D effect */}
          <div className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 transform -translate-x-1/2 border border-gray-700 shadow-lg" />
        </div>
      </div>
      
      {/* Value display */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-lg flex flex-col items-center justify-center z-10 border-4 border-secondary">
        <div className={cn("text-3xl font-bold transition-colors", getColorClass())}>
          {percentage.toFixed(0)}%
        </div>
        <div className="text-xs text-muted-foreground">
          {value.toFixed(1)} kPa
        </div>
      </div>
      
      {/* Status label */}
      <div className="absolute -bottom-32 left-0 right-0 text-center">
        <div className="text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={cn("text-sm font-medium mt-1 px-4 py-1 rounded-full inline-block", 
          value <= threshold.critical ? "bg-gas-low/20 text-gas-low" :
          value <= threshold.warning ? "bg-gas-medium/20 text-gas-medium" :
          "bg-gas-high/20 text-gas-high"
        )}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
}

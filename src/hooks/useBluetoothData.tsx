
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Mock data for development purposes
const MOCK_DATA = {
  min: 0,
  max: 15,
  critical: 3.5,
  warning: 7,
  maxTemp: 60, // Maximum safe temperature in Celsius
  warningTemp: 45, // Warning temperature threshold
};

interface BluetoothData {
  pressure: number;
  maxPressure: number;
  pressurePercentage: number; // Added percentage calculation
  temperature: number; // Added temperature reading
  gasLeakage: boolean; // Added gas leakage detection
  status: "disconnected" | "connecting" | "connected" | "error";
  lastUpdated: Date | null;
}

export function useBluetoothData() {
  const [data, setData] = useState<BluetoothData>({
    pressure: 0,
    maxPressure: MOCK_DATA.max,
    pressurePercentage: 0,
    temperature: 25, // Initial temperature in Celsius
    gasLeakage: false, // Initial leakage status
    status: "disconnected",
    lastUpdated: null,
  });

  const [mockMode, setMockMode] = useState(true);
  const [mockPressure, setMockPressure] = useState(MOCK_DATA.max * 0.7);
  const [mockTemp, setMockTemp] = useState(28); // Initial mock temperature
  const [mockLeakage, setMockLeakage] = useState(false); // Initial mock leakage

  // For the demo, we'll use a timer to simulate data updates
  useEffect(() => {
    let interval: number;
    
    if (mockMode && data.status === "connected") {
      interval = window.setInterval(() => {
        // Gradually decrease pressure or randomly fluctuate
        const randomChange = (Math.random() - 0.7) * 0.3;
        let newPressure = mockPressure + randomChange;
        
        // Ensure pressure stays within bounds
        newPressure = Math.max(0, Math.min(MOCK_DATA.max, newPressure));
        
        // Random temperature fluctuation
        const tempChange = (Math.random() - 0.5) * 1.5;
        let newTemp = mockTemp + tempChange;
        newTemp = Math.max(18, Math.min(MOCK_DATA.maxTemp, newTemp));
        
        // Occasionally toggle gas leakage for demo (1% chance)
        const newLeakage = Math.random() < 0.01 ? !mockLeakage : mockLeakage;
        
        // Show warning toast if leakage is detected
        if (newLeakage && !mockLeakage) {
          toast.error("Gas leakage detected! Please check your connections.", {
            duration: 5000,
          });
        }
        
        setMockPressure(newPressure);
        setMockTemp(newTemp);
        setMockLeakage(newLeakage);
        
        // Calculate pressure percentage
        const pressurePercentage = (newPressure / MOCK_DATA.max) * 100;
        
        setData(prev => ({
          ...prev,
          pressure: parseFloat(newPressure.toFixed(2)),
          pressurePercentage: parseFloat(pressurePercentage.toFixed(1)),
          temperature: parseFloat(newTemp.toFixed(1)),
          gasLeakage: newLeakage,
          lastUpdated: new Date(),
        }));
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mockMode, data.status, mockPressure, mockTemp, mockLeakage]);

  // In a real app, this would use Web Bluetooth API to connect to HC05
  const connectBluetooth = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, status: "connecting" }));
      
      // In a real app, we would request the device with Bluetooth here
      // For now, we simulate a connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setData(prev => ({ 
        ...prev, 
        status: "connected",
        lastUpdated: new Date(),
      }));
      
      toast.success("Connected to LPG sensor");
    } catch (error) {
      console.error("Bluetooth connection error:", error);
      setData(prev => ({ ...prev, status: "error" }));
      toast.error("Failed to connect to sensor");
    }
  }, []);

  const disconnectBluetooth = useCallback(() => {
    setData(prev => ({ 
      ...prev, 
      status: "disconnected",
      lastUpdated: new Date(),
    }));
    toast.info("Disconnected from sensor");
  }, []);

  // Calculate critical thresholds 
  const isLow = data.pressure <= MOCK_DATA.critical;
  const isWarning = data.pressure > MOCK_DATA.critical && data.pressure <= MOCK_DATA.warning;
  const isGood = data.pressure > MOCK_DATA.warning;

  return {
    data,
    isLow,
    isWarning,
    isGood,
    thresholds: {
      critical: MOCK_DATA.critical,
      warning: MOCK_DATA.warning,
      max: MOCK_DATA.max,
    },
    connectBluetooth,
    disconnectBluetooth,
    // For demo/testing only
    setMockPressure,
    setMockTemp,
    setMockLeakage,
  };
}

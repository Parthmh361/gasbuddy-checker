
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GaugeMeter from "@/components/GaugeMeter";
import BluetoothManager from "@/components/BluetoothManager";
import BookingCard from "@/components/BookingCard";
import { useBluetoothData } from "@/hooks/useBluetoothData";
import { toast } from "sonner";

const Index = () => {
  const { 
    data, 
    isLow, 
    thresholds, 
    connectBluetooth, 
    disconnectBluetooth 
  } = useBluetoothData();
  const [showReconnectReminder, setShowReconnectReminder] = useState(false);

  // Show reminder after inactivity
  useEffect(() => {
    if (data.status !== "connected") {
      const timer = setTimeout(() => {
        setShowReconnectReminder(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowReconnectReminder(false);
    }
  }, [data.status]);

  // When pressure is critically low, trigger notification
  useEffect(() => {
    if (isLow && data.status === "connected") {
      toast.warning("Gas pressure is low. Consider refilling soon.", {
        duration: 6000,
      });
    }
  }, [isLow, data.status]);

  return (
    <main className="min-h-screen px-4 pb-12 pt-4">
      <Header 
        status={data.status}
        onConnect={connectBluetooth}
        onDisconnect={disconnectBluetooth}
      />
      
      <div className="max-w-md mx-auto pt-8">
        {/* Main gauge */}
        <div className={data.status === "connected" ? "animate-fade-in" : "opacity-40"}>
          <GaugeMeter
            value={data.pressure}
            max={data.maxPressure}
            threshold={{
              critical: thresholds.critical,
              warning: thresholds.warning,
            }}
          />
        </div>
        
        {/* Status section */}
        <BluetoothManager
          status={data.status}
          onConnect={connectBluetooth}
          onDisconnect={disconnectBluetooth}
          lastUpdated={data.lastUpdated}
        />
        
        {/* Booking section */}
        {data.status === "connected" && (
          <BookingCard 
            isLowPressure={isLow}
            currentPressure={data.pressure}
            triggerPressure={thresholds.critical}
          />
        )}
        
        {/* Reconnect reminder */}
        {showReconnectReminder && data.status === "disconnected" && (
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Connect to your LPG sensor to monitor gas levels
            </p>
            <button 
              onClick={connectBluetooth}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              Connect Now
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Index;

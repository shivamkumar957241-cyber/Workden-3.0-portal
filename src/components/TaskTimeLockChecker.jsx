import { useEffect } from "react";

export default function TaskTimeLockChecker({ onTimeCheck }) {
  useEffect(() => {
    const checkTaskTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Tasks active from 9:00 AM to 11:30 PM
      const isWithinActiveHours = 
        (currentHour > 9 || (currentHour === 9 && currentMinute >= 0)) && 
        (currentHour < 23 || (currentHour === 23 && currentMinute <= 30));
      
      if (onTimeCheck) {
        onTimeCheck(isWithinActiveHours);
      }
      
      return isWithinActiveHours;
    };
    
    // Check immediately
    checkTaskTime();
    
    // Check every minute
    const interval = setInterval(checkTaskTime, 60000);
    
    return () => clearInterval(interval);
  }, [onTimeCheck]);
  
  return null;
}

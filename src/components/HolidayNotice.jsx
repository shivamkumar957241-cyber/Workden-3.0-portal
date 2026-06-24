import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sparkles } from "lucide-react";

export default function HolidayNotice() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {}
    };
    loadUser();
  }, []);

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    placeholderData: [],
    refetchInterval: 30000
  });

  // Check if admin has enabled holiday display
  const holidayDisplayEnabled = globalSettings.find(s => s.setting_key === 'holiday_display_enabled')?.setting_value === 'true';
  
  const { data: holidays = [] } = useQuery({
    queryKey: ['active-holidays'],
    queryFn: () => base44.entities.Holiday.list(),
    placeholderData: [],
    refetchInterval: 60000,
    enabled: holidayDisplayEnabled // Only fetch if enabled
  });

  // Only show if admin has explicitly enabled it
  const activeHoliday = holidayDisplayEnabled ? holidays.find(h => h.is_active === true) : null;

  // Don't show holiday notice for admin users
  if (!activeHoliday || user?.role === 'admin') return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-4 border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-white/10 to-white/5 p-8 text-center">
          <div className="text-8xl mb-6">{activeHoliday.emoji}</div>
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">
            {activeHoliday.holiday_name}
          </h1>
          <div className="flex items-center justify-center gap-3 text-white/90 mb-6">
            <Calendar className="w-6 h-6" />
            <p className="text-xl font-semibold">
              {new Date(activeHoliday.holiday_date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <CardContent className="p-8 bg-white">
          <div className="text-center space-y-4">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <p className="text-2xl font-bold text-gray-900 mb-3">{activeHoliday.message}</p>
            </div>
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-amber-900">
                <Sparkles className="w-5 h-5" />
                <p className="font-semibold">Platform Closed Today</p>
              </div>
              <p className="text-sm text-amber-700 mt-2">All tasks and features are unavailable on holidays</p>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Enjoy your day! We'll be back tomorrow. 🎉
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";

export default function HolidaysTab({ holidays, globalSettings, onAddHoliday, onEditHoliday }) {
  const queryClient = useQueryClient();
  const isHolidayDisplayOn = globalSettings.find(s => s.setting_key === 'holiday_display_enabled')?.setting_value === 'true';
  const activeHoliday = holidays.find(h => h.is_active === true);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2"><Calendar className="w-6 h-6" />Holiday Management</CardTitle>
          <Button onClick={onAddHoliday} className="bg-white/20 hover:bg-white/30"><Plus className="w-4 h-4 mr-2" />Add Holiday</Button>
        </div>
        <div className={`p-5 rounded-xl border-2 ${isHolidayDisplayOn ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-bold text-xl mb-1">{isHolidayDisplayOn ? '🔴 HOLIDAY MODE ACTIVE' : '✅ Platform Running Normal'}</p>
              <p className="text-sm">{isHolidayDisplayOn ? (activeHoliday ? `Showing: ${activeHoliday.emoji} ${activeHoliday.holiday_name}` : 'No holiday selected') : 'Holiday notice is hidden from users'}</p>
            </div>
            <Button size="lg" className={isHolidayDisplayOn ? 'bg-green-600 hover:bg-green-700 text-lg px-6' : 'bg-red-600 hover:bg-red-700 text-lg px-6'} onClick={async () => {
              const existing = globalSettings.find(s => s.setting_key === 'holiday_display_enabled');
              const newValue = !isHolidayDisplayOn;
              if (existing) { await base44.entities.GlobalSettings.update(existing.id, { setting_value: newValue ? 'true' : 'false' }); }
              else { await base44.entities.GlobalSettings.create({ setting_key: 'holiday_display_enabled', setting_value: newValue ? 'true' : 'false', description: 'Show/hide holiday notice to users' }); }
              queryClient.invalidateQueries({ queryKey: ['global-settings'] });
              alert(newValue ? '🔴 Holiday mode activated' : '✅ Holiday mode deactivated');
            }}>{isHolidayDisplayOn ? '✅ Turn OFF Holiday Mode' : '🔴 Turn ON Holiday Mode'}</Button>
          </div>
        </div>
        {activeHoliday && (
          <div className="mt-3 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
            <p className="text-sm font-semibold text-purple-900">Currently Active: {activeHoliday.emoji} {activeHoliday.holiday_name} ({activeHoliday.holiday_date})</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {holidays.length > 0 ? holidays.map(holiday => (
          <Card key={holiday.id} className={`border-l-4 ${holiday.is_active ? 'border-l-green-500 bg-green-50' : 'border-l-gray-400 bg-gray-50'}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{holiday.emoji || '🎉'}</span><p className="font-bold text-lg">{holiday.holiday_name}</p></div>
                  <p className="text-sm text-gray-600 mb-2">📅 {new Date(holiday.holiday_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  {holiday.message && <p className="text-sm text-gray-700 italic bg-white p-2 rounded border">"{holiday.message}"</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={holiday.is_active ? 'bg-green-600' : 'bg-gray-500'}>{holiday.is_active ? 'Active' : 'Inactive'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => onEditHoliday(holiday)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant={holiday.is_active ? 'secondary' : 'default'} onClick={async () => { await base44.entities.Holiday.update(holiday.id, { is_active: !holiday.is_active }); queryClient.invalidateQueries({ queryKey: ['holidays'] }); }}>{holiday.is_active ? 'Off' : 'On'}</Button>
                  <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete ${holiday.holiday_name}?`)) { await base44.entities.Holiday.delete(holiday.id); queryClient.invalidateQueries({ queryKey: ['holidays'] }); } }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12"><Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No holidays added yet</p><Button onClick={onAddHoliday} className="mt-4">Add First Holiday</Button></div>
        )}
      </CardContent>
    </Card>
  );
}

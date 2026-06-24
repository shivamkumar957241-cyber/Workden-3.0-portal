import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar } from "lucide-react";

export default function Holidays() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => base44.entities.Holiday.list('holiday_date'),
    placeholderData: []
  });

  const activeHolidays = holidays.filter(h => h.is_active);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = activeHolidays.filter(h => {
    const q = searchQuery.toLowerCase();
    return !searchQuery || h.holiday_name?.toLowerCase().includes(q) || h.holiday_date?.includes(searchQuery);
  });

  const upcoming = filtered.filter(h => new Date(h.holiday_date) >= today).sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));
  const past = filtered.filter(h => new Date(h.holiday_date) < today).sort((a, b) => new Date(b.holiday_date) - new Date(a.holiday_date));
  const displayed = activeTab === "upcoming" ? upcoming : past;

  const getDaysUntil = (dateStr) => {
    const d = new Date(dateStr);
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  };

  const getMonthName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const groupedByMonth = {};
  displayed.forEach(h => {
    const key = getMonthName(h.holiday_date);
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(h);
  });

  const nextHoliday = upcoming[0];
  const daysToNext = nextHoliday ? getDaysUntil(nextHoliday.holiday_date) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Clean white header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">WorkDen Platform</p>
          <h1 className="text-2xl font-black text-gray-900 mb-0.5">🗓️ Holiday Calendar</h1>
          <p className="text-gray-500 text-sm">India Public Holidays 2026</p>

          {nextHoliday && daysToNext !== null && (
            <div className="mt-4 inline-flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2.5">
              <span className="text-xl">{nextHoliday.emoji || '🎉'}</span>
              <div className="text-left">
                <p className="text-gray-900 font-bold text-sm leading-tight">{nextHoliday.holiday_name}</p>
                <p className="text-orange-600 text-xs">
                  {daysToNext === 0 ? '🎉 Today!' : daysToNext === 1 ? '⏰ Tomorrow' : `In ${daysToNext} days`}
                </p>
              </div>
              <div className="w-px h-7 bg-orange-200"></div>
              <div className="text-center">
                <p className="text-orange-600 font-black text-xl leading-none">{daysToNext === 0 ? '🎊' : daysToNext}</p>
                {daysToNext > 0 && <p className="text-gray-400 text-xs">days left</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center">
            <p className="text-2xl font-black text-green-600">{upcoming.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Upcoming</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center">
            <p className="text-2xl font-black text-gray-400">{past.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Past</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center">
            <p className="text-2xl font-black text-blue-600">{activeHolidays.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total 2026</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search holidays..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "upcoming" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            📅 Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "past" ? "bg-white text-gray-700 shadow-sm" : "text-gray-500"}`}
          >
            🕰 Past ({past.length})
          </button>
        </div>

        {/* Holiday List */}
        {Object.keys(groupedByMonth).length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-semibold">No holidays found</p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {Object.entries(groupedByMonth).map(([month, monthHolidays]) => (
              <div key={month}>
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">{month}</span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="space-y-2">
                  {monthHolidays.map(holiday => {
                    const hDate = new Date(holiday.holiday_date);
                    const daysLeft = activeTab === "upcoming" ? getDaysUntil(holiday.holiday_date) : null;
                    const isToday = daysLeft === 0;
                    const isTomorrow = daysLeft === 1;

                    return (
                      <div
                        key={holiday.id}
                        className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                          isToday ? 'border-green-300 ring-2 ring-green-200' :
                          isTomorrow ? 'border-amber-300' :
                          'border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4 p-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            isToday ? 'bg-green-100' : activeTab === 'past' ? 'bg-gray-100' : 'bg-orange-50'
                          }">
                            {holiday.emoji || '🎉'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm leading-tight ${activeTab === 'past' ? 'text-gray-500' : 'text-gray-900'}`}>
                              {holiday.holiday_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {hDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                            {holiday.message && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{holiday.message.replace(/Platform is closed today[^.]*/g, '').trim()}</p>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {isToday && <span className="inline-block bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Today</span>}
                            {isTomorrow && <span className="inline-block bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Tomorrow</span>}
                            {daysLeft !== null && daysLeft > 1 && <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{daysLeft}d</span>}
                            {activeTab === 'past' && <span className="inline-block bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">Past</span>}
                          </div>
                        </div>

                        {isToday && (
                          <div className="bg-green-500 text-white text-xs font-semibold text-center py-1.5">
                            🎉 Platform is closed today — Happy {holiday.holiday_name}!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom note */}
        <div className="p-4 bg-gray-100 border border-gray-200 rounded-2xl text-center">
          <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600 font-semibold">WorkDen is closed on all listed public holidays.</p>
          <p className="text-xs text-gray-400 mt-0.5">Tasks submitted on holidays will be processed the next working day.</p>
        </div>
      </div>
    </div>
  );
}

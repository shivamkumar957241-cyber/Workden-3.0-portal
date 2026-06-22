import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Image, Bell, Wrench, Clock, Upload, Loader2 } from "lucide-react";

export default function BannersTab({ globalSettings }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ key: "", value: "", description: "" });
  const [saving, setSaving] = useState(false);

  const alertSettings = [
    { key: "maintenance_date", label: "🔧 Maintenance Date", type: "date", icon: <Wrench className="w-4 h-4" />, color: "orange" },
    { key: "maintenance_message", label: "🔧 Maintenance Message", type: "text", icon: <Wrench className="w-4 h-4" />, color: "orange" },
    { key: "task_hold_date", label: "⏸️ Task Hold Date (30-day countdown)", type: "date", icon: <Clock className="w-4 h-4" />, color: "red" },
    { key: "task_hold_message", label: "⏸️ Task Hold Message", type: "text", icon: <Clock className="w-4 h-4" />, color: "red" },
    { key: "new_task_date", label: "🆕 New Task Coming Date (7-day alert)", type: "date", icon: <Bell className="w-4 h-4" />, color: "blue" },
    { key: "new_task_message", label: "🆕 New Task Message", type: "text", icon: <Bell className="w-4 h-4" />, color: "blue" },
  ];

  const bannerSettings = globalSettings.filter(s =>
    s.setting_key.startsWith('banner_') ||
    s.setting_key === 'homepage_announcement' ||
    alertSettings.some(a => a.key === s.setting_key)
  );

  const getSettingValue = (key) => globalSettings.find(s => s.setting_key === key)?.setting_value || "";

  const saveSetting = async (key, value) => {
    const existing = globalSettings.find(s => s.setting_key === key);
    if (existing) {
      await base44.entities.GlobalSettings.update(existing.id, { setting_value: value });
    } else {
      await base44.entities.GlobalSettings.create({ setting_key: key, setting_value: value, is_enabled: true });
    }
    queryClient.invalidateQueries({ queryKey: ['global-settings'] });
  };

  const handleImageUpload = async (e, settingKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(settingKey);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await saveSetting(settingKey, file_url);
      alert("✅ Image uploaded!");
    } catch { alert("❌ Upload failed"); } finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Alert System */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Alert & Notification System
          </CardTitle>
          <p className="text-sm text-white/80 mt-1">Set maintenance, task hold, and upcoming task alerts shown to users</p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {alertSettings.map(setting => {
            const currentVal = getSettingValue(setting.key);
            return (
              <div key={setting.key} className="space-y-1">
                <Label className="flex items-center gap-2 font-semibold">{setting.label}</Label>
                <div className="flex gap-2">
                  <Input
                    type={setting.type}
                    defaultValue={currentVal}
                    onBlur={(e) => { if (e.target.value !== currentVal) saveSetting(setting.key, e.target.value); }}
                    className="flex-1"
                    placeholder={setting.type === 'date' ? 'Pick date' : 'Enter message...'}
                  />
                  <Button size="sm" variant="outline" onClick={() => saveSetting(setting.key, "")}>Clear</Button>
                </div>
              </div>
            );
          })}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            ℹ️ <strong>Maintenance:</strong> Shows 3 days before • <strong>Task Hold:</strong> Shows 30 days before • <strong>New Task:</strong> Shows 7 days before
          </div>
        </CardContent>
      </Card>

      {/* Homepage Announcement */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Homepage Announcement Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div>
            <Label>Announcement Text (leave blank to hide)</Label>
            <Textarea
              defaultValue={getSettingValue('homepage_announcement')}
              onBlur={(e) => saveSetting('homepage_announcement', e.target.value)}
              placeholder="e.g. 🎉 New tasks added! Check the Tasks section now."
              rows={3}
            />
          </div>
          <div>
            <Label>Announcement Color</Label>
            <select
              defaultValue={getSettingValue('homepage_announcement_color') || 'blue'}
              onBlur={(e) => saveSetting('homepage_announcement_color', e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="orange">Orange</option>
              <option value="purple">Purple</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Banner Images */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" /> Homepage Banners / Images
          </CardTitle>
          <p className="text-sm text-white/80">Upload banners shown on user homepage</p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {['banner_1', 'banner_2', 'banner_3'].map((key, i) => {
            const currentUrl = getSettingValue(key);
            return (
              <div key={key} className="space-y-2 p-4 border-2 border-dashed border-gray-200 rounded-xl">
                <Label className="font-bold">Banner {i + 1}</Label>
                {currentUrl && (
                  <div className="relative">
                    <img src={currentUrl} alt={`Banner ${i+1}`} className="w-full max-h-40 object-cover rounded-lg" />
                    <button onClick={() => saveSetting(key, "")} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <label className={`flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-sm font-semibold text-purple-700 ${uploading === key ? 'opacity-50' : ''}`}>
                    {uploading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading === key ? 'Uploading...' : 'Upload Banner Image'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading === key} onChange={(e) => handleImageUpload(e, key)} />
                  </label>
                  <div className="flex-1">
                    <Input
                      placeholder="Or paste image URL..."
                      defaultValue={currentUrl}
                      onBlur={(e) => { if (e.target.value !== currentUrl) saveSetting(key, e.target.value); }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
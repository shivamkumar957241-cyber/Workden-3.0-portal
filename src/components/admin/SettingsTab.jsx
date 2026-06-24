import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Plus, Trash2, Video, FileText, Image as ImageIcon } from "lucide-react";
import WithdrawalSettings from "./WithdrawalSettings";

export default function SettingsTab({ globalSettings, tasks, trainingVideos }) {
  const queryClient = useQueryClient();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [platformOff, setPlatformOff] = useState(globalSettings.find(s => s.setting_key === 'platform_off_enabled')?.setting_value === 'true');
  const [offMessage, setOffMessage] = useState(globalSettings.find(s => s.setting_key === 'platform_off_message')?.setting_value || "");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Payment QR & UPI */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"><CardTitle>💳 Payment QR & UPI</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          {globalSettings.find(s => s.setting_key === 'payment_qr') && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm mb-2">Current QR:</p>
              <img src={globalSettings.find(s => s.setting_key === 'payment_qr')?.setting_value} alt="QR" className="max-w-[150px] mx-auto rounded" />
            </div>
          )}
          {globalSettings.find(s => s.setting_key === 'payment_upi') && (
            <div className="p-3 bg-blue-50 rounded text-center"><p className="text-xs mb-1">UPI:</p><p className="font-mono font-bold">{globalSettings.find(s => s.setting_key === 'payment_upi')?.setting_value}</p></div>
          )}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Upload QR Image</Label>
            <input type="file" accept="image/*" id="qr-file-upload" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              const existing = globalSettings.find(s => s.setting_key === 'payment_qr');
              existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: file_url }) : await base44.entities.GlobalSettings.create({ setting_key: 'payment_qr', setting_value: file_url });
              queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ QR uploaded!');
            }} />
            <Button onClick={() => document.getElementById('qr-file-upload').click()} className="w-full bg-gradient-to-r from-green-500 to-emerald-600">📤 Upload QR Image</Button>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-2 block">Enter QR URL</Label>
            <Input placeholder="Paste image URL" id="payment-qr-url" />
            <Button onClick={async () => {
              const url = document.getElementById('payment-qr-url').value; if (!url) return;
              let finalUrl = url;
              if (url.includes('drive.google.com')) { const match = url.match(/\/file\/d\/([^/]+)/)||url.match(/[?&]id=([^&]+)/); if (match) finalUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`; }
              const existing = globalSettings.find(s => s.setting_key === 'payment_qr');
              existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: finalUrl }) : await base44.entities.GlobalSettings.create({ setting_key: 'payment_qr', setting_value: finalUrl });
              queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ QR URL updated!');
            }} className="w-full mt-2 bg-green-500">Save QR URL</Button>
          </div>
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-2 block">💳 Payment Link (Razorpay / Any)</Label>
            {globalSettings.find(s => s.setting_key === 'payment_link') && (
              <div className="p-2 bg-green-50 rounded text-xs text-gray-600 mb-2 break-all">
                <strong>Current:</strong> {globalSettings.find(s => s.setting_key === 'payment_link')?.setting_value}
              </div>
            )}
            <Input placeholder="https://razorpay.me/@WorkDen" id="payment-link-id" defaultValue={globalSettings.find(s => s.setting_key === 'payment_link')?.setting_value || ""} />
            <Button onClick={async () => {
              const link = document.getElementById('payment-link-id').value; if (!link) return;
              const existing = globalSettings.find(s => s.setting_key === 'payment_link');
              existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: link }) : await base44.entities.GlobalSettings.create({ setting_key: 'payment_link', setting_value: link, description: 'Payment link shown on subscription page' });
              queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Payment Link updated!');
            }} className="w-full mt-2 bg-green-600">Save Payment Link</Button>
          </div>
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-2 block">UPI ID (for reference)</Label>
            <Input placeholder="Enter UPI ID" id="payment-upi-id" defaultValue={globalSettings.find(s => s.setting_key === 'payment_upi')?.setting_value || ""} />
            <Button onClick={async () => {
              const upi = document.getElementById('payment-upi-id').value; if (!upi) return;
              const existing = globalSettings.find(s => s.setting_key === 'payment_upi');
              existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: upi }) : await base44.entities.GlobalSettings.create({ setting_key: 'payment_upi', setting_value: upi });
              queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ UPI updated!');
            }} className="w-full mt-2 bg-blue-500">Save UPI ID</Button>
          </div>
        </CardContent>
      </Card>

      {/* Earning Proof Images */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle>🖼️ Earning Proof Images</CardTitle>
            <Button onClick={async () => {
              const imageTitle = prompt("Image title (e.g. Payment Proof - ₹5000):"); if (!imageTitle) return;
              const imageUrl = prompt("Image URL (Google Drive link or direct URL):"); if (!imageUrl) return;
              const imageDesc = prompt("Description (optional):") || "";
              const existing = globalSettings.filter(s => s.setting_key === 'earning_proof_images');
              let arr = [];
              if (existing.length > 0) { const d = existing[0].setting_value; arr = typeof d === 'string' ? JSON.parse(d) : d; if (!Array.isArray(arr)) arr = [arr]; }
              arr.push({ title: imageTitle, url: imageUrl, description: imageDesc });
              existing.length > 0 ? await base44.entities.GlobalSettings.update(existing[0].id, { setting_value: JSON.stringify(arr) }) : await base44.entities.GlobalSettings.create({ setting_key: 'earning_proof_images', setting_value: JSON.stringify(arr), is_enabled: true });
              queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Image added!');
            }} className="bg-white/20 hover:bg-white/30"><Plus className="w-4 h-4 mr-2" />Add Image</Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {(() => {
            const ev = globalSettings.filter(s => s.setting_key === 'earning_proof_images');
            if (!ev.length) return <p className="text-center text-gray-500 py-4">No images yet. Paste Google Drive image links above.</p>;
            const vd = ev[0].setting_value; const imgs = Array.isArray(typeof vd === 'string' ? JSON.parse(vd) : vd) ? (typeof vd === 'string' ? JSON.parse(vd) : vd) : [vd];
            return <div className="space-y-2 max-h-48 overflow-y-auto">{imgs.map((img, i) => (
              <div key={i} className="flex items-start justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex-1"><p className="font-medium text-sm">{img.title}</p><p className="text-xs text-gray-600 break-all">{img.url?.substring(0,50)}...</p></div>
                <Button size="sm" variant="destructive" className="h-7 ml-2" onClick={async () => {
                  if (confirm('Delete?')) { const updated = imgs.filter((_,j) => j!==i); updated.length ? await base44.entities.GlobalSettings.update(ev[0].id, { setting_value: JSON.stringify(updated) }) : await base44.entities.GlobalSettings.delete(ev[0].id); queryClient.invalidateQueries({ queryKey: ['global-settings'] }); }
                }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}</div>;
          })()}
        </CardContent>
      </Card>

      {/* Earning Proof Videos */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle>🎥 Earning Proof Videos</CardTitle>
            <Button onClick={async () => {
              const videoTitle = prompt("Video title:"); if (!videoTitle) return;
              const videoUrl = prompt("Video URL:"); if (!videoUrl) return;
              const videoDescription = prompt("Description (optional):") || "";
              const existing = globalSettings.filter(s => s.setting_key === 'earning_proof_videos');
              let arr = [];
              if (existing.length > 0) { const d = existing[0].setting_value; arr = typeof d === 'string' ? JSON.parse(d) : d; if (!Array.isArray(arr)) arr = [arr]; }
              arr.push({ title: videoTitle, url: videoUrl, description: videoDescription });
              existing.length > 0 ? await base44.entities.GlobalSettings.update(existing[0].id, { setting_value: JSON.stringify(arr) }) : await base44.entities.GlobalSettings.create({ setting_key: 'earning_proof_videos', setting_value: JSON.stringify(arr), is_enabled: true });
              queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Added!');
            }} className="bg-white/20 hover:bg-white/30"><Plus className="w-4 h-4 mr-2" />Add Video</Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {(() => {
            const ev = globalSettings.filter(s => s.setting_key === 'earning_proof_videos');
            if (!ev.length) return <p className="text-center text-gray-500 py-6">No videos yet</p>;
            const vd = ev[0].setting_value; const videos = Array.isArray(typeof vd === 'string' ? JSON.parse(vd) : vd) ? (typeof vd === 'string' ? JSON.parse(vd) : vd) : [vd];
            return <div className="space-y-3 max-h-60 overflow-y-auto">{videos.map((v, i) => (
              <div key={i} className="flex items-start justify-between p-3 bg-purple-50 rounded border border-purple-200">
                <div className="flex-1"><p className="font-medium text-sm">{v.title}</p><p className="text-xs text-gray-600 break-all">{v.url}</p></div>
                <Button size="sm" variant="destructive" className="h-7" onClick={async () => {
                  if (confirm('Delete?')) { const updated = videos.filter((_,j) => j!==i); updated.length ? await base44.entities.GlobalSettings.update(ev[0].id, { setting_value: JSON.stringify(updated) }) : await base44.entities.GlobalSettings.delete(ev[0].id); queryClient.invalidateQueries({ queryKey: ['global-settings'] }); }
                }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}</div>;
          })()}
        </CardContent>
      </Card>

      {/* Platform Off Mode */}
      <Card className="border-2 border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white"><CardTitle>🚫 Platform Off Mode</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Status Indicator */}
          <div className={`p-4 rounded-xl border-2 ${platformOff ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{platformOff ? '🔴 PLATFORM OFF' : '✅ PLATFORM RUNNING'}</p>
                <p className="text-sm text-gray-600 mt-1">{platformOff ? 'All task submissions are blocked' : 'Platform is accepting submissions'}</p>
              </div>
              <Button 
                size="lg" 
                className={platformOff ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                onClick={async () => {
                  const existing = globalSettings.find(s => s.setting_key === 'platform_off_enabled');
                  const newVal = !platformOff;
                  existing ? 
                    await base44.entities.GlobalSettings.update(existing.id, { setting_value: newVal ? 'true' : 'false' }) : 
                    await base44.entities.GlobalSettings.create({ setting_key: 'platform_off_enabled', setting_value: newVal ? 'true' : 'false' });
                  setPlatformOff(newVal);
                  queryClient.invalidateQueries({ queryKey: ['global-settings'] }); 
                  alert(newVal ? '🔴 Platform turned OFF — all submissions blocked' : '✅ Platform turned ON');
                }}
              >
                {platformOff ? 'Turn ON' : 'Turn OFF'}
              </Button>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <Label className="font-bold text-amber-900">Message shown to users when offline</Label>
            <Textarea 
              placeholder="e.g., Platform closed for maintenance. Check back soon!"
              value={offMessage} 
              onChange={(e) => setOffMessage(e.target.value)}
              rows={3}
              className="border-amber-200 bg-white"
            />
            <Button 
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={async () => {
                const existing = globalSettings.find(s => s.setting_key === 'platform_off_message');
                existing ? 
                  await base44.entities.GlobalSettings.update(existing.id, { setting_value: offMessage }) : 
                  await base44.entities.GlobalSettings.create({ setting_key: 'platform_off_message', setting_value: offMessage, description: 'Message shown when platform is off' });
                queryClient.invalidateQueries({ queryKey: ['global-settings'] }); 
                alert('✅ Message saved!');
              }}
            >
              Save Custom Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Partner Video */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-600 text-white"><CardTitle>💼 Referral Partner Video</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          {globalSettings.find(s => s.setting_key === 'referral_partner_video') && (
            <div className="p-3 bg-orange-50 rounded border border-orange-200 break-all text-xs text-gray-600">
              <p className="font-semibold mb-1">Current Link:</p>
              <p>{globalSettings.find(s => s.setting_key === 'referral_partner_video')?.setting_value}</p>
            </div>
          )}
          <Input placeholder="Enter Google Drive or YouTube video link" id="referral-partner-video-url" />
          <Button onClick={async () => {
            const url = document.getElementById('referral-partner-video-url').value; if (!url.trim()) return;
            const existing = globalSettings.find(s => s.setting_key === 'referral_partner_video');
            existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: url.trim() }) : await base44.entities.GlobalSettings.create({ setting_key: 'referral_partner_video', setting_value: url.trim(), description: 'Referral Partner page video link' });
            queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Referral Partner video updated!');
          }} className="w-full bg-orange-500 hover:bg-orange-600">Save Video Link</Button>
        </CardContent>
      </Card>

      {/* Tutorial Video (Home Page) */}
      <Card className="border-2 border-teal-200">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white"><CardTitle>🎓 Home Page Tutorial Video</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs text-gray-500">This video appears on the Home page as "Watch Full Tutorial"</p>
          {globalSettings.find(s => s.setting_key === 'tutorial_video') && (
            <div className="p-3 bg-teal-50 rounded border border-teal-200 break-all text-xs text-gray-600">
              <p className="font-semibold mb-1">Current Link:</p>
              <p>{globalSettings.find(s => s.setting_key === 'tutorial_video')?.setting_value}</p>
            </div>
          )}
          <Input placeholder="Enter Google Drive or YouTube video link" id="tutorial-video-url" />
          <Button onClick={async () => {
            const url = document.getElementById('tutorial-video-url').value; if (!url.trim()) return;
            const existing = globalSettings.find(s => s.setting_key === 'tutorial_video');
            existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: url.trim() }) : await base44.entities.GlobalSettings.create({ setting_key: 'tutorial_video', setting_value: url.trim(), description: 'Home page tutorial video link' });
            queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Tutorial video updated!');
          }} className="w-full bg-teal-500 hover:bg-teal-600">Save Tutorial Video</Button>
        </CardContent>
      </Card>

      {/* Live Webinar */}
      <Card className="border-2 border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white"><CardTitle>🔴 Live Webinar Video</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs text-gray-500">This video plays inside the Training Module under "Live Webinar" tab</p>
          {globalSettings.find(s => s.setting_key === 'live_webinar_video') && (
            <div className="p-3 bg-red-50 rounded border border-red-200 break-all text-xs text-gray-600">
              <p className="font-semibold mb-1">Current Link:</p>
              <p>{globalSettings.find(s => s.setting_key === 'live_webinar_video')?.setting_value}</p>
            </div>
          )}
          <Input placeholder="Enter Google Drive or YouTube live/video link" id="live-webinar-url" />
          <Button onClick={async () => {
            const url = document.getElementById('live-webinar-url').value; if (!url.trim()) return;
            const existing = globalSettings.find(s => s.setting_key === 'live_webinar_video');
            existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: url.trim() }) : await base44.entities.GlobalSettings.create({ setting_key: 'live_webinar_video', setting_value: url.trim(), description: 'Live webinar video link' });
            queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Live Webinar video updated!');
          }} className="w-full bg-red-500 hover:bg-red-600">Save Live Webinar Link</Button>
        </CardContent>
      </Card>

      {/* How to Submit Task Video */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"><CardTitle>📤 "How to Submit Task" Video</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs text-gray-500">Shown inside "Submit Task" dialog as demo video</p>
          {globalSettings.find(s => s.setting_key === 'submit_task_video') && (
            <div className="p-2 bg-green-50 rounded border border-green-200 text-xs text-gray-600 break-all">
              <strong>Current:</strong> {globalSettings.find(s => s.setting_key === 'submit_task_video')?.setting_value}
            </div>
          )}
          <Input placeholder="Paste Google Drive or YouTube link" id="submit-task-video-url" defaultValue={globalSettings.find(s => s.setting_key === 'submit_task_video')?.setting_value || ""} />
          <Button onClick={async () => {
            const url = document.getElementById('submit-task-video-url').value; if (!url.trim()) return;
            const existing = globalSettings.find(s => s.setting_key === 'submit_task_video');
            existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: url.trim() }) : await base44.entities.GlobalSettings.create({ setting_key: 'submit_task_video', setting_value: url.trim(), description: 'How to submit task video' });
            queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Saved!');
          }} className="w-full bg-green-600 hover:bg-green-700">Save Submit Task Video</Button>
        </CardContent>
      </Card>

      {/* Task History Help Video */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white"><CardTitle>📋 "Task History" Help Video</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs text-gray-500">Shown on Task History page via "See How to Check History" button</p>
          {globalSettings.find(s => s.setting_key === 'task_history_video') && (
            <div className="p-2 bg-indigo-50 rounded border border-indigo-200 text-xs text-gray-600 break-all">
              <strong>Current:</strong> {globalSettings.find(s => s.setting_key === 'task_history_video')?.setting_value}
            </div>
          )}
          <Input placeholder="Paste Google Drive or YouTube link" id="task-history-video-url" defaultValue={globalSettings.find(s => s.setting_key === 'task_history_video')?.setting_value || ""} />
          <Button onClick={async () => {
            const url = document.getElementById('task-history-video-url').value; if (!url.trim()) return;
            const existing = globalSettings.find(s => s.setting_key === 'task_history_video');
            existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: url.trim() }) : await base44.entities.GlobalSettings.create({ setting_key: 'task_history_video', setting_value: url.trim(), description: 'Task history help video' });
            queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Saved!');
          }} className="w-full bg-indigo-600 hover:bg-indigo-700">Save Task History Video</Button>
        </CardContent>
      </Card>

      {/* Support Tickets Demo Video */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"><CardTitle>🎫 "Support Tickets" Demo Video</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs text-gray-500">Shown on Support Tickets & History page via "Watch Demo" button</p>
          {globalSettings.find(s => s.setting_key === 'support_tickets_video') && (
            <div className="p-2 bg-orange-50 rounded border border-orange-200 text-xs text-gray-600 break-all">
              <strong>Current:</strong> {globalSettings.find(s => s.setting_key === 'support_tickets_video')?.setting_value}
            </div>
          )}
          <Input placeholder="Paste Google Drive or YouTube link" id="support-tickets-video-url" defaultValue={globalSettings.find(s => s.setting_key === 'support_tickets_video')?.setting_value || ""} />
          <Button onClick={async () => {
            const url = document.getElementById('support-tickets-video-url').value; if (!url.trim()) return;
            const existing = globalSettings.find(s => s.setting_key === 'support_tickets_video');
            existing ? await base44.entities.GlobalSettings.update(existing.id, { setting_value: url.trim() }) : await base44.entities.GlobalSettings.create({ setting_key: 'support_tickets_video', setting_value: url.trim(), description: 'Support tickets demo video' });
            queryClient.invalidateQueries({ queryKey: ['global-settings'] }); alert('✅ Saved!');
          }} className="w-full bg-orange-600 hover:bg-orange-700">Save Support Tickets Video</Button>
        </CardContent>
      </Card>

      {/* Training Videos */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white"><CardTitle>📹 Recorded Training Videos</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <Select onValueChange={setSelectedTopic}>
            <SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="General Training">General</SelectItem>
              <SelectItem value="Getting Started">Getting Started</SelectItem>
              {tasks.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Video Title" id="video-title" />
          <Input placeholder="Video URL" id="video-url" />
          <Button onClick={async () => {
            const title = document.getElementById('video-title').value; const url = document.getElementById('video-url').value;
            if (!selectedTopic || !url) { alert('⚠️ Fill all'); return; }
            await base44.entities.TrainingVideo.create({ task_name: selectedTopic, video_title: title || selectedTopic, video_url: url });
            queryClient.invalidateQueries({ queryKey: ['training-videos'] }); alert('✅ Added!');
          }} className="w-full bg-indigo-500">Add Video</Button>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {trainingVideos.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded">
                <div><p className="font-medium text-sm">{v.task_name}</p><p className="text-xs">{v.video_title}</p></div>
                <Button size="sm" variant="destructive" className="h-7" onClick={async () => { if (confirm('Delete?')) { await base44.entities.TrainingVideo.delete(v.id); queryClient.invalidateQueries({ queryKey: ['training-videos'] }); } }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

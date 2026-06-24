import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, AlertTriangle, Clock, Lock, CheckCircle, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TaskPreviewScreen({ taskName, reward, total, fields, previewItems, onStart, onBack }) {
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videos = await base44.entities.TrainingVideo.filter({ task_name: taskName });
        if (videos && videos.length > 0) setVideoUrl(videos[0].video_url);
      } catch (e) {}
    };
    fetchVideo();
  }, [taskName]);

  const openVideo = () => {
    if (!videoUrl) { alert("No demo video available for this task yet."); return; }
    const fileId = videoUrl.match(/\/file\/d\/([^/]+)/)?.[1];
    const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : videoUrl;
    const dialog = document.createElement('div');
    dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    dialog.innerHTML = `<div style="width:100%;max-width:900px;height:75vh;background:white;border-radius:12px;overflow:hidden;position:relative"><button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:20px">×</button><iframe src="${embedUrl}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
    document.body.appendChild(dialog);
    dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full border">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-purple-700">{taskName}</h1>
          <p className="text-xs text-gray-500">Review before starting</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Single Premium Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

          {/* Task Header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-600 px-6 py-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">📋</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">Task Preview</p>
                <h2 className="text-xl font-bold">{taskName}</h2>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Total Work</p>
                <p className="text-2xl font-black">{total}</p>
                <p className="text-xs text-white/70">items</p>
              </div>
            </div>
          </div>

          {/* Watch Demo */}
          <div className="px-6 pt-5">
            <button
              onClick={openVideo}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-md"
            >
              <Play className="w-5 h-5" />
              🎬 Watch Demo Video
            </button>
          </div>

          {/* Divider */}
          <div className="mx-6 my-5 border-t border-dashed border-gray-200" />

          {/* Instructions */}
          <div className="px-6 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Instructions
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Time Limit: 8 Hours</p>
                  <p className="text-xs text-gray-500">Countdown starts after clicking Start</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Minimum Accuracy: 95%</p>
                  <p className="text-xs text-gray-500">All entries will be verified</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Active Hours: 9:00 AM – 11:30 PM</p>
                  <p className="text-xs text-blue-600">Tasks unavailable outside these hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Lock className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Copy-Paste DISABLED</p>
                  <p className="text-xs text-red-600">You must type all entries manually</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 my-5 border-t border-dashed border-gray-200" />

          {/* Lock Warning */}
          <div className="mx-6">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <p className="text-sm font-bold text-amber-900">⚠️ Task Lock Warning</p>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Once you start the task, if you exit or navigate away — the task will be <strong>locked until tomorrow 9:00 AM</strong>. 
                You will not be able to restart it today.
              </p>
            </div>
          </div>

          {/* Sample Items Preview - show first 2 items if fields or previewItems provided */}
          {(fields && fields.length > 0) || (previewItems && previewItems.length > 0) ? (
            <>
              <div className="mx-6 my-5 border-t border-dashed border-gray-200" />
              <div className="px-6 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sample Items Preview</p>
                {previewItems && previewItems.length > 0 ? (
                  previewItems.map((item, idx) => (
                    <div key={item.id || idx} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className={`flex items-center gap-3 px-4 py-2.5 text-white font-semibold text-sm ${idx === 0 ? 'bg-gradient-to-r from-purple-600 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-teal-500'}`}>
                        <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span>Item #{idx + 1}</span>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-xs text-gray-600 mb-2">{item.label || 'Sample Item'}</p>
                        <p className="text-sm text-gray-700 italic leading-relaxed line-clamp-3">{item.text || item.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  [1, 2].map((itemNum) => (
                    <div key={itemNum} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className={`flex items-center gap-3 px-4 py-2.5 text-white font-semibold text-sm ${itemNum === 1 ? 'bg-gradient-to-r from-purple-600 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-teal-500'}`}>
                        <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{itemNum}</span>
                        <span>Item #{itemNum}</span>
                      </div>
                      <div className="p-3 bg-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {fields.slice(0, 6).map(([field, label]) => (
                            <div key={field}>
                              <p className="text-xs text-gray-500 mb-0.5">{label} *</p>
                              <div className="h-7 bg-gray-50 border border-gray-200 rounded-md px-2 flex items-center">
                                <p className="text-xs text-gray-400 italic">Type here...</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}

          {/* Admin Review Notice */}
          <div className="mx-6 mb-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800 leading-relaxed text-center font-medium">
                📋 After you complete and submit the task, it will be reviewed by the admin. You can perform the same task again only after it is approved by the admin.
              </p>
            </div>
          </div>

          {/* Start Button */}
          <div className="px-6 py-5">
            <Button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-base rounded-xl shadow-lg h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              I'm Starting The Task
            </Button>
            <p className="text-center text-xs text-gray-400 mt-2">⏰ 8-hour countdown begins immediately after clicking</p>
          </div>

        </div>
      </div>
    </div>
  );
}

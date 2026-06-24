import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Image, Play, Maximize, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function EarningProof() {
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [expandedVideos, setExpandedVideos] = useState({});
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "images"

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    placeholderData: []
  });

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
    }
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
      if (fileIdMatch) return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return url;
  };

  // Convert Drive share link → direct image URL for in-app display
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      // Try multiple Drive URL formats
      const m = url.match(/\/file\/d\/([^/?\s]+)/) || url.match(/[?&]id=([^&\s]+)/);
      if (m && m[1]) {
        // Use thumbnail endpoint which is more reliable for display
        return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
      }
    }
    return url;
  };

  // Parse videos from settings
  const earningProofSetting = globalSettings.filter(s => s.setting_key === 'earning_proof_videos');
  let videos = [];
  if (earningProofSetting.length > 0) {
    try {
      const d = earningProofSetting[0].setting_value;
      const parsed = typeof d === 'string' ? JSON.parse(d) : d;
      videos = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // Parse images from settings
  const earningProofImageSetting = globalSettings.filter(s => s.setting_key === 'earning_proof_images');
  let images = [];
  if (earningProofImageSetting.length > 0) {
    try {
      const d = earningProofImageSetting[0].setting_value;
      const parsed = typeof d === 'string' ? JSON.parse(d) : d;
      images = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  const gradients = [
    "from-green-500 to-emerald-600",
    "from-blue-500 to-cyan-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-teal-500 to-cyan-600"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            💰 Earning Proofs
          </h1>
          <p className="text-gray-600">See real earnings from our platform users</p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-white rounded-xl shadow p-1 mb-6 border border-gray-200">
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "videos" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Video className="w-4 h-4" /> Videos ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "images" ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Image className="w-4 h-4" /> Images ({images.length})
          </button>
        </div>

        {/* VIDEOS TAB */}
        {activeTab === "videos" && (
          <div>
            {videos.length === 0 ? (
              <Card className="shadow-xl border-2 border-green-200">
                <CardContent className="p-12 text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-bold text-gray-700 mb-2">No Videos Available</h2>
                  <p className="text-gray-500">Admin has not uploaded any earning proof videos yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {videos.map((video, i) => {
                  const isExpanded = expandedVideos[i];
                  const gradient = gradients[i % gradients.length];
                  return (
                    <Card key={i} className="shadow-xl border-2 border-green-200 overflow-hidden">
                      <CardHeader
                        className={`bg-gradient-to-r ${gradient} text-white cursor-pointer`}
                        onClick={() => setExpandedVideos(prev => ({ ...prev, [i]: !prev[i] }))}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            {video.title || `Earning Proof Video ${i + 1}`}
                          </CardTitle>
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                        {video.description && <p className="text-sm opacity-90 mt-1">{video.description}</p>}
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="p-0">
                          <div className="relative aspect-video bg-black">
                            <iframe
                              src={getEmbedUrl(video.url)}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              allowFullScreen
                              title={video.title || `Earning Proof ${i + 1}`}
                            ></iframe>
                            <Button
                              onClick={() => setFullscreenVideo(video)}
                              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 border border-white/30"
                              size="icon"
                            >
                              <Maximize className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === "images" && (
          <div>
            {images.length === 0 ? (
              <Card className="shadow-xl border-2 border-blue-200">
                <CardContent className="p-12 text-center">
                  <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-bold text-gray-700 mb-2">No Images Available</h2>
                  <p className="text-gray-500">Admin has not uploaded any earning proof images yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <Card key={i} className="shadow-xl border-2 border-blue-200 overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => setFullscreenImage(img)}>
                    <div className={`bg-gradient-to-r ${gradients[i % gradients.length]} p-3 text-white`}>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        {img.title || `Payment Proof ${i + 1}`}
                      </p>
                    </div>
                    <CardContent className="p-2">
                      <div className="relative bg-gray-100 rounded overflow-hidden">
                        <img
                          src={getImageUrl(img.url)}
                          alt={img.title || `Earning proof ${i + 1}`}
                          className="w-full object-contain max-h-64"
                          onError={(e) => {
                           // Fallback: try uc?export=view if thumbnail fails
                           const origUrl = images[i]?.url || '';
                           const m = origUrl.match(/\/file\/d\/([^/?\s]+)/) || origUrl.match(/[?&]id=([^&\s]+)/);
                           if (m && m[1] && !e.target.src.includes('uc?export')) {
                             e.target.src = `https://drive.google.com/uc?export=view&id=${m[1]}`;
                           } else {
                             e.target.style.display = 'none';
                             e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-40 text-gray-400 text-sm">⚠️ Image unavailable. Check sharing settings.</div>';
                           }
                         }}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                          <div className="opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">Click to Expand</div>
                          </div>
                        </div>
                      </div>
                      {img.description && <p className="text-xs text-gray-500 mt-2 px-1">{img.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="mt-6 shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge className="bg-green-600 text-white px-4 py-2">✓ Verified Payments</Badge>
              <Badge className="bg-blue-600 text-white px-4 py-2">💳 Daily Payouts</Badge>
              <Badge className="bg-purple-600 text-white px-4 py-2">🌟 Real Users</Badge>
            </div>
            <p className="text-gray-700">Real payment proofs from WorkDen users who have successfully completed tasks and received their earnings.</p>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Video */}
      <Dialog open={!!fullscreenVideo} onOpenChange={() => setFullscreenVideo(null)}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          {fullscreenVideo && (
            <div className="w-full h-full">
              <iframe src={getEmbedUrl(fullscreenVideo.url)} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen title={fullscreenVideo.title || 'Earning Proof'}></iframe>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-4xl w-full p-2">
          {fullscreenImage && (
            <div className="text-center">
              <p className="font-bold text-lg mb-3">{fullscreenImage.title || 'Payment Proof'}</p>
              <img
                 src={getImageUrl(fullscreenImage.url)}
                 alt={fullscreenImage.title || 'Earning proof'}
                 className="w-full max-h-[80vh] object-contain rounded-lg"
                 onError={(e) => {
                   const m = fullscreenImage.url?.match(/\/file\/d\/([^/?\s]+)/) || fullscreenImage.url?.match(/[?&]id=([^&\s]+)/);
                   if (m && m[1] && !e.target.src.includes('uc?export')) {
                     e.target.src = `https://drive.google.com/uc?export=view&id=${m[1]}`;
                   }
                 }}
              />
              {fullscreenImage.description && <p className="text-sm text-gray-500 mt-3">{fullscreenImage.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

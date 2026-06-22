import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Lock, 
  ExternalLink, 
  BookOpen,
  Award,
  Video,
  Play,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Radio
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TrainingModule() {
  const [user, setUser] = useState(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loadingVideos, setLoadingVideos] = useState({});
  const [activeTab, setActiveTab] = useState("recorded");

  useEffect(() => {
    loadUser();
  }, []);

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleVideoLoad = (videoId) => {
    setLoadingVideos(prev => ({ ...prev, [videoId]: false }));
  };

  const loadUser = async () => {
    try {
      const userSource = localStorage.getItem('workden_user_source');
      const savedUserId = localStorage.getItem('workden_login_id');
      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) { setUser(appUsers[0]); return; }
      }
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) { setUser(JSON.parse(savedUser)); return; }
      setUser(await base44.auth.me());
    } catch (error) {
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  };

  const { data: trainingVideos = [] } = useQuery({
    queryKey: ['training-videos'],
    queryFn: () => base44.entities.TrainingVideo.list('order'),
    initialData: [],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
    initialData: [],
  });

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    initialData: [],
  });

  const videosByTask = {};
  const otherTopics = [];
  const taskNames = tasks.map(t => t.name);
  
  trainingVideos.forEach(video => {
    if (!videosByTask[video.task_name]) videosByTask[video.task_name] = [];
    videosByTask[video.task_name].push(video);
    if (!taskNames.includes(video.task_name) && !otherTopics.includes(video.task_name)) {
      otherTopics.push(video.task_name);
    }
  });
  
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
    }
    return null;
  };

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
  ];

  if (user && !user.training_access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Training Module
              </h1>
            </div>
            <p className="text-gray-600">Learn how to complete tasks effectively</p>
          </div>
          <Card className="shadow-2xl border-2 border-gray-300 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-8 text-white text-center">
              <Lock className="w-20 h-20 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Training Access Locked</h2>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-lg mb-4">Get access to training videos for all tasks:</p>
              </div>
              <div className="space-y-3 mb-6">
                {tasks.slice(0, 5).map((task, index) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center`}>
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{task.name}</p>
                      <p className="text-xs text-gray-500">Training video</p>
                    </div>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">🔒 Contact Admin for Access</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const liveWebinarUrl = globalSettings.find(s => s.setting_key === 'live_webinar_video')?.setting_value || "";
  const liveEmbedUrl = getEmbedUrl(liveWebinarUrl);

  const renderVideoItem = (video, index, sectionKey, gradient) => {
    const embedUrl = getEmbedUrl(video.video_url);
    const isExpanded = expandedSections[sectionKey];
    const isLoading = loadingVideos[video.id];

    return (
      <div key={video.id} className="bg-white">
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
            <Play className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{video.video_title || `Video ${index + 1}`}</p>
            <p className="text-xs text-gray-500">Click to {isExpanded ? 'collapse' : 'watch'}</p>
          </div>
          <div className="flex items-center gap-2">
            {embedUrl && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={(e) => { e.stopPropagation(); setFullscreenVideo({ url: embedUrl, title: video.video_title }); }}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
        {isExpanded && (
          <div className="px-4 pb-4">
            {embedUrl ? (
              <div className="relative rounded-xl overflow-hidden shadow-lg bg-black">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
                <div className="aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={video.video_title || 'Training Video'}
                    loading="lazy"
                    onLoad={() => handleVideoLoad(video.id)}
                  />
                </div>
              </div>
            ) : (
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-colors border-2 border-dashed border-blue-200"
              >
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <p className="text-blue-600 font-medium">Open Video in New Tab</p>
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Training Module
            </h1>
          </div>
          <p className="text-gray-600">Learn how to complete tasks effectively</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("recorded")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === "recorded" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300"}`}
          >
            <BookOpen className="w-4 h-4" />
            📁 Recorded Videos
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === "live" ? "bg-red-600 text-white shadow-lg" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-red-300"}`}
          >
            <Radio className="w-4 h-4" />
            🔴 Live Webinar
          </button>
        </div>

        {/* Live Webinar Tab */}
        {activeTab === "live" && (
          <div>
            {liveEmbedUrl ? (
              <Card className="shadow-xl overflow-hidden border-2 border-red-200">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4 text-white flex items-center gap-3">
                  <Radio className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-lg">🔴 Live Webinar</h3>
                    <p className="text-sm opacity-80">Watch the live session below</p>
                  </div>
                </div>
                <div className="aspect-video w-full bg-black">
                  <iframe src={liveEmbedUrl} className="w-full h-full" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen title="Live Webinar" />
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center border-2 border-red-200">
                <Radio className="w-16 h-16 mx-auto mb-4 text-red-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Live Webinar</h3>
                <p className="text-gray-500">Admin will add the live webinar link soon.</p>
              </Card>
            )}
          </div>
        )}

        {/* Recorded Videos Tab */}
        {activeTab === "recorded" && (
          <div className="space-y-4">
            {tasks.map((task, taskIndex) => {
              const taskVideos = videosByTask[task.name] || [];
              const gradient = gradients[taskIndex % gradients.length];
              return (
                <Card key={task.id} className="shadow-lg border-2 border-gray-200 overflow-hidden">
                  <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{task.name}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    {taskVideos.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {taskVideos.map((video, index) =>
                          renderVideoItem(video, index, `${task.id}_${video.id}`, gradient)
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">No training video added yet</p>
                        <p className="text-xs text-gray-400">Admin will add videos soon</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {otherTopics.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  General Training Videos
                </h2>
                <div className="space-y-4">
                  {otherTopics.map((topic, topicIndex) => {
                    const topicVideos = videosByTask[topic] || [];
                    const gradient = gradients[(topicIndex + tasks.length) % gradients.length];
                    return (
                      <Card key={topic} className="shadow-lg border-2 border-purple-200 overflow-hidden">
                        <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                              <Award className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{topic}</h3>
                              <p className="text-sm opacity-90">{topicVideos.length} video(s)</p>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-0">
                          <div className="divide-y divide-gray-100">
                            {topicVideos.map((video, index) =>
                              renderVideoItem(video, index, `topic_${topic}_${video.id}`, gradient)
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {tasks.length === 0 && otherTopics.length === 0 && (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Training Videos Available</h3>
                <p className="text-gray-500">Training videos will appear here once added by admin.</p>
              </Card>
            )}
          </div>
        )}

        {/* Training Benefits */}
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-purple-900 mb-2">🎓 Why Complete Training?</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Learn the correct way to complete each task type</li>
              <li>• Understand submission guidelines and requirements</li>
              <li>• Avoid rejections by following proper procedures</li>
              <li>• Increase your approval rate and earnings</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Video Modal */}
      <Dialog open={!!fullscreenVideo} onOpenChange={() => setFullscreenVideo(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 bg-black border-none">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setFullscreenVideo(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            {fullscreenVideo?.title && (
              <div className="absolute top-2 left-2 z-50 bg-black/50 px-3 py-1 rounded-full">
                <p className="text-white text-sm font-medium">{fullscreenVideo.title}</p>
              </div>
            )}
            <div className="aspect-video w-full">
              <iframe
                src={fullscreenVideo?.url}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={fullscreenVideo?.title || 'Training Video'}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
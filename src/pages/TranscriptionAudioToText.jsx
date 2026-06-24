import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Save, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import TaskTimer from "../components/TaskTimer";

export default function TranscriptionAudioToText() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime] = useState(new Date());
  const [transcriptions, setTranscriptions] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const audioClips = [
    {
      id: 1,
      title: "Business Meeting Discussion",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      description: "Listen and transcribe this business meeting audio"
    },
    {
      id: 2,
      title: "Customer Service Call",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      description: "Transcribe this customer service conversation"
    },
    {
      id: 3,
      title: "Interview Recording",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      description: "Listen and type out this interview"
    },
    {
      id: 4,
      title: "Podcast Episode",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      description: "Transcribe this podcast audio clip"
    },
    {
      id: 5,
      title: "Training Session",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      description: "Type out this training session recording"
    }
  ];

  const handlePlayPause = (audioId) => {
    const audio = audioRefs.current[audioId];
    if (!audio) return;

    if (currentPlaying === audioId) {
      audio.pause();
      setCurrentPlaying(null);
    } else {
      Object.values(audioRefs.current).forEach(a => a?.pause());
      audio.play().catch(err => console.error("Audio play error:", err));
      setCurrentPlaying(audioId);
    }
  };

  const handleAutoSubmit = async () => {
    if (transcriptions.length === 0) return;

    try {
      const csvContent = generateCSV();
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      await base44.entities.Proof.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_id_number: user.user_id,
        work_type: "Transcription",
        task_content: `Total Transcriptions: ${transcriptions.length}`,
        csv_data: csvContent,
        status: "pending",
        submitted_date: new Date().toISOString(),
        reward_amount: 400,
        duration_seconds: durationSeconds,
        auto_submitted: true,
      });

      alert("⏰ Time's up! Your work has been auto-submitted.");
      navigate(createPageUrl("SubmittedWork"));
    } catch (error) {
      console.error("Error auto-submitting:", error);
    }
  };

  const handleSave = (clip, transcription) => {
    if (!transcription || transcription.trim().split(/\s+/).length < 50) {
      alert("Transcription must be at least 50 words!");
      return;
    }

    const newTranscription = {
      clipId: clip.id,
      title: clip.title,
      transcription: transcription,
      wordCount: transcription.split(/\s+/).length,
      savedAt: new Date().toISOString()
    };

    setTranscriptions(prev => [...prev, newTranscription]);
    alert(`Transcription for "${clip.title}" saved!`);
    
    const textarea = document.getElementById(`transcription-${clip.id}`);
    if (textarea) textarea.value = '';
  };

  const handleSubmit = async () => {
    if (transcriptions.length === 0) {
      alert("Please save at least one transcription!");
      return;
    }

    try {
      const csvContent = generateCSV();
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      await base44.entities.Proof.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_id_number: user.user_id,
        work_type: "Transcription",
        task_content: `Total Transcriptions: ${transcriptions.length}`,
        csv_data: csvContent,
        status: "pending",
        submitted_date: new Date().toISOString(),
        reward_amount: 400,
        duration_seconds: durationSeconds,
        auto_submitted: false,
      });

      alert(`✅ ${transcriptions.length} transcriptions submitted! Payment: ₹400`);
      navigate(createPageUrl("SubmittedWork"));
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit.");
    }
  };

  const generateCSV = () => {
    let csv = 'No,Audio Title,Word Count,Transcription,Saved At\n';
    transcriptions.forEach((trans, index) => {
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
      csv += `${index + 1},${escapeCsv(trans.title)},${trans.wordCount},${escapeCsv(trans.transcription)},${escapeCsv(trans.savedAt)}\n`;
    });
    return csv;
  };

  const downloadCSV = () => {
    if (transcriptions.length === 0) {
      alert("No transcriptions saved yet!");
      return;
    }

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl mb-6 shadow-lg sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Tasks"))}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Audio to Text Transcription</h1>
              <p className="text-purple-100">Listen to audio and type what you hear (Min 50 words)</p>
              <p className="text-purple-100 mt-1">Saved: {transcriptions.length} | Payment: ₹400</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadCSV}
                variant="secondary"
                className="bg-white text-purple-600"
                disabled={transcriptions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={handleSubmit}
                variant="secondary"
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={transcriptions.length === 0}
              >
                Submit All ({transcriptions.length})
              </Button>
            </div>
          </div>
          <TaskTimer startTime={startTime} onTimeout={handleAutoSubmit} />
        </div>

        <div className="space-y-6">
          {audioClips.map((clip) => (
            <Card key={clip.id}>
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-purple-900">#{clip.id} - {clip.title}</span>
                  <Button
                    onClick={() => handlePlayPause(clip.id)}
                    variant="outline"
                    size="sm"
                  >
                    {currentPlaying === clip.id ? (
                      <><Pause className="w-4 h-4 mr-2" /> Pause</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> Play</>
                    )}
                  </Button>
                </CardTitle>
                <p className="text-sm text-purple-700">{clip.description}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <audio
                  ref={(el) => audioRefs.current[clip.id] = el}
                  src={clip.audioUrl}
                  onEnded={() => setCurrentPlaying(null)}
                  className="w-full mb-4"
                  controls
                />
                <Textarea
                  id={`transcription-${clip.id}`}
                  placeholder="Type what you hear... (Min 50 words)"
                  className="min-h-[120px] mb-3"
                  rows={6}
                />
                <Button
                  onClick={() => {
                    const textarea = document.getElementById(`transcription-${clip.id}`);
                    handleSave(clip, textarea.value);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Transcription #{clip.id}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

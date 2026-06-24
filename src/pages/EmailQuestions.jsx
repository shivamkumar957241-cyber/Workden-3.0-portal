import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import TaskTimer from "../components/TaskTimer";

export default function EmailQuestions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime] = useState(new Date());
  const [savedAnswers, setSavedAnswers] = useState([]);

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

  const questions = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    question: `Email Question ${i + 1}: How would you professionally handle ${['customer complaints', 'delivery delays', 'refund requests', 'product inquiries', 'billing issues'][i % 5]}?`,
  }));

  const handleSave = (questionId, answer) => {
    if (!answer || answer.trim().length < 30) {
      alert("Answer must be at least 30 characters!");
      return;
    }

    const question = questions.find(q => q.id === questionId);
    const newAnswer = {
      questionId,
      question: question.question,
      answer,
      savedAt: new Date().toISOString()
    };

    setSavedAnswers(prev => [...prev, newAnswer]);
    alert(`Answer ${questionId} saved!`);
    
    const textarea = document.getElementById(`answer-${questionId}`);
    if (textarea) textarea.value = '';
  };

  const handleAutoSubmit = async () => {
    if (savedAnswers.length === 0) return;

    try {
      const csvContent = generateCSV();
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      await base44.entities.Proof.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_id_number: user.user_id,
        work_type: "Email Questions",
        task_content: `Total Answers: ${savedAnswers.length}`,
        csv_data: csvContent,
        status: "pending",
        submitted_date: new Date().toISOString(),
        reward_amount: 300,
        duration_seconds: durationSeconds,
        auto_submitted: true,
      });

      alert("⏰ Time's up! Your work has been auto-submitted.");
      navigate(createPageUrl("SubmittedWork"));
    } catch (error) {
      console.error("Error auto-submitting:", error);
    }
  };

  const handleSubmit = async () => {
    if (savedAnswers.length === 0) {
      alert("Please save at least one answer!");
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
        work_type: "Email Questions",
        task_content: `Total Answers: ${savedAnswers.length}`,
        csv_data: csvContent,
        status: "pending",
        submitted_date: new Date().toISOString(),
        reward_amount: 300,
        duration_seconds: durationSeconds,
        auto_submitted: false,
      });

      alert(`✅ ${savedAnswers.length} answers submitted! Payment: ₹300`);
      navigate(createPageUrl("SubmittedWork"));
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit.");
    }
  };

  const generateCSV = () => {
    let csv = 'No,Question,Answer,Saved At\n';
    savedAnswers.forEach((item, index) => {
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
      csv += `${index + 1},${escapeCsv(item.question)},${escapeCsv(item.answer)},${escapeCsv(item.savedAt)}\n`;
    });
    return csv;
  };

  const downloadCSV = () => {
    if (savedAnswers.length === 0) {
      alert("No answers saved yet!");
      return;
    }

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-questions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl mb-6 shadow-lg sticky top-0 z-10">
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
              <h1 className="text-3xl font-bold mb-2">1000 Email Questions</h1>
              <p className="text-blue-100">Answer professional email questions</p>
              <p className="text-blue-100 mt-1">Saved: {savedAnswers.length} | Payment: ₹300</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadCSV}
                variant="secondary"
                className="bg-white text-blue-600"
                disabled={savedAnswers.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={handleSubmit}
                variant="secondary"
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={savedAnswers.length === 0}
              >
                Submit All ({savedAnswers.length})
              </Button>
            </div>
          </div>
          <TaskTimer startTime={startTime} onTimeout={handleAutoSubmit} />
        </div>

        <div className="space-y-6">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <CardTitle className="text-blue-900">Question #{q.id}</CardTitle>
                <p className="text-sm text-slate-700">{q.question}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  id={`answer-${q.id}`}
                  placeholder="Type your professional answer here... (Min 30 characters)"
                  className="min-h-[100px] mb-3"
                  rows={4}
                />
                <Button
                  onClick={() => {
                    const textarea = document.getElementById(`answer-${q.id}`);
                    handleSave(q.id, textarea.value);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Answer #{q.id}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

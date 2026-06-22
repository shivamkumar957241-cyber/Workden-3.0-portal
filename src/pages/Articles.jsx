
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Save, FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function Articles() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5 * 60 * 60); // Changed from 4 to 5 hours
  const [savedArticles, setSavedArticles] = useState([]);

  const TASK_DURATION = 5 * 60 * 60; // 5 hours - Changed from 4 to 5 hours

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

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      const remaining = Math.max(0, TASK_DURATION - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, TASK_DURATION]); // Added TASK_DURATION to dependency array for completeness

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTopics = () => {
    const allTopics = [
      { id: 1, title: "AI Ethics in Healthcare Decisions", category: "Technology" },
      { id: 2, title: "Blockchain Beyond Cryptocurrency", category: "Technology" },
      { id: 3, title: "5G Network Security Challenges", category: "Technology" },
      { id: 4, title: "Cloud Computing Cost Optimization", category: "Technology" },
      { id: 5, title: "IoT Devices in Smart Homes", category: "Technology" },
      { id: 6, title: "Quantum Computing Applications", category: "Technology" },
      { id: 7, title: "Cybersecurity Best Practices", category: "Technology" },
      { id: 8, title: "Machine Learning in Finance", category: "Technology" },
      { id: 9, title: "Virtual Reality Training Programs", category: "Technology" },
      { id: 10, title: "Edge Computing Benefits", category: "Technology" },
      { id: 11, title: "Mental Health First Aid", category: "Health" },
      { id: 12, title: "Plant-Based Diet Benefits", category: "Health" },
      { id: 13, title: "Yoga for Stress Relief", category: "Health" },
      { id: 14, title: "Sleep Hygiene Importance", category: "Health" },
      { id: 15, title: "Meditation Techniques Guide", category: "Health" },
      { id: 16, title: "Heart Disease Prevention", category: "Health" },
      { id: 17, title: "Diabetes Management Tips", category: "Health" },
      { id: 18, title: "Cancer Screening Awareness", category: "Health" },
      { id: 19, title: "Fitness After Forty", category: "Health" },
      { id: 20, title: "Nutrition Myths Debunked", category: "Health" },
      { id: 21, title: "Startup Funding Strategies", category: "Business" },
      { id: 22, title: "E-commerce Growth Tactics", category: "Business" },
      { id: 23, title: "Digital Marketing ROI", category: "Business" },
      { id: 24, title: "Leadership in Crisis", category: "Business" },
      { id: 25, title: "Business Analytics Tools", category: "Business" },
      { id: 26, title: "Supply Chain Optimization", category: "Business" },
      { id: 27, title: "Corporate Culture Building", category: "Business" },
      { id: 28, title: "Customer Retention Strategies", category: "Business" },
      { id: 29, title: "Sales Funnel Optimization", category: "Business" },
      { id: 30, title: "Franchise Success Factors", category: "Business" },
      { id: 31, title: "Online Learning Platforms", category: "Education" },
      { id: 32, title: "STEM Education Importance", category: "Education" },
      { id: 33, title: "Early Childhood Development", category: "Education" },
      { id: 34, title: "Special Education Strategies", category: "Education" },
      { id: 35, title: "Educational Technology Trends", category: "Education" },
      { id: 36, title: "Teacher Professional Development", category: "Education" },
      { id: 37, title: "Curriculum Design Principles", category: "Education" },
      { id: 38, title: "Student Assessment Methods", category: "Education" },
      { id: 39, title: "Lifelong Learning Benefits", category: "Education" },
      { id: 40, title: "Educational Psychology Basics", category: "Education" },
      { id: 41, title: "Solar Energy Adoption", category: "Environment" },
      { id: 42, title: "Climate Action Urgency", category: "Environment" },
      { id: 43, title: "Wildlife Conservation Efforts", category: "Environment" },
      { id: 44, title: "Ocean Plastic Pollution", category: "Environment" },
      { id: 45, title: "Sustainable Farming Practices", category: "Environment" },
      { id: 46, title: "Deforestation Global Impact", category: "Environment" },
      { id: 47, title: "Green Building Standards", category: "Environment" },
      { id: 48, title: "Zero Waste Lifestyle", category: "Environment" },
      { id: 49, title: "Carbon Footprint Reduction", category: "Environment" },
      { id: 50, title: "Eco-Tourism Development", category: "Environment" },
      { id: 51, title: "Stock Market Investment Basics", category: "Finance" },
      { id: 52, title: "Retirement Planning Guide", category: "Finance" },
      { id: 53, title: "Cryptocurrency Trading Tips", category: "Finance" },
      { id: 54, title: "Personal Budget Creation", category: "Finance" },
      { id: 55, title: "Tax Planning Strategies", category: "Finance" },
      { id: 56, title: "Real Estate Investment", category: "Finance" },
      { id: 57, title: "Emergency Fund Importance", category: "Finance" },
      { id: 58, title: "Insurance Coverage Guide", category: "Finance" },
      { id: 59, title: "Credit Score Improvement", category: "Finance" },
      { id: 60, title: "Financial Independence Path", category: "Finance" },
      { id: 61, title: "Minimalist Living Benefits", category: "Lifestyle" },
      { id: 62, title: "Work-Life Balance Tips", category: "Lifestyle" },
      { id: 63, title: "Budget Travel Hacks", category: "Lifestyle" },
      { id: 64, title: "Home Organization Systems", category: "Lifestyle" },
      { id: 65, title: "Self-Care Daily Routine", category: "Lifestyle" },
      { id: 66, title: "Hobbies for Mental Health", category: "Lifestyle" },
      { id: 67, title: "Sustainable Fashion Choices", category: "Lifestyle" },
      { id: 68, title: "Interior Design Trends", category: "Lifestyle" },
      { id: 69, title: "Pet Care Essentials", category: "Lifestyle" },
      { id: 70, title: "Cooking Skills Development", category: "Lifestyle" },
      { id: 71, title: "Mars Exploration Progress", category: "Science" },
      { id: 72, title: "CRISPR Gene Editing", category: "Science" },
      { id: 73, title: "Particle Physics Discoveries", category: "Science" },
      { id: 74, title: "Marine Ecosystem Study", category: "Science" },
      { id: 75, title: "Astronomical Breakthroughs", category: "Science" },
      { id: 76, title: "Nanotechnology Applications", category: "Science" },
      { id: 77, title: "Robotics in Manufacturing", category: "Science" },
      { id: 78, title: "Environmental Science Research", category: "Science" },
      { id: 79, title: "Chemistry in Daily Life", category: "Science" },
      { id: 80, title: "Paleontology Recent Finds", category: "Science" },
      { id: 81, title: "Photography Composition Tips", category: "Arts" },
      { id: 82, title: "Music Theory Fundamentals", category: "Arts" },
      { id: 83, title: "Creative Writing Techniques", category: "Arts" },
      { id: 84, title: "Digital Art Software Guide", category: "Arts" },
      { id: 85, title: "Filmmaking Process Overview", category: "Arts" },
      { id: 86, title: "Theater Performance Skills", category: "Arts" },
      { id: 87, title: "Sculpture Material Selection", category: "Arts" },
      { id: 88, title: "Classical Dance Forms", category: "Arts" },
      { id: 89, title: "Graphic Design Principles", category: "Arts" },
      { id: 90, title: "Art History Movements", category: "Arts" },
      { id: 91, title: "Marathon Training Plan", category: "Sports" },
      { id: 92, title: "Cricket Batting Techniques", category: "Sports" },
      { id: 93, title: "Football Tactical Strategies", category: "Sports" },
      { id: 94, title: "Basketball Shooting Form", category: "Sports" },
      { id: 95, title: "Swimming Stroke Improvement", category: "Sports" },
      { id: 96, title: "Yoga Poses for Beginners", category: "Sports" },
      { id: 97, title: "Cycling Safety Guidelines", category: "Sports" },
      { id: 98, title: "Tennis Serve Mastery", category: "Sports" },
      { id: 99, title: "Boxing Fitness Training", category: "Sports" },
      { id: 100, title: "Sports Nutrition Essentials", category: "Sports" },
      { id: 101, title: "Cognitive Behavioral Therapy", category: "Psychology" },
      { id: 102, title: "Child Development Stages", category: "Psychology" },
      { id: 103, title: "Social Influence Mechanisms", category: "Psychology" },
      { id: 104, title: "Positive Psychology Practices", category: "Psychology" },
      { id: 105, title: "Brain Neuroplasticity", category: "Psychology" },
      { id: 106, title: "Behavioral Economics Insights", category: "Psychology" },
      { id: 107, title: "Emotional Intelligence Skills", category: "Psychology" },
      { id: 108, title: "Memory Enhancement Methods", category: "Psychology" },
      { id: 109, title: "Motivation Theory Application", category: "Psychology" },
      { id: 110, title: "Personality Assessment Tools", category: "Psychology" },
      { id: 111, title: "Solo Travel Safety Tips", category: "Travel" },
      { id: 112, title: "Backpacking on Budget", category: "Travel" },
      { id: 113, title: "Cultural Tourism Etiquette", category: "Travel" },
      { id: 114, title: "Adventure Sports Destinations", category: "Travel" },
      { id: 115, title: "Visa Application Process", category: "Travel" },
      { id: 116, title: "Travel Photography Guide", category: "Travel" },
      { id: 117, title: "Food Tourism Experiences", category: "Travel" },
      { id: 118, title: "Sustainable Travel Choices", category: "Travel" },
      { id: 119, title: "Travel Insurance Comparison", category: "Travel" },
      { id: 120, title: "Digital Nomad Lifestyle", category: "Travel" },
      { id: 121, title: "Mediterranean Diet Recipes", category: "Food" },
      { id: 122, title: "Vegan Protein Sources", category: "Food" },
      { id: 123, title: "Baking Science Explained", category: "Food" },
      { id: 124, title: "Food Preservation Methods", category: "Food" },
      { id: 125, title: "Asian Cuisine Essentials", category: "Food" },
      { id: 126, title: "Weekly Meal Planning", category: "Food" },
      { id: 127, title: "Food Safety Standards", category: "Food" },
      { id: 128, title: "Restaurant Management Tips", category: "Food" },
      { id: 129, title: "Organic Farming Benefits", category: "Food" },
      { id: 130, title: "Culinary Arts Career Path", category: "Food" },
      { id: 131, title: "Resume Writing Strategies", category: "Career" },
      { id: 132, title: "Job Interview Preparation", category: "Career" },
      { id: 133, title: "Career Change Planning", category: "Career" },
      { id: 134, title: "Remote Work Productivity", category: "Career" },
      { id: 135, title: "Professional Networking", category: "Career" },
      { id: 136, title: "Skill Development Paths", category: "Career" },
      { id: 137, title: "Entrepreneurship Mindset", category: "Career" },
      { id: 138, title: "Freelancing Success Tips", category: "Career" },
      { id: 139, title: "Job Search Effectiveness", category: "Career" },
      { id: 140, title: "Workplace Productivity Hacks", category: "Career" },
      { id: 141, title: "Effective Communication", category: "Relationships" },
      { id: 142, title: "Conflict Resolution Skills", category: "Relationships" },
      { id: 143, title: "Positive Parenting Methods", category: "Relationships" },
      { id: 144, title: "Marriage Counseling Benefits", category: "Relationships" },
      { id: 145, title: "Building Strong Friendships", category: "Relationships" },
      { id: 146, title: "Modern Dating Advice", category: "Relationships" },
      { id: 147, title: "Family Dynamics Understanding", category: "Relationships" },
      { id: 148, title: "Social Skills Development", category: "Relationships" },
      { id: 149, title: "Trust Building Techniques", category: "Relationships" },
      { id: 150, title: "Emotional Support Provision", category: "Relationships" },
      { id: 151, title: "Ancient Egyptian Civilization", category: "History" },
      { id: 152, title: "World War Impact Analysis", category: "History" },
      { id: 153, title: "Renaissance Art Movement", category: "History" },
      { id: 154, title: "Industrial Revolution Effects", category: "History" },
      { id: 155, title: "Cultural Revolution China", category: "History" },
      { id: 156, title: "Historical Leadership Lessons", category: "History" },
      { id: 157, title: "Archaeological Discovery Methods", category: "History" },
      { id: 158, title: "Medieval Europe Society", category: "History" },
      { id: 159, title: "Modern History Timeline", category: "History" },
      { id: 160, title: "Significant Historical Events", category: "History" },
      { id: 161, title: "Democracy Principles Explained", category: "Politics" },
      { id: 162, title: "Government Systems Comparison", category: "Politics" },
      { id: 163, title: "International Relations Dynamics", category: "Politics" },
      { id: 164, title: "Political Ideologies Overview", category: "Politics" },
      { id: 165, title: "Voting Rights History", category: "Politics" },
      { id: 166, title: "Public Policy Development", category: "Politics" },
      { id: 167, title: "Diplomatic Negotiation Skills", category: "Politics" },
      { id: 168, title: "Political Campaign Strategies", category: "Politics" },
      { id: 169, title: "Governance Best Practices", category: "Politics" },
      { id: 170, title: "Constitutional Law Basics", category: "Politics" },
      { id: 171, title: "Social Media Influence", category: "Media" },
      { id: 172, title: "Journalism Ethics Standards", category: "Media" },
      { id: 173, title: "Content Creation Strategy", category: "Media" },
      { id: 174, title: "Digital Marketing Channels", category: "Media" },
      { id: 175, title: "Broadcasting Technology", category: "Media" },
      { id: 176, title: "Film Industry Economics", category: "Media" },
      { id: 177, title: "Advertising Psychology", category: "Media" },
      { id: 178, title: "Public Relations Tactics", category: "Media" },
      { id: 179, title: "Media Literacy Education", category: "Media" },
      { id: 180, title: "News Reporting Standards", category: "Media" },
      { id: 181, title: "Human Rights Protection", category: "Law" },
      { id: 182, title: "Criminal Justice System", category: "Law" },
      { id: 183, title: "Civil Litigation Process", category: "Law" },
      { id: 184, title: "Intellectual Property Rights", category: "Law" },
      { id: 185, title: "Contract Law Essentials", category: "Law" },
      { id: 186, title: "Family Law Matters", category: "Law" },
      { id: 187, title: "Legal System Structure", category: "Law" },
      { id: 188, title: "Environmental Law Policies", category: "Law" },
      { id: 189, title: "Corporate Law Compliance", category: "Law" },
      { id: 190, title: "Constitutional Rights Guide", category: "Law" },
      { id: 191, title: "Existentialism Philosophy", category: "Philosophy" },
      { id: 192, title: "Ethics and Morality Debates", category: "Philosophy" },
      { id: 193, title: "Logic and Critical Thinking", category: "Philosophy" },
      { id: 194, title: "Metaphysics Exploration", category: "Philosophy" },
      { id: 195, title: "Political Philosophy Ideas", category: "Philosophy" },
      { id: 196, title: "Philosophy of Mind", category: "Philosophy" },
      { id: 197, title: "Ancient Greek Philosophers", category: "Philosophy" },
      { id: 198, title: "Modern Philosophy Trends", category: "Philosophy" },
      { id: 199, title: "Eastern Philosophy Wisdom", category: "Philosophy" },
      { id: 200, title: "Philosophy of Science", category: "Philosophy" }
    ];

    return allTopics;
  };

  const topics = generateTopics();

  const handleSave = (article) => {
    if (!article.content || article.content.trim().split(/\s+/).length < 100) {
      alert("Article must be at least 100 words!");
      return;
    }

    const newArticle = {
      title: article.title,
      topic: article.topic,
      category: article.category,
      content: article.content,
      wordCount: article.content.split(/\s+/).length,
      savedAt: new Date().toISOString()
    };

    setSavedArticles(prev => [...prev, newArticle]);
    alert(`Article "${article.title}" saved!\n\n💡 Complete all articles, download CSV, then submit via Menu → "Submit Your Work"`);
    
    const textarea = document.getElementById(`article-${article.index}`);
    if (textarea) textarea.value = '';
  };

  const generateCSV = () => {
    let csv = 'No,Category,Topic,Word Count,Content,Saved At\n';
    savedArticles.forEach((article, index) => {
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
      csv += `${index + 1},${escapeCsv(article.category)},${escapeCsv(article.title)},${article.wordCount},${escapeCsv(article.content)},${escapeCsv(article.savedAt)}\n`;
    });
    return csv;
  };

  const downloadCSV = () => {
    if (savedArticles.length === 0) {
      alert("No articles saved yet!");
      return;
    }

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `articles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`✅ CSV Downloaded!\n\n📤 Submit via Menu (☰) → "Submit Your Work"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 text-white p-6 rounded-2xl mb-6 shadow-2xl sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Tasks"))}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Article Writing</h1>
                <p className="text-rose-100 text-sm">200 Unique Topics • Payment: ₹300</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
              <p className="text-xs text-rose-100">Saved</p>
              <p className="text-2xl font-bold">{savedArticles.length}/200</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
              <Clock className="w-6 h-6 text-rose-200" />
              <div>
                <p className="text-xs text-rose-200">Time Elapsed</p>
                <p className="text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 backdrop-blur rounded-xl ${remainingTime < 1800 ? 'bg-red-500/30' : 'bg-white/10'}`}>
              <Clock className="w-6 h-6 text-orange-200" />
              <div>
                <p className="text-xs text-orange-200">Time Remaining</p>
                <p className="text-xl font-bold text-white">{formatTime(remainingTime)}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={downloadCSV}
            variant="secondary"
            className="w-full bg-white text-rose-600 hover:bg-rose-50 font-semibold py-4"
            disabled={savedArticles.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV ({savedArticles.length})
          </Button>
          {savedArticles.length > 0 && (
            <p className="text-xs text-center text-rose-100 mt-2 bg-white/10 px-3 py-2 rounded-lg">
              💡 Submit via Menu (☰) → "Submit Your Work"
            </p>
          )}
        </div>

        <div className="space-y-6">
          {topics.map((topic, index) => (
            <Card key={index} className="shadow-lg hover:shadow-2xl transition-all border-2 border-rose-200">
              <CardHeader className="bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-rose-900 flex items-center gap-2">
                    <span className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl flex items-center justify-center font-bold">
                      {topic.id}
                    </span>
                    {topic.title}
                  </CardTitle>
                  <span className="text-xs bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-4 py-1.5 rounded-full font-semibold border border-rose-200">
                    {topic.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <Textarea
                  id={`article-${index}`}
                  placeholder="Write your article here... (Minimum 100 words)"
                  className="min-h-[200px] mb-4 border-2 border-rose-200 focus:border-rose-400 shadow-sm"
                  rows={10}
                />
                <Button
                  onClick={() => {
                    const textarea = document.getElementById(`article-${index}`);
                    handleSave({
                      index: index,
                      title: topic.title,
                      topic: topic.title,
                      category: topic.category,
                      content: textarea.value
                    });
                  }}
                  className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white font-semibold py-6 shadow-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Article #{topic.id}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

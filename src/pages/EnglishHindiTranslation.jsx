
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Save, Languages, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function EnglishHindiTranslation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5 * 60 * 60); // Changed from 4 hours to 5 hours
  const [savedTranslations, setSavedTranslations] = useState([]);

  const TASK_DURATION = 5 * 60 * 60; // 5 hours

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
  }, [startTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTexts = () => {
    const baseTexts = [
      "Technology continues to reshape our daily lives in profound and meaningful ways that affect how we work, communicate, and entertain ourselves. Smartphones have evolved from simple communication devices into essential tools that keep us connected with friends and family across vast distances. Social media platforms enable instant sharing of experiences, while productivity apps help us manage time and tasks more efficiently. Digital payments have made financial transactions seamless and secure, reducing the need for physical currency in many situations. The integration of artificial intelligence in everyday devices promises even more convenient and personalized experiences in the near future.",
      
      "Education serves as the foundation of progress and prosperity for any nation aspiring to compete in the global economy. Schools and universities prepare young minds to face complex challenges and contribute meaningfully to society through knowledge and skills. Teachers play a crucial role in shaping the future by nurturing curiosity, critical thinking, and creativity in their students. Quality education should be accessible to everyone regardless of their economic background or geographic location. Continuous learning throughout life has become essential as technology and industries evolve at an unprecedented pace.",
      
      "Climate change poses serious threats to our planet's future, affecting weather patterns, ecosystems, and human communities worldwide. Rising temperatures cause glaciers to melt, sea levels to rise, and extreme weather events to become more frequent and severe. Scientists emphasize the urgent need for environmental action through reduced carbon emissions and renewable energy adoption. Governments, businesses, and individuals must work together to implement sustainable practices that protect natural resources. The decisions we make today will determine the quality of life for future generations inhabiting this planet.",
      
      "Healthcare systems must evolve continuously to meet the changing needs of aging populations and address emerging medical challenges. Medical innovations extend lifespans while improving quality of life for patients suffering from various diseases and conditions. Hospitals invest in advanced diagnostic tools that detect illnesses earlier and more accurately than ever before. Telemedicine brings healthcare access to remote and underserved communities that previously lacked adequate medical facilities. Preventive care and healthy lifestyle promotion reduce the burden of chronic diseases on healthcare infrastructure and national budgets.",
      
      "Agriculture feeds billions of people worldwide through innovative farming methods that balance productivity with environmental sustainability. Farmers work tirelessly throughout the year to produce nutritious food while protecting natural resources like soil and water. Modern technology including drones, sensors, and data analytics helps optimize crop yields and reduce waste significantly. Organic farming practices eliminate harmful pesticides and chemicals, producing healthier food for consumers. Research into drought-resistant crops and efficient irrigation systems addresses food security challenges in water-scarce regions.",
      
      "Transportation networks connect communities and enable economic growth by facilitating efficient movement of people and goods. Well-maintained roads, railways, and airports reduce travel times and costs for businesses and individuals alike. Public transportation systems provide affordable mobility options while reducing traffic congestion and air pollution in urban areas. Investment in infrastructure creates jobs, stimulates economic activity, and improves quality of life for citizens. Emerging technologies like electric vehicles and high-speed trains promise cleaner and faster transportation solutions for future generations.",
      
      "Renewable energy sources reduce dependence on fossil fuels while combating climate change through clean electricity generation. Solar panels harness sunlight to power homes and businesses without producing harmful emissions or pollution. Wind turbines capture atmospheric energy to generate sustainable electricity for entire communities and regions. Hydroelectric dams utilize flowing water to produce reliable power while managing flood risks in river valleys. Battery storage technology addresses the intermittent nature of solar and wind energy, ensuring consistent power supply.",
      
      "Small businesses drive economic development in local communities by creating employment opportunities and providing essential services. Entrepreneurs invest their savings and take risks to turn innovative ideas into successful enterprises that benefit society. Family-owned shops and restaurants contribute to neighborhood character and offer personalized customer service. Small business owners actively participate in community development and support local initiatives and charitable causes. Government policies supporting entrepreneurship through loans and tax incentives stimulate economic growth and innovation.",
      
      "Arts and culture enrich our lives through creative expression that celebrates human imagination and cultural diversity. Music transcends language barriers to evoke powerful emotions and bring people together in shared experiences. Dance forms tell stories through graceful movements that preserve cultural traditions across generations. Visual arts including painting and sculpture beautify public spaces and inspire viewers to see the world differently. Theater performances entertain audiences while exploring complex themes of human nature, society, and morality.",
      
      "Sports promote physical fitness and teach valuable life lessons about dedication, teamwork, and perseverance through challenges. Athletes demonstrate the importance of setting goals, maintaining discipline, and pushing beyond perceived limitations. Competitive games foster fair play and sportsmanship values that extend beyond the playing field into daily life. Physical activity reduces stress, improves mental health, and builds strong social connections among participants. Major sporting events unite nations and communities in celebration of human achievement and athletic excellence.",
      
      "Digital literacy has become essential in the modern workplace as technology transforms nearly every profession and industry. Computer skills enable workers to adapt quickly to rapidly changing job requirements and new software tools. Online collaboration platforms allow teams to work together seamlessly regardless of geographic location or time zones. Data analysis capabilities help professionals make informed decisions based on quantitative evidence rather than intuition alone. Continuous skill development through online courses keeps workers competitive in an evolving employment landscape.",
      
      "Public libraries provide free access to knowledge and information, serving as vital community resources for people of all ages. These institutions offer books, computers, internet access, and educational programs that support lifelong learning and personal development. Children discover the joy of reading through story hours and literacy programs designed to build foundational skills. Adults access job search assistance, resume writing help, and career development resources at no cost. Libraries preserve local history and culture while adapting to digital age demands through e-books and online databases.",
      
      "Volunteer work strengthens social bonds and helps those in need while providing meaningful experiences for participants. Charitable organizations rely heavily on dedicated volunteers to serve communities effectively and maximize limited financial resources. People donate their time and skills to support causes they care deeply about, from feeding the homeless to tutoring students. Volunteering develops empathy, leadership abilities, and practical skills while making tangible differences in others' lives. Communities with strong volunteer cultures demonstrate greater resilience and social cohesion during difficult times.",
      
      "Financial planning ensures economic security for families by helping them prepare for both expected expenses and unexpected emergencies. Saving money consistently builds a financial cushion that provides peace of mind and flexibility during life transitions. Investing wisely in diversified portfolios grows wealth over time through compound returns on stocks, bonds, and real estate. Insurance protects families from catastrophic financial losses due to accidents, illnesses, or natural disasters. Retirement planning allows people to maintain their standard of living after leaving the workforce in their later years.",
      
      "Urban planning shapes how cities function and develop by balancing economic growth with environmental sustainability and social equity. Well-designed neighborhoods improve quality of life for residents through access to parks, schools, shopping, and transportation. Mixed-use developments combine residential, commercial, and recreational spaces to create vibrant communities where people can live, work, and play. Zoning regulations protect residential areas from industrial pollution while ensuring appropriate land use throughout cities. Sustainable urban growth accommodates increasing populations without compromising environmental quality or overwhelming infrastructure.",
      
      "Scientific research expands our understanding of the natural world through systematic investigation and rigorous experimentation. Discoveries in laboratories lead to practical applications that benefit humanity across medicine, technology, and environmental protection. Researchers collaborate internationally to tackle complex problems requiring diverse expertise and significant resources. Peer review processes ensure that published findings meet high standards of validity and reliability before acceptance. Public funding of basic research generates tremendous long-term returns through innovations that drive economic growth and improve lives.",
      
      "Tourism industry supports millions of jobs around the globe while promoting cultural exchange and international understanding. Travelers experience different cultures, cuisines, and historical sites that broaden their perspectives and create lasting memories. Local communities benefit economically from visitor spending on accommodations, dining, entertainment, and souvenirs. Responsible tourism practices minimize environmental impact while respecting local traditions and supporting sustainable development. Heritage preservation efforts maintain historical sites and cultural attractions for future generations to appreciate and learn from.",
      
      "Mental health awareness reduces stigma and encourages people to seek treatment for psychological challenges and emotional difficulties. Counseling and therapy provide professional support for individuals struggling with depression, anxiety, trauma, and other mental health conditions. Early intervention prevents minor issues from developing into serious disorders that significantly impair functioning and quality of life. Workplace programs promoting mental wellness reduce absenteeism and improve employee satisfaction and productivity. Society benefits when everyone can access the mental health services they need to thrive and contribute fully.",
      
      "Workplace safety protects employees from injuries and accidents through proper training, equipment, and procedures in potentially hazardous environments. Organizations implement safety protocols that identify risks and establish preventive measures to minimize harm. Regular inspections ensure that machinery, electrical systems, and work areas meet established safety standards and regulations. Safety culture encourages workers to report hazards and near-misses without fear of punishment or retaliation. Investing in occupational health and safety reduces costs associated with injuries while demonstrating corporate responsibility and care for employees.",
      
      "Democracy depends fundamentally on informed citizens who participate actively in political processes and civic institutions. Voting in elections allows people to choose leaders who represent their values and advocate for their interests in government. Freedom of speech and press enable public debate and criticism essential for accountability and good governance. Civil society organizations mobilize citizens around important issues and hold authorities responsible for their actions and policies. Education in democratic principles and civic responsibilities prepares young people to be engaged citizens throughout their lives."
    ];

    const texts = [];
    for (let i = 0; i < 250; i++) {
      const text = baseTexts[i % baseTexts.length];
      const category = ["Technology", "Education", "Environment", "Healthcare", "Agriculture", "Transportation", "Energy", "Business", "Culture", "Sports"][i % 10];
      texts.push({
        id: i + 1,
        englishText: text,
        category: category,
        difficulty: i % 3 === 0 ? "Hard" : i % 3 === 1 ? "Medium" : "Easy"
      });
    }
    return texts;
  };

  const texts = generateTexts();

  const handleSave = (textId, hindiTranslation) => {
    if (!hindiTranslation || hindiTranslation.trim().length < 50) {
      alert("Translation must be at least 50 characters!");
      return;
    }

    const text = texts.find(t => t.id === textId);
    const newTranslation = {
      textId,
      englishText: text.englishText,
      hindiTranslation,
      category: text.category,
      savedAt: new Date().toISOString()
    };

    setSavedTranslations(prev => [...prev, newTranslation]);
    alert(`Translation ${textId} saved!\n\n💡 Complete all translations, download CSV, then submit via Menu → "Submit Your Work"`);
    
    const textarea = document.getElementById(`hindi-${textId}`);
    if (textarea) textarea.value = '';
  };

  const generateCSV = () => {
    let csv = 'Text No,Category,English Text,Hindi Translation,Saved At\n';
    savedTranslations.forEach((item) => {
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      csv += `${item.textId},${item.category},${escapeCsv(item.englishText)},${escapeCsv(item.hindiTranslation)},${escapeCsv(item.savedAt)}\n`;
    });
    return csv;
  };

  const downloadCSV = () => {
    if (savedTranslations.length === 0) {
      alert("No translations saved yet!");
      return;
    }

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`✅ CSV Downloaded!\n\n📤 Submit via Menu (☰) → "Submit Your Work"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white p-6 rounded-2xl mb-6 shadow-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Languages className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  English → Hindi Translation
                </h1>
                <p className="text-sm text-orange-100 mt-1">250 Texts • Payment: ₹460</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
              <p className="text-xs text-orange-100">Saved Translations</p>
              <p className="text-2xl font-bold">{savedTranslations.length}/250</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
              <Clock className="w-6 h-6 text-orange-200" />
              <div>
                <p className="text-xs text-orange-200">Time Elapsed</p>
                <p className="text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 backdrop-blur rounded-xl ${remainingTime < 1800 ? 'bg-red-500/30' : 'bg-white/10'}`}>
              <Clock className="w-6 h-6 text-red-200" />
              <div>
                <p className="text-xs text-red-200">Time Remaining</p>
                <p className="text-xl font-bold text-white">{formatTime(remainingTime)}</p>
              </div>
            </div>
          </div>

          <Button onClick={downloadCSV} variant="secondary" className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold py-4" disabled={savedTranslations.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV ({savedTranslations.length})
          </Button>
          {savedTranslations.length > 0 && (
            <p className="text-xs text-center text-orange-100 mt-2 bg-white/10 px-3 py-2 rounded-lg">
              💡 Submit via Menu (☰) → "Submit Your Work"
            </p>
          )}
        </div>

        <div className="grid gap-6">
          {texts.map((text) => (
            <Card key={text.id} className="shadow-lg hover:shadow-xl transition-all border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-orange-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {text.id}
                    </span>
                    Text #{text.id}
                  </CardTitle>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-3 py-1 rounded-full font-semibold border border-orange-200">
                      {text.category}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      text.difficulty === 'Easy' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' :
                      text.difficulty === 'Hard' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200' :
                      'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {text.difficulty}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                  <p className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span>🇬🇧</span> English Text:
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{text.englishText}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <span>🇮🇳</span> Hindi Translation (हिंदी अनुवाद):
                  </p>
                  <Textarea
                    id={`hindi-${text.id}`}
                    placeholder="यहाँ हिंदी में अनुवाद लिखें... (Write Hindi translation here)"
                    className="min-h-48 border-2 border-orange-300 focus:border-orange-500 shadow-sm"
                    dir="auto"
                    rows={8}
                  />
                  <Button
                    onClick={() => {
                      const textarea = document.getElementById(`hindi-${text.id}`);
                      if (textarea) handleSave(text.id, textarea.value);
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-6 shadow-lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Translation #{text.id}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

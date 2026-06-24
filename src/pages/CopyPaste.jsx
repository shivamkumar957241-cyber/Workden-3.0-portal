import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Clock, CheckCircle, Copy } from "lucide-react";

export default function CopyPaste() {
  const [user, setUser] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5 * 60 * 60); // Updated to 5 hours
  const [inputs, setInputs] = useState({}); // Renamed from inputValues
  const [savedWorks, setSavedWorks] = useState([]);

  const TASK_DURATION = 5 * 60 * 60; // Updated to 5 hours

  useEffect(() => {
    loadUser();
    const savedData = localStorage.getItem('copypaste_work');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setInputs(parsed.inputs || {}); // Updated to setInputs
      setSavedWorks(parsed.saved || []);
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      const remaining = Math.max(0, TASK_DURATION - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const generateParagraphs = () => {
    const baseParagraphs = [
      "Artificial intelligence revolutionizes industries across the globe through sophisticated machine learning algorithms that meticulously analyze vast datasets. These intelligent systems identify complex patterns and correlations that humans might miss, making highly accurate predictions about future trends and behaviors. By enabling automation of complex cognitive tasks, AI frees human workers to focus on creative and strategic endeavors. Organizations implementing AI solutions experience significant improvements in efficiency, accuracy, and decision-making capabilities. The continuous advancement of neural networks and deep learning models promises even more transformative applications in healthcare, finance, manufacturing, and countless other sectors.",
      
      "Climate change poses existential threats to our planet, requiring immediate and coordinated global action from governments, businesses, and individuals alike. Scientists worldwide document rising temperatures, melting ice caps, extreme weather events, and disrupted ecosystems with increasing alarm. Reducing carbon emissions through renewable energy adoption represents our most critical pathway forward. Implementing sustainable practices in agriculture, transportation, and urban development can significantly mitigate environmental damage. Protecting ecosystems and biodiversity ensures that future generations inherit a livable planet with abundant natural resources and stable climatic conditions.",
      
      "The digital revolution has fundamentally transformed how humans communicate and access information in the modern era. Social media platforms connect billions of users across continents, enabling instant sharing of ideas, experiences, and cultural expressions. Cloud computing provides scalable infrastructure that empowers businesses of all sizes to compete globally. Mobile devices have become ubiquitous, putting powerful computing capabilities in the pockets of billions worldwide. This unprecedented connectivity creates opportunities for collaboration, education, commerce, and social movements that transcend traditional geographic and economic boundaries.",
      
      "Space exploration expands humanity's knowledge of the cosmos through satellites, telescopes, and robotic missions to distant worlds. Scientists analyze data from deep space to understand the universe's origins, evolution, and ultimate fate. The search for extraterrestrial life motivates missions to Mars, Europa, and other potentially habitable celestial bodies. International collaboration on the International Space Station demonstrates how nations can work together on grand scientific endeavors. Private companies now compete alongside government agencies, dramatically reducing launch costs and accelerating innovation in rocket technology and spacecraft design.",
      
      "Medical innovations continuously extend human lifespans and improve quality of life through groundbreaking research and technological advancement. Vaccines have virtually eliminated diseases that once killed millions, while antibiotics transformed once-fatal infections into treatable conditions. Surgical techniques have evolved from crude procedures to minimally invasive operations guided by robotic precision. Genetic therapies now offer hope for curing hereditary diseases that were previously considered incurable. Personalized treatments tailored to individual genetic profiles represent the future of medicine, promising more effective interventions with fewer side effects.",
      
      "Education empowers individuals by providing knowledge, skills, and critical thinking abilities essential for personal and professional success. Quality learning environments foster creativity, curiosity, and intellectual growth that benefits society as a whole. Problem-solving skills developed through rigorous study prepare students to tackle complex real-world challenges. Educational institutions serve as engines of social mobility, enabling talented individuals from all backgrounds to achieve their potential. Lifelong learning has become essential in our rapidly changing world, where technological advances constantly reshape career requirements and opportunities.",
      
      "Entrepreneurship drives economic development by creating new businesses, products, and services that address unmet market needs. Innovative business models disrupt traditional industries, forcing established companies to adapt or risk obsolescence. Startups generate employment opportunities, contributing to local and national economic growth. Technological solutions developed by entrepreneurs solve pressing problems in healthcare, education, transportation, and environmental sustainability. The entrepreneurial spirit of taking calculated risks and persevering through challenges inspires others to pursue their visions and contribute to economic prosperity.",
      
      "Environmental conservation protects precious natural resources through sustainable forestry practices, wildlife preservation efforts, and pollution control measures. Habitat restoration projects help endangered species recover while ecosystem management maintains biodiversity. Climate action initiatives reduce greenhouse gas emissions and promote renewable energy adoption. Conservation organizations work tirelessly to protect forests, oceans, wetlands, and other critical ecosystems from human exploitation. Future generations depend on our commitment today to preserve the natural world's beauty, complexity, and life-sustaining functions for centuries to come.",
      
      "Transportation infrastructure connects communities and facilitates trade, forming the backbone of modern economic systems. Highways, railways, airways, and waterways enable efficient movement of people, goods, and services across vast distances. Well-designed transportation networks reduce travel times, lower costs, and improve accessibility for all citizens. Investment in infrastructure creates jobs, stimulates economic activity, and enhances quality of life in urban and rural areas alike. Sustainable transportation planning balances economic needs with environmental concerns, promoting public transit, cycling infrastructure, and electric vehicle adoption.",
      
      "Agriculture feeds the global population through innovative farming techniques that maximize productivity while minimizing environmental impact. Precision technology uses sensors, drones, and data analytics to optimize irrigation, fertilization, and pest management decisions. Genetic research develops crop varieties resistant to drought, disease, and climate change, ensuring food security in challenging conditions. Sustainable practices like crop rotation, organic farming, and integrated pest management protect soil health and reduce chemical inputs. Vertical farming and hydroponics offer promising solutions for producing fresh food in urban environments with limited space.",
      
      "Financial literacy enables individuals to make informed decisions about money management, investment, and long-term planning. Understanding budgeting principles helps families live within their means while saving for future goals and emergencies. Knowledge of different investment vehicles—stocks, bonds, real estate, and retirement accounts—empowers people to build wealth over time. Comprehending market dynamics, risks, and returns allows investors to make strategic choices aligned with their financial objectives. Achieving economic independence and security requires discipline, education, and the wisdom to distinguish between needs and wants in consumption decisions.",
      
      "The technology sector advances at an unprecedented pace through continuous innovation, research, and development of cutting-edge solutions. Companies invest billions in creating new products and services that transform industries and improve lives globally. Software applications automate routine tasks, enhance productivity, and enable new forms of creative expression and collaboration. Hardware improvements deliver exponentially greater computing power in smaller, more energy-efficient devices. Emerging technologies like artificial intelligence, quantum computing, and biotechnology promise to solve humanity's most pressing challenges in the coming decades.",
      
      "Healthcare systems evolve to address changing population needs through preventive care programs, chronic disease management, and mental health services. Telemedicine expands access to medical expertise for patients in remote or underserved areas. Healthcare providers increasingly focus on early detection and intervention to prevent serious illnesses before they develop. Equity in healthcare access remains a critical goal, ensuring that quality medical care reaches all citizens regardless of income or location. Continuous quality improvement initiatives drive better patient outcomes, lower costs, and more satisfying healthcare experiences for patients and providers alike.",
      
      "Urban planning shapes cities through thoughtful infrastructure development, zoning regulations, and transportation networks that serve residents effectively. Green spaces and parks provide recreation opportunities, improve air quality, and enhance mental wellbeing for urban populations. Housing policies must balance affordability with quality to ensure that families can find suitable homes near employment and schools. Sustainable community design promotes walkability, reduces car dependence, and creates vibrant neighborhoods where people want to live and work. Forward-thinking planners integrate environmental sustainability, economic vitality, and social equity into comprehensive development strategies.",
      
      "Scientific research expands human knowledge through systematic investigation, careful experimentation, rigorous observation, and thoughtful analysis of natural phenomena. Researchers across disciplines collaborate to understand everything from subatomic particles to galactic superclusters. Laboratory discoveries often lead to practical applications that solve real-world problems and improve daily life for billions of people. Peer review processes ensure that scientific findings meet high standards of validity and reliability before entering the literature. Public funding of basic research yields tremendous returns through technological innovations, medical breakthroughs, and economic growth that benefit entire societies.",
      
      "The tourism industry supports local and national economies through travel services, hospitality operations, and cultural exchange programs. Visitors bring revenue that creates jobs in hotels, restaurants, transportation, and entertainment sectors. Cultural tourism exposes travelers to different traditions, histories, and perspectives, promoting understanding and appreciation across cultures. Regional development benefits from infrastructure improvements made to accommodate tourists, raising quality of life for residents as well. Community engagement ensures that tourism growth remains sustainable and beneficial rather than exploitative or environmentally destructive.",
      
      "Democracy empowers citizens to participate in governance through voting, civic organizations, and peaceful assembly. Representative governments derive legitimacy from the consent of the governed, ensuring accountability to the people they serve. Protecting fundamental rights and freedoms creates the conditions for human dignity and flourishing in free societies. Transparency in government operations allows citizens to monitor their leaders and demand ethical conduct and effective policies. The rule of law applies equally to all individuals regardless of wealth or power, maintaining justice and social stability.",
      
      "Communication skills facilitate effective interaction in personal relationships, professional settings, and community engagement. Active listening demonstrates respect and helps us understand others' perspectives, needs, and concerns more fully. Clear expression of thoughts and feelings prevents misunderstandings and builds trust between individuals and groups. Empathy allows us to connect emotionally with others, creating deeper bonds and more meaningful relationships. Constructive conflict resolution turns disagreements into opportunities for growth and mutual understanding rather than sources of lasting resentment.",
      
      "Sports promote physical fitness while teaching valuable life lessons about discipline, teamwork, and perseverance under pressure. Athletes learn to set ambitious goals and work systematically toward achieving them through dedicated practice and training. Competitive sports teach participants to handle victory gracefully and learn from defeat constructively. Fair play and sportsmanship emphasize ethical behavior and respect for opponents even in intensely competitive situations. The entertainment value of sports brings communities together, creating shared experiences and collective identities around teams and events.",
      
      "The arts enrich human culture through creative expression in music, dance, theater, literature, and visual media. Musicians compose melodies that evoke powerful emotions and connect listeners across cultural and linguistic boundaries. Visual artists create works that challenge perceptions, provoke thought, and beautify our environments. Literature preserves cultural heritage while exploring universal human experiences of love, loss, triumph, and tragedy. Performance arts bring communities together in shared aesthetic experiences that inspire, entertain, and illuminate the human condition in all its complexity."
    ];

    const paragraphs = [];
    for (let i = 0; i < 1000; i++) {
      paragraphs.push({
        id: i + 1,
        text: baseParagraphs[i % baseParagraphs.length]
      });
    }
    return paragraphs;
  };

  const uniqueParagraphs = generateParagraphs();

  const handleInputChange = (pageId, value) => {
    setInputs(prev => ({ ...prev, [pageId]: value })); // Updated to setInputs
  };

  const handleSave = (page) => {
    const content = inputs[page.id]; // Updated to inputs
    if (!content || content.trim().length < 50) {
      alert("❌ Please type at least 50 characters before saving");
      return;
    }

    const newWork = {
      page_number: page.id,
      original_text: page.text,
      typed_text: content,
      saved_at: new Date().toISOString(),
    };

    const updated = [...savedWorks.filter(w => w.page_number !== page.id), newWork];
    setSavedWorks(updated);
    
    localStorage.setItem('copypaste_work', JSON.stringify({
      inputs: inputs, // Updated to inputs
      saved: updated
    }));

    alert(`✅ Page ${page.id} saved!\n\n💡 Complete all pages, download CSV, then submit via Menu → "Submit Your Work"`);
    setInputs(prev => ({ ...prev, [page.id]: "" })); // Updated to setInputs
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateCSV = () => {
    const headers = ['Page Number', 'Original Text', 'Typed Text', 'Saved At'];
    const rows = savedWorks.map(work => [
      work.page_number,
      `"${work.original_text.replace(/"/g, '""')}"`,
      `"${work.typed_text.replace(/"/g, '""')}"`,
      new Date(work.saved_at).toLocaleString()
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = () => {
    if (savedWorks.length === 0) {
      alert("⚠️ No work saved yet!");
      return;
    }

    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copypaste_work_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert(`✅ CSV Downloaded!\n\n📤 Submit via Menu (☰) → "Submit Your Work"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Copy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Copy Paste Work</h1>
                <p className="text-cyan-100 text-sm">1000 Pages • Payment: ₹400</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/90">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              {savedWorks.length} / {uniqueParagraphs.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
              <Clock className="w-6 h-6 text-cyan-200" />
              <div>
                <p className="text-xs text-cyan-200">Time Elapsed</p>
                <p className="text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
              <Clock className="w-6 h-6 text-orange-200" />
              <div>
                <p className="text-xs text-orange-200">Time Remaining</p>
                <p className="text-xl font-bold text-white">{formatTime(remainingTime)}</p>
              </div>
            </div>
          </div>

          <Button onClick={downloadCSV} className="w-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4" disabled={savedWorks.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV ({savedWorks.length})
          </Button>
          
          {savedWorks.length > 0 && (
            <p className="text-xs text-center text-cyan-100 mt-2 bg-white/10 px-3 py-2 rounded-lg">
              💡 Submit via Menu (☰) → "Submit Your Work"
            </p>
          )}
        </div>

        <div className="grid gap-5">
          {uniqueParagraphs.map((page) => {
            const isSaved = savedWorks.some(w => w.page_number === page.id);
            return (
              <Card key={page.id} className={`${isSaved ? 'border-green-500 border-2 bg-green-50/50' : 'border-blue-200'}`}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {page.id}
                      </span>
                      Page {page.id}
                    </CardTitle>
                    {isSaved && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-inner max-h-96 overflow-y-auto">
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{page.text}</p>
                  </div>

                  <Textarea
                    placeholder="Type the above text here..."
                    value={inputs[page.id] || ""} // Updated to inputs
                    onChange={(e) => handleInputChange(page.id, e.target.value)}
                    rows={8}
                    className="font-mono border-2 border-blue-200 focus:border-blue-400"
                    disabled={isSaved}
                  />

                  <Button
                    onClick={() => handleSave(page)}
                    className={`w-full ${isSaved ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} text-white font-semibold py-6`}
                    disabled={isSaved}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaved ? "Already Saved ✓" : `Save Page ${page.id}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

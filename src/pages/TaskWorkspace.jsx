import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Save, 
  AlertTriangle, 
  Timer,
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Sparkles,
  Play,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";
import TaskTimeLockChecker from "../components/TaskTimeLockChecker";
import TaskLeaveWarning from "../components/TaskLeaveWarning";
import TaskTimeLockScreen from "../components/TaskTimeLockScreen";

export default function TaskWorkspace() {
  const [user, setUser] = useState(null);
  const [task, setTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [generatedWork, setGeneratedWork] = useState([]);
  const [loadingWork, setLoadingWork] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [savedItems, setSavedItems] = useState({});
  const [savingItem, setSavingItem] = useState(null);
  const [taskStarted, setTaskStarted] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [pageTimings, setPageTimings] = useState([]);
  const [currentPageStartTime, setCurrentPageStartTime] = useState(null);
  const [trainingVideos, setTrainingVideos] = useState([]);
  const [isWithinActiveHours, setIsWithinActiveHours] = useState(true);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingLeaveCallback, setPendingLeaveCallback] = useState(null);
  const timerRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('taskId');

  // Check if copy-paste should be ENABLED (only for Copy-Paste Work task)
  const isCopyPasteTask = task?.name === "Copy-Paste Work";

  // Block paste, drag-drop, clipboard for ALL tasks EXCEPT Copy-Paste Work task
  useEffect(() => {
    if (!isCopyPasteTask && taskStarted) {
      const blockPaste = (e) => {
        e.preventDefault();
        alert("⚠️ Paste is disabled. You must type manually.");
        return false;
      };
      
      const blockKeyboard = (e) => {
        // Block Ctrl+V, Ctrl+C, Ctrl+X, Ctrl+A
        if ((e.ctrlKey || e.metaKey) && ['v', 'c', 'x', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          alert("⚠️ This action is disabled. You must type manually.");
          return false;
        }
      };

      // Block drag and drop
      const blockDragDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      // Block clipboard API
      const blockClipboard = (e) => {
        e.preventDefault();
        return false;
      };

      document.addEventListener('paste', blockPaste, true);
      document.addEventListener('copy', blockClipboard, true);
      document.addEventListener('cut', blockClipboard, true);
      document.addEventListener('keydown', blockKeyboard, true);
      document.addEventListener('dragstart', blockDragDrop, true);
      document.addEventListener('drop', blockDragDrop, true);
      document.addEventListener('dragover', blockDragDrop, true);
      document.addEventListener('dragenter', blockDragDrop, true);
      
      return () => {
        document.removeEventListener('paste', blockPaste, true);
        document.removeEventListener('copy', blockClipboard, true);
        document.removeEventListener('cut', blockClipboard, true);
        document.removeEventListener('keydown', blockKeyboard, true);
        document.removeEventListener('dragstart', blockDragDrop, true);
        document.removeEventListener('drop', blockDragDrop, true);
        document.removeEventListener('dragover', blockDragDrop, true);
        document.removeEventListener('dragenter', blockDragDrop, true);
      };
    }
  }, [isCopyPasteTask, taskStarted]);

  useEffect(() => {
    // Load from cache first for instant display
    const cachedTasks = localStorage.getItem('workden_tasks');
    if (cachedTasks && taskId) {
      try {
        const tasks = JSON.parse(cachedTasks);
        const foundTask = tasks.find(t => t.id === taskId);
        if (foundTask) {
          setTask(foundTask);
          setInitialLoading(false);
        }
      } catch (e) {}
    }

    // Check if task was previously started (session recovery after REFRESH only, not back navigation)
    // Only restore if the page was reloaded (not navigated back)
    const savedTaskState = localStorage.getItem(`task_${taskId}_state`);
    const navEntries = performance.getEntriesByType('navigation');
    const isPageReload = navEntries.length > 0 && navEntries[0].type === 'reload';
    if (savedTaskState && isPageReload) {
      try {
        const state = JSON.parse(savedTaskState);
        if (state.started && !state.expired) {
          // Restore task state after refresh only
          setTaskStarted(true);
          setShowPreview(false);
          if (state.activeTaskId) {
            base44.entities.ActiveTask.filter({ id: state.activeTaskId }).then(tasks => {
              if (tasks && tasks.length > 0) {
                const active = tasks[0];
                setActiveTask(active);
                startTimer(active.deadline);
                loadSavedData();
              }
            }).catch(() => {});
          }
        }
      } catch (e) {}
    } else if (savedTaskState && !isPageReload) {
      // User navigated back — clear the stale state and show preview fresh
      localStorage.removeItem(`task_${taskId}_state`);
      localStorage.removeItem(`task_${taskId}_answers`);
      localStorage.removeItem(`task_${taskId}_saved`);
    }
    
    // Load fresh data in background
    loadData();
    
    // Refresh warning during active task
    const handleBeforeUnload = (e) => {
      if (taskStarted && !isExpired) {
        const message = "⚠️ If you refresh the page, all entered data will be erased and the task will be locked. Are you sure?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [taskId, taskStarted, isExpired]);

  const loadSavedData = () => {
    const savedAnswers = localStorage.getItem(`task_${taskId}_answers`);
    const savedItemsData = localStorage.getItem(`task_${taskId}_saved`);
    
    if (savedAnswers) {
      try {
        setUserAnswers(JSON.parse(savedAnswers));
      } catch (e) {}
    }
    
    if (savedItemsData) {
      try {
        setSavedItems(JSON.parse(savedItemsData));
      } catch (e) {}
    }
  };

  // Auto-save answers every 2 seconds
  useEffect(() => {
    if (taskStarted && Object.keys(userAnswers).length > 0) {
      const saveTimeout = setTimeout(() => {
        localStorage.setItem(`task_${taskId}_answers`, JSON.stringify(userAnswers));
      }, 2000);
      return () => clearTimeout(saveTimeout);
    }
  }, [userAnswers, taskId, taskStarted]);

  // Auto-save items state immediately
  useEffect(() => {
    if (taskStarted) {
      localStorage.setItem(`task_${taskId}_saved`, JSON.stringify(savedItems));
    }
  }, [savedItems, taskId, taskStarted]);

  const loadData = async () => {
    try {
      let currentUser = null;
      const userSource = localStorage.getItem('workden_3_user_source');
      const savedUserId = localStorage.getItem('workden_3_login_id');
      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) currentUser = appUsers[0];
      }
      if (!currentUser) {
        const savedUserStr = localStorage.getItem('workden_3_user');
        if (savedUserStr) currentUser = JSON.parse(savedUserStr);
      }
      if (!currentUser) currentUser = await base44.auth.me();
      setUser(currentUser);

      if (taskId) {
        const tasks = await base44.entities.Task.list();
        const foundTask = tasks.find(t => t.id === taskId);
        
        if (!foundTask) {
          // Task not found - redirect immediately
          window.location.href = "#" + createPageUrl("Tasks");
          return;
        }
        
        setTask(foundTask);
        
        // Check if platform is in "Off Mode"
        const settings = await base44.entities.GlobalSettings.list();
        const platformOff = settings.find(s => s.setting_key === 'platform_off_enabled')?.setting_value === 'true';
        
        if (platformOff && currentUser.role !== 'admin') {
          const offMessage = settings.find(s => s.setting_key === 'platform_off_message')?.setting_value || 
                             "Platform is currently closed. Please check back later.";
          alert(`🚫 ${offMessage}`);
          window.location.href = "#" + createPageUrl("Tasks");
          return;
        }

        // Check for existing active task
        const activeTasks = await base44.entities.ActiveTask.filter({ 
          user_id: currentUser.id, 
          task_id: taskId
        });

        // Admin bypass - no lock restrictions for admin
        if (currentUser.role === 'admin') {
          setShowPreview(true);
          return;
        }

        // Check if there's a locked task
        if (currentUser.task_lock_enabled !== false) {
          const lockedTask = activeTasks.find(at => {
            if (at.status === 'locked') {
              const lockTime = new Date(at.locked_until);
              const now = new Date();
              if (now < lockTime) {
                return true;
              }
            }
            return false;
          });

          if (lockedTask) {
            const unlockTime = new Date(lockedTask.locked_until);
            const lockReason = lockedTask.lock_reason === 'incomplete' ? 'Task left incomplete' : 'Task time expired';
            alert(`🔒 Task Locked\n\nReason: ${lockReason}\nUnlocks: ${unlockTime.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n\nYou can retry this task after it unlocks automatically.`);
            window.location.href = "#" + createPageUrl("Tasks");
            return;
          }
        }

        // DON'T lock if user just came back without starting - only show preview
        // Lock will ONLY happen when user clicks "I'm Starting The Task" and then leaves
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setInitialLoading(false);
    }
  };



  const handleStartTask = async () => {
    try {
      setShowPreview(false);
      setTaskStarted(true);

      // Create active task when user clicks "I'm Starting The Task"
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 8);

      const newActiveTask = await base44.entities.ActiveTask.create({
        user_id: user.id,
        task_id: taskId,
        task_name: task?.name,
        start_time: new Date().toISOString(),
        deadline: deadline.toISOString(),
        status: 'active'
      });

      setActiveTask(newActiveTask);
      startTimer(deadline.toISOString());
      
      // Save task state to survive refresh
      localStorage.setItem(`task_${taskId}_state`, JSON.stringify({
        started: true,
        expired: false,
        activeTaskId: newActiveTask.id
      }));
      
      // Detect navigation away (NOT refresh)
      let isRefresh = false;
      
      const handleBeforeUnload = (e) => {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          isRefresh = navEntry.type === 'reload';
        }
        
        // Only lock if NOT a refresh
        if (!isRefresh && user?.task_lock_enabled !== false) {
          // Lock until tomorrow 9 AM
          const lockUntil = new Date();
          lockUntil.setDate(lockUntil.getDate() + 1);
          lockUntil.setHours(9, 0, 0, 0);
          
          navigator.sendBeacon('/api/lock-task', JSON.stringify({
            activeTaskId: newActiveTask.id,
            lockUntil: lockUntil.toISOString()
          }));
          
          base44.entities.ActiveTask.update(newActiveTask.id, {
            status: 'locked',
            locked_until: lockUntil.toISOString(),
            lock_reason: 'incomplete'
          }).catch(err => console.error("Lock error:", err));
          
          // Clear state on actual navigation
          localStorage.removeItem(`task_${taskId}_state`);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Detect visibility change (tab switch, app switch)
      const handleVisibilityChange = () => {
        if (document.hidden && taskStarted && !isExpired && user?.task_lock_enabled !== false) {
          // Lock until tomorrow 9 AM
          const lockUntil = new Date();
          lockUntil.setDate(lockUntil.getDate() + 1);
          lockUntil.setHours(9, 0, 0, 0);
          
          base44.entities.ActiveTask.update(newActiveTask.id, {
            status: 'locked',
            locked_until: lockUntil.toISOString(),
            lock_reason: 'incomplete'
          }).catch(err => console.error("Lock error:", err));
          
          localStorage.removeItem(`task_${taskId}_state`);
          
          alert("⚠️ You switched tabs. Task has been locked until tomorrow 9:00 AM.");
          window.location.href = "#" + createPageUrl("Tasks");
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } catch (error) {
      console.error("Error starting task:", error);
      alert("Failed to start task. Please try again.");
    }
  };

  const startTimer = (deadline) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        clearInterval(timerRef.current);
        
        // Update localStorage state
        const savedState = localStorage.getItem(`task_${taskId}_state`);
        if (savedState) {
          const state = JSON.parse(savedState);
          state.expired = true;
          localStorage.setItem(`task_${taskId}_state`, JSON.stringify(state));
        }
        
        alert("⏰ Time expired! Please download your file and submit via Menu → Submit Your Work");
      } else {
        setTimeRemaining(Math.floor(diff / 1000));
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 3600) return 'from-red-500 to-red-600';
    if (timeRemaining <= 7200) return 'from-orange-500 to-orange-600';
    return 'from-green-500 to-emerald-600';
  };

  const handleAnswerChange = (itemIndex, field, value) => {
    if (!taskStarted && !user?.role === 'admin') return;
    setUserAnswers(prev => ({
      ...prev,
      [`${itemIndex}_${field}`]: value
    }));
  };

  const saveItem = async (itemIndex) => {
    if (!taskStarted && user?.role !== 'admin') return;
    setSavingItem(itemIndex);
    try {
      // Save page timing when user saves an item
      const endTime = new Date();
      const startTimeForThisPage = currentPageStartTime || new Date();
      const durationMs = endTime - startTimeForThisPage;
      const durationSeconds = Math.floor(durationMs / 1000);
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      
      setPageTimings(prev => [...prev, {
        page: itemIndex + 1,
        startTime: startTimeForThisPage,
        endTime: endTime,
        duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }]);
      
      // Reset start time for next page
      setCurrentPageStartTime(new Date());
      
      const newSavedItems = { ...savedItems, [itemIndex]: true };
      setSavedItems(newSavedItems);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSavingItem(null);
    }
  };

  const getSavedCount = () => Object.values(savedItems).filter(Boolean).length;

  // Static content generators
  const copyPasteParagraphs = [
    "The rapid advancement of artificial intelligence and machine learning technologies has fundamentally transformed how businesses operate in the modern digital economy. Organizations across various sectors are leveraging these powerful tools to automate complex processes, enhance decision-making capabilities, and deliver personalized experiences to their customers. The integration of AI systems into everyday business operations has led to significant improvements in efficiency, cost reduction, and competitive advantage. Companies that embrace these technologies are finding new ways to innovate and create value for their stakeholders.",
    "Climate change represents one of the most pressing challenges facing humanity in the twenty-first century. The scientific consensus is clear that human activities, particularly the burning of fossil fuels and deforestation, are driving unprecedented changes in global weather patterns. Rising temperatures, melting ice caps, and increasing frequency of extreme weather events are already affecting communities around the world. Addressing this crisis requires coordinated action from governments, businesses, and individuals to transition to sustainable energy sources and reduce carbon emissions.",
    "The global healthcare industry is undergoing a revolutionary transformation driven by technological innovations and changing patient expectations. Telemedicine, wearable devices, and electronic health records are enabling more accessible and personalized care delivery. Artificial intelligence is being used to improve diagnostic accuracy, predict disease outbreaks, and accelerate drug discovery. These advancements hold the promise of better health outcomes, reduced costs, and more equitable access to healthcare services for populations worldwide.",
    "Education systems around the world are evolving to meet the demands of an increasingly complex and interconnected global society. Traditional classroom-based learning is being supplemented and sometimes replaced by online platforms, virtual reality experiences, and adaptive learning technologies. These innovations are making quality education more accessible to learners regardless of their geographic location or socioeconomic background. The focus is shifting from rote memorization to developing critical thinking, creativity, and collaboration skills.",
    "The financial services industry is experiencing unprecedented disruption from fintech startups and digital-native competitors. Mobile banking, cryptocurrency, peer-to-peer lending, and robo-advisors are changing how consumers manage their money and access financial services. Traditional banks are responding by investing heavily in digital transformation initiatives and partnering with innovative technology companies. Regulatory frameworks are evolving to balance innovation with consumer protection and financial stability.",
    "Sustainable development has become a central concern for businesses, governments, and civil society organizations worldwide. The United Nations Sustainable Development Goals provide a comprehensive framework for addressing global challenges including poverty, inequality, climate change, and environmental degradation. Companies are increasingly recognizing that long-term success depends on balancing economic performance with social responsibility and environmental stewardship. Consumers and investors are demanding greater transparency and accountability on sustainability issues.",
    "The nature of work is being fundamentally reshaped by automation, remote collaboration technologies, and changing workforce demographics. The COVID-19 pandemic accelerated trends that were already underway, forcing organizations to adopt flexible work arrangements and invest in digital infrastructure. Workers are seeking greater autonomy, purpose, and work-life balance in their careers. Employers are rethinking traditional approaches to recruitment, training, and performance management to attract and retain top talent.",
    "Urban planning and smart city initiatives are transforming how we design, build, and manage our cities. Sensors, data analytics, and connected infrastructure are enabling more efficient use of resources and improved quality of life for urban residents. Traffic management systems, smart grids, and environmental monitoring networks are just a few examples of how technology is being applied to urban challenges. The goal is to create cities that are more sustainable, resilient, and responsive to the needs of their inhabitants.",
    "The entertainment and media industry has been revolutionized by streaming platforms, social media, and user-generated content. Traditional business models based on advertising and subscription revenue are being disrupted by new entrants and changing consumer preferences. Content creators have unprecedented opportunities to reach global audiences directly without intermediaries. The boundaries between different forms of entertainment are blurring as immersive technologies like virtual and augmented reality create new possibilities for storytelling and engagement.",
    "Global supply chains have become increasingly complex and interconnected, creating both opportunities and vulnerabilities for businesses. The pandemic exposed the fragility of just-in-time manufacturing and the risks of over-reliance on single sources of supply. Companies are now focusing on building more resilient and diversified supply networks while balancing cost efficiency with risk management. Technologies like blockchain and IoT are being deployed to improve visibility, traceability, and coordination across supply chain partners."
  ];

  const generateWorkContent = async () => {
    if (!task) return;
    setLoadingWork(true);
    
    let workItems = [];
    
    switch (task.name) {
      case "Copy-Paste Work":
        for (let i = 0; i < 1000; i++) {
          const para = copyPasteParagraphs[i % copyPasteParagraphs.length];
          const variation = Math.floor(i / copyPasteParagraphs.length) + 1;
          workItems.push({
            number: i + 1,
            content: para + ` [Document ${variation}, Section ${(i % 10) + 1}]`
          });
        }
        break;
        
      case "Data Entry":
      for (let i = 0; i < 80; i++) {
        workItems.push({
          sr_no: i + 1,
          full_name: "",
          phone_number: "",
          email_address: "",
          aadhar_number: "",
          pan_number: "",
          qualification: "",
          full_address: "",
          city: "",
          state: "",
          pin_code: "",
          dob: "",
          gender: "",
          salary: ""
        });
      }
      break;
        
      case "Form Filling":
        for (let i = 0; i < 80; i++) {
          workItems.push({
            sr_no: i + 1,
            full_name: "",
            email_address: "",
            phone_number: "",
            alternate_phone_number: "",
            aadhar_number: "",
            pan_number: "",
            city: "",
            state: "",
            pin_code: "",
            dob: "",
            gender: "",
            nationality: "",
            organization_company_name: "",
            total_experience_years: "",
            qualification: "",
            marital_status: "",
            full_address: ""
          });
        }
        break;
        
      case "Article Writing":
        const articleTopics = [
          "The Future of Artificial Intelligence in Healthcare", "How Remote Work is Changing Corporate Culture", "Sustainable Fashion: A Growing Movement",
          "The Impact of Social Media on Mental Health", "Cryptocurrency: Risks and Opportunities", "Electric Vehicles: The Road Ahead",
          "The Rise of Plant-Based Diets", "Cybersecurity in the Digital Age", "The Gig Economy and Its Implications",
          "Mindfulness and Productivity", "The Evolution of E-commerce", "Climate Change and Agriculture",
          "The Future of Education Technology", "Space Exploration: New Frontiers", "The Psychology of Consumer Behavior",
          "Renewable Energy Solutions", "The Impact of Gaming on Society", "Digital Marketing Trends",
          "The Future of Banking", "Healthcare Accessibility Challenges", "The Role of AI in Creative Industries",
          "Sustainable Urban Development", "The Evolution of Social Networks", "Biotechnology Breakthroughs",
          "The Future of Food Production", "Mental Health in the Workplace", "The Rise of Influencer Marketing",
          "Blockchain Beyond Cryptocurrency", "The Future of Transportation", "Global Water Crisis Solutions"
        ];
        for (let i = 0; i < 200; i++) {
          const topic = articleTopics[i % articleTopics.length];
          workItems.push({
            sr_no: i + 1,
            title: topic + ` - Part ${Math.floor(i / articleTopics.length) + 1}`,
            category: ["Technology", "Health", "Business", "Environment", "Lifestyle"][i % 5],
            word_count: "500-800 words",
            requirements: "Introduction, 3 main points, conclusion"
          });
        }
        break;
        
      case "E-Book Typing":
        const ebookTopics = [
          { heading: "The Art of Personal Development", instructions: "Write about personal growth, self-improvement strategies, goal setting, and achieving your full potential. Include practical tips and examples." },
          { heading: "Building Effective Habits", instructions: "Discuss habit formation, the science behind habits, how to build positive habits and break negative ones. Include real-life applications." },
          { heading: "Mastering Time Management", instructions: "Cover time management techniques, prioritization methods, productivity tips, and work-life balance strategies." },
          { heading: "Communication Excellence", instructions: "Write about effective communication skills, active listening, public speaking, and interpersonal relationships." },
          { heading: "Financial Intelligence", instructions: "Discuss budgeting, saving, investing basics, financial planning, and building wealth over time." },
          { heading: "Leadership and Teamwork", instructions: "Cover leadership qualities, team building, motivation techniques, and managing people effectively." },
          { heading: "Health and Wellness", instructions: "Write about physical fitness, mental health, nutrition, and maintaining a healthy lifestyle." },
          { heading: "Career Development", instructions: "Discuss career planning, skill development, networking, and professional growth strategies." },
          { heading: "Emotional Intelligence", instructions: "Cover understanding emotions, empathy, self-awareness, and managing relationships." },
          { heading: "Creativity and Innovation", instructions: "Write about fostering creativity, problem-solving techniques, and innovative thinking." }
        ];
        for (let i = 0; i < 100; i++) {
          const page = ebookTopics[i % ebookTopics.length];
          workItems.push({
            page_number: i + 1,
            chapter: `Chapter ${Math.floor(i / 20) + 1}`,
            topic: page.heading,
            instructions: page.instructions,
            word_count: "Write 200-300 words on this topic"
          });
        }
        break;
        
      case "Email Replies":
        // Generate 200 SHORT (7-8 lines), VARIED FORMAT emails
        const emailFormats = [
          (i, ord, amt, issue) => `Hi Support,\n\nOrder ${ord} - ₹${amt} payment done but ${issue}. Already 3 days passed. Need urgent help.\n\nPls resolve ASAP.\n\nThanks,\nCustomer`,
          (i, ord, amt, issue) => `Dear Team,\n\nI placed order ${ord} worth ₹${amt}. Facing ${issue} since yesterday. Tried calling but no response.\n\nKindly look into this immediately.\n\nRegards`,
          (i, ord, amt, issue) => `Hello,\n\n${issue} issue in order ${ord}. Amount ₹${amt} already paid. Very disappointed with service quality.\n\nExpecting quick resolution today.\n\nCustomer #${i}`,
          (i, ord, amt, issue) => `Support Team,\n\nUrgent! Order ${ord} has ${issue}. Paid ₹${amt} but product not working properly. Need replacement or refund.\n\nPlease help immediately.`,
          (i, ord, amt, issue) => `Hi there,\n\nOrder number ${ord}. Payment ${amt} completed successfully but getting ${issue} error. Can't use the product.\n\nWaiting for your response.\n\nThanks!`,
          (i, ord, amt, issue) => `Dear Support,\n\n${issue} problem in my order ${ord}. This is unacceptable after paying ₹${amt}. Need immediate solution.\n\nPlease escalate if required.\n\nCustomer`,
          (i, ord, amt, issue) => `Hello Team,\n\nFacing ${issue} with order ${ord}. Already paid full amount ₹${amt}. Tried multiple times but issue persists.\n\nKindly help urgently.`,
          (i, ord, amt, issue) => `Hi,\n\nOrder ${ord} - ${issue} not resolved yet. Amount ₹${amt} deducted but service not working. Very frustrated now.\n\nNeed quick fix please!\n\nRegards`,
          (i, ord, amt, issue) => `Support,\n\n${issue} in order ${ord} for last 2 days. Payment ₹${amt} done. No response from your team till now.\n\nPlease resolve immediately.\n\nThank you`,
          (i, ord, amt, issue) => `Dear Sir/Madam,\n\nOrder ${ord} showing ${issue}. Paid ₹${amt} yesterday. Need urgent assistance as this is affecting my work.\n\nWaiting for prompt action.`
        ];
        
        const shortIssues = ["payment pending", "order not delivered", "wrong item received", "product defect", "login issue", "account suspended", "refund delay", "technical error", "billing mistake", "service unavailable", "activation failed", "data not syncing", "poor quality", "broken product", "missing features", "slow performance", "connection timeout", "invalid code", "expired subscription", "duplicate charge"];
        
        for (let i = 0; i < 200; i++) {
          const formatFunc = emailFormats[i % 10];
          const issue = shortIssues[i % 20];
          const orderID = "WD" + (10000 + i);
          const amount = (1500 + (i * 127) % 8500).toLocaleString();
          
          workItems.push({
            sr_no: i + 1,
            scenario: `Customer Query ${i + 1}`,
            type: ["Support", "Billing", "Technical", "Sales", "Service"][i % 5],
            customer_query: formatFunc(i + 1, orderID, amount, issue),
            instructions: "Reply professionally in 5-7 lines with solution"
          });
        }
        break;
        
      case "English-Hindi Translation":
        // Generate 250 COMPLETELY UNIQUE translation items - absolutely no repetition
        const translationSubjects = ["Advanced manufacturing processes", "Sustainable agricultural practices", "Digital healthcare platforms", "Modern educational systems", "Global financial networks", "Cultural heritage conservation", "Smart transportation solutions", "Renewable energy technologies", "Urban development planning", "Environmental protection measures", "Scientific research methodologies", "Industrial safety protocols", "Social welfare programs", "Information technology infrastructure", "Pharmaceutical innovations", "Automotive engineering advances", "Telecommunications networks", "Real estate development", "Tourism industry growth", "Sports training facilities", "Media content creation", "Food processing industries", "Textile manufacturing sectors", "Construction quality management", "Legal regulatory frameworks", "Public health campaigns", "Aerospace technology development", "Maritime transportation systems", "Agricultural export markets", "Retail business operations"];
        
        for (let i = 0; i < 250; i++) {
          const subject = translationSubjects[i % 30];
          const regions = 18 + (i * 11) % 82;
          const participants = 250 + (i * 23) % 1750;
          const years = 2016 + (i % 9);
          const growth = 22 + (i * 17) % 78;
          const investments = 500 + (i * 43) % 9500;
          const facilities = 15 + (i * 7) % 85;
          const workforce = 1000 + (i * 67) % 19000;
          const indicators = ["productivity", "efficiency", "quality", "sustainability", "innovation", "accessibility", "reliability", "scalability", "profitability", "competitiveness"][i % 10];
          const methods = ["integrated planning", "stakeholder consultation", "data-driven analysis", "collaborative frameworks", "systematic implementation", "continuous monitoring", "adaptive management", "evidence-based strategies", "comprehensive evaluation", "strategic coordination"][Math.floor(i / 25) % 10];
          
          workItems.push({
            sr_no: i + 1,
            topic: subject,
            english_text: `${subject} deployed across ${regions} geographical regions since ${years} demonstrate substantial contributions toward ${indicators} improvements benefiting approximately ${participants} direct participants and stakeholders. Government and private sector partnerships have mobilized investments exceeding ₹${investments} crore supporting ${facilities} specialized facilities and employing ${workforce} skilled professionals. Strategic frameworks emphasize ${methods} ensuring alignment between policy objectives and operational realities on ground. Research conducted by independent evaluation teams validates significant positive outcomes across economic development, social welfare, and environmental sustainability dimensions. Implementation methodologies incorporate international best practices adapted to local contextual requirements through extensive consultation processes. Capacity building programs train practitioners in advanced techniques and emerging technologies enhancing service delivery quality. Performance monitoring systems utilize digital platforms collecting real-time data enabling evidence-based decision making and timely corrective actions. Stakeholder feedback mechanisms ensure accountability and responsiveness addressing evolving needs and priorities effectively. Future scaling plans target expanding coverage to underserved populations and remote geographical areas requiring infrastructure development. Success factors include political commitment, adequate resource allocation, inter-agency coordination, community participation, and continuous learning from implementation experiences globally. [Translation ${i + 1} - Code: TN${years}${i}${growth}]`,
            word_count: "155-165 words"
          });
        }
        break;
        
      case "Grammar Correction":
        // Generate 200 TRULY UNIQUE grammar items - each completely different
        const grammarSentenceStarts = ["Leading multinational corporations", "Government healthcare initiatives", "International research collaborations", "Educational technology programs", "Environmental conservation projects", "Financial regulatory frameworks", "Transportation infrastructure developments", "Agricultural modernization schemes", "Digital transformation strategies", "Cultural preservation movements", "Scientific innovation efforts", "Industrial automation systems", "Social welfare campaigns", "Urban development plans", "Energy sustainability programs", "Tourism promotion initiatives", "Sports development federations", "Media communication networks", "Construction quality standards", "Trade facilitation agreements", "Medical research facilities", "Academic excellence programs", "Business expansion ventures", "Community engagement services", "Manufacturing efficiency improvements", "Legal compliance frameworks", "Pharmaceutical development initiatives", "Automotive industry innovations", "Real estate investment strategies", "Telecommunications infrastructure upgrades"];
        
        for (let i = 0; i < 100; i++) {
          const start = grammarSentenceStarts[i % 30];
          const years = 2015 + (i % 10);
          const countries = 12 + (i * 7) % 88;
          const orgs = 25 + (i * 13) % 175;
          const experts = 8 + (i * 5) % 42;
          const percent = 18 + (i * 9) % 82;
          const months = 6 + (i * 3) % 54;
          const sectors = ["healthcare", "education", "technology", "finance", "manufacturing", "agriculture", "energy", "transportation", "retail", "services"][i % 10];
          const actions = ["implementing", "developing", "establishing", "enhancing", "optimizing", "coordinating", "facilitating", "strengthening", "advancing", "transforming"][Math.floor(i / 20) % 10];
          
          workItems.push({
            sr_no: i + 1,
            incorrect_text: `${start} operating across ${countries} nations have been ${actions} comprehensive initiatives since ${years} achieving remarkable progress in ${sectors} sector. Research teams was analyzing data from ${orgs} participating organizations to identify best practices and implementation strategies. Senior leadership believes that collaborative partnerships between stakeholders is essential for sustainable outcomes. Expert consultations involving ${experts} industry specialists has revealed critical success factors and potential challenges. Performance data indicates ${percent} percent improvement in operational metrics following systematic reforms. Implementation plans was developed through extensive stakeholder engagement processes lasting ${months} months. Policy frameworks emphasizes evidence-based approaches combining theoretical research with practical field applications. Evaluation studies demonstrates significant positive impacts across economic, social, and environmental dimension. Future expansion efforts is expected to reach additional regions and beneficiary populations. Strategic recommendations highlights the importance of continued investment, capacity building, and adaptive management practices. [Grammar ${i + 1} - ID: GX${years}${i}${percent}]`,
            error_types: "Subject-verb agreement, plural forms, verb tense, articles"
          });
        }
        break;
        
      case "PDF to Word Conversion":
        // Use exact file content - 200 unique items
        const pdfTopics = ["Morning Routine 1", "Healthy Eating Habits 1", "Online Education System 1", "Mobile Phone Usage 1", "Cyber Security Awareness 1", "Office Discipline 1", "Customer Service Skills 1", "Digital Banking System 1", "Environmental Protection 1", "Time Management 1", "Career Development 1", "Financial Planning 1", "Social Media Impact 1", "Physical Fitness 1", "Mental Health 1", "Technology Advancement 1", "Data Privacy 1", "Remote Work Culture 1", "Leadership Skills 1", "Communication Skills 1", "Team Building 1", "Problem Solving 1", "Critical Thinking 1", "Stress Management 1", "Work Life Balance 1", "Professional Ethics 1", "Business Strategy 1", "Marketing Fundamentals 1", "Sales Techniques 1", "Project Management 1"];
        
        const baseContent = " is an important subject that affects both personal life and professional growth in many ways. A clear understanding of this topic helps individuals make informed and responsible decisions in daily situations. In modern times, people frequently face challenges related to this area due to lack of proper awareness and planning. Developing knowledge about this subject improves efficiency, confidence, and long-term stability. Many individuals underestimate the importance of small details connected to this topic, which often leads to avoidable mistakes. With proper guidance and consistent effort, these challenges can be handled in a more effective manner. Practical application of concepts related to this topic saves time, effort, and valuable resources. Learning from real-life experiences and examples makes understanding deeper and more meaningful. Technological advancements have also changed how this topic is approached and managed today. Clear awareness helps reduce confusion, stress, and unnecessary errors in routine tasks. Building good habits related to this subject supports steady personal improvement over time. Regular practice and reflection strengthen skills and improve overall performance.";
        
        for (let i = 0; i < 200; i++) {
          const topic = pdfTopics[i % 30];
          const variation = Math.floor(i / 30) + 1;
          const topicWithNum = topic.replace(" 1", ` ${variation}`);
          workItems.push({
            page_number: i + 1,
            document_title: topicWithNum,
            content_to_type: topicWithNum + baseContent
          });
        }
        break;
        
      case "Captcha Filling":
        const generateHardCaptcha = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&';
          let result = '';
          const length = 6 + Math.floor(Math.random() * 3);
          for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
          return result;
        };
        for (let i = 0; i < 1500; i++) {
          const isMath = Math.random() > 0.7;
          if (isMath) {
            const a = Math.floor(Math.random() * 100) + 10;
            const b = Math.floor(Math.random() * 50) + 1;
            const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
            workItems.push({
              sr_no: i + 1,
              captcha_type: "Math",
              captcha_display: `${a} ${op} ${b} = ?`,
              difficulty: "Hard"
            });
          } else {
            workItems.push({
              sr_no: i + 1,
              captcha_type: "Text",
              captcha_display: generateHardCaptcha(),
              difficulty: "Hard"
            });
          }
        }
        break;
        
      case "Chat Support":
        const chatQueries = [
          { scenario: "Billing Dispute", message: "Hi, I noticed that I was charged $149.99 on my credit card but my subscription is supposed to be $99.99 per month. I've been a loyal customer for 3 years and this is very concerning. Can you please investigate and explain why I was overcharged? I need this resolved today.", type: "Billing" },
          { scenario: "Product Malfunction", message: "The laptop I purchased last month has started making a strange buzzing noise whenever I use it for more than an hour. The screen also flickers occasionally. I'm worried it might be a hardware defect. What should I do? I really need this laptop for my work.", type: "Technical" },
          { scenario: "Shipping Delay", message: "I placed an order 10 days ago with express shipping that promised 2-3 day delivery. The tracking hasn't updated in 5 days and customer service emails go unanswered. This was a birthday gift and the birthday has already passed. This is extremely disappointing.", type: "Delivery" },
          { scenario: "Account Security", message: "I received an email saying someone tried to access my account from a different country. I'm really worried about the security of my personal information and saved payment methods. Please help me secure my account and let me know what steps I should take.", type: "Security" },
          { scenario: "Subscription Confusion", message: "I thought I signed up for a monthly subscription but I was charged for an annual plan. I only wanted to try the service for a month before committing. How can I get this changed to monthly billing? I don't want to pay for a full year upfront.", type: "Subscription" },
          { scenario: "Quality Complaint", message: "The product quality is nothing like what was advertised. The material feels cheap, the stitching is coming apart after just one wash, and the colors have already faded. This is not what I expected from your brand. I want a full refund and an apology.", type: "Quality" },
          { scenario: "Feature Help", message: "I've been trying to figure out how to export my data from your platform but I can't find the option anywhere. I've searched the help center and watched tutorial videos but nothing explains this clearly. Can you guide me step by step?", type: "How-To" },
          { scenario: "Upgrade Inquiry", message: "I'm currently on the Basic plan but I'm considering upgrading to Premium. Can you explain all the differences between the plans? What additional features would I get? Is there a trial period for the Premium features before I commit?", type: "Sales" },
          { scenario: "Cancellation Issue", message: "I cancelled my subscription last month but I was charged again this month. I have the cancellation confirmation email. Why am I still being billed? I demand an immediate refund and confirmation that no future charges will occur.", type: "Cancellation" },
          { scenario: "Integration Problem", message: "I'm trying to integrate your API with our existing system but I keep getting authentication errors. I've followed the documentation exactly but something isn't working. Our development team is stuck and we have a deadline approaching.", type: "Technical" }
        ];
        for (let i = 0; i < 125; i++) {
          const chat = chatQueries[i % chatQueries.length];
          workItems.push({
            sr_no: i + 1,
            scenario: chat.scenario,
            type: chat.type,
            customer_message: chat.message
          });
        }
        break;
        
      case "Email Questions":
        const emailQuestions = [
          { scenario: "Leave Application", question: "I need to apply for 5 days of casual leave starting next Monday due to a family emergency. What is the proper procedure for applying? Do I need any supporting documents? How long does approval usually take?", department: "HR" },
          { scenario: "System Access", question: "I'm a new employee and I still don't have access to several essential systems including the project management tool and the internal knowledge base. It's been two weeks since I joined. Can someone help me get the required access?", department: "IT" },
          { scenario: "Expense Reimbursement", question: "I submitted my travel expense report 3 weeks ago but haven't received the reimbursement yet. The total amount is ₹45,000 for client meetings in Mumbai. Can you please check the status and let me know when I can expect the payment?", department: "Finance" },
          { scenario: "Project Update", question: "The client is asking for a detailed progress update on the Phase 2 deliverables. Can you send me the latest status of all work streams? I have a call with them tomorrow afternoon and need accurate information.", department: "Management" },
          { scenario: "Vendor Query", question: "We haven't received the raw materials shipment that was due last week. Our production line is now at risk of stopping. Can you contact the vendor immediately and get a confirmed delivery date? This is urgent.", department: "Procurement" },
          { scenario: "Training Request", question: "I would like to enroll in the advanced data analytics certification program. The course starts next month and costs ₹25,000. Does the company sponsor such certifications? What is the approval process?", department: "L&D" },
          { scenario: "Policy Clarification", question: "I'm confused about the new work-from-home policy. How many days per week can we work remotely? Do we need manager approval each time? Are there specific days when everyone must be in office?", department: "Admin" },
          { scenario: "Performance Review", question: "My annual performance review was scheduled for last week but got postponed. When can we reschedule? I have some important achievements to discuss and would like to understand the criteria for promotion consideration.", department: "HR" },
          { scenario: "Client Escalation", question: "The client has escalated a critical issue to senior management. They're unhappy with the response time from our support team. Can we arrange an urgent call to understand their concerns and propose a resolution plan?", department: "Operations" },
          { scenario: "Resource Request", question: "Our team is understaffed for the current project load. We need at least 2 additional developers with React and Node.js experience. Can you help initiate the hiring process or arrange for temporary contractors?", department: "Resource Management" }
        ];
        for (let i = 0; i < 200; i++) {
          const item = emailQuestions[i % emailQuestions.length];
          workItems.push({
            sr_no: i + 1,
            scenario: item.scenario,
            department: item.department,
            question: item.question
          });
        }
        break;
        
      case "Survey Filling":
        const surveyQuestions = [
          { question: "How satisfied are you with the overall quality of our products compared to competitors in the market? Please consider factors like durability, design, and value for money.", category: "Product Quality" },
          { question: "Based on your recent interactions, how would you rate the professionalism and helpfulness of our customer service team? Did they resolve your issues effectively?", category: "Customer Service" },
          { question: "How likely are you to recommend our company to friends, family, or colleagues? What factors would influence your recommendation?", category: "Net Promoter Score" },
          { question: "How easy was it to navigate our website and find the products or information you were looking for? Were there any areas that caused confusion?", category: "User Experience" },
          { question: "Do you believe our products offer good value for the price? How does our pricing compare to similar products you've considered?", category: "Value for Money" },
          { question: "How satisfied are you with the speed and reliability of our delivery service? Did your orders arrive on time and in good condition?", category: "Delivery Experience" },
          { question: "Overall, how would you describe your experience with our brand? What has been the highlight and what could we improve?", category: "Overall Experience" },
          { question: "How responsive and effective was our support team in addressing your concerns? Were your issues resolved to your satisfaction?", category: "Support Quality" },
          { question: "How likely are you to purchase from us again in the future? What would encourage you to become a repeat customer?", category: "Customer Loyalty" },
          { question: "How would you rate the packaging of our products? Was it environmentally friendly, protective, and aesthetically pleasing?", category: "Packaging" }
        ];
        for (let i = 0; i < 1000; i++) {
          const survey = surveyQuestions[i % surveyQuestions.length];
          workItems.push({
            sr_no: i + 1,
            category: survey.category,
            question: survey.question,
            options: "A) Excellent | B) Good | C) Average | D) Poor"
          });
        }
        break;
        
      default:
        for (let i = 0; i < 100; i++) {
          workItems.push({
            sr_no: i + 1,
            task: `Work Item ${i + 1}`,
            description: "Complete this task according to instructions"
          });
        }
    }
    
    setGeneratedWork(workItems);
    setCurrentPageStartTime(new Date());
    setLoadingWork(false);
  };

  const downloadCSV = async () => {
    if (generatedWork.length === 0) return;
    
    // Save final page timing before download
    if (currentPageStartTime) {
      const endTime = new Date();
      const durationMs = endTime - currentPageStartTime;
      const durationSeconds = Math.floor(durationMs / 1000);
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      
      setPageTimings(prev => [...prev, {
        page: getSavedCount() || generatedWork.length,
        startTime: currentPageStartTime,
        endTime: endTime,
        duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }]);
    }
    
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const startTime = activeTask?.start_time ? moment(activeTask.start_time).format('YYYY-MM-DD HH:mm:ss') : 'N/A';
    const userName = user?.full_name || user?.email || 'User';
    const userId = user?.user_id || user?.id || 'N/A';
    
    // Digital Checker - Auto-validation for Data Entry & Form Filling
    if ((task.name === "Data Entry" || task.name === "Form Filling") && user?.role !== 'admin') {
      try {
        // Fetch original data for this task
        const originalDatasets = await base44.entities.OriginalTaskData.filter({ task_name: task.name });
        
        if (originalDatasets && originalDatasets.length > 0) {
          const originalData = originalDatasets[0];
          const validationResults = [];
          let totalFields = 0;
          let correctFields = 0;
          let incorrectFields = 0;
          
          // Validate each item up to the length of original data
          const itemsToValidate = Math.min(generatedWork.length, originalData.data_items?.length || 0);
          
          for (let itemIndex = 0; itemIndex < itemsToValidate; itemIndex++) {
            const originalItem = originalData.data_items[itemIndex];
            
            // Get all fields from original item
            Object.keys(originalItem).forEach(field => {
              if (field !== 'sr_no' && field !== 'number' && field !== 'id') {
                const userInput = (userAnswers[`${itemIndex}_${field}`] || '').toString().trim();
                const originalValue = (originalItem[field] || '').toString().trim();
                
                // Normalize for comparison
                const normalizedUser = userInput.toLowerCase().replace(/\s+/g, ' ');
                const normalizedOriginal = originalValue.toLowerCase().replace(/\s+/g, ' ');
                
                const isCorrect = normalizedUser === normalizedOriginal;
                
                totalFields++;
                if (isCorrect) correctFields++;
                else incorrectFields++;
                
                validationResults.push({
                  field: field,
                  original: originalValue,
                  user_input: userInput,
                  status: isCorrect ? 'correct' : (userInput ? 'incorrect' : 'missing'),
                  item_number: itemIndex + 1
                });
              }
            });
          }
          
          const accuracyPercentage = totalFields > 0 ? (correctFields / totalFields) * 100 : 0;
          
          // Create validation report in background
          await base44.entities.ValidationReport.create({
            user_id: user.id,
            user_name: userName,
            task_id: taskId,
            task_name: task.name,
            original_data_id: originalData.id,
            validation_results: validationResults,
            total_fields: totalFields,
            correct_fields: correctFields,
            incorrect_fields: incorrectFields,
            accuracy_percentage: accuracyPercentage,
            generated_date: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Validation error:", error);
      }
    }
    
    // Create task activity log
    try {
      await base44.entities.TaskActivityLog.create({
        user_id: user.id,
        user_name: userName,
        task_id: taskId,
        task_name: task.name,
        activity_type: 'task_completed',
        start_time: activeTask?.start_time || new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: activeTask?.start_time ? Math.floor((new Date() - new Date(activeTask.start_time)) / 1000) : 0
      });
    } catch (error) {
      console.error("Activity log error:", error);
    }
    
    // Create readable text format
    let fileContent = `════════════════════════════════════════════════════════════════
                    WORKDEN - TASK SUBMISSION FILE
════════════════════════════════════════════════════════════════

Task Name: ${task?.name || 'Unknown'}
User ID: ${userId}
User Name: ${userName}
Started At: ${startTime}
Submitted At: ${now}
Total Items: ${generatedWork.length}
Completed Items: ${getSavedCount()}

════════════════════════════════════════════════════════════════
                    📊 PAGE-WISE TIMING DETAILS
════════════════════════════════════════════════════════════════

${pageTimings.length > 0 ? pageTimings.map(timing => `
📄 Page ${timing.page}:
   ⏰ Start Time:     ${timing.startTime.toLocaleTimeString()}
   🏁 End Time:       ${timing.endTime.toLocaleTimeString()}
   ⌛ Duration:       ${timing.duration}
   📅 Timestamp:      ${timing.endTime.toLocaleString()}
   ─────────────────────────────────────────────────────────────
`).join('\n') : 'No page timings recorded'}

════════════════════════════════════════════════════════════════
                         USER INPUTS
════════════════════════════════════════════════════════════════

`;

    generatedWork.forEach((item, index) => {
      // Page timing for this item
      const pageTiming = pageTimings.find(t => t.page === index + 1);
      
      fileContent += `────────────────────────────────────────────────────────────────
ITEM #${index + 1} ${savedItems[index] ? '✓ COMPLETED' : '○ NOT SAVED'}
────────────────────────────────────────────────────────────────
`;

      // Add page timing if available
      if (pageTiming) {
        fileContent += `
📊 Page Timing:
   ⏰ Start Time:     ${pageTiming.startTime.toLocaleTimeString()}
   🏁 End Time:       ${pageTiming.endTime.toLocaleTimeString()}
   ⌛ Duration:       ${pageTiming.duration}
   📅 Timestamp:      ${pageTiming.endTime.toLocaleString()}

`;
      }
      
      // Add original item data
      Object.entries(item).forEach(([key, value]) => {
        if (key !== 'sr_no' && key !== 'number') {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          fileContent += `${label}: ${value || ''}\n`;
        }
      });
      
      // Add ALL user answers for this item (including empty ones)
      fileContent += `\n--- User Inputs ---\n`;
      
      // For Data Entry & Form Filling tasks, show ALL fields with their values
      if (task.name === "Data Entry" || task.name === "Form Filling") {
        Object.entries(item).forEach(([key, value]) => {
          if (key !== 'sr_no' && key !== 'number') {
            const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const userValue = userAnswers[`${index}_${key}`] || '';
            fileContent += `${fieldName}: ${userValue}\n`;
          }
        });
      } else {
        // For other tasks, show what user typed
        let hasAnswers = false;
        Object.keys(userAnswers).forEach(key => {
          if (key.startsWith(`${index}_`)) {
            const fieldName = key.replace(`${index}_`, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const answer = userAnswers[key] || '';
            if (answer) {
              fileContent += `${fieldName}: ${answer}\n`;
              hasAnswers = true;
            }
          }
        });
        
        if (!hasAnswers) {
          fileContent += `(No answers provided)\n`;
        }
      }
      
      fileContent += `\n`;
    });

    fileContent += `════════════════════════════════════════════════════════════════
                         END OF FILE
════════════════════════════════════════════════════════════════

⚠️  IMPORTANT NOTICE - DO NOT EDIT THIS FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an official WorkDen submission file. 
Any modifications to this file will be detected and may result in:
   • Task rejection
   • Account suspension
   • Legal action

This file is digitally tracked and verified.
DO NOT alter, edit, or tamper with any content.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by WorkDen Platform
File Generated: ${now}
Digital Signature: WD-${userId}-${Date.now()}
`;
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `WorkDen_${task?.name?.replace(/\s+/g, '_')}_${userName.replace(/\s+/g, '_')}_${userId}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.txt`;
    link.click();
  };

  useEffect(() => {
    if (task && generatedWork.length === 0) {
      generateWorkContent();
    }
  }, [task]);

  useEffect(() => {
    if (task?.name) {
      base44.entities.TrainingVideo.filter({ task_name: task.name })
        .then(setTrainingVideos)
        .catch(() => setTrainingVideos([]));
    }
  }, [task?.name]);

  const getGradient = (index) => {
    const gradients = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-amber-500 to-orange-600",
      "from-cyan-500 to-blue-600"
    ];
    return gradients[index % gradients.length];
  };

  // Optimized captcha display (no animations, faster rendering)
  const renderCaptchaDisplay = (captchaText, type) => {
    if (type === "Math") {
      return (
        <div className="p-4 bg-gray-200 rounded-lg border-2 border-gray-400 text-center">
          <p className="text-2xl md:text-3xl font-bold text-gray-900 font-mono">
            {captchaText}
          </p>
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-400 text-center">
        <div className="flex justify-center items-center">
          {captchaText.split('').map((char, i) => (
            <span 
              key={i}
              className="text-xl md:text-2xl font-bold select-none"
              style={{ 
                fontFamily: 'monospace',
                color: '#333'
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ✅ Issue #4: Check time BEFORE showing preview/loading so back goes to tasks without popup
  if (!isWithinActiveHours) {
    return <TaskTimeLockScreen />;
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
          <h2 className="text-xl font-bold mb-2">Loading Task...</h2>
        </Card>
      </div>
    );
  }

  // Show loading while task is being fetched
  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
          <h2 className="text-xl font-bold mb-2">Loading Task...</h2>
        </Card>
      </div>
    );
  }

  // Preview Mode - Before Starting Task
  if (showPreview && !taskStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link to={createPageUrl("Tasks")}>
              <Button variant="outline" size="icon" className="shadow-md">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {task.name}
              </h1>
              <p className="text-gray-600">Reward: ₹{task.reward}</p>
            </div>
          </div>

          {/* Task Preview Card */}
          <Card className="mb-6 shadow-2xl border-2 border-purple-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                Task Preview - Read Before Starting
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Watch Demo Video Button */}
                {trainingVideos.length > 0 && trainingVideos.find(v => v.task_name === task?.name) && (
                  <Button
                    onClick={() => {
                      const taskVideo = trainingVideos.find(v => v.task_name === task?.name);
                      if (!taskVideo) return;
                      
                      const videoUrl = taskVideo.video_url;
                      let embedUrl = videoUrl;
                      
                      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                        const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (videoUrl.includes('drive.google.com')) {
                        const fileId = videoUrl.match(/\/file\/d\/([^/]+)/)?.[1] || videoUrl.match(/[?&]id=([^&]+)/)?.[1];
                        if (fileId) embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                      }
                      
                      const dialog = document.createElement('div');
                      dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
                      dialog.innerHTML = `<div style="width:100%;max-width:1200px;height:80vh;background:white;border-radius:12px;overflow:hidden;position:relative"><button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:20px">×</button><iframe src="${embedUrl}" style="width:100%;height:100%;border:none" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;
                      document.body.appendChild(dialog);
                      dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-6 text-lg shadow-lg"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    🎥 Watch Demo Video
                  </Button>
                )}

                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Important Instructions
                  </h3>
                  <ul className="text-sm text-amber-800 space-y-2">
                    <li>• Total items: <strong>{generatedWork.length}</strong></li>
                    <li>• Time limit: <strong>8 Hours</strong> after clicking "I'm Starting The Task"</li>
                    <li className="font-bold text-base text-yellow-900 bg-yellow-200 p-2 rounded">⚠️ Task must be completed 75% minimum</li>
                    <li className="font-bold text-base text-green-900 bg-green-200 p-2 rounded">✅ Accuracy must be 99%</li>
                    <li>• Once started, you CANNOT leave without completing</li>
                    <li>• If you go back after starting, task will be <strong>LOCKED until tomorrow 9:00 AM</strong></li>
                    <li className="font-bold text-base text-blue-900 bg-blue-200 p-2 rounded">🕘 Tasks Active: 9:00 AM - 11:30 PM Only</li>
                    {!isCopyPasteTask && <li>• <strong>Copy-Paste is DISABLED</strong> - You must type manually</li>}
                  </ul>
                </div>

                {/* Sample Preview with Timer */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Task Preview - First 2 Items
                    </h3>
                    <Badge className="bg-purple-600 text-white">
                      <Timer className="w-3 h-3 mr-1" />
                      8 Hours After Start
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedWork.slice(0, 2).map((item, index) => {
                      const gradient = getGradient(index);
                      return (
                        <Card key={index} className="overflow-hidden shadow-lg">
                          <CardHeader className={`bg-gradient-to-r ${gradient} text-white p-3`}>
                            <CardTitle className="text-sm">Item #{index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              {task.name === "Data Entry" && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(item).slice(0, 4).map(([key, val]) => (
                                    <div key={key} className="p-2 bg-gray-50 rounded">
                                      <p className="font-semibold text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                                      <Input placeholder="..." className="mt-1 h-7 text-xs" disabled />
                                    </div>
                                  ))}
                                </div>
                              )}
                              {task.name === "Form Filling" && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(item).slice(0, 4).map(([key, val]) => (
                                    <div key={key} className="p-2 bg-gray-50 rounded">
                                      <p className="font-semibold text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                                      <Input placeholder="..." className="mt-1 h-7 text-xs" disabled />
                                    </div>
                                  ))}
                                </div>
                              )}
                              {task.name === "Copy-Paste Work" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-xs text-gray-600 line-clamp-3">{item.content?.substring(0, 150)}...</p>
                                  </div>
                                  <Textarea placeholder="Paste here..." rows={2} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "Captcha Filling" && (
                                <div className="space-y-2">
                                  {renderCaptchaDisplay(item.captcha_display, item.captcha_type)}
                                  <Input placeholder="Enter captcha..." disabled className="text-center h-8 text-xs" />
                                </div>
                              )}
                              {task.name === "Article Writing" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                    <p className="font-bold text-xs text-purple-900">{item.title}</p>
                                    <div className="flex gap-1 mt-1">
                                      <Badge className="bg-purple-500 text-[10px] px-1 py-0">{item.category}</Badge>
                                    </div>
                                  </div>
                                  <Textarea placeholder="Write article..." rows={3} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "E-Book Typing" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                                    <p className="text-xs font-bold text-amber-900">{item.topic}</p>
                                    <p className="text-[10px] text-gray-600 mt-1 line-clamp-2">{item.instructions}</p>
                                  </div>
                                  <Textarea placeholder="Write content..." rows={3} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "Email Replies" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-red-50 rounded border border-red-200">
                                    <Badge className="bg-red-500 text-[10px] px-1 py-0 mb-1">{item.type}</Badge>
                                    <p className="text-[10px] text-gray-700 line-clamp-2">{item.customer_query}</p>
                                  </div>
                                  <Textarea placeholder="Reply..." rows={2} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "English-Hindi Translation" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-[10px] text-gray-700 line-clamp-3">{item.english_text}</p>
                                  </div>
                                  <Textarea placeholder="Hindi translation..." rows={2} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "Grammar Correction" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-red-50 rounded border border-red-200">
                                    <p className="text-[10px] text-gray-700 italic line-clamp-2">{item.incorrect_text}</p>
                                  </div>
                                  <Textarea placeholder="Corrected text..." rows={2} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "PDF to Word Conversion" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                    <p className="font-bold text-xs text-orange-900">{item.document_title}</p>
                                    <p className="text-[10px] text-gray-600 mt-1 line-clamp-2">{item.content_to_type}</p>
                                  </div>
                                  <Textarea placeholder="Type content..." rows={3} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "Chat Support" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-gray-50 rounded border">
                                    <Badge className="bg-cyan-500 text-[10px] px-1 py-0 mb-1">{item.type}</Badge>
                                    <p className="text-[10px] text-gray-700 line-clamp-2">{item.customer_message}</p>
                                  </div>
                                  <Textarea placeholder="Response..." rows={2} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "Email Questions" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
                                    <Badge className="bg-indigo-500 text-[10px] px-1 py-0 mb-1">{item.department}</Badge>
                                    <p className="text-[10px] text-gray-700 line-clamp-2">{item.question}</p>
                                  </div>
                                  <Textarea placeholder="Answer..." rows={2} disabled className="text-xs" />
                                </div>
                              )}
                              {task.name === "Survey Filling" && (
                                <div className="space-y-2">
                                  <div className="p-3 bg-pink-50 rounded border border-pink-200">
                                    <Badge className="bg-pink-500 text-[10px] px-1 py-0 mb-1">{item.category}</Badge>
                                    <p className="text-[10px] text-gray-700 line-clamp-2">{item.question}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    {['A', 'B'].map(opt => (
                                      <div key={opt} className="p-2 bg-white rounded border text-center">
                                        <span className="text-[10px] font-medium">{opt === 'A' ? 'Excellent' : 'Good'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center pt-4">
                  <Button 
                    onClick={handleStartTask}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-12 py-6 text-lg shadow-2xl transition-all duration-100"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    I'm Starting The Task
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    ⏰ 8 hour countdown will begin after clicking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Card */}
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-bold text-red-900">⚠️ Task Lock Warning</h3>
                  <p className="text-sm text-red-700 mt-1">
                    If you click "I'm Starting The Task" and then go back or close the page before completing, 
                    this task will be <strong>locked until tomorrow 9:00 AM</strong>. Make sure you have enough time before starting.
                  </p>
                  <p className="text-sm text-blue-900 mt-2 font-semibold">
                    🕘 Tasks are only active between 9:00 AM - 11:30 PM daily.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const lockUntilTime = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(9, 0, 0, 0);
    return t.toISOString();
  })();

  const handleLeaveConfirm = async () => {
    if (activeTask && user?.task_lock_enabled !== false) {
      const lockUntil = new Date();
      lockUntil.setDate(lockUntil.getDate() + 1);
      lockUntil.setHours(9, 0, 0, 0);
      await base44.entities.ActiveTask.update(activeTask.id, {
        status: 'locked',
        locked_until: lockUntil.toISOString(),
        lock_reason: 'incomplete'
      });
    }
    localStorage.removeItem(`task_${taskId}_state`);
    setShowLeaveWarning(false);
    window.location.href = "#" + createPageUrl("Tasks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 pb-32">
      <TaskTimeLockChecker onTimeCheck={setIsWithinActiveHours} />
      <TaskLeaveWarning
        isOpen={showLeaveWarning}
        onStay={() => setShowLeaveWarning(false)}
        onLeave={handleLeaveConfirm}
        lockUntilTime={lockUntilTime}
      />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="shadow-md"
            onClick={() => {
              if (taskStarted && !isExpired) {
                setShowLeaveWarning(true);
              } else {
                window.location.href = "#" + createPageUrl("Tasks");
              }
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {task.name}
            </h1>
            <p className="text-gray-600">Reward: ₹{task.reward}</p>
          </div>
        </div>

        {/* Timer - Sticky */}
        <div className="sticky top-16 z-20 mb-4">
          <Card className={`bg-gradient-to-r ${getTimerColor()} text-white shadow-2xl`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Timer className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
                  <div>
                    <p className="text-xs opacity-90">Time Remaining</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold font-mono">{formatTime(timeRemaining)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {getSavedCount()}/{generatedWork.length}
                  </Badge>
                  <Button 
                    onClick={downloadCSV}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 border border-white/40 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download File
                  </Button>
                </div>
              </div>
              {timeRemaining <= 3600 && (
                <div className="mt-2 p-2 bg-white/20 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Less than 1 hour remaining!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work Items */}
        <div className="space-y-4">
          {generatedWork.map((item, index) => (
            <Card 
              key={index} 
              className={`shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                savedItems[index] 
                  ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' 
                  : 'border-gray-200 hover:border-purple-300 bg-white'
              }`}
            >
              <CardHeader className={`pb-2 sm:pb-3 bg-gradient-to-r ${getGradient(index)} text-white`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center font-bold backdrop-blur-sm text-sm sm:text-base">
                      {savedItems[index] ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Item #{index + 1}</CardTitle>
                    </div>
                  </div>
                  <Button
                    onClick={() => saveItem(index)}
                    disabled={savingItem === index}
                    size="sm"
                    className={`text-xs sm:text-sm ${savedItems[index] 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-white/20 hover:bg-white/30 border border-white/40"
                    }`}
                  >
                    {savingItem === index ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1" />
                    ) : (
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    )}
                    {savedItems[index] ? "✓" : "Save"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                {/* Copy-Paste Work */}
                {task.name === "Copy-Paste Work" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 max-h-64 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Copy this content:
                      </div>
                      <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{item.content}</p>
                    </div>
                    <Textarea
                      placeholder="Paste the content here... (Ctrl+V or long press to paste)"
                      value={userAnswers[`${index}_paste`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'paste', e.target.value)}
                      rows={8}
                      className="border-2 border-purple-200 focus:border-purple-400"
                    />
                  </div>
                )}

                {/* Data Entry */}
                {task.name === "Data Entry" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {Object.entries(item).filter(([k]) => k !== 'sr_no').map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')} *
                        </label>
                        <Input
                          placeholder="Type here..."
                          value={userAnswers[`${index}_${key}`] || ""}
                          onChange={(e) => handleAnswerChange(index, key, e.target.value)}
                          className="border-2 border-gray-200 focus:border-blue-400 text-sm h-10"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Filling */}
                {task.name === "Form Filling" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {Object.entries(item).filter(([k]) => k !== 'sr_no').map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')} *
                        </label>
                        <Input
                          placeholder="Type here..."
                          value={userAnswers[`${index}_${key}`] || ""}
                          onChange={(e) => handleAnswerChange(index, key, e.target.value)}
                          className="border-2 border-gray-200 focus:border-green-400 text-sm h-10"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Article Writing */}
                {task.name === "Article Writing" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                      <p className="font-bold text-purple-900 text-lg">{item.title}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-purple-500">{item.category}</Badge>
                        <Badge variant="outline">{item.word_count}</Badge>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Write your article here..."
                      value={userAnswers[`${index}_article`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'article', e.target.value)}
                      rows={8}
                      className="border-2 border-purple-200 focus:border-purple-400"
                    />
                  </div>
                )}

                {/* E-Book Typing */}
                {task.name === "E-Book Typing" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                      <Badge className="bg-amber-500 mb-2">{item.chapter}</Badge>
                      <p className="font-bold text-amber-900 text-lg">📝 Topic: {item.topic}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                      <p className="font-medium mb-2 text-blue-900">📋 Instructions:</p>
                      <p className="text-blue-800">{item.instructions}</p>
                      <p className="text-xs text-blue-600 mt-2 font-medium">{item.word_count}</p>
                    </div>
                    <Textarea
                      placeholder="Write your own content on this topic..."
                      value={userAnswers[`${index}_content`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                      rows={10}
                      className="border-2 border-amber-200 focus:border-amber-400"
                    />
                  </div>
                )}

                {/* Email Replies */}
                {task.name === "Email Replies" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className="bg-red-500">{item.type}</Badge>
                      <Badge variant="outline">{item.scenario}</Badge>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">📧 Customer Query:</p>
                      <p className="text-gray-800 leading-relaxed">{item.customer_query}</p>
                    </div>
                    <Textarea
                      placeholder="Write your professional reply..."
                      value={userAnswers[`${index}_reply`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'reply', e.target.value)}
                      rows={6}
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>
                )}

                {/* Translation */}
                {task.name === "English-Hindi Translation" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500">{item.topic}</Badge>
                      <Badge variant="outline">{item.word_count}</Badge>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <p className="text-sm font-semibold text-blue-800 mb-2">🔤 English Text:</p>
                      <p className="text-gray-800 leading-relaxed">{item.english_text}</p>
                    </div>
                    <Textarea
                      placeholder="यहां हिंदी अनुवाद लिखें..."
                      value={userAnswers[`${index}_hindi`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'hindi', e.target.value)}
                      rows={6}
                      className="border-2 border-orange-200 focus:border-orange-400"
                    />
                  </div>
                )}

                {/* Grammar Correction */}
                {task.name === "Grammar Correction" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">❌ Incorrect Text:</p>
                      <p className="text-gray-800 italic leading-relaxed">{item.incorrect_text}</p>
                      <p className="text-xs text-red-600 mt-2 font-medium">Errors: {item.error_types}</p>
                    </div>
                    <Textarea
                      placeholder="Write the corrected version..."
                      value={userAnswers[`${index}_corrected`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'corrected', e.target.value)}
                      rows={5}
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>
                )}

                {/* PDF to Word */}
                {task.name === "PDF to Word Conversion" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                      <Badge className="bg-orange-500 mb-2">Page {item.page_number}</Badge>
                      <p className="font-bold text-orange-900 text-lg">{item.document_title}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700">
                      <p className="font-medium mb-2 text-gray-900">📄 Content to type:</p>
                      <p className="leading-relaxed">{item.content_to_type}</p>
                    </div>
                    <Textarea
                      placeholder="Type the content here..."
                      value={userAnswers[`${index}_typed`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'typed', e.target.value)}
                      rows={8}
                      className="border-2 border-orange-200 focus:border-orange-400"
                    />
                  </div>
                )}

                {/* Captcha Filling */}
                {task.name === "Captcha Filling" && (
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-center">
                      <Badge className="bg-purple-500">{item.captcha_type}</Badge>
                      <Badge variant="destructive">{item.difficulty}</Badge>
                    </div>
                    <div className="select-none">
                      {renderCaptchaDisplay(item.captcha_display, item.captcha_type)}
                    </div>
                    <Input
                      placeholder="Enter the captcha..."
                      value={userAnswers[`${index}_captcha`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'captcha', e.target.value)}
                      className="text-center text-lg sm:text-xl font-mono border-2 border-purple-200 focus:border-purple-400 py-4 sm:py-6 h-14"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                )}

                {/* Chat Support */}
                {task.name === "Chat Support" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className="bg-cyan-500">{item.type}</Badge>
                      <Badge variant="outline">{item.scenario}</Badge>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">C</div>
                        <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
                          <p className="text-xs font-medium text-gray-500 mb-1">Customer</p>
                          <p className="text-gray-800 leading-relaxed">{item.customer_message}</p>
                        </div>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Write your support response..."
                      value={userAnswers[`${index}_response`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'response', e.target.value)}
                      rows={5}
                      className="border-2 border-cyan-200 focus:border-cyan-400"
                    />
                  </div>
                )}

                {/* Email Questions */}
                {task.name === "Email Questions" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className="bg-indigo-500">{item.department}</Badge>
                      <Badge variant="outline">{item.scenario}</Badge>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                      <p className="text-sm font-semibold text-indigo-800 mb-2">❓ Question:</p>
                      <p className="text-gray-800 leading-relaxed">{item.question}</p>
                    </div>
                    <Textarea
                      placeholder="Write your answer..."
                      value={userAnswers[`${index}_answer`] || ""}
                      onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                      rows={5}
                      className="border-2 border-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                )}

                {/* Survey Filling */}
                {task.name === "Survey Filling" && (
                  <div className="space-y-3 sm:space-y-4">
                    <Badge className="bg-pink-500">{item.category}</Badge>
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                      <p className="font-medium text-pink-900 leading-relaxed text-sm sm:text-base">{item.question}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div
                          key={opt}
                          onClick={() => handleAnswerChange(index, 'survey', opt)}
                          className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            userAnswers[`${index}_survey`] === opt
                              ? 'border-pink-500 bg-pink-100 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm ${
                              userAnswers[`${index}_survey`] === opt
                                ? 'border-pink-500 bg-pink-500 text-white'
                                : 'border-gray-300'
                            }`}>
                              {opt}
                            </div>
                            <span className="text-xs sm:text-sm font-medium">
                              {opt === 'A' ? 'Excellent' : opt === 'B' ? 'Good' : opt === 'C' ? 'Average' : 'Poor'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submission Instructions */}
        <Card className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300">
          <CardContent className="p-5">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              How to Submit Your Work
            </h3>
            <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
              <li>Save each item after completing it</li>
              <li>Click <strong>"Download CSV"</strong> to get your work file</li>
              <li>Upload CSV to Google Drive (make it shareable)</li>
              <li>Go to <strong>Menu → Submit Your Work</strong> and paste link</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

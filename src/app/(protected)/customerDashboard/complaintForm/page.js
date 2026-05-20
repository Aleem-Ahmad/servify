"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, MapPin, User, ShieldCheck, 
  Zap, CheckCircle2, Lock, Star, Wrench, Mic, Square, Trash2, 
  Play, Pause, Camera, Wallet, Clock, Sparkles, FileText, CheckSquare
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import "./bookingForm.css";

const STEPS = [
  { id: 1, label: "Services & Details", desc: "Category, audio note & media" },
  { id: 2, label: "Your Info", desc: "Contact & live location link" },
  { id: 3, label: "Provider & Pricing", desc: "Pricing details & payment gateway" },
  { id: 4, label: "Confirm Booking", desc: "Submit verification OTP" }
];

function BookingFormContent() {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  // State lists
  const [allProviders, setAllProviders] = useState([]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [providerChosen, setProviderChosen] = useState(null);
  const [isOpenBooking, setIsOpenBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Audio Note Recorder States
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, hasRecording
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef(null);

  // Form Data Model
  const [formData, setFormData] = useState({
    category: "",
    problem: "",
    name: "",
    phone: "",
    address: "",
    location: "",
    urgency: "Normal",
    voiceUrl: "", // Base64 audio note
    mediaUrls: [], // Base64 photo/video uploads
    hours: 1,
    paymentMethod: "Cash",
    otpInput: "",
  });

  // Load provider list and handle pre-selected provider query parameter
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        if (res.ok) {
          const data = await res.json();
          setAllProviders(data);
          
          const pId = searchParams.get("provider");
          if (pId) {
            const found = data.find(p => p.id === pId);
            if (found) {
              setProviderChosen(found);
              setIsOpenBooking(false);
              setFormData(prev => ({ ...prev, category: found.category }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load providers", err);
      }
    };
    fetchProviders();
  }, [searchParams]);

  // Handle pre-selected category query parameter
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && !formData.category) {
      setFormData(prev => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  // Autofill customer profile details
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      }));
    }
  }, [user]);

  // Audio recording handlers
  const startRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, voiceUrl: reader.result }));
        };
        reader.readAsDataURL(blob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecordingStatus("recording");
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Could not access microphone. Please check system permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recordingStatus === "recording") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setRecordingStatus("hasRecording");
    }
  };

  const deleteRecording = () => {
    if (isPlaying) {
      audioPlayerRef.current?.pause();
      setIsPlaying(false);
    }
    setAudioUrl("");
    setRecordingStatus("idle");
    setFormData(prev => ({ ...prev, voiceUrl: "" }));
  };

  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Media (Photo/Video) upload handlers
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Maximum file size is 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          mediaUrls: [...prev.mediaUrls, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== idx)
    }));
  };

  // Geolocation linked address
  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({ ...prev, location: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` }));
      }, (err) => {
        alert("Unable to fetch location. Please enable location services.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerOtpGeneration = () => {
    setIsGeneratingOtp(true);
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setOtp(code);
      setFormData(prev => ({ ...prev, otpInput: code })); 
      setIsGeneratingOtp(false);
    }, 1000);
  };

  const submitBookingForm = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please generate a verification code first.");
    if (formData.otpInput !== otp) return alert("Verification code is invalid.");

    setIsSubmitting(true);
    try {
        const payload = {
            userId: user?.id,
            customerName: formData.name,
            customerPhone: formData.phone,
            customerAddress: formData.address,
            location: formData.location,
            category: formData.category,
            description: formData.problem,
            voiceUrl: formData.voiceUrl,
            mediaUrls: formData.mediaUrls,
            urgency: formData.urgency,
            hours: formData.hours,
            paymentMethod: formData.paymentMethod,
            providerId: (!isOpenBooking && providerChosen) ? providerChosen.id : undefined,
            providerName: (!isOpenBooking && providerChosen) ? providerChosen.name : undefined,
            hourlyRate: (!isOpenBooking && providerChosen) ? providerChosen.rate : 0,
            price: (!isOpenBooking && providerChosen) ? (providerChosen.rate * formData.hours) : 0,
            date: new Date().toISOString(),
            otp: otp
        };

        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            alert(isOpenBooking 
              ? "Open booking request published successfully! All matching category professionals are notified."
              : `Booking confirmed with ${providerChosen.name}!`);
            router.push("/customerDashboard");
        } else {
            alert("Booking request failed: " + data.message);
        }
    } catch (error) {
        alert("An error occurred during booking. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Determine current active provider pricing details
  const activeRate = (!isOpenBooking && providerChosen) ? providerChosen.rate : 0;
  const activeTotal = activeRate * formData.hours;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 pt-24 pb-20 ${dark ? "bg-[#050a14]" : "bg-slate-50"}`}>
      
      <div className={`w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl ${
        dark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
      }`}>
        
        {/* ── LEFT PANEL (HERO STATE) ── */}
        <div className="md:w-[35%] p-10 flex flex-col justify-between text-white relative overflow-hidden" 
             style={{ background: "linear-gradient(135deg, #ff7a00, #e65c00)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <ShieldCheck className="w-12 h-12 mb-6 opacity-90" />
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              {isUrdu ? "سروس بک کریں" : "Unified Service Booking"}
            </h2>
            <p className="opacity-90 leading-relaxed mb-8 text-sm">
              {(!isOpenBooking && providerChosen) 
                ? `${t("Booking with")} ${providerChosen.name}` 
                : "Describe your job parameters and hire either a specific specialist or submit as an open contract."}
            </p>

            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-opacity duration-300 ${step === s.id ? "opacity-100" : step > s.id ? "opacity-60" : "opacity-30"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border-2 ${
                    step === s.id ? "bg-white text-orange-600 border-white" : "border-white/50 text-white"
                  }`}>
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{s.label}</h4>
                    <p className="text-[10px] opacity-80">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 mt-12 flex items-center gap-2 text-xs font-semibold opacity-90 bg-black/15 w-max px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-yellow-300" /> Transparent Pricing System
          </div>
        </div>

        {/* ── RIGHT PANEL (STEPPED WIZARD) ── */}
        <div className="md:w-[65%] p-10 flex flex-col justify-between relative min-h-[550px]">
          <audio ref={audioPlayerRef} src={audioUrl || null} onEnded={() => setIsPlaying(false)} className="hidden" />

          <AnimatePresence mode="wait">
            
            {/* STEP 1: SERVICE, TEXT DETAILS, VOICE AND MEDIA */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h3 className={`text-2xl font-black flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <Wrench className="w-6 h-6 text-orange-500" /> Job Requirements
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      Service Category
                    </label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleFieldChange} 
                      disabled={!!providerChosen}
                      className={`w-full p-4 rounded-xl outline-none transition-all ${
                        providerChosen 
                          ? dark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                          : dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"
                      }`}
                    >
                      <option value="">-- Choose Category --</option>
                      <option value="Plumber">Plumbing</option>
                      <option value="Electrician">Electrical Services</option>
                      <option value="Cleaning">Cleaning & Sanitization</option>
                      <option value="Carpenter">Carpentry Work</option>
                      <option value="Painter">Painting Services</option>
                      <option value="Gardener">Gardening & Landscaping</option>
                    </select>
                    {providerChosen && (
                      <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Category locked for this provider booking.
                      </p>
                    )}
                  </div>
                  
                  {/* Urgency Selection */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      Job Urgency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Normal', 'Urgent', 'Emergency'].map(level => (
                        <button
                          type="button"
                          key={level}
                          onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                          className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                            formData.urgency === level
                              ? level === 'Emergency'
                                ? "bg-red-500/10 border-red-500 text-red-500 shadow-sm"
                                : "bg-orange-500/10 border-orange-500 text-orange-500 shadow-sm"
                              : dark ? "border-slate-800 bg-slate-800/20 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {level === 'Emergency' ? '🚨 ' : ''}{level}
                        </button>
                      ))}
                    </div>
                    {formData.urgency === 'Emergency' && (
                      <p className="text-xs text-red-500 font-semibold mt-2">
                        🚨 Emergency dispatcher prioritizes this call immediately. Live location recommended.
                      </p>
                    )}
                  </div>

                  {/* Text Details */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-650"}`}>
                      Describe the issue
                    </label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleFieldChange}
                      placeholder="Please explain the details of the repair or request..."
                      rows={3}
                      className={`w-full p-4 rounded-xl outline-none resize-none transition-all ${
                        dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"
                      }`}
                    />
                  </div>

                  {/* Voice Note & File Uploads (Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Voice Recorder */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${dark ? "bg-slate-800/20 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <label className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-orange-500" /> Voice Detail Note
                      </label>
                      
                      <div className="flex items-center gap-3 my-2">
                        {recordingStatus === "idle" && (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-orange-600"
                          >
                            <Mic className="w-3.5 h-3.5" /> Record Note
                          </button>
                        )}
                        {recordingStatus === "recording" && (
                          <>
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse"
                            >
                              <Square className="w-3.5 h-3.5" /> Stop
                            </button>
                            <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" /> Recording...
                            </span>
                          </>
                        )}
                        {recordingStatus === "hasRecording" && (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={toggleAudioPlayback}
                              className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200"
                            >
                              {isPlaying ? <Pause className="w-4 h-4 fill-orange-600" /> : <Play className="w-4 h-4 fill-orange-600 ml-0.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={deleteRecording}
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-emerald-500 font-semibold">Audio Note linked</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">Record a voice description instead of typing.</p>
                    </div>

                    {/* Media Uploads */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${dark ? "bg-slate-800/20 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <label className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-orange-500" /> Photos / Videos (Optional)
                      </label>
                      
                      <div className="my-2">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleMediaUpload}
                          id="file-upload-input"
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload-input"
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-750 w-max"
                        >
                          <Camera className="w-3.5 h-3.5" /> Upload Media
                        </label>
                      </div>
                      
                      <p className="text-[10px] text-slate-500">Provide up to 10MB of images or video notes.</p>
                    </div>
                  </div>

                  {/* Media Preview Row */}
                  {formData.mediaUrls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {formData.mediaUrls.map((uri, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-350 shrink-0">
                          {uri.startsWith("data:video/") ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">Video</div>
                          ) : (
                            <img src={uri} alt="" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaItem(idx)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-650 text-white rounded-full flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTACT DETAILS & LOCATION */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className={`text-2xl font-black flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <User className="w-6 h-6 text-orange-500" /> Contact Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      Your Full Name
                    </label>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleFieldChange} 
                      className={`w-full p-4 rounded-xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      Contact Phone Number
                    </label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleFieldChange} placeholder="03XXXXXXXXX" 
                      className={`w-full p-4 rounded-xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    Complete Street Address
                  </label>
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleFieldChange} 
                    className={`w-full p-4 rounded-xl outline-none transition-all mb-4 ${dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  />
                  
                  <button 
                    type="button" 
                    onClick={shareLocation}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.location 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                        : "bg-orange-500/10 text-orange-650 hover:bg-orange-500/20"
                    }`}
                  >
                    <MapPin className="w-5 h-5" /> 
                    {formData.location ? `Coordinates Linked: ${formData.location}` : "Link GPS Live Location"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROVIDER ASSIGNMENT & HOURLY ESTIMATES */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h3 className={`text-2xl font-black flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <Clock className="w-6 h-6 text-orange-500" /> Pricing & Provider Selection
                </h3>
                
                {/* 1. Job Duration Slider */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 flex justify-between">
                    <span>Expected Job Duration</span>
                    <span className="text-orange-500 font-extrabold">{formData.hours} {formData.hours === 1 ? 'hour' : 'hours'}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    name="hours"
                    value={formData.hours}
                    onChange={handleFieldChange}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Specify estimated hours. Provider will charge based on the actual duration recorded.</span>
                </div>

                {/* 2. Provider Selection (Unified Provider vs Open Booking Card) */}
                <div className={`p-5 rounded-2xl border ${dark ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  {providerChosen && !isOpenBooking ? (
                    <div>
                      <div className="flex items-center gap-4">
                        <img src={providerChosen.image || "/default-avatar.png"} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/30" />
                        <div>
                          <h4 className="font-bold text-base">{providerChosen.name}</h4>
                          <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                            {providerChosen.category} Specialist • Hourly rate: <strong className="text-orange-500">PKR {providerChosen.rate}</strong>
                          </p>
                        </div>
                        <div className="ml-auto text-yellow-500 flex items-center gap-1 font-bold text-sm">
                          <Star className="w-4 h-4 fill-yellow-500" /> {providerChosen.rating || "5.0"}
                        </div>
                      </div>
                      
                      {!searchParams.get("provider") && (
                        <button
                          type="button"
                          onClick={() => {
                            setProviderChosen(null);
                            setIsOpenBooking(true);
                          }}
                          className="mt-3 text-xs font-bold text-red-505 hover:underline"
                        >
                          Change to Open Booking (available to any professional)
                        </button>
                      )}
                    </div>
                  ) : isOpenBooking ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-500 font-bold">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span>Open Booking Mode Active</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        No specific professional selected. Any available provider of the category <strong>{formData.category || "selected above"}</strong> can view your task details and accept this job.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsOpenBooking(false)}
                        className="text-xs font-bold text-orange-500 hover:underline w-max"
                      >
                        Choose specific provider instead
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? "text-slate-400" : "text-slate-650"}`}>
                        Select Your Specialist or Submit Openly:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {allProviders
                          .filter(p => !formData.category || p.category === formData.category)
                          .slice(0, 2)
                          .map((p, i) => (
                            <div 
                              key={p.id || p._id || i} 
                              onClick={() => {
                                setProviderChosen(p);
                                setIsOpenBooking(false);
                              }}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                providerChosen?.id === p.id 
                                  ? "border-orange-500 bg-orange-500/10 text-orange-500 font-bold" 
                                  : dark ? "border-slate-700 hover:border-slate-500 text-slate-350 bg-slate-900/30" : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="font-bold text-xs truncate">{p.name}</div>
                              <div className="text-[10px] opacity-85">PKR {p.rate}/hr • ⭐{p.rating || "5.0"}</div>
                            </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProviderChosen(null);
                          setIsOpenBooking(true);
                        }}
                        className={`w-full py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                          isOpenBooking 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                            : dark ? "bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-150"
                        }`}
                      >
                        Post as General Open Booking
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Payment Gateway Choice (Cash vs SadaPay) */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "Cash" }))}
                      className={`p-4 rounded-xl border font-bold flex flex-col items-center gap-2 transition-all ${
                        formData.paymentMethod === "Cash"
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : dark ? "border-slate-800 bg-slate-850 text-slate-400" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <Wallet className="w-5 h-5" />
                      <span>Pay with Cash</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "SadaPay" }))}
                      className={`p-4 rounded-xl border font-bold flex flex-col items-center gap-2 transition-all ${
                        formData.paymentMethod === "SadaPay"
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : dark ? "border-slate-800 bg-slate-850 text-slate-400" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <Sparkles className="w-5 h-5 text-emerald-550" />
                      <span>SadaPay Wallet</span>
                    </button>
                  </div>
                  {formData.paymentMethod === "SadaPay" && (
                    <p className="text-[10px] text-emerald-500 font-semibold mt-1.5">
                      ✓ Instant Online Transaction secured via SadaPay checkout (Sadapay payment verification code).
                    </p>
                  )}
                </div>

                {/* 4. Transparent Price Calculation Screen */}
                <div className={`p-4 rounded-xl border ${dark ? "bg-slate-800/20 border-slate-750" : "bg-orange-500/5 border-orange-500/20"}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-orange-550 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" /> Transparent Pricing Summary
                  </h4>
                  {isOpenBooking ? (
                    <div className="text-xs space-y-1">
                      <p>• Category Service: <strong>{formData.category || "Select Above"}</strong></p>
                      <p>• Billing Hours Estimated: <strong>{formData.hours} hours</strong></p>
                      <p>• Payment Gateway: <strong>{formData.paymentMethod}</strong></p>
                      <p className="text-orange-500 font-bold mt-2">Cost details will display once a provider accepts and applies their hourly rate.</p>
                    </div>
                  ) : (
                    <div className="text-xs space-y-2">
                      <div className="flex justify-between">
                        <span>Specialist Hourly Fee ({providerChosen?.name || "N/A"})</span>
                        <strong>PKR {activeRate} / hour</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Labor Hours</span>
                        <strong>{formData.hours} hours</strong>
                      </div>
                      <div className="flex justify-between border-t pt-2 border-slate-250 dark:border-slate-700 text-sm font-black text-orange-500">
                        <span>Total Est. Budget</span>
                        <span>PKR {activeTotal}</span>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* STEP 4: OTP VERIFICATION & SUBMIT */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className={`text-2xl font-black flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <ShieldCheck className="w-6 h-6 text-orange-500" /> Identity Verification
                </h3>

                {/* Booking Brief Summary */}
                <div className={`p-5 rounded-2xl border text-xs space-y-2 ${dark ? "bg-slate-800/40 border-slate-750" : "bg-slate-50 border-slate-200"}`}>
                  <h4 className="font-bold text-sm text-orange-500 mb-2">Request Overview</h4>
                  <div><strong>Category:</strong> {formData.category}</div>
                  <div><strong>Urgency:</strong> {formData.urgency}</div>
                  <div><strong>Description:</strong> {formData.problem || "No description provided."}</div>
                  <div><strong>Contract:</strong> {isOpenBooking ? "Open Contract (Unassigned)" : `Assigned to ${providerChosen?.name}`}</div>
                  <div><strong>Address:</strong> {formData.address}</div>
                  <div><strong>Payment Method:</strong> {formData.paymentMethod}</div>
                  <div><strong>Estimated Budget:</strong> {isOpenBooking ? "Hourly calculations depend on accepting provider" : `PKR ${activeTotal}`}</div>
                </div>

                {/* OTP Block */}
                <div className={`p-6 rounded-2xl border text-center ${dark ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  {!otp ? (
                    <button 
                      type="button" 
                      onClick={triggerOtpGeneration} 
                      disabled={isGeneratingOtp || (!isOpenBooking && !providerChosen) || !formData.category}
                      className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-505 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20"
                    >
                      {isGeneratingOtp ? "Generating OTP..." : "Generate Verification OTP"}
                    </button>
                  ) : (
                    <div>
                      <p className="text-emerald-500 font-bold mb-2 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Verification Code Issued
                      </p>
                      <div className="text-4xl font-black tracking-[0.2em] text-orange-500 my-4 animate-bounce">
                        {otp}
                      </div>
                      <input
                        type="text"
                        name="otpInput"
                        value={formData.otpInput}
                        readOnly
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── FOOTER WIZARD BUTTONS ── */}
          <div className={`mt-auto pt-6 border-t flex gap-4 ${step === 1 ? "justify-end" : "justify-between"} ${dark ? "border-slate-800" : "border-slate-200"}`}>
            {step > 1 && (
              <button 
                type="button" 
                onClick={handlePrev}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm ${
                  dark ? "bg-slate-800 hover:bg-slate-750 text-white" : "bg-slate-100 hover:bg-slate-150 text-slate-700"
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> {t("Back")}
              </button>
            )}
            
            {step < 4 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={
                  (step === 1 && (!formData.category || (!formData.problem && !formData.voiceUrl))) ||
                  (step === 2 && (!formData.name || !formData.phone || !formData.address)) ||
                  (step === 3 && (!isOpenBooking && !providerChosen))
                }
                className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20 text-sm"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="submit" 
                onClick={submitBookingForm}
                disabled={!otp || isSubmitting}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 w-full sm:w-auto text-sm"
              >
                {isSubmitting ? "Processing Booking..." : "Submit Verified Booking"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, MapPin, User, ShieldCheck, 
  Zap, CheckCircle2, Lock, Star, Wrench, Mic, Square, Trash2, 
  Play, Pause, Camera, Wallet, Clock, Sparkles, CheckSquare
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

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className={`bf-page ${dark ? "dark" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="bf-page-glow" aria-hidden="true">
        <div className="bf-orb bf-orb-1" />
        <div className="bf-orb bf-orb-2" />
      </div>

      <div className="bf-container">
        {/* ── LEFT PANEL ── */}
        <div className="bf-hero">
          <div className="bf-hero-content">
            <div className="bf-hero-icon">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="bf-hero-title">
              {isUrdu ? "سروس بک کریں" : "Book a Service"}
            </h2>
            <p className="bf-hero-desc">
              {!isOpenBooking && providerChosen
                ? `${t("Booking with")} ${providerChosen.name}`
                : isUrdu
                ? "اپنی سروس کی تفصیلات درج کریں اور ماہر منتخب کریں یا اوپن بکنگ جمع کرائیں۔"
                : "Describe your job, pick a specialist, or post an open booking for any available pro."}
            </p>

            <div className="bf-steps">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`bf-step ${step === s.id ? "active" : step > s.id ? "completed" : ""}`}
                >
                  <div className="bf-step-num">
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <div>
                    <div className="bf-step-label">{s.label}</div>
                    <div className="bf-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bf-hero-badge">
            <Zap className="w-4 h-4 text-yellow-200" />
            {isUrdu ? "شفاف قیمتیں" : "Transparent Pricing"}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="bf-form-area">
          <audio ref={audioPlayerRef} src={audioUrl || null} onEnded={() => setIsPlaying(false)} className="hidden" />

          <div className="bf-mobile-progress">
            <div className="bf-mobile-step-label">
              {isUrdu ? `مرحلہ ${step} / ${STEPS.length}` : `Step ${step} of ${STEPS.length}`}
            </div>
            <div className="bf-mobile-progress-bar">
              <div className="bf-mobile-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="bf-form-scroll">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SERVICE, TEXT DETAILS, VOICE AND MEDIA */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bf-step-header">
                  <h3 className="bf-step-title">
                    <Wrench className="w-6 h-6 text-orange-500 shrink-0" />
                    {isUrdu ? "سروس کی تفصیلات" : "Job Requirements"}
                  </h3>
                  <p className="bf-step-subtitle">
                    {isUrdu ? "زمرہ، فوری نوعیت اور مسئلے کی وضاحت" : "Category, urgency, and problem description"}
                  </p>
                </div>

                <div className="bf-form-body">
                  <div className="bf-field">
                    <label className="bf-label">{isUrdu ? "سروس زمرہ" : "Service Category"}</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFieldChange}
                      disabled={!!providerChosen}
                      className="bf-select"
                    >
                      <option value="">-- {isUrdu ? "زمرہ منتخب کریں" : "Choose Category"} --</option>
                      <option value="Plumber">Plumbing</option>
                      <option value="Electrician">Electrical Services</option>
                      <option value="Cleaning">Cleaning & Sanitization</option>
                      <option value="Carpenter">Carpentry Work</option>
                      <option value="Painter">Painting Services</option>
                      <option value="Gardener">Gardening & Landscaping</option>
                    </select>
                    {providerChosen && (
                      <span className="bf-hint">
                        <Lock className="w-3 h-3" />
                        {isUrdu ? "اس فراہم کنندہ کے لیے زمرہ مقفل ہے" : "Category locked for this provider"}
                      </span>
                    )}
                  </div>

                  <div className="bf-field">
                    <label className="bf-label">{isUrdu ? "فوری نوعیت" : "Job Urgency"}</label>
                    <div className="bf-chip-row">
                      {["Normal", "Urgent", "Emergency"].map((level) => (
                        <button
                          type="button"
                          key={level}
                          onClick={() => setFormData((prev) => ({ ...prev, urgency: level }))}
                          className={`bf-chip ${formData.urgency === level ? "active" : ""} ${formData.urgency === level && level === "Emergency" ? "emergency" : ""}`}
                        >
                          {level === "Emergency" ? "🚨 " : ""}{level}
                        </button>
                      ))}
                    </div>
                    {formData.urgency === "Emergency" && (
                      <p className="bf-hint-warn">
                        🚨 {isUrdu ? "ایمرجنسی کال فوری ترجیح دی جاتی ہے۔" : "Emergency calls are prioritized immediately."}
                      </p>
                    )}
                  </div>

                  <div className="bf-field">
                    <label className="bf-label">{isUrdu ? "مسئلے کی وضاحت" : "Describe the Issue"}</label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleFieldChange}
                      placeholder={isUrdu ? "مرمت یا درخواست کی تفصیل لکھیں..." : "Explain the repair or service request..."}
                      rows={3}
                      className="bf-textarea"
                    />
                  </div>

                  <div className="bf-media-grid">
                    <div className="bf-media-box">
                      <span className="bf-media-box-label">
                        <Mic className="w-3.5 h-3.5" /> {isUrdu ? "آڈیو نوٹ" : "Voice Note"}
                      </span>
                      <div className="bf-media-actions">
                        {recordingStatus === "idle" && (
                          <button type="button" onClick={startRecording} className="bf-btn-record">
                            <Mic className="w-3.5 h-3.5" /> {isUrdu ? "ریکارڈ" : "Record"}
                          </button>
                        )}
                        {recordingStatus === "recording" && (
                          <>
                            <button type="button" onClick={stopRecording} className="bf-btn-record bf-btn-stop">
                              <Square className="w-3.5 h-3.5" /> {isUrdu ? "روکیں" : "Stop"}
                            </button>
                            <span className="bf-hint-warn flex items-center gap-1.5">
                              <span className="bf-recording-dot" /> {isUrdu ? "ریکارڈنگ..." : "Recording..."}
                            </span>
                          </>
                        )}
                        {recordingStatus === "hasRecording" && (
                          <>
                            <button type="button" onClick={toggleAudioPlayback} className="bf-icon-btn play">
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <button type="button" onClick={deleteRecording} className="bf-icon-btn delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="bf-hint" style={{ color: "#10b981" }}>
                              ✓ {isUrdu ? "آڈیو منسلک" : "Audio linked"}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="bf-media-note">{isUrdu ? "ٹائپ کرنے کے بجائے آواز میں بیان کریں" : "Record instead of typing"}</p>
                    </div>

                    <div className="bf-media-box">
                      <span className="bf-media-box-label">
                        <Camera className="w-3.5 h-3.5" /> {isUrdu ? "تصاویر / ویڈیو" : "Photos / Videos"}
                      </span>
                      <div className="bf-media-actions">
                        <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} id="file-upload-input" className="hidden" />
                        <label htmlFor="file-upload-input" className="bf-btn-upload">
                          <Camera className="w-3.5 h-3.5" /> {isUrdu ? "اپ لوڈ" : "Upload"}
                        </label>
                      </div>
                      <p className="bf-media-note">{isUrdu ? "زیادہ سے زیادہ 10MB" : "Up to 10MB per file"}</p>
                    </div>
                  </div>

                  {formData.mediaUrls.length > 0 && (
                    <div className="bf-media-preview-row">
                      {formData.mediaUrls.map((uri, idx) => (
                        <div key={idx} className="bf-media-thumb">
                          {uri.startsWith("data:video/") ? (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">Video</div>
                          ) : (
                            <img src={uri} alt="" />
                          )}
                          <button type="button" onClick={() => removeMediaItem(idx)} className="bf-media-thumb-remove">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTACT DETAILS & LOCATION */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bf-step-header">
                  <h3 className="bf-step-title">
                    <User className="w-6 h-6 text-orange-500 shrink-0" />
                    {isUrdu ? "رابطے کی تفصیلات" : "Contact Details"}
                  </h3>
                  <p className="bf-step-subtitle">
                    {isUrdu ? "اپنا نام، فون اور پتہ درج کریں" : "Your name, phone, and service address"}
                  </p>
                </div>

                <div className="bf-form-body">
                  <div className="bf-field-grid">
                    <div className="bf-field">
                      <label className="bf-label">{isUrdu ? "پورا نام" : "Full Name"}</label>
                      <input type="text" name="name" value={formData.name} onChange={handleFieldChange} className="bf-input" />
                    </div>
                    <div className="bf-field">
                      <label className="bf-label">{isUrdu ? "فون نمبر" : "Phone Number"}</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleFieldChange} placeholder="03XXXXXXXXX" className="bf-input" />
                    </div>
                  </div>

                  <div className="bf-field">
                    <label className="bf-label">{isUrdu ? "مکمل پتہ" : "Street Address"}</label>
                    <input type="text" name="address" value={formData.address} onChange={handleFieldChange} className="bf-input" />
                    <button
                      type="button"
                      onClick={shareLocation}
                      className={`bf-btn-location ${formData.location ? "linked" : ""}`}
                    >
                      <MapPin className="w-5 h-5 shrink-0" />
                      {formData.location
                        ? `${isUrdu ? "مقام:" : "GPS:"} ${formData.location}`
                        : isUrdu ? "GPS مقام منسلک کریں" : "Link GPS Location"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROVIDER ASSIGNMENT & HOURLY ESTIMATES */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bf-step-header">
                  <h3 className="bf-step-title">
                    <Clock className="w-6 h-6 text-orange-500 shrink-0" />
                    {isUrdu ? "قیمت اور فراہم کنندہ" : "Pricing & Provider"}
                  </h3>
                  <p className="bf-step-subtitle">
                    {isUrdu ? "دورانیہ، ادائیگی اور ماہر کا انتخاب" : "Duration, payment method, and specialist selection"}
                  </p>
                </div>

                <div className="bf-form-body">
                  <div className="bf-field">
                    <div className="bf-range-header">
                      <label className="bf-label" style={{ margin: 0 }}>{isUrdu ? "متوقع دورانیہ" : "Expected Duration"}</label>
                      <span className="bf-range-value">{formData.hours} {formData.hours === 1 ? (isUrdu ? "گھنٹہ" : "hour") : (isUrdu ? "گھنٹے" : "hours")}</span>
                    </div>
                    <input type="range" min="1" max="12" name="hours" value={formData.hours} onChange={handleFieldChange} className="bf-range" />
                    <p className="bf-media-note">{isUrdu ? "تخمینی گھنٹے — حتمی بل اصل مدت پر مبنی ہوگا" : "Estimated hours — final bill based on actual duration"}</p>
                  </div>

                  <div className="bf-panel">
                    {providerChosen && !isOpenBooking ? (
                      <div>
                        <div className="bf-provider-selected">
                          <img src={providerChosen.image || "/default-avatar.png"} alt="" className="bf-provider-avatar" />
                          <div>
                            <div className="bf-provider-name">{providerChosen.name}</div>
                            <div className="bf-provider-meta">
                              {providerChosen.category} • PKR {providerChosen.rate}/hr
                            </div>
                          </div>
                          <div className="bf-provider-rating">
                            <Star className="w-4 h-4 fill-yellow-500" /> {providerChosen.rating || "5.0"}
                          </div>
                        </div>
                        {!searchParams.get("provider") && (
                          <button type="button" onClick={() => { setProviderChosen(null); setIsOpenBooking(true); }} className="bf-link-btn red">
                            {isUrdu ? "اوپن بکنگ میں تبدیل کریں" : "Switch to open booking"}
                          </button>
                        )}
                      </div>
                    ) : isOpenBooking ? (
                      <div className="bf-open-booking">
                        <div className="bf-open-badge">
                          <Sparkles className="w-5 h-5" />
                          {isUrdu ? "اوپن بکنگ فعال" : "Open Booking Active"}
                        </div>
                        <p className="bf-provider-meta">
                          {isUrdu ? "کوئی مخصوص ماہر نہیں — " : "No specific pro — "}
                          <strong>{formData.category || (isUrdu ? "زمرہ" : "category")}</strong>
                          {isUrdu ? " کے دستیاب فراہم کنندگان دیکھ سکتے ہیں" : " providers can view and accept"}
                        </p>
                        <button type="button" onClick={() => setIsOpenBooking(false)} className="bf-link-btn orange">
                          {isUrdu ? "مخصوص فراہم کنندہ منتخب کریں" : "Choose a specific provider"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="bf-label" style={{ marginBottom: 12 }}>
                          {isUrdu ? "ماہر منتخب کریں یا اوپن بکنگ کریں" : "Pick a specialist or post openly"}
                        </p>
                        <div className="bf-provider-grid">
                          {allProviders
                            .filter((p) => !formData.category || p.category === formData.category)
                            .slice(0, 2)
                            .map((p, i) => (
                              <button
                                type="button"
                                key={p.id || p._id || i}
                                onClick={() => { setProviderChosen(p); setIsOpenBooking(false); }}
                                className={`bf-provider-option ${providerChosen?.id === p.id ? "selected" : ""}`}
                              >
                                <div className="bf-provider-option-name">{p.name}</div>
                                <div className="bf-provider-option-rate">PKR {p.rate}/hr • ⭐{p.rating || "5.0"}</div>
                              </button>
                            ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setProviderChosen(null); setIsOpenBooking(true); }}
                          className={`bf-btn-open ${isOpenBooking ? "active" : ""}`}
                        >
                          {isUrdu ? "عام اوپن بکنگ پوسٹ کریں" : "Post as Open Booking"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bf-field">
                    <label className="bf-label">{isUrdu ? "ادائیگی کا طریقہ" : "Payment Method"}</label>
                    <div className="bf-payment-grid">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "Cash" }))}
                        className={`bf-payment-card ${formData.paymentMethod === "Cash" ? "selected" : ""}`}
                      >
                        <Wallet className="w-5 h-5" />
                        {isUrdu ? "نقد" : "Pay with Cash"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "SadaPay" }))}
                        className={`bf-payment-card ${formData.paymentMethod === "SadaPay" ? "selected" : ""}`}
                      >
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        SadaPay Wallet
                      </button>
                    </div>
                    {formData.paymentMethod === "SadaPay" && (
                      <p className="bf-hint" style={{ color: "#10b981", marginTop: 8 }}>
                        ✓ {isUrdu ? "SadaPay کے ذریعے محفوظ آن لائن ادائیگی" : "Secured via SadaPay checkout"}
                      </p>
                    )}
                  </div>

                  <div className="bf-price-summary">
                    <div className="bf-price-title">
                      <CheckSquare className="w-3.5 h-3.5" />
                      {isUrdu ? "قیمت کا خلاصہ" : "Pricing Summary"}
                    </div>
                    {isOpenBooking ? (
                      <>
                        <div className="bf-price-row"><span>{isUrdu ? "زمرہ" : "Category"}</span><strong>{formData.category || "—"}</strong></div>
                        <div className="bf-price-row"><span>{isUrdu ? "گھنٹے" : "Hours"}</span><strong>{formData.hours}</strong></div>
                        <div className="bf-price-row"><span>{isUrdu ? "ادائیگی" : "Payment"}</span><strong>{formData.paymentMethod}</strong></div>
                        <p className="bf-hint" style={{ marginTop: 8 }}>
                          {isUrdu ? "قیمت فراہم کنندہ قبول کرنے کے بعد ظاہر ہوگی" : "Cost shown once a provider accepts"}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bf-price-row"><span>{providerChosen?.name || "—"}</span><strong>PKR {activeRate}/hr</strong></div>
                        <div className="bf-price-row"><span>{isUrdu ? "گھنٹے" : "Hours"}</span><strong>{formData.hours}</strong></div>
                        <div className="bf-price-total"><span>{isUrdu ? "کل تخمینہ" : "Est. Total"}</span><span>PKR {activeTotal}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: OTP VERIFICATION & SUBMIT */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bf-step-header">
                  <h3 className="bf-step-title">
                    <ShieldCheck className="w-6 h-6 text-orange-500 shrink-0" />
                    {isUrdu ? "تصدیق" : "Verification"}
                  </h3>
                  <p className="bf-step-subtitle">
                    {isUrdu ? "اپنی بکنگ کا جائزہ لیں اور OTP حاصل کریں" : "Review your booking and generate OTP"}
                  </p>
                </div>

                <div className="bf-form-body">
                  <div className="bf-review-box">
                    <div className="bf-review-title">{isUrdu ? "درخواست کا خلاصہ" : "Request Overview"}</div>
                    <div><strong>{isUrdu ? "زمرہ:" : "Category:"}</strong> {formData.category}</div>
                    <div><strong>{isUrdu ? "فوری نوعیت:" : "Urgency:"}</strong> {formData.urgency}</div>
                    <div><strong>{isUrdu ? "تفصیل:" : "Description:"}</strong> {formData.problem || (isUrdu ? "نہیں دی" : "None provided")}</div>
                    <div><strong>{isUrdu ? "معاہدہ:" : "Contract:"}</strong> {isOpenBooking ? (isUrdu ? "اوپن (غیر مقرر)" : "Open (Unassigned)") : `${isUrdu ? "مقرر:" : "Assigned:"} ${providerChosen?.name}`}</div>
                    <div><strong>{isUrdu ? "پتہ:" : "Address:"}</strong> {formData.address}</div>
                    <div><strong>{isUrdu ? "ادائیگی:" : "Payment:"}</strong> {formData.paymentMethod}</div>
                    <div><strong>{isUrdu ? "تخمینی بجٹ:" : "Est. Budget:"}</strong> {isOpenBooking ? (isUrdu ? "فراہم کنندہ کے بعد" : "After provider accepts") : `PKR ${activeTotal}`}</div>
                  </div>

                  <div className="bf-otp-box">
                    {!otp ? (
                      <button
                        type="button"
                        onClick={triggerOtpGeneration}
                        disabled={isGeneratingOtp || (!isOpenBooking && !providerChosen) || !formData.category}
                        className="bf-btn-otp"
                      >
                        {isGeneratingOtp
                          ? (isUrdu ? "OTP بن رہا ہے..." : "Generating OTP...")
                          : (isUrdu ? "تصدیقی OTP بنائیں" : "Generate Verification OTP")}
                      </button>
                    ) : (
                      <>
                        <div className="bf-otp-success">
                          <CheckCircle2 className="w-5 h-5" />
                          {isUrdu ? "تصدیقی کوڈ جاری" : "Verification Code Issued"}
                        </div>
                        <div className="bf-otp-code">{otp}</div>
                        <input type="text" name="otpInput" value={formData.otpInput} readOnly className="hidden" />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
          </div>

          {/* ── FOOTER NAV ── */}
          <div className={`bf-footer ${step === 1 ? "end" : "between"}`}>
            {step > 1 && (
              <button type="button" onClick={handlePrev} className="bf-btn-back">
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
                  (step === 3 && !isOpenBooking && !providerChosen)
                }
                className="bf-btn-next"
              >
                {isUrdu ? "آگے" : "Continue"} <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={submitBookingForm}
                disabled={!otp || isSubmitting}
                className="bf-btn-submit"
              >
                {isSubmitting
                  ? (isUrdu ? "جمع ہو رہا ہے..." : "Processing...")
                  : (isUrdu ? "بکنگ جمع کرائیں" : "Submit Booking")}
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
    <Suspense fallback={
      <div className="bf-page">
        <div className="bf-container" style={{ alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
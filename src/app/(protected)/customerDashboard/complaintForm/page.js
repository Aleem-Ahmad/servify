"use client";

import { useState, useEffect } from "react";
import "./bookingForm.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  User, 
  Phone, 
  ShieldCheck, 
  Star,
  Zap,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Services", desc: "Select category & detail your issue" },
  { id: 2, label: "Details", desc: "Your contact and location info" },
  { id: 3, label: "Provider", desc: "Choose expert & verify service" },
];

export default function BookingForm() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dark = theme === "dark";

  const [allProviders, setAllProviders] = useState([]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [providerChosen, setProviderChosen] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "",
    problem: "",
    name: "",
    phone: "",
    address: "",
    location: "",
    otpInput: "",
  });

  // --- Fetch Providers ---
  useEffect(() => {
    const fetchProviders = async () => {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setAllProviders(data);
        
        // Handle URL params after providers are loaded
        const pId = searchParams.get("provider");
        if (pId) {
          const found = data.find(p => p.id === pId);
          if (found) {
            setProviderChosen(found);
            setFormData(prev => ({ ...prev, category: found.category }));
          }
        }
      }
    };
    fetchProviders();
  }, [searchParams]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && !formData.category) {
      setFormData(prev => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  // Pre-fill user data
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

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateOtp = () => {
    setIsGeneratingOtp(true);
    setTimeout(() => {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setOtp(generatedOtp);
      setFormData(prev => ({ ...prev, otpInput: generatedOtp })); 
      setIsGeneratingOtp(false);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
        alert("Please generate a verification code first.");
        return;
    }
    if (formData.otpInput !== otp) {
      alert("Invalid OTP. Please check.");
      return;
    }

    setIsSubmitting(true);
    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user?.id,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                location: formData.location,
                category: formData.category,
                description: formData.problem,
                providerId: providerChosen?.id,
                providerName: providerChosen?.name,
                price: providerChosen?.rate,
                date: new Date().toISOString()
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Booking confirmed! The professional has been notified.");
            router.push("/customerDashboard");
        } else {
            alert("Booking failed: " + data.message);
        }
    } catch (error) {
        alert("An error occurred during booking.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({ ...formData, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      });
    }
  };

  return (
    <div className={`booking-page-wrapper ${dark ? "dark" : ""}`}>
      <div className="booking-container" id="complaint-form">
        
        {/* LEFT PANEL */}
        <div className="booking-hero">
          <div className="hero-content">
            <ShieldCheck size={48} className="mb-4" strokeWidth={1.5} />
            <h2>{t("Book Your Service")}</h2>
            <p>{t(providerChosen ? `Booking with ${providerChosen.name}` : "Tell us what you need, and we'll connect you with professional experts.")}</p>
            
            <div className="step-indicator">
              {STEPS.map((s) => (
                <div key={s.id} className={`step-item ${step === s.id ? "active" : ""} ${step > s.id ? "completed" : ""}`}>
                  <div className="step-number">{step > s.id ? <CheckCircle2 size={16}/> : s.id}</div>
                  <div className="step-text">
                    <div className="step-label">{t(s.label)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hero-footer" style={{ opacity: 0.8, fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} fill="currentColor" /> {t("Verified Professionals Only")}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL (FORM) */}
        <div className="booking-form-area">
          <form className="booking-form" onSubmit={handleSubmit}>
            
            {/* STEP 1: CATEGORY & PROBLEM */}
            {step === 1 && (
              <div className="form-step">
                <h3 className="step-title"><Zap size={20} color="#ff7a00"/> {t("Select Service")}</h3>
                <label>
                  {t("Category")}
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    disabled={!!providerChosen}
                    className={providerChosen ? "locked-input" : ""}
                  >
                    <option value="">{t("-- Select category --")}</option>
                    <option value="Plumbing">{t("Plumbing")}</option>
                    <option value="Electrician">{t("Electrician")}</option>
                    <option value="Cleaning">{t("Cleaning")}</option>
                    <option value="Carpenter">{t("Carpenter")}</option>
                  </select>
                </label>
                <label>
                  {t("Describe the Issue")}
                  <textarea
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder={t("e.g. Broken pipe in kitchen, Ceiling fan repair...")}
                    required
                  />
                </label>
                {providerChosen && (
                    <div className="provider-lock-msg">
                        <Lock size={12}/> {t("Category locked for selected provider")}
                    </div>
                )}
              </div>
            )}

            {/* STEP 2: CONTACT */}
            {step === 2 && (
              <div className="form-step">
                <h3 className="step-title"><User size={20} color="#ff7a00"/> {t("Your Details")}</h3>
                <div className="input-grid">
                  <label>
                    {t("Full Name")}
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </label>
                  <label>
                    {t("Phone")}
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="03XXXXXXXXX" required />
                  </label>
                </div>
                <label>
                  {t("Complete Address")}
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                </label>
                <button type="button" className="btn share-location" onClick={shareLocation}>
                  <MapPin size={16} /> {formData.location ? t("Location Linked") : t("Share Live Location")}
                </button>
              </div>
            )}

            {/* STEP 3: OTP & CONFIRM */}
            {step === 3 && (
              <div className="form-step">
                <h3 className="step-title"><ShieldCheck size={20} color="#ff7a00"/> {t("Verification")}</h3>
                
                <div className="provider-summary">
                  {providerChosen ? (
                    <div className="chosen-pro-bar">
                        <div className="pro-mini-img">👤</div>
                        <div className="pro-mini-info">
                            <strong>{providerChosen.name}</strong>
                            <span>{providerChosen.category} • PKR {providerChosen.rate || providerChosen.price}</span>
                        </div>
                    </div>
                  ) : (
                    <div className="manual-pro-selection">
                       <p>{t("Choose your professional:")}</p>
                       <div className="mini-grid">
                          {allProviders.filter(p => !formData.category || p.category === formData.category).slice(0,3).map(p => (
                              <div key={p.id} className={`mini-card ${providerChosen?.id === p.id ? "active" : ""}`} onClick={() => setProviderChosen(p)}>
                                  {p.name}
                              </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="otp-flow-box">
                  {!otp ? (
                    <button type="button" className="btn-otp-trigger" onClick={handleGenerateOtp} disabled={isGeneratingOtp || !providerChosen}>
                      {isGeneratingOtp ? t("Generating Code...") : t("Get Verification OTP")}
                    </button>
                  ) : (
                    <div className="otp-status">
                       <div className="otp-label">{t("Verification Code Sent:")}</div>
                       <div className="otp-display">{otp}</div>
                    </div>
                  )}
                  
                  <div className="otp-input-area">
                    <input
                        type="text"
                        name="otpInput"
                        value={formData.otpInput}
                        readOnly
                        placeholder="----"
                        className="otp-field"
                    />
                  </div>
                  <p className="otp-note">{t("Click generate to receive your one-time password.")}</p>
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="form-btns-row">
              {step > 1 && (
                <button type="button" className="btn-back" onClick={handlePrev}>
                  <ChevronLeft size={18} /> {t("Back")}
                </button>
              )}
              {step < 3 ? (
                <button type="button" className="btn-next" onClick={handleNext} disabled={step === 1 && (!formData.category || !formData.problem)}>
                  {t("Continue")} <ChevronRight size={18} />
                </button>
              ) : (
                <button type="submit" className="btn-confirm" disabled={!otp || !providerChosen || isSubmitting}>
                  {isSubmitting ? t("Processing...") : t("Book Service Now")}
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
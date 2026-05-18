"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, MapPin, Briefcase, FileText, Lock, 
  ChevronRight, ChevronLeft, UploadCloud, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const steps = [
  { id: 1, name: "Personal", icon: <User className="w-5 h-5" /> },
  { id: 2, name: "Contact", icon: <MapPin className="w-5 h-5" /> },
  { id: 3, name: "Professional", icon: <Briefcase className="w-5 h-5" /> },
  { id: 4, name: "Documents", icon: <FileText className="w-5 h-5" /> },
  { id: 5, name: "Security", icon: <Lock className="w-5 h-5" /> },
];

export default function ProviderOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [formData, setFormData] = useState({
    name: "", cnic: "", dob: "", gender: "",
    phone: "", district: "Okara", tehseel: "", address: "",
    category: "", experience: "", providerType: "Individual",
    profileImage: null, cnicFront: null, cnicBack: null,
    password: "", confirmPassword: ""
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Progress Tracker */}
        <div className="mb-12 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500 rounded-full" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                  currentStep >= step.id 
                    ? "bg-primary-500 text-white scale-110 shadow-primary-500/30" 
                    : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                )}>
                  {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                </div>
                <span className={cn(
                  "absolute -bottom-8 whitespace-nowrap text-xs font-bold uppercase tracking-wider",
                  currentStep >= step.id ? "text-primary-600 dark:text-primary-400" : "text-slate-400"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="premium-card min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 p-4 md:p-8"
            >
              <h2 className="text-3xl font-bold mb-8 text-gradient">
                {steps.find(s => s.id === currentStep)?.name} Information
              </h2>

              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Full Name</label>
                    <input type="text" placeholder="John Doe" className="input-premium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">CNIC Number</label>
                    <input type="text" placeholder="XXXXX-XXXXXXX-X" className="input-premium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Date of Birth</label>
                    <input type="date" className="input-premium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Gender</label>
                    <select className="input-premium">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+92</span>
                      <input type="text" className="input-premium pl-14" placeholder="3XXXXXXXXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">District</label>
                    <select className="input-premium">
                      <option>Okara</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Complete Address</label>
                    <textarea className="input-premium h-32 resize-none pt-4" placeholder="House #, Street #, Area..." />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Service Category</label>
                    <select className="input-premium">
                      <option>Electrician</option>
                      <option>Plumber</option>
                      <option>AC Technician</option>
                      <option>Handyman</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Years of Experience</label>
                    <input type="number" placeholder="5" className="input-premium" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">About Your Services</label>
                    <textarea className="input-premium h-32 resize-none pt-4" placeholder="Describe your skills and previous work experience..." />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full glass border-2 border-primary-500/50 flex items-center justify-center text-primary-500 mb-4 overflow-hidden relative group">
                      <UploadCloud className="w-10 h-10 group-hover:scale-110 transition-transform" />
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <span className="text-sm font-bold text-slate-500">Upload Profile Photo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer group h-64 overflow-hidden">
                      <img 
                        src="/CNIC_FRONT.jpeg" 
                        alt="CNIC Front Template" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="relative z-10 flex flex-col items-center">
                        <UploadCloud className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">CNIC Front Side</span>
                        <p className="text-[10px] uppercase tracking-widest mt-1 opacity-60">Click to upload</p>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer group h-64 overflow-hidden">
                      <img 
                        src="/CNIC_BACK.jpeg" 
                        alt="CNIC Back Template" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="relative z-10 flex flex-col items-center">
                        <UploadCloud className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">CNIC Back Side</span>
                        <p className="text-[10px] uppercase tracking-widest mt-1 opacity-60">Click to upload</p>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="grid grid-cols-1 gap-6 max-w-md mx-auto text-center">
                  <p className="text-slate-500 mb-4">You're almost there! Create a secure password for your account.</p>
                  <input type="password" placeholder="New Password" className="input-premium" />
                  <input type="password" placeholder="Confirm Password" className="input-premium" />
                  
                  <div className="flex items-start gap-3 text-left p-4 rounded-2xl bg-primary-500/5 mt-4">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-primary-500 text-primary-500 focus:ring-primary-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      I agree to the <span className="text-primary-600 font-bold cursor-pointer">Terms & Conditions</span> and verify that all information provided is accurate.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-b-[2.5rem]">
            <button 
              onClick={prevStep}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all",
                currentStep === 1 ? "opacity-0 pointer-events-none" : "hover:bg-slate-200 dark:hover:bg-slate-800"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <button 
              onClick={currentStep === steps.length ? undefined : nextStep}
              className="btn-primary flex items-center gap-2 px-10"
            >
              {currentStep === steps.length ? "Submit Application" : "Next Step"}
              {currentStep !== steps.length && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

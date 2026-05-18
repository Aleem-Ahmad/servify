"use client";

import { Check, Shield, Star, Zap } from "lucide-react";
import "./plans.css";
import { useTheme } from "@/context/ThemeContext";

export default function Plans() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "For occasional repairs",
      features: ["1-Day Guarantee", "Standard Matching", "Cash Payment"],
      icon: <Check size={24} />,
      color: "#9ca3af"
    },
    {
      name: "Silver",
      price: "999",
      description: "Best for households",
      features: ["2 Free Visits/Month", "5% Discount on Services", "Priority Matching", "Emergency Support"],
      icon: <Shield size={24} />,
      color: "#c0c0c0",
      popular: true
    },
    {
      name: "Gold",
      price: "2499",
      description: "Ultimate peace of mind",
      features: ["Unlimited Free Visits", "15% Discount on Services", "Elite Provider Matching", "Dedicated Account Manager"],
      icon: <Star size={24} />,
      color: "#ffd700"
    }
  ];

  return (
    <div className={`plans-page ${isDark ? "dark" : ""}`}>
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Save more with our premium household subscriptions</p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-tag">Most Popular</div>}
            <div className="plan-icon" style={{ color: plan.color }}>{plan.icon}</div>
            <h2>{plan.name}</h2>
            <div className="plan-price">
              <span className="currency">PKR</span>
              <span className="amount">{plan.price}</span>
              <span className="period">/mo</span>
            </div>
            <p className="plan-desc">{plan.description}</p>
            <ul className="plan-features">
              {plan.features.map(f => (
                <li key={f}><Check size={16} color="#10b981" /> {f}</li>
              ))}
            </ul>
            <button className="plan-btn">
              {plan.price === "0" ? "Current Plan" : "Upgrade Now"}
            </button>
          </div>
        ))}
      </div>

      <div className="benefit-footer">
        <Zap color="#ff7a00" />
        <p>All plans include our <strong>1-Day Service Guarantee</strong> and <strong>24/7 Support</strong>.</p>
      </div>
    </div>
  );
}

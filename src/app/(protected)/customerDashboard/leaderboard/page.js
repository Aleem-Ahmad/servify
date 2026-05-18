"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import "./leaderboard.css";
import { useTheme } from "@/context/ThemeContext";

export default function Leaderboard() {
  const { theme } = useTheme();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/providers/leaderboard")
      .then(res => res.json())
      .then(data => {
        if (data.success) setLeaders(data.leaders);
        setLoading(false);
      });
  }, []);

  return (
    <div className={`leaderboard-page ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="leaderboard-header">
        <Trophy size={48} color="#ff7a00" />
        <h1>Weekly Leaderboard</h1>
        <p>Recognizing our top performing service providers</p>
      </div>

      <div className="leaderboard-container">
        {loading ? (
          <div className="loading">Loading champions...</div>
        ) : (
          leaders.map((leader) => (
            <div key={leader.rank} className={`leader-card rank-${leader.rank}`}>
              <div className="rank-badge">
                {leader.rank === 1 && <Trophy size={24} className="gold" />}
                {leader.rank === 2 && <Medal size={24} className="silver" />}
                {leader.rank === 3 && <Award size={24} className="bronze" />}
                {leader.rank > 3 && <span>#{leader.rank}</span>}
              </div>
              
              <img src={leader.image} alt={leader.name} className="leader-img" />
              
              <div className="leader-info">
                <h3>{leader.name}</h3>
                <span className="leader-category">{leader.category}</span>
                <div className={`leader-badge-tag ${leader.badge.toLowerCase()}`}>
                  {leader.badge}
                </div>
              </div>

              <div className="leader-points">
                <TrendingUp size={16} />
                <span>{leader.points} pts</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

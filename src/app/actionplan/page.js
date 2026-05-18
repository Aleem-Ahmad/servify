"use client";

import React from "react";
import { Database, ArrowLeftRight, Table, Code, FileText, Download, Award, ShieldCheck, Medal } from "lucide-react";

export default function ActionPlanPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="action-plan-wrapper">
      {/* ── PRINT & DESIGN SYSTEM CSS ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        :root {
          --primary: #ff7a00;
          --primary-hover: #e06b00;
          --dark: #0f172a;
          --light-bg: #f8fafc;
          --card-bg: #ffffff;
          --border: #e2e8f0;
          --text-main: #334155;
          --text-dark: #0f172a;
        }

        body {
          font-family: 'Outfit', sans-serif;
          background-color: var(--light-bg);
          color: var(--text-main);
          margin: 0;
          padding: 0;
        }

        .action-plan-wrapper {
          max-width: 1100px;
          margin: 40px auto;
          padding: 0 24px;
        }

        /* ── HEADER ── */
        .plan-header {
          background: linear-gradient(135deg, var(--dark) 0%, #1e293b 100%);
          border-radius: 24px;
          padding: 48px;
          color: #ffffff;
          margin-bottom: 40px;
          position: relative;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .plan-header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 122, 0, 0.15) 0%, rgba(255, 122, 0, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .plan-badge {
          background: rgba(255, 122, 0, 0.15);
          color: var(--primary);
          border: 1px solid rgba(255, 122, 0, 0.3);
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
        }

        .plan-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 12px 0;
          line-height: 1.2;
          background: linear-gradient(to right, #ffffff, #f1f5f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .plan-header p {
          font-size: 1.1rem;
          opacity: 0.8;
          margin: 0 0 32px 0;
          max-width: 600px;
          line-height: 1.6;
        }

        .btn-download {
          background: var(--primary);
          color: #ffffff;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 10px 20px rgba(255, 122, 0, 0.2);
        }

        .btn-download:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(255, 122, 0, 0.3);
        }

        /* ── SECTIONS ── */
        .section-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .section-card h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-dark);
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 2px solid var(--light-bg);
          padding-bottom: 12px;
        }

        .section-card p {
          line-height: 1.6;
          margin-bottom: 20px;
        }

        /* ── GRID OF TABLES ── */
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .table-card {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          background: #fdfdfd;
          transition: all 0.2s;
        }

        .table-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .table-card h3 {
          margin: 0 0 12px 0;
          font-size: 1.15rem;
          color: var(--primary);
          font-weight: 700;
          border-bottom: 1px dashed var(--border);
          padding-bottom: 8px;
        }

        .column-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        }

        .column-row:last-child {
          border-bottom: none;
        }

        .col-name {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }

        .col-type {
          color: #64748b;
          font-size: 0.8rem;
        }

        .col-tag {
          font-size: 0.75rem;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
        }

        .col-tag.pk {
          background: rgba(255, 122, 0, 0.1);
          color: var(--primary);
        }

        .col-tag.fk {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        /* ── CODE BLOCK ── */
        pre {
          background: #0f172a;
          color: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 16px 0;
          border-left: 4px solid var(--primary);
        }

        /* ── PRINT MEDIA TARGETING ── */
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }

          .action-plan-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }

          .plan-header {
            background: none !important;
            color: #000000 !important;
            padding: 20px 0 !important;
            border-bottom: 2px solid #000000 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .plan-header h1 {
            -webkit-text-fill-color: initial !important;
            color: #000000 !important;
            font-size: 2.2rem !important;
          }

          .plan-header p,
          .plan-badge {
            color: #000000 !important;
            background: none !important;
            border: none !important;
          }

          .btn-download {
            display: none !important;
          }

          .section-card {
            border: none !important;
            box-shadow: none !important;
            padding: 20px 0 !important;
            page-break-inside: avoid;
          }

          .table-card {
            page-break-inside: avoid;
            background: #ffffff !important;
            border: 1px solid #000000 !important;
          }

          pre {
            background: #f8fafc !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            page-break-inside: avoid;
          }

          .tables-grid {
            display: block !important;
          }

          .table-card {
            margin-bottom: 20px !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="plan-header">
        <div className="plan-badge">
          <ArrowLeftRight size={14} /> Migration Roadmap
        </div>
        <h1>Servify PostgreSQL Migration Action Plan</h1>
        <p>
          A comprehensive database migration roadmap translating Servify’s NoSQL MongoDB collections into highly optimized, fully normalized SQL tables inside a single PostgreSQL database instance.
        </p>
        <button className="btn-download" onClick={handlePrint}>
          <Download size={18} /> Download Printable PDF
        </button>
      </div>

      {/* ── SECTION 1 ── */}
      <div className="section-card">
        <h2>
          <Database size={24} color="#ff7a00" />
          1. Database Instance Count
        </h2>
        <p>
          You only need to create <strong>ONE PostgreSQL database</strong> (e.g., <code>servify_db</code>). 
          Unlike MongoDB where nesting arrays or creating isolated collections is typical, relational databases structure and join entities using individual 
          tables with defined schema parameters, constraints, and relationships all hosted inside a single database instance.
        </p>
      </div>

      {/* ── SECTION 2 ── */}
      <div className="section-card">
        <h2>
          <Table size={24} color="#ff7a00" />
          2. Relational Database Normalization Schema
        </h2>
        <p>
          To maintain structural integrity and eliminate duplicate data, nested documents (like document image uploads, tracking location points, and feedback media lists) are split into individual tables.
        </p>

        <div className="tables-grid">
          {/* Table 1 */}
          <div className="table-card">
            <h3>1. users</h3>
            <div className="column-row"><span className="col-name">id</span> <span className="col-tag pk">PK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">username</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">email</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">password</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">role</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">status</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">is_verified</span> <span className="col-type">BOOLEAN</span></div>
          </div>

          {/* Table 2 */}
          <div className="table-card">
            <h3>2. user_documents</h3>
            <div className="column-row"><span className="col-name">user_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">cnic_front</span> <span className="col-type">TEXT</span></div>
            <div className="column-row"><span className="col-name">cnic_back</span> <span className="col-type">TEXT</span></div>
            <div className="column-row"><span className="col-name">skill_demo</span> <span className="col-type">TEXT</span></div>
          </div>

          {/* Table 3 */}
          <div className="table-card">
            <h3>3. provider_stats</h3>
            <div className="column-row"><span className="col-name">user_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">trust_score</span> <span className="col-type">INT</span></div>
            <div className="column-row"><span className="col-name">rating</span> <span className="col-type">DECIMAL</span></div>
            <div className="column-row"><span className="col-name">badge</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">completed_jobs</span> <span className="col-type">INT</span></div>
          </div>

          {/* Table 4 */}
          <div className="table-card">
            <h3>4. bookings</h3>
            <div className="column-row"><span className="col-name">id</span> <span className="col-tag pk">PK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">customer_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">provider_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">service</span> <span className="col-type">VARCHAR</span></div>
            <div className="column-row"><span className="col-name">budget</span> <span className="col-type">DECIMAL</span></div>
            <div className="column-row"><span className="col-name">status</span> <span className="col-type">VARCHAR</span></div>
          </div>

          {/* Table 5 */}
          <div className="table-card">
            <h3>5. reviews</h3>
            <div className="column-row"><span className="col-name">id</span> <span className="col-tag pk">PK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">booking_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">customer_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">provider_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">rating</span> <span className="col-type">INT</span></div>
            <div className="column-row"><span className="col-name">comment</span> <span className="col-type">TEXT</span></div>
          </div>

          {/* Table 6 */}
          <div className="table-card">
            <h3>6. review_media</h3>
            <div className="column-row"><span className="col-name">id</span> <span className="col-tag pk">PK</span> <span className="col-type">INT</span></div>
            <div className="column-row"><span className="col-name">review_id</span> <span className="col-tag fk">FK</span> <span className="col-type">UUID</span></div>
            <div className="column-row"><span className="col-name">media_url</span> <span className="col-type">TEXT</span></div>
            <div className="column-row"><span className="col-name">media_type</span> <span className="col-type">VARCHAR</span></div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 ── */}
      <div className="section-card">
        <h2>
          <Code size={24} color="#ff7a00" />
          3. DDL Schema Definition Scripts
        </h2>
        <p>Use the following DDL statements to spin up the normalized PostgreSQL tables inside your environment:</p>
        <pre>{`CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Blocked')),
    is_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    cnic VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    trust_score INT DEFAULT 0,
    badge VARCHAR(20) DEFAULT 'Basic',
    rating DECIMAL(3,2) DEFAULT 5.0
);`}</pre>
      </div>

      {/* ── SECTION 4 ── */}
      <div className="section-card">
        <h2>
          <FileText size={24} color="#ff7a00" />
          4. Essential SQL Joins For Queries
        </h2>
        <p>Relational queries utilize highly optimized SQL JOINS to fetch linked data values instantly:</p>
        
        <h4 style={{ color: 'var(--text-dark)', marginTop: '20px', marginBottom: '8px' }}>A. Get Provider Profile with All Real Customer Reviews</h4>
        <pre>{`SELECT 
    r.rating,
    r.comment,
    c.name AS customer_name,
    c.image AS customer_avatar,
    m.media_url,
    m.media_type
FROM reviews r
JOIN users c ON r.customer_id = c.id
LEFT JOIN review_media m ON r.id = m.review_id
WHERE r.provider_id = 'PROVIDER_UUID'
ORDER BY r.created_at DESC;`}</pre>
      </div>
    </div>
  );
}

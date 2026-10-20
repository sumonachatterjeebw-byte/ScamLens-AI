import React from 'react';
import { Search, Smartphone, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

export default function Header({ activeTab, setActiveTab, serverStatus }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <Logo size={42} />

        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            id="nav-inspector"
            className={`nav-tab-btn ${activeTab === 'inspector' ? 'active' : ''}`}
            onClick={() => setActiveTab('inspector')}
          >
            <Search size={16} />
            <span>Web Inspector</span>
          </button>

          <button
            id="nav-shield"
            className={`nav-tab-btn ${activeTab === 'shield' ? 'active' : ''}`}
            onClick={() => setActiveTab('shield')}
          >
            <Smartphone size={16} />
            <span>Call &amp; SMS Shield</span>
          </button>

          <button
            id="nav-learn"
            className={`nav-tab-btn ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => setActiveTab('learn')}
          >
            <GraduationCap size={16} />
            <span>Learning Lab</span>
          </button>

          <button
            id="nav-portfolio"
            className={`nav-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <BookOpen size={16} />
            <span>Portfolio &amp; Specs</span>
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
          {serverStatus === 'ok' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0F766E', fontWeight: '500' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0F766E', animation: 'pulse 2s infinite' }} />
              FastAPI Online
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#9A3412', fontWeight: '500' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9A3412' }} />
              Local Engine Active
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

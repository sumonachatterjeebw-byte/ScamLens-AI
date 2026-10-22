import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';
import SampleList from './components/SampleList';
import ShieldSimulator from './components/ShieldSimulator';
import PortfolioOverview from './components/PortfolioOverview';
import LearningLab from './components/LearningLab';
import { analyzeMessage, checkServerHealth } from './api';
import { SAMPLE_MESSAGES } from './samples';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' | 'shield' | 'learn' | 'portfolio'
  const initialSample = SAMPLE_MESSAGES[0];

  const [text, setText] = useState(initialSample.text);
  const [url, setUrl] = useState(initialSample.url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerHealth().then(res => {
      const isOnline = res.status === 'ok';
      setServerStatus(isOnline ? 'ok' : 'offline');
      setIsLoading(true);
      analyzeMessage(initialSample.text, initialSample.url || '', false)
        .then(data => { setResult(data); })
        .catch(err => { console.error('Initial sample analysis failed:', err); })
        .finally(() => { setIsLoading(false); });
    });
  }, []);

  const handleAnalyze = async () => {
    if (!text || !text.trim()) {
      setError({ code: 'EMPTY_INPUT', message: 'Please paste or type a message in the input box to inspect.' });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeMessage(text, url, false);
      setResult(data);
      setTimeout(() => {
        document.getElementById('results-heading')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    } catch (err) {
      setError({ code: err.code || 'ERROR', message: err.message || 'An unexpected error occurred.' });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setUrl('');
    setError(null);
    setResult(null);
  };

  const handleSelectSample = async (sample) => {
    setText(sample.text);
    setUrl(sample.url || '');
    setError(null);
    setIsLoading(true);
    try {
      const data = await analyzeMessage(sample.text, sample.url || '', false);
      setResult(data);
      setTimeout(() => {
        document.getElementById('results-heading')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    } catch (err) {
      setError({ code: err.code || 'ERROR', message: err.message || 'An unexpected error occurred.' });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} serverStatus={serverStatus} />

      <main className="app-container" style={{ marginTop: '24px' }}>
        {activeTab === 'inspector' && (
          <div>
            <InputPanel
              text={text}
              setText={setText}
              url={url}
              setUrl={setUrl}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              isLoading={isLoading}
              error={error}
              onSelectSample={handleSelectSample}
            />
            {result && <ResultPanel result={result} />}
            <SampleList onSelectSample={handleSelectSample} />
          </div>
        )}

        {activeTab === 'shield' && <ShieldSimulator />}

        {activeTab === 'learn' && <LearningLab />}

        {activeTab === 'portfolio' && <PortfolioOverview />}
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border-light)', background: 'white', padding: '24px 20px', marginTop: '60px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>ScamLens AI</strong> &bull; Privacy-Conscious Scam Detection &amp; Verification Platform
          </div>
          <div>
            No background surveillance &bull; Zero storage of message content &bull; Strictly on-device rules
          </div>
        </div>
      </footer>
    </div>
  );
}

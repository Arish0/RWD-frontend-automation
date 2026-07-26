'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Square,
  Monitor,
  Server,
  Terminal as TerminalIcon,
  Settings,
  FileText,
  Layers,
  ArrowRightLeft,
  RotateCcw,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Zap,
  Code,
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface LogLine {
  text: string;
  type: 'system' | 'error' | 'success' | 'warning' | 'normal';
}

interface TestRunStatus {
  runId?: string;
  workflowRunId?: number | null;
  status?: string;
  conclusion?: string | null;
  htmlUrl?: string;
  logsUrl?: string;
  artifacts?: Array<{
    id: number;
    name: string;
    archiveDownloadUrl: string;
  }>;
  message?: string;
  steps?: Array<{
    name: string;
    status: string;
    conclusion: string | null;
  }>;
}

const LOCAL_API_BASE = 'http://localhost:3001';
const REMOTE_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://realworld-backend-y89l.onrender.com';
const DEFAULT_API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? LOCAL_API_BASE : REMOTE_API_BASE;

const TEST_CONFIGS: Record<string, any> = {
  requestLoan: {
    name: 'Update & Cancellation',
    flow: 'requestLoan',
    description: 'Creates a loan request, updates parameters, and cancels the negotiation to free up the NFT.',
    icon: <Layers size={20} />,
    defaultConfig: {
      borrowerEmail: 'brooklyn@yopmail.com',
      borrowerPassword: 'Test@1233333',
      loanAmountMin: 1000,
      loanAmountMax: 5000,
      aprMin: 10,
      aprMax: 20,
      duration: 90
    }
  },
  requestAndLend: {
    name: 'Request & Acceptance',
    flow: 'requestAndLend',
    description: 'Borrower requests a loan and the lender signs in to fund the loan in another browser context.',
    icon: <FileText size={20} />,
    defaultConfig: {
      borrowerEmail: 'brooklyn@yopmail.com',
      borrowerPassword: 'Test@1233333',
      lenderEmail: 'harish@yopmail.com',
      lenderPassword: 'Test@1233333',
      loanAmountMin: 1000,
      loanAmountMax: 5000,
      aprMin: 10,
      aprMax: 20,
      duration: 90
    }
  },
  counterRecounter: {
    name: 'Counter & Re-Counter',
    flow: 'counterRecounter',
    description: 'Runs a dynamic negotiation loop between the borrower and the lender offering multiple counters.',
    icon: <ArrowRightLeft size={20} />,
    defaultConfig: {
      borrowerEmail: 'brooklyn@yopmail.com',
      borrowerPassword: 'Test@1233333',
      lenderEmail: 'harish@yopmail.com',
      lenderPassword: 'Test@1233333',
      iterations: 10
    }
  },
  repayment: {
    name: 'Repayment flow (6 Phases)',
    flow: 'repayment',
    description: 'Executes all 6 phases of repayment sequentially using the same NFT (with early and interest configurations).',
    icon: <RotateCcw size={20} />,
    defaultConfig: {
      borrowerEmail: 'brooklyn@yopmail.com',
      borrowerPassword: 'Test@1233333',
      lenderEmail: 'harish@yopmail.com',
      lenderPassword: 'Test@1233333',
      loanAmountMin: 1000,
      loanAmountMax: 5000,
      aprMin: 10,
      aprMax: 20,
      duration: 90,
      nftId: ''
    }
  },
  refinance: {
    name: 'Refinance flow (7 Phases)',
    flow: 'refinance',
    description: 'Executes all 7 phases of loan refinancing (early repayment, any/original lender, interest paid configurations).',
    icon: <Zap size={20} />,
    defaultConfig: {
      borrowerEmail: 'brooklyn@yopmail.com',
      borrowerPassword: 'Test@1233333',
      lenderEmail: 'harish@yopmail.com',
      lenderPassword: 'Test@1233333',
      loanAmountMin: 1000,
      loanAmountMax: 5000,
      aprMin: 10,
      aprMax: 20,
      duration: 90,
      nftId: ''
    }
  },
  e2etest: {
    name: 'E2E Refinance Flow',
    flow: 'e2etest',
    description: 'Runs E2E Refinance flow for a specific NFT, including interest payments and multi-lender refinance validation.',
    icon: <Code size={20} />,
    defaultConfig: {
      borrowerEmail: 'brooklyn@yopmail.com',
      borrowerPassword: 'Test@1233333',
      lenderEmail: 'harish@yopmail.com',
      lenderPassword: 'Test@1233333',
      lender2Email: 'testingsparkout0123@gmail.com',
      lender2Password: 'V_sarumathi2002@',
      loanAmountMin: 1000,
      loanAmountMax: 5000,
      aprMin: 10,
      aprMax: 20,
      duration: 90,
      nftId: ''
    }
  },
};

export default function TestPage() {
  const params = useParams();
  const testId = params.testId as string;
  const testConfig = TEST_CONFIGS[testId];

  const [logs, setLogs] = useState<LogLine[]>([]);
  const [executionLogs, setExecutionLogs] = useState<LogLine[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<Array<{ name: string, status: string, conclusion: string | null }>>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [workflowUrl, setWorkflowUrl] = useState<string | null>(null);
  const [artifactLinks, setArtifactLinks] = useState<TestRunStatus['artifacts']>([]);
  const [apiBase, setApiBase] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('realworldApiBase') || DEFAULT_API_BASE;
    }
    return DEFAULT_API_BASE;
  });
  const [nftIds, setNftIds] = useState<string[]>(['']);
  const [formData, setFormData] = useState<Record<string, any>>(testConfig?.defaultConfig || {});

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const lastStatusRef = useRef<string>('');
  const fetchedLogsRef = useRef<string>('');

  const isLocalRunner = apiBase === LOCAL_API_BASE;

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nftId: nftIds.filter(id => id.trim() !== '').join(',')
    }));
  }, [nftIds]);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource(`${apiBase}/stream-logs`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const text = data.text;

        let type: LogLine['type'] = 'normal';
        if (text.includes('=== STARTING') || text.includes('=== TEST COMPLETED') || text.includes('Running command:')) {
          type = 'system';
        } else if (text.includes('[ERROR]') || text.includes('[SYSTEM ERROR]') || text.includes('failed') || text.includes('Error:')) {
          type = 'error';
        } else if (text.includes('successfully') || text.includes('SUCCESS') || text.includes('completed successfully')) {
          type = 'success';
        } else if (text.includes('Warning:') || text.includes('warn')) {
          type = 'warning';
        }

        setLogs(prev => [...prev, { text, type }]);

        if (text.includes('=== STARTING')) {
          setIsRunning(true);
          setStatusText('Running Test');
        } else if (text.includes('=== TEST COMPLETED') || text.includes('=== TEST EXPLICITLY')) {
          setIsRunning(false);
          setStatusText('Completed');
        }
      } catch (err) {
        console.error('Failed to parse log event:', err);
      }
    };

    eventSource.onerror = () => {
      console.log('SSE connection disconnected');
    };

    return () => {
      eventSource.close();
    };
  }, [apiBase]);

  // Auto-scroll terminal to bottom when logs update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, executionLogs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRunTest = async () => {
    if (isRunning || !testConfig) return;

    setLogs([
      { text: `[SYSTEM] === STARTING TEST: ${testConfig.name} ===\n`, type: 'system' },
      { text: `[SYSTEM] Flow: ${testConfig.flow}\n`, type: 'system' },
      { text: `[SYSTEM] Connecting to ${apiBase}...\n`, type: 'system' },
    ]);
    setExecutionLogs([]);
    setWorkflowSteps([]);
    setIsRunning(true);
    setStatusText('Dispatching');
    setCurrentRunId(null);
    setWorkflowUrl(null);
    setArtifactLinks([]);
    lastStatusRef.current = '';
    fetchedLogsRef.current = '';

    const payload = {
      flow: testConfig.flow,
      borrowerEmail: formData.borrowerEmail,
      borrowerPassword: formData.borrowerPassword,
      lenderEmail: formData.lenderEmail,
      lenderPassword: formData.lenderPassword,
      lender2Email: testConfig.flow === 'e2etest' ? formData.lender2Email : undefined,
      lender2Password: testConfig.flow === 'e2etest' ? formData.lender2Password : undefined,
      loanAmountMin: formData.loanAmountMin ? Number(formData.loanAmountMin) : undefined,
      loanAmountMax: formData.loanAmountMax ? Number(formData.loanAmountMax) : undefined,
      aprMin: formData.aprMin ? Number(formData.aprMin) : undefined,
      aprMax: formData.aprMax ? Number(formData.aprMax) : undefined,
      duration: formData.duration ? Number(formData.duration) : undefined,
      iterations: formData.iterations ? Number(formData.iterations) : undefined,
      nftId: formData.nftId ? String(formData.nftId || '').trim() : undefined,
      headed: Boolean(formData.headed)
    };

    try {
      const response = await fetch(`${apiBase}/run-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      setLogs(prev => [
        ...prev,
        {
          text: `[FRONTEND] Response ${response.status}: ${resData.message || JSON.stringify(resData)}\n`,
          type: resData.success ? 'success' : 'error',
        },
      ]);

      if (!resData.success) {
        setIsRunning(false);
        setStatusText('Error');
        return;
      }

      const runId = resData.runId || resData.trackingId;
      setCurrentRunId(runId);
      setWorkflowUrl(resData.htmlUrl || null);
      setArtifactLinks(resData.artifacts || []);
      setStatusText('Running');
    } catch (err: any) {
      setLogs(prev => [...prev, { text: `[CONNECTION ERROR] ${err.message}\n`, type: 'error' }]);
      setIsRunning(false);
      setStatusText('Offline');
    }
  };

  if (!testConfig) {
    return (
      <main className="main-content">
        <div style={{ textAlign: 'center', paddingTop: '60px' }}>
          <h1 className="header-title">Test Not Found</h1>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '30px', display: 'inline-block' }}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px',
      }}
    >
      {/* Thin top strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 12px 18px',
          fontSize: '12px',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>realworld.fi · e2e automation suite</span>
        <span style={{ display: 'flex', gap: '20px' }}>
          <span>staging</span>
          <span style={{ color: isRunning ? 'var(--warning)' : 'var(--success)' }}>
            ● {isRunning ? 'running' : 'ready'}
          </span>
        </span>
      </div>

      {/* Dark panel */}
      <section
        style={{
          flex: 1,
          background:
            'radial-gradient(130% 100% at 20% 0%, #17122b 0%, #0e0a1a 45%, #07050e 100%)',
          borderRadius: '32px',
          border: '1px solid rgba(196, 181, 253, 0.22)',
          boxShadow:
            '0 60px 140px rgba(0,0,0,0.85), inset 0 1px 0 rgba(199,181,253,0.12)',
          padding: '32px 44px 48px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.8s ease-out',
        }}
      >
        {/* Nav bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <ArrowLeft size={16} /> All Flows
            </Link>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '1px',
              }}
            >
              REAL<span style={{ color: 'var(--primary)' }}>WORLD</span>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0,0,0,0.3)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px',
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isRunning ? 'var(--warning)' : 'var(--success)',
                boxShadow: `0 0 8px ${isRunning ? 'var(--warning)' : 'var(--success)'}`,
              }}
            />
            {statusText.toUpperCase()}
          </div>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              color: 'var(--primary)',
              fontWeight: 600,
              marginBottom: '12px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            TEST FLOW · {testId?.toUpperCase()}
          </div>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              lineHeight: 0.98,
              letterSpacing: '-1.5px',
              margin: '0 0 14px',
            }}
          >
            {testConfig.name}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {testConfig.description}
          </p>
        </div>

        <div className="dashboard-grid">
        {/* Configuration Card */}
        <div className="card">
          <h3 className="card-title">
            <Settings size={16} />
            Test Configuration
          </h3>

          <div className="form-group">
            <label className="form-label">Borrower Email</label>
            <input
              className="form-input"
              type="email"
              name="borrowerEmail"
              value={formData.borrowerEmail || ''}
              onChange={handleInputChange}
              disabled={isRunning}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Borrower Password</label>
            <input
              className="form-input"
              type="password"
              name="borrowerPassword"
              value={formData.borrowerPassword || ''}
              onChange={handleInputChange}
              disabled={isRunning}
            />
          </div>

          {testConfig.flow !== 'requestLoan' && (
            <>
              <div className="form-group">
                <label className="form-label">Lender Email</label>
                <input
                  className="form-input"
                  type="email"
                  name="lenderEmail"
                  value={formData.lenderEmail || ''}
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lender Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="lenderPassword"
                  value={formData.lenderPassword || ''}
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>
            </>
          )}

          {testConfig.flow === 'e2etest' && (
            <>
              <div className="form-group">
                <label className="form-label">Lender 2 Email</label>
                <input
                  className="form-input"
                  type="email"
                  name="lender2Email"
                  value={formData.lender2Email || ''}
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lender 2 Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="lender2Password"
                  value={formData.lender2Password || ''}
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>
            </>
          )}

          {testConfig.flow === 'counterRecounter' && (
            <div className="form-group">
              <label className="form-label">Iterations</label>
              <input
                className="form-input"
                type="number"
                name="iterations"
                value={formData.iterations || ''}
                onChange={handleInputChange}
                disabled={isRunning}
              />
            </div>
          )}

          {testConfig.flow !== 'counterRecounter' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Min Amount ($RW)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="loanAmountMin"
                    value={formData.loanAmountMin || ''}
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Amount ($RW)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="loanAmountMax"
                    value={formData.loanAmountMax || ''}
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Min APR (%)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="aprMin"
                    value={formData.aprMin || ''}
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max APR (%)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="aprMax"
                    value={formData.aprMax || ''}
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Days)</label>
                <input
                  className="form-input"
                  type="number"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>
            </>
          )}

          {(testConfig.flow === 'repayment' || testConfig.flow === 'refinance' || testConfig.flow === 'e2etest') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>NFT IDs</label>
                {nftIds.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setNftIds(prev => [...prev, ''])}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                    disabled={isRunning}
                  >
                    + Add NFT
                  </button>
                )}
              </div>

              {nftIds.map((id, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="0x1c71388e4f5089926fF153F7635F81C4F1676fCb/6"
                    value={id}
                    onChange={(e) => {
                      const newIds = [...nftIds];
                      newIds[index] = e.target.value;
                      setNftIds(newIds);
                    }}
                    disabled={isRunning}
                    style={{ flex: 1 }}
                  />
                  {nftIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newIds = nftIds.filter((_, i) => i !== index);
                        setNftIds(newIds);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        padding: '8px 12px',
                      }}
                      disabled={isRunning}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '6px' }}>
            <div className="btn-container">
              <button
                className="btn btn-primary"
                onClick={handleRunTest}
                disabled={isRunning}
                style={{
                  opacity: isRunning ? 0.7 : 1,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                }}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run Test
                  </>
                )}
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => window.open(apiBase + '/browser', '_blank')}
              >
                <Monitor size={16} />
                Browser
              </button>
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="terminal-column">
          <div className="terminal-container">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot dot-red"></span>
                <span className="terminal-dot dot-yellow"></span>
                <span className="terminal-dot dot-green"></span>
              </div>
              <div className="terminal-title">test-execution.log</div>
              <TerminalIcon size={14} />
            </div>

            <div className="terminal-body">
              {logs.length === 0 && executionLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Logs will appear here when you run a test...
                </div>
              ) : (
                <>
                  {logs.map((log, idx) => (
                    <div key={`sys-${idx}`} className={`log-line log-${log.type}`}>
                      {log.text}
                    </div>
                  ))}
                  {executionLogs.map((log, idx) => (
                    <div key={`exec-${idx}`} className={`log-line log-${log.type}`}>
                      {log.text}
                    </div>
                  ))}
                </>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}

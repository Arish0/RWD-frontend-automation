import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Terminal as TerminalIcon, 
  Settings, 
  FileText, 
  Layers, 
  ArrowRightLeft, 
  RotateCcw
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  flow: string;
  description: string;
  icon: React.ReactNode;
  defaultConfig: {
    borrowerEmail?: string;
    borrowerPassword?: string;
    lenderEmail?: string;
    lenderPassword?: string;
    loanAmountMin?: number;
    loanAmountMax?: number;
    aprMin?: number;
    aprMax?: number;
    duration?: number | string;
    iterations?: number;
  };
}

interface LogLine {
  text: string;
  type: 'system' | 'error' | 'success' | 'warning' | 'normal';
}

const API_BASE = 'http://localhost:3000';

function App() {
  const scenarios: Scenario[] = [
    {
      id: 'requestLoan',
      name: 'Update & Cancellation',
      flow: 'requestLoan',
      description: 'Creates a loan request, updates parameters, and cancels the negotiation to free up the NFT.',
      icon: <Layers className="nav-item-icon" size={20} />,
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
    {
      id: 'requestAndLend',
      name: 'Request & Acceptance',
      flow: 'requestAndLend',
      description: 'Borrower requests a loan and the lender signs in to fund the loan in another browser context.',
      icon: <FileText className="nav-item-icon" size={20} />,
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
    {
      id: 'counterRecounter',
      name: 'Counter & Re-Counter',
      flow: 'counterRecounter',
      description: 'Runs a dynamic negotiation loop between the borrower and the lender offering multiple counters.',
      icon: <ArrowRightLeft className="nav-item-icon" size={20} />,
      defaultConfig: {
        borrowerEmail: 'brooklyn@yopmail.com',
        borrowerPassword: 'Test@1233333',
        lenderEmail: 'harish@yopmail.com',
        lenderPassword: 'Test@1233333',
        iterations: 10
      }
    },
    {
      id: 'repayment',
      name: 'Repayment flow (6 Phases)',
      flow: 'repayment',
      description: 'Executes all 6 phases of repayment sequentially using the same NFT (with early and interest configurations).',
      icon: <RotateCcw className="nav-item-icon" size={20} />,
      defaultConfig: {
        borrowerEmail: 'brooklyn@yopmail.com',
        borrowerPassword: 'Test@1233333',
        lenderEmail: 'harish@yopmail.com',
        lenderPassword: 'Test@1233333'
      }
    }
  ];

  const [activeTab, setActiveTab] = useState<string>('requestLoan');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [formData, setFormData] = useState<Record<string, any>>({
    borrowerEmail: 'brooklyn@yopmail.com',
    borrowerPassword: 'Test@1233333',
    lenderEmail: 'harish@yopmail.com',
    lenderPassword: 'Test@1233333',
    loanAmountMin: 1000,
    loanAmountMax: 5000,
    aprMin: 10,
    aprMax: 20,
    duration: 90,
    iterations: 10
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const activeScenario = scenarios.find(s => s.id === activeTab) || scenarios[0];

  // SSE Logs subscription
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/stream-logs`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const text = data.text;
        
        let type: LogLine['type'] = 'normal';
        if (text.includes('=== STARTING') || text.includes('=== TEST COMPLETED') || text.includes('=== TEST EXPLICITLY') || text.includes('Running command:')) {
          type = 'system';
        } else if (text.includes('[ERROR]') || text.includes('[SYSTEM ERROR]') || text.includes('failed') || text.includes('Error:')) {
          type = 'error';
        } else if (text.includes('successfully') || text.includes('SUCCESS') || text.includes('completed successfully') || text.includes('complete!')) {
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
      console.log('SSE connection disconnected. Trying reconnect...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Scroll to bottom of terminal when logs are added
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Run selected test scenario
  const handleRunTest = async () => {
    if (isRunning) return;

    setLogs([]);
    setIsRunning(true);
    setStatusText('Initiating');

    // Prepare config payload
    const payload = {
      flow: activeScenario.flow,
      borrowerEmail: formData.borrowerEmail,
      borrowerPassword: formData.borrowerPassword,
      lenderEmail: formData.lenderEmail,
      lenderPassword: formData.lenderPassword,
      loanAmountMin: Number(formData.loanAmountMin),
      loanAmountMax: Number(formData.loanAmountMax),
      aprMin: Number(formData.aprMin),
      aprMax: Number(formData.aprMax),
      duration: activeScenario.flow === 'counterRecounter' ? undefined : Number(formData.duration),
      iterations: activeScenario.flow === 'counterRecounter' ? Number(formData.iterations) : undefined
    };

    try {
      const response = await fetch(`${API_BASE}/run-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!resData.success) {
        setLogs(prev => [...prev, { text: `[SYSTEM ERROR] ${resData.message}\n`, type: 'error' }]);
        setIsRunning(false);
        setStatusText('Error');
      }
    } catch (err: any) {
      setLogs(prev => [...prev, { text: `[CONNECTION ERROR] Failed to reach E2E backend server: ${err.message}\n`, type: 'error' }]);
      setIsRunning(false);
      setStatusText('Offline');
    }
  };

  // Stop running test scenario
  const handleStopTest = async () => {
    try {
      const response = await fetch(`${API_BASE}/stop-test`, {
        method: 'POST'
      });
      const resData = await response.json();
      if (!resData.success) {
        setLogs(prev => [...prev, { text: `[SYSTEM ERROR] ${resData.message}\n`, type: 'error' }]);
      }
    } catch (err: any) {
      console.error('Failed to abort test:', err);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <Settings className="logo-icon animate-spin-slow" size={28} />
          <span className="logo-text">RealWorld E2E</span>
        </div>

        <ul className="nav-menu">
          {scenarios.map(s => (
            <li 
              key={s.id}
              className={`nav-item ${activeTab === s.id ? 'active' : ''}`}
              onClick={() => {
                if (!isRunning) setActiveTab(s.id);
              }}
            >
              {s.icon}
              <span>{s.name}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="server-status">
            <span className="status-dot"></span>
            <span>Local headed runner connected</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-content">
        <header className="header-panel">
          <div>
            <h1 className="header-title">{activeScenario.name} Flow</h1>
            <p className="header-subtitle">{activeScenario.description}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              padding: '6px 12px', 
              borderRadius: '8px', 
              background: isRunning ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: isRunning ? 'var(--primary-hover)' : 'var(--text-secondary)'
            }}>
              STATUS: {statusText.toUpperCase()}
            </span>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Form Config Card */}
          <div className="card">
            <h3 className="card-title">
              <Settings size={18} />
              Config Parameters
            </h3>

            <div className="form-group">
              <label className="form-label">Borrower Email</label>
              <input 
                className="form-input" 
                type="email" 
                name="borrowerEmail" 
                value={formData.borrowerEmail} 
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
                value={formData.borrowerPassword} 
                onChange={handleInputChange}
                disabled={isRunning}
              />
            </div>

            {activeScenario.flow !== 'requestLoan' && (
              <>
                <div className="form-group">
                  <label className="form-label">Lender Email (Harish Account)</label>
                  <input 
                    className="form-input" 
                    type="email" 
                    name="lenderEmail" 
                    value={formData.lenderEmail} 
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
                    value={formData.lenderPassword} 
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>
              </>
            )}

            {activeScenario.flow === 'counterRecounter' && (
              <div className="form-group">
                <label className="form-label">Negotiation Iterations</label>
                <input 
                  className="form-input" 
                  type="number" 
                  name="iterations" 
                  value={formData.iterations} 
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>
            )}

            {activeScenario.flow !== 'counterRecounter' && activeScenario.flow !== 'repayment' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Min Amount ($RW)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      name="loanAmountMin" 
                      value={formData.loanAmountMin} 
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
                      value={formData.loanAmountMax} 
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
                      value={formData.aprMin} 
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
                      value={formData.aprMax} 
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
                    value={formData.duration} 
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>
              </>
            )}

            <div className="btn-container">
              <button 
                className="btn btn-primary" 
                onClick={handleRunTest}
                disabled={isRunning}
              >
                <Play size={16} />
                Run Headed Test
              </button>

              <button 
                className="btn btn-danger" 
                onClick={handleStopTest}
                disabled={!isRunning}
              >
                <Square size={16} />
                Stop Execution
              </button>
            </div>
          </div>

          {/* Terminal Card */}
          <div className="terminal-container">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot dot-red"></span>
                <span className="terminal-dot dot-yellow"></span>
                <span className="terminal-dot dot-green"></span>
              </div>
              <div className="terminal-title">headed-playwright-runner.log</div>
              <TerminalIcon size={14} className="text-muted" />
            </div>

            <div className="terminal-body">
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Console waiting for test execution... (Headed browser window will open on screen once started)
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`log-line log-${log.type}`}>
                    {log.text}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;

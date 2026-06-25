import React, { useState, useEffect, useRef } from 'react';
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
  Loader2
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
    nftId?: string;
  };
}

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
}

const LOCAL_API_BASE = 'http://localhost:3000';
const REMOTE_API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://realworld-backend-y89l.onrender.com';
const DEFAULT_API_BASE = window.location.hostname === 'localhost' ? LOCAL_API_BASE : REMOTE_API_BASE;

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
        lenderPassword: 'Test@1233333',
        loanAmountMin: 1000,
        loanAmountMax: 5000,
        aprMin: 10,
        aprMax: 20,
        duration: 90,
        nftId: ''
      }
    }
  ];

  const [activeTab, setActiveTab] = useState<string>('requestLoan');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [executionLogs, setExecutionLogs] = useState<LogLine[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [workflowUrl, setWorkflowUrl] = useState<string | null>(null);
  const [artifactLinks, setArtifactLinks] = useState<TestRunStatus['artifacts']>([]);
  const [apiBase, setApiBase] = useState<string>(() => localStorage.getItem('realworldApiBase') || DEFAULT_API_BASE);
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
    iterations: 10,
    nftId: ''
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const lastStatusRef = useRef<string>('');
  const fetchedLogsRef = useRef<string>('');
  
  const getActiveStage = () => {
    let stage = 0;
    for (const log of logs) {
      const text = log.text;
      if (
        text.includes('repayment successful') || 
        text.includes('returned to Available assets') || 
        text.includes('Phase 6 complete!') || 
        text.includes('test completed successfully') || 
        text.includes('cancelled successfully') ||
        text.includes('Cancellation requested') ||
        text.includes('negotiation request cancelled successfully') ||
        text.includes('loan request failed after') ||
        text.includes('failed to lend after')
      ) {
        stage = 3;
      } else if (stage < 2 && (
        text.includes('accepted successfully') || 
        text.includes('lending successful') || 
        text.includes('loan accepted successfully') || 
        text.includes('lending complete') ||
        text.includes('Lend success')
      )) {
        stage = 2;
      } else if (stage < 1 && (
        text.includes('loan request created successfully') || 
        text.includes('request was created successfully') || 
        text.includes('loan request created') ||
        text.includes('direct loan request')
      )) {
        stage = 1;
      }
    }
    if (statusText === 'Passed') {
      return 3;
    }
    return stage;
  };

  const getConsoleSteps = () => {
    const hasStarted = isRunning || statusText !== 'Ready';
    const isFinished = statusText === 'Passed' || statusText === 'Failed' || statusText === 'Completed' || statusText === 'Cancelled' || (!isRunning && currentRunId !== null && statusText !== 'Offline');
    const isErr = statusText === 'Failed' || statusText === 'Error';
    
    // Check logs for setup phases
    let hasSetupBrowser = false;
    let hasStartPlaywright = false;
    let hasEndPlaywright = false;
    
    const allLogs = [...logs, ...executionLogs];
    for (const log of allLogs) {
      const txt = log.text;
      if (
        txt.includes('Logging in borrower') ||
        txt.includes('Borrower logging in') ||
        txt.includes('Opening NFT detail page') ||
        txt.includes('LENDER SESSION') ||
        txt.includes('BORROWER SESSION')
      ) {
        hasSetupBrowser = true;
      }
      if (
        txt.includes('Starting negotiation loop') ||
        txt.includes('requesting loan') ||
        txt.includes('FLOW 1') ||
        txt.includes('FLOW 2') ||
        txt.includes('FLOW 3') ||
        txt.includes('FLOW 4') ||
        txt.includes('Starting discovery loop') ||
        txt.includes('Phase ')
      ) {
        hasStartPlaywright = true;
      }
      if (
        txt.includes('test completed successfully') ||
        txt.includes('completed successfully') ||
        txt.includes('Phase 6 complete!') ||
        txt.includes('repayment successful') ||
        txt.includes('returned to Available assets') ||
        txt.includes('cancelled successfully') ||
        txt.includes('loan request failed after') ||
        txt.includes('failed to lend after') ||
        txt.includes('[Lender] Loan successfully accepted') ||
        txt.includes('=== TEST COMPLETED')
      ) {
        hasEndPlaywright = true;
      }
    }
    
    // Step 1: Initialize Runner Environment
    let step1: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (hasStarted) {
      step1 = 'completed';
    }
    
    // Step 2: Setup Browser Context
    let step2: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (hasStarted) {
      if (hasSetupBrowser) {
        step2 = 'completed';
      } else if (isErr && !hasSetupBrowser) {
        step2 = 'failed';
      } else {
        step2 = 'running';
      }
    }
    
    // Step 3: Run selected Playwright test
    let step3: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (hasSetupBrowser) {
      if (hasEndPlaywright) {
        step3 = 'completed';
      } else if (isErr) {
        step3 = 'failed';
      } else {
        step3 = 'running';
      }
    }
    
    // Step 4: Upload Playwright test results
    let step4: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (hasEndPlaywright || (isErr && hasSetupBrowser)) {
      if (isFinished) {
        step4 = isErr ? 'failed' : 'completed';
      } else {
        step4 = 'running';
      }
    }
    
    // Step 5: Upload Playwright report
    let step5: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (step4 === 'completed' || step4 === 'failed') {
      if (isFinished) {
        step5 = 'completed';
      } else {
        step5 = 'running';
      }
    }
    
    // Step 6: Upload UI config used for run
    let step6: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (step5 === 'completed') {
      if (isFinished) {
        step6 = 'completed';
      } else {
        step6 = 'running';
      }
    }
    
    // Step 7: Post Set up Node.js
    let step7: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
    if (step6 === 'completed') {
      if (isFinished) {
        step7 = 'completed';
      } else {
        step7 = 'running';
      }
    }
    
    return [
      { id: 1, label: 'Initialize Runner Environment', status: step1, desc: 'Setting up runner workspace' },
      { id: 2, label: 'Setup Browser Context', status: step2, desc: 'Launching chromium instances' },
      { id: 3, label: 'Run selected Playwright test', status: step3, desc: 'Executing E2E scenario interactions' },
      { id: 4, label: 'Upload Playwright test results', status: step4, desc: 'Saving JSON test report' },
      { id: 5, label: 'Upload Playwright report', status: step5, desc: 'Uploading HTML reporter logs' },
      { id: 6, label: 'Upload UI config used for run', status: step6, desc: 'Archiving scenario settings' },
      { id: 7, label: 'Post Set up Node.js', status: step7, desc: 'Cleaning up active runner session' }
    ];
  };

  const activeScenario = scenarios.find(s => s.id === activeTab) || scenarios[0];
  const isLocalRunner = apiBase === LOCAL_API_BASE;

  const selectRunner = (nextApiBase: string) => {
    if (isRunning) return;

    localStorage.setItem('realworldApiBase', nextApiBase);
    setApiBase(nextApiBase);
    setLogs([]);
    setExecutionLogs([]);
    setStatusText('Ready');
  };

  // SSE Logs subscription
  useEffect(() => {
    const eventSource = new EventSource(`${apiBase}/stream-logs`);

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
  }, [apiBase]);


  useEffect(() => {
    if (!currentRunId || !isRunning) return;

    let cancelled = false;

    const formatStatus = (data: TestRunStatus) => {
      if (data.status === 'completed') {
        return data.conclusion === 'success' ? 'Passed' : 'Failed';
      }
      if (data.status === 'in_progress') return 'Running';
      if (data.status === 'queued') return 'Queued';
      return data.status || 'Running';
    };

    const parseFullTextLogs = (fullText: string): LogLine[] => {
      if (!fullText) return [];
      const lines = fullText.split('\n');
      return lines.map(line => {
        let type: LogLine['type'] = 'normal';
        if (line.includes('=== STARTING') || line.includes('=== TEST COMPLETED') || line.includes('Running command:')) {
          type = 'system';
        } else if (line.includes('[ERROR]') || line.includes('[SYSTEM ERROR]') || line.includes('failed') || line.includes('Error:')) {
          type = 'error';
        } else if (line.includes('successfully') || line.includes('SUCCESS') || line.includes('completed successfully') || line.includes('complete!')) {
          type = 'success';
        } else if (line.includes('Warning:') || line.includes('warn')) {
          type = 'warning';
        }
        return { text: line, type };
      });
    };

    const pollStatus = async () => {
      try {
        const response = await fetch(`${apiBase}/test-status/${currentRunId}`);
        const data: TestRunStatus & { success?: boolean } = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || `Status request failed with ${response.status}`);
        }

        if (cancelled) return;

        const displayStatus = formatStatus(data);
        setStatusText(displayStatus);
        if (data.htmlUrl) setWorkflowUrl(data.htmlUrl);
        if (data.artifacts) setArtifactLinks(data.artifacts);

        const statusKey = `${data.status}:${data.conclusion || ''}:${data.workflowRunId || data.runId || ''}`;
        if (lastStatusRef.current !== statusKey) {
          lastStatusRef.current = statusKey;
          setLogs(prev => [
            ...prev,
            {
              text: `[GITHUB] Run ${data.workflowRunId || data.runId} status=${data.status}${data.conclusion ? ` conclusion=${data.conclusion}` : ''}\n`,
              type: data.status === 'completed' ? (data.conclusion === 'success' ? 'success' : 'error') : 'system',
            },
          ]);
        }

        // Live logs polling
        const logRunId = data.runId || currentRunId;
        if (logRunId) {
          try {
            const logsResponse = await fetch(`${apiBase}/test-logs/${logRunId}`);
            const logsData = await logsResponse.json();
            if (logsResponse.ok && logsData.success) {
              const parsed = parseFullTextLogs(logsData.fullText);
              setExecutionLogs(parsed);
            }
          } catch (e) {
            console.error('Failed to stream live logs:', e);
          }
        }

        if (data.status === 'completed' || data.status === 'cancelled') {
          setIsRunning(false);

          if (logRunId && fetchedLogsRef.current !== logRunId) {
            fetchedLogsRef.current = logRunId;
            try {
              const logsResponse = await fetch(`${apiBase}/test-logs/${logRunId}`);
              const logsData = await logsResponse.json();

              if (!logsResponse.ok || logsData.success === false) {
                throw new Error(logsData.message || `Log request failed with ${logsResponse.status}`);
              }

              setLogs(prev => [
                ...prev,
                {
                  text: `\n[READABLE FAILURE SUMMARY]\n${logsData.summary}\n`,
                  type: data.conclusion === 'success' ? 'success' : 'error',
                },
              ]);
            } catch (err: any) {
              setLogs(prev => [...prev, { text: `[LOG ERROR] ${err.message}\n`, type: 'warning' }]);
            }
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        setLogs(prev => [...prev, { text: `[STATUS ERROR] ${err.message}\n`, type: 'error' }]);
      }
    };

    pollStatus();
    const interval = window.setInterval(pollStatus, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [apiBase, currentRunId, isRunning]);

  // Scroll to bottom of terminal when logs are added
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, executionLogs]);

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
    setExecutionLogs([]);
    setIsRunning(true);
    setStatusText('Dispatching');
    setCurrentRunId(null);
    setWorkflowUrl(null);
    setArtifactLinks([]);
    lastStatusRef.current = '';
    fetchedLogsRef.current = '';

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
      iterations: activeScenario.flow === 'counterRecounter' ? Number(formData.iterations) : undefined,
      nftId: activeScenario.flow === 'repayment' ? String(formData.nftId || '').trim() : undefined
    };

    try {
      const requestStartedAt = new Date().toISOString();
      console.info('[E2E UI] Sending run-test request', {
        apiBase,
        flow: payload.flow,
        requestStartedAt,
      });
      setLogs(prev => [
        ...prev,
        {
          text: `[FRONTEND] ${requestStartedAt} POST ${apiBase}/run-test flow=${payload.flow}\n`,
          type: 'system',
        },
      ]);

      const response = await fetch(`${apiBase}/run-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      console.info('[E2E UI] GitHub workflow dispatch response received', {
        status: response.status,
        success: resData.success,
        message: resData.message,
        runId: resData.runId,
        workflowRunId: resData.workflowRunId,
      });
      setLogs(prev => [
        ...prev,
        {
          text: `[FRONTEND] Response ${response.status}: ${resData.message || JSON.stringify(resData)}\n`,
          type: resData.success ? 'success' : 'error',
        },
      ]);

      if (!resData.success) {
        setLogs(prev => [...prev, { text: `[SYSTEM ERROR] ${resData.message}\n`, type: 'error' }]);
        setIsRunning(false);
        setStatusText('Error');
        return;
      }

      const runId = resData.runId || resData.trackingId;
      setCurrentRunId(runId);
      setWorkflowUrl(resData.htmlUrl || null);
      setArtifactLinks(resData.artifacts || []);
      setStatusText(resData.status === 'in_progress' ? 'Running' : 'Queued');
      setLogs(prev => [
        ...prev,
        {
          text: `[GITHUB] Workflow dispatched. runId=${runId}${resData.workflowRunId ? ` workflowRunId=${resData.workflowRunId}` : ''}\n`,
          type: 'system',
        },
      ]);
    } catch (err: any) {
      console.error('[E2E UI] Failed to call run-test', err);
      setLogs(prev => [...prev, { text: `[CONNECTION ERROR] Failed to reach E2E backend server: ${err.message}\n`, type: 'error' }]);
      setIsRunning(false);
      setStatusText('Offline');
    }
  };

  // Stop running test scenario
  const handleStopTest = async () => {
    try {
      const response = await fetch(`${apiBase}/stop-test`, {
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

  const handleOpenBrowser = () => {
    if (workflowUrl) {
      window.open(workflowUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    window.open(`${apiBase}/browser`, '_blank', 'noopener,noreferrer');
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
            <span>{isLocalRunner ? 'Local API' : 'GitHub Actions runner'}</span>
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
            <div className="runner-toggle" aria-label="Runner target">
              <button
                className={`runner-option ${isLocalRunner ? 'active' : ''}`}
                onClick={() => selectRunner(LOCAL_API_BASE)}
                disabled={isRunning}
                title="Use a local backend API for dispatch testing"
              >
                <Monitor size={15} />
                Local API
              </button>
              <button
                className={`runner-option ${!isLocalRunner ? 'active' : ''}`}
                onClick={() => selectRunner(REMOTE_API_BASE)}
                disabled={isRunning}
                title="Use the deployed backend API to dispatch GitHub Actions"
              >
                <Server size={15} />
                GitHub
              </button>
            </div>
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

            {activeScenario.flow === 'repayment' && (
              <div className="form-group">
                <label className="form-label">NFT Contract / Token ID</label>
                <input
                  className="form-input"
                  type="text"
                  name="nftId"
                  placeholder="0x1c71388e4f5089926fF153F7635F81C4F1676fCb/6"
                  value={formData.nftId}
                  onChange={handleInputChange}
                  disabled={isRunning}
                />
              </div>
            )}

            {activeScenario.flow !== 'counterRecounter' && (
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
                Run Test
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={handleOpenBrowser}
              >
                <Monitor size={16} />
                {workflowUrl ? 'Open Workflow' : 'Runner Info'}
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
          </div>          {/* Terminal Column containing status tracker and terminal console logs */}
          <div className="terminal-column">
            {/* Live Stage Tracker */}
            {(isRunning || statusText !== 'Ready') && (
              <div className="card live-tracker-card">
                <h3 className="card-title" style={{ borderBottom: 'none', marginBottom: '10px' }}>
                  <Layers className="logo-icon animate-pulse" size={20} />
                  Live NFT Loan Status Tracker
                </h3>
                <div className="stepper-wrapper">
                  {[
                    { label: 'Workflow Dispatched', desc: 'GitHub Actions triggered' },
                    { label: 'Loan Requested', desc: 'NFT locked, terms submitted' },
                    { label: 'Lender Funded', desc: 'Lender accepted & funded' },
                    { label: 'Repaid & Released', desc: 'NFT returned to wallet' },
                  ].map((step, idx) => {
                    const activeStage = getActiveStage();
                    const isCompleted = idx <= activeStage;
                    const isActive = idx === activeStage + 1 && isRunning;
                    const isFailed = statusText === 'Failed' && idx === activeStage + 1;

                    return (
                      <div key={idx} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isFailed ? 'failed' : ''}`}>
                        <div className="step-circle-wrapper">
                          <div className="step-circle">
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          {idx < 3 && <div className="step-line" />}
                        </div>
                        <div className="step-content">
                          <div className="step-label">{step.label}</div>
                          <div className="step-desc">{step.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Terminal Card */}
            <div className="terminal-container">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot dot-red"></span>
                  <span className="terminal-dot dot-yellow"></span>
                  <span className="terminal-dot dot-green"></span>
                </div>
                <div className="terminal-title">github-actions-runner.log</div>
                <TerminalIcon size={14} className="text-muted" />
              </div>

              <div className="terminal-layout-content">
                {/* Vertical Console Steps Checklist */}
                <div className="console-stepper-panel">
                  <div className="stepper-header">
                    <h4 className="stepper-title">
                      <Server size={14} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                      Runner Steps
                    </h4>
                    <p className="stepper-subtitle">Live workflow checklist</p>
                  </div>
                  <div className="console-steps-list">
                    {getConsoleSteps().map((step, idx) => {
                      const { label, status, desc } = step;
                      return (
                        <div key={idx} className={`console-step-item step-${status}`}>
                          <div className="console-step-circle-container">
                            <div className="console-step-circle">
                              {status === 'completed' && <Check size={12} strokeWidth={3} />}
                              {status === 'failed' && <X size={12} strokeWidth={3} />}
                              {status === 'running' && <Loader2 className="animate-spin" size={12} />}
                              {status === 'pending' && <div className="pending-dot" />}
                            </div>
                            {idx < 6 && <div className={`console-step-line line-${status}`} />}
                          </div>
                          
                          <div className="console-step-details">
                            <span className="console-step-label">{label}</span>
                            <span className="console-step-desc">{desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Console Terminal Logs */}
                <div className="terminal-body">
                  {logs.length === 0 && executionLogs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {isLocalRunner
                        ? 'Console waiting for GitHub Actions dispatch through the local backend API.'
                        : 'Console waiting for GitHub Actions dispatch. Status will update here.'}
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
                  {workflowUrl && (
                    <div className="log-line log-system">
                      Workflow: {workflowUrl}
                    </div>
                  )}
                  {artifactLinks?.map(artifact => (
                    <div key={artifact.id} className="log-line log-success">
                      Artifact: {artifact.name} - {artifact.archiveDownloadUrl}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;










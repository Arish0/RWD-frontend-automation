'use client'

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Search,
  Heart,
  User,
  Play,
  Menu,
  Layers,
  FileText,
  ArrowRightLeft,
  RotateCcw,
  Zap,
  Code,
} from 'lucide-react';

interface TestFlow {
  id: string;
  name: string;
  code: string;
  tag: string;
  category: string;
  accent: string;
  description: string;
  icon: React.ReactNode;
  glyph: string;
}

const ACCENTS = {
  bronze: '#a78bfa', // violet
  gold: '#c4b5fd', // lavender
  blue: '#7c9bf5', // indigo
  green: '#5ee0c0', // teal
  rose: '#e08fc4', // magenta
  violet: '#b79ce6', // soft violet
};

export default function Home() {
  const testFlows: TestFlow[] = [
    {
      id: 'requestLoan',
      name: 'Update & Cancellation',
      code: 'RW-01 · REQUEST',
      tag: 'CORE FLOW',
      category: 'LOAN LIFECYCLE',
      accent: ACCENTS.bronze,
      description: 'Create, update, and cancel a loan request.',
      icon: <Layers size={38} strokeWidth={1.4} />,
      glyph: '01',
    },
    {
      id: 'requestAndLend',
      name: 'Request & Acceptance',
      code: 'RW-02 · LEND',
      tag: 'DUAL BROWSER',
      category: 'BORROW · LEND',
      accent: ACCENTS.gold,
      description: 'Borrower requests, lender funds the loan.',
      icon: <FileText size={38} strokeWidth={1.4} />,
      glyph: '02',
    },
    {
      id: 'counterRecounter',
      name: 'Counter Offers',
      code: 'RW-03 · NEGOTIATE',
      tag: 'NEGOTIATION',
      category: 'DYNAMIC LOOP',
      accent: ACCENTS.violet,
      description: 'Multi-round counter & re-counter negotiation.',
      icon: <ArrowRightLeft size={38} strokeWidth={1.4} />,
      glyph: '03',
    },
    {
      id: 'repayment',
      name: 'Repayment',
      code: 'RW-04 · REPAY',
      tag: '6 PHASES',
      category: 'FULL LIFECYCLE',
      accent: ACCENTS.green,
      description: 'All six repayment phases on one NFT.',
      icon: <RotateCcw size={38} strokeWidth={1.4} />,
      glyph: '04',
    },
    {
      id: 'refinance',
      name: 'Refinance',
      code: 'RW-05 · REFI',
      tag: '7 PHASES',
      category: 'ADVANCED',
      accent: ACCENTS.blue,
      description: 'Complete seven-phase refinancing suite.',
      icon: <Zap size={38} strokeWidth={1.4} />,
      glyph: '05',
    },
    {
      id: 'e2etest',
      name: 'E2E Refinance',
      code: 'RW-06 · E2E',
      tag: 'END TO END',
      category: 'MULTI-LENDER',
      accent: ACCENTS.rose,
      description: 'Full validation with multi-lender refinance.',
      icon: <Code size={38} strokeWidth={1.4} />,
      glyph: '06',
    },
  ];

  const navLinks = ['FLOWS', 'DOCUMENTATION', 'STATUS'];

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
          <span style={{ color: 'var(--success)' }}>● online</span>
        </span>
      </div>

      {/* Big dark panel */}
      <section
        style={{
          flex: 1,
          background:
            'radial-gradient(130% 100% at 20% 0%, #17122b 0%, #0e0a1a 45%, #07050e 100%)',
          borderRadius: '32px',
          border: '1px solid rgba(196, 181, 253, 0.22)',
          boxShadow:
            '0 60px 140px rgba(0,0,0,0.85), inset 0 1px 0 rgba(199,181,253,0.12)',
          padding: '32px 44px 56px',
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
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '1px',
              }}
            >
              REAL<span style={{ color: 'var(--primary)' }}>WORLD</span>
            </div>
            <Menu size={18} color="var(--text-muted)" />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '34px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1.5px',
            }}
          >
            {navLinks.map((l, i) => (
              <span
                key={l}
                style={{
                  color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    i === 0 ? 'var(--text-primary)' : 'var(--text-muted)')
                }
              >
                {l}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {[Search, Heart, User].map((Icon, i) => (
              <div
                key={i}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(167,139,250,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={15} color="var(--text-secondary)" />
              </div>
            ))}
          </div>
        </nav>

        {/* Section header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                color: 'var(--primary)',
                fontWeight: 600,
                marginBottom: '14px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              AUTOMATION COLLECTION — 06 FLOWS
            </div>
            <h1
              style={{
                fontSize: '68px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                lineHeight: 0.95,
                letterSpacing: '-2px',
                margin: 0,
              }}
            >
              CHOOSE A{' '}
              <span
                style={{
                  background:
                    'linear-gradient(120deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                TEST FLOW
              </span>
            </h1>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              maxWidth: '340px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Select and dispatch an automated end-to-end scenario for the
            RealWorld NFT lending platform. Each flow validates a distinct
            borrower &amp; lender journey.
          </p>
        </div>

        {/* Product-style card grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {testFlows.map((flow, index) => (
            <Link
              key={flow.id}
              href={`/test/${flow.id}`}
              style={{
                textDecoration: 'none',
                animation: `slideUp 0.6s ease-out ${index * 0.07}s both`,
              }}
            >
              <article
                className="flow-card"
                style={{
                  background: `linear-gradient(165deg, ${flow.accent}2e 0%, ${flow.accent}12 32%, #14111e 62%, #0e0b18 100%)`,
                  border: `1px solid ${flow.accent}33`,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                  boxShadow: `var(--shadow-sm), inset 0 1px 0 ${flow.accent}22`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = flow.accent;
                  e.currentTarget.style.boxShadow = `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${flow.accent}55, inset 0 1px 0 ${flow.accent}44`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = `${flow.accent}33`;
                  e.currentTarget.style.boxShadow = `var(--shadow-sm), inset 0 1px 0 ${flow.accent}22`;
                }}
              >
                {/* Badge chip */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '18px',
                    zIndex: 3,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(0,0,0,0.45)',
                    border: `1px solid ${flow.accent}55`,
                    backdropFilter: 'blur(6px)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: flow.accent,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: flow.accent,
                      boxShadow: `0 0 8px ${flow.accent}`,
                    }}
                  />
                  {flow.tag}
                </div>

                {/* Media area — icon emblem */}
                <div
                  style={{
                    position: 'relative',
                    height: '190px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-glass)',
                    background: `radial-gradient(120% 100% at 50% 0%, ${flow.accent}1f 0%, transparent 60%)`,
                  }}
                >
                  {/* Number badge overlay — bottom right */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '16px',
                      bottom: '16px',
                      zIndex: 5,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '72px',
                        fontWeight: 900,
                        fontFamily: 'var(--font-display)',
                        background: `linear-gradient(135deg, ${flow.accent}, rgba(255,255,255,0.8))`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1,
                        letterSpacing: '-2px',
                        userSelect: 'none',
                        filter: `drop-shadow(0 4px 16px ${flow.accent}88)`,
                      }}
                    >
                      {flow.glyph}
                    </span>
                  </div>
                  {/* Glow */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${flow.accent}30 0%, transparent 68%)`,
                      filter: 'blur(6px)',
                    }}
                  />
                  {flow.id === 'requestLoan' ? (
                    /* Captain America GIF for Update & Cancellation */
                    <img
                      src="/captain-america.gif"
                      alt={flow.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : flow.id === 'requestAndLend' ? (
                    /* Black Panther GIF for Request & Acceptance */
                    <img
                      src="/black-panther.gif"
                      alt={flow.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : flow.id === 'counterRecounter' ? (
                    /* Chris Hemsworth GIF for Counter Offers */
                    <img
                      src="/chris-hemsworth.gif"
                      alt={flow.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : flow.id === 'repayment' ? (
                    /* Hulk GIF for Repayment */
                    <img
                      src="/the-hulk.gif"
                      alt={flow.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : flow.id === 'refinance' ? (
                    /* Tom Holland GIF for Refinance */
                    <img
                      src="/tom-holland.gif"
                      alt={flow.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : flow.id === 'e2etest' ? (
                    /* Avengers Endgame GIF for E2E Refinance */
                    <img
                      src="/avengers-endgame.gif"
                      alt={flow.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    /* Icon disc for all other flows */
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '96px',
                        height: '96px',
                        borderRadius: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: flow.accent,
                        background:
                          'linear-gradient(150deg, rgba(255,255,255,0.06), rgba(0,0,0,0.25))',
                        border: `1px solid ${flow.accent}55`,
                        boxShadow: `0 12px 30px rgba(0,0,0,0.45), inset 0 1px 0 ${flow.accent}33`,
                      }}
                    >
                      {flow.icon}
                    </div>
                  )}
                </div>

                {/* Info footer */}
                <div style={{ padding: '20px 22px 24px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '8px',
                    }}
                  >
                    {flow.code}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '19px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        color: 'var(--text-primary)',
                        margin: 0,
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {flow.name}
                    </h3>
                    <div
                      style={{
                        flexShrink: 0,
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: flow.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 6px 16px ${flow.accent}66`,
                      }}
                    >
                      <ArrowUpRight size={17} color="#0c0912" strokeWidth={2.5} />
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      margin: '10px 0 0',
                    }}
                  >
                    {flow.description}
                  </p>
                  <div
                    style={{
                      marginTop: '14px',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-glass)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {flow.category}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA footer */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '28px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Ready to validate the lending lifecycle end-to-end?
          </span>
          <Link
            href="/test/requestLoan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(120deg, var(--primary), var(--accent))',
              color: '#0c0912',
              padding: '14px 32px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 14px 30px rgba(167,139,250,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 18px 40px rgba(167,139,250,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(167,139,250,0.3)';
            }}
          >
            <Play size={15} fill="#0c0912" />
            Launch Test Suite
          </Link>
        </div>
      </section>
    </main>
  );
}

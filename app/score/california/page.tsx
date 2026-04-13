// QUARTERLY STAT REFRESH — Source: protekon_content_stats (scraper DB vizmtkfpxxjzlpzibate)
// California: SELECT * FROM protekon_content_stats WHERE stat_key = 'ca_headlines';
// Key stats: $164M penalties, 21,020 employers fined, 73,960 records, 3,430 cited since Jan 2025
// Last updated: April 2026

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"

/* ─── Brand Tokens ─── */

const B = {
  midnight: "#0B1D3A",
  crimson: "#C41230",
  gold: "#C9A84C",
  void: "#070F1E",
  parchment: "#F4EFE6",
  ash: "#E8E2D8",
  steel: "#7A8FA5",
  fog: "#B8C5D1",
  white: "#FAFAF8",
  green: "#10B981",
}

/* ─── Utilities ─── */

function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          const s = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - s) / duration, 1)
            setVal(Math.floor(p * end))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  )
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Icons ─── */

const Mark = ({ w = 36, h = 63 }: { w?: number; h?: number }) => (
  <svg
    viewBox="0 0 48 84"
    width={w}
    height={h}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0" y="0" width="13" height="84" fill={B.white} />
    <rect x="13" y="0" width="35" height="13" fill={B.white} />
    <rect x="35" y="13" width="13" height="27" fill={B.white} />
    <rect x="0" y="40" width="48" height="10" fill={B.crimson} />
  </svg>
)

const Chk = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill={B.green} />
    <path
      d="M5 8.2L7 10.2L11 5.8"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Xx = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill={`${B.crimson}20`} />
    <path
      d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
      stroke={B.crimson}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const Prt = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill={`${B.gold}20`} />
    <path
      d="M5 8H11"
      stroke={B.gold}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

/* ─── FAQ Item ─── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${B.midnight}0D` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 15,
            fontWeight: 500,
            color: B.midnight,
            lineHeight: 1.5,
          }}
        >
          {q}
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 24,
            fontWeight: 300,
            color: B.crimson,
            transition: "transform 0.3s",
            transform: open ? "rotate(45deg)" : "rotate(0)",
            flexShrink: 0,
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: B.steel,
            lineHeight: 1.75,
            paddingBottom: 24,
            maxWidth: 600,
            fontWeight: 300,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  )
}

/* ─── Font Aliases ─── */
const bc = "var(--font-display)"
const dm = "var(--font-sans)"

function eyebrow(text: string, gold?: boolean) {
  return (
    <div
      style={{
        fontFamily: bc,
        fontWeight: 500,
        fontSize: 10,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: gold ? B.gold : B.crimson,
      }}
    >
      {text}
    </div>
  )
}

/* ─── Page ─── */

export default function ScoreLandingPage() {
  const router = useRouter()
  const go = () => router.push("/score?start=true")

  return (
    <div
      style={{
        fontFamily: dm,
        background: B.parchment,
        color: B.midnight,
        overflowX: "hidden",
      }}
    >
      <Nav />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .cta-cmd {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: ${B.crimson};
          color: ${B.white};
          font-family: ${bc};
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 18px 44px;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }
        .cta-cmd:hover {
          background: ${B.midnight};
          transform: translateY(-1px);
        }
        .cta-cmd::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: ${B.gold};
        }
        .cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: ${B.gold};
          font-family: ${bc};
          font-weight: 600;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 16px 32px;
          border: 1px solid rgba(201, 168, 76, 0.25);
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
        }
        .cta-ghost:hover {
          border-color: ${B.gold};
          background: rgba(201, 168, 76, 0.06);
        }
        .scard {
          padding: 36px 28px;
          background: ${B.white};
          border: 1px solid ${B.midnight}08;
          position: relative;
          transition: all 0.35s;
        }
        .scard:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px ${B.midnight}0a;
          border-color: ${B.crimson}20;
        }
        .scard::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: ${B.midnight}08;
          transition: background 0.3s;
        }
        .scard:hover::before {
          background: ${B.crimson};
        }
        .bcard {
          padding: 32px 28px;
          background: ${B.white};
          border: 1px solid ${B.midnight}08;
          transition: all 0.25s;
        }
        .bcard:hover {
          border-left: 3px solid ${B.crimson};
          padding-left: 25px;
        }
        .tcard {
          padding: 36px;
          background: ${B.white};
          border: 1px solid ${B.midnight}06;
          position: relative;
        }
        .tcard::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: ${B.crimson};
        }
        @keyframes pulse-r {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        @media (max-width: 800px) {
          .hero-g {
            flex-direction: column !important;
          }
          .stat-bar {
            flex-direction: column !important;
          }
          .g3 {
            grid-template-columns: 1fr !important;
          }
          .g2 {
            grid-template-columns: 1fr !important;
          }
          .frow {
            flex-direction: column !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════ */}
      {/* 1 - ATTENTION — Above the Fold                    */}
      {/* ══════════════════════════════════════════════════ */}
      <section style={{ background: B.void, position: "relative", overflow: "hidden" }}>
        <Image
          src="/images/hero/compliance-night.jpg"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.12, pointerEvents: "none" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${B.void}E6 0%, ${B.void}CC 40%, ${B.void}F2 100%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -40,
            opacity: 0.02,
            pointerEvents: "none",
          }}
        >
          <Mark w={400} h={700} />
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "96px 24px 72px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 44,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                background: B.crimson,
                borderRadius: "50%",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  border: `2px solid ${B.crimson}40`,
                  borderRadius: "50%",
                  animation: "pulse-r 2s ease-out infinite",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: bc,
                fontWeight: 500,
                fontSize: 10,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: B.gold,
              }}
            >
              Free compliance assessment — your scorecard in minutes
            </span>
          </div>

          <div
            className="hero-g"
            style={{
              display: "flex",
              gap: 64,
              alignItems: "flex-start",
            }}
          >
            {/* Left */}
            <div style={{ flex: "1 1 58%" }}>
              <h1
                style={{
                  fontFamily: bc,
                  fontWeight: 800,
                  fontSize: "clamp(38px, 5.5vw, 68px)",
                  lineHeight: 0.92,
                  letterSpacing: -1,
                  textTransform: "uppercase",
                  color: B.white,
                  marginBottom: 28,
                }}
              >
                Cal/OSHA fined
                <br />
                California businesses
                <br />
                <span style={{ color: B.crimson }}>$164 million</span> last year.
              </h1>
              <p
                style={{
                  fontFamily: bc,
                  fontWeight: 400,
                  fontSize: 22,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: `${B.white}70`,
                  marginBottom: 32,
                }}
              >
                How much of that is yours?
              </p>

              <p
                style={{
                  fontFamily: dm,
                  fontSize: 15,
                  fontWeight: 300,
                  color: B.steel,
                  lineHeight: 1.75,
                  maxWidth: 480,
                  marginBottom: 40,
                }}
              >
                Take a quick assessment. Get your compliance score calculated against{" "}
                <strong style={{ color: B.white, fontWeight: 500 }}>
                  real Cal/OSHA enforcement data
                </strong>{" "}
                — and see exactly what an inspector would cite you for. Today.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  marginBottom: 48,
                }}
              >
                <button className="cta-cmd" onClick={go}>
                  Get my compliance score
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  className="cta-ghost"
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See how it works
                </button>
              </div>

              {/* Trust line */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {[
                  "Real Cal/OSHA data",
                  "All 10 industries",
                  "Takes 2 minutes",
                ].map((t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        background: B.gold,
                        borderRadius: "50%",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: bc,
                        fontSize: 10,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: `${B.white}40`,
                      }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Score preview */}
            <div
              style={{
                flex: "1 1 36%",
                background: B.midnight,
                border: `1px solid ${B.white}0A`,
                padding: 40,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: 3,
                  background: B.crimson,
                }}
              />
              <div
                style={{
                  fontFamily: bc,
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: B.gold,
                  marginBottom: 24,
                }}
              >
                Sample score report
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke={`${B.white}0A`}
                    strokeWidth="7"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke={B.crimson}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="123 339"
                    transform="rotate(-90 65 65)"
                  />
                  <text
                    x="65"
                    y="60"
                    textAnchor="middle"
                    fill={B.crimson}
                    fontFamily={bc}
                    fontWeight="800"
                    fontSize="30"
                  >
                    4
                  </text>
                  <text
                    x="65"
                    y="78"
                    textAnchor="middle"
                    fill={`${B.white}35`}
                    fontFamily={bc}
                    fontSize="11"
                    letterSpacing="1"
                  >
                    / 11
                  </text>
                </svg>
              </div>

              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span
                  style={{
                    fontFamily: bc,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: B.crimson,
                  }}
                >
                  At risk — 7 gaps found
                </span>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${B.white}0A`,
                  paddingTop: 18,
                }}
              >
                <div
                  style={{
                    fontFamily: bc,
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: B.steel,
                    marginBottom: 6,
                  }}
                >
                  Estimated fine exposure
                </div>
                <div
                  style={{
                    fontFamily: bc,
                    fontSize: 26,
                    fontWeight: 800,
                    color: B.crimson,
                  }}
                >
                  $48,393 – $112,917
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                {[
                  "Missing IIPP",
                  "WVPP not site-specific",
                  "No incident log",
                  "PII in records",
                ].map((g, i) => (
                  <div
                    key={g}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 0",
                      borderBottom:
                        i < 3 ? `1px solid ${B.white}06` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        background: B.crimson,
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: dm,
                        fontSize: 12,
                        color: `${B.white}50`,
                        fontWeight: 300,
                      }}
                    >
                      {g}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stat stripe */}
        <div
          className="stat-bar"
          style={{ display: "flex", flexWrap: "wrap", background: B.midnight }}
        >
          {[
            { n: 164, p: "$", s: "M", l: "in Cal/OSHA penalties" },
            { n: 21020, p: "", s: "", l: "California employers fined" },
            { n: 73960, p: "", s: "+", l: "Cal/OSHA records analyzed" },
            { n: 3430, p: "", s: "", l: "cited since January 2025" },
          ].map(({ n, p, s, l }) => (
            <div
              key={l}
              style={{
                flex: 1,
                minWidth: 200,
                padding: "28px 36px",
                borderRight: `1px solid ${B.white}06`,
              }}
            >
              <div
                style={{
                  fontFamily: bc,
                  fontSize: 30,
                  fontWeight: 800,
                  color: B.white,
                  lineHeight: 1,
                }}
              >
                <CountUp end={n} prefix={p} suffix={s} />
              </div>
              <div
                style={{
                  fontFamily: bc,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: B.steel,
                  marginTop: 6,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 2 - TRANSFORMATION — How It Works                 */}
      {/* ══════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}
      >
        <Reveal>
          {eyebrow("How it works")}
          <h2
            style={{
              fontFamily: bc,
              fontWeight: 700,
              fontSize: "clamp(32px, 4.5vw, 52px)",
              lineHeight: 0.95,
              letterSpacing: -1,
              textTransform: "uppercase",
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            From guessing
            <br />
            to knowing.
          </h2>
          <p
            style={{
              fontFamily: dm,
              fontSize: 15,
              color: B.steel,
              lineHeight: 1.75,
              maxWidth: 480,
              marginBottom: 60,
              fontWeight: 300,
            }}
          >
            No consultants. No spreadsheets. Your compliance score is calculated
            the moment you finish — backed by real enforcement data.
          </p>
        </Reveal>

        <div
          className="g3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {[
            {
              n: "01",
              t: "Take a quick assessment",
              d: "Simple yes/no questions about your compliance documentation. Industry-specific questions adapt to your vertical. Takes about two minutes.",
              c: B.crimson,
            },
            {
              n: "02",
              t: "See your score instantly",
              d: "Compliance score, gap analysis, and fine exposure — calculated against real Cal/OSHA enforcement data. Your personalized gap analysis in minutes.",
              c: B.gold,
            },
            {
              n: "03",
              t: "Close every gap",
              d: "Download your scorecard PDF. Know exactly what to fix, what each gap costs, and how PROTEKON closes them in 48 hours.",
              c: B.green,
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="scard">
                <div
                  style={{
                    fontFamily: bc,
                    fontWeight: 500,
                    fontSize: 9,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: s.c,
                    marginBottom: 28,
                  }}
                >
                  Step {s.n}
                </div>
                <h3
                  style={{
                    fontFamily: bc,
                    fontWeight: 700,
                    fontSize: 22,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 12,
                    lineHeight: 1.1,
                  }}
                >
                  {s.t}
                </h3>
                <p
                  style={{
                    fontFamily: dm,
                    fontSize: 14,
                    color: B.steel,
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {s.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dashboard preview */}
        <Reveal delay={0.3}>
          <div
            style={{
              marginTop: 64,
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${B.midnight}10`,
              boxShadow: `0 24px 80px ${B.midnight}15`,
            }}
          >
            <Image
              src="/images/hero/dashboard-glow.jpg"
              alt="Protekon compliance dashboard showing real-time score and gap analysis"
              width={1200}
              height={675}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to top, ${B.parchment} 0%, transparent 30%)`,
                pointerEvents: "none",
              }}
            />
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 3 - INTEREST — Benefits + Features                */}
      {/* ══════════════════════════════════════════════════ */}
      <section style={{ background: B.white }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}
        >
          <Reveal>
            {eyebrow("What you get")}
            <h2
              style={{
                fontFamily: bc,
                fontWeight: 700,
                fontSize: "clamp(32px, 4.5vw, 52px)",
                lineHeight: 0.95,
                letterSpacing: -1,
                textTransform: "uppercase",
                marginTop: 16,
                marginBottom: 60,
              }}
            >
              Stop hoping.
              <br />
              Start commanding.
            </h2>
          </Reveal>

          <div
            className="g2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            {[
              {
                t: "Your exact compliance score",
                d: "Not a generic checklist. Weighted against real enforcement data for your specific industry. Real Cal/OSHA records. Your number.",
                tag: "Benefit",
              },
              {
                t: "Every gap, named and priced",
                d: "Each gap mapped to the exact Cal/OSHA standard, the citation classification, and the fine range an inspector would assess. No guessing.",
                tag: "Benefit",
              },
              {
                t: "Total fine exposure in dollars",
                d: "One number: what it costs if Cal/OSHA walks in today. Most owners we assess carry $48K\u2013$113K in exposure they do not know about.",
                tag: "Benefit",
              },
              {
                t: "Industry-specific intelligence",
                d: "Benchmarked against real violations in your vertical. Construction, healthcare, manufacturing \u2014 each has different enforcement patterns.",
                tag: "Benefit",
              },
              {
                t: "Downloadable PDF scorecard",
                d: "Full gap analysis, fine exposure breakdown, cost comparison. Share it with your insurance broker, attorney, or business partner.",
                tag: "Feature",
              },
              {
                t: "No sales call. No pressure.",
                d: "Take the full assessment privately. Score and gaps shown immediately. The PDF download is the only thing that asks for an email.",
                tag: "Feature",
              },
            ].map((b, i) => (
              <Reveal key={b.t} delay={i * 0.06}>
                <div className="bcard">
                  <div
                    style={{
                      fontFamily: bc,
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      color: b.tag === "Benefit" ? B.crimson : B.gold,
                      marginBottom: 14,
                    }}
                  >
                    {b.tag}
                  </div>
                  <h3
                    style={{
                      fontFamily: bc,
                      fontWeight: 700,
                      fontSize: 18,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 8,
                      lineHeight: 1.15,
                    }}
                  >
                    {b.t}
                  </h3>
                  <p
                    style={{
                      fontFamily: dm,
                      fontSize: 14,
                      color: B.steel,
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {b.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <button className="cta-cmd" onClick={go}>
                Take the assessment now{" "}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 4 - DESIRE — Social Proof                         */}
      {/* ══════════════════════════════════════════════════ */}
      <section style={{ background: B.parchment, position: "relative", overflow: "hidden" }}>
        {/* Background construction image */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", pointerEvents: "none" }}>
          <Image
            src="/images/industries/construction.jpg"
            alt=""
            fill
            style={{ objectFit: "cover", opacity: 0.06 }}
          />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${B.parchment} 0%, transparent 100%)` }} />
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px", position: "relative", zIndex: 1 }}>
          <Reveal>
            {eyebrow("What business owners discovered")}
            <h2
              style={{
                fontFamily: bc,
                fontWeight: 700,
                fontSize: "clamp(32px, 4.5vw, 52px)",
                lineHeight: 0.95,
                letterSpacing: -1,
                textTransform: "uppercase",
                marginTop: 16,
                marginBottom: 48,
              }}
            >
              They didn&apos;t know
              <br />
              until they checked.
            </h2>
          </Reveal>

          {/* Big stat block */}
          <Reveal>
            <div
              style={{
                background: B.void,
                padding: "44px 52px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 40,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  fontFamily: bc,
                  fontWeight: 900,
                  fontSize: 64,
                  lineHeight: 0.88,
                  color: B.crimson,
                }}
              >
                92%
              </div>
              <p
                style={{
                  fontFamily: dm,
                  fontSize: 16,
                  color: B.fog,
                  lineHeight: 1.7,
                  maxWidth: 440,
                  fontWeight: 300,
                }}
              >
                of California small businesses that take this assessment
                discover at least{" "}
                <strong style={{ color: B.white, fontWeight: 500 }}>
                  3 citable violations
                </strong>{" "}
                they did not know they had.
              </p>
            </div>
          </Reveal>

          <div
            className="g3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[
              {
                q: "I thought we were compliant because we had an employee handbook. The assessment showed us 5 gaps \u2014 including a missing IIPP that\u2019s been required since day one. That\u2019s a $16K citation we didn\u2019t know existed.",
                n: "GC Owner",
                r: "Riverside \u00B7 32 employees",
                v: "Construction",
              },
              {
                q: "Our franchise gave us a \u2018safety manual\u2019 but it wasn\u2019t site-specific. The score calculator caught that immediately. Our corporate template would not hold up in an inspection.",
                n: "Multi-Unit Operator",
                r: "Ontario \u00B7 3 locations",
                v: "Retail",
              },
              {
                q: "I manage 40 rental units. I didn\u2019t know SB 553 applied to my office staff. The fine exposure number was $64,000 for things I could have fixed in a week.",
                n: "Portfolio Manager",
                r: "Corona \u00B7 40 units",
                v: "Real Estate",
              },
            ].map((t, i) => (
              <Reveal key={t.n} delay={i * 0.1}>
                <div className="tcard">
                  <p
                    style={{
                      fontFamily: dm,
                      fontSize: 14,
                      color: B.midnight,
                      lineHeight: 1.75,
                      fontWeight: 300,
                      marginBottom: 24,
                    }}
                  >
                    {t.q}
                  </p>
                  <div
                    style={{
                      borderTop: `1px solid ${B.midnight}08`,
                      paddingTop: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: bc,
                          fontWeight: 600,
                          fontSize: 13,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          color: B.midnight,
                        }}
                      >
                        {t.n}
                      </div>
                      <div
                        style={{
                          fontFamily: dm,
                          fontSize: 12,
                          color: B.steel,
                          fontWeight: 300,
                          marginTop: 2,
                        }}
                      >
                        {t.r}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: bc,
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: B.gold,
                      }}
                    >
                      {t.v}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 5 - COMPARE — Alternatives Table                  */}
      {/* ══════════════════════════════════════════════════ */}
      <section style={{ background: B.white }}>
        <div
          style={{ maxWidth: 1020, margin: "0 auto", padding: "100px 24px" }}
        >
          <Reveal>
            {eyebrow("The alternatives")}
            <h2
              style={{
                fontFamily: bc,
                fontWeight: 700,
                fontSize: "clamp(32px, 4.5vw, 48px)",
                lineHeight: 0.95,
                letterSpacing: -1,
                textTransform: "uppercase",
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              What are your options?
            </h2>
            <p
              style={{
                fontFamily: dm,
                fontSize: 14,
                color: B.steel,
                lineHeight: 1.75,
                marginBottom: 48,
                maxWidth: 480,
                fontWeight: 300,
              }}
            >
              Ignore it, DIY it, hire a consultant, or let PROT
              <span style={{ color: B.crimson, fontWeight: 500 }}>E</span>KON
              handle it. The comparison:
            </p>
          </Reveal>

          <Reveal>
            <div
              style={{
                overflowX: "auto",
                border: `1px solid ${B.midnight}08`,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: dm,
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ background: B.void }}>
                    {[
                      "Capability",
                      "Do nothing",
                      "DIY / Templates",
                      "Consultant",
                      "PROTEKON",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "16px 20px",
                          textAlign: i === 0 ? "left" : "center",
                          fontFamily: bc,
                          fontWeight: i === 4 ? 700 : 500,
                          fontSize: 10,
                          letterSpacing: 2.5,
                          textTransform: "uppercase",
                          color: i === 4 ? B.white : `${B.white}50`,
                          background: i === 4 ? B.crimson : "transparent",
                          width: i === 0 ? "30%" : "17.5%",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Site-specific WVPP", false, "partial", "partial", true],
                      ["IIPP + EAP + HazCom", false, false, true, true],
                      [
                        "PII-stripped incident log",
                        false,
                        false,
                        "partial",
                        true,
                      ],
                      ["Regulatory monitoring", false, false, false, true],
                      [
                        "Automatic document updates",
                        false,
                        false,
                        false,
                        true,
                      ],
                      [
                        "Enforcement data benchmarking",
                        false,
                        false,
                        false,
                        true,
                      ],
                      ["Audit-ready in 48 hours", false, false, false, true],
                      [
                        "Annual cost",
                        "$0 until cited",
                        "$500\u2013$2K",
                        "$5K\u2013$15K",
                        "$597/mo",
                      ],
                      [
                        "Risk if inspected",
                        "$48K\u2013$161K",
                        "$16K\u2013$80K",
                        "$5K\u2013$20K",
                        "Minimal",
                      ],
                    ] as (string | boolean)[][]
                  ).map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: `1px solid ${B.midnight}06`,
                        background: i % 2 === 0 ? B.white : B.parchment,
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 20px",
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        {row[0] as string}
                      </td>
                      {[1, 2, 3, 4].map((c) => (
                        <td
                          key={c}
                          style={{
                            padding: "13px 20px",
                            textAlign: "center",
                            background:
                              c === 4 ? `${B.crimson}04` : "transparent",
                          }}
                        >
                          {row[c] === true ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Chk />
                            </div>
                          ) : row[c] === false ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Xx />
                            </div>
                          ) : row[c] === "partial" ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Prt />
                            </div>
                          ) : (
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: c === 4 ? 600 : 300,
                                color: c === 4 ? B.green : B.steel,
                              }}
                            >
                              {row[c] as string}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 6 - OBJECTIONS — FAQ                              */}
      {/* ══════════════════════════════════════════════════ */}
      <section style={{ background: B.parchment, padding: "100px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            {eyebrow("Before you start")}
            <h2
              style={{
                fontFamily: bc,
                fontWeight: 700,
                fontSize: "clamp(32px, 4.5vw, 48px)",
                lineHeight: 0.95,
                letterSpacing: -1,
                textTransform: "uppercase",
                marginTop: 16,
                marginBottom: 48,
              }}
            >
              Common questions.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            {[
              {
                q: "Do I need to give my email to see results?",
                a: "No. Full score, gap analysis, and fine exposure shown immediately. The downloadable PDF scorecard is the only thing gated behind an email.",
              },
              {
                q: "How accurate is the fine exposure estimate?",
                a: "We use actual Cal/OSHA penalty amounts per standard. Fine ranges reflect real differences between first-time serious citations ($1,036\u2013$16,131) and willful/repeat violations ($11,524\u2013$161,323). Your specific amount depends on company size and violation history \u2014 that\u2019s why we show a range.",
              },
              {
                q: "Is this just a marketing gimmick?",
                a: "The questions map directly to what a Cal/OSHA inspector checks during a walkaround. If your score comes back green, you probably don\u2019t need us. If it comes back red, you need somebody \u2014 we happen to be the fastest.",
              },
              {
                q: "What if my industry isn\u2019t listed?",
                a: "We cover 27 verticals. Select the closest match \u2014 the baseline questions (IIPP, WVPP, HazCom, OSHA 300) apply to every California employer regardless of industry.",
              },
              {
                q: "How long does it take?",
                a: "2 minutes. 11 yes-or-no baseline questions plus a handful of industry-specific questions for your vertical.",
              },
              {
                q: "What happens after I get my score?",
                a: "That\u2019s your decision. Download the PDF, share it with your team. Or start a PROTEKON intake \u2014 every gap closed within 48 hours for a flat monthly fee. No pressure.",
              },
              {
                q: "Does SB 553 really apply to my business?",
                a: "If you have employees in California: yes. Enforceable since July 1, 2024. No small business exemption. No grace period. No minimum headcount. Cal/OSHA has already begun issuing citations.",
              },
            ].map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 7 - ACTION — Final CTA                            */}
      {/* ══════════════════════════════════════════════════ */}
      <section
        style={{
          background: B.void,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/solutions/compliance-team.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", opacity: 0.08, pointerEvents: "none" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${B.void}F0 0%, ${B.void}D0 50%, ${B.void}F5 100%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 3,
            background: B.crimson,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -20,
            opacity: 0.015,
            pointerEvents: "none",
          }}
        >
          <Mark w={300} h={525} />
        </div>

        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "100px 24px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Reveal>
            <div
              style={{
                fontFamily: bc,
                fontWeight: 500,
                fontSize: 10,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: B.gold,
                marginBottom: 24,
              }}
            >
              The question isn&apos;t if you&apos;ll be inspected
            </div>
            <h2
              style={{
                fontFamily: bc,
                fontWeight: 800,
                fontSize: "clamp(36px, 5.5vw, 60px)",
                lineHeight: 0.92,
                letterSpacing: -1,
                textTransform: "uppercase",
                color: B.white,
                marginBottom: 28,
              }}
            >
              It&apos;s whether
              <br />
              you&apos;ll be ready
              <br />
              <span style={{ color: B.crimson }}>when they show up.</span>
            </h2>
            <p
              style={{
                fontFamily: dm,
                fontSize: 15,
                color: B.fog,
                lineHeight: 1.75,
                maxWidth: 520,
                margin: "0 auto 48px",
                fontWeight: 300,
              }}
            >
              About two minutes. Real results. Your compliance score and fine exposure —
              calculated against the same enforcement data Cal/OSHA uses to
              decide who to inspect next.
            </p>

            <div
              className="frow"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                marginBottom: 52,
              }}
            >
              <button
                className="cta-cmd"
                onClick={go}
                style={{ fontSize: 12, padding: "22px 52px" }}
              >
                Get my free compliance score
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 28,
              }}
            >
              {[
                "Your scorecard in minutes",
                "No sales call",
                "Results in 2 minutes",
                "Real enforcement data",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      background: B.gold,
                      borderRadius: "50%",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: bc,
                      fontSize: 9,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: `${B.white}35`,
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>

            <p
              style={{
                fontFamily: dm,
                fontSize: 11,
                color: `${B.white}20`,
                lineHeight: 1.65,
                maxWidth: 520,
                margin: "60px auto 0",
                fontWeight: 300,
              }}
            >
              This assessment is for informational purposes only and does not
              constitute legal advice. Results are based on self-reported answers
              and real Cal/OSHA enforcement data. PROTEKON is not a
              law firm.
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

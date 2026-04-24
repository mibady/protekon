// QUARTERLY STAT REFRESH — Source: protekon_content_stats (scraper DB vizmtkfpxxjzlpzibate)
// National:   SELECT * FROM protekon_content_stats WHERE stat_key = 'headlines';
// Key stats: $1.04B penalties since 2020, 116K+ employers cited, 431K+ records, 243K+ serious (56%)
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
            fontFamily: dm,
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
            fontFamily: bc,
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
          maxHeight: open ? 500 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <p
          style={{
            fontFamily: dm,
            fontSize: 14,
            color: B.steel,
            lineHeight: 1.75,
            paddingBottom: 24,
            maxWidth: 620,
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

export default function ScoreNationalPage() {
  const router = useRouter()
  const go = () => router.push("/score?scope=national&start=true")

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
          .ind-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════ */}
      {/* 1 - ATTENTION                                     */}
      {/* ══════════════════════════════════════════════════ */}
      <section
        style={{ background: B.void, position: "relative", overflow: "hidden" }}
      >
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
              Free compliance assessment — all 50 states — your scorecard in minutes
            </span>
          </div>

          <div
            className="hero-g"
            style={{ display: "flex", gap: 64, alignItems: "flex-start" }}
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
                OSHA issued
                <br />
                <span style={{ color: B.crimson }}>$1.04 billion</span>
                <br />
                in penalties
                <br />
                since 2020.
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
                What&apos;s your exposure?
              </p>

              <p
                style={{
                  fontFamily: dm,
                  fontSize: 15,
                  fontWeight: 300,
                  color: B.steel,
                  lineHeight: 1.75,
                  maxWidth: 500,
                  marginBottom: 40,
                }}
              >
                Get your compliance score calculated against{" "}
                <strong style={{ color: B.white, fontWeight: 500 }}>
                  real OSHA enforcement data
                </strong>{" "}
                across every state and territory — and see exactly what an
                inspector would cite you for. Whether you&apos;re in a federal
                OSHA state or a state-plan state.
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

              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {[
                  "Real OSHA enforcement data",
                  "All 50 states + DC",
                  "27 industries",
                  "Instant results",
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
                    stroke={B.gold}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="196 339"
                    transform="rotate(-90 65 65)"
                  />
                  <text
                    x="65"
                    y="60"
                    textAnchor="middle"
                    fill={B.gold}
                    fontFamily={bc}
                    fontWeight="800"
                    fontSize="30"
                  >
                    6
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
                    color: B.gold,
                  }}
                >
                  Gaps detected — 5 citations possible
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
                  $32,262 – $80,655
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                {[
                  "No written safety program",
                  "HazCom program missing",
                  "OSHA 300 not posted",
                  "No emergency action plan",
                  "Training undocumented",
                ].map((g, i) => (
                  <div
                    key={g}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 0",
                      borderBottom:
                        i < 4 ? `1px solid ${B.white}06` : "none",
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
            { n: 1040, p: "$", s: "M", l: "in OSHA penalties since 2020" },
            { n: 116000, p: "", s: "+", l: "employers cited nationwide" },
            { n: 56, p: "", s: "%", l: "of citations rated serious" },
            { n: 50, p: "", s: "", l: "states monitored daily" },
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
      {/* 2 - TRANSFORMATION                                */}
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
            Same inspector.
            <br />
            Same questions.
            <br />
            Now you know first.
          </h2>
          <p
            style={{
              fontFamily: dm,
              fontSize: 15,
              color: B.steel,
              lineHeight: 1.75,
              maxWidth: 500,
              marginBottom: 60,
              fontWeight: 300,
            }}
          >
            Federal OSHA or state plan — the core safety standards are the same.
            Your score is calculated against real enforcement data from your
            state, your industry, and the exact standards an inspector checks.
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
              t: "Select your state + industry",
              d: "Federal OSHA state or state-plan state \u2014 the calculator knows the difference. Industry-specific questions adapt to your vertical\u2019s hazard profile.",
              c: B.crimson,
            },
            {
              n: "02",
              t: "Answer a few core questions",
              d: "Yes/no questions mapped to the exact standards OSHA inspectors check during a walkaround. HazCom. Emergency plans. Training records. Safety programs. OSHA 300.",
              c: B.gold,
            },
            {
              n: "03",
              t: "See your score + close the gaps",
              d: "Compliance score, gap analysis, and fine exposure \u2014 benchmarked against real OSHA enforcement data. Download your scorecard. Fix the gaps yourself or let PROTEKON close them in 48 hours.",
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

        {/* State plan callout */}
        <Reveal delay={0.2}>
          <div
            style={{
              marginTop: 40,
              background: B.midnight,
              padding: "32px 40px",
              display: "flex",
              flexWrap: "wrap",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: bc,
                  fontWeight: 800,
                  fontSize: 44,
                  color: B.white,
                  lineHeight: 0.9,
                }}
              >
                50
              </div>
              <div
                style={{
                  fontFamily: bc,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: B.gold,
                  marginTop: 4,
                }}
              >
                States covered
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p
                style={{
                  fontFamily: dm,
                  fontSize: 14,
                  color: B.fog,
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                <strong style={{ color: B.white, fontWeight: 500 }}>
                  22 federal OSHA states.
                </strong>{" "}
                25 state-plan states with their own enforcement agencies. 4
                hybrid states. Your score adjusts for jurisdiction — because a
                citation in California, Michigan, Oregon, or Washington carries
                different penalty structures than federal OSHA.
              </p>
            </div>
          </div>
        </Reveal>

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
              src="/images/protekon-dashboard2.png"
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
              Every state.
              <br />
              Every industry.
              <br />
              One score.
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
                d: "Weighted against real OSHA enforcement data for your industry in your state. Not a generic risk quiz \u2014 a score benchmarked against actual citations.",
                tag: "Benefit",
              },
              {
                t: "Every gap, named and priced",
                d: "Each gap mapped to the federal or state-plan standard, the citation classification (serious, willful, repeat), and the penalty range your OSHA area office would assess.",
                tag: "Benefit",
              },
              {
                t: "Total fine exposure in dollars",
                d: "A single number: what it costs if OSHA walks in today. Serious violations: $16,131. Willful: up to $161,323. Per violation. Most employers we assess carry $32K\u2013$81K in exposure.",
                tag: "Benefit",
              },
              {
                t: "Industry-specific intelligence",
                d: "27 industries. Construction alone accounts for $469M in penalties. Manufacturing: $271M. Your score reflects your industry\u2019s real enforcement profile \u2014 not a one-size-fits-all template.",
                tag: "Benefit",
              },
              {
                t: "State-plan jurisdiction awareness",
                d: "California, Michigan, Oregon, Washington, and 21 other states run their own OSHA programs with stricter standards. The assessment knows which jurisdiction governs your workplace.",
                tag: "Feature",
              },
              {
                t: "Straight to your score.",
                d: "Full score, gap analysis, and fine exposure shown immediately. Your personalized gap analysis delivered to your inbox. The downloadable PDF scorecard is the only thing gated.",
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
        {/* Background warehouse image */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", pointerEvents: "none" }}>
          <Image
            src="/images/industries/warehouse.jpg"
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
              They thought they
              <br />
              were compliant.
            </h2>
          </Reveal>

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
              <div>
                <div
                  style={{
                    fontFamily: bc,
                    fontWeight: 900,
                    fontSize: 64,
                    lineHeight: 0.88,
                    color: B.crimson,
                  }}
                >
                  56%
                </div>
              </div>
              <p
                style={{
                  fontFamily: dm,
                  fontSize: 16,
                  color: B.fog,
                  lineHeight: 1.7,
                  maxWidth: 480,
                  fontWeight: 300,
                }}
              >
                of all OSHA violations nationwide are classified as{" "}
                <strong style={{ color: B.white, fontWeight: 500 }}>
                  serious
                </strong>{" "}
                — meaning the hazard could cause death or serious physical harm.
                243,000 serious citations. $1.04 billion in penalties. Most
                employers cited had no idea they were exposed.
              </p>
            </div>
          </Reveal>

          {/* Top industries bar */}
          <Reveal delay={0.1}>
            <div
              className="ind-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 1,
                marginBottom: 32,
              }}
            >
              {[
                { name: "Construction", amt: "$469M", pct: 45 },
                { name: "Manufacturing", amt: "$271M", pct: 26 },
                { name: "Wholesale", amt: "$37M", pct: 4 },
                { name: "Transportation", amt: "$35M", pct: 3 },
                { name: "Agriculture", amt: "$22M", pct: 2 },
              ].map((ind) => (
                <div
                  key={ind.name}
                  style={{
                    background: B.white,
                    padding: "20px 16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: bc,
                      fontWeight: 800,
                      fontSize: 22,
                      color: B.crimson,
                    }}
                  >
                    {ind.amt}
                  </div>
                  <div
                    style={{
                      fontFamily: bc,
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: B.steel,
                      marginTop: 4,
                    }}
                  >
                    {ind.name}
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: B.ash,
                      marginTop: 12,
                      borderRadius: 2,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: B.crimson,
                        width: `${ind.pct}%`,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}
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
                q: "We had a safety manual from our corporate office. The assessment found it wasn\u2019t site-specific and our HazCom program was missing entirely. Two citations waiting to happen \u2014 $32K exposure we had no idea about.",
                n: "Plant Manager",
                r: "Houston, TX \u00B7 85 employees",
                v: "Manufacturing",
              },
              {
                q: "I assumed our general contractor handled OSHA compliance for the whole site. The calculator showed that as the controlling employer, every sub\u2019s violation is our citation. We were carrying $96K in downstream exposure.",
                n: "General Contractor",
                r: "Phoenix, AZ \u00B7 45 employees",
                v: "Construction",
              },
              {
                q: "Oregon runs its own OSHA program with stricter penalty structures. I didn\u2019t know that until this assessment. Our emergency action plan was missing and our training records were two years out of date.",
                n: "Warehouse Director",
                r: "Portland, OR \u00B7 120 employees",
                v: "Warehouse",
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
      {/* 5 - COMPARE                                       */}
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
                maxWidth: 500,
                fontWeight: 300,
              }}
            >
              Ignore it, DIY it, hire a safety consultant, or let PROT
              <span style={{ color: B.crimson, fontWeight: 500 }}>E</span>KON
              handle it across every state you operate in.
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
                      "Safety Consultant",
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
                      [
                        "Written safety program (IIPP/APP)",
                        false,
                        "partial",
                        true,
                        true,
                      ],
                      ["HazCom + SDS management", false, false, true, true],
                      ["Emergency action plan", false, "partial", true, true],
                      [
                        "Multi-state jurisdiction mapping",
                        false,
                        false,
                        false,
                        true,
                      ],
                      [
                        "Ongoing regulatory monitoring",
                        false,
                        false,
                        false,
                        true,
                      ],
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
                      [
                        "Audit-ready in 48 hours",
                        false,
                        false,
                        false,
                        true,
                      ],
                      [
                        "Annual cost",
                        "$0 until cited",
                        "$1K\u2013$5K",
                        "$8K\u2013$25K",
                        "$597/mo",
                      ],
                      [
                        "Risk if inspected",
                        "$48K\u2013$161K+",
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
                q: "Does this work for my state?",
                a: "Yes. The assessment covers all 50 states plus DC and US territories. It automatically adjusts for whether you\u2019re in a federal OSHA state (22 states where federal OSHA enforces directly) or a state-plan state (25 states like California, Michigan, Oregon, and Washington that run their own programs with potentially stricter standards). 4 states are hybrid \u2014 federal for private sector, state plan for public sector.",
              },
              {
                q: "What\u2019s the difference between federal OSHA and a state plan?",
                a: "Federal OSHA sets the floor. State-plan states must be \u201Cat least as effective\u201D but can \u2014 and often do \u2014 impose stricter standards and higher penalties. California (Cal/OSHA), Michigan (MIOSHA), Oregon (OR-OSHA), and Washington (WISHA) are the most notable. Your score factors in the enforcement patterns for your specific jurisdiction.",
              },
              {
                q: "How accurate is the fine exposure estimate?",
                a: "We use actual OSHA penalty amounts per standard from real enforcement citations. Current federal penalty maximums: $16,131 per serious violation, $161,323 per willful or repeat violation, and $16,131 per day for failure to abate. State-plan states may exceed these. We show a range because final amounts depend on employer size, good faith, and violation history.",
              },
              {
                q: "Do I need to give my email?",
                a: "No. The full assessment \u2014 score, gap analysis, fine exposure \u2014 is shown immediately. The downloadable PDF scorecard is the only step that asks for your email.",
              },
              {
                q: "Is this just a marketing gimmick?",
                a: "The questions map directly to what an OSHA compliance officer checks during a programmed or complaint-driven inspection. If your score is green, you probably don\u2019t need us. If it\u2019s red, you need somebody \u2014 we happen to close every gap within 48 hours.",
              },
              {
                q: "I have locations in multiple states. Can I assess each one?",
                a: "Yes. Take the assessment once per state where you operate. Each location may face different enforcement patterns, jurisdiction rules, and industry-specific requirements. PROTEKON\u2019s multi-site plan manages all locations from one dashboard.",
              },
              {
                q: "What if my industry isn\u2019t listed?",
                a: "We cover 27 industry verticals mapped from NAICS codes. If yours isn\u2019t in the dropdown, select the closest match \u2014 the core safety questions (HazCom, emergency action plan, OSHA 300, training records, written safety program) apply to every employer regardless of industry.",
              },
              {
                q: "What's involved?",
                a: "A few yes-or-no baseline questions plus industry-specific checks that adapt to your vertical.",
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
          src="/images/industries/manufacturing.jpg"
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
              OSHA inspected 137,000 workplaces in this dataset
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
              The question isn&apos;t
              <br />
              if they&apos;ll inspect you.
              <br />
              <span style={{ color: B.crimson }}>
                It&apos;s what they&apos;ll find.
              </span>
            </h2>
            <p
              style={{
                fontFamily: dm,
                fontSize: 15,
                color: B.fog,
                lineHeight: 1.75,
                maxWidth: 540,
                margin: "0 auto 48px",
                fontWeight: 300,
              }}
            >
              Real results. Your compliance score and fine exposure —
              calculated against real OSHA enforcement data across
              every US state, territory, and industry.
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
                "All 50 states",
                "27 industries",
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
                maxWidth: 560,
                margin: "60px auto 0",
                fontWeight: 300,
              }}
            >
              This assessment is for informational purposes only and does not
              constitute legal advice. Results are based on self-reported answers
              and real OSHA enforcement data from January 2020
              through March 2026. Fine estimates reflect current federal OSHA
              penalty maximums; state-plan states may differ. PROTEKON is not a
              law firm.
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Check, Zap, BarChart3, TrendingUp, Shield, Database, Cpu, Gauge } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
export default function Landing() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f8f8f8, #e8e8e8, #f8f8f8)",
        color: "#1a1a1a",
        overflow: "hidden",
      }}
    >
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
        }
        
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; border: none; font-family: inherit; }
      `}</style>

      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 50,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderBottom: "1px solid rgba(168, 85, 247, 0.2)",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                background: "linear-gradient(to bottom right, #a855f7, #7c3aed)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                background: "linear-gradient(to right, #a78bfa, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Intellyca
            </span>
          </div>

          <div style={{ display: "flex", gap: "2rem" }}>
            {[].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: "#4b5563",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
              >
                {item}
              </a>
            ))}
          </div>

          <Link to="/login">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "5rem",
          overflow: "hidden",
        }}
      >
        {/* Background elements */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "5rem",
              left: "2.5rem",
              width: "18rem",
              height: "18rem",
              background: "rgba(168, 85, 247, 0.2)",
              borderRadius: "9999px",
              filter: "blur(96px)",
              animation: "float 6s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: "5rem",
              right: "2.5rem",
              width: "24rem",
              height: "24rem",
              background: "rgba(168, 85, 247, 0.1)",
              borderRadius: "9999px",
              filter: "blur(96px)",
              animation: "float 6s ease-in-out infinite",
              animationDelay: "1s",
            }}
          ></div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "56rem",
            margin: "0 auto",
            padding: "0 1rem",
            textAlign: "center",
          }}
        >
          <div className="animate-slide-up">
            <div
              style={{
                display: "inline-block",
                marginBottom: "1.5rem",
                padding: "0.5rem 1rem",
                background: "rgba(168, 85, 247, 0.15)",
                border: "1px solid rgba(168, 85, 247, 0.5)",
                borderRadius: "9999px",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ color: "#7c3aed", fontSize: "0.875rem", fontWeight: "600" }}>
                ✨ Next Generation ERP Analytics
              </span>
            </div>

            <h1
              style={{
                fontSize: "3.75rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                lineHeight: "1.2",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(to right, #1a1a1a, #7c3aed, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Transform Your Business
              </span>
              <br />
              <span
                style={{
                  background: "linear-gradient(to right, #7c3aed, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                With Intelligent Analytics
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: "#4b5563",
                marginBottom: "3rem",
                lineHeight: "1.6",
                maxWidth: "48rem",
                margin: "0 auto 3rem",
              }}
            >
              Unlock powerful insights from your ERP data. Make data-driven decisions with real-time analytics,
              predictive intelligence, and beautiful visualizations.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                justifyContent: "center",
                marginBottom: "4rem",
              }}
            >
              <button
                style={{
                  padding: "1rem 2rem",
                  background: "linear-gradient(to right, #a855f7, #7c3aed)",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  fontSize: "1.125rem",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s",
                  maxWidth: "fit-content",
                  margin: "0 auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(168, 85, 247, 0.5)"
                  e.currentTarget.style.transform = "scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.transform = "scale(1)"
                }}
              >
                Request Demo
                <ChevronRight size={20} />
              </button>
              <button
                style={{
                  padding: "1rem 2rem",
                  border: "1px solid rgba(168, 85, 247, 0.5)",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  fontSize: "1.125rem",
                  color: "#7c3aed",
                  background: "transparent",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s",
                  maxWidth: "fit-content",
                  margin: "0 auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.1)"
                  e.currentTarget.style.transform = "scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.transform = "scale(1)"
                }}
              >
                Watch Video
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2rem",
                color: "#6b7280",
                fontSize: "0.875rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Check size={20} color="#a78bfa" />
                <span>No credit card required</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Check size={20} color="#a78bfa" />
                <span>14-day free trial</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Check size={20} color="#a78bfa" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          position: "relative",
          padding: "6rem 1rem",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }} className="animate-slide-up">
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                background: "linear-gradient(to right, #1a1a1a, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Powerful Features
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.125rem", maxWidth: "42rem", margin: "0 auto" }}>
              Everything you need to master your business data
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Get instant insights with live dashboards and real-time data processing",
              },
              {
                icon: TrendingUp,
                title: "Predictive Intelligence",
                description: "AI-powered forecasting to predict trends and optimize decisions",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level encryption and compliance with industry standards",
              },
              {
                icon: Database,
                title: "Data Integration",
                description: "Seamlessly connect all your ERP systems and data sources",
              },
              {
                icon: Cpu,
                title: "Advanced AI Engine",
                description: "Machine learning models that learn from your business patterns",
              },
              {
                icon: Gauge,
                title: "Custom Dashboards",
                description: "Build personalized dashboards tailored to your KPIs",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{
                  position: "relative",
                  background: "linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), rgba(255, 255, 255, 0.8))",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s",
                  animationDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)"
                  e.currentTarget.style.transform = "scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.3)"
                  e.currentTarget.style.transform = "scale(1)"
                }}
              >
                <feature.icon size={48} color="#a78bfa" style={{ marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#1a1a1a" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#6b7280", lineHeight: "1.6" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          position: "relative",
          padding: "6rem 1rem",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }} className="animate-slide-up">
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                background: "linear-gradient(to right, #1a1a1a, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>Choose the perfect plan for your business</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                name: "Starter",
                price: "$299",
                period: "/month",
                description: "Perfect for small teams",
                features: [
                  "Up to 5 users",
                  "Basic analytics dashboard",
                  "Real-time data sync",
                  "Email support",
                  "30-day data retention",
                ],
                highlighted: false,
              },
              {
                name: "Professional",
                price: "$799",
                period: "/month",
                description: "For growing businesses",
                features: [
                  "Up to 25 users",
                  "Advanced analytics & AI",
                  "Custom dashboards",
                  "Priority support",
                  "1-year data retention",
                  "API access",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "pricing",
                description: "For large organizations",
                features: [
                  "Unlimited users",
                  "Full AI suite",
                  "White-label solution",
                  "24/7 dedicated support",
                  "Unlimited data retention",
                  "Custom integrations",
                ],
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{
                  position: "relative",
                  background: plan.highlighted
                    ? "linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))"
                    : "linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), rgba(255, 255, 255, 0.8))",
                  border: plan.highlighted ? "1px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(168, 85, 247, 0.3)",
                  borderRadius: "1.5rem",
                  padding: "2rem",
                  backdropFilter: "blur(4px)",
                  transform: plan.highlighted ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {plan.highlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-1rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(to right, #a855f7, #7c3aed)",
                      padding: "0.25rem 1rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1a1a1a" }}>
                  {plan.name}
                </h3>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>{plan.description}</p>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#a78bfa" }}>{plan.price}</span>
                  <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>{plan.period}</span>
                </div>

                <button
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: plan.highlighted ? "linear-gradient(to right, #a855f7, #7c3aed)" : "transparent",
                    border: plan.highlighted ? "none" : "1px solid rgba(168, 85, 247, 0.5)",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    color: plan.highlighted ? "white" : "#7c3aed",
                    marginBottom: "2rem",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    if (plan.highlighted) {
                      e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(168, 85, 247, 0.5)"
                    } else {
                      e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.1)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none"
                    if (!plan.highlighted) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  Get Started
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {plan.features.map((feature, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Check size={20} color="#a78bfa" style={{ flexShrink: 0 }} />
                      <span style={{ color: "#4b5563" }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        style={{
          position: "relative",
          padding: "8rem 1rem",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "25%",
              width: "24rem",
              height: "24rem",
              background: "rgba(168, 85, 247, 0.3)",
              borderRadius: "9999px",
              filter: "blur(96px)",
              animation: "float 6s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: "25%",
              width: "24rem",
              height: "24rem",
              background: "rgba(168, 85, 247, 0.2)",
              borderRadius: "9999px",
              filter: "blur(96px)",
              animation: "float 6s ease-in-out infinite",
              animationDelay: "1s",
            }}
          ></div>
        </div>

        <div style={{ position: "relative", maxWidth: "80rem", margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(to bottom right, rgba(168, 85, 247, 0.15), rgba(255, 255, 255, 0.9))",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: "1.875rem",
              padding: "3rem",
              backdropFilter: "blur(80px)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "10rem",
                height: "10rem",
                background: "rgba(168, 85, 247, 0.1)",
                borderRadius: "9999px",
                filter: "blur(96px)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "10rem",
                height: "10rem",
                background: "rgba(168, 85, 247, 0.1)",
                borderRadius: "9999px",
                filter: "blur(96px)",
              }}
            ></div>

            <div
              style={{
                position: "relative",
                zIndex: 10,
                textAlign: "center",
              }}
              className="animate-slide-up"
            >
              <div
                style={{
                  display: "inline-block",
                  marginBottom: "1.5rem",
                  padding: "0.5rem 1rem",
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.5)",
                  borderRadius: "9999px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ color: "#7c3aed", fontSize: "0.875rem", fontWeight: "600" }}>
                  🚀 Start Your Analytics Journey
                </span>
              </div>

              <h2
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  lineHeight: "1.2",
                  background: "linear-gradient(to right, #1a1a1a, #7c3aed, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ready to Unlock Your Data?
              </h2>

              <p
                style={{
                  fontSize: "1.25rem",
                  color: "#4b5563",
                  marginBottom: "2.5rem",
                  maxWidth: "48rem",
                  margin: "0 auto 2.5rem",
                  lineHeight: "1.6",
                }}
              >
                Join 500+ enterprises using Intellyca to transform raw ERP data into actionable intelligence. Get 50%
                off your first 3 months.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  justifyContent: "center",
                  marginBottom: "2rem",
                }}
              >
                <button
                  style={{
                    padding: "1rem 2.5rem",
                    background: "linear-gradient(to right, #a855f7, #7c3aed)",
                    borderRadius: "0.75rem",
                    fontWeight: "600",
                    fontSize: "1.125rem",
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s",
                    maxWidth: "fit-content",
                    margin: "0 auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(168, 85, 247, 0.5)"
                    e.currentTarget.style.transform = "scale(1.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  <span>Request Demo</span>
                  <ChevronRight size={20} />
                </button>
                <button
                  style={{
                    padding: "1rem 2.5rem",
                    border: "2px solid rgba(168, 85, 247, 0.5)",
                    borderRadius: "0.75rem",
                    fontWeight: "600",
                    fontSize: "1.125rem",
                    color: "#7c3aed",
                    background: "transparent",
                    backdropFilter: "blur(4px)",
                    transition: "all 0.3s",
                    maxWidth: "fit-content",
                    margin: "0 auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.1)"
                    e.currentTarget.style.borderColor = "rgba(168, 85, 247, 1)"
                    e.currentTarget.style.transform = "scale(1.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.5)"
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  View Case Studies
                </button>
              </div>

              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          borderTop: "1px solid rgba(168, 85, 247, 0.3)",
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(168, 85, 247, 0.1))",
          padding: "4rem 1rem",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "3rem",
              marginBottom: "3rem",
            }}
          >
            <div className="animate-slide-up">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    background: "linear-gradient(to bottom right, #a855f7, #7c3aed)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={20} color="white" />
                </div>
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    background: "linear-gradient(to right, #a78bfa, #c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Intellyca
                </span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Intelligent ERP analytics for modern businesses.</p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy", "Terms", "Contact"] },
            ].map((col, i) => (
              <div key={i} className="animate-slide-up" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                <h4 style={{ fontWeight: "bold", color: "#1a1a1a", marginBottom: "1rem" }}>{col.title}</h4>
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ transition: "color 0.3s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(168, 85, 247, 0.3)",
              paddingTop: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
              gap: "1rem",
            }}
          >
            <p>&copy; 2025 Intellyca. All rights reserved.</p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  style={{ transition: "color 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

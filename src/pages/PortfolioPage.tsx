import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, TrendingDown, Home, BarChart2, PlusCircle, Bell, User, ChevronRight } from "lucide-react";

const positions = [
  { id: 1, name: "S&P 500", ticker: "SPY", type: "ETF", value: 42180, cost: 36200, color: "#10b981", icon: "📈", weight: 28 },
  { id: 2, name: "Nasdaq-100", ticker: "QQQ", type: "ETF", value: 31540, cost: 27100, color: "#6366f1", icon: "💹", weight: 21 },
  { id: 3, name: "Microsoft", ticker: "MSFT", type: "Acción", value: 28900, cost: 24700, color: "#22d3ee", icon: "🪟", weight: 19 },
  { id: 4, name: "Semiconductores", ticker: "SOXX", type: "ETF", value: 21600, cost: 19800, color: "#f59e0b", icon: "⚡", weight: 14 },
  { id: 5, name: "NVIDIA", ticker: "NVDA", type: "Acción", value: 18750, cost: 14200, color: "#a78bfa", icon: "🟢", weight: 12 },
  { id: 6, name: "Apple", ticker: "AAPL", type: "Acción", value: 8930, cost: 8200, color: "#34d399", icon: "🍎", weight: 6 },
];

const totalValue = positions.reduce((a, b) => a + b.value, 0);
const totalCost = positions.reduce((a, b) => a + b.cost, 0);
const totalGain = totalValue - totalCost;
const totalPct = ((totalGain / totalCost) * 100).toFixed(2);

function useCountUp(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
}

function DonutChart() {
  const size = 200, cx = 100, cy = 100, r = 72, stroke = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = positions.map((p) => {
    const dash = (p.weight / 100) * circ;
    const gap = circ - dash;
    const slice = { ...p, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {slices.map((s) => (
        <circle
          key={s.id} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={stroke - 2}
          strokeDasharray={`${s.dash - 1.5} ${s.gap + 1.5}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${s.color}80)` }}
        />
      ))}
    </svg>
  );
}

interface Position {
  id: number;
  name: string;
  ticker: string;
  type: string;
  value: number;
  cost: number;
  color: string;
  icon: string;
  weight: number;
}

function PositionCard({ pos, delay }: { pos: Position; delay: number }) {
  const gain = pos.value - pos.cost;
  const pct = ((gain / pos.cost) * 100).toFixed(2);
  const isPos = gain >= 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 10,
      backdropFilter: "blur(12px)",
      animation: `slideIn 0.4s ${delay}s both`,
      cursor: "pointer",
      transition: "background 0.2s",
    }}
    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)"}
    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${pos.color}22`,
        border: `1px solid ${pos.color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
        boxShadow: `0 0 12px ${pos.color}33`,
      }}>
        {pos.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", letterSpacing: "0.01em" }}>{pos.name}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>
            {pos.value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {pos.ticker} · {pos.type}
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 3,
            background: isPos ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${isPos ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 8, padding: "2px 8px",
            boxShadow: isPos ? "0 0 8px rgba(16,185,129,0.2)" : "0 0 8px rgba(239,68,68,0.2)",
          }}>
            {isPos ? <TrendingUp size={11} color="#10b981" /> : <TrendingDown size={11} color="#ef4444" />}
            <span style={{ fontSize: 12, fontWeight: 700, color: isPos ? "#10b981" : "#ef4444", letterSpacing: "0.02em" }}>
              +{pct}%
            </span>
          </div>
        </div>
        <div style={{ marginTop: 6, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
          <div style={{
            height: "100%", width: `${pos.weight}%`, background: pos.color,
            borderRadius: 99,
            boxShadow: `0 0 6px ${pos.color}80`,
            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }} />
        </div>
      </div>
    </div>
  );
}

export function PortfolioPage() {
  const animatedTotal = useCountUp(totalValue);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a14 50%, #0a0f1e 100%)",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#f1f5f9",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        input[type=range] { height: 4px; border-radius: 99px; }
      `}</style>

      {/* Mesh gradient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: 200, right: -100, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 120, left: 40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 430, margin: "0 auto", paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ padding: "48px 20px 20px", animation: "slideIn 0.4s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                Patrimonio total
              </div>
              <div style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
                Actualizado ahora
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={16} color="#94a3b8" />
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 52, fontWeight: 200, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
              {animatedTotal.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 8, padding: "4px 10px",
              boxShadow: "0 0 12px rgba(16,185,129,0.15)",
            }}>
              <TrendingUp size={13} color="#10b981" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>+{totalPct}%</span>
            </div>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              +{totalGain.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} total
            </span>
          </div>
        </div>

        {/* Donut + legend */}
        <div style={{
          margin: "0 20px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          backdropFilter: "blur(16px)",
          animation: "slideIn 0.4s 0.1s both",
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <DonutChart />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Activos</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{positions.length}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {positions.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0, boxShadow: `0 0 6px ${p.color}` }} />
                <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{p.ticker}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{p.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Positions */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, animation: "slideIn 0.4s 0.15s both" }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#475569" }}>
              Posiciones
            </span>
            <span style={{ fontSize: 12, color: "#6366f1", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
              Ver todo <ChevronRight size={12} />
            </span>
          </div>
          {positions.map((pos, i) => (
            <PositionCard key={pos.id} pos={pos} delay={0.2 + i * 0.07} />
          ))}
        </div>

      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 48px)",
        maxWidth: 380,
        background: "rgba(10,15,30,0.75)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "12px 8px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.05) inset",
      }}>
        {[
          { icon: Home, label: "Inicio", route: "/" },
          { icon: BarChart2, label: "Mercado", route: "/news" },
          { icon: PlusCircle, label: "Añadir", route: "/dca" },
          { icon: User, label: "Perfil", route: "/settings" },
        ].map(({ icon: Icon, label, route }) => {
          const active = pathname === route;
          return (
            <button key={route} onClick={() => navigate(route)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                background: active ? "rgba(16,185,129,0.12)" : "transparent",
                border: active ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                borderRadius: 14, padding: "8px 14px",
                cursor: "pointer", transition: "all 0.2s",
                minWidth: 54,
              }}>
              <Icon size={20} color={active ? "#10b981" : "#475569"} />
              <span style={{ fontSize: 10, color: active ? "#10b981" : "#475569", letterSpacing: "0.04em", fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

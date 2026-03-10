import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Em desenvolvimento: http://localhost:8000
// Em produção (ex: Railway, Render): https://achama-observatorio.railway.app
const API_BASE = "http://localhost:8000";

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────

function StatusBadge({ meta }) {
  if (!meta) return null;
  const { ine_status, atualizado_em } = meta;
  const cfg = {
    ok:      { color: "#22c55e", label: "INE · Dados reais", live: true },
    parcial: { color: "#f59e0b", label: "INE · Parcial", live: true },
    erro:    { color: "#ef4444", label: "INE indisponível", live: false },
  }[ine_status] || { color: "#94a3b8", label: "A carregar…", live: false };

  const hora = atualizado_em
    ? new Date(atualizado_em).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {cfg.live && (
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: cfg.color,
            animation: "pulse 2.5s infinite", boxShadow: `0 0 6px ${cfg.color}`
          }} />
        )}
        <span style={{ fontSize: 10, color: cfg.color, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {cfg.label}
        </span>
      </div>
      {hora && <span style={{ fontSize: 9, color: "#334155" }}>atualizado às {hora}</span>}
    </div>
  );
}

function HeatBar({ value, min = 4, max = 15 }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const color = pct > 75 ? "#ef4444" : pct > 50 ? "#f97316" : pct > 30 ? "#eab308" : "#22c55e";
  return (
    <div style={{ width: "100%", height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 1s ease", borderRadius: 2 }} />
    </div>
  );
}

function Sparkline({ data = [], color = "#f97316" }) {
  if (data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const w = 72, h = 26;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 2) - 1}`
  ).join(" ");
  const lx = w, ly = h - ((data[data.length - 1] - min) / range) * (h - 2) - 1;
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

function MapDot({ m, selected, onClick }) {
  const val = m.renda_m2 || 8;
  const pct = ((val - 4) / 11) * 100;
  const color = pct > 75 ? "#ef4444" : pct > 50 ? "#f97316" : pct > 30 ? "#eab308" : "#22c55e";
  const lonMin = -9.05, lonMax = -7.3, latMin = 36.95, latMax = 37.56;
  const x = ((m.lon - lonMin) / (lonMax - lonMin)) * 340 + 10;
  const y = ((latMax - m.lat) / (latMax - latMin)) * 160 + 10;
  return (
    <g onClick={() => onClick(m)} style={{ cursor: "pointer" }}>
      {selected && <circle cx={x} cy={y} r={16} fill={color} fillOpacity={0.12} />}
      <circle cx={x} cy={y} r={selected ? 10 : 6.5} fill={color}
        fillOpacity={selected ? 1 : 0.82} stroke={selected ? "#fff" : "transparent"} strokeWidth={1.5} />
      {selected && (
        <text x={x} y={y - 13} textAnchor="middle" fontSize="8.5" fill="#f8fafc" fontWeight="700">
          {m.nome.split(" ")[0]}
        </text>
      )}
    </g>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ObservatorioHabitacao() {
  const [municipios, setMunicipios] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("mapa");
  const [sortBy, setSortBy] = useState("renda_m2");

  const fetchDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/habitacao/algarve`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setMunicipios(json.municipios || []);
      setMeta(json.meta || null);
      // Default: Faro selecionado
      const faro = json.municipios?.find(m => m.cod === "08005");
      if (faro) setSelected(faro);
    } catch (e) {
      setError(`Não foi possível ligar ao backend: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDados(); }, [fetchDados]);

  const sorted = [...municipios].sort((a, b) => {
    if (sortBy === "renda_m2") return b.renda_m2 - a.renda_m2;
    if (sortBy === "variacao") return b.variacao_anual_pct - a.variacao_anual_pct;
    if (sortBy === "esforco") return b.esforco_rendimento_pct - a.esforco_rendimento_pct;
    return b.renda_m2 - a.renda_m2;
  });

  const avgRenda = municipios.length
    ? (municipios.reduce((s, m) => s + m.renda_m2, 0) / municipios.length).toFixed(2)
    : "–";
  const maxVar = municipios.length
    ? municipios.reduce((a, b) => a.variacao_anual_pct > b.variacao_anual_pct ? a : b)
    : null;
  const criticos = municipios.filter(m => m.renda_m2 > 11).length;
  const liveCount = municipios.filter(m => m.is_live).length;

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      background: "#080e1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "20px 16px",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "36px 36px"
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#334155", textTransform: "uppercase", marginBottom: 3 }}>
              ACHAMA · Observatório da Habitação
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>
              Algarve · 16 Municípios
            </h1>
            <div style={{ fontSize: 9, color: "#1e3a5f", marginTop: 3 }}>
              {liveCount > 0 ? `${liveCount} municípios com dados INE diretos` : "Fonte: INE / IHRU / Idealista 2024"}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <StatusBadge meta={meta} />
            <button onClick={fetchDados} disabled={loading} style={{
              fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
              background: "transparent", border: "1px solid #1e293b",
              borderRadius: 3, color: "#475569", padding: "4px 10px",
              cursor: loading ? "wait" : "pointer", fontFamily: "inherit"
            }}>
              {loading ? "⟳ A carregar…" : "↻ Atualizar"}
            </button>
          </div>
        </div>

        {/* ERRO */}
        {error && (
          <div style={{
            background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 6,
            padding: "12px 14px", marginBottom: 16, fontSize: 11, color: "#fca5a5"
          }}>
            <strong>Backend offline</strong> — {error}
            <div style={{ fontSize: 9, color: "#7f1d1d", marginTop: 4 }}>
              Inicia o servidor: <code>uvicorn main:app --reload</code>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Renda Mediana Algarve", val: loading ? "…" : `${avgRenda}€/m²`, sub: "média 16 municípios", spark: true, color: "#f97316" },
            { label: "Maior subida", val: maxVar ? `+${maxVar.variacao_anual_pct}%` : "–", sub: maxVar?.nome || "", color: "#ef4444" },
            { label: "Municípios críticos", val: loading ? "–" : `${criticos}/16`, sub: ">11€/m²", color: "#f97316" },
            { label: "Algarve vs Portugal", val: "+23%", sub: "10.39€ vs 8.43€ nacional", color: "#94a3b8" },
          ].map((k, i) => (
            <div key={i} style={{ background: "#0d1524", border: "1px solid #1a2438", borderRadius: 7, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>{k.label}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.val}</div>
                  <div style={{ fontSize: 9, color: "#334155", marginTop: 3 }}>{k.sub}</div>
                </div>
                {k.spark && selected?.serie_historica && (
                  <Sparkline data={selected.serie_historica} color={k.color} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
          {[["mapa","Mapa"],["tabela","Tabela"],["fontes","Fontes"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "5px 14px", borderRadius: 3, border: "1px solid",
              borderColor: tab === t ? "#f97316" : "#1a2438",
              background: tab === t ? "#f9731612" : "transparent",
              color: tab === t ? "#f97316" : "#475569",
              fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
              cursor: "pointer", fontFamily: "inherit"
            }}>{l}</button>
          ))}
        </div>

        {/* MAPA */}
        {tab === "mapa" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 14 }}>
            <div style={{ background: "#0d1524", border: "1px solid #1a2438", borderRadius: 7, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                Pressão de Renda · €/m²
              </div>
              {loading ? (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#1e3a5f", fontSize: 11 }}>
                  A ligar ao backend…
                </div>
              ) : (
                <svg viewBox="0 0 360 180" style={{ width: "100%", background: "#05080f", borderRadius: 5, border: "1px solid #1a2438" }}>
                  <path d="M10,150 Q50,130 100,138 Q150,145 200,135 Q250,125 310,118 Q330,115 350,112"
                    fill="none" stroke="#0f2040" strokeWidth="1.5" strokeDasharray="4,3" />
                  {municipios.map(m => (
                    <MapDot key={m.cod} m={m} selected={selected?.cod === m.cod} onClick={setSelected} />
                  ))}
                </svg>
              )}
              <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                {[["#22c55e","<6€"],["#eab308","6–9€"],["#f97316","9–12€"],["#ef4444",">12€"]].map(([c,l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 9, color: "#475569" }}>{l}/m²</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0d1524", border: "1px solid #1a2438", borderRadius: 7, padding: 14 }}>
              {selected ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", lineHeight: 1.2 }}>{selected.nome}</div>
                      {selected.is_live && (
                        <div style={{ fontSize: 8, color: "#22c55e", letterSpacing: 1.5, marginTop: 2 }}>✓ INE DIRETO</div>
                      )}
                    </div>
                    {selected.serie_historica && <Sparkline data={selected.serie_historica} color="#f97316" />}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Renda mediana", val: `${selected.renda_m2}€/m²`, bar: true, barVal: selected.renda_m2 },
                      { label: "Variação anual", val: `+${selected.variacao_anual_pct}%`,
                        color: selected.variacao_anual_pct > 15 ? "#ef4444" : selected.variacao_anual_pct > 8 ? "#f97316" : "#22c55e" },
                      { label: "Preço venda", val: `${selected.preco_venda_m2}€/m²` },
                      { label: "Esforço família", val: `${selected.esforco_rendimento_pct}%`,
                        color: selected.esforco_rendimento_pct > 50 ? "#ef4444" : selected.esforco_rendimento_pct > 35 ? "#f97316" : "#22c55e" },
                      { label: "Período", val: selected.periodo },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: item.color || "#f8fafc" }}>{item.val}</span>
                        </div>
                        {item.bar && <HeatBar value={item.barVal} />}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 8, color: "#1e3a5f", borderTop: "1px solid #1a2438", paddingTop: 8 }}>
                    Fonte: {selected.fonte}
                  </div>
                </>
              ) : (
                <div style={{ color: "#334155", fontSize: 11 }}>Selecione um município no mapa</div>
              )}
            </div>
          </div>
        )}

        {/* TABELA */}
        {tab === "tabela" && (
          <div style={{ background: "#0d1524", border: "1px solid #1a2438", borderRadius: 7, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, textTransform: "uppercase" }}>
                16 Municípios · Algarve
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {[["renda_m2","Renda"],["variacao","Variação"],["esforco","Esforço"]].map(([s,l]) => (
                  <button key={s} onClick={() => setSortBy(s)} style={{
                    padding: "3px 9px", fontSize: 8, letterSpacing: 1, textTransform: "uppercase",
                    border: "1px solid", borderColor: sortBy === s ? "#f97316" : "#1a2438",
                    background: sortBy === s ? "#f9731610" : "transparent",
                    color: sortBy === s ? "#f97316" : "#475569",
                    borderRadius: 3, cursor: "pointer", fontFamily: "inherit"
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a2438" }}>
                    {["#","Município","Renda/m²","Var.","Esforço","Venda/m²","Pressão"].map(h => (
                      <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: 8, color: "#334155", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m, i) => {
                    const pct = ((m.renda_m2 - 4) / 11) * 100;
                    const color = pct > 75 ? "#ef4444" : pct > 50 ? "#f97316" : pct > 30 ? "#eab308" : "#22c55e";
                    return (
                      <tr key={m.cod}
                        onClick={() => { setSelected(m); setTab("mapa"); }}
                        style={{ borderBottom: "1px solid #1a243820", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1a243830"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "7px 8px", color: "#334155", fontSize: 9 }}>{i + 1}</td>
                        <td style={{ padding: "7px 8px", color: "#f8fafc", fontWeight: 500 }}>
                          {m.nome}
                          {m.is_live && <span style={{ marginLeft: 4, fontSize: 7, color: "#22c55e" }}>●</span>}
                        </td>
                        <td style={{ padding: "7px 8px", color, fontWeight: 700 }}>{m.renda_m2}€</td>
                        <td style={{ padding: "7px 8px", color: m.variacao_anual_pct > 15 ? "#ef4444" : m.variacao_anual_pct > 8 ? "#f97316" : "#22c55e" }}>
                          +{m.variacao_anual_pct}%
                        </td>
                        <td style={{ padding: "7px 8px", color: m.esforco_rendimento_pct > 50 ? "#ef4444" : "#94a3b8" }}>
                          {m.esforco_rendimento_pct}%
                        </td>
                        <td style={{ padding: "7px 8px", color: "#64748b" }}>{m.preco_venda_m2}€</td>
                        <td style={{ padding: "7px 8px", width: 70 }}><HeatBar value={m.renda_m2} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FONTES */}
        {tab === "fontes" && (
          <div style={{ background: "#0d1524", border: "1px solid #1a2438", borderRadius: 7, padding: 16 }}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
              Fontes de Dados
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(meta?.fontes || ["A aguardar dados…"]).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, borderBottom: "1px solid #1a2438", paddingBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", marginTop: 4, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#05080f", borderRadius: 5, border: "1px solid #1a2438" }}>
              <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Indicadores INE utilizados
              </div>
              {[
                ["0010732", "Renda mediana/m² · novos contratos arrendamento (trimestral)"],
                ["0009827", "Preço mediano/m² · alojamentos transacionados (trimestral)"],
                ["0007509", "Renda média · habitação social por município (anual)"],
              ].map(([cod, desc]) => (
                <div key={cod} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, marginBottom: 6 }}>
                  <code style={{ fontSize: 9, color: "#f97316" }}>{cod}</code>
                  <span style={{ fontSize: 9, color: "#64748b" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 8, color: "#1e293b", textAlign: "right" }}>
          ACHAMA · Observatório da Habitação · {new Date().getFullYear()}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 6px currentColor} 50%{opacity:.5;box-shadow:0 0 2px currentColor} }
      `}</style>
    </div>
  );
}

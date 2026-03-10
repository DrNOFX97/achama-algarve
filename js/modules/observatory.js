export function initObservatory(OBS_DATA) {
    const openBtn = document.getElementById("obs-open-btn");
    const openLink = document.getElementById("obs-link-card");
    const overlay = document.getElementById("obs-overlay");
    const closeBtn = document.getElementById("obs-close-btn");
    if (!openBtn || !overlay) return;

    // Derived fields
    OBS_DATA.forEach(function (m) {
        m.esforco = Math.round((m.renda * 75) / 1050 * 1000) / 10;
    });

    function obsColor(renda) {
        if (renda >= 13) return "#dc2626";
        if (renda >= 11) return "#ea580c";
        if (renda >= 8.5) return "#d97706";
        if (renda >= 6.5) return "#65a30d";
        return "#16a34a";
    }
    function obsVarColor(v) { return v >= 15 ? "#dc2626" : v >= 10 ? "#ea580c" : v >= 5 ? "#d97706" : "#16a34a"; }
    function obsEsfColor(e) { return e >= 80 ? "#dc2626" : e >= 50 ? "#ea580c" : e >= 35 ? "#d97706" : "#16a34a"; }
    function obsBarPct(r) { return Math.min(100, Math.round(((r - 4) / 12) * 100)); }

    let obsSort = { key: "renda", dir: "desc" };

    function obsSorted(key, dir) {
        return OBS_DATA.slice().sort(function (a, b) {
            return dir === "asc" ? a[key] - b[key] : b[key] - a[key];
        });
    }

    function obsRenderTable(key, dir) {
        obsSort = { key: key, dir: dir };
        const tbody = document.getElementById("obs-tbody");
        if (!tbody) return;
        tbody.innerHTML = obsSorted(key, dir).map(function (m, i) {
            const hc = obsColor(m.renda);
            const pct = obsBarPct(m.renda);
            return `<tr>
        <td style="color:var(--color-muted);font-size:.8rem;">${i + 1}</td>
        <td style="font-weight:600;color:var(--color-text);">${m.nome}${m.live ? '<span class="obs-badge obs-badge--live">Mkt.</span>' : '<span class="obs-badge obs-badge--est">Est.</span>'}</td>
        <td style="font-weight:700;color:${hc};">${m.renda.toFixed(1)}&nbsp;€/m²</td>
        <td style="color:${obsVarColor(m.variacao)};font-weight:600;">+${m.variacao.toFixed(1)}%</td>
        <td style="color:var(--color-text);">${m.venda.toLocaleString("pt-PT")}&nbsp;€/m²</td>
        <td style="color:${obsEsfColor(m.esforco)};font-weight:600;">${m.esforco.toFixed(1)}%</td>
        <td><div class="obs-bar"><div class="obs-bar__fill" style="width:${pct}%;background:${hc};"></div></div></td>
      </tr>`;
        }).join("");
        document.querySelectorAll(".obs-table th[data-sort]").forEach(function (th) {
            th.classList.remove("sort-asc", "sort-desc");
            if (th.dataset.sort === key) th.classList.add(dir === "asc" ? "sort-asc" : "sort-desc");
        });
    }

    function obsRenderEvolucao() {
        const el = document.getElementById("obs-evolucao");
        if (!el) return;
        const data = OBS_DATA.slice().sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao));
        const maxRenda = Math.max(...OBS_DATA.map(m => m.renda));
        el.innerHTML = `<div style="display:flex;flex-direction:column;gap:.7rem;">
      ${data.map(m => {
            const r2023 = Math.round((m.renda / (1 + m.variacao / 100)) * 10) / 10;
            const pct23 = Math.round((r2023 / maxRenda) * 100);
            const pct24 = Math.round((m.renda / maxRenda) * 100);
            const hc = obsColor(m.renda);
            const varColor = m.variacao < 0 ? "#16a34a" : obsVarColor(Math.abs(m.variacao));
            const varSign = m.variacao >= 0 ? "+" : "";
            return `<div style="display:grid;grid-template-columns:130px 1fr 70px;align-items:center;gap:.6rem;font-family:var(--font-body);font-size:.8rem;">
          <div style="text-align:right;color:var(--color-text);font-weight:500;font-size:.78rem;">${m.nome}</div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            <div style="display:flex;align-items:center;gap:5px;">
              <span style="width:36px;font-size:.65rem;color:var(--color-muted);text-align:right;flex-shrink:0;">2023</span>
              <div style="flex:1;background:#ede9e3;border-radius:3px;height:10px;overflow:hidden;">
                <div style="width:${pct23}%;height:100%;background:#9ca3af;border-radius:3px;transition:width .8s ease;"></div>
              </div>
              <span style="width:42px;font-size:.72rem;color:var(--color-muted);font-weight:500;">${r2023.toFixed(1)}€</span>
            </div>
            <div style="display:flex;align-items:center;gap:5px;">
              <span style="width:36px;font-size:.65rem;color:var(--color-muted);text-align:right;flex-shrink:0;">2024</span>
              <div style="flex:1;background:#ede9e3;border-radius:3px;height:10px;overflow:hidden;">
                <div style="width:${pct24}%;height:100%;background:${hc};border-radius:3px;transition:width .8s ease;"></div>
              </div>
              <span style="width:42px;font-size:.72rem;color:${hc};font-weight:700;">${m.renda.toFixed(1)}€</span>
            </div>
          </div>
          <div style="text-align:center;font-weight:700;font-size:.82rem;color:${varColor};padding:.2rem .4rem;background:${varColor}15;border-radius:4px;">
            ${varSign}${m.variacao.toFixed(1)}%
          </div>
        </div>`;
        }).join("")}
    </div>`;
    }

    function obsRenderRanking() {
        const data = obsSorted("renda", "desc");
        const max = data[0].renda;
        const el = document.getElementById("obs-ranking");
        if (!el) return;
        el.innerHTML = data.map(m => {
            const hc = obsColor(m.renda);
            const pct = Math.round((m.renda / max) * 100);
            return `<div class="obs-rank-row">
        <div class="obs-rank-row__name">${m.nome}</div>
        <div class="obs-rank-row__bar-wrap">
          <div class="obs-rank-row__bar" style="width:${pct}%;background:${hc}22;border-right:3px solid ${hc};"></div>
        </div>
        <div class="obs-rank-row__val" style="color:${hc};">${m.renda.toFixed(1)}&nbsp;€</div>
      </div>`;
        }).join("");
    }

    // KPIs
    const rendas = OBS_DATA.map(m => m.renda);
    const avg = (rendas.reduce((a, b) => a + b, 0) / rendas.length).toFixed(1);
    const maxVar = OBS_DATA.reduce((a, b) => a.variacao > b.variacao ? a : b);
    const criticos = OBS_DATA.filter(m => m.renda > 11).length;

    const kpiRenda = document.getElementById("obs-kpi-renda");
    const kpiVar = document.getElementById("obs-kpi-var");
    const kpiVarNome = document.getElementById("obs-kpi-var-nome");
    const kpiCriticos = document.getElementById("obs-kpi-criticos");

    if (kpiRenda) kpiRenda.textContent = avg.replace(".", ",") + " €/m²";
    if (kpiVar) kpiVar.textContent = "+" + maxVar.variacao.toFixed(1).replace(".", ",") + "%";
    if (kpiVarNome) kpiVarNome.textContent = maxVar.nome;
    if (kpiCriticos) kpiCriticos.textContent = criticos + "/16";

    function openObs() {
        overlay.classList.add("is-open");
        document.body.style.overflow = "hidden";
        obsRenderTable("renda", "desc");
        obsRenderEvolucao();
        obsRenderRanking();
        closeBtn.focus();
    }
    function closeObs() {
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
        openBtn.focus();
    }

    openBtn.addEventListener("click", openObs);
    if (openLink) {
        openLink.addEventListener("click", (e) => {
            e.preventDefault();
            openObs();
        });
    }
    closeBtn.addEventListener("click", closeObs);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeObs(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open")) closeObs();
    });

    document.querySelectorAll(".obs-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".obs-tab").forEach(b => {
                b.classList.remove("is-active");
                b.setAttribute("aria-selected", "false");
            });
            document.querySelectorAll(".obs-tabpanel").forEach(p => p.classList.remove("is-active"));
            btn.classList.add("is-active");
            btn.setAttribute("aria-selected", "true");
            document.getElementById("obs-panel-" + btn.dataset.tab).classList.add("is-active");
        });
    });

    document.querySelectorAll(".obs-table th[data-sort]").forEach(th => {
        th.addEventListener("click", () => {
            const key = th.dataset.sort;
            const dir = (obsSort.key === key && obsSort.dir === "desc") ? "asc" : "desc";
            obsRenderTable(key, dir);
        });
    });
}

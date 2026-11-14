const PAGE_SIZE = 50;
const FILTER1_FIELD = { Ships: "Nation", Aircraft: "Nation", Armaments: "Category", Munitions: "Type" };
const FILTER2_FIELD = { Ships: "Class", Aircraft: "Type", Armaments: "Module Type", Munitions: "Type" };
const NUMERIC = new Set(["Length (m)", "Beam (m)", "Displacement (t)", "Max Speed (kn)", "Variants", "Fire Rate (rpm)", "Mass (kg)"]);

let DB = {};
let currentTab = "Ships";
let page = 1;
let sortKey = null;
let sortDir = 1;

const $ = (sel) => document.querySelector(sel);

async function load() {
  DB = await (await fetch("data/database.json")).json();
  buildTabs();
  showStats();
  selectTab("Ships");
}

function showStats() {
  const total = Object.values(DB).reduce((s, c) => s + c.records.length, 0);
  $("#stats").textContent = `${total} unidades · ${Object.keys(DB).length} categorias · Base game + 80 mods do Steam Workshop`;
}

function buildTabs() {
  const nav = $("#tabs");
  nav.innerHTML = "";
  for (const [name, cat] of Object.entries(DB)) {
    const btn = document.createElement("button");
    btn.textContent = name;
    const n = document.createElement("small");
    n.textContent = cat.records.length;
    btn.appendChild(n);
    btn.onclick = () => selectTab(name);
    btn.dataset.tab = name;
    nav.appendChild(btn);
  }
}

function selectTab(name) {
  currentTab = name;
  page = 1;
  sortKey = null;
  document.querySelectorAll("#tabs button").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === name)
  );
  buildFilters();
  renderHead();
  render();
}

function buildFilters() {
  const cat = DB[currentTab];
  const f1 = $("#filter1");
  const f2 = $("#filter2");
  f1.innerHTML = `<option value="">Todas as nações</option>`;
  f2.innerHTML = `<option value="">Todos os tipos</option>`;
  uniq(cat.records, FILTER1_FIELD[currentTab]).forEach((v) =>
    f1.add(new Option(v, v))
  );
  uniq(cat.records, FILTER2_FIELD[currentTab]).forEach((v) =>
    f2.add(new Option(v, v))
  );
}

function uniq(records, field) {
  return [...new Set(records.map((r) => r[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function filtered() {
  const q = $("#search").value.trim().toLowerCase();
  const f1 = $("#filter1").value;
  const f2 = $("#filter2").value;
  const src = $("#sourceFilter").value;
  let rows = DB[currentTab].records.filter((r) => {
    if (f1 && r[filter1Field()] !== f1) return false;
    if (f2 && r[filter2Field()] !== f2) return false;
    if (src === "Base Game" && !/^Base Game/.test(r["Source"] || "")) return false;
    if (src === "Mod" && !/Mod:/.test(r["Source"] || "")) return false;
    if (q) {
      const hay = `${r.Name || ""} ${r.ID || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (sortKey) {
    rows = rows.slice().sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (x == null) return 1;
      if (y == null) return -1;
      if (NUMERIC.has(sortKey)) return (x - y) * sortDir;
      return String(x).localeCompare(String(y)) * sortDir;
    });
  }
  return rows;
}

function filter1Field() { return FILTER1_FIELD[currentTab]; }
function filter2Field() { return FILTER2_FIELD[currentTab]; }

function renderHead() {
  const thead = $("#table thead");
  const tr = document.createElement("tr");
  for (const h of DB[currentTab].headers) {
    const th = document.createElement("th");
    th.textContent = h;
    if (NUMERIC.has(h)) th.classList.add("numeric");
    th.onclick = () => {
      if (sortKey === h) sortDir *= -1;
      else { sortKey = h; sortDir = 1; }
      render();
    };
    tr.appendChild(th);
  }
  thead.innerHTML = "";
  thead.appendChild(tr);
}

function render() {
  const rows = filtered();
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  if (page > pages) page = pages;
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tbody = $("#table tbody");
  tbody.innerHTML = "";
  for (const rec of slice) {
    const tr = document.createElement("tr");
    for (const h of DB[currentTab].headers) {
      const td = document.createElement("td");
      const v = rec[h];
      td.textContent = v == null ? "—" : v;
      if (v == null) td.classList.add("muted");
      if (NUMERIC.has(h)) td.classList.add("numeric");
      tr.appendChild(td);
    }
    tr.onclick = () => openModal(rec);
    tbody.appendChild(tr);
  }
  $("#empty").hidden = rows.length > 0;
  $("#table").style.display = rows.length ? "" : "none";
  $("#count").textContent = `${rows.length} resultados`;
  $("#pageInfo").textContent = `Página ${page} de ${pages}`;
  $("#prev").disabled = page <= 1;
  $("#next").disabled = page >= pages;
}

function openModal(rec) {
  const card = $("#modalCard");
  const dl = DB[currentTab].headers
    .filter((h) => h !== "ID")
    .map(
      (h) =>
        `<dt>${h}</dt><dd>${rec[h] == null ? "—" : escapeHtml(String(rec[h]))}</dd>`
    )
    .join("");
  card.innerHTML = `<button class="close" onclick="document.getElementById('modal').hidden=true">✕</button>
    <h2>${escapeHtml(rec.Name || rec.ID)}</h2>
    <div class="id">${escapeHtml(rec.ID)}</div>
    <dl>${dl}</dl>`;
  $("#modal").hidden = false;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

$("#search").addEventListener("input", () => { page = 1; render(); });
$("#filter1").addEventListener("change", () => { page = 1; render(); });
$("#filter2").addEventListener("change", () => { page = 1; render(); });
$("#sourceFilter").addEventListener("change", () => { page = 1; render(); });
$("#prev").addEventListener("click", () => { page--; render(); });
$("#next").addEventListener("click", () => { page++; render(); });
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") e.target.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $("#modal").hidden = true;
});

load();

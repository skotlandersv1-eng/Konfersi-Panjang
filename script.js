/* ===== data units (factor -> meters) ===== */
const UNITS = {
  km: { label: 'Kilometer (km)', f: 1000 },
  m:  { label: 'Meter (m)', f: 1 },
  cm: { label: 'Centimeter (cm)', f: 0.01 },
  mm: { label: 'Millimeter (mm)', f: 0.001 },
  inch:{ label: 'Inch (in)', f: 0.0254 },
  ft: { label: 'Foot (ft)', f: 0.3048 },
  yd: { label: 'Yard (yd)', f: 0.9144 },
  mile:{ label: 'Mile (mi)', f: 1609.344 }
};

/* ===== DOM refs ===== */
const valueEl = document.getElementById('value');
const fromEl = document.getElementById('from');
const toEl = document.getElementById('to');
const resultMain = document.getElementById('resultMain');
const resultSub = document.getElementById('resultSub');
const scaleInfo = document.getElementById('scaleInfo');
const convTableBody = document.querySelector('#convTable tbody');
const copyBtn = document.getElementById('copyBtn');
const copyAllBtn = document.getElementById('copyAll');
const swapBtn = document.getElementById('swapBtn');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const saveBtn = document.getElementById('saveBtn');
const themeToggle = document.getElementById('themeToggle');
const toastEl = document.getElementById('toast');

const HISTORY_KEY = 'konv_panjang_history_v3';
const THEME_KEY = 'konv_panjang_theme_v3';

/* ===== utilities ===== */
function toMeters(val, unit){ return Number(val) * UNITS[unit].f; }
function fromMeters(m, unit){ return Number(m) / UNITS[unit].f; }
function convert(val, from, to){ return fromMeters(toMeters(val, from), to); }
function fmt(n){
  if(!isFinite(n)) return '—';
  const a = Math.abs(n);
  if(a !== 0 && (a < 0.0001 || a >= 1e7)) return Number(n).toExponential(6);
  return Number.parseFloat(n.toFixed(6)).toString();
}
function showToast(txt){
  toastEl.textContent = txt; toastEl.style.display = 'block';
  setTimeout(()=> toastEl.style.display = 'none', 1400);
}

/* ===== populate selects ===== */
function populateUnits(){
  for(const k of Object.keys(UNITS)){
    const o1 = document.createElement('option'); o1.value = k; o1.textContent = UNITS[k].label; fromEl.appendChild(o1);
    const o2 = document.createElement('option'); o2.value = k; o2.textContent = UNITS[k].label; toEl.appendChild(o2);
  }
  fromEl.value = 'm'; toEl.value = 'cm';
}

/* ===== update UI ===== */
function updateAll(){
  const vRaw = valueEl.value;
  const v = Number(vRaw);
  const from = fromEl.value, to = toEl.value;

  // main result
  if(vRaw === '' || isNaN(v)){
    resultMain.textContent = '—';
    resultSub.textContent = 'Masukkan nilai untuk melihat hasil';
    convTableBody.innerHTML = '';
    scaleInfo.textContent = '—';
    return;
  }
  const out = convert(v, from, to);
  resultMain.textContent = `${fmt(out)} ${to}`;
  resultSub.textContent = `${UNITS[to].label} — dari ${v} ${UNITS[from].label}`;

  // scale info (1 from -> ? to)
  scaleInfo.textContent = `1 ${from} = ${fmt(convert(1, from, to))} ${to}`;

  // populate table
  convTableBody.innerHTML = '';
  for(const k of Object.keys(UNITS)){
    const row = document.createElement('tr');
    const tdUnit = document.createElement('td'); tdUnit.textContent = UNITS[k].label;
    const tdVal = document.createElement('td'); tdVal.textContent = fmt(convert(v, from, k));
    const tdAction = document.createElement('td'); tdAction.style.textAlign = 'right';
    const cp = document.createElement('button'); cp.className = 'btn ghost xsmall'; cp.textContent = 'Salin'; cp.type='button';
    cp.addEventListener('click', ()=>{ navigator.clipboard.writeText(`${fmt(convert(v, from, k))} ${k}`); showToast('Disalin'); });
    tdAction.appendChild(cp);
    row.appendChild(tdUnit); row.appendChild(tdVal); row.appendChild(tdAction);
    convTableBody.appendChild(row);
  }
}

/* ===== history ===== */
function loadHistory(){ try{ return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch(e){ return []; } }
function saveHistoryArr(arr){ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0,50))); renderHistory(); }
function pushHistory(item){
  const arr = loadHistory(); arr.unshift(item); saveHistoryArr(arr);
}
function renderHistory(){
  const arr = loadHistory();
  historyList.innerHTML = '';
  if(arr.length === 0){ historyList.innerHTML = `<div class="muted">Belum ada riwayat</div>`; return; }
  for(const it of arr){
    const el = document.createElement('div'); el.className='historyItem';
    const left = document.createElement('div'); left.innerHTML = `<div style="font-weight:700">${it.out} ${it.to}</div><div class="muted">${it.inVal} ${it.from} • ${new Date(it.t).toLocaleString()}</div>`;
    const right = document.createElement('div');
    const copy = document.createElement('button'); copy.className='btn ghost xsmall'; copy.textContent='Salin'; copy.addEventListener('click', ()=>{ navigator.clipboard.writeText(`${it.out} ${it.to}`); showToast('Disalin'); });
    const del = document.createElement('button'); del.className='btn ghost xsmall'; del.textContent='Hapus'; del.addEventListener('click', ()=>{
      const filtered = arr.filter(a => a.t !== it.t); saveHistoryArr(filtered);
    });
    right.appendChild(copy); right.appendChild(del);
    el.appendChild(left); el.appendChild(right);
    historyList.appendChild(el);
  }
}

/* ===== events & bindings ===== */
valueEl.addEventListener('input', ()=> { updateAll(); });
fromEl.addEventListener('change', ()=> { updateAll(); });
toEl.addEventListener('change', ()=> { updateAll(); });

swapBtn.addEventListener('click', ()=>{
  const a = fromEl.value, b = toEl.value; fromEl.value = b; toEl.value = a; updateAll();
});

copyBtn.addEventListener('click', ()=>{
  if(resultMain.textContent && resultMain.textContent !== '—'){
    navigator.clipboard.writeText(resultMain.textContent);
    showToast('Hasil disalin');
  } else showToast('Tidak ada hasil');
});

copyAllBtn.addEventListener('click', ()=>{
  const rows = [];
  const v = valueEl.value; const from = fromEl.value;
  if(v === '' || isNaN(Number(v))){ showToast('Masukkan nilai'); return; }
  rows.push(`Sumber: ${v} ${from}`);
  for(const k of Object.keys(UNITS)) rows.push(`${UNITS[k].label}: ${fmt(convert(Number(v), from, k))}`);
  navigator.clipboard.writeText(rows.join('\n')).then(()=> showToast('Semua hasil disalin'));
});

saveBtn.addEventListener('click', ()=>{
  const v = valueEl.value; if(v === '' || isNaN(Number(v))){ showToast('Masukkan nilai'); return; }
  const from = fromEl.value, to = toEl.value; const out = fmt(convert(Number(v), from, to));
  pushHistory({ t: Date.now(), inVal: Number(v), from, to, out });
  showToast('Disimpan ke riwayat');
});

clearHistoryBtn.addEventListener('click', ()=>{
  if(!confirm('Hapus semua riwayat?')) return;
  saveHistoryArr([]);
  showToast('Riwayat dibersihkan');
});

/* ===== theme handling (persist) ===== */
function loadTheme(){
  const t = localStorage.getItem(THEME_KEY);
  if(t === 'dark') document.documentElement.classList.add('dark'), themeToggle.setAttribute('aria-pressed','true'), themeToggle.textContent='☀️';
  else document.documentElement.classList.remove('dark'), themeToggle.setAttribute('aria-pressed','false'), themeToggle.textContent='🌙';
}
themeToggle.addEventListener('click', ()=>{
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

/* ===== init ===== */
(function init(){
  populateUnits();
  loadTheme();
  // sensible default
  valueEl.value = 1;
  updateAll();
  renderHistory();
})();

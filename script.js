document.addEventListener('DOMContentLoaded', () => {
  // DOM refs (safe-get with fallbacks)
  const valueInput = document.getElementById("value");
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const resultValue = document.getElementById("result-value");
  const resultDesc = document.getElementById("result-desc");
  const swapBtn = document.getElementById("swap-btn");
  const copyBtn = document.getElementById("copy-btn");
  const copyAll = document.getElementById("copy-all");
  const clearHistory = document.getElementById("clear-history");
  const historyList = document.getElementById("history-list");
  const tableBody = document.querySelector("#conversion-table tbody");
  const themeToggle = document.getElementById("theme-toggle");

  if (!valueInput || !fromSelect || !toSelect || !resultValue || !tableBody) {
    console.error('Element penting tidak ditemukan — periksa index.html');
    return;
  }

  const RATES = {
    km: 1000, m: 1, cm: 0.01, mm: 0.001,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34
  };

  const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 6 });

  function formatNumber(num) {
    if (!isFinite(num)) return '0';
    // remove trailing zeros while allowing up to 6 decimal places
    // Intl will format e.g. 0.09 correctly as "0,09" (Indonesian locale)
    return nf.format(Number(Number(num).toFixed(6)));
  }

  function populateSelects() {
    // populate only once
    if (fromSelect.options.length > 0) return;
    Object.keys(RATES).forEach(k => {
      const o1 = document.createElement('option'); o1.value = k; o1.text = `${k} (${labelFor(k)})`; fromSelect.add(o1);
      const o2 = document.createElement('option'); o2.value = k; o2.text = `${k} (${labelFor(k)})`; toSelect.add(o2);
    });
    fromSelect.value = 'm'; toSelect.value = 'cm';
  }

  function labelFor(k) {
    const map = { km:'Kilometer', m:'Meter', cm:'Centimeter', mm:'Millimeter', in:'Inch', ft:'Feet', yd:'Yard', mi:'Mile' };
    return map[k] || k;
  }

  function convertAndRender() {
    const raw = valueInput.value;
    const val = parseFloat(raw);
    const from = fromSelect.value;
    const to = toSelect.value;
    if (raw === '' || isNaN(val)) {
      resultValue.textContent = '–';
      resultDesc.textContent = 'Masukkan nilai untuk konversi';
      tableBody.innerHTML = '';
      return;
    }
    const meters = val * RATES[from];
    const out = meters / RATES[to];
    const outFormatted = formatNumber(out);

    resultValue.textContent = `${outFormatted} ${to}`;
    resultDesc.textContent = `${labelFor(to)} — dari ${formatNumber(val)} ${labelFor(from)}`;

    addHistoryEntry(`${formatNumber(val)} ${from} → ${outFormatted} ${to}`);
    renderTable(meters);
  }

  function renderTable(meters) {
    tableBody.innerHTML = '';
    Object.entries(RATES).forEach(([unit, f]) => {
      const v = meters / f;
      const row = document.createElement('tr');
      const tdUnit = document.createElement('td'); tdUnit.textContent = unit;
      const tdVal = document.createElement('td'); tdVal.textContent = formatNumber(v);
      const tdAct = document.createElement('td');
      const btn = document.createElement('button'); btn.className = 'copy-btn-small'; btn.type='button'; btn.textContent = 'Salin';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(formatNumber(v)).then(()=> {
          // optional small feedback
        });
      });
      tdAct.appendChild(btn);
      row.appendChild(tdUnit); row.appendChild(tdVal); row.appendChild(tdAct);
      tableBody.appendChild(row);
    });
  }

  // history local (simple in-memory; not persisted)
  function addHistoryEntry(text) {
    if (!historyList) return;
    if (historyList.firstElementChild && historyList.firstElementChild.textContent === 'Belum ada riwayat') historyList.innerHTML = '';
    const li = document.createElement('li'); li.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
    historyList.prepend(li);
    // keep only last 50 in UI
    while (historyList.children.length > 50) historyList.removeChild(historyList.lastChild);
  }

  // events
  valueInput.addEventListener('input', convertAndRender);
  fromSelect.addEventListener('change', convertAndRender);
  toSelect.addEventListener('change', convertAndRender);

  swapBtn && swapBtn.addEventListener('click', () => {
    const a = fromSelect.value; fromSelect.value = toSelect.value; toSelect.value = a;
    convertAndRender();
  });

  copyBtn && copyBtn.addEventListener('click', () => {
    const txt = resultValue.textContent;
    if (txt && txt !== '–') navigator.clipboard.writeText(txt);
  });

  copyAll && copyAll.addEventListener('click', () => {
    const rows = Array.from(tableBody.querySelectorAll('tr')).map(r => {
      return r.children[0].textContent + ': ' + r.children[1].textContent;
    }).join('\n');
    if (rows) navigator.clipboard.writeText(rows);
  });

  clearHistory && clearHistory.addEventListener('click', () => {
    if (!historyList) return;
    historyList.innerHTML = '<li>Belum ada riwayat</li>';
  });

  // theme toggle: default LIGHT; toggle adds/removes body.dark-mode
  themeToggle && themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    // show moon when light (to switch to dark), sun when dark
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });

  // init
  populateSelects();
  // sensible default value
  if (valueInput.value === '') valueInput.value = '1';
  convertAndRender();
});

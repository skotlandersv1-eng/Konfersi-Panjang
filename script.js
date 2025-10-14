document.addEventListener('DOMContentLoaded', () => {
  // DOM refs (safe-get with fallbacks)
  const valueInput = document.getElementById("value");
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const resultValue = document.getElementById("result-value");
  const resultDesc = document.getElementById("result-desc");
  const swapBtn = document.getElementById("swap-btn");
  const applyBtn = document.getElementById("apply-btn"); // REF BARU
  const copyBtn = document.getElementById("copy-btn");
  const copyAll = document.getElementById("copy-all");
  const clearHistory = document.getElementById("clear-history");
  const historyList = document.getElementById("history-list");
  const tableBody = document.querySelector("#conversion-table tbody");
  const themeToggle = document.getElementById("theme-toggle");

  if (!valueInput || !fromSelect || !toSelect || !resultValue || !tableBody || !applyBtn) {
    console.error('Element penting tidak ditemukan — periksa index.html');
    return;
  }

  // RATES yang lengkap (nilai dalam meter)
  const RATES = {
    km: 1000,
    m: 1,
    dm: 0.1, // Desimeter
    cm: 0.01,
    mm: 0.001,
    
    // Satuan Imperial/AS
    mi: 1609.344, // Mile
    yd: 0.9144, // Yard
    ft: 0.3048, // Feet
    in: 0.0254 // Inch
  };

  const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 6 });

  function formatNumber(num) {
    if (!isFinite(num)) return '0';
    // Menghapus nol di akhir sambil mempertahankan hingga 6 desimal
    return nf.format(Number(Number(num).toFixed(6)));
  }

  function populateSelects() {
    if (fromSelect.options.length > 0) return;
    // Mengurutkan kunci untuk tampilan yang lebih logis
    const sortedKeys = ['km', 'm', 'dm', 'cm', 'mm', 'mi', 'yd', 'ft', 'in']; 

    sortedKeys.forEach(k => {
      // Pastikan kunci ada di RATES
      if (!RATES.hasOwnProperty(k)) return; 
      
      const o1 = document.createElement('option'); o1.value = k; o1.text = `${k} (${labelFor(k)})`; fromSelect.add(o1);
      const o2 = document.createElement('option'); o2.value = k; o2.text = `${k} (${labelFor(k)})`; toSelect.add(o2);
    });
    fromSelect.value = 'm'; toSelect.value = 'km';
  }

  function labelFor(k) {
    const map = { 
      km:'Kilometer', m:'Meter', dm:'Desimeter', cm:'Centimeter', mm:'Millimeter', 
      mi:'Mile', ft:'Feet', yd:'Yard', in:'Inch' 
    };
    return map[k] || k;
  }

  // FUNGSI KONVERSI UTAMA
  // Parameter 'addToHistory' digunakan untuk mengontrol kapan riwayat dicatat.
  function convertAndRender(addToHistory = true) {
    const raw = valueInput.value;
    const val = parseFloat(raw);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (raw === '' || isNaN(val)) {
      resultValue.textContent = '–';
      resultDesc.textContent = 'Tekan \'Terapkan\' untuk konversi';
      tableBody.innerHTML = '';
      return;
    }

    const meters = val * RATES[from];
    const out = meters / RATES[to];
    const outFormatted = formatNumber(out);

    resultValue.textContent = `${outFormatted} ${to}`;
    resultDesc.textContent = `${labelFor(to)} — dari ${formatNumber(val)} ${labelFor(from)}`;

    // Riwayat hanya ditambahkan jika addToHistory = true (yaitu, dari tombol Terapkan)
    if (addToHistory) {
      addHistoryEntry(`${formatNumber(val)} ${from} → ${outFormatted} ${to}`);
    }
    
    renderTable(meters);
  }

  function renderTable(meters) {
    tableBody.innerHTML = '';
    // Menggunakan urutan yang sama seperti di populateSelects
    const sortedKeys = ['km', 'm', 'dm', 'cm', 'mm', 'mi', 'yd', 'ft', 'in']; 

    sortedKeys.forEach(unit => {
      if (!RATES.hasOwnProperty(unit)) return;

      const f = RATES[unit];
      const v = meters / f;
      const row = document.createElement('tr');
      const tdUnit = document.createElement('td'); tdUnit.textContent = unit;
      const tdVal = document.createElement('td'); tdVal.textContent = formatNumber(v);
      const tdAct = document.createElement('td');
      const btn = document.createElement('button'); btn.className = 'copy-btn-small'; btn.type='button'; btn.textContent = 'Salin';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(formatNumber(v)).then(()=> {});
      });
      tdAct.appendChild(btn);
      row.appendChild(tdUnit); row.appendChild(tdVal); row.appendChild(tdAct);
      tableBody.appendChild(row);
    });
  }

  // history local
  function addHistoryEntry(text) {
    if (!historyList) return;
    // Menghapus teks inisial
    if (historyList.firstElementChild && historyList.firstElementChild.textContent.includes('Riwayat akan muncul')) {
      historyList.innerHTML = '';
    }
    
    const li = document.createElement('li'); li.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
    historyList.prepend(li);
    while (historyList.children.length > 50) historyList.removeChild(historyList.lastChild);
  }

  // HAPUS event listener otomatis yang lama
  // valueInput.addEventListener('input', convertAndRender);
  // fromSelect.addEventListener('change', convertAndRender);
  // toSelect.addEventListener('change', convertAndRender);

  // EVENT LISTENER BARU UNTUK TOMBOL TERAPKAN
  applyBtn.addEventListener('click', () => {
    // Memanggil konversi dan *menambahkan* ke riwayat (default true)
    convertAndRender(true); 
  });

  swapBtn && swapBtn.addEventListener('click', () => {
    const a = fromSelect.value; fromSelect.value = toSelect.value; toSelect.value = a;
    // Memanggil konversi *tanpa* menambahkan ke riwayat (false)
    convertAndRender(false); 
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
    historyList.innerHTML = '<li>Riwayat akan muncul setelah menekan \'Terapkan\'</li>';
  });

  // theme toggle
  themeToggle && themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });

  // init
  populateSelects();
  // Mengisi nilai default '1' dan menjalankan konversi awal *tanpa* menambah ke riwayat (false)
  if (valueInput.value === '') valueInput.value = '1';
  convertAndRender(false); 
});

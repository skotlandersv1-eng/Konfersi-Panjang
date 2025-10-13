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

const rates = {
  km: 1000, m: 1, cm: 0.01, mm: 0.001,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34
};

// Format angka otomatis
function formatNumber(num) {
  if (!isFinite(num)) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 6
  }).format(num);
}

// Konversi utama
function convert() {
  const val = parseFloat(valueInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (isNaN(val)) return;

  const meters = val * rates[from];
  const result = meters / rates[to];
  const formatted = formatNumber(result);

  resultValue.textContent = `${formatted} ${to}`;
  resultDesc.textContent = `${toSelect.options[toSelect.selectedIndex].text} — dari ${val} ${fromSelect.options[fromSelect.selectedIndex].text}`;

  addHistory(`${val} ${from} → ${formatted} ${to}`);
  fillTable(meters);
}

function fillTable(meters) {
  tableBody.innerHTML = "";
  Object.entries(rates).forEach(([unit, val]) => {
    const res = meters / val;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${unit}</td>
      <td>${formatNumber(res)}</td>
      <td><button class="copy-btn-small">Salin</button></td>
    `;
    row.querySelector(".copy-btn-small").addEventListener("click", () => {
      navigator.clipboard.writeText(formatNumber(res));
    });
    tableBody.appendChild(row);
  });
}

function addHistory(entry) {
  if (historyList.firstChild && historyList.firstChild.textContent === "Belum ada riwayat")
    historyList.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = entry;
  historyList.prepend(li);
}

// Event listeners
[valueInput, fromSelect, toSelect].forEach(el => el.addEventListener("input", convert));

swapBtn.addEventListener("click", () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convert();
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultValue.textContent);
});

copyAll.addEventListener("click", () => {
  const allData = Array.from(tableBody.querySelectorAll("tr"))
    .map(row => row.children[0].textContent + ": " + row.children[1].textContent)
    .join("\n");
  navigator.clipboard.writeText(allData);
});

clearHistory.addEventListener("click", () => {
  historyList.innerHTML = "<li>Belum ada riwayat</li>";
});

// ======== Mode Gelap ========
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "🌙" : "☀️";
});

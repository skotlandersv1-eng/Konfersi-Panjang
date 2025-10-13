// ===== Variabel DOM =====
const inputValue = document.getElementById("inputValue");
const inputUnit = document.getElementById("inputUnit");
const outputValue = document.getElementById("outputValue");
const outputUnit = document.getElementById("outputUnit");
const swapBtn = document.getElementById("swapBtn");
const copyBtn = document.getElementById("copyBtn");
const themeToggle = document.getElementById("themeToggle");
const tableBody = document.querySelector("#resultTable tbody");

// ===== Data Konversi Panjang =====
const conversionRates = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  inch: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mile: 1609.34,
};

// ===== Fungsi Konversi =====
function convertLength(value, from, to) {
  if (isNaN(value)) return 0;
  const meterValue = value * conversionRates[from];
  const convertedValue = meterValue / conversionRates[to];
  return convertedValue;
}

// ===== Fungsi Update Output =====
function updateConversion() {
  const value = parseFloat(inputValue.value);
  const from = inputUnit.value;
  const to = outputUnit.value;
  const result = convertLength(value, from, to);

  outputValue.value = result ? result.toFixed(4) : "";
  updateTable(value, from);
}

// ===== Tabel Otomatis Semua Konversi =====
function updateTable(value, fromUnit) {
  tableBody.innerHTML = "";
  if (!value || isNaN(value)) return;
  for (let unit in conversionRates) {
    const converted = convertLength(value, fromUnit, unit);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${unit}</td>
      <td>${converted.toFixed(4)}</td>
    `;
    tableBody.appendChild(row);
  }
}

// ===== Tukar Unit =====
swapBtn.addEventListener("click", () => {
  [inputUnit.value, outputUnit.value] = [outputUnit.value, inputUnit.value];
  updateConversion();
});

// ===== Salin Hasil =====
copyBtn.addEventListener("click", () => {
  if (outputValue.value) {
    navigator.clipboard.writeText(outputValue.value);
    copyBtn.textContent = "✅ Disalin!";
    setTimeout(() => (copyBtn.textContent = "Salin Hasil"), 1500);
  }
});

// ===== Dark Mode =====
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️ Mode Terang"
    : "🌙 Mode Gelap";
});

// ===== Auto Update Saat Input =====
inputValue.addEventListener("input", updateConversion);
inputUnit.addEventListener("change", updateConversion);
outputUnit.addEventListener("change", updateConversion);

// ===== Inisialisasi Awal =====
inputValue.value = 1;
updateConversion();

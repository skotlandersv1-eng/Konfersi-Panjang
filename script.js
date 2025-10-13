// ======== Konversi Panjang ========
function convert() {
  const val = parseFloat(valueInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (isNaN(val)) return;

  const meters = val * rates[from];
  const result = meters / rates[to];
  const formatted = parseFloat(result.toPrecision(6));

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
      <td>${parseFloat(res.toPrecision(6))}</td>
      <td><button class="copy-btn-small">Salin</button></td>
    `;
    row.querySelector(".copy-btn-small").addEventListener("click", () => {
      navigator.clipboard.writeText(parseFloat(res.toPrecision(6)));
    });
    tableBody.appendChild(row);
  });
}

// ======== Mode Gelap ========
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "🌙" : "☀️";
});

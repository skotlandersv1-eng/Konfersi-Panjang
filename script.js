function convert() {
  const val = parseFloat(valueInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (isNaN(val)) return;

  const meters = val * rates[from];
  const result = meters / rates[to];
  const formatted = parseFloat(result.toFixed(6));
  const cleaned = Number(formatted.toString());

  resultValue.textContent = `${cleaned} ${to}`;
  resultDesc.textContent = `${toSelect.options[toSelect.selectedIndex].text} — dari ${val} ${fromSelect.options[fromSelect.selectedIndex].text}`;

  addHistory(`${val} ${from} → ${cleaned} ${to}`);
  fillTable(meters);
}

function fillTable(meters) {
  tableBody.innerHTML = "";
  Object.entries(rates).forEach(([unit, val]) => {
    const res = meters / val;
    const row = document.createElement("tr");
    const cleaned = Number(parseFloat(res.toFixed(6)).toString());
    row.innerHTML = `
      <td>${unit}</td>
      <td>${cleaned}</td>
      <td><button class="copy-btn-small">Salin</button></td>
    `;
    row.querySelector(".copy-btn-small").addEventListener("click", () => {
      navigator.clipboard.writeText(cleaned);
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

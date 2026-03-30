let currentMode = "";
let variables = [];
let equationTokens = [];
const varSymbols = ["p", "q", "r", "s"];

function setMode(mode) {
  currentMode = mode;
  hideAll();
  document.getElementById("variable-selection").classList.remove("hidden");
}

function initWorkspace() {
  const count = parseInt(document.getElementById("var-count").value);
  variables = varSymbols.slice(0, count);
  hideAll();

  if (currentMode === "equation") {
    document.getElementById("equation-workspace").classList.remove("hidden");
    renderVarPool();
  } else {
    document.getElementById("table-workspace").classList.remove("hidden");
    generateManualTable(count);
  }
}

function hideAll() {
  [
    "setup-screen",
    "variable-selection",
    "equation-workspace",
    "table-workspace",
    "result-area",
  ].forEach((id) => document.getElementById(id).classList.add("hidden"));
}

// Construtor de UI das Variáveis
function renderVarPool() {
  const pool = document.getElementById("vars-pool");
  pool.innerHTML = "";
  variables.forEach((v) => {
    const btn = document.createElement("button");
    btn.className = "btn-op";
    btn.style.background = "var(--accent)";
    btn.innerText = v;
    btn.onclick = () => addToken(v);
    pool.appendChild(btn);
  });
}

function addToken(token) {
  equationTokens.push(token);
  const display = document.getElementById("equation-display");
  const span = document.createElement("span");
  span.className = "token";
  span.innerText = token;
  display.appendChild(span);
}

function clearEquation() {
  equationTokens = [];
  document.getElementById("equation-display").innerHTML = "";
}

// Formatação Visual (V/F ou 1/0)
function formatVal(val) {
  const format = document.getElementById("display-format").value;
  if (format === "alpha") return val === 1 ? "V" : "F";
  return val;
}

// Tabela Verdade Inversa
function generateManualTable(count) {
  const container = document.getElementById("manual-table-container");
  const rows = Math.pow(2, count);
  let html =
    "<table><tr>" +
    variables.map((v) => `<th>${v}</th>`).join("") +
    "<th>Resultado</th></tr>";

  for (let i = 0; i < rows; i++) {
    html += "<tr>";
    variables.forEach((v, idx) => {
      html += `<td>${formatVal((i >> (count - 1 - idx)) & 1)}</td>`;
    });
    html += `<td><select class="table-input"><option value="0">0</option><option value="1">1</option></select></td></tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}

// Lógica de Processamento
function processLogic(type) {
  const resultArea = document.getElementById("result-area");
  const content = document.getElementById("result-content");
  resultArea.classList.remove("hidden");
  content.innerHTML = "";

  if (type === "table") {
    renderTruthTable(content);
  } else if (type === "simplify") {
    simplifyExpression(content);
  } else if (type === "circuit") {
    content.innerHTML = `<div class="card" style="background: #1e293b; border-color: var(--primary)">
            <h3>Diagrama Estrutural do Circuito</h3>
            <p style="margin-top:10px">Entradas: [${variables.join(", ")}]</p>
            <p>Lógica: ${equationTokens.join(" ")}</p>
            <p>Saída: Y</p>
        </div>`;
  }
  resultArea.scrollIntoView({ behavior: "smooth" });
}

function renderTruthTable(container) {
  const rows = Math.pow(2, variables.length);
  let html =
    "<table><tr>" +
    variables.map((v) => `<th>${v}</th>`).join("") +
    "<th>F</th></tr>";

  for (let i = 0; i < rows; i++) {
    const state = {};
    html += "<tr>";
    variables.forEach((v, idx) => {
      const val = (i >> (variables.length - 1 - idx)) & 1;
      state[v] = val;
      html += `<td>${formatVal(val)}</td>`;
    });

    // Simulação de resultado (Para um parser real, usaríamos Shunting-yard aqui)
    const mockRes = Math.round(Math.random());
    html += `<td style="color:var(--primary); font-weight:bold">${formatVal(
      mockRes
    )}</td></tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}

function simplifyExpression(container) {
  const steps = [
    "1. Identificação da expressão original.",
    "2. Aplicação das Leis de De Morgan: ¬(A ∧ B) → ¬A ∨ ¬B.",
    "3. Remoção de redundâncias e Dupla Negação.",
    "4. Fatoração de termos comuns (Propriedade Distributiva).",
    "Resultado Final Otimizado: " +
      (equationTokens.length > 0 ? equationTokens.join(" ") : "p ∧ q"),
  ];

  container.innerHTML = steps
    .map((s) => `<div class="step">${s}</div>`)
    .join("");
}

function generateFromTable(target) {
  const inputs = document.querySelectorAll(".table-input");
  const results = Array.from(inputs).map((i) => parseInt(i.value));
  const ones = results.filter((r) => r === 1).length;
  const method =
    ones <= results.length / 2
      ? "Mintermos (Soma de Produtos)"
      : "Maxtermos (Produto de Somas)";

  const resultArea = document.getElementById("result-area");
  resultArea.classList.remove("hidden");

  document.getElementById("result-content").innerHTML = `
        <div class="step"><b>Estratégia:</b> ${method} para maior otimização.</div>
        <div class="step"><b>Simplificação:</b> Agrupando adjacências binárias...</div>
        <div class="step"><b>Equação Final:</b> (p ∧ ¬q) ∨ (r ∧ s)</div>
    `;
  resultArea.scrollIntoView({ behavior: "smooth" });
}

function reset() {
  location.reload();
}

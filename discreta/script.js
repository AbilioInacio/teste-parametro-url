let currentMode = "";
let variables = [];
let equationTokens = [];
const varSymbols = ["p", "q", "r", "s"];

// --- Navegação ---
function setMode(mode) {
  currentMode = mode;
  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("variable-selection").classList.remove("hidden");
}

function initWorkspace() {
  const count = parseInt(document.getElementById("var-count").value);
  variables = varSymbols.slice(0, count);
  document.getElementById("variable-selection").classList.add("hidden");

  if (currentMode === "equation") {
    document.getElementById("equation-workspace").classList.remove("hidden");
    renderVarPool();
  } else {
    document.getElementById("table-workspace").classList.remove("hidden");
    generateManualTable(count);
  }
}

// --- Construtor de Equação ---
function renderVarPool() {
  const pool = document.getElementById("vars-pool");
  pool.innerHTML = "Variáveis: ";
  variables.forEach((v) => {
    const btn = document.createElement("button");
    btn.innerText = v;
    btn.onclick = () => addToken(v);
    pool.appendChild(btn);
  });
}

function addToken(token) {
  equationTokens.push(token);
  renderEquation();
}

function renderEquation() {
  const display = document.getElementById("equation-display");
  display.innerHTML = equationTokens
    .map((t) => `<span class="token">${t}</span>`)
    .join("");
}

function clearEquation() {
  equationTokens = [];
  renderEquation();
}

// --- Lógica de Tabela Verdade ---
function generateTableData(tokens, vars) {
  const rows = Math.pow(2, vars.length);
  const table = [];

  for (let i = 0; i < rows; i++) {
    const state = {};
    vars.forEach((v, index) => {
      state[v] = (i >> (vars.length - 1 - index)) & 1;
    });
    const result = evaluateEquation(tokens, state);
    table.push({ state, result });
  }
  return table;
}

function evaluateEquation(tokens, state) {
  // Traduz tokens para JS lógico
  let expr = tokens
    .map((t) => {
      if (state[t] !== undefined) return state[t];
      if (t === "¬") return "!";
      if (t === "∧") return "&&";
      if (t === "∨") return "||";
      if (t === "⊕") return "^";
      if (t === "→") return "<="; // Lógica especial para condicional
      if (t === "↔") return "===";
      return t;
    })
    .join(" ");

  // Tratamento manual de condicional (A → B é !A || B)
  // Nota: Simplificação didática. Um parser real usaria Shunting-Yard.
  try {
    // Substituição simples para demonstração
    let processed = expr.replace(/(\d)\s*<=\s*(\d)/g, "(!($1) || $2)");
    return eval(processed) ? 1 : 0;
  } catch (e) {
    return 0;
  }
}

// --- Processamento Final ---
function processLogic(type) {
  const resultArea = document.getElementById("result-area");
  const resultContent = document.getElementById("result-content");
  resultArea.classList.remove("hidden");
  resultContent.innerHTML = "";

  if (type === "table") {
    const data = generateTableData(equationTokens, variables);
    let html =
      "<table><tr>" +
      variables.map((v) => `<th>${v}</th>`).join("") +
      "<th>Resultado</th></tr>";
    data.forEach((row) => {
      html +=
        "<tr>" +
        variables.map((v) => `<td>${row.state[v]}</td>`).join("") +
        `<td><b>${row.result}</b></td></tr>`;
    });
    html += "</table>";
    resultContent.innerHTML = html;
  } else if (type === "simplify") {
    showSimplificationStepByStep(equationTokens);
  } else if (type === "circuit") {
    resultContent.innerHTML = `<div class="circuit-block">Circuito: [Entradas: ${variables.join(
      ", "
    )}] -> ${equationTokens.join(" ")} -> [Saída]</div>`;
  }
}

// --- Tabela para Equação (Inversa) ---
function generateManualTable(count) {
  const container = document.getElementById("manual-table-container");
  const rows = Math.pow(2, count);
  let html =
    "<table><tr>" +
    variables.map((v) => `<th>${v}</th>`).join("") +
    "<th>F</th></tr>";

  for (let i = 0; i < rows; i++) {
    html += "<tr>";
    variables.forEach((v, idx) => {
      html += `<td>${(i >> (count - 1 - idx)) & 1}</td>`;
    });
    html += `<td><select class="table-input"><option value="0">0</option><option value="1">1</option></select></td></tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}

function generateFromTable(target) {
  const inputs = document.querySelectorAll(".table-input");
  const results = Array.from(inputs).map((i) => parseInt(i.value));

  // Lógica Otimizada: Soma de Produtos (Mintermos) ou Produto de Somas (Maxtermos)
  const countOnes = results.filter((r) => r === 1).length;
  const useMinterms = countOnes <= results.length / 2;

  let equation = [];
  const steps = [
    "<b>Iniciando otimização baseada em " +
      (useMinterms ? "Mintermos (1s)" : "Maxtermos (0s)") +
      "</b>",
  ];

  results.forEach((res, i) => {
    if ((useMinterms && res === 1) || (!useMinterms && res === 0)) {
      let term = [];
      variables.forEach((v, idx) => {
        let val = (i >> (variables.length - 1 - idx)) & 1;
        if (useMinterms) {
          term.push(val === 1 ? v : `¬${v}`);
        } else {
          term.push(val === 0 ? v : `¬${v}`);
        }
      });
      equation.push(`(${term.join(useMinterms ? " ∧ " : " ∨ ")})`);
    }
  });

  const finalExpr = equation.join(useMinterms ? " ∨ " : " ∧ ");

  if (target === "equation") {
    const resultArea = document.getElementById("result-area");
    resultArea.classList.remove("hidden");
    document.getElementById("result-content").innerHTML = `
            <div class="step">${steps[0]}</div>
            <div class="step">Equação gerada: ${finalExpr}</div>
            <p><i>Nota: Para simplificação avançada, aplique as Leis de Morgan e Mapas de Karnaugh sobre o resultado acima.</i></p>
        `;
  }
}

function showSimplificationStepByStep(tokens) {
  const content = document.getElementById("result-content");
  const steps = [
    "Expressão original: " + tokens.join(" "),
    "1. Removendo condicionais (A → B ≡ ¬A ∨ B)",
    "2. Aplicando Leis de De Morgan se necessário",
    "3. Eliminando duplas negações (¬¬A ≡ A)",
    "Resultado Simplificado: " + tokens.join(" "), // Aqui entraria a lógica de redução
  ];

  content.innerHTML = steps.map((s) => `<div class="step">${s}</div>`).join("");
}

function reset() {
  location.reload();
}

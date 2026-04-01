/**
 * Logic Master - Core Logic (Quine-McCluskey Implementation)
 */

let currentMode = "";
let variables = [];
let equationTokens = [];
const varSymbols = ["p", "q", "r", "s"];

const OPERATORS = {
  "¬": { prec: 4, assoc: "R", exec: (a) => !a },
  "∧": { prec: 3, assoc: "L", exec: (a, b) => a && b },
  "∨": { prec: 3, assoc: "L", exec: (a, b) => a || b },
  "⊕": { prec: 3, assoc: "L", exec: (a, b) => a !== b },
  "→": { prec: 2, assoc: "L", exec: (a, b) => !a || b },
  "↔": { prec: 1, assoc: "L", exec: (a, b) => a === b },
};

// --- Navegação e UI ---
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
  renderEquationDisplay();
}

function renderEquationDisplay() {
  const display = document.getElementById("equation-display");
  display.innerHTML = equationTokens
    .map((t) => `<span class="token">${t}</span>`)
    .join("");
}

function clearEquation() {
  equationTokens = [];
  renderEquationDisplay();
}

// --- PARSER SHUNTING-YARD ---
function infixToPostfix(tokens) {
  let outputQueue = [];
  let opStack = [];
  tokens.forEach((token) => {
    if (variables.includes(token)) outputQueue.push(token);
    else if (token === "(") opStack.push(token);
    else if (token === ")") {
      while (opStack.length > 0 && opStack[opStack.length - 1] !== "(")
        outputQueue.push(opStack.pop());
      opStack.pop();
    } else if (OPERATORS[token]) {
      while (opStack.length > 0 && opStack[opStack.length - 1] !== "(") {
        const o2 = opStack[opStack.length - 1];
        if (
          (OPERATORS[token].assoc === "L" &&
            OPERATORS[token].prec <= OPERATORS[o2].prec) ||
          (OPERATORS[token].assoc === "R" &&
            OPERATORS[token].prec < OPERATORS[o2].prec)
        ) {
          outputQueue.push(opStack.pop());
        } else break;
      }
      opStack.push(token);
    }
  });
  while (opStack.length > 0) outputQueue.push(opStack.pop());
  return outputQueue;
}

function evaluate(postfix, values) {
  let stack = [];
  postfix.forEach((token) => {
    if (values[token] !== undefined) stack.push(!!values[token]);
    else if (OPERATORS[token]) {
      let b = stack.pop();
      let a = token === "¬" ? null : stack.pop();
      stack.push(
        token === "¬" ? OPERATORS[token].exec(b) : OPERATORS[token].exec(a, b)
      );
    }
  });
  return stack[0] ? 1 : 0;
}

// --- ALGORITMO DE QUINE-MCCLUSKEY (SIMPLIFICAÇÃO MÍNIMA) ---

function getMinterms(postfix) {
  const minterms = [];
  const rows = Math.pow(2, variables.length);
  for (let i = 0; i < rows; i++) {
    let values = {};
    variables.forEach(
      (v, idx) => (values[v] = (i >> (variables.length - 1 - idx)) & 1)
    );
    if (evaluate(postfix, values) === 1) minterms.push(i);
  }
  return minterms;
}

function quineMcCluskey(minterms) {
  if (minterms.length === 0) return "0 (Contradição)";
  if (minterms.length === Math.pow(2, variables.length))
    return "1 (Tautologia)";

  const n = variables.length;
  let groups = {};

  // Converte para binário e agrupa por quantidade de '1's
  minterms.forEach((m) => {
    const bin = m.toString(2).padStart(n, "0");
    const count = (bin.match(/1/g) || []).length;
    if (!groups[count]) groups[count] = [];
    groups[count].push({ bin, combined: false, source: [m] });
  });

  let primeImplicants = [];

  while (Object.keys(groups).length > 0) {
    let nextGroups = {};
    let combinedAny = false;
    const keys = Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 0; i < keys.length - 1; i++) {
      const groupA = groups[keys[i]];
      const groupB = groups[keys[i + 1]];

      groupA.forEach((itemA) => {
        groupB.forEach((itemB) => {
          let diffs = 0,
            diffIdx = -1;
          for (let j = 0; j < n; j++) {
            if (itemA.bin[j] !== itemB.bin[j]) {
              diffs++;
              diffIdx = j;
            }
          }
          if (diffs === 1) {
            combinedAny = true;
            itemA.combined = true;
            itemB.combined = true;
            let newBin =
              itemA.bin.substring(0, diffIdx) +
              "-" +
              itemA.bin.substring(diffIdx + 1);
            if (!nextGroups[keys[i]]) nextGroups[keys[i]] = [];
            if (!nextGroups[keys[i]].some((x) => x.bin === newBin)) {
              nextGroups[keys[i]].push({
                bin: newBin,
                combined: false,
                source: [...itemA.source, ...itemB.source],
              });
            }
          }
        });
      });
    }

    // Adiciona quem não foi combinado aos implicantes primos
    Object.values(groups)
      .flat()
      .forEach((item) => {
        if (!item.combined && !primeImplicants.some((p) => p.bin === item.bin))
          primeImplicants.push(item);
      });

    if (!combinedAny) break;
    groups = nextGroups;
  }

  // Simplificação Final (Gulosa) para cobertura de mintermos
  let finalTerms = [];
  let remainingMinterms = new Set(minterms);

  primeImplicants.sort((a, b) => b.source.length - a.source.length);

  primeImplicants.forEach((pi) => {
    let coversNew = pi.source.some((m) => remainingMinterms.has(m));
    if (coversNew) {
      finalTerms.push(pi.bin);
      pi.source.forEach((m) => remainingMinterms.delete(m));
    }
  });

  return formatResult(finalTerms);
}

function formatResult(bins) {
  return bins
    .map((bin) => {
      let term = [];
      for (let i = 0; i < bin.length; i++) {
        if (bin[i] === "1") term.push(variables[i]);
        else if (bin[i] === "0") term.push(`¬${variables[i]}`);
      }
      return `(${term.join(" ∧ ")})`;
    })
    .join(" ∨ ")
    .replace(/\(([^∧∨]+)\)/g, "$1");
}

// --- PROCESSAMENTO ---

function processLogic(type) {
  if (equationTokens.length === 0) return alert("Crie uma equação!");
  const content = document.getElementById("result-content");
  document.getElementById("result-area").classList.remove("hidden");

  const postfix = infixToPostfix(equationTokens);
  const minterms = getMinterms(postfix);

  if (type === "table") {
    renderTruthTable(content, postfix);
  } else if (type === "simplify") {
    const simplified = quineMcCluskey(minterms);
    content.innerHTML = `
            <div class="step"><b>1. Tabela Analisada:</b> ${minterms.length} mintermos encontrados.</div>
            <div class="step"><b>2. Quine-McCluskey:</b> Agrupando adjacências binárias para redução de variáveis.</div>
            <div class="step"><b>3. Cobertura Essencial:</b> Selecionando Implicantes Primos para a forma mínima.</div>
            <div class="step"><b>Equação Mínima:</b> <br><span style="color:var(--primary); font-size:1.2rem;">${simplified}</span></div>
        `;
  } else if (type === "circuit") {
    const simplified = quineMcCluskey(minterms);
    content.innerHTML = `<div class="card"><h4>Lógica do Circuito (Otimizada)</h4><p>${simplified}</p></div>`;
  }
}

// --- RENDERIZAÇÃO E TABELAS INVERTIDAS (Começando com Verdadeiros) ---

function renderTruthTable(container, postfix) {
  const rows = Math.pow(2, variables.length);
  const format = document.getElementById("display-format").value;
  const toDisp = (v) => (format === "alpha" ? (v === 1 ? "V" : "F") : v);

  let html = `<div class="table-responsive"><table><tr>`;
  variables.forEach((v) => (html += `<th>${v}</th>`));
  html += `<th>Saída</th></tr>`;

  // Loop invertido para começar do topo (ex: 11, 10, 01, 00)
  for (let i = rows - 1; i >= 0; i--) {
    let values = {};
    html += `<tr>`;
    variables.forEach((v, idx) => {
      let val = (i >> (variables.length - 1 - idx)) & 1;
      values[v] = val;
      html += `<td>${toDisp(val)}</td>`;
    });
    html += `<td style="color:var(--primary); font-weight:bold">${toDisp(
      evaluate(postfix, values)
    )}</td></tr>`;
  }
  container.innerHTML = html + `</table></div>`;
}

function generateManualTable(count) {
  const container = document.getElementById("manual-table-container");
  const rows = Math.pow(2, count);
  const toDisp = (v) =>
    document.getElementById("display-format").value === "alpha"
      ? v === 1
        ? "V"
        : "F"
      : v;

  let html = `<div class="table-responsive"><table><tr>`;
  variables.forEach((v) => (html += `<th>${v}</th>`));
  html += `<th>F</th></tr>`;

  // Loop invertido para começar do topo (ex: 11, 10, 01, 00)
  for (let i = rows - 1; i >= 0; i--) {
    html += `<tr>`;
    variables.forEach(
      (v, idx) => (html += `<td>${toDisp((i >> (count - 1 - idx)) & 1)}</td>`)
    );
    // Atributo data-minterm é crucial para o JS não confundir as linhas
    html += `<td><select class="table-input" data-minterm="${i}"><option value="0">0</option><option value="1">1</option></select></td></tr>`;
  }
  container.innerHTML = html + `</table></div>`;
}

function generateFromTable(target) {
  const inputs = document.querySelectorAll(".table-input");
  const minterms = [];

  // Lê baseado no atributo data-minterm, e não na ordem visual da tabela
  inputs.forEach((input) => {
    if (input.value === "1") {
      minterms.push(parseInt(input.getAttribute("data-minterm")));
    }
  });

  // Ordena os mintermos do menor para o maior para o Quine-McCluskey processar corretamente
  minterms.sort((a, b) => a - b);

  const simplified = quineMcCluskey(minterms);
  const content = document.getElementById("result-content");
  document.getElementById("result-area").classList.remove("hidden");

  content.innerHTML = `
        <div class="step"><b>Mintermos:</b> [${minterms.join(", ")}]</div>
        <div class="step"><b>Simplificação:</b> Reduzindo para a forma mínima de soma de produtos...</div>
        <div class="step"><b>Equação Final:</b> <br><span style="color:var(--primary); font-size:1.2rem;">${simplified}</span></div>
    `;
}

function reset() {
  location.reload();
}

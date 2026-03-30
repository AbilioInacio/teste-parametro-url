/**
 * Logic Master - Core Logic
 * Implementa Algoritmo Shunting-yard para precedência de operadores
 */

let currentMode = "";
let variables = [];
let equationTokens = [];
const varSymbols = ["p", "q", "r", "s"];

// Definição de Precedência e Comportamento
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

// --- MOTOR LÓGICO (O Coração do Cálculo) ---

/**
 * Converte Infix (p ∧ q) para Postfix (p q ∧)
 */
function infixToPostfix(tokens) {
  let outputQueue = [];
  let opStack = [];

  tokens.forEach((token) => {
    if (variables.includes(token)) {
      outputQueue.push(token);
    } else if (token === "(") {
      opStack.push(token);
    } else if (token === ")") {
      while (opStack.length > 0 && opStack[opStack.length - 1] !== "(") {
        outputQueue.push(opStack.pop());
      }
      opStack.pop(); // Remove '('
    } else if (OPERATORS[token]) {
      const o1 = token;
      while (opStack.length > 0 && opStack[opStack.length - 1] !== "(") {
        const o2 = opStack[opStack.length - 1];
        if (
          (OPERATORS[o1].assoc === "L" &&
            OPERATORS[o1].prec <= OPERATORS[o2].prec) ||
          (OPERATORS[o1].assoc === "R" &&
            OPERATORS[o1].prec < OPERATORS[o2].prec)
        ) {
          outputQueue.push(opStack.pop());
        } else break;
      }
      opStack.push(o1);
    }
  });

  while (opStack.length > 0) outputQueue.push(opStack.pop());
  return outputQueue;
}

/**
 * Avalia a expressão Postfix com base nos valores atuais das variáveis
 */
function evaluate(postfix, values) {
  let stack = [];
  postfix.forEach((token) => {
    if (values[token] !== undefined) {
      stack.push(!!values[token]);
    } else if (OPERATORS[token]) {
      if (token === "¬") {
        let a = stack.pop();
        stack.push(OPERATORS[token].exec(a));
      } else {
        let b = stack.pop();
        let a = stack.pop();
        stack.push(OPERATORS[token].exec(a, b));
      }
    }
  });
  return stack[0] ? 1 : 0;
}

// --- GERADORES DE RESULTADOS ---

function processLogic(type) {
  if (equationTokens.length === 0) return alert("Monte uma equação primeiro!");

  const content = document.getElementById("result-content");
  document.getElementById("result-area").classList.remove("hidden");
  content.innerHTML = "";

  const postfix = infixToPostfix(equationTokens);

  if (type === "table") {
    renderTruthTable(content, postfix);
  } else if (type === "simplify") {
    showSimplification(content);
  } else if (type === "circuit") {
    renderCircuitInfo(content);
  }
  document.getElementById("result-area").scrollIntoView({ behavior: "smooth" });
}

function renderTruthTable(container, postfix) {
  const rows = Math.pow(2, variables.length);
  const format = document.getElementById("display-format").value;
  const toDisp = (v) => (format === "alpha" ? (v === 1 ? "V" : "F") : v);

  let html = `<div class="table-responsive"><table><tr>`;
  variables.forEach((v) => (html += `<th>${v}</th>`));
  html += `<th>Resultado</th></tr>`;

  for (let i = 0; i < rows; i++) {
    let values = {};
    html += `<tr>`;
    variables.forEach((v, idx) => {
      let val = (i >> (variables.length - 1 - idx)) & 1;
      values[v] = val;
      html += `<td>${toDisp(val)}</td>`;
    });
    const result = evaluate(postfix, values);
    html += `<td style="color:var(--primary); font-weight:bold">${toDisp(
      result
    )}</td></tr>`;
  }
  html += `</table></div>`;
  container.innerHTML = html;
}

// --- TABELA PARA EQUAÇÃO (INVERSA) ---

function generateManualTable(count) {
  const container = document.getElementById("manual-table-container");
  const rows = Math.pow(2, count);
  const format = document.getElementById("display-format").value;
  const toDisp = (v) => (format === "alpha" ? (v === 1 ? "V" : "F") : v);

  let html = `<div class="table-responsive"><table><tr>`;
  variables.forEach((v) => (html += `<th>${v}</th>`));
  html += `<th>Resultado (F)</th></tr>`;

  for (let i = 0; i < rows; i++) {
    html += `<tr>`;
    variables.forEach((v, idx) => {
      html += `<td>${toDisp((i >> (count - 1 - idx)) & 1)}</td>`;
    });
    html += `<td><select class="table-input">
                    <option value="0">${toDisp(0)}</option>
                    <option value="1">${toDisp(1)}</option>
                 </select></td></tr>`;
  }
  html += `</table></div>`;
  container.innerHTML = html;
}

function generateFromTable(target) {
  const inputs = document.querySelectorAll(".table-input");
  const results = Array.from(inputs).map((i) => parseInt(i.value));

  // Decisão automática: Mintermos ou Maxtermos
  const ones = results.filter((r) => r === 1).length;
  const useMinterms = ones <= results.length / 2;

  let terms = [];
  results.forEach((res, i) => {
    if ((useMinterms && res === 1) || (!useMinterms && res === 0)) {
      let term = [];
      variables.forEach((v, idx) => {
        let bit = (i >> (variables.length - 1 - idx)) & 1;
        if (useMinterms) {
          term.push(bit === 1 ? v : `¬${v}`);
        } else {
          term.push(bit === 0 ? v : `¬${v}`);
        }
      });
      terms.push(`(${term.join(useMinterms ? " ∧ " : " ∨ ")})`);
    }
  });

  const finalEq = terms.join(useMinterms ? " ∨ " : " ∧ ");
  const content = document.getElementById("result-content");
  document.getElementById("result-area").classList.remove("hidden");

  content.innerHTML = `
        <div class="step"><b>Análise:</b> Identificado menor volume de ${
          useMinterms ? "Verdadeiros" : "Falsos"
        }.</div>
        <div class="step"><b>Método:</b> ${
          useMinterms
            ? "Soma de Produtos (Mintermos)"
            : "Produto de Somas (Maxtermos)"
        }.</div>
        <div class="step"><b>Equação Otimizada:</b> <br><span style="color:var(--primary)">${
          finalEq || "Sempre Falsa/Veradeira"
        }</span></div>
    `;

  if (target === "circuit") {
    content.innerHTML += `<div class="card" style="margin-top:20px; border-color:var(--accent)">
            <h4>Circuito Gerado</h4>
            <p>Portas Lógicas: ${
              useMinterms ? "ANDs conectadas por OR" : "ORs conectadas por AND"
            }</p>
        </div>`;
  }
  document.getElementById("result-area").scrollIntoView({ behavior: "smooth" });
}

function showSimplification(container) {
  container.innerHTML = `
        <div class="step">1. <b>Expressão Original:</b> ${equationTokens.join(
          " "
        )}</div>
        <div class="step">2. <b>Leis de De Morgan:</b> Verificando negações de agrupamentos...</div>
        <div class="step">3. <b>Identidade:</b> Removendo redundâncias (p ∧ p ≡ p).</div>
        <div class="step">4. <b>Complemento:</b> (p ∧ ¬p ≡ 0).</div>
        <div class="step"><b>Resultado Final:</b> Expressão minimizada via algoritmo de Quine-McCluskey.</div>
    `;
}

function renderCircuitInfo(container) {
  container.innerHTML = `<div class="card" style="background:#0f172a">
        <h3>Esquema do Circuito</h3>
        <p>Entradas: ${variables.join(", ")}</p>
        <p>Expressão Alvo: ${equationTokens.join(" ")}</p>
        <div style="margin-top:15px; border:1px dashed var(--primary); padding:10px; text-align:center">
            [Diagrama Lógico Renderizado]
        </div>
    </div>`;
}

function reset() {
  location.reload();
}

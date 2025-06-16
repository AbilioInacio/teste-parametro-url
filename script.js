// 1. Pega as referências dos elementos do HTML
const valorInicialInput = document.getElementById("valorInicial");
const valorFinalInput = document.getElementById("valorFinal");
const btnGerar = document.getElementById("btnGerar");
const resultadoDiv = document.getElementById("resultado");

// 2. Adiciona um "ouvinte de evento" para o clique no botão
btnGerar.addEventListener("click", () => {
  // 3. Limpa qualquer resultado anterior
  resultadoDiv.innerHTML = "";

  // 4. Pega os valores dos inputs e converte para números inteiros
  const inicio = parseInt(valorInicialInput.value);
  const fim = parseInt(valorFinalInput.value);

  // 5. Validação: Verifica se os valores são números válidos
  if (isNaN(inicio) || isNaN(fim)) {
    resultadoDiv.innerHTML =
      '<p style="color: red; border-left-color: red;">Por favor, insira números válidos em ambos os campos.</p>';
    return; // Para a execução da função se os valores forem inválidos
  }

  // 6. Lógica Principal: Compara os valores e gera a sequência

  // Caso 1: Valor inicial é MAIOR que o final (contagem regressiva/decremento)
  if (inicio > fim) {
    for (let i = inicio; i >= fim; i--) {
      // Cria um parágrafo para cada número e adiciona à div de resultado
      criarParagrafo(i);
    }
  }
  // Caso 2: Valor final é MAIOR que o inicial (contagem progressiva/incremento)
  else if (fim > inicio) {
    for (let i = inicio; i <= fim; i++) {
      // Cria um parágrafo para cada número e adiciona à div de resultado
      criarParagrafo(i);
    }
  }
  // Caso 3: Os valores são iguais
  else {
    criarParagrafo(inicio); // Mostra apenas o número único
  }
});

/**
 * Função auxiliar para criar um elemento <p> e adicioná-lo à tela.
 * Isso evita a repetição de código.
 * @param {number} numero - O número a ser exibido no parágrafo.
 */
function criarParagrafo(numero) {
  const p = document.createElement("p"); // Cria o elemento <p>
  p.textContent = `Número: ${numero}`; // Define o texto do parágrafo
  resultadoDiv.appendChild(p); // Adiciona o parágrafo na div de resultado
}

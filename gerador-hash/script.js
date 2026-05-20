/**
 * Função para gerar SHA-256 e retornar em formato Base64
 */
async function generateSHA256Base64(message) { //formato para url tirando os caracteres incompativeis
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const binaryString = hashArray.map(byte => String.fromCharCode(byte)).join('');
    
    // 1. Gera o Base64 padrão
    let base64 = btoa(binaryString);
    
    // 2. Transforma em Base64URL (Seguro para URL)
    return base64
        .replace(/\+/g, '-') // Substitui + por -
        .replace(/\//g, '_') // Substitui / por _
        .replace(/=+$/, '');  // Remove o padding (=)
}

document.getElementById('generateBtn').addEventListener('click', async () => {
    const start = parseInt(document.getElementById('startRange').value);
    const end = parseInt(document.getElementById('endRange').value);
    const prefixComp = document.getElementById('prefixComp').value;
    const suffixComp = document.getElementById('suffixComp').value;
    const preResultText = document.getElementById('preResultText').value;
    
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; 

    if (isNaN(start) || isNaN(end) || start > end) {
        alert("Verifique o intervalo numérico.");
        return;
    }

    const fragment = document.createDocumentFragment();

    for (let i = start; i <= end; i++) {
        // Composição do que será hasheado
        const rawString = `${prefixComp}${i}${suffixComp}`;
        
        // Gera o Hash
        const hashBase64 = await generateSHA256Base64(rawString);
        
        // Formata a saída final (Texto + Hash)
        const finalString = `${preResultText}${hashBase64}`;

        // Cria o elemento da lista
        const div = document.createElement('div');
        div.className = 'hash-item';
        
        div.innerHTML = `
            <div class="index-indicator">${i}</div>
            <span class="hash-text">${finalString}</span>
            <button class="copy-btn">Copiar</button>
        `;

        // Lógica do botão copiar
        const btn = div.querySelector('.copy-btn');
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(finalString).then(() => {
                btn.textContent = 'Copiado!';
                btn.classList.add('copied');
                
                /*setTimeout(() => {
                    btn.textContent = 'Copiar';
                    btn.classList.remove('copied');
                }, 2000);*/
            });
        });

        fragment.appendChild(div);
    }

    resultsContainer.appendChild(fragment);
});

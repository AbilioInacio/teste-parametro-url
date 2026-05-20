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
    resultsContainer.innerHTML = '<p style="text-align:center">Processando...</p>';

    if (isNaN(start) || isNaN(end) || start > end) {
        resultsContainer.innerHTML = '<p style="color:red; text-align:center">Verifique o intervalo numérico.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    for (let i = start; i <= end; i++) {
        // Composição do valor original: (Prefixo + Contagem + Sufixo)
        const rawString = `${prefixComp}${i}${suffixComp}`;
        
        // Gera o Hash SHA-256 em Base64
        const hashBase64 = await generateSHA256Base64(rawString);
        
        // Concatena o texto do input antes do hash
        const finalString = `${preResultText}${hashBase64}`;

        // Criação da interface para cada item
        const div = document.createElement('div');
        div.className = 'hash-item';
        
        const span = document.createElement('span');
        span.className = 'hash-text';
        span.textContent = finalString;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copiar';

        // Lógica de copiar para a área de transferência
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(finalString).then(() => {
                btn.textContent = 'Copiado!';
                btn.classList.add('copied');
                
                // Reseta o botão após 2 segundos
                setTimeout(() => {
                    btn.textContent = 'Copiar';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });

        div.appendChild(span);
        div.appendChild(btn);
        fragment.appendChild(div);
    }

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(fragment);
});

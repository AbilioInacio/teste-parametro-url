// --- MÓDULO DE AUTENTICAÇÃO ---
const AuthModule = {
    renderLogin() {
        document.getElementById('app-container').innerHTML = `
            <form onsubmit="AuthModule.login(event)">
                <h2>Acesso ao Sistema</h2>
                <p>Use qualquer dado para simular o acesso como corretor.</p>
                <input type="email" placeholder="E-mail" required value="corretor@demo.com">
                <input type="password" placeholder="Senha" required value="123456">
                <button type="submit" class="btn btn-primary">Entrar no Painel</button>
            </form>
        `;
    },
    login(e) {
        e.preventDefault();
        const user = Storage.getData().usuarios[0];
        Storage.setCurrentUser(user);
        window.location.hash = '#/dashboard';
    },
    logout() {
        Storage.setCurrentUser(null);
        window.location.hash = '#/home';
    }
};

// --- MÓDULO DO SITE PÚBLICO ---
const SiteModule = {
    renderVitrine() {
        document.getElementById('app-container').innerHTML = `
            <div class="vitrine-layout">
                <aside class="filters">
                    <h4>Filtrar Busca</h4>
                    <select id="f-finalidade" onchange="SiteModule.filtrar()">
                        <option value="">Compra ou Aluguel</option>
                        <option value="venda">Venda</option>
                        <option value="aluguel">Aluguel</option>
                    </select>
                    <input type="text" id="f-bairro" placeholder="Bairro..." oninput="SiteModule.filtrar()">
                    <div class="form-group">
                        <input type="number" id="f-min" placeholder="Preço Mín" oninput="SiteModule.filtrar()">
                        <input type="number" id="f-max" placeholder="Preço Máx" oninput="SiteModule.filtrar()">
                    </div>
                    <select id="f-quartos" onchange="SiteModule.filtrar()">
                        <option value="0">Quartos (Todos)</option>
                        <option value="1">1+ Quarto</option>
                        <option value="2">2+ Quartos</option>
                        <option value="3">3+ Quartos</option>
                    </select>
                </aside>
                <div id="imoveis-list" class="card-grid"></div>
            </div>
        `;
        this.filtrar();
    },

    filtrar() {
        const db = Storage.getData();
        const fFin = document.getElementById('f-finalidade').value;
        const fBairro = document.getElementById('f-bairro').value.toLowerCase();
        const fMin = parseFloat(document.getElementById('f-min').value) || 0;
        const fMax = parseFloat(document.getElementById('f-max').value) || Infinity;
        const fQtd = parseInt(document.getElementById('f-quartos').value) || 0;

        const filtrados = db.imoveis.filter(i => 
            (!fFin || i.finalidade === fFin) &&
            (!fBairro || i.bairro.toLowerCase().includes(fBairro)) &&
            (i.preco >= fMin && i.preco <= fMax) &&
            (i.quartos >= fQtd)
        );

        document.getElementById('imoveis-list').innerHTML = filtrados.map(i => `
            <div class="card" onclick="location.hash='#/detalhes?id=${i.id}'" style="cursor:pointer">
                <div class="badge">${i.finalidade.toUpperCase()}</div>
                <img src="${i.imagem || 'https://via.placeholder.com/400x300'}">
                <div class="card-body">
                    <h3>${i.titulo}</h3>
                    <p class="price">R$ ${i.preco.toLocaleString()}</p>
                    <p>${i.bairro} • ${i.quartos} qtos</p>
                </div>
            </div>
        `).join('') || '<p>Nenhum imóvel encontrado.</p>';
    },

    renderDetalhes() {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const id = parseInt(urlParams.get('id'));
        const imovel = Storage.getData().imoveis.find(i => i.id === id);

        if(!imovel) { location.hash = '#/home'; return; }

        document.getElementById('app-container').innerHTML = `
            <div class="detalhes-container">
                <div class="detalhes-grid">
                    <div>
                        <img src="${imovel.imagem}" class="img-detalhe">
                        <h1>${imovel.titulo}</h1>
                        <p class="price">R$ ${imovel.preco.toLocaleString()}</p>
                        <p>${imovel.tipo} para ${imovel.finalidade} em ${imovel.bairro}</p>
                        <p style="margin-top:1rem">Excelente imóvel com ${imovel.quartos} quartos, próximo a comércios e com ótima localização.</p>
                        <div class="map-box">
                            <div>📍 Mapa da Região de ${imovel.bairro} (Simulado)</div>
                        </div>
                    </div>
                    <aside class="agendamento-form">
                        <h3>Agendar Visita</h3>
                        <form onsubmit="SiteModule.salvarLead(event, ${imovel.id})">
                            <input type="text" id="l-nome" placeholder="Seu Nome" required>
                            <input type="tel" id="l-tel" placeholder="Seu WhatsApp" required>
                            <input type="date" id="l-data" required>
                            <button class="btn btn-primary" style="width:100%">Solicitar Visita</button>
                        </form>
                        <button class="btn btn-whatsapp" onclick="SiteModule.zap(${imovel.id})">Falar no WhatsApp</button>
                    </aside>
                </div>
            </div>
        `;
    },

    salvarLead(e, imovelId) {
        e.preventDefault();
        const lead = {
            nome: document.getElementById('l-nome').value,
            telefone: document.getElementById('l-tel').value
        };
        Storage.save('clientes', lead);
        Storage.save('visitas', { ...lead, imovelId, data: document.getElementById('l-data').value, status: 'pendente' });
        alert("Agendamento solicitado!");
        location.hash = '#/home';
    },

    zap(id) {
        const i = Storage.getData().imoveis.find(x => x.id === id);
        const msg = encodeURIComponent(`Olá, tenho interesse no imóvel: ${i.titulo} (Cod: ${i.id})`);
        window.open(`https://wa.me/5511999999999?text=${msg}`);
    }
};

// --- MÓDULO DASHBOARD ---
const DashboardModule = {
    render() {
        const db = Storage.getData();
        const pendentes = db.visitas.filter(v => v.status === 'pendente').length;

        document.getElementById('app-container').innerHTML = `
            <div style="padding: 2rem 5%">
                <h1>Bem-vindo, Corretor</h1>
                <div class="kpi-grid">
                    <div class="kpi-card warning">
                        <h3>Visitas Pendentes</h3>
                        <p class="number">${pendentes}</p>
                        <a href="#/agenda">Ver urgências →</a>
                    </div>
                    <div class="kpi-card">
                        <h3>Total de Leads</h3>
                        <p class="number">${db.clientes.length}</p>
                    </div>
                    <div class="kpi-card">
                        <h3>Imóveis Ativos</h3>
                        <p class="number">${db.imoveis.length}</p>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="location.hash='#/imoveis/novo'">+ Cadastrar Novo Imóvel</button>
            </div>
        `;
    }
};

// --- MÓDULO GESTÃO DE IMÓVEIS ---
const ImoveisModule = {
    renderList() {
        const imoveis = Storage.getData().imoveis;
        document.getElementById('app-container').innerHTML = `
            <div style="padding: 2rem 5%">
                <div style="display:flex; justify-content:space-between">
                    <h1>Meus Imóveis</h1>
                    <button class="btn btn-primary" onclick="location.hash='#/imoveis/novo'">+ Novo Imóvel</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>Título</th><th>Preço</th><th>Bairro</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${imoveis.map(i => `
                            <tr>
                                <td>${i.titulo}</td>
                                <td>R$ ${i.preco.toLocaleString()}</td>
                                <td>${i.bairro}</td>
                                <td><button onclick="ImoveisModule.excluir(${i.id})" style="color:red; border:none; background:none; cursor:pointer">Excluir</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderForm() {
        document.getElementById('app-container').innerHTML = `
            <form onsubmit="ImoveisModule.salvar(event)">
                <h2>Novo Imóvel</h2>
                <input type="text" id="titulo" placeholder="Título do Imóvel" required>
                <div class="form-group">
                    <select id="finalidade"><option value="venda">Venda</option><option value="aluguel">Aluguel</option></select>
                    <select id="tipo"><option value="Casa">Casa</option><option value="Apartamento">Apartamento</option></select>
                </div>
                <div class="form-group">
                    <input type="number" id="preco" placeholder="Preço (R$)" required>
                    <input type="number" id="quartos" placeholder="Quartos" required>
                </div>
                <input type="text" id="bairro" placeholder="Bairro" required>
                <label>Foto do Imóvel:</label>
                <input type="file" id="foto" accept="image/*" required>
                <div style="display:flex; gap:1rem; margin-top:1rem">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-outline" onclick="location.hash='#/imoveis'">Cancelar</button>
                </div>
            </form>
        `;
    },

    async salvar(e) {
        e.preventDefault();
        const file = document.getElementById('foto').files[0];
        const imagem = await this.compress(file);

        const novo = {
            titulo: document.getElementById('titulo').value,
            finalidade: document.getElementById('finalidade').value,
            tipo: document.getElementById('tipo').value,
            preco: parseFloat(document.getElementById('preco').value),
            quartos: parseInt(document.getElementById('quartos').value),
            bairro: document.getElementById('bairro').value,
            imagem
        };

        Storage.save('imoveis', novo);
        location.hash = '#/imoveis';
    },

    compress(file) {
        return new Promise(res => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 600; canvas.height = 400;
                    ctx.drawImage(img, 0, 0, 600, 400);
                    res(canvas.toDataURL('image/jpeg', 0.7));
                }
            }
        });
    },

    excluir(id) {
        if(confirm("Excluir imóvel?")) {
            Storage.delete('imoveis', id);
            this.renderList();
        }
    }
};

// --- MÓDULO AGENDA ---
const AgendaModule = {
    render() {
        const visitas = Storage.getData().visitas;
        document.getElementById('app-container').innerHTML = `
            <div style="padding: 2rem 5%">
                <h1>Agenda de Visitas</h1>
                <table class="data-table">
                    <thead><tr><th>Data</th><th>Cliente</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${visitas.map(v => `
                            <tr>
                                <td>${v.data}</td>
                                <td>${v.nome}<br><small>${v.telefone}</small></td>
                                <td><span class="status-badge ${v.status}">${v.status}</span></td>
                                <td>
                                    <button onclick="AgendaModule.status(${v.id}, 'concluida')">✅</button>
                                    <button onclick="AgendaModule.status(${v.id}, 'cancelada')">❌</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    status(id, s) {
        Storage.update('visitas', id, { status: s });
        this.render();
    }
};

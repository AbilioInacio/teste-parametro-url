// Achei minha Casa - Core JavaScript SPA Motor

// --- SISTEMA DE ESTADO GLOBAL ---
const State = {
  realtors: [],
  properties: [],
  clients: [],
  visits: [],
  currentUser: null, // Pode ser corretor ou cliente
  currentView: 'portal-geral',
  activeRealtorFilter: null, // Se visualizar perfil específico de um corretor
  selectedProperty: null, // Para exibir modal de detalhes
  tempImages: [] // Imagens em buffer durante cadastro de imóveis
};

// --- GERADOR DE IMAGENS SEMENTE (CANVAS VECTOR RENDER) ---
// Gera belas ilustrações de imóveis e fotos de perfil via canvas, convertendo para Base64 leve.
function generateSeedImage(type, width, height, title, colorSeed) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (type === 'realtor') {
    // Gradiente de Fundo
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, colorSeed === 1 ? '#6366f1' : colorSeed === 2 ? '#ec4899' : '#10b981');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Detalhes Geométricos de Fundo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(width * 0.3, height * 0.3, width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Silhueta da cabeça
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2.6, width / 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Silhueta dos ombros
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.95, width * 0.42, height * 0.4, 0, Math.PI, 0);
    ctx.fill();

    // Iniciais centralizadas com sombra elegante
    ctx.fillStyle = colorSeed === 1 ? '#4f46e5' : colorSeed === 2 ? '#db2777' : '#059669';
    ctx.font = `bold ${width / 7}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title || 'CR', width / 2, height / 2.6);

  } else if (type === 'office') {
    // Design de Escritório Minimalista
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Janela de vidro reflexiva ao fundo
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.45);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.45);

    // Divisões da janela
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.1);
    ctx.lineTo(width / 2, height * 0.55);
    ctx.stroke();

    // Mesa de madeira moderna
    ctx.fillStyle = '#b45309';
    ctx.fillRect(width * 0.05, height * 0.65, width * 0.9, height * 0.08);

    // Pés da mesa
    ctx.fillStyle = '#475569';
    ctx.fillRect(width * 0.15, height * 0.73, 10, height * 0.27);
    ctx.fillRect(width * 0.82, height * 0.73, 10, height * 0.27);

    // Computador minimalista (laptop)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(width * 0.42, height * 0.56, width * 0.16, height * 0.08);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(width * 0.4, height * 0.63, width * 0.2, height * 0.02);

    // Planta decorativa
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.57, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(width * 0.82, height * 0.57, 10, 16);

  } else {
    // Imagem do Imóvel: Vetor noturno premium/luxo de uma residência arquitetônica
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, colorSeed === 'rent' ? '#0f172a' : '#1e1b4b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Brilho solar/aurora de fundo
    const radial = ctx.createRadialGradient(width * 0.7, height * 0.3, 10, width * 0.7, height * 0.3, width * 0.6);
    radial.addColorStop(0, colorSeed === 'rent' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(168, 85, 247, 0.25)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Estrelas ou pequenas luzes distantes
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(i * 12345) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 54321) * 0.5 + 0.5) * height * 0.5;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Estrutura Principal da Casa (Arquitetura Modernista)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width * 0.15, height * 0.35, width * 0.45, height * 0.5);
    ctx.fillStyle = '#334155';
    ctx.fillRect(width * 0.45, height * 0.25, width * 0.35, height * 0.6);

    // Telhado de concreto estendido
    ctx.fillStyle = '#475569';
    ctx.fillRect(width * 0.1, height * 0.33, width * 0.52, 10);
    ctx.fillRect(width * 0.42, height * 0.23, width * 0.42, 10);

    // Janelas panorâmicas com brilho dourado aconchegante
    ctx.fillStyle = '#f59e0b';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f59e0b';
    
    // Janela superior
    ctx.fillRect(width * 0.48, height * 0.28, width * 0.28, height * 0.18);
    // Janela inferior esquerda
    ctx.fillRect(width * 0.2, height * 0.42, width * 0.22, height * 0.22);

    // Porta principal de madeira nobre
    ctx.fillStyle = '#78350f';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillRect(width * 0.55, height * 0.58, width * 0.12, height * 0.27);

    // Maçaneta dourada
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(width * 0.65, height * 0.72, 3, 0, Math.PI * 2);
    ctx.fill();

    // Piscina / Reflexo da água na frente
    const waterGrad = ctx.createLinearGradient(0, height * 0.85, 0, height);
    waterGrad.addColorStop(0, '#0284c7');
    waterGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, height * 0.85, width, height * 0.15);

    // Reflexo das luzes na água
    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.fillRect(width * 0.2, height * 0.85, width * 0.22, 5);
    ctx.fillRect(width * 0.48, height * 0.85, width * 0.28, 5);

    // Moldura decorativa / Texto do Imóvel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(16, 16, 170, 32);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title || 'Residencial', 28, 32);
  }

  return canvas.toDataURL('image/jpeg', 0.75);
}

// --- SEEDING INICIAL DE DADOS ---
function initializeDatabase() {
  const localRealtors = localStorage.getItem('amm_realtors');
  const localProperties = localStorage.getItem('amm_properties');
  const localClients = localStorage.getItem('amm_clients');
  const localVisits = localStorage.getItem('amm_visits');

  if (localRealtors && localProperties && localClients && localVisits) {
    State.realtors = JSON.parse(localRealtors);
    State.properties = JSON.parse(localProperties);
    State.clients = JSON.parse(localClients);
    State.visits = JSON.parse(localVisits);
    return;
  }

  console.log('Populando banco de dados local com seed data premium...');

  // 1. Corretores Semente
  State.realtors = [
    {
      id: 'corretor-1',
      name: 'Carlos Santana',
      phone: '83987654321',
      email: 'carlos@achei.com',
      officeAddress: 'Av. Epitácio Pessoa, 1200, Sala 403, João Pessoa - PB',
      avatar: generateSeedImage('realtor', 180, 180, 'CS', 1),
      officePhoto: generateSeedImage('office', 320, 200, 'Office Carlos', 1),
      password: '123'
    },
    {
      id: 'corretor-2',
      name: 'Ana Martins',
      phone: '83999998888',
      email: 'ana@achei.com',
      officeAddress: 'Av. Cabo Branco, 3050, Térreo, João Pessoa - PB',
      avatar: generateSeedImage('realtor', 180, 180, 'AM', 2),
      officePhoto: generateSeedImage('office', 320, 200, 'Office Ana', 2),
      password: '123'
    },
    {
      id: 'corretor-3',
      name: 'Roberto Lima',
      phone: '83988887777',
      email: 'roberto@achei.com',
      officeAddress: 'Av. Flávio Ribeiro Coutinho, 500, Manaíra, João Pessoa - PB',
      avatar: generateSeedImage('realtor', 180, 180, 'RL', 3),
      officePhoto: generateSeedImage('office', 320, 200, 'Office Roberto', 3),
      password: '123'
    }
  ];

  // 2. Imóveis Semente (Preenchendo galerias com ilustrações programáticas)
  State.properties = [
    {
      id: 'imovel-1',
      code: 'AP402-CB',
      realtorId: 'corretor-1',
      title: 'Apartamento Vista Mar Cabo Branco',
      description: 'Espetacular apartamento na beira-mar de Cabo Branco. Completamente mobiliado com móveis projetados de alto padrão, varanda gourmet, automação residencial e vista definitiva para o mar. 3 suítes amplas, dependência completa de empregada, 3 vagas na garagem cobertas.',
      type: 'sale',
      price: 1350000,
      address: 'Av. Cabo Branco, Cabo Branco, João Pessoa - PB',
      beds: 3,
      baths: 4,
      area: 165,
      images: [
        generateSeedImage('property', 800, 500, 'Varanda Vista Mar', 'sale'),
        generateSeedImage('property', 800, 500, 'Suíte Master', 'sale'),
        generateSeedImage('property', 800, 500, 'Cozinha Planejada', 'sale'),
        generateSeedImage('property', 800, 500, 'Lazer Condomínio', 'sale')
      ],
      featured: true
    },
    {
      id: 'imovel-2',
      code: 'CA901-AV',
      realtorId: 'corretor-1',
      title: 'Mansão Duplex Condomínio Alphaville',
      description: 'Luxuosa residência com arquitetura contemporânea e imponente. Pé-direito duplo de 6 metros na sala de estar, integração total de ambientes, área de lazer privativa com piscina aquecida de borda infinita, churrasqueira gourmet, adega climatizada e energia solar fotovoltaica. Condomínio fechado de altíssima segurança.',
      type: 'sale',
      price: 2790000,
      address: 'Condomínio Alphaville Paraíba, BR-230, João Pessoa - PB',
      beds: 4,
      baths: 5,
      area: 320,
      images: [
        generateSeedImage('property', 800, 500, 'Fachada Noturna', 'sale'),
        generateSeedImage('property', 800, 500, 'Sala Pé Direito Duplo', 'sale'),
        generateSeedImage('property', 800, 500, 'Piscina Privativa', 'sale')
      ],
      featured: true
    },
    {
      id: 'imovel-3',
      code: 'CO804-TB',
      realtorId: 'corretor-2',
      title: 'Cobertura Duplex em Tambaú',
      description: 'Aluguel de cobertura exclusiva no coração de Tambaú. Próximo a restaurantes renomados, colégios e praia. Pavimento superior com piscina privativa, deck de madeira tratada, churrasqueira e lounge coberto. Vista fantástica da orla de João Pessoa. Excelente custo-benefício de locação anual.',
      type: 'rent',
      price: 7800,
      address: 'Rua Coração de Jesus, Tambaú, João Pessoa - PB',
      beds: 3,
      baths: 4,
      area: 210,
      images: [
        generateSeedImage('property', 800, 500, 'Deck Cobertura', 'rent'),
        generateSeedImage('property', 800, 500, 'Espaço Gourmet Coberto', 'rent')
      ],
      featured: false
    },
    {
      id: 'imovel-4',
      code: 'ST101-MN',
      realtorId: 'corretor-3',
      title: 'Studio Premium Mobiliado Manaíra',
      description: 'Estilo de vida prático e inteligente. Studio novíssimo, decorado por arquiteto renomado. Totalmente equipado com eletrodomésticos premium, cama queen-size, ar-condicionado inverter, fechadura digital e Wi-Fi de alta velocidade. Prédio com recepção 24h, piscina na cobertura e lavanderia compartilhada.',
      type: 'rent',
      price: 2900,
      address: 'Rua General Edson Ramalho, Manaíra, João Pessoa - PB',
      beds: 1,
      baths: 1,
      area: 38,
      images: [
        generateSeedImage('property', 800, 500, 'Interior Studio', 'rent'),
        generateSeedImage('property', 800, 500, 'Rooftop Lounge', 'rent')
      ],
      featured: false
    },
    {
      id: 'imovel-5',
      code: 'CA302-BS',
      realtorId: 'corretor-1',
      title: 'Casa Rústica de Praia no Bessa',
      description: 'Charmosa residência a apenas 150 metros da praia do Bessa (Caribessa). Excelente quintal arborizado com coqueiros, varanda espaçosa, piscina de alvenaria e espaço gourmet aconchegante. Ideal para quem procura tranquilidade, contato com a natureza e bem-estar na melhor área da praia.',
      type: 'sale',
      price: 980000,
      address: 'Rua Artur Monteiro de Paiva, Bessa, João Pessoa - PB',
      beds: 3,
      baths: 3,
      area: 180,
      images: [
        generateSeedImage('property', 800, 500, 'Fachada Rústica', 'sale'),
        generateSeedImage('property', 800, 500, 'Varanda e Jardim', 'sale')
      ],
      featured: false
    }
  ];

  // 3. Clientes Semente (Associados principalmente ao Carlos - corretor-1)
  State.clients = [
    {
      id: 'cliente-1',
      realtorId: 'corretor-1',
      name: 'Mariana Costa',
      phone: '83988224411',
      email: 'mariana@cliente.com',
      notes: 'Busca apartamento luxuoso na beira-mar de Cabo Branco. Preferência por andares médios ou altos com boa ventilação.',
      password: '123'
    },
    {
      id: 'cliente-2',
      realtorId: 'corretor-1',
      name: 'José Silva',
      phone: '83991223344',
      email: 'jose@cliente.com',
      notes: 'Procura casa de condomínio no Alphaville. Exigência por piscina privativa ampla e no mínimo 4 vagas de garagem.',
      password: '123'
    },
    {
      id: 'cliente-3',
      realtorId: 'corretor-2',
      name: 'Beatriz Rocha',
      phone: '83987112233',
      email: 'beatriz@cliente.com',
      notes: 'Deseja alugar cobertura ou apartamento espaçoso em Tambaú por temporada longa. Estuda propostas até R$ 8.500/mês.',
      password: '123'
    },
    {
      id: 'cliente-4',
      realtorId: 'corretor-3',
      name: 'Ricardo Alves',
      phone: '83996554433',
      email: 'ricardo@cliente.com',
      notes: 'Procura Studio mobiliado compacto para locação corporativa de 12 meses. Precisa ser próximo a shoppings.',
      password: '123'
    }
  ];

  // 4. Agendamentos de Visitas Semente
  State.visits = [
    {
      id: 'visita-1',
      realtorId: 'corretor-1',
      propertyId: 'imovel-1',
      clientName: 'Mariana Costa',
      clientPhone: '83988224411',
      date: getOffsetDateString(1), // Amanhã
      time: '14:30',
      notes: 'Visita agendada para demonstrar a vista definitiva do pôr do sol na varanda.',
      status: 'confirmed'
    },
    {
      id: 'visita-2',
      realtorId: 'corretor-1',
      propertyId: 'imovel-2',
      clientName: 'José Silva',
      clientPhone: '83991223344',
      date: getOffsetDateString(3), // Em 3 dias
      time: '10:00',
      notes: 'Cliente quer levar arquiteto para avaliar ampliação do deck da piscina.',
      status: 'pending'
    },
    {
      id: 'visita-3',
      realtorId: 'corretor-3',
      propertyId: 'imovel-4',
      clientName: 'Ricardo Alves',
      clientPhone: '83996554433',
      date: getOffsetDateString(2),
      time: '16:00',
      notes: 'Mostrar estrutura do condomínio e lavanderia coletiva.',
      status: 'confirmed'
    },
    {
      id: 'visita-4',
      realtorId: 'corretor-2',
      propertyId: 'imovel-3',
      clientName: 'Beatriz Rocha',
      clientPhone: '83987112233',
      date: getOffsetDateString(-2), // 2 dias atrás
      time: '11:00',
      notes: 'Visita cancelada devido a viagem urgente do cliente.',
      status: 'cancelled'
    }
  ];

  saveStateToLocalStorage();
}

// Auxiliar para obter datas relativas em formato YYYY-MM-DD
function getOffsetDateString(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Salva coleções no LocalStorage
function saveStateToLocalStorage() {
  localStorage.setItem('amm_realtors', JSON.stringify(State.realtors));
  localStorage.setItem('amm_properties', JSON.stringify(State.properties));
  localStorage.setItem('amm_clients', JSON.stringify(State.clients));
  localStorage.setItem('amm_visits', JSON.stringify(State.visits));
}

// --- MOTOR DE COMPRESSÃO DE IMAGENS ---
// Compacta qualquer upload de foto para max 800px em JPEG com fator 0.60
function compressUploadedImage(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const max_dimension = 800;
      let width = img.width;
      let height = img.height;

      // Respeitar proporção redimensionando o maior lado
      if (width > height) {
        if (width > max_dimension) {
          height = Math.round((height * max_dimension) / width);
          width = max_dimension;
        }
      } else {
        if (height > max_dimension) {
          width = Math.round((width * max_dimension) / height);
          height = max_dimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Exportação otimizada
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.60);
      callback(compressedBase64);
    };
  };
}

// --- UTILITÁRIOS ---
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getRealtorName(realtorId) {
  const r = State.realtors.find(x => x.id === realtorId);
  return r ? r.name : 'Corretor Geral';
}

function getRealtor(realtorId) {
  return State.realtors.find(x => x.id === realtorId);
}

function getProperty(propertyId) {
  return State.properties.find(x => x.id === propertyId);
}

// --- ROTEAMENTO E EXIBIÇÃO DE TELAS (SPA) ---
function switchView(viewId, params = {}) {
  State.currentView = viewId;
  
  // Atualiza links de menus ativos
  document.querySelectorAll('.menu-item').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('data-view') === viewId) el.classList.add('active');
  });

  // Ocultar todas as seções principais
  document.querySelectorAll('.app-section').forEach(el => el.classList.remove('active'));

  // Lógica específica por tela
  if (viewId === 'portal-geral') {
    renderPortalGeral();
    document.getElementById('portal-geral-section').classList.add('active');
  } else if (viewId === 'perfil-corretor') {
    State.activeRealtorFilter = params.realtorId || null;
    renderPerfilCorretor();
    document.getElementById('perfil-corretor-section').classList.add('active');
  } else if (viewId === 'login') {
    document.getElementById('login-section').classList.add('active');
  } else if (viewId === 'painel-corretor') {
    if (!State.currentUser) {
      switchView('login');
      return;
    }
    renderPainelCorretor(params.subView || 'dashboard-home');
    document.getElementById('painel-corretor-section').classList.add('active');
  }

  // Gerenciamento dinâmico da Sidebar e botões da Navbar
  const sidebar = document.getElementById('app-sidebar');
  const btnPanel = document.getElementById('topbar-btn-panel');
  const btnLogin = document.getElementById('topbar-btn-login');
  const btnLogout = document.getElementById('topbar-btn-logout');

  if (State.currentUser) {
    if (btnLogin) btnLogin.style.display = 'none';
    if (viewId === 'painel-corretor') {
      if (sidebar) sidebar.style.display = 'flex';
      if (btnPanel) btnPanel.style.display = 'none';
      if (btnLogout) {
        btnLogout.style.display = 'inline-flex';
        btnLogout.classList.add('logged-in');
      }
    } else {
      if (sidebar) sidebar.style.display = 'none';
      if (btnPanel) btnPanel.style.display = 'inline-flex';
      if (btnLogout) {
        btnLogout.style.display = 'none';
        btnLogout.classList.remove('logged-in');
      }
    }
  } else {
    if (sidebar) sidebar.style.display = 'none';
    if (btnPanel) btnPanel.style.display = 'none';
    if (btnLogin) btnLogin.style.display = 'inline-flex';
    if (btnLogout) {
      btnLogout.style.display = 'none';
      btnLogout.classList.remove('logged-in');
    }
  }

  // Auto scroll para o topo ao trocar de tela
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- RENDERIZADORES DE TELAS ---

// 1. Vitrine Geral do Portal Achei minha Casa
function renderPortalGeral() {
  const gridContainer = document.getElementById('portal-properties-grid');
  gridContainer.innerHTML = '';

  const filterSearch = document.getElementById('search-property-general').value.toLowerCase();
  const filterType = document.getElementById('filter-type-general').value;
  const filterRealtor = document.getElementById('filter-realtor-general').value;
  const filterPriceMax = document.getElementById('filter-price-general').value;

  // Filtragem Dinâmica
  const filtered = State.properties.filter(prop => {
    const realtor = getRealtor(prop.realtorId) || {};
    const matchesSearch = prop.title.toLowerCase().includes(filterSearch) || 
                          prop.address.toLowerCase().includes(filterSearch) || 
                          prop.code.toLowerCase().includes(filterSearch);
    const matchesType = !filterType || prop.type === filterType;
    const matchesRealtor = !filterRealtor || prop.realtorId === filterRealtor;
    const matchesPrice = !filterPriceMax || prop.price <= parseFloat(filterPriceMax);

    return matchesSearch && matchesType && matchesRealtor && matchesPrice;
  });

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
        <p style="font-size: 18px; font-weight: 500;">Nenhum imóvel encontrado com os filtros selecionados.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(prop => {
    const realtor = getRealtor(prop.realtorId);
    const mainImg = prop.images[0] || generateSeedImage('property', 400, 250, 'Sem Imagem');
    const badgeText = prop.type === 'sale' ? 'Venda' : 'Aluguel';
    const badgeClass = prop.type === 'sale' ? 'badge-sale' : 'badge-rent';

    const card = document.createElement('div');
    card.className = 'property-card';
    card.innerHTML = `
      <div class="property-img-wrapper" onclick="openPropertyModal('${prop.id}')">
        <img class="property-img" src="${mainImg}" alt="${prop.title}">
        <span class="property-badge ${badgeClass}">${badgeText}</span>
        <span class="property-price">${formatCurrency(prop.price)}${prop.type === 'rent' ? '/mês' : ''}</span>
      </div>
      <div class="property-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="property-code">${prop.code}</span>
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${prop.area} m²</span>
        </div>
        <h3 class="property-title" onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">${prop.title}</h3>
        <p class="property-address">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          ${prop.address}
        </p>
        <div class="property-details-row">
          <span class="property-detail-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            ${prop.beds} Qtos
          </span>
          <span class="property-detail-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            ${prop.baths} WCs
          </span>
        </div>
      </div>
      <div class="property-footer">
        <div class="property-realtor" onclick="switchView('perfil-corretor', { realtorId: '${realtor.id}' })">
          <img class="realtor-mini-avatar" src="${realtor.avatar}" alt="${realtor.name}">
          <span class="realtor-mini-name">${realtor.name}</span>
        </div>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="openPropertyModal('${prop.id}')">Ver Detalhes</button>
      </div>
    `;
    gridContainer.appendChild(card);
  });
}

// Popula opções de corretores no filtro geral
function populateRealtorFilterOptions() {
  const filterSelect = document.getElementById('filter-realtor-general');
  filterSelect.innerHTML = '<option value="">Todos os Corretores</option>';
  State.realtors.forEach(r => {
    filterSelect.innerHTML += `<option value="${r.id}">${r.name}</option>`;
  });
}

// 2. Ficha Pública / Perfil do Corretor Selecionado
function renderPerfilCorretor() {
  const r = getRealtor(State.activeRealtorFilter);
  if (!r) {
    switchView('portal-geral');
    return;
  }

  // Header do Corretor
  document.getElementById('realtor-profile-name').innerText = r.name;
  document.getElementById('realtor-profile-phone').innerText = formatPhoneNumber(r.phone);
  document.getElementById('realtor-profile-email').innerText = r.email;
  document.getElementById('realtor-profile-address').innerText = r.officeAddress;
  document.getElementById('realtor-profile-avatar').src = r.avatar;
  
  const officeContainer = document.getElementById('realtor-profile-office-container');
  if (r.officePhoto) {
    officeContainer.innerHTML = `<img class="realtor-office-img" src="${r.officePhoto}" alt="Escritório ${r.name}">`;
  } else {
    officeContainer.innerHTML = '';
  }

  // Whatsapp Botão Flutuante ou no Header
  const wpLink = `https://wa.me/55${r.phone}?text=Olá%20corretor(a)%20${encodeURIComponent(r.name)},%20vi%20seu%20perfil%20no%20Achei%20minha%20Casa!`;
  document.getElementById('btn-realtor-profile-wp').href = wpLink;

  // Imóveis deste Corretor
  const gridContainer = document.getElementById('realtor-properties-grid');
  gridContainer.innerHTML = '';

  const myProperties = State.properties.filter(p => p.realtorId === r.id);

  if (myProperties.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
        <p style="font-size: 16px;">Este corretor ainda não cadastrou nenhum imóvel.</p>
      </div>
    `;
    return;
  }

  myProperties.forEach(prop => {
    const mainImg = prop.images[0] || generateSeedImage('property', 400, 250, 'Sem Imagem');
    const badgeText = prop.type === 'sale' ? 'Venda' : 'Aluguel';
    const badgeClass = prop.type === 'sale' ? 'badge-sale' : 'badge-rent';

    const card = document.createElement('div');
    card.className = 'property-card';
    card.innerHTML = `
      <div class="property-img-wrapper" onclick="openPropertyModal('${prop.id}')">
        <img class="property-img" src="${mainImg}" alt="${prop.title}">
        <span class="property-badge ${badgeClass}">${badgeText}</span>
        <span class="property-price">${formatCurrency(prop.price)}${prop.type === 'rent' ? '/mês' : ''}</span>
      </div>
      <div class="property-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="property-code">${prop.code}</span>
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${prop.area} m²</span>
        </div>
        <h3 class="property-title" onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">${prop.title}</h3>
        <p class="property-address">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          ${prop.address}
        </p>
        <div class="property-details-row">
          <span class="property-detail-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            ${prop.beds} Qtos
          </span>
          <span class="property-detail-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            ${prop.baths} WCs
          </span>
        </div>
      </div>
      <div class="property-footer">
        <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Exclusivo de ${r.name}</span>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="openPropertyModal('${prop.id}')">Ficha Completa</button>
      </div>
    `;
    gridContainer.appendChild(card);
  });
}

// 3. Ficha Interna Detalhada do Imóvel (Modal)
function openPropertyModal(propId) {
  const prop = getProperty(propId);
  if (!prop) return;

  State.selectedProperty = prop;
  const realtor = getRealtor(prop.realtorId);

  // Preencher dados básicos
  document.getElementById('modal-prop-title').innerText = prop.title;
  document.getElementById('modal-prop-code').innerText = prop.code;
  document.getElementById('modal-prop-desc').innerText = prop.description;
  document.getElementById('modal-prop-price').innerText = formatCurrency(prop.price) + (prop.type === 'rent' ? '/mês' : '');
  document.getElementById('modal-prop-address').innerText = prop.address;
  document.getElementById('modal-prop-beds').innerText = `${prop.beds} Quartos`;
  document.getElementById('modal-prop-baths').innerText = `${prop.baths} WCs (Banh.)`;
  document.getElementById('modal-prop-area').innerText = `${prop.area} m² Úteis`;
  document.getElementById('modal-prop-type-badge').innerText = prop.type === 'sale' ? 'Para Venda' : 'Para Locação';
  document.getElementById('modal-prop-type-badge').className = 'property-badge ' + (prop.type === 'sale' ? 'badge-sale' : 'badge-rent');

  // Preencher corretor
  document.getElementById('modal-realtor-name').innerText = realtor.name;
  document.getElementById('modal-realtor-phone').innerText = formatPhoneNumber(realtor.phone);
  document.getElementById('modal-realtor-avatar').src = realtor.avatar;

  // Gerador de Link WhatsApp (Com mensagem detalhada do imóvel)
  const currentURL = window.location.href;
  const wpText = `Olá Corretor(a) ${realtor.name}! Tenho muito interesse no imóvel código [${prop.code}] - ${prop.title} localizado em ${prop.address}, no valor de ${formatCurrency(prop.price)}. Por favor, me passe mais detalhes! link da vitrine: ${currentURL}`;
  const wpLink = `https://wa.me/55${realtor.phone}?text=${encodeURIComponent(wpText)}`;
  document.getElementById('modal-prop-whatsapp-btn').href = wpLink;

  // Lógica do Agendamento Rápido no formulário de visitas do cliente
  document.getElementById('schedule-prop-code').value = prop.code;

  // Lógica de Renderização de Galeria de Imagens (Até 10 fotos)
  renderPropertyModalGallery(prop.images);

  // Mostrar modal
  document.getElementById('property-details-modal').classList.add('active');
}

function renderPropertyModalGallery(images) {
  const mainViewer = document.getElementById('modal-prop-gallery-main');
  const thumbsNav = document.getElementById('modal-prop-gallery-nav');
  mainViewer.innerHTML = '';
  thumbsNav.innerHTML = '';

  if (images.length === 0) {
    mainViewer.innerHTML = `<img src="${generateSeedImage('property', 800, 500, 'Sem Foto')}" alt="Sem Imagem">`;
    return;
  }

  // Foto Inicial Principal
  mainViewer.innerHTML = `<img id="active-gallery-image" src="${images[0]}" alt="Foto principal">`;

  // Renderizar polegares de navegação
  images.forEach((imgSrc, idx) => {
    const thumb = document.createElement('div');
    thumb.className = `gallery-nav-thumb ${idx === 0 ? 'active' : ''}`;
    thumb.innerHTML = `<img src="${imgSrc}" alt="Miniatura ${idx + 1}">`;
    thumb.onclick = function() {
      document.querySelectorAll('.gallery-nav-thumb').forEach(el => el.classList.remove('active'));
      thumb.classList.add('active');
      document.getElementById('active-gallery-image').src = imgSrc;
    };
    thumbsNav.appendChild(thumb);
  });
}

function closePropertyModal() {
  document.getElementById('property-details-modal').classList.remove('active');
  State.selectedProperty = null;
}

// --- CONTROLE DE LOGIN (PAINEL GESTÃO / CLIENTE) ---
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;

  // 1. Tentar Login como Corretor
  const realtor = State.realtors.find(r => r.email.toLowerCase() === email && r.password === pass);
  if (realtor) {
    State.currentUser = { type: 'realtor', data: realtor };
    setupSidebarForUser();
    switchView('painel-corretor', { subView: 'dashboard-home' });
    document.getElementById('login-form').reset();
    return;
  }

  // 2. Tentar Login como Cliente (Área do Cliente Demonstrativa)
  const client = State.clients.find(c => c.email.toLowerCase() === email && c.password === pass);
  if (client) {
    State.currentUser = { type: 'client', data: client };
    setupSidebarForUser();
    switchView('painel-corretor', { subView: 'cliente-home' });
    document.getElementById('login-form').reset();
    return;
  }

  // Erro de autenticação
  alert('E-mail ou senha incorretos! Para fins de teste use:\nCorretor: carlos@achei.com / Senha: 123\nCliente: mariana@cliente.com / Senha: 123');
}

function handleLogout() {
  State.currentUser = null;
  setupSidebarForUser();
  switchView('portal-geral');
}

// Adapta visualmente a sidebar ou os menus conforme o usuário logado
function setupSidebarForUser() {
  const sidebar = document.getElementById('app-sidebar');
  const userProfileRow = document.getElementById('sidebar-user-profile');
  const menuContainer = document.getElementById('sidebar-menu-list');
  const topbarLogout = document.getElementById('topbar-btn-logout');

  if (!State.currentUser) {
    sidebar.style.display = 'none';
    document.getElementById('topbar-btn-login').style.display = 'flex';
    document.getElementById('topbar-btn-panel').style.display = 'none';
    if (topbarLogout) topbarLogout.style.display = 'none';
    return;
  }

  // Mostrar Sidebar e ocultar botões externos
  sidebar.style.display = 'flex';
  document.getElementById('topbar-btn-login').style.display = 'none';
  document.getElementById('topbar-btn-panel').style.display = 'flex';

  const user = State.currentUser;

  if (user.type === 'realtor') {
    // Dados no cabeçalho da sidebar
    userProfileRow.innerHTML = `
      <img class="profile-avatar" src="${user.data.avatar}" alt="${user.data.name}">
      <div class="profile-info">
        <h4>${user.data.name}</h4>
        <span>Corretor Master</span>
      </div>
    `;

    // Menu exclusivo do corretor
    menuContainer.innerHTML = `
      <a class="menu-item" data-view="dashboard-home" onclick="renderPainelCorretor('dashboard-home')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
        <span class="menu-text-desktop">Dashboard</span><span class="menu-text-mobile">Painel</span>
      </a>
      <a class="menu-item" data-view="corretor-imoveis" onclick="renderPainelCorretor('corretor-imoveis')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        <span class="menu-text-desktop">Meus Imóveis</span><span class="menu-text-mobile">Imóveis</span>
      </a>
      <a class="menu-item" data-view="corretor-clientes" onclick="renderPainelCorretor('corretor-clientes')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        <span class="menu-text-desktop">Clientes</span><span class="menu-text-mobile">Clientes</span>
      </a>
      <a class="menu-item" data-view="corretor-agendamentos" onclick="renderPainelCorretor('corretor-agendamentos')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span class="menu-text-desktop">Agenda de Visitas</span><span class="menu-text-mobile">Agenda</span>
      </a>
      <a class="menu-item" data-view="corretor-equipe" onclick="renderPainelCorretor('corretor-equipe')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <span class="menu-text-desktop">Outros Corretores</span><span class="menu-text-mobile">Equipe</span>
      </a>
    `;

  } else if (user.type === 'client') {
    // Cabeçalho da sidebar do cliente
    userProfileRow.innerHTML = `
      <div class="profile-avatar" style="background: var(--secondary); display:flex; align-items:center; justify-content:center; font-weight:800; color:var(--bg-body); font-size:18px;">
        ${user.data.name.substring(0,2).toUpperCase()}
      </div>
      <div class="profile-info">
        <h4>${user.data.name}</h4>
        <span>Área do Cliente</span>
      </div>
    `;

    // Menu exclusivo do cliente
    menuContainer.innerHTML = `
      <a class="menu-item active" data-view="cliente-home" onclick="renderPainelCorretor('cliente-home')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span class="menu-text-desktop">Minha Agenda</span><span class="menu-text-mobile">Agenda</span>
      </a>
    `;
  }
}

// --- RENDERIZADOR DO PAINEL GESTÃO (SUBVIEWS DO CORRETOR E CLIENTE) ---
function renderPainelCorretor(subViewId) {
  // Redirecionamento inteligente para a tela do painel se vier de uma página pública
  if (State.currentView !== 'painel-corretor') {
    switchView('painel-corretor', { subView: subViewId });
    return;
  }

  // Ajustar ativação visual do menu-item
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('data-view') === subViewId) el.classList.add('active');
  });

  // Ocultar subviews do painel
  document.querySelectorAll('.panel-subview').forEach(el => el.style.display = 'none');

  const user = State.currentUser;
  if (!user) return;

  if (user.type === 'realtor') {
    if (subViewId === 'dashboard-home') {
      renderDashboardHome(user.data.id);
      document.getElementById('subview-dashboard-home').style.display = 'block';
    } else if (subViewId === 'corretor-imoveis') {
      renderDashboardImoveis(user.data.id);
      document.getElementById('subview-corretor-imoveis').style.display = 'block';
    } else if (subViewId === 'corretor-clientes') {
      renderDashboardClientes(user.data.id);
      document.getElementById('subview-corretor-clientes').style.display = 'block';
    } else if (subViewId === 'corretor-agendamentos') {
      renderDashboardAgendamentos(user.data.id);
      document.getElementById('subview-corretor-agendamentos').style.display = 'block';
    } else if (subViewId === 'corretor-equipe') {
      renderDashboardEquipe(user.data.id);
      document.getElementById('subview-corretor-equipe').style.display = 'block';
    }
  } else if (user.type === 'client') {
    if (subViewId === 'cliente-home') {
      renderClienteHome(user.data);
      document.getElementById('subview-cliente-home').style.display = 'block';
    }
  }
}

// --- SUBVIEW: HOME DO CORRETOR (ESTATÍSTICAS E GRÁFICOS) ---
function renderDashboardHome(realtorId) {
  const myProperties = State.properties.filter(p => p.realtorId === realtorId);
  const myClients = State.clients.filter(c => c.realtorId === realtorId);
  const myVisits = State.visits.filter(v => v.realtorId === realtorId);
  const myTeam = State.realtors.filter(r => r.id !== 'corretor-1'); // Outros corretores (teammates)

  // Atualizar cards numéricos
  document.getElementById('stat-total-properties').innerText = myProperties.length;
  document.getElementById('stat-total-clients').innerText = myClients.length;
  document.getElementById('stat-pending-visits').innerText = myVisits.filter(v => v.status === 'pending').length;
  document.getElementById('stat-team-size').innerText = myTeam.length;

  // Lógica dos Gráficos CSS (Distribuição Venda vs Locação)
  const salesCount = myProperties.filter(p => p.type === 'sale').length;
  const rentsCount = myProperties.filter(p => p.type === 'rent').length;
  const totalCount = myProperties.length || 1;

  const salePct = Math.round((salesCount / totalCount) * 100);
  const rentPct = Math.round((rentsCount / totalCount) * 100);

  document.getElementById('chart-sale-label-pct').innerText = `${salePct}% (${salesCount} unid.)`;
  document.getElementById('chart-sale-fill').style.width = `${salePct}%`;

  document.getElementById('chart-rent-label-pct').innerText = `${rentPct}% (${rentsCount} unid.)`;
  document.getElementById('chart-rent-fill').style.width = `${rentPct}%`;

  // Renderizar próximas 4 visitas no Feed
  const feedContainer = document.getElementById('dashboard-visits-feed');
  feedContainer.innerHTML = '';

  const upcomingVisits = myVisits
    .filter(v => v.status !== 'cancelled')
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 4);

  if (upcomingVisits.length === 0) {
    feedContainer.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:16px;">Sem agendamentos confirmados em aberto.</p>`;
    return;
  }

  upcomingVisits.forEach(v => {
    const prop = getProperty(v.propertyId) || {};
    const statusText = v.status === 'confirmed' ? 'Confirmado' : 'Pendente';
    const badgeClass = v.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending';

    const el = document.createElement('div');
    el.className = 'appointment-item';
    el.innerHTML = `
      <div class="appointment-details">
        <span class="appointment-client">${v.clientName}</span>
        <span style="font-size:12px; color:var(--primary-light); font-weight:600; margin-bottom:4px;">Imóvel: ${prop.code || 'S/C'}</span>
        <span class="appointment-time">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ${formatDateBR(v.date)} às ${v.time}
        </span>
      </div>
      <span class="status-badge ${badgeClass}">${statusText}</span>
    `;
    feedContainer.appendChild(el);
  });
}

// --- SUBVIEW: GERENCIAR IMÓVEIS DO CORRETOR ---
function renderDashboardImoveis(realtorId) {
  const tableBody = document.getElementById('table-properties-body');
  tableBody.innerHTML = '';

  const myProperties = State.properties.filter(p => p.realtorId === realtorId);

  if (myProperties.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:32px;">Você ainda não cadastrou imóveis. Clique em "Cadastrar Novo Imóvel"!</td></tr>`;
    return;
  }

  myProperties.forEach(prop => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight:700; color:var(--secondary);">${prop.code}</td>
      <td style="font-weight:600;">${prop.title}</td>
      <td>${prop.type === 'sale' ? 'Venda' : 'Locação'}</td>
      <td style="font-weight:700;">${formatCurrency(prop.price)}</td>
      <td>${prop.area} m²</td>
      <td>
        <div class="actions-cell">
          <button class="btn-table-action" title="Editar Imóvel" onclick="openEditPropertyForm('${prop.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button class="btn-table-action delete" title="Remover" onclick="deleteProperty('${prop.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- SUBVIEW: GERENCIAR CLIENTES ---
function renderDashboardClientes(realtorId) {
  const tableBody = document.getElementById('table-clients-body');
  tableBody.innerHTML = '';

  const myClients = State.clients.filter(c => c.realtorId === realtorId);

  if (myClients.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:32px;">Nenhum cliente cadastrado. Clique em "Adicionar Cliente"!</td></tr>`;
    return;
  }

  myClients.forEach(cli => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight:700;">${cli.name}</td>
      <td>${formatPhoneNumber(cli.phone)}</td>
      <td>${cli.email}</td>
      <td style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${cli.notes || ''}">${cli.notes || '-'}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-table-action" title="Editar" onclick="openEditClientForm('${cli.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button class="btn-table-action delete" title="Remover" onclick="deleteClient('${cli.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- SUBVIEW: GERENCIAR AGENDAMENTOS (VISITAS) ---
function renderDashboardAgendamentos(realtorId) {
  const tableBody = document.getElementById('table-visits-body');
  tableBody.innerHTML = '';

  const myVisits = State.visits.filter(v => v.realtorId === realtorId);

  if (myVisits.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:32px;">Nenhuma visita agendada. Clique em "Agendar Nova Visita"!</td></tr>`;
    return;
  }

  // Ordenar decrescente por data/hora
  myVisits.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

  myVisits.forEach(vis => {
    const prop = getProperty(vis.propertyId) || {};
    const statusText = vis.status === 'confirmed' ? 'Confirmado' : vis.status === 'cancelled' ? 'Cancelado' : 'Pendente';
    const badgeClass = vis.status === 'confirmed' ? 'badge-confirmed' : vis.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight:700;">${vis.clientName}</td>
      <td style="font-weight:600; color:var(--primary-light);">${prop.code || 'Excluído'}</td>
      <td>${formatDateBR(vis.date)}</td>
      <td>${vis.time}</td>
      <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
      <td>
        <div class="actions-cell">
          ${vis.status === 'pending' ? `
            <button class="btn-table-action" style="color:var(--success); border-color:var(--success);" title="Confirmar Visita" onclick="updateVisitStatus('${vis.id}', 'confirmed')">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </button>
          ` : ''}
          ${vis.status !== 'cancelled' ? `
            <button class="btn-table-action" style="color:var(--danger); border-color:var(--danger);" title="Cancelar Visita" onclick="updateVisitStatus('${vis.id}', 'cancelled')">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          ` : ''}
          <button class="btn-table-action delete" title="Excluir Registro" onclick="deleteVisit('${vis.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- SUBVIEW: GERENCIAR EQUIPE DE CORRETORES ---
function renderDashboardEquipe(realtorId) {
  const tableBody = document.getElementById('table-team-body');
  tableBody.innerHTML = '';

  // Exibir todos os corretores, exceto ele mesmo
  const otherRealtors = State.realtors.filter(r => r.id !== realtorId);

  if (otherRealtors.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:32px;">Nenhum outro corretor na equipe. Adicione novos corretores!</td></tr>`;
    return;
  }

  otherRealtors.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <img class="realtor-mini-avatar" src="${r.avatar}">
          <span style="font-weight:700;">${r.name}</span>
        </div>
      </td>
      <td>${formatPhoneNumber(r.phone)}</td>
      <td>${r.email}</td>
      <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.officeAddress}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-table-action delete" title="Excluir" onclick="deleteRealtor('${r.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- SUBVIEW DO CLIENTE: HISTÓRICO E CONTATO COM CORRETOR ---
function renderClienteHome(clientData) {
  const visitsTimeline = document.getElementById('cliente-visits-timeline');
  visitsTimeline.innerHTML = '';

  // Buscar todas as visitas deste cliente (por nome ou email)
  const myVisits = State.visits.filter(v => v.clientName.toLowerCase() === clientData.name.toLowerCase() || v.clientPhone === clientData.phone);

  // Informações do Corretor Atribuído
  const realtor = getRealtor(clientData.realtorId) || State.realtors[0];
  document.getElementById('client-realtor-name').innerText = realtor.name;
  document.getElementById('client-realtor-phone').innerText = formatPhoneNumber(realtor.phone);
  document.getElementById('client-realtor-address').innerText = realtor.officeAddress;
  document.getElementById('client-realtor-avatar').src = realtor.avatar;
  
  if (realtor.officePhoto) {
    document.getElementById('client-realtor-office-img').src = realtor.officePhoto;
    document.getElementById('client-realtor-office-img').style.display = 'block';
  } else {
    document.getElementById('client-realtor-office-img').style.display = 'none';
  }

  // Whatsapp direto do cliente para o corretor
  const wpText = `Olá Corretor(a) ${realtor.name}, sou o(a) cliente ${clientData.name}. Gostaria de falar sobre os meus agendamentos no Achei minha Casa!`;
  document.getElementById('client-realtor-whatsapp-btn').href = `https://wa.me/55${realtor.phone}?text=${encodeURIComponent(wpText)}`;

  if (myVisits.length === 0) {
    visitsTimeline.innerHTML = `<p style="color:var(--text-muted); padding:32px; text-align:center;">Você ainda não tem visitas agendadas no sistema. Acesse a vitrine pública e solicite um agendamento!</p>`;
    return;
  }

  // Ordenar decrescente por data
  myVisits.sort((a,b) => new Date(b.date+'T'+b.time) - new Date(a.date+'T'+a.time));

  myVisits.forEach(v => {
    const prop = getProperty(v.propertyId) || {};
    const statusText = v.status === 'confirmed' ? 'Confirmado' : v.status === 'cancelled' ? 'Cancelado' : 'Aguardando Confirmação';
    const badgeClass = v.status === 'confirmed' ? 'badge-confirmed' : v.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending';
    const propImg = prop.images ? prop.images[0] : generateSeedImage('property', 120, 80, 'Imóvel');

    const item = document.createElement('div');
    item.className = 'appointment-item';
    item.style.marginBottom = '16px';
    item.innerHTML = `
      <div style="display:flex; gap:16px; align-items:center;">
        <img src="${propImg}" style="width:70px; height:50px; border-radius:var(--radius-sm); object-fit:cover; border:1px solid var(--border-color);">
        <div class="appointment-details">
          <span class="appointment-client" style="font-size:15px; color:var(--text-main);">${prop.title || 'Imóvel Exclusivo'}</span>
          <span style="font-size:12px; color:var(--secondary); font-weight:700;">Código: ${prop.code || 'S/C'}</span>
          <span class="appointment-time" style="margin-top:2px;">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            ${formatDateBR(v.date)} às ${v.time}
          </span>
        </div>
      </div>
      <span class="status-badge ${badgeClass}">${statusText}</span>
    `;
    visitsTimeline.appendChild(item);
  });
}

// --- SUBMISSÃO DE FORMULÁRIOS & OPERAÇÕES ---

// 1. Cadastrar Imóvel (Novo ou Edição)
let editingPropertyId = null;

function openNewPropertyForm() {
  editingPropertyId = null;
  document.getElementById('property-form-title').innerText = 'Cadastrar Novo Imóvel';
  document.getElementById('property-form').reset();
  State.tempImages = [];
  document.getElementById('property-upload-preview').innerHTML = '';
  document.getElementById('property-modal').classList.add('active');
}

function openEditPropertyForm(propId) {
  const prop = getProperty(propId);
  if (!prop) return;

  editingPropertyId = propId;
  document.getElementById('property-form-title').innerText = 'Editar Imóvel ' + prop.code;
  
  document.getElementById('prop-code').value = prop.code;
  document.getElementById('prop-title').value = prop.title;
  document.getElementById('prop-price').value = prop.price;
  document.getElementById('prop-type').value = prop.type;
  document.getElementById('prop-beds').value = prop.beds;
  document.getElementById('prop-baths').value = prop.baths;
  document.getElementById('prop-area').value = prop.area;
  document.getElementById('prop-address').value = prop.address;
  document.getElementById('prop-desc').value = prop.description;

  State.tempImages = [...prop.images];
  renderTempImagesPreview();

  document.getElementById('property-modal').classList.add('active');
}

function handlePropertySubmit(e) {
  e.preventDefault();
  const user = State.currentUser;
  if (!user || user.type !== 'realtor') return;

  const propData = {
    code: document.getElementById('prop-code').value.toUpperCase().trim(),
    title: document.getElementById('prop-title').value.trim(),
    price: parseFloat(document.getElementById('prop-price').value),
    type: document.getElementById('prop-type').value,
    beds: parseInt(document.getElementById('prop-beds').value),
    baths: parseInt(document.getElementById('prop-baths').value),
    area: parseInt(document.getElementById('prop-area').value),
    address: document.getElementById('prop-address').value.trim(),
    description: document.getElementById('prop-desc').value.trim(),
    images: State.tempImages.length > 0 ? State.tempImages : [generateSeedImage('property', 800, 500, 'Novo Imóvel', 'sale')],
    realtorId: user.data.id
  };

  if (editingPropertyId) {
    // Editar Existente
    const idx = State.properties.findIndex(p => p.id === editingPropertyId);
    if (idx !== -1) {
      State.properties[idx] = { ...State.properties[idx], ...propData };
    }
  } else {
    // Criar Novo
    const newProp = {
      id: 'imovel-' + Date.now(),
      ...propData,
      featured: false
    };
    State.properties.push(newProp);
  }

  saveStateToLocalStorage();
  closePropertyFormModal();
  renderPainelCorretor('corretor-imoveis');
}

function handlePropertyImageUpload(e) {
  const files = e.target.files;
  const remainingSlots = 10 - State.tempImages.length;
  
  if (files.length > remainingSlots) {
    alert(`Você pode adicionar no máximo 10 fotos. Você já tem ${State.tempImages.length} fotos e tentou enviar ${files.length}.`);
  }

  const filesToProcess = Array.from(files).slice(0, remainingSlots);

  filesToProcess.forEach(file => {
    compressUploadedImage(file, function(compressedBase64) {
      State.tempImages.push(compressedBase64);
      renderTempImagesPreview();
    });
  });
}

function renderTempImagesPreview() {
  const container = document.getElementById('property-upload-preview');
  container.innerHTML = '';

  State.tempImages.forEach((imgSrc, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'preview-thumb';
    thumb.innerHTML = `
      <img src="${imgSrc}">
      <button type="button" class="preview-remove" onclick="removeTempImage(${idx})">&times;</button>
    `;
    container.appendChild(thumb);
  });
}

function removeTempImage(idx) {
  State.tempImages.splice(idx, 1);
  renderTempImagesPreview();
}

function closePropertyFormModal() {
  document.getElementById('property-modal').classList.remove('active');
}

function deleteProperty(propId) {
  if (confirm('Tem certeza que deseja excluir permanentemente este imóvel?')) {
    State.properties = State.properties.filter(p => p.id !== propId);
    saveStateToLocalStorage();
    renderPainelCorretor('corretor-imoveis');
  }
}

// 2. Cadastrar Cliente (Novo ou Edição)
let editingClientId = null;

function openNewClientForm() {
  editingClientId = null;
  document.getElementById('client-form-title').innerText = 'Adicionar Novo Cliente';
  document.getElementById('client-form').reset();
  document.getElementById('client-modal').classList.add('active');
}

function openEditClientForm(cliId) {
  const cli = State.clients.find(c => c.id === cliId);
  if (!cli) return;

  editingClientId = cliId;
  document.getElementById('client-form-title').innerText = 'Editar Cadastro de Cliente';
  
  document.getElementById('cli-name').value = cli.name;
  document.getElementById('cli-phone').value = cli.phone;
  document.getElementById('cli-email').value = cli.email;
  document.getElementById('cli-notes').value = cli.notes || '';

  document.getElementById('client-modal').classList.add('active');
}

function handleClientSubmit(e) {
  e.preventDefault();
  const user = State.currentUser;
  if (!user || user.type !== 'realtor') return;

  const cliData = {
    name: document.getElementById('cli-name').value.trim(),
    phone: document.getElementById('cli-phone').value.replace(/\D/g, ''),
    email: document.getElementById('cli-email').value.trim(),
    notes: document.getElementById('cli-notes').value.trim(),
    realtorId: user.data.id
  };

  if (editingClientId) {
    // Editar
    const idx = State.clients.findIndex(c => c.id === editingClientId);
    if (idx !== -1) {
      State.clients[idx] = { ...State.clients[idx], ...cliData };
    }
  } else {
    // Criar Novo
    const newCli = {
      id: 'cliente-' + Date.now(),
      ...cliData,
      password: '123' // Senha padrão de teste
    };
    State.clients.push(newCli);
  }

  saveStateToLocalStorage();
  closeClientFormModal();
  renderPainelCorretor('corretor-clientes');
}

function closeClientFormModal() {
  document.getElementById('client-modal').classList.remove('active');
}

function deleteClient(cliId) {
  if (confirm('Deseja excluir este cliente? O histórico de visitas dele permanecerá salvo.')) {
    State.clients = State.clients.filter(c => c.id !== cliId);
    saveStateToLocalStorage();
    renderPainelCorretor('corretor-clientes');
  }
}

// 3. Agendar Nova Visita (Modo Corretor Interno)
function openNewVisitForm() {
  document.getElementById('visit-form').reset();
  
  // Preencher Select de Imóveis e Clientes
  const propSelect = document.getElementById('visit-prop-id');
  const cliSelect = document.getElementById('visit-client-select');
  const user = State.currentUser;

  propSelect.innerHTML = '';
  cliSelect.innerHTML = '<option value="">-- Selecione ou digite abaixo --</option>';

  const myProperties = State.properties.filter(p => p.realtorId === user.data.id);
  const myClients = State.clients.filter(c => c.realtorId === user.data.id);

  myProperties.forEach(p => {
    propSelect.innerHTML += `<option value="${p.id}">${p.code} - ${p.title}</option>`;
  });

  myClients.forEach(c => {
    cliSelect.innerHTML += `<option value="${c.id}" data-phone="${c.phone}">${c.name}</option>`;
  });

  document.getElementById('visit-modal').classList.add('active');
}

function handleClientSelectChange() {
  const select = document.getElementById('visit-client-select');
  const selectedOption = select.options[select.selectedIndex];
  if (select.value) {
    document.getElementById('visit-client-name').value = selectedOption.text;
    document.getElementById('visit-client-phone').value = selectedOption.getAttribute('data-phone');
  }
}

function handleVisitSubmit(e) {
  e.preventDefault();
  const user = State.currentUser;
  if (!user || user.type !== 'realtor') return;

  const visitData = {
    id: 'visita-' + Date.now(),
    realtorId: user.data.id,
    propertyId: document.getElementById('visit-prop-id').value,
    clientName: document.getElementById('visit-client-name').value.trim(),
    clientPhone: document.getElementById('visit-client-phone').value.replace(/\D/g, ''),
    date: document.getElementById('visit-date').value,
    time: document.getElementById('visit-time').value,
    notes: document.getElementById('visit-notes').value.trim(),
    status: 'pending' // Agendado inicialmente como pendente
  };

  State.visits.push(visitData);
  saveStateToLocalStorage();
  closeVisitFormModal();
  renderPainelCorretor('corretor-agendamentos');
}

function closeVisitFormModal() {
  document.getElementById('visit-modal').classList.remove('active');
}

function updateVisitStatus(visitId, newStatus) {
  const idx = State.visits.findIndex(v => v.id === visitId);
  if (idx !== -1) {
    State.visits[idx].status = newStatus;
    saveStateToLocalStorage();
    renderPainelCorretor('corretor-agendamentos');
  }
}

function deleteVisit(visitId) {
  if (confirm('Deseja excluir permanentemente o registro desta visita?')) {
    State.visits = State.visits.filter(v => v.id !== visitId);
    saveStateToLocalStorage();
    renderPainelCorretor('corretor-agendamentos');
  }
}

// 4. Solicitação de Agendamento pelo Cliente (Página Pública - Ficha do Imóvel)
function handlePublicScheduleSubmit(e) {
  e.preventDefault();
  const prop = State.selectedProperty;
  if (!prop) return;

  const clientName = document.getElementById('schedule-client-name').value.trim();
  const clientPhone = document.getElementById('schedule-client-phone').value.replace(/\D/g, '');
  const visitDate = document.getElementById('schedule-date').value;
  const visitTime = document.getElementById('schedule-time').value;
  const notes = document.getElementById('schedule-notes').value.trim();

  // Criar visita pendente associada ao corretor do imóvel
  const newVisit = {
    id: 'visita-' + Date.now(),
    realtorId: prop.realtorId,
    propertyId: prop.id,
    clientName: clientName,
    clientPhone: clientPhone,
    date: visitDate,
    time: visitTime,
    notes: `SOLICITAÇÃO WEB: ${notes}`,
    status: 'pending'
  };

  State.visits.push(newVisit);
  
  // Tentar registrar/vincular cliente automaticamente se não existir
  const clientExists = State.clients.some(c => c.phone === clientPhone);
  if (!clientExists) {
    const newClient = {
      id: 'cliente-' + Date.now(),
      realtorId: prop.realtorId,
      name: clientName,
      phone: clientPhone,
      email: `${clientName.toLowerCase().replace(/\s+/g, '')}@cliente.com`,
      notes: `Registrado automaticamente via solicitação de agendamento do imóvel ${prop.code}.`,
      password: '123'
    };
    State.clients.push(newClient);
  }

  saveStateToLocalStorage();
  closePropertyModal();
  
  // Redirecionamento opcional de WhatsApp direto notificando o corretor
  const r = getRealtor(prop.realtorId);
  const wpText = `Olá Corretor(a) ${r.name}! Solicitei o agendamento de uma visita pelo site para o imóvel código [${prop.code}] no dia ${formatDateBR(visitDate)} às ${visitTime}. Meu nome é ${clientName} e meu contato é ${formatPhoneNumber(clientPhone)}.`;
  const wpLink = `https://wa.me/55${r.phone}?text=${encodeURIComponent(wpText)}`;

  alert('Solicitação registrada com sucesso! Você será redirecionado para o WhatsApp do corretor para confirmar a visita.');
  window.open(wpLink, '_blank');
}

// 5. Adicionar Outro Corretor na Equipe
function handleTeamSubmit(e) {
  e.preventDefault();
  const user = State.currentUser;
  if (!user || user.type !== 'realtor') return;

  const name = document.getElementById('team-name').value.trim();
  const phone = document.getElementById('team-phone').value.replace(/\D/g, '');
  const email = document.getElementById('team-email').value.trim().toLowerCase();
  const officeAddress = document.getElementById('team-office').value.trim();
  const pass = document.getElementById('team-pass').value;

  const newRealtor = {
    id: 'corretor-' + Date.now(),
    name: name,
    phone: phone,
    email: email,
    officeAddress: officeAddress,
    avatar: generateSeedImage('realtor', 180, 180, name.split(' ').map(n=>n[0]).join('').substring(0,2), Math.floor(Math.random()*3)+1),
    officePhoto: generateSeedImage('office', 320, 200, name, 1),
    password: pass
  };

  State.realtors.push(newRealtor);
  saveStateToLocalStorage();
  closeTeamFormModal();
  populateRealtorFilterOptions();
  renderPainelCorretor('corretor-equipe');
}

function openNewTeamForm() {
  document.getElementById('team-form').reset();
  document.getElementById('team-modal').classList.add('active');
}

function closeTeamFormModal() {
  document.getElementById('team-modal').classList.remove('active');
}

function deleteRealtor(realtorId) {
  if (confirm('Tem certeza que deseja remover este corretor da sua imobiliária?')) {
    State.realtors = State.realtors.filter(r => r.id !== realtorId);
    saveStateToLocalStorage();
    populateRealtorFilterOptions();
    renderPainelCorretor('corretor-equipe');
  }
}

// --- MÁSCARAS E FORMATAÇÕES AUXILIARES ---
function formatPhoneNumber(numStr) {
  const num = numStr.replace(/\D/g, '');
  if (num.length === 11) {
    return `(${num.substring(0,2)}) ${num.substring(2,7)}-${num.substring(7)}`;
  } else if (num.length === 10) {
    return `(${num.substring(0,2)}) ${num.substring(2,6)}-${num.substring(6)}`;
  }
  return numStr;
}

function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Aplica máscaras em inputs de telefone
function setupPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  });
}

// --- LISTENERS DE BUSCA E FILTROS DINÂMICOS DO PORTAL ---
function setupFilterListeners() {
  document.getElementById('search-property-general').addEventListener('input', renderPortalGeral);
  document.getElementById('filter-type-general').addEventListener('change', renderPortalGeral);
  document.getElementById('filter-realtor-general').addEventListener('change', renderPortalGeral);
  document.getElementById('filter-price-general').addEventListener('change', renderPortalGeral);
}

// --- BOOTSTRAP INICIAL DO APP ---
window.addEventListener('DOMContentLoaded', () => {
  initializeDatabase();
  setupSidebarForUser();
  populateRealtorFilterOptions();
  setupFilterListeners();
  setupPhoneMasks();
  
  // Registrar escutadores de formulários
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('property-form').addEventListener('submit', handlePropertySubmit);
  document.getElementById('property-photo-upload').addEventListener('change', handlePropertyImageUpload);
  document.getElementById('client-form').addEventListener('submit', handleClientSubmit);
  document.getElementById('visit-form').addEventListener('submit', handleVisitSubmit);
  document.getElementById('modal-visit-form').addEventListener('submit', handlePublicScheduleSubmit);
  document.getElementById('team-form').addEventListener('submit', handleTeamSubmit);

  // Iniciar na vitrine do Portal Geral
  switchView('portal-geral');
});

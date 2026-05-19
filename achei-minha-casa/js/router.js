const Router = {
    routes: {
        '#/home': () => SiteModule.renderVitrine(),
        '#/detalhes': () => SiteModule.renderDetalhes(),
        '#/login': () => AuthModule.renderLogin(),
        '#/dashboard': () => DashboardModule.render(),
        '#/imoveis': () => ImoveisModule.renderList(),
        '#/imoveis/novo': () => ImoveisModule.renderForm(),
        '#/agenda': () => AgendaModule.render()
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    handleRoute() {
        const fullHash = window.location.hash || '#/home';
        const baseHash = fullHash.split('?')[0];
        const user = Storage.getData().currentUser;

        // Proteção de rotas
        const privateRoutes = ['#/dashboard', '#/imoveis', '#/imoveis/novo', '#/agenda'];
        if (privateRoutes.includes(baseHash) && !user) {
            window.location.hash = '#/login';
            return;
        }

        this.updateNav(user);
        const renderFn = this.routes[baseHash];
        if (renderFn) renderFn();
    },

    updateNav(user) {
        const nav = document.getElementById('nav-links');
        if (user) {
            nav.innerHTML = `
                <a href="#/dashboard">Painel</a>
                <a href="#/imoveis">Imóveis</a>
                <a href="#/agenda">Agenda</a>
                <button class="btn btn-outline" style="color:white; border-color:white" onclick="AuthModule.logout()">Sair</button>
            `;
        } else {
            nav.innerHTML = `
                <a href="#/home">Ver Imóveis</a>
                <a href="#/login" class="btn btn-primary">Acesso Corretor</a>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Router.init());
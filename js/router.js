const Router = {
  routes: {},
  currentView: null,

  register(name, handler) { this.routes[name] = handler; },

  async navigate(view) {
    if (this.currentView === view) return;
    this.currentView = view;
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });
    const main = document.getElementById('app-main');
    main.innerHTML = '<div class="placeholder">Cargando… ⏳</div>';
    try {
      const handler = this.routes[view];
      if (handler) {
        main.innerHTML = '';
        await handler(main);
      } else {
        main.innerHTML = `<div class="placeholder">Vista "${view}" en construcción 🚧</div>`;
      }
      const titles = { home: 'Inicio', bible: 'Biblia', search: 'Buscar', plans: 'Planes', library: 'Estudio' };
      document.getElementById('view-title').textContent = titles[view] || 'Selah';
      main.scrollTop = 0;
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="placeholder">Error: ${err.message}</div>`;
    }
  }
};
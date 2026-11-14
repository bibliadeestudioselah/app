const BibleLibrary = {
  data: null,

  async init() {
    if (this.data) return;
    try {
      const res = await fetch('./data/library.json');
      this.data = await res.json();
    } catch (e) {
      this.data = { dictionary: [], encyclopedia: [], strongs: [], outlines: [], maps: [] };
    }
  },

  async render(main) {
    main.innerHTML = `<div class="placeholder">⏳ Cargando biblioteca...</div>`;
    await this.init();

    main.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <button class="card lib-btn" data-tool="dictionary" style="text-align: center; cursor: pointer; padding: 16px 8px;">
          <div style="font-size: 2.2rem;">📖</div>
          <h4 style="margin-top: 8px; font-size: 0.9rem;">Diccionario</h4>
        </button>
        <button class="card lib-btn" data-tool="encyclopedia" style="text-align: center; cursor: pointer; padding: 16px 8px;">
          <div style="font-size: 2.2rem;">🏛️</div>
          <h4 style="margin-top: 8px; font-size: 0.9rem;">Enciclopedia</h4>
        </button>
        <button class="card lib-btn" data-tool="maps" style="text-align: center; cursor: pointer; padding: 16px 8px;">
          <div style="font-size: 2.2rem;">🗺️</div>
          <h4 style="margin-top: 8px; font-size: 0.9rem;">Mapas</h4>
        </button>
        <button class="card lib-btn" data-tool="strongs" style="text-align: center; cursor: pointer; padding: 16px 8px;">
          <div style="font-size: 2.2rem;">🔤</div>
          <h4 style="margin-top: 8px; font-size: 0.9rem;">Strong's</h4>
        </button>
        <button class="card lib-btn" data-tool="outlines" style="text-align: center; cursor: pointer; padding: 16px 8px;">
          <div style="font-size: 2.2rem;">📝</div>
          <h4 style="margin-top: 8px; font-size: 0.9rem;">Bosquejos</h4>
        </button>
      </div>
      <div id="library-content"></div>
    `;

    document.querySelectorAll('.lib-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showTool(btn.dataset.tool));
    });
  },

  showTool(tool) {
    const content = document.getElementById('library-content');
    if (!this.data) return;

    if (tool === 'dictionary') {
      content.innerHTML = `
        <h3 class="section-title">📖 Diccionario Bíblico</h3>
        ${this.data.dictionary.map(d => `
          <div class="card" style="margin-bottom: 16px; padding: 0; overflow: hidden;">
            <img src="${d.image}" alt="${d.term}" style="width: 100%; height: 140px; object-fit: cover;">
            <div style="padding: 16px;">
              <strong style="color: var(--accent); font-size: 1.1rem;">${d.term}</strong>
              <p style="font-size: 0.9rem; margin-top: 8px; line-height: 1.5;">${d.definition}</p>
            </div>
          </div>
        `).join('')}
      `;
    } else if (tool === 'encyclopedia') {
      content.innerHTML = `
        <h3 class="section-title">🏛️ Enciclopedia Bíblica</h3>
        ${this.data.encyclopedia.map(e => `
          <div class="card" style="margin-bottom: 16px; padding: 0; overflow: hidden;">
            <img src="${e.image}" alt="${e.title}" style="width: 100%; height: 160px; object-fit: cover;">
            <div style="padding: 16px;">
              <strong style="color: var(--accent); font-size: 1.1rem;">${e.title}</strong>
              <p style="font-size: 0.9rem; margin-top: 8px; line-height: 1.5;">${e.content}</p>
            </div>
          </div>
        `).join('')}
      `;
    } else if (tool === 'maps') {
      content.innerHTML = `
        <h3 class="section-title">🗺️ Mapas Bíblicos</h3>
        ${this.data.maps.map(m => `
          <div class="card" style="margin-bottom: 16px; padding: 0; overflow: hidden;">
            <img src="${m.image}" alt="${m.title}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 16px;">
              <strong style="color: var(--accent); font-size: 1.1rem;">${m.title}</strong>
              <p style="font-size: 0.9rem; margin-top: 8px; line-height: 1.5;">${m.description}</p>
            </div>
          </div>
        `).join('')}
      `;
    } else if (tool === 'strongs') {
      content.innerHTML = `
        <h3 class="section-title">🔤 Concordancia Strong</h3>
        ${this.data.strongs.map(s => `
          <div class="card" style="margin-bottom: 12px; padding: 16px;">
            <strong style="color: var(--accent);">${s.number} — ${s.word}</strong>
            <p style="font-size: 0.9rem; margin-top: 8px;">${s.definition}</p>
          </div>
        `).join('')}
      `;
    } else if (tool === 'outlines') {
      content.innerHTML = `
        <h3 class="section-title">📝 Bosquejos de Estudio</h3>
        ${this.data.outlines.map(o => `
          <div class="card" style="margin-bottom: 12px; padding: 16px;">
            <strong style="color: var(--accent); font-size: 1.1rem;">Libro de ${o.book}</strong>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">Tema: ${o.theme}</p>
            <ul style="font-size: 0.9rem; margin-top: 12px; padding-left: 20px; line-height: 1.6;">
              ${o.points.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      `;
    }
  }
};
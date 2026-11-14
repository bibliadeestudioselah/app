const BibleAssistant = {
  render(main, reference, verseText) {
    main.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-secondary" id="btn-back-bible" style="padding: 8px 12px; font-size: 0.9rem;">⬅️ Volver a la Biblia</button>
      </div>
      <div class="card" style="margin-bottom: 16px;">
        <h3 class="section-title">🧠 Asistente de Estudio</h3>
        <p style="color: var(--accent); font-weight: bold; margin-bottom: 8px;">${reference}</p>
        <p class="scripture-text">"${verseText}"</p>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <h4 class="section-title" style="font-size: 1rem; color: var(--accent);">📜 Contexto y Explicación</h4>
        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text);">
          Este pasaje se encuentra en el contexto de las enseñanzas bíblicas sobre la voluntad de Dios. 
          Para una comprensión más profunda, considera analizar a quién va dirigido, la situación histórica y cómo se conecta con el resto de las Escrituras.
        </p>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <h4 class="section-title" style="font-size: 1rem; color: var(--accent);">🔗 Referencias Cruzadas (Temas relacionados)</h4>
        <ul style="list-style: none; padding: 0; font-size: 0.9rem; line-height: 1.8;">
          <li>📖 Romanos 8:28 — "A los que aman a Dios, todas las cosas les ayudan a bien."</li>
          <li>📖 Proverbios 3:5-6 — "Fíate de Jehová de todo tu corazón."</li>
          <li>📖 Salmos 119:105 — "Lámpara es a mis pies tu palabra."</li>
        </ul>
      </div>

      <div class="card">
        <h4 class="section-title" style="font-size: 1rem; color: var(--accent);">💡 Aplicación Práctica</h4>
        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text);">
          Reflexiona en cómo este texto puede aplicarse a tu vida diaria hoy. Te invitamos a meditar en él y buscar la guía del Espíritu Santo para ponerlo en práctica.
        </p>
      </div>
    `;

    document.getElementById('btn-back-bible').addEventListener('click', () => {
      Router.navigate('bible');
    });
  }
};
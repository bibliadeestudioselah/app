function showToast(message, emoji = '✨') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${emoji}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

const DailyVerses = [
  { ref: 'Salmos 119:105', text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.' },
  { ref: 'Juan 3:16', text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' },
  { ref: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' }
];

document.addEventListener('DOMContentLoaded', async () => {
  await ThemeManager.init();

  Router.register('home', async (main) => {
    const randomVerse = DailyVerses[Math.floor(Math.random() * DailyVerses.length)];
    
    let announcementHtml = '';
    try {
      const resAnn = await fetch('./data/announcement.json');
      const ann = await resAnn.json();
      if (ann.active) {
        announcementHtml = `
          <div class="card" style="margin-bottom:16px; background: var(--accent-soft); color: #1B2A41; border: none;">
            <h4 style="font-weight: bold; margin-bottom: 8px;">${ann.title}</h4>
            <p style="font-size: 0.9rem; line-height: 1.5;">${ann.message}</p>
          </div>
        `;
      }
    } catch(e) {}

    main.innerHTML = `
      ${announcementHtml}
      <section class="card" style="text-align:center; margin-bottom:16px;">
        <div style="font-size:2.4rem;">🕊️</div>
        <h2 class="section-title" style="justify-content:center; margin-top:8px;">Versículo del día</h2>
        <p class="scripture-text" id="daily-verse-text" style="margin-top:16px;">"${randomVerse.text}"</p>
        <p style="color:var(--text-secondary); margin-top:12px; font-size:.85rem;" id="daily-verse-ref">— ${randomVerse.ref}</p>
        <button class="btn btn-secondary" style="margin-top:20px;" id="btn-refresh-verse">🔄 Otro versículo</button>
      </section>
      <section class="card" style="margin-top:16px; text-align:center; background: var(--surface-hover); border: none;">
        <p style="font-size:.8rem; color:var(--text-secondary); line-height: 1.5;">
          Citas bíblicas tomadas de la Reina-Valera 1960. El texto bíblico ha sido tomado de la versión Reina-Valera © 1960 Sociedades Bíblicas en América Latina; © renovado 1988 Sociedades Bíblicas Unidas.
        </p>
      </section>
    `;
    
    document.getElementById('btn-refresh-verse')?.addEventListener('click', () => {
      const newVerse = DailyVerses[Math.floor(Math.random() * DailyVerses.length)];
      document.getElementById('daily-verse-text').innerText = `"${newVerse.text}"`;
      document.getElementById('daily-verse-ref').innerText = `— ${newVerse.ref}`;
      showToast('Versículo actualizado', '🔄');
    });
  });

  Router.register('bible', async (main) => { BibleReader.render(main); });
  Router.register('search', async (main) => { BibleSearch.render(main); });
  Router.register('plans', async (main) => { ReadingPlans.render(main); });
  Router.register('library', async (main) => { BibleLibrary.render(main); });

  Router.register('about', async (main) => {
    main.innerHTML = `
      <section class="card" style="margin-bottom:16px;">
        <h3 class="section-title">🕊️ Biblia de Estudio Selah</h3>
        <p style="font-size:.95rem; color:var(--text-secondary); margin-bottom:16px; line-height: 1.5;">Una aplicación para el estudio profundo de la Palabra, 100% offline y sin fines de lucro.</p>
        <p style="font-size:.9rem; color:var(--text); line-height: 1.6;"><strong>Privacidad:</strong> Tus notas, favoritos y progreso se guardan únicamente en tu dispositivo. No tenemos servidores ni recopilamos tus datos.</p>
      </section>

      <section class="card" style="margin-bottom:16px;">
        <h3 class="section-title">💖 Apoya este ministerio</h3>
        <p style="font-size:.9rem; color:var(--text-secondary); margin-bottom:16px; line-height: 1.5;">Si deseas bendecir este trabajo voluntario, puedes hacerlo. Toca el botón para ver los datos:</p>
        
        <details style="background:var(--surface-hover); border-radius:var(--radius-md); padding:16px;">
          <summary style="cursor:pointer; font-weight:bold; color:var(--accent);">Ver datos para donaciones</summary>
          <div style="margin-top:16px; display:flex; flex-direction:column; gap:16px;">
            
            <div style="background:var(--surface); padding:16px; border-radius:var(--radius-md);">
              <p style="font-weight:bold; color:var(--accent); margin-bottom:8px;">🪙 Binance</p>
              <p style="font-size:.9rem; margin-bottom:4px;"><strong>UID:</strong> 566401325</p>
              <p style="font-size:.85rem; color:var(--text-muted); margin-bottom:12px;">Nombre: Emmanuel Manosalva</p>
              <button class="btn btn-secondary" style="width:100%; font-size:.85rem;" onclick="navigator.clipboard.writeText('566401325'); showToast('UID copiado', '📋');">Copiar UID</button>
            </div>

            <div style="background:var(--surface); padding:16px; border-radius:var(--radius-md);">
              <p style="font-weight:bold; color:var(--accent); margin-bottom:8px;">🏦 Banco de Venezuela (VES)</p>
              <p style="font-size:.9rem; margin-bottom:4px;"><strong>Cuenta:</strong> 01020645620000218630</p>
              <p style="font-size:.9rem; margin-bottom:4px;"><strong>Cédula:</strong> V-20124815</p>
              <p style="font-size:.9rem; margin-bottom:12px;"><strong>Teléfono:</strong> 04262840546</p>
              <button class="btn btn-secondary" style="width:100%; font-size:.85rem;" onclick="navigator.clipboard.writeText('01020645620000218630'); showToast('Cuenta copiada', '📋');">Copiar Cuenta</button>
            </div>

            <div style="background:var(--surface); padding:16px; border-radius:var(--radius-md);">
              <p style="font-weight:bold; color:var(--accent); margin-bottom:8px;">🏦 Banco de Venezuela (USD)</p>
              <p style="font-size:.9rem; margin-bottom:4px;"><strong>Cuenta:</strong> 01020645600000080145</p>
              <p style="font-size:.9rem; margin-bottom:12px;"><strong>Cédula:</strong> V-20124815</p>
              <button class="btn btn-secondary" style="width:100%; font-size:.85rem;" onclick="navigator.clipboard.writeText('01020645600000080145'); showToast('Cuenta copiada', '📋');">Copiar Cuenta</button>
            </div>
            
            <p style="font-size:.9rem; margin-top:8px; text-align:center;">📧 Contacto: <br><strong>creativapaginaweb@gmail.com</strong></p>
          </div>
        </details>
      </section>

      <section class="card" style="margin-bottom:16px;">
        <h3 class="section-title">🔐 Panel de Administrador</h3>
        <p style="font-size:.9rem; color:var(--text-secondary); margin-bottom:16px; line-height: 1.5;">Genera el código para el tablón de anuncios. Luego ve a GitHub, abre <code>data/announcement.json</code>, borra todo y pega el nuevo código.</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <input type="text" id="adm-title" placeholder="Título del anuncio" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border); background:var(--bg); color:var(--text);">
          <textarea id="adm-msg" placeholder="Mensaje..." rows="3" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border); background:var(--bg); color:var(--text); font-family:inherit;"></textarea>
          <button class="btn" onclick="generateAnnouncement()">Generar y Copiar JSON</button>
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">🏷️ Créditos Legales</h3>
        <p style="font-size:.85rem; color:var(--text-secondary); line-height: 1.6;">Citas bíblicas tomadas de la Reina-Valera 1960. El texto bíblico ha sido tomado de la versión Reina-Valera © 1960 Sociedades Bíblicas en América Latina; © renovado 1988 Sociedades Bíblicas Unidas.</p>
      </section>
    `;
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.view));
  });

  let tapCount = 0, tapTimer;
  document.querySelector('.app-header')?.addEventListener('click', () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 400);
    if (tapCount === 2) { ThemeManager.toggle(); tapCount = 0; }
  });

  document.getElementById('btn-settings')?.addEventListener('click', () => ThemeManager.toggle());
  document.getElementById('btn-menu')?.addEventListener('click', () => Router.navigate('about'));

  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    Router.navigate('home');
  }, 900);
});

// Función global para generar el JSON del anuncio
window.generateAnnouncement = function() {
  const title = document.getElementById('adm-title').value || "📢 Aviso Importante";
  const msg = document.getElementById('adm-msg').value || "Escribe tu mensaje aquí.";
  
  const jsonCode = `{\n  "active": true,\n  "title": "${title}",\n  "message": "${msg}",\n  "type": "info"\n}`;
  
  navigator.clipboard.writeText(jsonCode).then(() => {
    showToast('¡JSON copiado! Ve a GitHub y pégalo.', '📋');
  }).catch(() => {
    alert("Copia manualmente este código:\n\n" + jsonCode);
  });
};
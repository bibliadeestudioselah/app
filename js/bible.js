const BibleReader = {
  data: null,
  currentBookIndex: 0,
  currentChapterIndex: 0,

  async init() {
    if (this.data) return;
    try {
      const response = await fetch('./data/RVR1960.json');
      if (!response.ok) throw new Error('No se pudo cargar el texto bíblico');
      this.data = await response.json();
    } catch (error) {
      console.error('Error cargando la Biblia:', error);
      throw error;
    }
  },

  render(main) {
    if (!this.data) {
      main.innerHTML = `<div class="placeholder">⏳ Cargando el texto bíblico...</div>`;
      this.init().then(() => this.render(main)).catch(err => {
        main.innerHTML = `<div class="placeholder">❌ Error: ${err.message}</div>`;
      });
      return;
    }

    const book = this.data[this.currentBookIndex];
    const chapter = book.chapters[this.currentChapterIndex];
    
    const bookOptions = this.data.map((b, i) => 
      `<option value="${i}" ${i === this.currentBookIndex ? 'selected' : ''}>${b.name}</option>`
    ).join('');

    const chapterOptions = book.chapters.map((_, i) => 
      `<option value="${i}" ${i === this.currentChapterIndex ? 'selected' : ''}>Capítulo ${i + 1}</option>`
    ).join('');

    const versesHtml = chapter.items.map(item => {
      if (item.type !== 'verse') return ''; 

      let finalHtml = '';
      if (item.rlw_lines && item.rlw_lines.length > 0) {
        item.rlw_lines.forEach(sectionArray => {
          sectionArray.forEach(word => {
            if (word.rl) {
              finalHtml += `<span class="words-of-god">${word.text}</span> `;
            } else {
              finalHtml += word.text + ' ';
            }
          });
        });
      } else {
        finalHtml = item.lines.join(' ');
      }

      const verseNum = item.verse_numbers[0];
      const verseTextForFav = item.lines.join(' ');
      const safeText = verseTextForFav.replace(/"/g, '&quot;');

      return `
        <div class="verse-item" style="margin-bottom: 16px; display: flex; gap: 8px; align-items: flex-start;">
          <span style="color: var(--accent); font-weight: bold; font-size: 0.85rem; min-width: 24px; margin-top: 4px;">${verseNum}</span>
          <p class="scripture-text" style="margin: 0; flex: 1;">${finalHtml.trim()}</p>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button class="icon-btn fav-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🤍</button>
            <button class="icon-btn ai-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🧠</button>
            <button class="icon-btn share-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🔗</button>
          </div>
        </div>
      `;
    }).join('');

    main.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <select id="book-selector" class="btn btn-secondary" style="flex: 2; padding: 8px; text-align: left;">${bookOptions}</select>
        <select id="chapter-selector" class="btn btn-secondary" style="flex: 1; padding: 8px;">${chapterOptions}</select>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <button class="btn btn-secondary" id="btn-listen" style="padding: 6px 12px; font-size: 0.85rem;">🎧 Escuchar Audio</button>
        <button class="btn btn-secondary" id="btn-download" style="padding: 6px 12px; font-size: 0.85rem;">📥 Descargar Audio</button>
      </div>

      <div class="card" style="padding: 16px;">
        ${versesHtml || '<p class="placeholder">Este capítulo no tiene versículos disponibles.</p>'}
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 16px;">
        <button class="btn btn-secondary" id="prev-chapter" ${this.currentChapterIndex === 0 ? 'disabled' : ''}>⬅️ Anterior</button>
        <button class="btn btn-secondary" id="next-chapter" ${this.currentChapterIndex === book.chapters.length - 1 ? 'disabled' : ''}>Siguiente ➡️</button>
      </div>
    `;

    // Eventos de selectores y navegación
    document.getElementById('book-selector').addEventListener('change', (e) => {
      this.currentBookIndex = parseInt(e.target.value);
      this.currentChapterIndex = 0;
      this.render(main);
    });

    document.getElementById('chapter-selector').addEventListener('change', (e) => {
      this.currentChapterIndex = parseInt(e.target.value);
      this.render(main);
    });

    document.getElementById('prev-chapter')?.addEventListener('click', () => {
      if (this.currentChapterIndex > 0) {
        this.currentChapterIndex--;
        this.render(main);
      }
    });

    document.getElementById('next-chapter')?.addEventListener('click', () => {
      if (this.currentChapterIndex < book.chapters.length - 1) {
        this.currentChapterIndex++;
        this.render(main);
      }
    });

    // Botones de Favoritos
    document.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ref = btn.dataset.ref;
        const text = btn.dataset.text;
        await SelahDB.dbSet('favorites', { key: ref, ref, text, timestamp: Date.now() });
        btn.textContent = '❤️';
        showToast('Añadido a favoritos', '⭐');
      });
    });

    // Botones de Asistente IA
    document.querySelectorAll('.ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('view-title').textContent = 'Asistente';
        BibleAssistant.render(main, btn.dataset.ref, btn.dataset.text);
      });
    });

    // Botones de Compartir
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ref = btn.dataset.ref;
        const text = btn.dataset.text;
        const shareData = {
          title: 'Biblia de Estudio Selah',
          text: `"${text}"\n\n— ${ref} (RVR1960)`,
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(shareData.text);
            showToast('Texto copiado al portapapeles', '📋');
          }
        } catch (err) {
          console.log('Error al compartir:', err);
        }
      });
    });

    // Audio
    document.getElementById('btn-listen').addEventListener('click', () => {
      BibleAudio.play(book.name, this.currentChapterIndex + 1);
    });

    document.getElementById('btn-download').addEventListener('click', () => {
      BibleAudio.play(book.name, this.currentChapterIndex + 1); // Reutilizamos la lógica que guarda en DB
    });
  }
};
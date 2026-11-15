const BibleReader = {
  data: null,
  currentBookIndex: 0,
  currentChapterIndex: 0,

  async init() {
    if (this.data) return;
    try {
      const response = await fetch('./data/RVR1960.json');
      if (!response.ok) throw new Error('No se pudo encontrar el archivo de la Biblia.');
      const rawData = await response.json();
      
      // Adaptador para el formato del JSON de mrk214/bible-data-es-spa
      if (Array.isArray(rawData)) {
        this.data = rawData;
      } else if (rawData.books) {
        this.data = rawData.books;
      } else {
        // Si el JSON tiene un solo libro (como en algunos repositorios)
        this.data = Object.keys(rawData).map(key => rawData[key]);
      }

      if (!this.data || this.data.length === 0) throw new Error('El archivo JSON está vacío o no tiene el formato esperado.');
      console.log('✅ Biblia cargada:', this.data.length, 'libros');
    } catch (error) {
      console.error('Error cargando la Biblia:', error);
      throw error;
    }
  },

  render(main) {
    if (!this.data) {
      main.innerHTML = `<div class="placeholder">⏳ Cargando el texto bíblico...</div>`;
      this.init().then(() => this.render(main)).catch(err => {
        main.innerHTML = `<div class="placeholder">❌ Error: ${err.message}<br><br><button class="btn btn-secondary" onclick="location.reload()">Reintentar</button></div>`;
      });
      return;
    }

    const book = this.data[this.currentBookIndex];
    if (!book || !book.chapters) {
      main.innerHTML = `<div class="placeholder">❌ No se encontraron capítulos para este libro.</div>`;
      return;
    }

    const chapter = book.chapters[this.currentChapterIndex];
    
    const bookOptions = this.data.map((b, i) => 
      `<option value="${i}" ${i === this.currentBookIndex ? 'selected' : ''}>${b.name || b.book_usfm}</option>`
    ).join('');

    const chapterOptions = book.chapters.map((_, i) => 
      `<option value="${i}" ${i === this.currentChapterIndex ? 'selected' : ''}>Capítulo ${i + 1}</option>`
    ).join('');

    let contentHtml = '';
    
    // Iterar sobre los items del capítulo (títulos, versículos, etc.)
    if (chapter.items) {
      contentHtml = chapter.items.map(item => {
        // Renderizar títulos de sección (heading1, section1, etc.)
        if (item.type && item.type.startsWith('heading') || item.type && item.type.startsWith('section')) {
          const level = item.type.includes('1') ? 'h2' : 'h3';
          const text = item.lines ? item.lines.join(' ') : '';
          return `<${level} class="passage-title" style="margin: 24px 0 12px 0; color: var(--accent); font-family: var(--font-scripture);">${text}</${level}>`;
        }
        
        // Renderizar versículos
        if (item.type === 'verse') {
          let finalHtml = '';
          if (item.rlw_lines && item.rlw_lines.length > 0) {
            // Palabras en rojo
            item.rlw_lines.forEach(sectionArray => {
              sectionArray.forEach(word => {
                if (word.rl) finalHtml += `<span class="words-of-god">${word.text}</span> `;
                else finalHtml += word.text + ' ';
              });
            });
          } else {
            // Texto normal
            finalHtml = item.lines ? item.lines.join(' ') : '';
          }

          const verseNum = item.verse_numbers ? item.verse_numbers[0] : (item.verse || '');
          const verseTextForFav = item.lines ? item.lines.join(' ') : finalHtml;
          const safeText = verseTextForFav.replace(/"/g, '&quot;');

          return `
            <div class="verse-item" style="margin-bottom: 16px; display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--accent); font-weight: bold; font-size: 0.85rem; min-width: 24px; margin-top: 4px;">${verseNum}</span>
              <p class="scripture-text" style="margin: 0; flex: 1;">${finalHtml.trim()}</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="icon-btn fav-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🤍</button>
                <button class="icon-btn ai-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🧠</button>
                <button class="icon-btn share-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🔗</button>
              </div>
            </div>
          `;
        }
        return ''; // Ignorar otros tipos por ahora
      }).join('');
    } else {
      contentHtml = '<p class="placeholder">El formato de este capítulo no es compatible.</p>';
    }

    main.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <select id="book-selector" class="btn btn-secondary" style="flex: 2; padding: 8px; text-align: left;">${bookOptions}</select>
        <select id="chapter-selector" class="btn btn-secondary" style="flex: 1; padding: 8px;">${chapterOptions}</select>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <button class="btn btn-secondary" id="btn-listen" style="padding: 6px 12px; font-size: 0.85rem;">🎧 Escuchar</button>
        <button class="btn btn-secondary" id="btn-download" style="padding: 6px 12px; font-size: 0.85rem;">📥 Descargar</button>
      </div>

      <div class="card">
        ${contentHtml}
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 16px;">
        <button class="btn btn-secondary" id="prev-chapter" ${this.currentChapterIndex === 0 ? 'disabled' : ''}>⬅️ Anterior</button>
        <button class="btn btn-secondary" id="next-chapter" ${this.currentChapterIndex === book.chapters.length - 1 ? 'disabled' : ''}>Siguiente ➡️</button>
      </div>
    `;

    // Eventos de los selectores
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

    // Funcionalidad de los botones (favoritos, IA, compartir, audio)
    this.attachButtonEvents(book);
  },

  attachButtonEvents(book) {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ref = btn.dataset.ref;
        const text = btn.dataset.text;
        await SelahDB.dbSet('favorites', { key: ref, ref, text, timestamp: Date.now() });
        btn.textContent = '❤️';
        showToast('Añadido a favoritos', '⭐');
      });
    });

    document.querySelectorAll('.ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('view-title').textContent = 'Asistente';
        BibleAssistant.render(document.getElementById('app-main'), btn.dataset.ref, btn.dataset.text);
      });
    });

    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ref = btn.dataset.ref;
        const text = btn.dataset.text;
        const shareData = { title: 'Biblia de Estudio Selah', text: `"${text}"\n\n— ${ref} (RVR1960)` };
        try {
          if (navigator.share) await navigator.share(shareData);
          else { await navigator.clipboard.writeText(shareData.text); showToast('Texto copiado', '📋'); }
        } catch (err) { console.log('Error al compartir:', err); }
      });
    });

    document.getElementById('btn-listen')?.addEventListener('click', () => BibleAudio.play(book.name, this.currentChapterIndex + 1));
    document.getElementById('btn-download')?.addEventListener('click', () => BibleAudio.play(book.name, this.currentChapterIndex + 1));
  }
};
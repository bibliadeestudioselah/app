const BibleReader = {
  data: null,
  currentBookIndex: 0,
  currentChapterIndex: 0,

  async init() {
    if (this.data) return;
    try {
      const response = await fetch('./data/RVR1960.json');
      if (!response.ok) throw new Error('No se pudo encontrar el archivo.');
      const rawData = await response.json();
      
      // Adaptador inteligente para leer el formato del JSON
      if (Array.isArray(rawData)) {
        this.data = rawData;
      } else if (rawData.books) {
        this.data = rawData.books;
      } else if (rawData.data) {
        this.data = rawData.data;
      } else {
        // Si es un objeto con libros por nombre
        this.data = Object.keys(rawData).map(key => {
          if (rawData[key].chapters) return { name: key, chapters: rawData[key].chapters };
          return null;
        }).filter(Boolean);
      }

      if (!this.data || this.data.length === 0) throw new Error('El archivo JSON está vacío o tiene un formato desconocido.');
      
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
      main.innerHTML = `<div class="placeholder">❌ El libro actual no tiene capítulos válidos en el archivo JSON.</div>`;
      return;
    }

    const chapter = book.chapters[this.currentChapterIndex];
    
    const bookOptions = this.data.map((b, i) => 
      `<option value="${i}" ${i === this.currentBookIndex ? 'selected' : ''}>${b.name}</option>`
    ).join('');

    const chapterOptions = book.chapters.map((_, i) => 
      `<option value="${i}" ${i === this.currentChapterIndex ? 'selected' : ''}>Capítulo ${i + 1}</option>`
    ).join('');

    let versesHtml = '';
    
    if (chapter.items) {
      versesHtml = chapter.items.map(item => {
        if (item.type !== 'verse') return ''; 
        let finalHtml = '';
        if (item.rlw_lines && item.rlw_lines.length > 0) {
          item.rlw_lines.forEach(sectionArray => {
            sectionArray.forEach(word => {
              if (word.rl) finalHtml += `<span class="words-of-god">${word.text}</span> `;
              else finalHtml += word.text + ' ';
            });
          });
        } else {
          finalHtml = item.lines ? item.lines.join(' ') : '';
        }
        const verseNum = item.verse_numbers ? item.verse_numbers[0] : (item.verse || '');
        const verseTextForFav = item.lines ? item.lines.join(' ') : finalHtml;
        const safeText = verseTextForFav.replace(/"/g, '&quot;');

        return `
          <div class="verse-item" style="margin-bottom: 20px; display: flex; gap: 10px; align-items: flex-start;">
            <span style="color: var(--accent); font-weight: bold; font-size: 0.85rem; min-width: 24px; margin-top: 4px;">${verseNum}</span>
            <p class="scripture-text" style="margin: 0; flex: 1;">${finalHtml.trim()}</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="icon-btn fav-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🤍</button>
              <button class="icon-btn ai-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🧠</button>
              <button class="icon-btn share-btn" data-ref="${book.name} ${this.currentChapterIndex + 1}:${verseNum}" data-text="${safeText}" style="font-size: 1rem; padding: 0;">🔗</button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      versesHtml = '<p class="placeholder">Formato de capítulo no reconocido en el JSON.</p>';
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
        ${versesHtml}
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 16px;">
        <button class="btn btn-secondary" id="prev-chapter" ${this.currentChapterIndex === 0 ? 'disabled' : ''}>⬅️ Anterior</button>
        <button class="btn btn-secondary" id="next-chapter" ${this.currentChapterIndex === book.chapters.length - 1 ? 'disabled' : ''}>Siguiente ➡️</button>
      </div>
    `;

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
        BibleAssistant.render(main, btn.dataset.ref, btn.dataset.text);
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
        } catch (err) { console.log('Error:', err); }
      });
    });

    document.getElementById('btn-listen').addEventListener('click', () => BibleAudio.play(book.name, this.currentChapterIndex + 1));
    document.getElementById('btn-download').addEventListener('click', () => BibleAudio.play(book.name, this.currentChapterIndex + 1));
  }
};
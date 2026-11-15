const BibleSearch = {
  miniSearch: null,
  isIndexing: false,

  async buildIndex() {
    if (this.miniSearch || this.isIndexing) return;
    this.isIndexing = true;
    
    try {
      // Aseguramos que la Biblia esté cargada antes de indexar
      if (!BibleReader.data) {
        await BibleReader.init();
      }
      
      const data = BibleReader.data;
      if (!data) throw new Error('No hay datos de la Biblia para indexar.');

      const documents = [];
      data.forEach((book) => {
        if (!book.chapters) return;
        book.chapters.forEach((chapter, chapterIndex) => {
          if (!chapter.items) return;
          chapter.items.forEach(item => {
            if (item.type === 'verse') {
              const verseNum = item.verse_numbers ? item.verse_numbers[0] : (item.verse || '');
              const text = item.lines ? item.lines.join(' ') : '';
              documents.push({
                id: `${book.name} ${chapterIndex + 1}:${verseNum}`,
                book: book.name,
                chapter: chapterIndex + 1,
                verse: verseNum,
                text: text
              });
            }
          });
        });
      });

      this.miniSearch = new MiniSearch({
        fields: ['text', 'book'],
        storeFields: ['book', 'chapter', 'verse', 'text'],
        searchOptions: {
          boost: { book: 2 },
          fuzzy: 0.2,
          processTerm: (term) => {
            return term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          }
        }
      });

      this.miniSearch.addAll(documents);
      console.log('✅ Índice de búsqueda construido con', documents.length, 'versículos');
    } catch (error) {
      console.error('Error construyendo el índice:', error);
    } finally {
      this.isIndexing = false;
    }
  },

  render(main) {
    main.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <input type="text" id="search-input" placeholder="🔍 Buscar palabra, personaje o tema..." style="width: 100%; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 1rem;">
      </div>
      <div id="search-results">
        <p class="placeholder">Escribe algo para comenzar a buscar...</p>
      </div>
    `;

    const input = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');

    // Construir el índice en segundo plano
    if (!this.miniSearch) {
      resultsDiv.innerHTML = '<p class="placeholder">⏳ Preparando el índice de búsqueda...</p>';
      this.buildIndex().then(() => {
        resultsDiv.innerHTML = '<p class="placeholder">✅ Índice listo. Escribe para buscar.</p>';
      });
    }

    input.addEventListener('input', () => {
      if (!this.miniSearch) return;
      const query = input.value.trim();
      
      if (query.length < 2) {
        resultsDiv.innerHTML = '<p class="placeholder">Escribe al menos 2 letras...</p>';
        return;
      }

      const results = this.miniSearch.search(query).slice(0, 50); 
      
      if (results.length === 0) {
        resultsDiv.innerHTML = '<p class="placeholder">😕 No se encontraron resultados.</p>';
        return;
      }

      resultsDiv.innerHTML = results.map(r => `
        <div class="card" style="margin-bottom: 12px; padding: 16px;">
          <p style="font-size: 0.85rem; color: var(--accent); font-weight: bold; margin-bottom: 8px;">${r.book} ${r.chapter}:${r.verse}</p>
          <p class="scripture-text" style="font-size: 0.95rem; line-height: 1.6;">${r.text}</p>
        </div>
      `).join('');
    });
  }
};
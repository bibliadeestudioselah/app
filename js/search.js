const BibleSearch = {
  miniSearch: null,
  isIndexing: false,

  async buildIndex() {
    if (this.miniSearch || this.isIndexing) return;
    this.isIndexing = true;
    
    try {
      const response = await fetch('./data/RVR1960.json');
      const data = await response.json();
      
      const documents = [];
      data.forEach((book) => {
        book.chapters.forEach((chapter, chapterIndex) => {
          chapter.items.forEach(item => {
            if (item.type === 'verse') {
              const verseNum = item.verse_numbers[0];
              const text = item.lines.join(' ');
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
            return term.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
          }
        }
      });

      this.miniSearch.addAll(documents);
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
        <div class="card" style="margin-bottom: 12px; padding: 12px;">
          <p style="font-size: 0.8rem; color: var(--accent); font-weight: bold; margin-bottom: 4px;">${r.book} ${r.chapter}:${r.verse}</p>
          <p class="scripture-text" style="font-size: 0.95rem;">${r.text}</p>
        </div>
      `).join('');
    });
  }
};
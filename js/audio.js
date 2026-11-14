const BibleAudio = {
  currentAudioUrl: null,
  audioElement: null,
  isPlaying: false,

  async play(bookName, chapterNum) {
    const key = `${bookName}_${chapterNum}`;
    
    // UI del reproductor
    this.showPlayerUI(key);

    const cached = await SelahDB.dbGet('audioCache', key);
    if (cached && cached.blob) {
      this.loadAudio(URL.createObjectURL(cached.blob), key);
      return;
    }

    try {
      const resMap = await fetch('./data/audio-map.json');
      const map = await resMap.json();
      const audioUrl = map[key];

      if (!audioUrl) {
        showToast('Audio no disponible para este capítulo aún.', '⚠️');
        this.closePlayer();
        return;
      }

      showToast('Descargando audio...', '📥');
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      await SelahDB.dbSet('audioCache', { key, blob });
      showToast('Audio guardado en el dispositivo', '💾');
      this.loadAudio(URL.createObjectURL(blob), key);
      
    } catch (e) {
      console.error(e);
      showToast('Error al descargar audio', '❌');
      this.closePlayer();
    }
  },

  showPlayerUI(title) {
    let player = document.getElementById('audio-player');
    if (!player) {
      player = document.createElement('div');
      player.id = 'audio-player';
      player.className = 'audio-player';
      document.body.appendChild(player);
    }
    
    player.innerHTML = `
      <div class="audio-player-header">
        <div>
          <p class="audio-player-title">🎧 Audio: ${title.replace('_', ' ')}</p>
          <p class="audio-player-status" id="audio-status">Cargando...</p>
        </div>
        <button class="icon-btn" id="btn-close-audio" style="font-size:1.2rem;">❌</button>
      </div>
      <div class="audio-player-controls">
        <button class="icon-btn" id="btn-play-pause" style="font-size:1.5rem;">▶️</button>
        <input type="range" id="audio-progress" value="0" min="0" max="100" style="flex:1;">
        <span id="audio-time" style="font-size:0.75rem; color:var(--text-secondary); min-width: 35px;">0:00</span>
      </div>
    `;

    document.getElementById('btn-close-audio').onclick = () => this.closePlayer();
    
    // Animación de entrada
    setTimeout(() => player.classList.add('active'), 10);
  },

  loadAudio(url, title) {
    if (this.audioElement) {
      this.audioElement.pause();
      URL.revokeObjectURL(this.currentAudioUrl);
    }

    this.currentAudioUrl = url;
    this.audioElement = new Audio(url);
    const status = document.getElementById('audio-status');
    const btnPlay = document.getElementById('btn-play-pause');
    const progress = document.getElementById('audio-progress');
    const timeDisplay = document.getElementById('audio-time');

    status.textContent = 'Listo para reproducir';

    btnPlay.onclick = () => {
      if (this.audioElement.paused) {
        this.audioElement.play();
        btnPlay.textContent = '⏸️';
        status.textContent = 'Reproduciendo...';
      } else {
        this.audioElement.pause();
        btnPlay.textContent = '▶️';
        status.textContent = 'Pausado';
      }
    };

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement.duration) {
        const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        progress.value = percent;
        
        const mins = Math.floor(this.audioElement.currentTime / 60);
        const secs = Math.floor(this.audioElement.currentTime % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${mins}:${secs}`;
      }
    };

    progress.oninput = () => {
      if (this.audioElement.duration) {
        this.audioElement.currentTime = (progress.value / 100) * this.audioElement.duration;
      }
    };

    this.audioElement.onended = () => {
      btnPlay.textContent = '▶️';
      status.textContent = 'Finalizado';
    };
  },

  closePlayer() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    const player = document.getElementById('audio-player');
    if (player) {
      player.classList.remove('active');
      setTimeout(() => player.remove(), 300);
    }
  }
};
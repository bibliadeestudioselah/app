const ReadingPlans = {
  data: null,
  currentPlan: null,
  progress: {},

  async init() {
    if (!this.data) {
      try {
        const res = await fetch('./data/plans.json');
        const json = await res.json();
        this.data = json.plans;
      } catch (e) {
        this.data = [];
      }
    }
    const savedProgress = await SelahDB.dbGetAll('readingPlans');
    savedProgress.forEach(p => { this.progress[p.planId] = p.completedDays; });
  },

  async render(main) {
    await this.init();

    if (!this.currentPlan) {
      // Vista de lista de planes
      main.innerHTML = `
        <h3 class="section-title">🗓️ Planes de Lectura</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${this.data.map(p => `
            <div class="card plan-select-btn" data-id="${p.id}" style="cursor: pointer;">
              <h4 style="color: var(--accent); font-size: 1.1rem;">${p.name}</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${p.desc}</p>
            </div>
          `).join('')}
        </div>
      `;

      document.querySelectorAll('.plan-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentPlan = this.data.find(p => p.id === btn.dataset.id);
          this.render(main);
        });
      });
      return;
    }

    // Vista de progreso del plan seleccionado
    const completed = this.progress[this.currentPlan.id] || [];
    const percent = Math.round((completed.length / this.currentPlan.days.length) * 100);

    main.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="section-title" style="margin: 0;">${this.currentPlan.name}</h3>
        <button class="btn btn-secondary" id="btn-back-plans" style="padding: 6px 12px; font-size: 0.8rem;">⬅️ Volver</button>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <p style="font-size: 0.9rem; margin-bottom: 8px;">Progreso: <strong>${completed.length} de ${this.currentPlan.days.length} días</strong></p>
        <div style="width: 100%; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
          <div style="width: ${percent}%; height: 100%; background: var(--accent); transition: width 0.3s;"></div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${this.currentPlan.days.map(d => {
          const isDone = completed.includes(d.day);
          return `
            <div class="card" style="padding: 12px; display: flex; justify-content: space-between; align-items: center; opacity: ${isDone ? '0.6' : '1'};">
              <div>
                <strong style="color: var(--accent);">Día ${d.day}</strong>
                <p style="font-size: 0.85rem; margin-top: 4px;">${d.readings.join(', ')}</p>
              </div>
              <button class="icon-btn mark-done-btn" data-day="${d.day}" style="font-size: 1.5rem;">
                ${isDone ? '✅' : '⭕'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-back-plans').addEventListener('click', () => {
      this.currentPlan = null;
      this.render(main);
    });

    document.querySelectorAll('.mark-done-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const day = parseInt(btn.dataset.day);
        let currentCompleted = this.progress[this.currentPlan.id] || [];
        
        if (currentCompleted.includes(day)) {
          currentCompleted = currentCompleted.filter(d => d !== day);
        } else {
          currentCompleted.push(day);
        }
        
        this.progress[this.currentPlan.id] = currentCompleted;
        await SelahDB.dbSet('readingPlans', { planId: this.currentPlan.id, completedDays: currentCompleted });
        this.render(main);
      });
    });
  }
};
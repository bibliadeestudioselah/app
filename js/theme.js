const ThemeManager = {
  async init() {
    const saved = await SelahDB.dbGet('settings', 'theme');
    const theme = saved?.value || 'light';
    this.apply(theme);
  },
  apply(theme) {
    document.body.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0E1116' : theme === 'sepia' ? '#F4ECD8' : '#FBF7EF';
    SelahDB.dbSet('settings', { key: 'theme', value: theme });
  },
  toggle() {
    const current = document.body.dataset.theme;
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'sepia' : 'light';
    this.apply(next);
  }
};
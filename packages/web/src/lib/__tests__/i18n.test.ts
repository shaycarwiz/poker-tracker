import i18n from '../i18n';

describe('i18n Configuration', () => {
  beforeAll(() => {
    // Initialize i18n for testing
    i18n.init();
  });

  it('should have Hebrew as default language', () => {
    expect(i18n.language).toBe('he');
  });

  it('should have Hebrew language available', () => {
    expect(i18n.hasResourceBundle('he', 'translation')).toBe(true);
  });

  it('should translate English text correctly', () => {
    i18n.changeLanguage('en');
    const translation = i18n.t('common.loading');
    expect(translation).toBe('Loading...');
  });

  it('should translate Hebrew text correctly', () => {
    i18n.changeLanguage('he');
    const translation = i18n.t('common.loading');
    expect(translation).toBe('טוען...');
  });

  it('should handle interpolation correctly', () => {
    i18n.changeLanguage('en');
    const translation = i18n.t('dashboard.title', { name: 'John' });
    expect(translation).toBe('Welcome back, John!');
  });

  it('should handle Hebrew interpolation correctly', () => {
    i18n.changeLanguage('he');
    const translation = i18n.t('dashboard.title', { name: 'יוחנן' });
    expect(translation).toBe('ברוך הבא, יוחנן!');
  });

  it('should fallback to English for missing translations', () => {
    i18n.changeLanguage('he');
    const translation = i18n.t('nonexistent.key');
    expect(translation).toBe('nonexistent.key');
  });

  afterEach(() => {
    i18n.changeLanguage('he');
  });
});


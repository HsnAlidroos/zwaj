import { Check } from 'lucide-react';

// Keep in sync with api/_db.js THEMES and src/styles/palette.css
export const THEMES = [
    { id: 'gold', ar: 'ذهبي', en: 'Gold', colors: ['#D4AF37', '#F5F3EE'] },
    { id: 'rose', ar: 'وردي', en: 'Rose', colors: ['#D46A86', '#FBF1F3'] },
    { id: 'sage', ar: 'زيتوني', en: 'Sage', colors: ['#6F9A6B', '#F1F4EE'] },
    { id: 'lavender', ar: 'بنفسجي', en: 'Lavender', colors: ['#8E74C4', '#F4F1FA'] },
    { id: 'ocean', ar: 'أزرق', en: 'Ocean', colors: ['#3A8FB7', '#EEF5F8'] }
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'gold';

export function applyTheme(theme: string | null | undefined) {
    document.documentElement.dataset.theme = THEMES.some(t => t.id === theme) ? theme! : DEFAULT_THEME;
}

interface ThemePickerProps {
    value: string;
    language: string;
    onChange: (theme: ThemeId) => void;
}

export function ThemePicker({ value, language, onChange }: ThemePickerProps) {
    return (
        <div className="flex flex-wrap gap-3" role="radiogroup">
            {THEMES.map(theme => {
                const selected = theme.id === value;
                return (
                    <button
                        key={theme.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(theme.id)}
                        className="flex flex-col items-center gap-1 text-xs text-taupe"
                    >
                        <span
                            className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition-transform ${selected ? 'scale-110' : 'hover:scale-105'}`}
                            style={{
                                background: `linear-gradient(135deg, ${theme.colors[0]} 50%, ${theme.colors[1]} 50%)`,
                                borderColor: selected ? theme.colors[0] : 'transparent'
                            }}
                        >
                            {selected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </span>
                        {language === 'ar' ? theme.ar : theme.en}
                    </button>
                );
            })}
        </div>
    );
}

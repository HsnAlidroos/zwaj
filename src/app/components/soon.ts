// A countdown can be created before the date is set; wedding_date is then stored as 'soon'
export const SOON = 'soon';

// Animation around the "soon" box, chosen from the profile; sparkle when not chosen
export type SoonStyle = 'none' | 'fire' | 'sparkle';
export const DEFAULT_SOON_STYLE: SoonStyle = 'sparkle';

export function isSoon(date?: string | null) {
    return date === SOON;
}

export function soonLabel(language: string) {
    return language === 'ar' ? 'قريباً' : 'Soon';
}

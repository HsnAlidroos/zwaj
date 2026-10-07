// A countdown can be created before the date is set; wedding_date is then stored as 'soon'
export const SOON = 'soon';

// Optional animation around the "soon" box, chosen from the profile (off by default)
export type SoonStyle = 'fire' | 'sparkle';

export function isSoon(date?: string | null) {
    return date === SOON;
}

export function soonLabel(language: string) {
    return language === 'ar' ? 'قريباً' : 'Soon';
}

// A countdown can be created before the date is set; wedding_date is then stored as 'soon'
// 'soon-fire' is the same, shown with a fire animation around it
export const SOON = 'soon';
export const SOON_FIRE = 'soon-fire';

export function isSoon(date?: string | null) {
    return date === SOON || date === SOON_FIRE;
}

export function soonLabel(language: string) {
    return language === 'ar' ? 'قريباً' : 'Soon';
}

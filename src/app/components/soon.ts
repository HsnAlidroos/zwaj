// A countdown can be created before the date is set; wedding_date is then stored as 'soon'
export const SOON = 'soon';

export function isSoon(date?: string | null) {
    return date === SOON;
}

export function soonLabel(language: string) {
    return language === 'ar' ? 'قريباً' : 'Soon';
}

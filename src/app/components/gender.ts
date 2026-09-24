// Small wording differences between a groom's page and a bride's page
export type Gender = 'male' | 'female';

export function isFemale(gender?: string | null) {
    return gender === 'female';
}

export const genderText = {
    ar: {
        label: { male: 'عريس', female: 'عروس' },
        // Shown under the name on the countdown page
        role: { male: 'العريس', female: 'العروس' },
        subtitle: { male: 'العدّ التنازلي ليوم زفافه', female: 'العدّ التنازلي ليوم زفافها' },
        congrats: { male: 'مبارك للعريس', female: 'مبارك للعروس' },
        dua: {
            male: 'بارك الله لك وبارك عليك وجمع بينكما في خير',
            female: 'بارك الله لكِ وبارك عليكِ وجمع بينكما في خير'
        },
        bioPlaceholder: { male: 'اكتب نبذة عن زواجك…', female: 'اكتبي نبذة عن زواجكِ…' }
    },
    en: {
        label: { male: 'Groom', female: 'Bride' },
        role: { male: 'The groom', female: 'The bride' },
        subtitle: { male: 'Counting down to his special day', female: 'Counting down to her special day' },
        congrats: { male: 'Congratulations', female: 'Congratulations' },
        dua: {
            male: 'May Allah bless you and bring you together in goodness',
            female: 'May Allah bless you and bring you together in goodness'
        },
        bioPlaceholder: { male: 'Write something about your wedding…', female: 'Write something about your wedding…' }
    }
};

type Key = keyof typeof genderText.ar;

export function forGender(key: Key, gender: string | null | undefined, language: string) {
    const table = genderText[language === 'ar' ? 'ar' : 'en'];
    return table[key][isFemale(gender) ? 'female' : 'male'];
}

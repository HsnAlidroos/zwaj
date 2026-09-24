import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PasswordInput } from '@/app/components/PasswordInput';
import { ThemePicker, DEFAULT_THEME } from '@/app/components/ThemePicker';

interface DatePickerProps {
    // Receives the chosen date and names; may throw to show an error
    onSubmit: (date: string, nameAr: string, nameEn: string, pin: string, theme: string, gender: string) => void | Promise<void>;
    language: string;
}

export function DatePicker({ onSubmit, language }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [pin, setPin] = useState('');
    const [theme, setTheme] = useState<string>(DEFAULT_THEME);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !nameAr.trim() || !nameEn.trim()) return;
        if (pin.length < 4) {
            setError(currentText.pinError);
            return;
        }
        if (new Date(selectedDate).getTime() <= Date.now()) {
            setError(currentText.pastError);
            return;
        }
        setError('');
        setSaving(true);
        try {
            await onSubmit(selectedDate, nameAr.trim(), nameEn.trim(), pin, theme, gender);
            setIsOpen(false);
        } catch {
            setError(currentText.saveError);
        } finally {
            setSaving(false);
        }
    };

    // Local "now" formatted for datetime-local's min attribute
    const now = new Date();
    const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const text: Record<string, Record<string, string>> = {
        en: {
            button: 'Create Your Countdown',
            title: 'Create Your Countdown',
            nameArLabel: 'Arabic Name',
            nameArPlaceholder: 'مثال: أحمد وسارة',
            nameEnLabel: 'English Name',
            nameEnPlaceholder: 'e.g. Ahmed & Sara',
            pinLabel: 'Secret Code',
            pinHint: 'You will use it to open your profile later',
            pinError: 'The code must be at least 4 characters',
            saving: 'Saving...',
            saveError: 'Could not save, please try again',
            label: 'Wedding Date',
            themeLabel: 'Site Colors',
            genderLabel: 'You are',
            groom: 'Groom',
            bride: 'Bride',
            cancel: 'Cancel',
            save: 'Create',
            pastError: 'Please choose a date in the future'
        },
        ar: {
            button: 'ابدأ العدّ التنازلي',
            title: 'العدّ التنازلي لزفافك',
            nameArLabel: 'الاسم بالعربية',
            nameArPlaceholder: 'مثال: أحمد وسارة',
            nameEnLabel: 'الاسم بالإنجليزية',
            nameEnPlaceholder: 'e.g. Ahmed & Sara',
            pinLabel: 'الرمز السري',
            pinHint: 'تستخدمه لاحقاً للدخول إلى ملفك الشخصي',
            pinError: 'يجب ألا يقل الرمز عن 4 أحرف',
            saving: 'جارٍ الحفظ…',
            saveError: 'تعذّر الحفظ، يُرجى المحاولة مرة أخرى',
            label: 'تاريخ الزفاف',
            themeLabel: 'ألوان الصفحة',
            genderLabel: 'أنت',
            groom: 'عريس',
            bride: 'عروس',
            cancel: 'إلغاء',
            save: 'إنشاء العدّاد',
            pastError: 'يُرجى اختيار تاريخ في المستقبل'
        }
    };

    const currentText = text[language] || text.en;
    const isRTL = language === 'ar';

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-gold text-white px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-gold-hover transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
            >
                <Calendar className="w-5 h-5" />
                <span>{currentText.button}</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25 }}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                                dir={isRTL ? 'rtl' : 'ltr'}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2
                                        className="text-2xl text-ink"
                                        style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                                    >
                                        {currentText.title}
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-taupe hover:text-ink transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label
                                            className="block mb-2 text-[var(--c-ink)]"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.genderLabel}
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {([
                                                { value: 'male', label: currentText.groom, icon: '🤵' },
                                                { value: 'female', label: currentText.bride, icon: '👰' }
                                            ] as const).map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setGender(option.value)}
                                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${gender === option.value
                                                        ? 'border-[var(--c-gold)] bg-[var(--c-gold-light)]'
                                                        : 'border-[var(--c-gold)]/40 hover:bg-[var(--c-surface)]'}`}
                                                >
                                                    <span aria-hidden="true">{option.icon}</span>
                                                    <span>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {[
                                        { label: currentText.nameArLabel, placeholder: currentText.nameArPlaceholder, value: nameAr, set: setNameAr, dir: 'rtl' },
                                        { label: currentText.nameEnLabel, placeholder: currentText.nameEnPlaceholder, value: nameEn, set: setNameEn, dir: 'ltr' }
                                    ].map(field => (
                                        <div className="mb-4" key={field.dir}>
                                            <label
                                                className="block mb-2 text-ink"
                                                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                            >
                                                {field.label}
                                            </label>
                                            <input
                                                type="text"
                                                dir={field.dir}
                                                value={field.value}
                                                maxLength={100}
                                                placeholder={field.placeholder}
                                                onChange={(e) => field.set(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-cream"
                                                required
                                            />
                                        </div>
                                    ))}

                                    <div className="mb-4">
                                        <label
                                            className="block mb-2 text-ink"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.pinLabel}
                                        </label>
                                        <PasswordInput
                                            value={pin}
                                            minLength={4}
                                            maxLength={64}
                                            autoComplete="new-password"
                                            onChange={(value) => {
                                                setPin(value);
                                                setError('');
                                            }}
                                            className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-cream"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-taupe">{currentText.pinHint}</p>
                                    </div>

                                    <div className="mb-4">
                                        <span
                                            className="block mb-2 text-ink"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.themeLabel}
                                        </span>
                                        <ThemePicker value={theme} language={language} onChange={setTheme} />
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            className="block mb-2 text-ink"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.label}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={selectedDate}
                                            min={minDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setError('');
                                            }}
                                            className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-cream"
                                            required
                                        />
                                        {error && (
                                            <p className="mt-2 text-sm text-red-600">{error}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 px-4 py-3 border-2 border-gold text-ink rounded-lg hover:bg-cream transition-all duration-300"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.cancel}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 px-4 py-3 bg-gold text-white rounded-lg hover:bg-gold-hover transition-all duration-300 shadow-md"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {saving ? currentText.saving : currentText.save}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

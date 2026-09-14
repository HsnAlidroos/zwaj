import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DatePickerProps {
    // Receives the chosen date and name; may throw to show an error
    onSubmit: (date: string, name: string) => void | Promise<void>;
    language: string;
}

export function DatePicker({ onSubmit, language }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !name.trim()) return;
        if (new Date(selectedDate).getTime() <= Date.now()) {
            setError(currentText.pastError);
            return;
        }
        setError('');
        setSaving(true);
        try {
            await onSubmit(selectedDate, name.trim());
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
            nameLabel: 'Your Names',
            namePlaceholder: 'e.g. Ahmed & Sara',
            saving: 'Saving...',
            saveError: 'Could not save, please try again',
            label: 'Wedding Date',
            cancel: 'Cancel',
            save: 'Create',
            pastError: 'Please choose a date in the future'
        },
        ar: {
            button: 'أنشئ عدّادك',
            title: 'أنشئ عدّاد زفافك',
            nameLabel: 'الاسم',
            namePlaceholder: 'مثال: أحمد وسارة',
            saving: 'جارٍ الحفظ...',
            saveError: 'تعذّر الحفظ، حاول مرة أخرى',
            label: 'تاريخ الزفاف',
            cancel: 'إلغاء',
            save: 'إنشاء',
            pastError: 'الرجاء اختيار تاريخ في المستقبل'
        }
    };

    const currentText = text[language] || text.en;
    const isRTL = language === 'ar';

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-[#D4AF37] text-white px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-[#C19B2F] transition-all duration-300 shadow-lg hover:shadow-xl"
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
                                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full"
                                dir={isRTL ? 'rtl' : 'ltr'}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2
                                        className="text-2xl text-[#2C2C2C]"
                                        style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                                    >
                                        {currentText.title}
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-[#8B7355] hover:text-[#2C2C2C] transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label
                                            className="block mb-2 text-[#2C2C2C]"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.nameLabel}
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            maxLength={100}
                                            placeholder={currentText.namePlaceholder}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-[#F5F3EE]"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            className="block mb-2 text-[#2C2C2C]"
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
                                            className="w-full px-4 py-3 border-2 border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-[#F5F3EE]"
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
                                            className="flex-1 px-4 py-3 border-2 border-[#D4AF37] text-[#2C2C2C] rounded-lg hover:bg-[#F5F3EE] transition-all duration-300"
                                            style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                        >
                                            {currentText.cancel}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 px-4 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2F] transition-all duration-300 shadow-md"
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

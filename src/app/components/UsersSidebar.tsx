import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Heart } from 'lucide-react';

export interface WeddingUser {
    slug: string;
    name: string;
    name_en: string | null;
    wedding_date: string;
}

export function displayName(user: WeddingUser, language: string) {
    return language === 'en' && user.name_en ? user.name_en : user.name;
}

interface UsersSidebarProps {
    users: WeddingUser[];
    activeSlug: string;
    language: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (user: WeddingUser) => void;
}

export function UsersSidebar({ users, activeSlug, language, isOpen, onOpenChange, onSelect }: UsersSidebarProps) {
    const isRTL = language === 'ar';
    const title = isRTL ? 'العدّادات' : 'Countdowns';
    const doneLabel = isRTL ? 'تم الزفاف' : 'Married';
    const bodyFont = isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif';

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <>
            <motion.button
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenChange(true);
                }}
                className="p-2 rounded-full bg-white/60 hover:bg-white text-[#D4AF37] shadow-sm transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={title}
            >
                <Users className="w-6 h-6" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenChange(false);
                            }}
                        />
                        <motion.aside
                            className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-80 max-w-[85vw] bg-[#FBF9F4] shadow-2xl z-50 flex flex-col cursor-default`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                            initial={{ x: isRTL ? '100%' : '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? '100%' : '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30">
                                <h2
                                    className="text-2xl text-[#2C2C2C]"
                                    style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                                >
                                    {title}
                                </h2>
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="text-[#8B7355] hover:text-[#2C2C2C] transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <ul className="flex-1 overflow-y-auto p-3 space-y-2">
                                {users.map(user => {
                                    const active = user.slug === activeSlug;
                                    const done = new Date(user.wedding_date).getTime() <= Date.now();
                                    return (
                                        <li key={user.slug}>
                                            <button
                                                onClick={() => onSelect(user)}
                                                className={`w-full text-start px-4 py-3 rounded-xl border-2 transition-all ${active
                                                    ? 'border-[#D4AF37] bg-[#F5E9C8]'
                                                    : 'border-transparent hover:bg-[#F5F3EE]'}`}
                                            >
                                                <div className="flex items-center gap-2 text-[#2C2C2C]" style={{ fontFamily: bodyFont }}>
                                                    {active && <Heart className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37] shrink-0" />}
                                                    <span className="truncate font-medium">{displayName(user, language)}</span>
                                                </div>
                                                <div className="mt-1 text-sm text-[#8B7355]" style={{ fontFamily: bodyFont }}>
                                                    {formatDate(user.wedding_date)}
                                                    {done && <span className="ms-2 text-[#D4AF37]">· {doneLabel}</span>}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

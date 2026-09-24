import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Heart, PanelLeftClose, PanelRightClose, Search } from 'lucide-react';

export interface WeddingUser {
    gender?: string | null;
    show_role?: number;
    slug: string;
    name: string;
    name_en: string | null;
    wedding_date: string;
    bio?: string | null;
    photo?: string | null;
    photo_thumb?: string | null;
    theme?: string | null;
}

export function displayName(user: WeddingUser, language: string) {
    return language === 'en' && user.name_en ? user.name_en : user.name;
}

const DESKTOP_QUERY = '(min-width: 768px)';

function normalize(value: string) {
    return value
        .toLowerCase()
        .replace(/[\u064B-\u0652\u0640]/g, '')
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .trim();
}

interface UsersSidebarProps {
    users: WeddingUser[];
    isLoading: boolean;
    activeSlug: string;
    language: string;
    // Drawer on phones
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    // Docked panel on medium and large screens
    isDocked: boolean;
    onDockedChange: (docked: boolean) => void;
    onSelect: (user: WeddingUser) => void;
}

export function UsersSidebar({
    users, isLoading, activeSlug, language, isOpen, onOpenChange, isDocked, onDockedChange, onSelect
}: UsersSidebarProps) {
    const isRTL = language === 'ar';
    const title = isRTL ? 'المناسبات' : 'Countdowns';
    const searchPlaceholder = isRTL ? 'ابحث عن اسم...' : 'Search by name...';
    const noResults = isRTL ? 'لا توجد نتائج' : 'No results';
    const hideLabel = isRTL ? 'إخفاء' : 'Hide';
    const titleFont = isRTL ? 'Amiri, serif' : 'Playfair Display, serif';
    const HideIcon = isRTL ? PanelRightClose : PanelLeftClose;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.matchMedia(DESKTOP_QUERY).matches) onDockedChange(!isDocked);
        else onOpenChange(true);
    };

    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const needle = normalize(query);
        if (!needle) return users;
        return users.filter(user =>
            normalize(`${user.name} ${user.name_en ?? ''}`).includes(needle)
        );
    }, [users, query]);

    const search = (
        <div className="px-3 pt-3">
            <div className="relative">
                <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-[#8B7355] pointer-events-none" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full ps-9 pe-3 py-2 rounded-lg border-2 border-[#D4AF37]/50 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                    style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                />
            </div>
        </div>
    );

    const list = isLoading ? (
        <UsersListSkeleton />
    ) : (
        <>
            {search}
            {filtered.length ? (
                <UsersList users={filtered} activeSlug={activeSlug} language={language} onSelect={onSelect} />
            ) : (
                <p
                    className="flex-1 p-6 text-center text-sm text-[#8B7355]"
                    style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                >
                    {noResults}
                </p>
            )}
        </>
    );

    return (
        <>
            {/* Toggle button: hidden on desktop while the panel is open (the panel has its own) */}
            <motion.button
                onClick={handleToggle}
                className={`fixed top-4 md:top-6 start-4 md:start-6 z-[110] p-2 rounded-full bg-white/60 hover:bg-white text-gold shadow-sm transition-colors ${isDocked ? 'md:hidden' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={title}
            >
                <Users className="w-6 h-6" />
            </motion.button>

            {/* Docked panel (md and up) */}
            <AnimatePresence>
                {isDocked && (
                    <motion.aside
                        className="hidden md:flex fixed top-0 bottom-0 start-0 w-72 z-[105] bg-ivory border-e border-gold/30 shadow-lg flex-col cursor-default"
                        dir={isRTL ? 'rtl' : 'ltr'}
                        initial={{ x: isRTL ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: isRTL ? '100%' : '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gold/30">
                            <h2 className="text-2xl text-ink flex items-center gap-2" style={{ fontFamily: titleFont }}>
                                <Users className="w-5 h-5 text-gold" />
                                {title}
                            </h2>
                            <button
                                onClick={() => onDockedChange(false)}
                                className="text-taupe hover:text-ink transition-colors"
                                title={hideLabel}
                            >
                                <HideIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {list}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Drawer (phones) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="md:hidden">
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-[115]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenChange(false);
                            }}
                        />
                        <motion.aside
                            className="fixed top-0 bottom-0 start-0 w-80 max-w-[85vw] bg-ivory shadow-2xl z-[120] flex flex-col cursor-default"
                            dir={isRTL ? 'rtl' : 'ltr'}
                            initial={{ x: isRTL ? '100%' : '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? '100%' : '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gold/30">
                                <h2 className="text-2xl text-ink" style={{ fontFamily: titleFont }}>
                                    {title}
                                </h2>
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="text-taupe hover:text-ink transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            {list}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

// Placeholder rows shown while the list is loading
function UsersListSkeleton() {
    return (
        <ul className="flex-1 overflow-hidden p-3 space-y-2" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="px-4 py-3 rounded-xl border-2 border-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sand animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 rounded bg-sand animate-pulse" style={{ width: `${70 - i * 6}%` }} />
                            <div className="h-3 w-24 rounded bg-sand animate-pulse" />
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

interface UsersListProps {
    users: WeddingUser[];
    activeSlug: string;
    language: string;
    onSelect: (user: WeddingUser) => void;
}

function UsersList({ users, activeSlug, language, onSelect }: UsersListProps) {
    const isRTL = language === 'ar';
    const doneLabel = isRTL ? 'انتهى العدّ' : 'Married';
    const bodyFont = isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif';

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(isRTL ? 'ar-u-ca-gregory-nu-latn' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const groomsLabel = isRTL ? 'العرسان' : 'Grooms';
    const bridesLabel = isRTL ? 'العرائس' : 'Brides';

    const grooms = users.filter(user => user.gender !== 'female');
    const brides = users.filter(user => user.gender === 'female');

    const row = (user: WeddingUser) => {
        const active = user.slug === activeSlug;
        const done = new Date(user.wedding_date).getTime() <= Date.now();
        return (
            <li key={user.slug}>
                <button
                    onClick={() => onSelect(user)}
                    className={`w-full text-start px-4 py-3 rounded-xl border-2 transition-all ${active
                        ? 'border-gold bg-champagne'
                        : 'border-transparent hover:bg-cream'}`}
                >
                    <div className="flex items-center gap-3">
                        {user.photo_thumb ? (
                            <img
                                src={user.photo_thumb}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-gold shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-champagne border border-gold/50 flex items-center justify-center shrink-0">
                                <span aria-hidden="true" className="text-lg">{user.gender === 'female' ? '👰' : '🤵'}</span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-ink" style={{ fontFamily: bodyFont }}>
                                {active && <Heart className="w-3 h-3 text-gold fill-gold shrink-0" />}
                                <span className="truncate font-medium">{displayName(user, language)}</span>
                            </div>
                            <div className="mt-1 text-sm text-taupe" style={{ fontFamily: bodyFont }}>
                                {formatDate(user.wedding_date)}
                                {done && <span className="ms-2 text-gold">· {doneLabel}</span>}
                            </div>
                        </div>
                    </div>
                </button>
            </li>
        );
    };

    // Grooms and brides are listed under separate headings
    const group = (label: string, icon: string, members: WeddingUser[]) =>
        members.length > 0 && (
            <li>
                <p
                    className="px-2 pb-2 pt-1 text-xs font-semibold tracking-wide text-taupe flex items-center gap-2"
                    style={{ fontFamily: bodyFont }}
                >
                    <span aria-hidden="true">{icon}</span>
                    {label}
                    <span className="text-gold">({members.length})</span>
                    <span className="flex-1 h-px bg-gold/30" />
                </p>
                <ul className="space-y-2">{members.map(row)}</ul>
            </li>
        );

    return (
        <ul className="flex-1 overflow-y-auto p-3 space-y-4">
            {group(groomsLabel, '🤵', grooms)}
            {group(bridesLabel, '👰', brides)}
        </ul>
    );
}

import { useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { DatePicker } from '@/app/components/DatePicker';

interface CelebrationProps {
    language: string;
    name?: string;
    details?: ReactNode;
    actions?: ReactNode;
    className?: string;
    onSubmit: (date: string, nameAr: string, nameEn: string) => void | Promise<void>;
}

const floaters = ['🎈', '💖', '🎉', '💕', '✨', '💍', '🌸', '💗'];
const confettiColors = ['#D4AF37', '#E8C872', '#C19B2F', '#F4D9A0', '#E6A4B4', '#FFFFFF'];

export function Celebration({ language, name, details, actions, className = '', onSubmit }: CelebrationProps) {
    const isRTL = language === 'ar';

    const text = {
        en: {
            title: 'Congratulations',
            dua: 'May Allah bless you both, and bring you together in goodness',
            sub: 'The big day has arrived'
        },
        ar: {
            title: 'مبارك',
            dua: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير',
            sub: 'وصل اليوم المنتظر'
        }
    };
    const t = text[language as keyof typeof text] || text.en;

    const confetti = useMemo(
        () => Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 4,
            duration: 3 + Math.random() * 3,
            size: 6 + Math.random() * 8,
            color: confettiColors[i % confettiColors.length],
            rotate: Math.random() * 720
        })),
        []
    );

    const balloons = useMemo(
        () => Array.from({ length: 16 }, (_, i) => ({
            id: i,
            left: Math.random() * 95,
            delay: Math.random() * 6,
            duration: 7 + Math.random() * 5,
            emoji: floaters[i % floaters.length],
            size: 1.5 + Math.random() * 1.5
        })),
        []
    );

    return (
        <div
            className={`fixed inset-0 z-[100] overflow-x-hidden bg-gradient-to-br from-[#FBF6E9] via-[#F5E9C8] to-[#EAD49A] flex flex-col items-center justify-center px-4 overflow-y-auto ${className}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Confetti */}
            {confetti.map(c => (
                <motion.span
                    key={`c${c.id}`}
                    className="absolute top-0 pointer-events-none rounded-sm"
                    style={{ left: `${c.left}%`, width: c.size, height: c.size * 0.5, background: c.color }}
                    initial={{ y: -40, rotate: 0, opacity: 1 }}
                    animate={{ y: '110vh', rotate: c.rotate, opacity: [1, 1, 0.6] }}
                    transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'linear' }}
                />
            ))}

            {/* Balloons & hearts rising */}
            {balloons.map(b => (
                <motion.span
                    key={`b${b.id}`}
                    className="absolute bottom-0 pointer-events-none"
                    style={{ left: `${b.left}%`, fontSize: `${b.size}rem` }}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: '-115vh', opacity: [0, 1, 1, 0], x: [0, 15, -15, 0] }}
                    transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeOut' }}
                >
                    {b.emoji}
                </motion.span>
            ))}

            <motion.div
                className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 14, duration: 1 }}
            >
                <CongratsArt />

                <motion.h1
                    className="text-6xl md:text-8xl text-[#8B6914] mt-4"
                    style={{
                        fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif',
                        textShadow: '0 4px 20px rgba(212, 175, 55, 0.45)'
                    }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {t.title}
                </motion.h1>

                <p
                    className="mt-3 text-lg md:text-xl text-[#8B7355]"
                    style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                >
                    {t.sub}
                </p>

                {name && (
                    <p
                        className="mt-4 text-3xl md:text-4xl text-[#8B6914]"
                        style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                    >
                        {name}
                    </p>
                )}

                {details}

                <p
                    className="mt-6 text-xl md:text-3xl text-[#2C2C2C] leading-relaxed"
                    style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                >
                    {t.dua}
                </p>

                <div className="mt-10 flex flex-col items-center gap-4">
                    <DatePicker onSubmit={onSubmit} language={language} />
                    {actions}
                </div>
            </motion.div>
        </div>
    );
}

// Decorative congratulations illustration: ornate gold frame with interlocked rings and hearts
function CongratsArt() {
    return (
        <motion.svg
            viewBox="0 0 240 180"
            className="w-56 md:w-72 h-auto drop-shadow-xl"
            initial={{ rotate: -4 }}
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F4D9A0" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#A67C1B" />
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF8E1" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FFF8E1" stopOpacity="0" />
                </radialGradient>
            </defs>

            <circle cx="120" cy="95" r="85" fill="url(#glow)" />

            {/* Ornate arch frame */}
            <path
                d="M40 170 V80 Q40 20 120 12 Q200 20 200 80 V170"
                fill="none" stroke="url(#gold)" strokeWidth="4" strokeLinecap="round"
            />
            <path
                d="M52 170 V84 Q52 34 120 26 Q188 34 188 84 V170"
                fill="none" stroke="url(#gold)" strokeWidth="1.5" strokeDasharray="4 4"
            />
            <circle cx="120" cy="12" r="5" fill="url(#gold)" />

            {/* Interlocked rings */}
            <circle cx="104" cy="104" r="26" fill="none" stroke="url(#gold)" strokeWidth="7" />
            <circle cx="136" cy="104" r="26" fill="none" stroke="url(#gold)" strokeWidth="7" />
            {/* Diamond */}
            <path d="M128 70 L136 60 L144 70 L136 80 Z" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />

            {/* Hearts */}
            <path
                d="M120 150 C112 142 104 138 104 131 C104 126 108 122 112 122 C116 122 118 125 120 127 C122 125 124 122 128 122 C132 122 136 126 136 131 C136 138 128 142 120 150 Z"
                fill="#E6A4B4"
            />
            <path d="M66 58 c-3-3-6-4-6-7 a3 3 0 0 1 6-1 a3 3 0 0 1 6 1 c0 3-3 4-6 7z" fill="#D4AF37" />
            <path d="M174 58 c-3-3-6-4-6-7 a3 3 0 0 1 6-1 a3 3 0 0 1 6 1 c0 3-3 4-6 7z" fill="#D4AF37" />

            {/* Sparkles */}
            {[[70, 120], [170, 120], [120, 45]].map(([x, y], i) => (
                <path
                    key={i}
                    d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`}
                    fill="#D4AF37"
                />
            ))}
        </motion.svg>
    );
}

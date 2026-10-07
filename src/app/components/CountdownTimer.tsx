import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { intervalToDuration } from 'date-fns';
import { isSoon, soonLabel } from '@/app/components/soon';

interface CountdownTimerProps {
    targetDate: string;
    language: string;
    onComplete?: () => void;
}

// Fixed flame layout so it doesn't jump between renders
const FLAMES = Array.from({ length: 14 }, (_, i) => ({
    x: (i * 7.3 + (i % 3) * 2) % 96,
    size: 10 + ((i * 5) % 9),
    rise: 28 + ((i * 11) % 26),
    duration: 1.1 + ((i * 3) % 7) / 10,
    delay: (i * 0.17) % 1.2
}));

export type Unit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';

const emptyTime: Record<Unit, number> = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

// Arabic forms: [singular, dual, plural (3-10), accusative singular (11+)]
const arabicForms: Record<Unit, [string, string, string, string]> = {
    years: ['سنة', 'سنتان', 'سنوات', 'سنة'],
    months: ['شهر', 'شهران', 'أشهر', 'شهرًا'],
    days: ['يوم', 'يومان', 'أيام', 'يومًا'],
    hours: ['ساعة', 'ساعتان', 'ساعات', 'ساعة'],
    minutes: ['دقيقة', 'دقيقتان', 'دقائق', 'دقيقة'],
    seconds: ['ثانية', 'ثانيتان', 'ثوانٍ', 'ثانية']
};

const englishForms: Record<Unit, [string, string]> = {
    years: ['Year', 'Years'],
    months: ['Month', 'Months'],
    days: ['Day', 'Days'],
    hours: ['Hour', 'Hours'],
    minutes: ['Minute', 'Minutes'],
    seconds: ['Second', 'Seconds']
};

export function pluralize(unit: Unit, n: number, language: string) {
    if (language === 'ar') {
        const [one, two, few, many] = arabicForms[unit];
        if (n === 1) return one;
        if (n === 2) return two;
        if (n >= 3 && n <= 10) return few;
        return many;
    }
    const [one, other] = englishForms[unit];
    return n === 1 ? one : other;
}

export function CountdownTimer({ targetDate, language, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(emptyTime);
    const completedRef = useRef(false);

    useEffect(() => {
        completedRef.current = false;
        // No date yet: nothing to count, and the wedding isn't over
        if (isSoon(targetDate)) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(targetDate);

            if (target.getTime() > now.getTime()) {
                const d = intervalToDuration({ start: now, end: target });
                setTimeLeft({
                    years: d.years ?? 0,
                    months: d.months ?? 0,
                    days: d.days ?? 0,
                    hours: d.hours ?? 0,
                    minutes: d.minutes ?? 0,
                    seconds: d.seconds ?? 0
                });
            } else {
                setTimeLeft(emptyTime);
                if (!completedRef.current) {
                    completedRef.current = true;
                    onComplete?.();
                }
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const isRTL = language === 'ar';

    if (isSoon(targetDate)) {
        return (
            <div className="flex justify-center pt-10">
                <div className="relative">
                    {/* Flickering heat glow behind the box */}
                    <motion.div
                        aria-hidden="true"
                        className="absolute -inset-3 rounded-2xl blur-xl"
                        style={{ background: 'radial-gradient(ellipse at 50% 30%, #ffb347, #ff6a00 45%, #e8380d 70%, transparent 85%)' }}
                        animate={{ opacity: [0.55, 0.8, 0.6, 0.9, 0.55], scale: [1, 1.04, 0.99, 1.05, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Flames rising from the top edge */}
                    <div aria-hidden="true" className="absolute inset-x-2 -top-1 h-0 pointer-events-none">
                        {FLAMES.map((flame, i) => (
                            <motion.span
                                key={i}
                                className="absolute bottom-0 rounded-full blur-[2px]"
                                style={{
                                    left: `${flame.x}%`,
                                    width: flame.size,
                                    height: flame.size * 1.6,
                                    background: 'radial-gradient(ellipse at 50% 70%, #fff3b0, #ffb347 35%, #ff6a00 65%, transparent 80%)',
                                    borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%'
                                }}
                                animate={{ y: [0, -flame.rise], opacity: [0, 1, 0], scale: [0.8, 1.1, 0.3] }}
                                transition={{ duration: flame.duration, delay: flame.delay, repeat: Infinity, ease: 'easeOut' }}
                            />
                        ))}
                    </div>

                    {/* Rotating fire border */}
                    <div className="relative rounded-xl p-[3px] overflow-hidden shadow-lg">
                        <motion.div
                            aria-hidden="true"
                            className="absolute -inset-[100%]"
                            style={{ background: 'conic-gradient(from 0deg, #ff6a00, #ffd56b, #e8380d, #ffb347, #ff6a00)' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                        <div
                            className="relative bg-cream rounded-lg px-10 md:px-16 py-6 md:py-8 text-4xl md:text-6xl text-ink"
                            style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                        >
                            {soonLabel(language)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const units: Unit[] = timeLeft.years > 0
        ? ['years', 'months', 'days', 'hours', 'minutes', 'seconds']
        : ['months', 'days', 'hours', 'minutes', 'seconds'];

    return (
        <div
            className={`flex flex-wrap justify-center gap-4 md:gap-8 ${isRTL ? 'rtl' : 'ltr'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {units.map(unit => (
                <TimerUnit
                    key={unit}
                    value={timeLeft[unit]}
                    label={pluralize(unit, timeLeft[unit], language)}
                    language={language}
                    isSeconds={unit === 'seconds'}
                />
            ))}
        </div>
    );
}

interface TimerUnitProps {
    value: number;
    label: string;
    language: string;
    isSeconds?: boolean;
}

function TimerUnit({ value, label, language, isSeconds = false }: TimerUnitProps) {
    const isRTL = language === 'ar';

    return (
        <div
            className="flex flex-col items-center min-w-[80px] md:min-w-[120px]"
        >
            <div
                className="bg-cream border-2 border-gold rounded-lg p-4 md:p-6 w-full shadow-lg"
            >
                <motion.div
                    key={value}
                    className={`text-3xl md:text-5xl font-serif text-ink ${isRTL ? 'font-arabic' : ''}`}
                    style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                    animate={isSeconds ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    {String(value).padStart(2, '0')}
                </motion.div>
            </div>
            <div
                className={`mt-3 text-sm md:text-base text-taupe uppercase tracking-wider ${isRTL ? 'font-arabic' : ''}`}
                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
            >
                {label}
            </div>
        </div>
    );
}

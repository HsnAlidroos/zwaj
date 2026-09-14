import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { intervalToDuration } from 'date-fns';

interface CountdownTimerProps {
    targetDate: string;
    language: string;
    onComplete?: () => void;
}

type Unit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';

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
                className="bg-[#F5F3EE] border-2 border-[#D4AF37] rounded-lg p-4 md:p-6 w-full shadow-lg"
            >
                <motion.div
                    key={value}
                    className={`text-3xl md:text-5xl font-serif text-[#2C2C2C] ${isRTL ? 'font-arabic' : ''}`}
                    style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                    animate={isSeconds ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    {String(value).padStart(2, '0')}
                </motion.div>
            </div>
            <div
                className={`mt-3 text-sm md:text-base text-[#8B7355] uppercase tracking-wider ${isRTL ? 'font-arabic' : ''}`}
                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
            >
                {label}
            </div>
        </div>
    );
}

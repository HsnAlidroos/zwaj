import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface LanguageToggleProps {
    language: string;
    onLanguageChange: (lang: string) => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
    return (
        <motion.div
            className="flex items-center gap-2 bg-cream rounded-full p-1 shadow-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Globe className="w-4 h-4 text-gold ml-2" />
            <button
                onClick={() => onLanguageChange('en')}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${language === 'en'
                        ? 'bg-gold text-white shadow-md'
                        : 'text-ink hover:bg-mist'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => onLanguageChange('ar')}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${language === 'ar'
                        ? 'bg-gold text-white shadow-md'
                        : 'text-ink hover:bg-mist'
                    }`}
                style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
            >
                عربي
            </button>
        </motion.div>
    );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PhotoPreviewProps {
    src: string;
    alt?: string;
    // Classes for the small round thumbnail
    className: string;
}

// Round thumbnail that opens the full, uncropped image when clicked
export function PhotoPreview({ src, alt = '', className }: PhotoPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    return (
        <>
            <motion.img
                src={src}
                alt={alt}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={`${className} cursor-zoom-in`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="absolute top-4 end-4 p-2 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.85 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

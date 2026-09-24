import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, X, MessageCircle, Facebook, Twitter, Linkedin, Send, Image as ImageIcon, Link2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { intervalToDuration } from 'date-fns';
import { pluralize, type Unit } from '@/app/components/CountdownTimer';

interface ShareButtonProps {
    weddingDate: string;
    language: string;
    captureRef: React.RefObject<HTMLDivElement | null>;
}

export function ShareButton({ weddingDate, language, captureRef }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [shareType, setShareType] = useState<'link' | 'image'>('link');
    const [customMessage, setCustomMessage] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const text: Record<string, Record<string, string>> = {
        en: {
            shareButton: 'Share',
            shareTitle: 'Share Your Special Day',
            messagePlaceholder: 'Add a personal message (optional)',
            shareVia: 'Share via',
            close: 'Close',
            shareElse: 'Share Else',
            defaultMessage: `Join us in counting down to our wedding day! 💕`,
            shareImage: 'Share Image',
            shareLink: 'Share Link',
            download: 'Download',
            shareImageNative: 'Share Image',
            back: 'Back',
            generating: 'Generating...',
            cardView: 'Card View',
            fullScreen: 'Full Screen',
            captureFull: 'Capture Full Screen',
            downloadHint: 'Download or use the share button below to send the image.'
        },
        ar: {
            shareButton: 'مشاركة',
            shareTitle: 'شارك يومك المميز',
            messagePlaceholder: 'أضف رسالة شخصية (اختياري)',
            shareVia: 'مشاركة عبر',
            close: 'إغلاق',
            shareElse: 'مشاركة أخرى',
            defaultMessage: `انضموا إلينا في العد التنازلي ليوم زفافنا! 💕`,
            shareImage: 'مشاركة صورة',
            shareLink: 'مشاركة رابط',
            download: 'تحميل',
            shareImageNative: 'مشاركة الصورة',
            back: 'عودة',
            generating: 'جارٍ إنشاء الصورة…',
            cardView: 'بطاقة',
            fullScreen: 'الشاشة كاملة',
            captureFull: 'التقاط الشاشة كاملة',
            downloadHint: 'حمّل الصورة أو استخدم زر المشاركة بالأسفل لإرسالها.'
        }
    };

    const currentText = text[language] || text.en;
    const isRTL = language === 'ar';

    // Format wedding date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isRTL) {
            return date.toLocaleDateString('ar-u-ca-gregory-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getMessage = () => {
        const now = new Date();
        const target = new Date(weddingDate);

        let timeString = '';
        if (target.getTime() > now.getTime()) {
            const d = intervalToDuration({ start: now, end: target });
            const units: Unit[] = ['years', 'months', 'days', 'hours', 'minutes'];
            const parts = units
                .filter(unit => (d[unit] ?? 0) > 0)
                .map(unit => `${d[unit]} ${pluralize(unit, d[unit] ?? 0, language)}`);
            const label = isRTL ? 'المتبقي' : 'Remaining';
            const separator = isRTL ? '، ' : ', ';
            timeString = parts.length ? `${label}: ${parts.join(separator)}` : '';
        }

        const baseMessage = customMessage || currentText.defaultMessage;
        const dateText = formatDate(weddingDate);
        const websiteUrl = window.location.href;
        return `${baseMessage} \n${dateText} \n${timeString} \n\n${websiteUrl} `;
    };

    const shareUrl = window.location.href;

    const handleLinkShare = (platformAction: () => void) => {
        if (shareType === 'image') {
            handleNativeImageShare();
        } else {
            platformAction();
        }
    };

    const handleWhatsAppShare = () => handleLinkShare(() => {
        const message = encodeURIComponent(getMessage() + '\n' + shareUrl);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    });

    const handleFacebookShare = () => handleLinkShare(() => {
        const message = encodeURIComponent(getMessage());
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${message}`, '_blank');
    });

    const handleTwitterShare = () => handleLinkShare(() => {
        const message = encodeURIComponent(getMessage());
        window.open(`https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    const handleEmailShare = () => handleLinkShare(() => {
        const subject = encodeURIComponent(isRTL ? 'دعوة زفاف' : 'Wedding Invitation');
        const body = encodeURIComponent(getMessage());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });

    const handleLinkedInShare = () => handleLinkShare(() => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    const handleTelegramShare = () => handleLinkShare(() => {
        const message = encodeURIComponent(getMessage());
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${message}`, '_blank');
    });

    const handlePinterestShare = () => handleLinkShare(() => {
        const description = encodeURIComponent(getMessage());
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${description}`, '_blank');
    });

    const handleRedditShare = () => handleLinkShare(() => {
        const title = encodeURIComponent(currentText.defaultMessage);
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${title}`, '_blank');
    });

    const generateImage = async (element: HTMLElement, options: any = {}) => {
        if (!element) {
            console.error('generateImage: Element is null');
            return;
        }
        console.log('generateImage: Starting capture', element);
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: true,
                ...options
            });
            console.log('generateImage: Capture success');
            setGeneratedImage(canvas.toDataURL('image/png'));
        } catch (error: any) {
            console.error('Error generating image:', error);
            alert('Error generating image: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const captureCard = () => {
        setGeneratedImage(null);
        if (captureRef?.current) {
            generateImage(captureRef.current, {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--c-cream').trim() || '#F5F3EE'
            });
        }
    };

    // Effect to auto-generate card when switching to 'image' mode
    useEffect(() => {
        if (isOpen && shareType === 'image' && !generatedImage) {
            // Add a small delay to ensure any layout changes or animations are settled
            const timer = setTimeout(() => {
                captureCard();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shareType]);

    const handleDownloadImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `wedding-countdown-${Date.now()}.png`;
        link.click();
    };

    const handleNativeImageShare = async () => {
        if (!generatedImage) return;
        try {
            const blob = await (await fetch(generatedImage)).blob();
            const file = new File([blob], 'wedding-countdown.png', { type: 'image/png' });
            if (navigator.share) {
                await navigator.share({
                    title: isRTL ? 'دعوة زفاف' : 'Wedding Invitation',
                    text: getMessage(),
                    files: [file]
                });
            } else {
                alert(isRTL ? 'المشاركة غير مدعومة في هذا المتصفح' : 'Sharing not supported on this browser');
            }
        } catch (error: any) {
            console.error('Error sharing image:', error);
            alert('Error sharing image: ' + error.message);
        }
    };

    // Native Web Share API (Text/Link)
    const handleNativeShare = async () => {
        if (shareType === 'image') return handleNativeImageShare();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: isRTL ? 'دعوة زفاف' : 'Wedding Invitation',
                    text: getMessage(),
                    url: shareUrl
                });
            } catch (err) { }
        } else {
            try {
                await navigator.clipboard.writeText(`${getMessage()}\n\n${shareUrl}`);
                alert(isRTL ? 'تم النسخ إلى الحافظة!' : 'Copied to clipboard!');
            } catch (err) { }
        }
    };

    const shareOptions = [
        { name: 'WhatsApp', icon: MessageCircle, color: '#25D366', action: handleWhatsAppShare },
        { name: 'Facebook', icon: Facebook, color: '#1877F2', action: handleFacebookShare },
        { name: 'Twitter', icon: Twitter, color: '#1DA1F2', action: handleTwitterShare },
        { name: 'Email', icon: Send, color: '#EA4335', action: handleEmailShare },
        { name: 'LinkedIn', icon: Linkedin, color: '#0077B5', action: handleLinkedInShare },
        { name: 'Telegram', icon: MessageCircle, color: '#0088CC', action: handleTelegramShare },
        { name: 'Pinterest', icon: ImageIcon, color: '#BD081C', action: handlePinterestShare },
        { name: 'Reddit', icon: Send, color: '#FF4500', action: handleRedditShare }
    ];

    const resetModal = () => {
        setIsOpen(false);
        setGeneratedImage(null);
        setCustomMessage('');
        setShareType('link'); // Reset to default
    };

    return (
        <>
            {/* Share Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-full hover:bg-gold-hover transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
            >
                <Share2 className="w-5 h-5" />
                <span>{currentText.shareButton}</span>
            </motion.button>

            {/* Share Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetModal}
                            className="fixed inset-0 bg-black/50 z-[10000] backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-cream rounded-2xl shadow-2xl z-[10001] p-6 max-h-[90vh] overflow-y-auto"
                            dir={isRTL ? 'rtl' : 'ltr'}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2
                                    className="text-2xl text-ink"
                                    style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                                >
                                    {currentText.shareTitle}
                                </h2>
                                <button onClick={resetModal} className="text-ink hover:text-gold">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Message input - Always visible */}
                            <div className="mb-6">
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder={currentText.messagePlaceholder}
                                    className="w-full px-4 py-3 bg-white border-2 border-gold/30 rounded-lg focus:outline-none focus:border-gold resize-none"
                                    rows={3}
                                    style={{
                                        fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif',
                                        textAlign: isRTL ? 'right' : 'left'
                                    }}
                                />
                                <p className="mt-2 text-sm text-taupe">{formatDate(weddingDate)}</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
                                <button
                                    onClick={() => setShareType('link')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${shareType === 'link' ? 'bg-white text-gold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Link2 className="w-4 h-4" />
                                        {currentText.shareLink}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setShareType('image')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${shareType === 'image' ? 'bg-white text-gold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        {currentText.shareImage}
                                    </div>
                                </button>
                            </div>

                            {shareType === 'link' ? (
                                /* Link Mode */
                                <div className="mb-6">
                                    <p className="text-sm text-taupe mb-4">{currentText.shareVia}:</p>
                                </div>
                            ) : (
                                /* Image Mode */
                                <div className="mb-6 space-y-4">
                                    {/* Preview Area */}
                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gold/20 min-h-[200px] flex items-center justify-center relative">
                                        {isGenerating ? (
                                            <div className="flex flex-col items-center gap-2 text-gold">
                                                <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm" style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>{currentText.generating}</span>
                                            </div>
                                        ) : generatedImage ? (
                                            <img src={generatedImage} alt="Preview" className="w-full h-auto rounded max-h-[300px] object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-gray-400 text-sm" style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>
                                                    {isRTL ? 'لم يتم إنشاء الصورة' : 'Image not generated'}
                                                </p>
                                                <button
                                                    onClick={captureCard}
                                                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                    style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                                >
                                                    {isRTL ? 'إعادة المحاولة' : 'Click to Retry'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {generatedImage && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDownloadImage}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gold text-white rounded-lg hover:bg-gold-hover transition-colors"
                                                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>{currentText.download}</span>
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-xs text-center text-gray-500" style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>{currentText.downloadHint}</p>
                                </div>
                            )}

                            {/* Share Options Grid - Contextual */}
                            {shareType === 'link' && (
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    {shareOptions.map((option) => (
                                        <motion.button
                                            key={option.name}
                                            onClick={option.action}
                                            className="flex flex-col items-center justify-center gap-1 p-2 bg-white rounded-lg hover:shadow-md transition-all border border-transparent hover:border-gold/30"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <option.icon className="w-6 h-6" style={{ color: option.color }} />
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            <motion.button
                                onClick={handleNativeShare}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold text-white rounded-lg hover:bg-gold-hover transition-colors"
                                style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
                            >
                                <Share2 className="w-5 h-5" />
                                <span>{currentText.shareElse}</span>
                            </motion.button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

import { useEffect, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';

interface ImageCropperProps {
    file: File;
    language: string;
    onCancel: () => void;
    // Large copy for the page and small one for the list, both square
    onDone: (images: { photo: string; thumb: string }) => void;
    onError: () => void;
}

const VIEW = 260; // size of the square crop window on screen

// Lets the user move and zoom a photo inside a square frame before saving
export function ImageCropper({ file, language, onCancel, onDone, onError }: ImageCropperProps) {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef<{ x: number; y: number } | null>(null);

    const isRTL = language === 'ar';
    const t = isRTL
        ? { title: 'اقتصاص الصورة', hint: 'حرّك الصورة واستخدم الشريط للتكبير', cancel: 'إلغاء', done: 'اقتصاص' }
        : { title: 'Crop photo', hint: 'Drag the photo and use the slider to zoom', cancel: 'Cancel', done: 'Crop' };

    useEffect(() => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
        };
        img.onerror = onError;
        img.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (!image) return null;

    // Scale that makes the photo cover the square, then the user's zoom on top
    const baseScale = VIEW / Math.min(image.width, image.height);
    const scale = baseScale * zoom;
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const maxX = Math.max(0, (drawWidth - VIEW) / 2);
    const maxY = Math.max(0, (drawHeight - VIEW) / 2);
    const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));
    const x = clamp(offset.x, maxX);
    const y = clamp(offset.y, maxY);

    const handlePointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragRef.current = { x: e.clientX - x, y: e.clientY - y };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        setOffset({
            x: clamp(e.clientX - dragRef.current.x, maxX),
            y: clamp(e.clientY - dragRef.current.y, maxY)
        });
    };

    const handleDone = () => {
        const canvasAt = (size: number, quality: number) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            const ratio = size / VIEW;
            ctx.drawImage(
                image,
                ((VIEW - drawWidth) / 2 + x) * ratio,
                ((VIEW - drawHeight) / 2 + y) * ratio,
                drawWidth * ratio,
                drawHeight * ratio
            );
            return canvas.toDataURL('image/jpeg', quality);
        };
        onDone({ photo: canvasAt(800, 0.85), thumb: canvasAt(128, 0.7) });
    };

    return (
        <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="text-[#2C2C2C]">{t.title}</p>

            <div className="flex justify-center">
                <div
                    className="relative rounded-full overflow-hidden border-2 border-[#D4AF37] bg-[#F5F3EE] touch-none cursor-grab active:cursor-grabbing"
                    style={{ width: VIEW, height: VIEW }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => { dragRef.current = null; }}
                    onPointerCancel={() => { dragRef.current = null; }}
                >
                    <img
                        src={image.src}
                        alt=""
                        draggable={false}
                        className="absolute select-none max-w-none"
                        style={{
                            width: drawWidth,
                            height: drawHeight,
                            left: (VIEW - drawWidth) / 2 + x,
                            top: (VIEW - drawHeight) / 2 + y
                        }}
                    />
                </div>
            </div>

            <p className="text-xs text-[#8B7355] text-center">{t.hint}</p>

            <div className="flex items-center gap-3">
                <ZoomIn className="w-5 h-5 text-[#8B7355] shrink-0" />
                <input
                    type="range"
                    min={1}
                    max={4}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border-2 border-[#D4AF37] text-[#2C2C2C] rounded-lg hover:bg-[#F5F3EE]"
                >
                    {t.cancel}
                </button>
                <button
                    type="button"
                    onClick={handleDone}
                    className="flex-1 px-4 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2F] shadow-md"
                >
                    {t.done}
                </button>
            </div>
        </div>
    );
}

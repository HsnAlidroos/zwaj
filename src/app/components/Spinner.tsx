import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'w-6 h-6' }: { className?: string }) {
    return <Loader2 className={`${className} animate-spin text-gold`} aria-hidden="true" />;
}

// Placeholder countdown boxes shown while the page data loads
export function CountdownSkeleton() {
    return (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex flex-col items-center min-w-[80px] md:min-w-[120px]">
                    <div className="bg-cream border-2 border-gold/40 rounded-lg p-4 md:p-6 w-full shadow-lg">
                        <div className="h-9 md:h-12 rounded bg-sand animate-pulse" />
                    </div>
                    <div className="mt-3 h-4 w-16 rounded bg-sand animate-pulse" />
                </div>
            ))}
        </div>
    );
}

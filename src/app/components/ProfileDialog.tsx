import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRound, X, ImagePlus, Trash2, LogOut, Pencil, AlertTriangle } from 'lucide-react';
import { displayName, type WeddingUser } from '@/app/components/UsersSidebar';
import { PasswordInput } from '@/app/components/PasswordInput';

export const tokenKey = (slug: string) => `zwaj-token-${slug}`;

export function readToken(slug: string) {
    try {
        return localStorage.getItem(tokenKey(slug));
    } catch {
        return null;
    }
}

export function saveToken(slug: string, token: string | null) {
    try {
        if (token) localStorage.setItem(tokenKey(slug), token);
        else localStorage.removeItem(tokenKey(slug));
    } catch {
        // Storage unavailable (private mode); the session just won't persist
    }
}

interface Profile {
    bio: string | null;
    photo: string | null;
    show_bio: number;
    show_photo: number;
}

interface ProfileDialogProps {
    // Public data of the countdown being viewed
    user: WeddingUser;
    language: string;
    // Called after saving so the page can show the new bio/photo
    onSaved: () => void;
    onDeleted: () => void;
}

const DEFAULT_SLUG = 'hassan';

const MAX_BIO = 500;

// Shrinks an image file to at most 600px and returns a JPEG data URL
function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, 600 / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Invalid image'));
        };
        img.src = url;
    });
}

export function ProfileDialog({ user, language, onSaved, onDeleted }: ProfileDialogProps) {
    const slug = user.slug;
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [pin, setPin] = useState('');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    // Visitors see the public profile; the owner signs in to edit
    const [showLogin, setShowLogin] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deletePin, setDeletePin] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const isRTL = language === 'ar';
    const bodyFont = isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif';

    const text = {
        en: {
            button: 'Profile',
            title: 'Profile',
            edit: 'Edit profile',
            weddingDate: 'Wedding date',
            empty: 'No description or photo yet',
            deleteAccount: 'Delete account',
            deleteWarning: 'This permanently deletes the countdown, photo and description.',
            deletePinLabel: 'Enter your secret code to confirm',
            confirmDelete: 'Delete permanently',
            cancel: 'Cancel',
            cannotDeleteDefault: 'The default countdown cannot be deleted',
            pinLabel: 'Enter your secret code',
            login: 'Sign in',
            wrongPin: 'Wrong code',
            bio: 'Description',
            bioPlaceholder: 'Write something about your wedding...',
            photo: 'Photo',
            addPhoto: 'Add photo',
            changePhoto: 'Change photo',
            removePhoto: 'Remove',
            showBio: 'Show description',
            showPhoto: 'Show photo',
            save: 'Save',
            saved: 'Saved ✓',
            logout: 'Sign out',
            failed: 'Something went wrong, try again',
            badImage: 'Could not read this image'
        },
        ar: {
            button: 'الملف الشخصي',
            title: 'الملف الشخصي',
            edit: 'تعديل الملف',
            weddingDate: 'تاريخ الزواج',
            empty: 'لا يوجد وصف أو صورة بعد',
            deleteAccount: 'حذف الحساب',
            deleteWarning: 'سيتم حذف العدّاد والصورة والوصف نهائياً.',
            deletePinLabel: 'أدخل الرمز السري للتأكيد',
            confirmDelete: 'حذف نهائي',
            cancel: 'إلغاء',
            cannotDeleteDefault: 'لا يمكن حذف العدّاد الافتراضي',
            pinLabel: 'أدخل الرمز السري',
            login: 'دخول',
            wrongPin: 'الرمز غير صحيح',
            bio: 'الوصف',
            bioPlaceholder: 'اكتب شيئاً عن زواجكم...',
            photo: 'الصورة',
            addPhoto: 'إضافة صورة',
            changePhoto: 'تغيير الصورة',
            removePhoto: 'حذف',
            showBio: 'إظهار الوصف',
            showPhoto: 'إظهار الصورة',
            save: 'حفظ',
            saved: 'تم الحفظ ✓',
            logout: 'تسجيل خروج',
            failed: 'حدث خطأ، حاول مرة أخرى',
            badImage: 'تعذّرت قراءة الصورة'
        }
    };
    const t = text[language as keyof typeof text] || text.en;

    const loadProfile = async (authToken: string) => {
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${authToken}` } });
        if (res.status === 401) {
            saveToken(slug, null);
            setToken(null);
            return;
        }
        if (!res.ok) throw new Error('Failed');
        setProfile(await res.json());
    };

    // Reset when switching to another user's page
    useEffect(() => {
        setIsOpen(false);
        setProfile(null);
        setPin('');
        setError('');
        setShowLogin(false);
        setConfirmDelete(false);
        setDeletePin('');
        setToken(readToken(slug));
    }, [slug]);

    useEffect(() => {
        if (isOpen && token && !profile) loadProfile(token).catch(() => setError(t.failed));
    }, [isOpen, token]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, pin })
            });
            if (res.status === 401) {
                setError(t.wrongPin);
                return;
            }
            if (!res.ok) throw new Error('Failed');
            const { token: newToken } = await res.json();
            saveToken(slug, newToken);
            setToken(newToken);
            setPin('');
        } catch {
            setError(t.failed);
        } finally {
            setBusy(false);
        }
    };

    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !profile) return;
        try {
            setProfile({ ...profile, photo: await resizeImage(file) });
            setSaved(false);
        } catch {
            setError(t.badImage);
        }
    };

    const handleSave = async () => {
        if (!token || !profile) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    bio: profile.bio?.trim() || null,
                    photo: profile.photo,
                    showBio: !!profile.show_bio,
                    showPhoto: !!profile.show_photo
                })
            });
            if (!res.ok) throw new Error('Failed');
            setProfile(await res.json());
            setSaved(true);
            onSaved();
        } catch {
            setError(t.failed);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/profile', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pin: deletePin })
            });
            if (res.status === 401) {
                setError(t.wrongPin);
                return;
            }
            if (res.status === 403) {
                setError(t.cannotDeleteDefault);
                return;
            }
            if (!res.ok) throw new Error('Failed');
            saveToken(slug, null);
            setIsOpen(false);
            onDeleted();
        } catch {
            setError(t.failed);
        } finally {
            setBusy(false);
        }
    };

    const handleLogout = () => {
        saveToken(slug, null);
        setToken(null);
        setProfile(null);
        setShowLogin(false);
        setConfirmDelete(false);
    };

    const update = (patch: Partial<Profile>) => {
        if (!profile) return;
        setProfile({ ...profile, ...patch });
        setSaved(false);
    };

    const inputClass = 'w-full px-4 py-3 border-2 border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-[#F5F3EE]';

    return (
        <>
            <motion.button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="flex items-center gap-2 border-2 border-[#D4AF37] text-[#8B6914] bg-white/60 px-6 py-3 rounded-full hover:bg-white transition-all duration-300 shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: bodyFont }}
            >
                <UserRound className="w-5 h-5" />
                <span>{t.button}</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-[130]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        />
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center z-[140] p-4 pointer-events-none"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25 }}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto cursor-default"
                                dir={isRTL ? 'rtl' : 'ltr'}
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontFamily: bodyFont }}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2
                                        className="text-2xl text-[#2C2C2C]"
                                        style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                                    >
                                        {t.title}
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-[#8B7355] hover:text-[#2C2C2C] transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {!token && !showLogin ? (
                                    <div className="flex flex-col items-center text-center gap-4">
                                        {user.photo && (
                                            <img
                                                src={user.photo}
                                                alt=""
                                                className="w-32 h-32 rounded-full object-cover border-4 border-[#D4AF37] shadow"
                                            />
                                        )}
                                        <p
                                            className="text-2xl text-[#8B6914]"
                                            style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                                        >
                                            {displayName(user, language)}
                                        </p>
                                        <p className="text-sm text-[#8B7355]">
                                            {t.weddingDate}:{' '}
                                            {new Date(user.wedding_date).toLocaleString(isRTL ? 'ar-u-ca-gregory-nu-latn' : 'en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </p>
                                        {user.bio ? (
                                            <p className="text-[#2C2C2C] whitespace-pre-line leading-relaxed">{user.bio}</p>
                                        ) : (
                                            !user.photo && <p className="text-sm text-[#8B7355]">{t.empty}</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowLogin(true)}
                                            className="mt-2 flex items-center gap-2 text-sm px-4 py-2 border-2 border-[#D4AF37] rounded-full text-[#8B6914] hover:bg-[#F5F3EE]"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            {t.edit}
                                        </button>
                                    </div>
                                ) : !token ? (
                                    <form onSubmit={handleLogin}>
                                        <label className="block mb-2 text-[#2C2C2C]">{t.pinLabel}</label>
                                        <PasswordInput
                                            value={pin}
                                            autoFocus
                                            autoComplete="current-password"
                                            onChange={(value) => {
                                                setPin(value);
                                                setError('');
                                            }}
                                            className={inputClass}
                                            required
                                        />
                                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                                        <button
                                            type="submit"
                                            disabled={busy}
                                            className="mt-6 w-full px-4 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2F] transition-all duration-300 shadow-md disabled:opacity-60"
                                        >
                                            {t.login}
                                        </button>
                                    </form>
                                ) : !profile ? (
                                    <p className="text-center text-[#8B7355] py-8">{error || '...'}</p>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Photo */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[#2C2C2C]">{t.photo}</span>
                                                <Toggle
                                                    label={t.showPhoto}
                                                    checked={!!profile.show_photo}
                                                    onChange={(v) => update({ show_photo: v ? 1 : 0 })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {profile.photo ? (
                                                    <img
                                                        src={profile.photo}
                                                        alt=""
                                                        className={`w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] ${profile.show_photo ? '' : 'opacity-40'}`}
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full bg-[#F5F3EE] border-2 border-dashed border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                                                        <ImagePlus className="w-7 h-7" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileRef.current?.click()}
                                                        className="text-sm px-3 py-2 border-2 border-[#D4AF37] rounded-lg hover:bg-[#F5F3EE]"
                                                    >
                                                        {profile.photo ? t.changePhoto : t.addPhoto}
                                                    </button>
                                                    {profile.photo && (
                                                        <button
                                                            type="button"
                                                            onClick={() => update({ photo: null })}
                                                            className="text-sm px-3 py-1 text-red-600 flex items-center gap-1 hover:underline"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            {t.removePhoto}
                                                        </button>
                                                    )}
                                                </div>
                                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[#2C2C2C]">{t.bio}</span>
                                                <Toggle
                                                    label={t.showBio}
                                                    checked={!!profile.show_bio}
                                                    onChange={(v) => update({ show_bio: v ? 1 : 0 })}
                                                />
                                            </div>
                                            <textarea
                                                value={profile.bio ?? ''}
                                                maxLength={MAX_BIO}
                                                rows={4}
                                                placeholder={t.bioPlaceholder}
                                                onChange={(e) => update({ bio: e.target.value })}
                                                className={`${inputClass} resize-none ${profile.show_bio ? '' : 'opacity-60'}`}
                                            />
                                            <p className="text-xs text-[#8B7355] text-end">
                                                {(profile.bio ?? '').length}/{MAX_BIO}
                                            </p>
                                        </div>

                                        {error && <p className="text-sm text-red-600">{error}</p>}

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="px-4 py-3 border-2 border-[#D4AF37] text-[#2C2C2C] rounded-lg hover:bg-[#F5F3EE] flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                {t.logout}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={busy}
                                                className="flex-1 px-4 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2F] transition-all duration-300 shadow-md disabled:opacity-60"
                                            >
                                                {saved ? t.saved : t.save}
                                            </button>
                                        </div>

                                        {slug !== DEFAULT_SLUG && (
                                            <div className="pt-4 border-t border-red-200">
                                                {!confirmDelete ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setConfirmDelete(true);
                                                            setError('');
                                                        }}
                                                        className="text-sm text-red-600 flex items-center gap-2 hover:underline"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        {t.deleteAccount}
                                                    </button>
                                                ) : (
                                                    <form onSubmit={handleDelete} className="rounded-lg bg-red-50 p-4 space-y-3">
                                                        <p className="text-sm text-red-700 flex items-start gap-2">
                                                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                                            {t.deleteWarning}
                                                        </p>
                                                        <label className="block text-sm text-[#2C2C2C]">{t.deletePinLabel}</label>
                                                        <PasswordInput
                                                            value={deletePin}
                                                            autoComplete="current-password"
                                                            onChange={setDeletePin}
                                                            className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                                                            required
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setConfirmDelete(false);
                                                                    setDeletePin('');
                                                                }}
                                                                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm hover:bg-white"
                                                            >
                                                                {t.cancel}
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={busy}
                                                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60"
                                                            >
                                                                {t.confirmDelete}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 text-sm text-[#8B7355] cursor-pointer select-none">
            {label}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
            >
                <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'start-5' : 'start-1'}`}
                />
            </button>
        </label>
    );
}

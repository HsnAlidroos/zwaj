import { useState, useRef, useCallback, useEffect } from 'react';
import { CountdownTimer } from '@/app/components/CountdownTimer';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import { DatePicker } from '@/app/components/DatePicker';
import { ShareButton } from '@/app/components/ShareButton';
import { Celebration } from '@/app/components/Celebration';
import { UsersSidebar, displayName, type WeddingUser } from '@/app/components/UsersSidebar';
import { ProfileDialog, saveToken } from '@/app/components/ProfileDialog';
import { PhotoPreview } from '@/app/components/PhotoPreview';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Maximize2, Minimize2 } from 'lucide-react';

const DEFAULT_SLUG = 'hassan';

export default function App() {
  const [language, setLanguage] = useState('ar');
  // Default wedding date (Hassan Alidroos), replaced once users load
  const [weddingDate, setWeddingDate] = useState('2026-12-05T00:00:00');

  interface CelebrationItem {
    id: number;
    x: number;
    y: number;
    content: string;
    isBalloon: boolean;
    language: string;
  }

  const [celebrations, setCelebrations] = useState<CelebrationItem[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const captureRef = useRef(null);

  const [isDone, setIsDone] = useState(() => new Date(weddingDate).getTime() <= Date.now());
  const [users, setUsers] = useState<WeddingUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeUser, setActiveUser] = useState<WeddingUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarDocked, setIsSidebarDocked] = useState(() => {
    try {
      return localStorage.getItem('zwaj-sidebar-docked') !== '0';
    } catch {
      return true;
    }
  });

  const handleDockedChange = (docked: boolean) => {
    setIsSidebarDocked(docked);
    try {
      localStorage.setItem('zwaj-sidebar-docked', docked ? '1' : '0');
    } catch {
      // Ignore: preference just won't be remembered
    }
  };
  const handleComplete = useCallback(() => setIsDone(true), []);

  // Fetches the public bio/photo, which the list leaves out
  const loadUserDetails = (slug: string) => {
    fetch(`/api/users?slug=${encodeURIComponent(slug)}`)
      .then(res => (res.ok ? res.json() : null))
      .then((details: WeddingUser | null) => {
        if (details) setActiveUser(current => (current?.slug === slug ? { ...current, ...details } : current));
      })
      .catch(() => {});
  };

  // Fixed-position sidebars resolve start/end from the root element, so keep it in sync
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const applyUser = (user: WeddingUser) => {
    setActiveUser(user);
    setWeddingDate(user.wedding_date);
    setIsDone(new Date(user.wedding_date).getTime() <= Date.now());
    loadUserDetails(user.slug);
  };

  // Each user has their own page at /<slug>; the home page shows the default user
  const showUserFromPath = (list: WeddingUser[]) => {
    const slug = window.location.pathname.slice(1) || DEFAULT_SLUG;
    const user = list.find(u => u.slug === slug) ?? list.find(u => u.slug === DEFAULT_SLUG);
    if (user) applyUser(user);
  };

  useEffect(() => {
    let list: WeddingUser[] = [];
    fetch('/api/users')
      .then(res => (res.ok ? res.json() : []))
      .then((data: WeddingUser[]) => {
        list = data;
        setUsers(data);
        showUserFromPath(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingUsers(false));

    const onPopState = () => showUserFromPath(list);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSelectUser = (user: WeddingUser) => {
    window.history.pushState(null, '', user.slug === DEFAULT_SLUG ? '/' : `/${user.slug}`);
    applyUser(user);
    setIsSidebarOpen(false);
  };

  const handleDeleted = () => {
    const deletedSlug = activeUser?.slug;
    const remaining = users.filter(u => u.slug !== deletedSlug);
    setUsers(remaining);
    window.history.pushState(null, '', '/');
    const fallback = remaining.find(u => u.slug === DEFAULT_SLUG);
    if (fallback) applyUser(fallback);
  };

  const handleCreate = async (date: string, name: string, nameEn: string, pin: string) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nameEn, pin, weddingDate: date })
    });
    if (!res.ok) throw new Error('Failed to save');
    const { user, token }: { user: WeddingUser; token: string } = await res.json();
    saveToken(user.slug, token);
    window.history.pushState(null, '', `/${user.slug}`);
    setUsers(prev => [prev[0], user, ...prev.slice(1)].filter(Boolean));
    applyUser(user);
  };

  // Celebratory words in both languages
  const celebratoryWords = {
    en: ['Love', 'Joy', 'Forever', 'Happy', 'Bliss', 'Romance', 'Together', 'Dream'],
    ar: ['حب', 'سعادة', 'إلى الأبد', 'فرح', 'نعيم', 'رومانسية', 'معاً', 'حلم']
  };

  const balloonEmojis = ['🎈', '🎉', '💕', '💖', '✨', '🌟', '💝', '💗'];

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger celebrations if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now() + Math.random();
    const currentWords = celebratoryWords[language as keyof typeof celebratoryWords] || celebratoryWords.en;
    const randomWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    const randomBalloon = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];

    // Randomly choose to show either a balloon or a word
    const showBalloon = Math.random() > 0.5;

    const newCelebration: CelebrationItem = {
      id,
      x,
      y,
      content: showBalloon ? randomBalloon : randomWord,
      isBalloon: showBalloon,
      language: language // Store the current language with the celebration
    };

    setCelebrations(prev => [...prev, newCelebration]);

    // Remove after animation completes
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== id));
    }, 2000);
  };

  const text = {
    en: {
      title: 'Our Wedding',
      subtitle: 'Counting down to our special day',
      footer: 'Made with love',
      by: 'by',
      fullScreen: 'Full Screen',
      exitFullScreen: 'Exit Full Screen'
    },
    ar: {
      title: 'حفل زفافنا',
      subtitle: 'العدّ التنازلي ليومنا المنتظر',
      footer: 'صُنع بحب',
      by: 'بواسطة',
      fullScreen: 'ملء الشاشة',
      exitFullScreen: 'إنهاء ملء الشاشة'
    }
  };

  const currentText = text[language as keyof typeof text] || text.en;
  const isRTL = language === 'ar';

  const ownerName = activeUser ? displayName(activeUser, language) : '';

  const sidebar = (
    <UsersSidebar
      users={users}
      isLoading={isLoadingUsers}
      activeSlug={activeUser?.slug ?? ''}
      language={language}
      isOpen={isSidebarOpen}
      onOpenChange={setIsSidebarOpen}
      isDocked={isSidebarDocked}
      onDockedChange={handleDockedChange}
      onSelect={handleSelectUser}
    />
  );

  // Leaves room for the docked sidebar on medium and large screens
  const dockOffset = isSidebarDocked ? 'md:ps-72' : '';

  const profileButton = activeUser && (
    <ProfileDialog
      user={activeUser}
      language={language}
      onSaved={() => loadUserDetails(activeUser.slug)}
      onDeleted={handleDeleted}
    />
  );

  const profileDetails = activeUser && (activeUser.photo || activeUser.bio) && (
    <div className="mt-6 flex flex-col items-center gap-4">
      {activeUser.photo && (
        <PhotoPreview
          src={activeUser.photo}
          alt={ownerName}
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-[#D4AF37] shadow-lg"
        />
      )}
      {activeUser.bio && (
        <p
          className="max-w-xl text-base md:text-lg text-[#5C4A32] whitespace-pre-line leading-relaxed"
          style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
        >
          {activeUser.bio}
        </p>
      )}
    </div>
  );

  if (isDone) {
    return (
      <>
        <Celebration
          language={language}
          name={ownerName}
          details={profileDetails}
          actions={profileButton}
          className={isSidebarDocked ? 'md:start-72' : ''}
          onSubmit={handleCreate}
        />
        {sidebar}
      </>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#F5F3EE] via-[#FBF9F4] to-[#F0EDE5] flex flex-col relative overflow-hidden cursor-pointer select-none transition-[padding] duration-300 ${isFullScreen ? '' : dockOffset}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={handleClick}
    >
      {!isFullScreen && sidebar}

      {/* Celebrations overlay */}
      {celebrations.map(celebration => {
        const celebrationIsRTL = celebration.language === 'ar';
        return (
          <motion.div
            key={celebration.id}
            initial={{
              opacity: 1,
              scale: 0.5,
              y: 0
            }}
            animate={{
              y: -150,
              opacity: 0,
              scale: celebration.isBalloon ? 1.5 : 1.2,
              rotate: celebration.isBalloon ? [0, 10, -10, 0] : 0
            }}
            transition={{
              duration: 2,
              ease: "easeOut"
            }}
            className="absolute pointer-events-none z-[9999]"
            style={{
              left: celebration.x,
              top: celebration.y,
              fontSize: celebration.isBalloon ? '2rem' : '1.5rem',
              fontFamily: celebration.isBalloon ? 'inherit' : (celebrationIsRTL ? 'Amiri, serif' : 'Playfair Display, serif'),
              color: '#D4AF37',
              fontWeight: celebration.isBalloon ? 'normal' : 'bold',
              textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
              transform: 'translateX(-50%)' // Center horizontally
            }}
          >
            {celebration.content}
          </motion.div>
        );
      })}

      {/* Header */}
      <AnimatePresence>
        {!isFullScreen && (
          <motion.header
            className="p-4 md:p-6 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <motion.div
                className={`flex items-center gap-2 ps-14 ${isSidebarDocked ? 'md:ps-0' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-[#D4AF37] fill-[#D4AF37]" />
                <span
                  className="text-xl md:text-2xl text-[#2C2C2C]"
                  style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                >
                  {currentText.title}
                </span>
              </motion.div>
              <div className="flex items-center gap-4">
                <LanguageToggle language={language} onLanguageChange={setLanguage} />
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10">
        {/* Full Screen Toggle */}
        <motion.button
          className="absolute top-4 end-4 md:top-8 md:end-8 p-2 rounded-full bg-white/50 hover:bg-white text-[#D4AF37] shadow-sm transition-colors z-50"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullScreen(!isFullScreen);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={isFullScreen ? currentText.exitFullScreen : currentText.fullScreen}
        >
          {isFullScreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </motion.button>

        <div className="max-w-6xl w-full text-center" ref={captureRef}>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 md:mb-16"
          >
            <h1
              className="text-4xl md:text-6xl lg:text-7xl mb-4 text-[#2C2C2C]"
              style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
            >
              {currentText.title}
            </h1>
            <p
              className="text-lg md:text-xl text-[#8B7355]"
              style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
            >
              {currentText.subtitle}
            </p>
            {ownerName && (
              <p
                className="mt-4 text-2xl md:text-3xl text-[#D4AF37]"
                style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
              >
                {ownerName}
              </p>
            )}
            {profileDetails}
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 md:mb-16"
          >
            <CountdownTimer targetDate={weddingDate} language={language} onComplete={handleComplete} />
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 md:mt-16 flex justify-center gap-2"
          >
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </motion.div>
        </div>

        {/* Controls (Date Picker & Share) - Hide in Full Screen */}
        <AnimatePresence>
          {!isFullScreen && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center gap-6 mt-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <DatePicker onSubmit={handleCreate} language={language} />
              </motion.div>

              {profileButton}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <ShareButton
                  weddingDate={weddingDate}
                  language={language}
                  captureRef={captureRef}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <AnimatePresence>
        {!isFullScreen && (
          <motion.footer
            className="p-6 text-center relative z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="text-sm text-[#8B7355] flex items-center justify-center gap-2 flex-wrap"
              style={{ fontFamily: isRTL ? 'IBM Plex Sans Arabic, sans-serif' : 'Inter, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <span className="flex items-center gap-2">
                {currentText.footer} <Heart className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
              </span>
              <span className="flex items-center gap-1">
                {currentText.by}{' '}
                <a
                  href="https://hsnalidroos.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:text-[#C19B2E] transition-colors font-semibold cursor-pointer pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontFamily: isRTL ? 'Amiri, serif' : 'Playfair Display, serif' }}
                >
                  HSN
                </a>
              </span>
            </motion.p>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
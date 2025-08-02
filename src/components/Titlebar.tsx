'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
export default function Titlebar() {
  const {user} = useAuth();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(currentScrollY);

      // Reset the auto-hide timer
      if (idleTimeout) clearTimeout(idleTimeout);
      const timeout = setTimeout(() => setHidden(true), 3000); // hide after 5s idle
      setIdleTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [lastScrollY, idleTimeout, user]);


 
 const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const localD = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldUseDark = localD === 'dark' || (!localD && prefersDark);

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const handleToggleT = () => {
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('darkMode', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    setIsDark(newTheme === 'dark');
  };
  return (
   <div
   style={{marginRight:"60px"}}
  className={clsx(
    'titlebarMobApp',
    hidden ? '-translate-y-full' : 'translate-y-0'
  )}
>
  <div className="flex gap-2 s">
    <button onClick={handleToggleT}>
      {isDark ? '🌙' : '☀️'}
    </button>
  </div>
</div>

  );
}

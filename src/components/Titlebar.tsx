'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function Titlebar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setHidden(currentScrollY > lastScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={clsx(
        'titlebarMobApp transition-transform duration-300 fixed w-full z-50 bg-black text-white px-4 py-2 flex justify-between items-center',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <span className="font-bold">Blabzio</span>
      <div className="flex gap-2">
        <button className="text-white">⚙️</button>
      </div>
    </div>
  );
}

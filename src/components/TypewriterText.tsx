'use client';

import React, { useState, useEffect } from 'react';

export interface TypewriterItem {
  text: string;
  colorClass: string;
}

interface TypewriterTextProps {
  items: TypewriterItem[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypewriterText({
  items,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseDuration = 2200,
  className = '',
}: TypewriterTextProps) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentItem = items[index % items.length];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && text === currentItem.text) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setIndex((prev) => prev + 1);
    } else {
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timer = setTimeout(() => {
        const targetText = isDeleting
          ? currentItem.text.substring(0, text.length - 1)
          : currentItem.text.substring(0, text.length + 1);
        setText(targetText);
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, currentItem.text, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-block relative transition-colors duration-300 ${currentItem.colorClass} ${className}`}>
      {text}
      <span className="inline-block w-[3px] h-[0.85em] bg-brand-500 mr-1 align-middle animate-[pulse_0.8s_infinite]" />
    </span>
  );
}

import { useState, useEffect } from 'react';

interface AnimatedTitleProps {
  baseTitle: string;
  animatedSuffix: string;
  className?: string;
  delay?: number;
}

function AnimatedTitle({
  baseTitle,
  animatedSuffix,
  className = 'text-2xl font-bold mb-6 inline-block',
  delay = 300,
}: AnimatedTitleProps) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTitleExpanded(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <h1 className={className}>
      <span>{baseTitle}</span>
      <span
        className={`inline-block overflow-hidden whitespace-nowrap transition-all duration-1000 ease-in-out align-bottom ${
          isTitleExpanded ? 'max-w-xs opacity-100 ml-1' : 'max-w-0 opacity-0'
        }`}
      >
        {animatedSuffix}
      </span>
    </h1>
  );
}

export default AnimatedTitle;

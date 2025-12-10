import { useEffect, type RefObject } from 'react';

interface UseClickOutsideProps {
  ref: RefObject<HTMLElement | null>;
  callback: () => void;
  isActive?: boolean;
}

export const useClickOutside = ({
  ref,
  callback,
  isActive = true,
}: UseClickOutsideProps) => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, isActive]);
};

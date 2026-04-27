import { useEffect, useState } from 'react';

/**
 * Hook to check if component has mounted on client side
 * Useful for preventing hydration mismatches
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

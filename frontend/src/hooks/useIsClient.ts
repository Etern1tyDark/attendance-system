'use client';

import { useEffect, useState } from 'react';

export default function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Double check that we're actually in the browser
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  return isClient;
}

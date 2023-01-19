import { useState, useEffect } from 'react';

export const MAX_MOBILE_WIDTH = 800;

const hasWindow = (typeof window !== 'undefined');

export default function useWindowDimensions(): readonly [number, number] | [null, null] {
    const [windowDimensions, setWindowDimensions] = useState<readonly [number, number] | [null, null]>([null, null]);

    useEffect(() => {
        if (hasWindow) {
            // Set the window size
            setWindowDimensions([window.innerHeight, window.innerWidth] as const);

            // Every time window resizes, update state
            function handleResize() {
                if (hasWindow) {
                    const height = window.innerHeight;
                    const width = window.innerWidth;
                    setWindowDimensions([height, width] as const);
                } else
                    setWindowDimensions([null, null]);
            }

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [hasWindow]);

    return windowDimensions;
}
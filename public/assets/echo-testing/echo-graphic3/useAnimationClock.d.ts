/** Integrate speed changes without resetting the dancer's phase. */
export declare function useAnimationClock(paused: boolean, speed?: number): {
    ref: import("react").RefObject<HTMLDivElement>;
    time: number;
};

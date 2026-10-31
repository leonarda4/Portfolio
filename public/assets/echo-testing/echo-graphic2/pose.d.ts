export type Qualities = [number, number, number, number];
export type Point = [number, number];
export declare const edges: number[][];
export declare function poseAt(seconds: number, q: Qualities, dance: 'house' | 'overhead-wave'): Point[];

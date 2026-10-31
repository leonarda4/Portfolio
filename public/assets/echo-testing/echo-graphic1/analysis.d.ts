import { Point } from './pose';
export type FocusMetric = 'motion' | 'weight' | 'flow';
export declare const jointNames: Record<number, string>;
export declare const focusJoints: number[];
/** Deterministic motion proxies from a trailing 0.32-second pose window. No force measurements. */
export declare function measureJointSignals(frames: Point[][], dt: number, weight: number): {
    index: number;
    motion: number;
    weight: number;
    flow: number;
}[];
export declare function bounds(points: Point[]): {
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
};

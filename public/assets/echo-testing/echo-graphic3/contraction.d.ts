import { Point } from './pose';
export declare function blendPose(from: Point[], to: Point[], t: number): Point[];
export declare function contractionPose(amount: number): Point[];
export declare function contractionAt(time: number): Point[];

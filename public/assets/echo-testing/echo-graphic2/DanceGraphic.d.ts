import React from 'react';
import { Point, Qualities } from './pose';
import { FocusMetric } from './analysis';
import { GraphicTheme } from './tokens';
export declare const defaultQualities: Qualities;
export declare const danceSpeed: (time: number) => number;
/** Authored movement controls over the recorded House phrase. Clock is integrated by the player. */
export declare function controlledPose(time: number, q: Qualities): Point[];
export declare function SkeletonAnalysis({ points, signals }: {
    points: Point[];
    signals?: {
        index: number;
        value: number;
    }[];
}): React.JSX.Element;
export declare function DanceGraphic({ time, qualities, theme, focus }: {
    time?: number;
    qualities?: Qualities;
    theme?: GraphicTheme;
    focus?: FocusMetric;
}): React.JSX.Element;

import React from 'react';
import { Point } from './pose';
export type SystemScene = 'architecture' | 'feedback' | 'installation';
export declare const systemScenes: ({
    id: "architecture";
    name: string;
    title: string;
    description: string;
    variants: string[];
    captions: string[];
} | {
    id: "feedback";
    name: string;
    title: string;
    description: string;
    variants: string[];
    captions: string[];
} | {
    id: "installation";
    name: string;
    title: string;
    description: string;
    variants: string[];
    captions: string[];
})[];
export declare function Body({ x, y, scale, time, headphones, bright }: {
    x: number;
    y: number;
    scale?: number;
    time?: number;
    headphones?: boolean;
    bright?: boolean;
}): React.JSX.Element;
export declare function Field({ x, y, w, h, time, vertical, bright }: {
    x: number;
    y: number;
    w?: number;
    h?: number;
    time?: number;
    vertical?: boolean;
    bright?: boolean;
}): React.JSX.Element;
export declare function Pulse({ points, time, offset }: {
    points: Point[];
    time: number;
    offset?: number;
}): React.JSX.Element;
export declare function SystemGraphic({ scene, time, labels, spread }: {
    scene: SystemScene;
    time: number;
    labels?: boolean;
    spread?: number;
}): React.JSX.Element;

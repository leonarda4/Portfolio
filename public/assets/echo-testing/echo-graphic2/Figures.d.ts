import React from 'react';
export declare const Plate: ({ x, y, w, h, z, active }: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    z?: number;
    active?: boolean;
}) => React.JSX.Element;
export declare const Figure: ({ children, style }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => React.JSX.Element;
export declare const Phone: ({ phase }: {
    phase?: number;
}) => React.JSX.Element;
export declare const Layers: ({ phase }: {
    phase?: number;
}) => React.JSX.Element;
export declare const Field: ({ frame }: {
    frame?: number;
}) => React.JSX.Element;
export declare const Wave: ({ frame }: {
    frame?: number;
}) => React.JSX.Element;
export declare const Body: ({ frame }: {
    frame?: number;
}) => React.JSX.Element;

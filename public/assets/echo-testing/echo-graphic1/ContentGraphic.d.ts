import React from 'react';
import { GraphicTheme } from './tokens';
/** Canonical SVG renderer for the gallery, static assets and React exports. */
export declare function ContentGraphic({ id, time, loop, theme }: {
    id: string;
    time?: number;
    loop?: boolean;
    theme?: GraphicTheme;
}): React.JSX.Element;

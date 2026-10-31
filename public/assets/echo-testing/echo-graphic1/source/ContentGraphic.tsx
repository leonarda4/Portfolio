import React from 'react';
import {SkeletonAnalysis} from './DanceGraphic';
import {contractionAt} from './contraction';
import {EnglishSystemLabels} from './SystemLabel';
import {SystemGraphic} from './SystemGraphic';
import {Phone, Layers, Field, Wave, Body} from './Figures';
import {edges, poseAt} from './pose';
import {contentCatalog, LOOP_SECONDS} from './catalog';
import {themes, GraphicTheme} from './tokens';

/** Canonical SVG renderer for the gallery, static assets and React exports. */
export function ContentGraphic({id, time = 3.25, loop = true, theme = 'dark'}: {
  id: string; time?: number; loop?: boolean; theme?: GraphicTheme;
}) {
  const item = contentCatalog.find(entry => entry.id === id);
  if (!item) throw new Error(`Unknown content graphic: ${id}`);
  const seconds = loop ? ((time % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS : time;
  const phase = (1 - Math.cos(seconds * Math.PI * 2 / LOOP_SECONDS)) / 2;
  const points = item.index === -1 ? poseAt(seconds, [.2,.2,.5,.2], 'overhead-wave') : [];
  const studies = [<Phone phase={phase}/>, <Layers phase={phase}/>, <Field frame={seconds*30}/>, <Wave frame={seconds*30}/>, <Body frame={seconds*30}/>];
  return <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"
    viewBox={item.group === 'system' ? '0 0 1200 675' : '0 0 1920 1080'}
    style={{...themes[theme], display:'block', width:'100%', height:'auto', color:'var(--echo-ink)'} as React.CSSProperties}
    role="img" aria-label={item.title}>
    <title>{item.title}</title><rect width="100%" height="100%" fill="var(--echo-bg)"/>
    {item.group === 'system'
      ? <EnglishSystemLabels.Provider value={true}><SystemGraphic scene={item.scene} time={seconds}/></EnglishSystemLabels.Provider>
      : <>
        <svg x={item.index < 0 ? 535 : 360} y={60} width={item.index < 0 ? 850 : 1200} height={960} viewBox={item.index < 0 ? '0 0 400 420' : '0 0 400 320'}>
          {item.id === 'contraction-index' ? <SkeletonAnalysis points={contractionAt(seconds)}/> : item.index < 0 ? <g fill="var(--echo-bg)" stroke="var(--echo-ink)" strokeWidth=".85" strokeLinecap="round" strokeLinejoin="round">
            {edges.map(([a,b],i)=><path key={i} d={`M${points[a]}L${points[b]}`} fill="none" opacity=".7"/>)}
            {points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i<11?1.1:2.7}/>)}
          </g> : studies[item.index]}
        </svg>
        <g fill="var(--echo-ink)" textAnchor="middle" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif">
          <text x={960} y={95} fontSize={38}>{item.title}</text>
          <text x={960} y={1015} fontSize={28}>{item.caption}</text>
        </g>
      </>}
  </svg>;
}

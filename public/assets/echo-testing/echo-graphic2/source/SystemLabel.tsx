import {createContext, useContext} from 'react';
import {theme, type} from './tokens';

// Export labels can be English without changing the Croatian presentation.
export const EnglishSystemLabels = createContext(false);
const english: Record<string,string> = {
 'Obrada u Pythonu':'Python processing', 'Preglednik':'Browser',
 'Kamera':'Camera', 'M1 / Estimacija poze':'M1 / Pose estimation',
 'M2 / Ekstrakcija\nznačajki pokreta':'M2 / Movement\nfeature extraction',
 'M3 / Klasifikacija\nemocije':'M3 / Emotion\nclassification',
 'M4 / Odabir\naudiovizualnog predloška':'M4 / Audiovisual\npreset selection',
 'Praćenje':'Tracking', 'Interpretacija':'Interpretation', 'Odgovor':'Response',
 'Percepcija i prilagodba':'Perception and adaptation',
 'Projektor':'Projector', 'Kamera mobitela':'Mobile phone camera',
 'Sudionik':'Participant', 'Projekcija':'Projection', 'Prijenosno računalo':'Laptop',
 'M1 / Poza':'M1 / Pose', 'M2 / Značajke':'M2 / Features',
 'M3 / Klasifikacija':'M3 / Classification', 'M4 / AV odgovor':'M4 / AV response',
 'Tijelo kao signal.':'The body as a signal.',
};

// Match the shared 28 px annotation size in the 1200 × 675 SVG.
const labelSize = type.label / 1.6;
export function SystemLabel({x,y,title,anchor='start',scale=1,opacity=1}:{
 x:number;y:number;title:string;anchor?:'start'|'middle'|'end';scale?:number;opacity?:number;
}) {
 const translated = useContext(EnglishSystemLabels) ? english[title] ?? title : title;
 return <text x={x} y={y} textAnchor={anchor} stroke="none" fill="var(--echo-ink)"
  fontFamily={theme.font} fontSize={labelSize/scale} fontWeight={400} opacity={opacity}>{translated.split('\n').map((line,index)=><tspan key={index} x={x} dy={index===0?0:labelSize*1.25/scale}>{line}</tspan>)}</text>;
}

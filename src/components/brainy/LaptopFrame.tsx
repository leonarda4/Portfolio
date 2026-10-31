import {useId} from 'react';
// The original screen side bezel is 15 units around an 840-unit display.
export const laptopScreenBorderRatio = 15 / 840;
// Preserved original laptop geometry used by the film.
// The display is transparent so the same live UI stays underneath the bezel.
export function LaptopFrame({x,y,width,opacity}:{x:number;y:number;width:number;opacity:number}){
 const id=useId();
 const scale=width/840;
 const outer='M157 0H983Q1005 0 1005 22V550Q1005 559 996 559H144Q135 559 135 550V22Q135 0 157 0Z';
 const display='M158 16H982Q990 16 990 24V539Q990 541 988 541H152Q150 541 150 539V24Q150 16 158 16Z';
 return <svg data-laptop-frame viewBox="0 0 1140 600" style={{position:'absolute',left:x-150*scale,top:y-16*scale,width:1140*scale,height:600*scale,opacity,overflow:'visible',pointerEvents:'none'}}>
  <defs>
   <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e4e4e7"/><stop offset="1" stopColor="#a4a4aa"/></linearGradient>
   <linearGradient id={`${id}-grip`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8c8c90"/><stop offset="1" stopColor="#d0d0d4"/></linearGradient>
   <filter id={`${id}-shadow`} x="-20%" y="-150%" width="140%" height="500%"><feDropShadow dx="0" dy="12" stdDeviation="9" floodOpacity=".19"/></filter>
  </defs>
  <path d={`${outer} ${display}`} fill="#111113" fillRule="evenodd"/>
  <path d={outer} fill="none" stroke="#6b6b6e" strokeWidth="3"/>
  <path d="M522.5 10H617.5V19Q617.5 28 608.5 28H531.5Q522.5 28 522.5 19Z" fill="#111113"/>
  <circle cx="570" cy="17.5" r="2.5" fill="#252830"/>
  <text x="570" y="552" textAnchor="middle" fontFamily="Arial" fontSize="8" letterSpacing=".25" fill="#a2a2a7">MacBook Pro</text>
  <path d="M89 572H1051V575Q1051 579 570 579Q89 579 89 575Z" fill="#77777c" filter={`url(#${id}-shadow)`}/>
  <path d="M82 556H1058Q1060 556 1060 558V561Q1060 573 1048 573H92Q80 573 80 561V558Q80 556 82 556Z" fill={`url(#${id}-base)`} stroke="#99999d"/>
  <path d="M502.5 556H637.5V557Q637.5 564 629.5 564H510.5Q502.5 564 502.5 557Z" fill={`url(#${id}-grip)`}/>
 </svg>;
}

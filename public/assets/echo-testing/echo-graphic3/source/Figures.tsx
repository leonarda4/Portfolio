import {LOOP_SECONDS} from './catalog';
import React from 'react';
import {poseAt, edges} from './pose';
import {theme as t} from './tokens';
// Hairline-inspired diagrams, sampled from the shared animation clock.
// No live pointer engine, wall-clock animation, or claims of recorded system output.
const p = (x:number,y:number,z:number):[number,number] => [200+(x-y)*.86,190+(x+y)*.43-z];
const ring = (x:number,y:number,w:number,h:number,z:number) => {
 const r=5; const pts:[number,number][]=[];
 [[x+r,y+r,Math.PI],[x+w-r,y+r,Math.PI*1.5],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI*.5]].forEach(([cx,cy,a])=>{for(let i=0;i<=6;i++)pts.push(p(cx+Math.cos(a+i*Math.PI/12)*r,cy+Math.sin(a+i*Math.PI/12)*r,z));});
 return pts;
};
const path=(a:[number,number][])=>'M'+a.map(v=>v.join(',')).join(' L')+' Z';
export const Plate=({x=-65,y=-45,w=130,h=90,z=0,active=false}:{x?:number;y?:number;w?:number;h?:number;z?:number;active?:boolean})=><g><path d={path(ring(x,y,w,h,z-5))} fill={t.bg} stroke={t.line}/><path d={path(ring(x,y,w,h,z))} fill={t.bg} stroke={active?t.white:t.line}/><path d={path(ring(x+4,y+4,w-8,h-8,z))} fill="none" stroke={t.faint}/></g>;
export const Figure=({children,style}:{children:React.ReactNode;style?:React.CSSProperties})=><svg viewBox="0 0 400 320" style={{width:'100%',height:'100%',overflow:'visible',...style}} fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
export const Phone=({phase=0}:{phase?:number})=><Figure><Plate x={-48} y={-85} w={96} h={170} z={-15}/><Plate x={-48} y={-85} w={96} h={170} z={8+phase*18} active/><path d={path(ring(-39,-73,78,142,10+phase*18))} stroke={t.line}/><circle cx={p(0,-78,12+phase*18)[0]} cy={p(0,-78,12+phase*18)[1]} r="2" fill={t.white}/></Figure>;
export const Layers=({phase=0}:{phase?:number})=><Figure>{[0,1,2,3].map(i=><Plate key={i} z={i*(17+phase*12)-24} active={i===3}/>)}</Figure>;
export const Field=({frame=0}:{frame?:number})=><Figure>{Array.from({length:9},(_,i)=><path key={i} d={'M'+Array.from({length:40},(_,j)=>{const x=-105+j*5.4,y=-80+i*20,z=20+Math.sin(j*.13+i*.4+frame/30*Math.PI*2/LOOP_SECONDS)*18;return p(x,y,z).join(',')}).join(' L')} stroke={i===4?t.white:t.line}/>)}</Figure>;
export const Wave=({frame=0}:{frame?:number})=><Figure>{Array.from({length:39},(_,i)=>{const x=40+i*8.4;const a=10+Math.abs(Math.sin(i*.23+frame/30*Math.PI*2/LOOP_SECONDS))*65*Math.sin(i/38*Math.PI);return <path key={i} d={`M${x},${160-a}v${a*2}`} stroke={i>15&&i<22?t.white:t.line}/>;})}</Figure>;
export const Body=({frame=0}:{frame?:number})=>{
 const pts=poseAt(frame/30,[.2,.2,.5,.2],'house').map(([x,y])=>[200+(x-200)*.8,49+(y-62)*.78]);
 return <Figure>{edges.map(([a,b],i)=><path key={i} d={`M${pts[a]}L${pts[b]}`} stroke={i<26?t.muted:t.line}/>)}{pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i<11?1.6:2.5} fill={t.bg} stroke={i===15||i===16?t.white:t.muted}/>)}</Figure>;
};

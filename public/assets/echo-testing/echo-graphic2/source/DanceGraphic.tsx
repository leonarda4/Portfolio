import React from 'react';
import {Point, Qualities, poseAt, edges} from './pose';
import {blendPose, contractionPose} from './contraction';
import {bounds, measureJointSignals, jointNames, FocusMetric} from './analysis';
import {themes, GraphicTheme} from './tokens';

export const defaultQualities:Qualities=[.2,.2,.5,.2];
export const danceSpeed=(time:number)=>.4+time*3;

/** Authored movement controls over the recorded House phrase. Clock is integrated by the player. */
export function controlledPose(time:number,q:Qualities):Point[]{
 const step=.32, base=Math.floor(time/step)*step, u=(time-base)/step;
 const ease=u*u*(3-2*u), held=ease*ease*(3-2*ease);
 const sample=base+step*(u+(held-u)*q[2]);
 const raw=poseAt(sample,q,'house');
 const contracted=contractionPose(1);
 const points=blendPose(raw,contracted,q[3]*.8);
 // Weight adds a visible downward emphasis, strongest at the center of each step.
 const drop=q[0]*12*(1-Math.cos(time*Math.PI*2))/2;
 return points.map(([x,y],i)=>[x,y+(i<25?drop:i<27?drop*.4:0)]);
}
const open= bounds(contractionPose(0));
export function SkeletonAnalysis({points,signals=[]}:{points:Point[];signals?:{index:number;value:number}[]}){
 const box=bounds(points),ci=Math.max(0,Math.min(1,1-box.area/open.area));
 return <g fill="none" stroke="var(--echo-ink)" strokeLinecap="round" strokeLinejoin="round">
  <rect data-reference-box="true" x={open.x} y={open.y} width={open.width} height={open.height} strokeDasharray="3 5" opacity=".35"/>
  <rect data-live-box="true" x={box.x} y={box.y} width={box.width} height={box.height} strokeWidth="1.2"/>
  {edges.map(([a,b],i)=><path key={i} d={`M${points[a]}L${points[b]}`} strokeWidth=".9" opacity=".75"/>)}
  {points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i<11?1:2} fill="var(--echo-bg)" strokeWidth=".8"/>)}
  {signals.map(({index,value})=><circle data-joint={index} key={index} cx={points[index][0]} cy={points[index][1]} r={Math.sqrt(9+value*500)} fill="var(--echo-ink)" fillOpacity=".04" strokeWidth="1" opacity={.3+value*.7}><title>{jointNames[index]}</title></circle>)}
  <text x="200" y="407" textAnchor="middle" fill="var(--echo-ink)" stroke="none" fontSize="11" fontFamily="system-ui">Area CI {ci.toFixed(2)} · solid: live / dashed: open pose</text>
 </g>;
}
export function DanceGraphic({time=3.25,qualities=defaultQualities,theme='dark',focus='motion'}:{time?:number;qualities?:Qualities;theme?:GraphicTheme;focus?:FocusMetric}){
 const points=controlledPose(time,qualities);
 const dt=.04,rate=danceSpeed(qualities[1]);
 const samples=Array.from({length:9},(_,i)=>controlledPose(time-(8-i)*dt*rate,qualities));
 const signals=measureJointSignals(samples,dt,qualities[0]).map(s=>({index:s.index,value:s[focus]}));
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 430" role="img" aria-label="Interactive House dance with contraction bounding box and joint activity" style={{...themes[theme],width:'100%',display:'block'} as React.CSSProperties}>
  <rect width="400" height="430" fill="var(--echo-bg)"/>
  <SkeletonAnalysis points={points} signals={signals}/>
 </svg>;
}

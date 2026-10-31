import {Point} from './pose';
export type FocusMetric='motion'|'weight'|'flow';
export const jointNames:Record<number,string>={11:'Left shoulder',12:'Right shoulder',13:'Left elbow',14:'Right elbow',15:'Left wrist',16:'Right wrist',23:'Left hip',24:'Right hip',25:'Left knee',26:'Right knee',27:'Left ankle',28:'Right ankle'};
export const focusJoints=Object.keys(jointNames).map(Number);
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
/** Deterministic motion proxies from a trailing 0.32-second pose window. No force measurements. */
export function measureJointSignals(frames:Point[][],dt:number,weight:number){
 return focusJoints.map(index=>{
  let speed=0,acceleration=0,pathLength=0;const velocities:Point[]=[];
  for(let k=1;k<frames.length;k++){
   const dx=frames[k][index][0]-frames[k-1][index][0],dy=frames[k][index][1]-frames[k-1][index][1];
   const v:Point=[dx/dt,dy/dt];velocities.push(v);speed+=Math.hypot(...v);pathLength+=Math.hypot(dx,dy);
  }
  for(let k=1;k<velocities.length;k++)acceleration+=Math.hypot(velocities[k][0]-velocities[k-1][0],velocities[k][1]-velocities[k-1][1])/dt;
  speed/=Math.max(1,velocities.length);acceleration/=Math.max(1,velocities.length-1);
  const start=frames[0][index],end=frames[frames.length-1][index];
  const continuity=pathLength>0?clamp(Math.hypot(end[0]-start[0],end[1]-start[1])/pathLength):0;
  return {index,motion:speed/(speed+140),weight:acceleration/(acceleration+1600)*(.25+.75*weight),flow:speed/(speed+100)*continuity};
 });
}
export function bounds(points:Point[]){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const x=Math.min(...xs),y=Math.min(...ys),width=Math.max(...xs)-x,height=Math.max(...ys)-y;return {x,y,width,height,area:width*height};}

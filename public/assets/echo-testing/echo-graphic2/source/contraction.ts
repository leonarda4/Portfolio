import {Point,poseAt} from './pose';
import {LOOP_SECONDS} from './catalog';
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const ref=poseAt(36.88,[.2,.2,.5,.2],'house');
const measuredLength=(a:number,b:number)=>Math.hypot(ref[a][0]-ref[b][0],ref[a][1]-ref[b][1]);
// A single camera frame foreshortens one arm. Authored gestures use the longer
// visible side for both arms, rather than baking that projection into anatomy.
const length=(a:number,b:number)=>{
 if(a===11&&b===13||a===12&&b===14)return Math.max(measuredLength(11,13),measuredLength(12,14));
 if(a===13&&b===15||a===14&&b===16)return Math.max(measuredLength(13,15),measuredLength(14,16));
 return measuredLength(a,b);
};
export function blendPose(from:Point[],to:Point[],t:number):Point[]{
 const result=to.map((p,i)=>[mix(from[i][0],p[0],t),mix(from[i][1],p[1],t)] as Point);
 // Interpolate limb angles instead of collapsing elbows/wrists through the torso.
 for(const [root,joint] of [[11,13],[13,15],[12,14],[14,16]]){
  const a=Math.atan2(from[joint][1]-from[root][1],from[joint][0]-from[root][0]);
  const b=Math.atan2(to[joint][1]-to[root][1],to[joint][0]-to[root][0]);
  const angle=a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
  const span=mix(Math.hypot(from[joint][0]-from[root][0],from[joint][1]-from[root][1]),Math.hypot(to[joint][0]-to[root][0],to[joint][1]-to[root][1]),t);
  result[joint]=[result[root][0]+Math.cos(angle)*span,result[root][1]+Math.sin(angle)*span];
 }
 for(const [wrist,fingers] of [[15,[17,19,21]],[16,[18,20,22]]] as const){
  for(const id of fingers)result[id]=[result[wrist][0]+mix(from[id][0]-from[wrist][0],to[id][0]-to[wrist][0],t),result[wrist][1]+mix(from[id][1]-from[wrist][1],to[id][1]-to[wrist][1],t)];
 }
 return result;
}
const shoulderWidth=Math.abs(ref[11][0]-ref[12][0]);
const hipWidth=Math.abs(ref[23][0]-ref[24][0]);
const torso=((ref[23][1]-ref[11][1])+(ref[24][1]-ref[12][1]))/2;
const refShoulder:Point=[(ref[11][0]+ref[12][0])/2,(ref[11][1]+ref[12][1])/2];
// All authored poses share the recording's landmark IDs and body proportions.
function body(hipY:number,stance:number,arms:number[],lean=0):Point[]{
 const p:Point[]=ref.map(v=>[...v]);
 const shoulderY=hipY-torso;
 for(let i=0;i<11;i++)p[i]=[200+lean+ref[i][0]-refShoulder[0],shoulderY+ref[i][1]-refShoulder[1]];
 for(const [s,shoulder,elbow,wrist,hip,knee,ankle,heel,toe,fingers] of [
  [1,11,13,15,23,25,27,29,31,[17,19,21]],
  [-1,12,14,16,24,26,28,30,32,[18,20,22]],
 ] as const){
  p[shoulder]=[200+lean+s*shoulderWidth/2,shoulderY];
  p[hip]=[200+s*hipWidth/2,hipY];
  const side=s===1?0:2;
  let a=arms[side];p[elbow]=[p[shoulder][0]+s*Math.cos(a)*length(shoulder,elbow),p[shoulder][1]+Math.sin(a)*length(shoulder,elbow)];
  a=arms[side+1];p[wrist]=[p[elbow][0]+s*Math.cos(a)*length(elbow,wrist),p[elbow][1]+Math.sin(a)*length(elbow,wrist)];
  fingers.forEach((id,i)=>{const along=[9,13,6][i],across=[3,0,-4][i];p[id]=[p[wrist][0]+s*(Math.cos(a)*along-Math.sin(a)*across),p[wrist][1]+Math.sin(a)*along+Math.cos(a)*across];});
  // Two-bone leg solve keeps the feet planted and knees on their own side.
  const end:Point=[200+s*stance,350];const dx=end[0]-p[hip][0],dy=end[1]-hipY;
  const upper=length(hip,knee),lower=length(knee,ankle),d=Math.min(Math.hypot(dx,dy),upper+lower-.001);
  const angle=Math.atan2(dy,dx),bend=Math.acos(Math.max(-1,Math.min(1,(upper*upper+d*d-lower*lower)/(2*upper*d))));
  p[knee]=[p[hip][0]+Math.cos(angle-s*bend)*upper,hipY+Math.sin(angle-s*bend)*upper];
  p[ankle]=[p[hip][0]+Math.cos(angle)*d,hipY+Math.sin(angle)*d];
  p[heel]=[p[ankle][0]-s*3,p[ankle][1]+5];p[toe]=[p[ankle][0]+s*12,p[ankle][1]+9];
 }
 return p;
}

export function contractionPose(amount:number):Point[]{
 return body(mix(240,300,amount),mix(65,22,amount),[mix(-.8,1.7,amount),mix(-.8,-1.7,amount),mix(-.8,1.7,amount),mix(-.8,-1.7,amount)]);
}
export function contractionAt(time:number):Point[]{
 return contractionPose((1+Math.cos(time*Math.PI*2/LOOP_SECONDS))/2);
}

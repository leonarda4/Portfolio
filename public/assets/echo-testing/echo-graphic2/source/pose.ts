import house from './house.json';
import {LOOP_SECONDS} from './catalog';
export type Qualities = [number,number,number,number];
export type Point = [number,number];
export const edges = [[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],[12,14],[14,16],[16,18],[16,20],[16,22],[18,20],[11,23],[12,24],[23,24],[23,25],[25,27],[27,29],[29,31],[27,31],[24,26],[26,28],[28,30],[30,32],[28,32],[0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10]];


// Fit the recorded phrase to one cycle, joining coordinates, never images.
export function poseAt(seconds:number, q:Qualities, dance:'house'|'overhead-wave'):Point[] {
 if(dance==='overhead-wave') return overheadWave(seconds,q);
 const frames=house.frames, overlap=12, period=frames.length-1-overlap;
 const f=(((seconds/LOOP_SECONDS)%1)+1)%1*period;
 const at=(index:number):Point[]=>{const a=Math.floor(index),b=Math.min(a+1,frames.length-1),u=index-a;return frames[a].map((p,j)=>[p[0]+(frames[b][j][0]-p[0])*u,p[1]+(frames[b][j][1]-p[1])*u]);};
 const points=at(f+overlap);
 if(f<=period-overlap)return points;
 const head=at(f-(period-overlap)),u=(f-(period-overlap))/overlap,blend=u*u*(3-2*u);
 return points.map((p,j)=>[p[0]+(head[j][0]-p[0])*blend,p[1]+(head[j][1]-p[1])*blend]);
}

function overheadWave(seconds:number,q:Qualities):Point[]{
 const phase=seconds*Math.PI*2/LOOP_SECONDS;
 const sway=Math.sin(phase)*4;
 const pts:Point[]=Array.from({length:33},()=>[200,140]);
 const head:Point[]=[[200,132],[197,128],[194,128],[191,129],[203,128],[206,128],[209,129],[187,134],[213,134],[196,140],[204,140]];
 head.forEach((p,i)=>pts[i]=[p[0]+sway,p[1]]);
 pts[11]=[178+sway,162];pts[12]=[222+sway,162];
 pts[23]=[185,244];pts[24]=[215,244];
 pts[25]=[181,302];pts[26]=[219,302];pts[27]=[177,362];pts[28]=[223,362];
 pts[29]=[181,369];pts[30]=[219,369];pts[31]=[165,373];pts[32]=[235,373];
 for(const [shoulder,elbow,wrist,pinky,index,thumb,side] of [[11,13,15,17,19,21,-1],[12,14,16,18,20,22,1]]){
  const wave=Math.sin(phase*2+side*.35);
  const upper=side*(.55-q[3]*.12)+wave*.12;
  const lower=side*.12+wave*(.34+q[2]*.08);
  const a=pts[shoulder];pts[elbow]=[a[0]+Math.sin(upper)*49,a[1]-Math.cos(upper)*49];
  const b=pts[elbow];pts[wrist]=[b[0]+Math.sin(lower)*46,b[1]-Math.cos(lower)*46];
  const w=pts[wrist],angle=lower+wave*.22;
  const hand=(x:number,y:number):Point=>[w[0]+x*Math.cos(angle)-y*Math.sin(angle),w[1]+x*Math.sin(angle)+y*Math.cos(angle)];
  pts[pinky]=hand(side*6,-13);pts[index]=hand(-side*3,-17);pts[thumb]=hand(-side*8,-8);
 }
 return pts;
}

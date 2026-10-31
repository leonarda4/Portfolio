import {roster} from './assets';
import {agentOutlines} from './agent-outlines';

// Compare white and brand ink against the tag's actual sRGB background.
const luminance=(hex:string)=>{
 const channels=[1,3,5].map(offset=>{
  const value=parseInt(hex.slice(offset,offset+2),16)/255;
  return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
 });
 return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
};
const tagColors=roster.map(({color})=>{
 const background=luminance(color),ink=luminance('#171717');
 return 1.05/(background+.05)>(background+.05)/(ink+.05)?'#FFFFFF':'#171717';
});

// Match agents/characters.js placeBadge: upright label at y=90+26,
// four display pixels beyond the rotated silhouette below that height.
export function AgentNametag({index,size,rotation=0,fontSize=17}:{index:number;size:number;rotation?:number;fontSize?:number}){
 const angle=rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),top=116;
 let right=-Infinity;
 for(const contour of agentOutlines[index]){
  const points=contour.map(([x,y])=>({x:90+(x-90)*c-(y-90)*s,y:90+(x-90)*s+(y-90)*c}));
  points.forEach((p,i)=>{
   if(p.y>=top)right=Math.max(right,p.x);
   const q=points[(i+1)%points.length];
   if((p.y<top)!==(q.y<top))right=Math.max(right,p.x+(q.x-p.x)*(top-p.y)/(q.y-p.y));
  });
 }
 return <span data-agent-nametag style={{position:'absolute',left:right/180*size+4,top:top/180*size,background:roster[index].color,color:tagColors[index],borderRadius:4,padding:'5px 9px',fontFamily:'Arial',fontWeight:600,fontSize,lineHeight:1,whiteSpace:'nowrap'}}>{roster[index].name}</span>;
}

import {LOOP_SECONDS} from './catalog';
import {theme} from './tokens';
import {SystemLabel as Label} from './SystemLabel';
import React from 'react';
import {edges, poseAt, Point} from './pose';
export type SystemScene = 'architecture' | 'feedback' | 'installation';
export const systemScenes = [
 {id:'architecture' as const, name:'System architecture', title:'From gesture to atmosphere.', description:'Kamera, interpret, compose. The processing chain behind ECHO.', variants:['Signal landscape'], captions:['Camera → pose → features → classification → audiovisual output','The four modules, separated into a readable stack.']},
 {id:'feedback' as const, name:'Feedback loop', title:'The response becomes a gesture.', description:'Movement changes the environment. Perception changes the next movement.', variants:['Reciprocal orbit'], captions:['Move → interpret → render → perceive → adapt']},
 {id:'installation' as const, name:'Installation in space', title:'A room that moves with you.', description:'A spatial study of the participant, phone camera, projection, and headphones.', variants:['Gallery perspective'], captions:['A schematic inspired by the thesis installation photographs.']},
];
const ink='var(--echo-ink)', dim='var(--echo-line)', faint='var(--echo-faint)', bg=theme.bg;
const path=(points:Point[],closed=false)=>'M'+points.map(p=>p.join(',')).join(' L')+(closed?' Z':'');
const P=(x:number,y:number,z=0):Point=>[600+(x-y)*.86,420+(x+y)*.43-z];
function rounded(x:number,y:number,w:number,h:number,z:number,r=8){const pts:Point[]=[];[[x+r,y+r,Math.PI],[x+w-r,y+r,Math.PI*1.5],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI*.5]].forEach(([cx,cy,a])=>{for(let i=0;i<=12;i++){const angle=a+i*Math.PI/24;pts.push(P(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r,z));}});return path(pts,true);}
function Plate({x,y,w=130,h=90,z=0,bright=false}:{x:number;y:number;w?:number;h?:number;z?:number;bright?:boolean}){return <g><path d={rounded(x,y,w,h,z-5)} fill={bg} stroke={dim}/><path d={rounded(x,y,w,h,z)} fill={bg} stroke={bright?ink:dim}/><path d={rounded(x+5,y+5,w-10,h-10,z)} stroke={faint}/></g>;}
export function Body({x,y,scale=1,time=0,headphones=false,bright=false}:{x:number;y:number;scale?:number;time?:number;headphones?:boolean;bright?:boolean}){const points=poseAt(time,[.25,.2,.6,.2],'house').map(([a,b])=>[x+(a-200)*scale,y+(b-362)*scale] as Point);const ears=[points[7],points[8]].sort((a,b)=>a[0]-b[0]);const head:Point=[(ears[0][0]+ears[1][0])/2,(ears[0][1]+ears[1][1])/2];const tilt=Math.atan2(ears[1][1]-ears[0][1],ears[1][0]-ears[0][0])*180/Math.PI;const headsetScale=Math.max(8,Math.min(14,Math.hypot(ears[1][0]-ears[0][0],ears[1][1]-ears[0][1])/2+3))/13;return <g stroke={ink}>{edges.map(([a,b],i)=><path key={i} d={path([points[a],points[b]])} stroke={bright?ink:i<26?dim:faint}/>)}{points.map(([a,b],i)=><circle key={i} cx={a} cy={b} r={i<11?.7:1.7} fill={bg} stroke={bright||i===15||i===16?ink:dim}/>)}{headphones&&<g transform={`translate(${head[0]} ${head[1]}) rotate(${tilt}) scale(${headsetScale})`}><Headphones x={0} y={-9}/></g>}</g>;}
export function Field({x,y,w=150,h=100,time=0,vertical=false,bright=false}:{x:number;y:number;w?:number;h?:number;time?:number;vertical?:boolean;bright?:boolean}){return <g stroke={dim}>{Array.from({length:13},(_,i)=><path key={i} d={path(Array.from({length:44},(_,j)=>{const u=j/43,v=i/12;const wave=Math.sin(u*7+v*3+time*Math.PI*2/LOOP_SECONDS)*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*14;return vertical?[x+u*w,y+v*h+wave]:[x+u*w+(v-.5)*32,y+v*h+wave];}))} stroke={bright||i===6?ink:dim}/>)}</g>;}
export function Pulse({points,time,offset=0}:{points:Point[];time:number;offset?:number}){const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let d=((time/LOOP_SECONDS+offset)%1)*lengths.reduce((a,b)=>a+b,0),idx=0;while(idx<lengths.length-1&&d>lengths[idx]){d-=lengths[idx];idx++;}const ratio=d/(lengths[idx]||1),a=points[idx],b=points[idx+1];return <g><path d={path(points)} stroke={ink} strokeOpacity={.65}/><circle cx={a[0]+(b[0]-a[0])*ratio} cy={a[1]+(b[1]-a[1])*ratio} r="2.5" fill={ink} stroke="none" opacity={Math.sin(((time/LOOP_SECONDS+offset)%1)*Math.PI)**2}/></g>;}
function Architecture({time,labels,spread}:{time:number;labels:boolean;spread:number}){
 const nodes=[[-380,0],[-210,-10],[-30,-25],[155,-30],[355,-45]];
 return <g>
 {labels&&<>
  <path d="M380 171v-9h410v9M830 171v-9h185v9" stroke={faint}/>
  <Label x={585} y={144} anchor="middle" title="Obrada u Pythonu"/>
  <Label x={922} y={144} anchor="middle" title="Preglednik"/>
  <Label x={922} y={86} anchor="middle" title="WebGL + GLSL / Tone.js"/>
  <Pulse points={[[559,423],[450,533],[250,533]]} time={time}/>
  <Label x={235} y={528} anchor="end" title="CSV / JSON"/>
 </>}
 {nodes.slice(0,-1).map(([x,y],i)=><Pulse key={i} points={[P(x+65,y+30,25),P(nodes[i+1][0]-65,nodes[i+1][1]+30,25)]} time={time} offset={i*.2}/>)}
 {nodes.map(([x,y],i)=><g key={i}><Plate x={x-63} y={y-42} w={126} h={84} z={20+i*7*spread} bright/>{i===0?<g transform={`translate(${P(x,y,25)})`}><rect x="-15" y="-70" width="30" height="60" rx="5" fill={bg} stroke={ink}/><rect x="-11" y="-64" width="22" height="47" rx="2" stroke={faint}/><circle cx="0" cy="-65" r="1.3" fill={ink}/><path d="M0 -10v21m-15 8L0 11l15 8" stroke={ink}/></g>:i===1?<Body x={P(x,y,25)[0]} y={P(x,y,25)[1]-3} scale={.33} time={time} bright/>:i===2?<g>{[0,1,2,3].map(j=>{const a=P(x-34+j*21,y,35);return <path key={j} d={`M${a[0]},${a[1]}v-${20+(Math.sin(time*Math.PI*2/LOOP_SECONDS+j)+1)*18}`} stroke={ink}/>;})}</g>:i===3?<g>{Array.from({length:6},(_,j)=>{const a=P(x-36+(j%3)*31,y-22+Math.floor(j/3)*30,50);return <circle key={j} cx={a[0]} cy={a[1]} r="6" stroke={ink} opacity={.35+.65*(1+Math.cos(time*Math.PI*2/LOOP_SECONDS-j*Math.PI*2/3))/2}/>;})}</g>:<g transform={`translate(${P(x,y,45)})`}><rect x="-55" y="-70" width="110" height="66" rx="4" fill={bg} stroke={ink}/><Field x={-47} y={-64} w={94} h={50} time={time} vertical bright/></g>}
 {labels&&<Label x={P(x,y,0)[0]} y={P(x,y,0)[1]+66} anchor="middle" title={['Kamera','M1 / Estimacija poze','M2 / Ekstrakcija\nznačajki pokreta','M3 / Klasifikacija\nemocije','M4 / Odabir\naudiovizualnog predloška'][i]}/>}</g>)}
 </g>;
}

function Feedback({time,labels,spread}:{time:number;labels:boolean;spread:number}){
 const rx=340+spread*25,ry=172;const orbit=Array.from({length:101},(_,i)=>{const a=i/100*Math.PI*2;return [600+Math.cos(a)*rx,365+Math.sin(a)*ry] as Point;});
 const phase=(time*Math.PI*2/LOOP_SECONDS)%(Math.PI*2);
 return <g transform="translate(600 365) scale(1.12) translate(-600 -365)"><ellipse cx="600" cy="365" rx={rx} ry={ry} stroke={dim}/><ellipse cx="600" cy="365" rx={rx-18} ry={ry-9} stroke={dim} strokeDasharray="2 9"/><path d={path(orbit.slice(8,38))} stroke={ink}/><circle cx={600+Math.cos(phase)*rx} cy={365+Math.sin(phase)*ry} r="3" fill={ink} stroke="none"/><Body x={600} y={505} scale={.88} time={time} bright/><ellipse cx="600" cy="511" rx="98" ry="22" stroke={dim}/>
 <g transform="translate(253 350)"><rect x="-22" y="-38" width="44" height="76" rx="7" fill={bg} stroke={ink}/><circle cy="-29" r="2" stroke={ink}/><path d="M-13 23h26" stroke={dim}/></g>
 <g transform="translate(600 190)"><rect x="-58" y="-28" width="116" height="56" rx="7" fill={bg} stroke={ink}/>{[0,1,2,3].map(i=><path key={i} d={`M${-34+i*23} 15v-${12+(Math.sin(time*Math.PI*2/LOOP_SECONDS+i)+1)*10}`} stroke={ink}/>)}</g>
 <g><rect x="877" y="317" width="145" height="90" rx="5" fill={bg} stroke={ink}/><Field x={889} y={328} w={119} h={63} time={time} vertical bright/></g>
 {labels&&<><Label scale={1.12} x={210} y={425} title="Praćenje" anchor="middle"/><Label scale={1.12} x={600} y={132} title="Interpretacija" anchor="middle"/><Label scale={1.12} x={969} y={454} title="Odgovor" anchor="middle"/><Label scale={1.12} x={600} y={591} title="Percepcija i prilagodba" anchor="middle"/></>}
 </g>;
}
function Headphones({x,y}:{x:number;y:number}){return <g transform={`translate(${x} ${y})`} stroke={ink}><path d="M-13 5V-5a13 13 0 0 1 26 0V5"/><rect x="-17" y="1" width="7" height="16" rx="3" fill={bg}/><rect x="10" y="1" width="7" height="16" rx="3" fill={bg}/></g>;}
function Installation({time,labels,spread}:{time:number;labels:boolean;spread:number}){
 const floor=[P(-270,-180),P(270,-180),P(270,180),P(-270,180)];
 const wall=[P(-270,-180),P(270,-180),P(270,-180,235),P(-270,-180,235)];
 const screen=[P(-200,-178,45),P(200,-178,45),P(200,-178,207),P(-200,-178,207)];
 const roomPoint=(p:Point):Point=>[180+p[0]*.7,105+p[1]*.7];
 const left=301,right=899; // Equal 28px gutters outside the room’s horizontal bounds.
 return <g transform="translate(600 370) scale(1.2) translate(-600 -340)"><g transform="translate(180 105) scale(.7)"><path d={path(wall,true)} fill={bg} stroke={faint}/><path d={path(floor,true)} fill={bg} stroke={dim}/><path d={path([P(-270,-180,235),P(-270,180,235),P(-270,180)])} stroke={faint}/><path d={path(screen,true)} fill={bg} stroke={ink}/>
 {Array.from({length:18},(_,i)=><path key={i} d={path(Array.from({length:60},(_,j)=>{const x=-195+j/59*390,z=53+i*8+Math.sin(j/59*8+i*.3+time*Math.PI*2/LOOP_SECONDS)*5;return P(x,-178,z);}))} stroke={i===9?ink:dim}/>)}
 <path d={path([P(0,15,240),screen[2]])} stroke={faint} strokeDasharray="3 7"/><path d={path([P(0,15,240),screen[3]])} stroke={faint} strokeDasharray="3 7"/>
 <Plate x={-28} y={-2} w={56} h={38} z={242} bright/><ellipse cx={P(0,-5,242)[0]} cy={P(0,-5,242)[1]} rx="8" ry="4" stroke={ink}/><path d={path([P(0,15,247),P(0,15,273)])} stroke={dim}/>
 <path d={path(Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return P(Math.cos(a)*(85+spread*25),65+Math.sin(a)*65,1);}))} stroke={faint} strokeDasharray="3 7"/>
 <Body x={P(0,65)[0]} y={P(0,65)[1]} scale={.59} time={time} headphones bright/>
 <g transform={`translate(${P(-235,-50)})`}><path d="M0 0v-78m-13 86L0 0l13 8" stroke={dim}/><rect x="-8" y="-106" width="16" height="30" rx="3" fill={bg} stroke={ink}/><circle cx="0" cy="-102" r="1.4" fill={ink}/></g>
 <Plate x={180} y={85} w={65} h={52} z={65}/><path d={path([P(185,89,65),P(185,89,0)])} stroke={faint}/><path d={path([P(240,132,65),P(240,132,0)])} stroke={faint}/><path d={path([P(190,90,66),P(235,90,66),P(235,90,94),P(190,90,94)],true)} fill={bg} stroke={dim}/>
 </g>
 {labels&&<>
 <path d={path([roomPoint(P(-28,0,242)),[left+12,220]])} stroke={dim}/><Label scale={1.2} x={left} y={225} title="Projektor" anchor="end"/>
 <path d={path([roomPoint(P(-235,-50,90)),[left+12,340]])} stroke={dim}/><Label scale={1.2} x={left} y={345} title="Kamera mobitela" anchor="end"/>
 <path d={path([roomPoint(P(0,65,75)),[left+12,460]])} stroke={dim}/><Label scale={1.2} x={left} y={465} title="Sudionik" anchor="end"/>
 <path d={path([roomPoint(screen[2]),[right-12,260]])} stroke={dim}/><Label scale={1.2} x={right} y={265} title="Projekcija"/>
 <path d={path([roomPoint(P(235,110,65)),[right-12,460]])} stroke={dim}/><Label scale={1.2} x={right} y={465} title="Prijenosno računalo"/>
 </>}
 </g>;
}
export function SystemGraphic({scene,time,labels=true,spread=.5}:{scene:SystemScene;time:number;labels?:boolean;spread?:number}){return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" fill="none" stroke={ink} strokeWidth=".85" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={`${systemScenes.find(s=>s.id===scene)?.name}, ${systemScenes.find(s=>s.id===scene)?.variants[0]}`}><title>{`${systemScenes.find(s=>s.id===scene)?.name}`}</title><rect width="1200" height="675" fill={bg} stroke="none"/>{scene==='architecture'?<Architecture {...{time,labels,spread}}/>:scene==='feedback'?<Feedback {...{time,labels,spread}}/>:<Installation {...{time,labels,spread}}/>}</svg>;}

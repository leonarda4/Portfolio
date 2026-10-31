import {body,eye} from './motions';
import {roster} from './assets';
import {agentBodyArt} from './agent-body-art';
import {AgentNametag} from './AgentNametag';
const expressions=['attentive','think','look','curious','focus','look','look','double'];
const profiles=[1,2,4,3,0,5,0,1];
export function WorkingAgent({index,x,y,size,time,energy=.35,lookAt,gesture}:{index:number;x:number;y:number;size:number;time:number;energy?:number;gesture?:'point';lookAt?:{x:number;y:number}}){
 const a=roster[index],b=body(a.name.toLowerCase(),time*.7,profiles[index],energy);
 const eyes=eye(expressions[index],time*.7,profiles[index],index===2||index===6?.55:1);
 if(gesture==='point'){
  const point=Math.pow(Math.max(0,Math.sin(time*2.6)),3);
  b.y+=18*point;b.sy+=.16*point;b.sx-=.08*point;b.rotation+=9*Math.sin(time*1.6);
 }
 if(index===2||index===6){const blink=eye('calm',time*.7,profiles[index],.25);eyes.forEach((e,i)=>{e.ry=10.9375*Math.min(1,blink[i].ry/10.9375)});}
 return <div data-showcase-agent={a.name} style={{position:'absolute',left:x-size/2+b.x*size/180,top:y-size/2+b.y*size/180,width:size,height:size,zIndex:5}}>
  <svg viewBox="0 0 180 180" style={{width:'100%',height:'100%',overflow:'visible'}}>
   <g transform={`rotate(${b.rotation} 90 90)`}><g fill={a.color} transform={`translate(90 90) scale(${b.sx} ${b.sy}) translate(-90 -90)`} dangerouslySetInnerHTML={{__html:agentBodyArt[index]}}/></g>
   <g fill="white" transform={lookAt?`translate(${Math.max(-8,Math.min(8,(lookAt.x-x)/45))} ${Math.max(-5,Math.min(5,(lookAt.y-y)/45))})`:undefined}>{eyes.map((e,j)=><ellipse key={j} {...e}/>)}</g>
  </svg>
  <AgentNametag index={index} size={size} rotation={b.rotation} fontSize={24}/>
 </div>;
}

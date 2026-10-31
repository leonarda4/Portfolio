/* Spatial motion only. Coordinates are normalized to the available stage area. */

  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
  const easings={
    silk:t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)},
    arrive:t=>1-Math.pow(1-clamp(t),3),
    accelerate:t=>Math.pow(clamp(t),3),
    linear:t=>clamp(t),
    spring:t=>{t=clamp(t);return t===0||t===1?t:1-Math.exp(-7*t)*Math.cos(10*t)+(Math.exp(-7)*Math.cos(10))*t}
  };
  const point=(x,y)=>({x,y,scale:1});
  const cubic=(a,b,c,d,t)=>point((1-t)**3*a[0]+3*(1-t)**2*t*b[0]+3*(1-t)*t*t*c[0]+t**3*d[0],(1-t)**3*a[1]+3*(1-t)**2*t*b[1]+3*(1-t)*t*t*c[1]+t**3*d[1]);
  const curve=(a,b,c,d)=>t=>cubic(a,b,c,d,t);
  const paths=[
    {id:'glide',name:'Side glide',group:'Arrive',note:'A direct approach to a card edge.',fn:curve([0,.6],[.25,.6],[.5,.6],[.82,.6])},
    {id:'rise',name:'Rise from below',group:'Arrive',note:'Lift into an empty-state companion slot.',fn:curve([.5,1],[.5,.85],[.5,.5],[.5,.3])},
    {id:'drop',name:'Soft descent',group:'Arrive',note:'Float down beside a new notification.',fn:curve([.55,0],[.55,.2],[.55,.45],[.55,.68])},
    {id:'arc',name:'High arc',group:'Arrive',note:'Clear a component with one generous arch.',fn:curve([.02,.8],[.18,-.15],[.7,-.15],[.85,.65])},
    {id:'swoop',name:'Low swoop',group:'Arrive',note:'Dip under content, then rise into place.',fn:curve([.04,.2],[.25,1.05],[.65,1.05],[.85,.45])},
    {id:'s-curve',name:'S-curve',group:'Travel',note:'Change lanes without a sharp corner.',fn:curve([.04,.75],[.9,.95],[.02,.05],[.86,.25])},
    {id:'diagonal',name:'Diagonal crossing',group:'Travel',note:'A clear transfer between distant panels.',fn:curve([.08,.85],[.32,.65],[.6,.36],[.85,.12])},
    {id:'wave',name:'Ribbon wave',group:'Travel',note:'A rolling flight for video transitions.',fn:t=>point(.05+.8*t,.5+.22*Math.sin(TAU*t))},
    {id:'detour',name:'Component detour',group:'Travel',note:'Route above a reading area, then dock.',fn:curve([.04,.7],[.02,-.3],[.94,-.3],[.86,.7])},
    {id:'loop',name:'Loop and land',group:'Travel',note:'A single flourish before a quiet arrival.',fn:t=>point(.1+.7*t+.18*Math.sin(TAU*t),.55-.28*Math.sin(Math.PI*t)**2)},
    {id:'orbit',name:'Elliptical orbit',group:'Float',note:'Circle a focal component at a steady pace.',closed:true,fn:t=>point(.5+.36*Math.cos(TAU*t),.5+.35*Math.sin(TAU*t))},
    {id:'eight',name:'Figure eight',group:'Float',note:'Weave through two areas in a video scene.',closed:true,fn:t=>point(.5+.38*Math.sin(TAU*t),.5+.3*Math.sin(2*TAU*t))},
    {id:'hover',name:'Hover pocket',group:'Float',note:'A small, repeatable drift beside a task.',closed:true,fn:t=>point(.5+.055*Math.sin(TAU*t),.5+.08*Math.sin(2*TAU*t))},
    {id:'spiral',name:'Spiral inward',group:'Settle',note:'Tighten the orbit until the destination holds.',fn:t=>point(.5+.42*(1-t)**2*Math.cos(2*TAU*t),.5+.42*(1-t)**2*Math.sin(2*TAU*t))},
    {id:'brake',name:'Overshoot and return',group:'Settle',note:'Pass the anchor gently; return without a bounce.',fn:t=>point(.08+.74*easings.spring(t),.55)},
    {id:'pendulum',name:'Pendulum settle',group:'Settle',note:'Let lateral sway decay into a stable anchor.',fn:t=>point(.5+.38*Math.cos(2*TAU*t)*(1-t)**2,.15+.5*t)},
    {id:'retreat',name:'Retreat into depth',group:'Depart',note:'Recede from a finished task for a video cut.',fn:t=>({...point(.2+.6*t,.65-.4*t),scale:1-.45*t})},
    {id:'exit',name:'Lift and exit',group:'Depart',note:'Leave toward the top-right after a handoff.',fn:curve([.2,.75],[.8,.8],[.82,.25],[1.3,-.5])}
  ];
  function sample(id,time,{duration=4,easing='silk',drift=0,reduced=false}={}){
    const path=paths.find(p=>p.id===id)||paths[0];
    if(reduced)return {...(path.group==='Depart'?point(.82,.6):path.fn(1)),scale:1};
    const t=clamp(time/duration),p=path.fn((easings[easing]||easings.silk)(t));
    if(!reduced&&time>duration&&drift){const s=time-duration,fade=easings.silk(s/1.5);p.x+=.009*drift*fade*Math.sin(s*1.1);p.y+=.016*drift*fade*Math.sin(s*1.6);}
    return p;
  }
  const scenes=[
    {id:'assemble',name:'Fly in. Find a task.',note:'Eight entrances from different edges. Each agent finds a task, decelerates, then rests beside its component.',use:'UI · onboarding / task assignment',beats:['Launch','Find a task','Dock','Quiet hold']},
    {id:'orbit',name:'Around the workspace',note:'The whole family follows an ellipse around the focal panel, then peels off into individual anchors.',use:'Video · team introduction',beats:['Join orbit','Circle together','Peel away','Settle']},
    {id:'relay',name:'Pass the work along',note:'A staggered sequence carries attention from capture to structure to delivery. Each agent travels once.',use:'UI / video · workflow handoff',beats:['Memo starts','Team follows','Deliver','Hold the result']},
    {id:'weave',name:'Crossing currents',note:'Two streams travel on opposing curves, separated into lanes, before resolving into a calm formation.',use:'Video · transition / ensemble',beats:['Split lanes','Cross','Resolve','Formation']},
    {id:'spotlight',name:'Make room for one',note:'Brainy moves to the foreground while the other seven drift around the perimeter. Everyone returns to a shared formation.',use:'Video · introduce a capability',beats:['Gather','Brainy forward','Supporting orbit','Rejoin']},
    {id:'depart',name:'Wrap up and fly out',note:'Start at task anchors, linger for the result, then leave in a staggered fan of curved flights.',use:'UI / video · completion / outro',beats:['At work','Result ready','Lift away','Clear stage']}
  ];
  const anchor=i=>point(.13+(i%4)*.245,.31+Math.floor(i/4)*.43);
  function scene(id,i,time,reduced=false){
    const end=anchor(i),t=clamp(time/16)*16;
    if(reduced)return {...end,scale:1};
    let p=end;
    if(id==='assemble'){
      const u=easings.silk((t-i*.22)/4.5),left=i%2===0;
      p=cubic([left?-.18:1.18,i<4?-.2:1.15],[left?-.05:1.05,.1],[end.x,.05+Math.floor(i/4)*.5],[end.x,end.y],u);
    }else if(id==='orbit'){
      const a=i/8*TAU+Math.min(t,10)*.42,orb=point(.5+.39*Math.cos(a),.52+.36*Math.sin(a));
      const u=easings.silk((t-10)/4);p=point(mix(orb.x,end.x,u),mix(orb.y,end.y,u));
    }else if(id==='relay'){
      const u=easings.silk((t-i*.85)/4);p=cubic([-.18,.7],[.25,.1],[end.x,.05],[end.x,end.y],u);
    }else if(id==='weave'){
      const u=easings.silk((t-i*.14)/8),left=i%2===0;
      p=cubic([left?-.2:1.2,.15+(i%4)*.21],[left?.8:.2,.08],[left?.2:.8,.92],[end.x,end.y],u);
    }else if(id==='spotlight'){
      const enter=easings.silk(t/4),leave=easings.silk((t-10)/4),u=enter*(1-leave),a=i/8*TAU+t*.12;
      const target=i===1?point(.49,.53):point(.5+.43*Math.cos(a),.52+.4*Math.sin(a));
      p=point(mix(end.x,target.x,u),mix(end.y,target.y,u));p.scale=i===1?1+1.05*u:1-.18*u;
    }else if(id==='depart'){
      const u=easings.silk((t-4-i*.5)/5);p=cubic([end.x,end.y],[end.x,end.y-.25],[end.x+(i%2? .3:-.3),-.2],[i%2?1.2:-.2,-.4],u);
    }
    return p;
  }
  const api={version:'1.0.0',paths,scenes,easings,sample,scene,anchor};
export default api;

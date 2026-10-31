// Adapted from brainy-hq/brand graphics, topics and workbench-renderer.
import DATA from './graphics-data.json' with { type: 'json' }
import BrainyFlights from './graphic-flights.js'
/* Seeded geometry: the same recipe always reproduces the same editable SVG. */
const PATTERN={id:'agent-pattern',title:'A rhythm of bodies',meaning:'A repeated agent silhouette suggests a community, a shared system, or many ideas working together.',keywords:['community','team','agents','network','pattern','people'],references:[]};
function randomFrom(seed){let n=hash(seed);return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function shapeMarkup(s,fill){return `<${s.tag} ${Object.entries(s.attrs).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}${fill?` fill="${fill}"`:''}/>`;}
function render(m,p,v=0,seed='gallery',thickness=1,agent='auto'){
 const random=randomFrom(`${seed}:${m.id}:${v}`),between=(a,b)=>a+(b-a)*random();
 let elements='';
 if(m.id==='agent-pattern'){
  const body=DATA.agents.find(a=>a.shape===agent)||DATA.agents[Math.floor(random()*DATA.agents.length)];
  const cols=4+v,step=800/cols,rows=Math.ceil(450/step)+1,angle=between(-24,24),scale=step/180*between(.67,.92),accentRow=Math.floor(random()*Math.max(1,rows-2)),accentCol=1+Math.floor(random()*(cols-1));
  for(let row=0;row<rows;row++)for(let col=0;col<cols+1;col++){
   const x=col*step+(row%2?step*.5:0),y=row*step+step*.45;
   elements+=`<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(angle+(row%2?-1:1)*between(0,12)).toFixed(2)}) scale(${scale.toFixed(4)}) translate(-90 -90)" fill="${row===accentRow&&col===accentCol?p.accent:p.ink}">${DATA.shapes[body.shape].map(s=>shapeMarkup(s)).join('')}</g>`;
  }
 }else{
  const weight=thickness*between(.75,1.3),width=between(.86,1.13);
  elements=m.variants[v].map(s=>{
   const attrs={...s.attrs};
   if(s.tag==='ellipse'){
    // Keep the upper contour of tall hills anchored inside the canvas.
    attrs.rx=Number(attrs.rx)*width*between(.91,1.09);
    const old=Number(attrs.ry);attrs.ry=old*weight*between(.92,1.08);
    if(old>200)attrs.cy=Number(attrs.cy)+attrs.ry-old;
   }else if(s.tag==='rect'){
    const key=Number(attrs.width)>Number(attrs.height)?'height':'width';
    const position=key==='height'?'y':'x',old=Number(attrs[key]);
    attrs[key]=old*weight*between(.8,1.2);attrs[position]=Number(attrs[position])+(old-attrs[key])/2;
    attrs.rx=Math.min(Number(attrs.width),Number(attrs.height))/2;
   }else if(s.tag==='circle')attrs.r=Number(attrs.r)*between(.8,1.25);
   return shapeMarkup({...s,attrs},p[s.role]);
  }).join('');
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450"><rect width="800" height="450" fill="${p.background}"/>${elements}</svg>`;
}
/* Topic vocabulary and original, editable compositions. No model call is needed to browse. */
function topicShapes(id,v){
 const out=[],add=(tag,attrs,role='ink')=>out.push({tag,attrs,role});
 const dot=(x,y,r=22,role='accent')=>add('circle',{cx:x,cy:y,r},role);
 const oval=(x,y,rx,ry,role='ink')=>add('ellipse',{cx:x,cy:y,rx,ry},role);
 const pill=(x,y,w,h,role='ink')=>add('rect',{x,y,width:w,height:h,rx:Math.min(w,h)/2},role);
 const ring=(x,y,r,w,role='ink')=>{add('path',{d:`M ${x-r} ${y} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0 M ${x-r+w} ${y} a ${r-w} ${r-w} 0 1 1 ${(r-w)*2} 0 a ${r-w} ${r-w} 0 1 1 ${-(r-w)*2} 0`,'fill-rule':'evenodd'},role);out[out.length-1].ring={x,y,r,w};};
 const shift=v*18;
 switch(id){
 case 'personal-assistants':oval(330,265,140,185);oval(535+shift,240,64,90,'accent');dot(570,105,14,'ink');break;
 case 'agent-workflows':for(let i=0;i<5;i++){pill(-35+i*180,90+(i%3)*80,140,65);if(i<4)dot(130+i*180,122.5+(i%3)*80,14);}break;
 case 'cybersecurity':ring(400,225,185,44+shift/3);ring(400,225,112,27);dot(400,225,40);break;
 case 'blockchain':for(let i=0;i<4;i++)ring(400+(i-1.5)*175,225+(i%2?shift:-shift),100,36,i===v?'accent':'ink');break;
 case 'healthcare':oval(285-shift,225,115,175);oval(515+shift,225,115,175);dot(400,225,36);break;
 case 'smart-cities':for(let y=0;y<3;y++)for(let x=0;x<6;x++)pill(x*145-25,y*150+15,100,105,(x===v+2&&y===1)?'accent':'ink');break;
 case 'immersive':for(let i=0;i<4;i++)ring(370+i*(20+v*4),225,200-i*43,18,i===3?'accent':'ink');break;
 case 'education':for(let i=0;i<5;i++)pill(60+i*142,370-i*52,105,190+i*52);dot(680,110,21);break;
 case 'private-ai':for(let i=0;i<3;i++){ring(140+i*260,225+(i===1?-shift:shift),105,30);dot(140+i*260,225+(i===1?-shift:shift),23,i===1?'accent':'ink');}break;
 case 'robot-arm':
  return topicShapes('robotics',v).map(item=>{
   const attrs={...item.attrs};
   if(item.tag==='rect')attrs.y=450-attrs.y-attrs.height;
   if(item.tag==='circle')attrs.cy=450-attrs.cy;
   if(item.ring){const {x,y,r,w}=item.ring,cy=450-y,inner=r-w;attrs.d=`M ${x-r} ${cy} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0 M ${x-inner} ${cy} a ${inner} ${inner} 0 1 1 ${inner*2} 0 a ${inner} ${inner} 0 1 1 ${-inner*2} 0`;return {...item,attrs,ring:{...item.ring,y:cy}};}
   return {...item,attrs};
  });
 case 'robot-scan':ring(250,225,130,26);pill(435,130,190,28);pill(435,211,245,28,'accent');pill(435,292,150,28);break;
 case 'robot-grip':{
  const d='M159 85H341Q365 85 365 109Q365 133 341 133H183V317H341Q365 317 365 341Q365 365 341 365H159Q135 365 135 341V109Q135 85 159 85Z';
  add('path',{d});out[out.length-1].anchor=[250,225];
  add('path',{d,transform:'translate(800 0) scale(-1 1)'});out[out.length-1].anchor=[550,225];
  dot(400,225,70);break;
 }
 case 'robotics':pill(110,250,220,70);pill(300,130,75,190);pill(335,110,230,75);ring(335,285,60,20,'accent');dot(580,145,37);break;
 case 'wellness':for(let i=0;i<4;i++)oval(400,470-i*93,350-i*66,92-i*10);dot(400+shift,95,19);break;
 case 'digital-trust':for(let i=0;i<8;i++)pill(i*108-20,65+(i%2)*45,55,340-(i%2)*90);dot(360+v*108,225,32);break;
 case 'edge-ai':for(let y=0;y<2;y++)for(let x=0;x<4;x++){ring(100+x*200,115+y*225,80,23);dot(100+x*200,115+y*225,23,(x===v&&y===0)?'accent':'ink');}break;
 }
 return out;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.codePointAt(0),16777619)>>>0;return n;}
const DEFAULTS={scale:1,aspect:1,weight:1,spacing:1,rotation:0,x:0,y:0,accent:1,chaos:0,density:5,dialogueHeight:'left',layout:'stagger',body:'brainy-six',seed:'initial'};
const ACCEPTED=['personal-assistants','agent-workflows','cybersecurity','blockchain','healthcare','smart-cities','immersive','education','private-ai','robotics','wellness','digital-trust','edge-ai'];
const CONCEPTS={ 'personal-assistants':'Companion · support · proximity','agent-workflows':'Sequence · exchange · coordination',cybersecurity:'Protection · core · boundaries',blockchain:'Links · continuity · shared systems',healthcare:'Care · balance · holding','smart-cities':'Modules · networks · collective space',immersive:'Depth · portals · perspective',education:'Steps · momentum · progression','private-ai':'Boundaries · independence · trust',robotics:'Movement · joints · coordination',wellness:'Breathing · space · calm','digital-trust':'Signal · contrast · attention','edge-ai':'Cells · autonomy · distributed thought'};
const ORIGINAL_LABELS=['Memory','Dialogue','Aspiration','Possibilities','Discovery','Breakthrough','Belonging','Momentum','Clarity','Exchange','Rhythm','Activity','Threads','Contribution','Collection'];
const AGENT_CONCEPTS={Memo:'Listening · conversation · memory',Brainy:'Organization · ideas · structure',Scout:'Research · discovery · exploration',Prism:'Analysis · perspectives · comparison',Archie:'Systems · architecture · building',Jayson:'Context · knowledge · continuity',Finn:'Decisions · conclusions · direction',Storm:'Focus · attention · priorities'};
function recipes(){return [
 ...DATA.originals.map((r,i)=>({...r,id:'original-'+(i+1),type:'original',label:ORIGINAL_LABELS[i],concept:DATA.concepts[i]})),
 ...DATA.topics.filter(t=>ACCEPTED.includes(t.id)).flatMap(t=>{
  const base={id:t.id,type:'generated',label:CONCEPTS[t.id].split(' · ')[0],concept:CONCEPTS[t.id],palette:DATA.catalog.pairs[t.pair_index],shapes:topicShapes(t.id,0),width:800,height:450};
  return t.id==='personal-assistants'?[base,...companionVariations(base)]:t.id==='robotics'?[base,...robotVariations(base)]:[base];
 }),
 ...DATA.agents.map((a,i)=>({id:'body-'+a.shape,type:'pattern',body:a.shape,label:AGENT_CONCEPTS[a.name].split(' · ')[0],concept:a.name+' · '+AGENT_CONCEPTS[a.name],palette:DATA.catalog.pairs[(i*3)%DATA.catalog.pairs.length]}))
];}
function robotVariations(base){
 return [
  ['robot-arm','Prosthetics','Articulation · reach · precision',13],
  ['robot-scan','Scanner','Sensing · signals · detection',10],
  ['robot-grip','Gripper','Holding · alignment · control',2]
 ].map(([id,label,concept,palette])=>({...base,id,label,concept:label+' · '+concept,palette:DATA.catalog.pairs[palette],shapes:topicShapes(id,0)}));
}
// Companion's oval-and-dot vocabulary, with distinct arrangements and palettes.
function companionVariations(base){
 const arrangements=[
  {name:'Together',palette:6,meaning:'Partnership · balance · closeness',positions:[[490,265],[265,320],[265,185]]},
  {name:'Guidance',palette:9,meaning:'Direction · encouragement · growth',positions:[[300,355],[520,230],[555,105]]},
  {name:'Shelter',palette:1,meaning:'Care · protection · belonging',positions:[[375,265],[455,305],[575,105]]}
 ];
 return arrangements.map(({name,meaning,positions,palette})=>({...base,palette:DATA.catalog.pairs[palette],id:'companion-'+name.toLowerCase(),label:name,concept:name+' · '+meaning,
  shapes:[...(name==='Shelter'?[
   {tag:'ellipse',role:'ink',attrs:{cx:230,cy:300,rx:75,ry:120}},
   {tag:'ellipse',role:'ink',attrs:{cx:550,cy:285,rx:90,ry:145}}
  ]:[]),...base.shapes.map((shape,i)=>{
   const attrs={...shape.attrs,cx:positions[i][0],cy:positions[i][1]};
   if(name==='Guidance'&&shape.tag==='ellipse')[attrs.rx,attrs.ry]=[attrs.ry,attrs.rx];
   const role=name==='Together'?(shape.tag==='circle'?'accent':'ink'):name==='Shelter'&&shape.tag==='circle'?'accent':shape.role;
   return {...shape,role,attrs};
  }).concat(name==='Together'?[{tag:'circle',role:'accent',attrs:{cx:positions[0][0],cy:positions[2][1],r:base.shapes[2].attrs.r}}]:[])]
 }));
}
function center(s){if(s.anchor)return s.anchor;if(s.ring)return [s.ring.x,s.ring.y];const a=s.attrs;let x=+(a.cx??(+a.x||0)+(+a.width||0)/2),y=+(a.cy??(+a.y||0)+(+a.height||0)/2);const t=a.transform||'';let m=t.match(/matrix\(([^)]+)\)/);if(m){const [aa,b,c,d,e,f]=m[1].split(/[ ,]+/).map(Number);return [aa*x+c*y+e,b*x+d*y+f];}m=t.match(/rotate\(([^)]+)\)/);if(m){const [angle,ox=0,oy=0]=m[1].split(/[ ,]+/).map(Number),r=angle*Math.PI/180;return [ox+(x-ox)*Math.cos(r)-(y-oy)*Math.sin(r),oy+(x-ox)*Math.sin(r)+(y-oy)*Math.cos(r)];}return [x,y];}
// Shorten a neighboring line instead of pushing its accent out of the frame.
function separateAccentLines(items,gap){
 const lines=items.filter(i=>i.tag==='rect'&&!i.attrs.transform&&+i.attrs.width>+i.attrs.height);
 for(const accent of lines.filter(i=>i.role==='accent')){
  const ax=+accent.attrs.x+accent.dx,ay=+accent.attrs.y+accent.dy,aw=+accent.attrs.width,ah=+accent.attrs.height;
  for(const line of lines.filter(i=>i.role==='ink')){
   const a=line.attrs,lx=+a.x+line.dx,ly=+a.y+line.dy,lw=+a.width,lh=+a.height;
   if(ly+lh<=ay||ly>=ay+ah)continue;
   if(lx+lw+gap<=ax||lx>=ax+aw+gap)continue;
   if(lx+lw/2<ax+aw/2)a.width=Math.max(0,ax-gap-lx);
   else{const start=ax+aw+gap;a.x=start-line.dx;a.width=Math.max(0,lx+lw-start);}
   a.rx=Math.min(+a.rx||0,+a.width/2,lh/2);
  }
 }
 return items;
}
// Classify the visible ellipse, including the source SVG's rotations/matrices.
function horizontalOval(item){
 if(item.tag!=='ellipse')return false;
 const a=item.attrs,t=a.transform||'',matrix=t.match(/matrix\(([^)]+)\)/),rotation=t.match(/rotate\(([^)]+)\)/);
 let xx=1,xy=0,yx=0,yy=1;
 if(matrix)[xx,yx,xy,yy]=matrix[1].split(/[ ,]+/).map(Number);
 else if(rotation){const angle=parseFloat(rotation[1])*Math.PI/180;xx=yy=Math.cos(angle);yx=Math.sin(angle);xy=-yx;}
 return Math.hypot(xx*+a.rx,xy*+a.ry)>Math.hypot(yx*+a.rx,yy*+a.ry);
}
// Reuse agent route geometry AND easing; bake samples into portable SVG keyframes.
const DOT_ROUTES=[['glide','arrive'],['arc','silk'],['drop','arrive'],['swoop','silk'],['brake','linear'],['pendulum','silk'],['rise','spring'],['loop','arrive'],['diagonal','silk'],['s-curve','arrive']];
function dotFlight(recipe,item,index){
 if(recipe.id==='original-5'){
  const name=`dot-${recipe.id}-${index}`,radius=recipe.height*1.25;
  const frames=Array.from({length:121},(_,i)=>{
   const t=i/120,travel=Math.min(1,t/.78),p=BrainyFlights.sample('spiral',travel,{duration:1,easing:'linear'});
   const settle=Math.max(0,(t-.78)/.22),bounce=Math.sin(settle*Math.PI*2)*(1-settle);
   const x=(p.x-.5)*radius,y=t===1?0:(p.y-.5)*radius-Math.sin(settle*Math.PI)*recipe.height*.018;
   const scale=.65+.35*BrainyFlights.easings.arrive(travel)+.14*bounce;
   return `${(t*100).toFixed(2)}%{transform:translate(${x.toFixed(3)}px,${y.toFixed(3)}px) scale(${scale.toFixed(4)});opacity:${Math.min(1,t*15).toFixed(3)}}`;
  }).join('');
  return {name,route:'spiral',easing:'linear',frames,duration:2.4,delay:.35};
 }

 const identity=recipe.id.startsWith('original-')?Number(recipe.id.slice(9))-1:hash(recipe.id);
 const variation=identity+index, [route,easing]=DOT_ROUTES[variation%DOT_ROUTES.length];
 const w=recipe.width,h=recipe.height,end=BrainyFlights.sample(route,1,{duration:1,easing});
 const name=`dot-${recipe.id}-${index}`,mirror=variation%2?-1:1;
 const frames=Array.from({length:81},(_,i)=>{
  const t=i/80,p=BrainyFlights.sample(route,t,{duration:1,easing});
  const progress=BrainyFlights.easings.arrive(t);
  const scale=1-(.25+(variation%3)*.12)*(1-progress)+(.12+(variation%4)*.035)*Math.sin(Math.PI*t);
  return `${(t*100).toFixed(2)}%{transform:translate(${((p.x-end.x)*w*1.65*mirror).toFixed(3)}px,${((p.y-end.y)*h*1.65).toFixed(3)}px) scale(${scale.toFixed(4)});opacity:${Math.min(1,t*12).toFixed(3)}}`;
 }).join('');
 return {name,route,easing,frames,duration:1.2+(variation%5)*.17,delay:.25+(index%4)*.13};
}
// Exchange vertical profiles without moving either speaker horizontally.
function dialogueShapes(recipe,variant){
 if(recipe.id!=='original-2'||!['right','equal'].includes(variant))return recipe.shapes;
 const left=recipe.shapes.filter(i=>i.tag==='ellipse'&&+i.attrs.cx<recipe.width/2);
 const right=recipe.shapes.filter(i=>i.tag==='ellipse'&&+i.attrs.cx>=recipe.width/2);
 const dots=recipe.shapes.filter(i=>i.tag==='circle');
 return recipe.shapes.map(item=>{
  const a={...item.attrs};
  const partner=item.tag==='ellipse'?(left.includes(item)?right[left.indexOf(item)]:left[right.indexOf(item)]):dots.find(dot=>dot!==item);
  if(partner)for(const key of item.tag==='ellipse'?['cy','ry']:['cy'])a[key]=variant==='right'?partner.attrs[key]:(+a[key]+ +partner.attrs[key])/2;
  return {...item,attrs:a};
 });
}
function drawRecipe(recipe,settings={},colors=recipe.palette,motion=false){
 const s={...DEFAULTS,...settings},rand=randomFrom(s.seed),j=()=> (rand()-.5)*s.chaos,shape=(item,fill)=>shapeMarkup(item,fill);
 let art='',motionIndex=0,dotIndex=0;const flightStyles=[];
 const enter=(markup,kind,delay,extra='')=>motion?`<g class="recipe-motion rm-${kind}" style="--delay:${delay.toFixed(3)}s;${extra}">${markup}</g>`:markup;
 if(recipe.type==='pattern'){
  const tiles=[];
  const body=DATA.shapes[s.body||recipe.body],step=800/s.density*s.spacing,rows=Math.ceil(450/step)+2,cols=Math.ceil(800/step)+2;
  for(let row=-1;row<rows;row++)for(let col=-1;col<cols;col++){
   let x=col*step+step/2,y=row*step+step/2;
   if(s.layout==='stagger')x+=(row%2)*step/2;
   if(s.layout==='diagonal')x+=row*step*.3;
   if(s.layout==='wave')y+=Math.sin(col*.9)*step*.35;
   x+=j()*step*.6;y+=j()*step*.6;
   const size=step/180*.68*s.weight*(1+j()*.3),angle=j()*80+(s.layout==='diagonal'?25:0);
   tiles.push({x,y,size,angle,delay:(row+1)*.16+(row%2===0?col+1:cols-col)*.035});
  }
  // Pick the most central tile, then keep its full silhouette and pop overshoot in frame.
  const accent=tiles.reduce((best,t)=>(t.x-400)**2+(t.y-225)**2<(best.x-400)**2+(best.y-225)**2?t:best);
  const radius=94*Math.abs(accent.size)*1.12;
  const minX=400+(8-400-s.x)/(s.scale*s.aspect)+radius;
  const maxX=400+(792-400-s.x)/(s.scale*s.aspect)-radius;
  const minY=225+(8-225-s.y)/s.scale+radius,maxY=225+(442-225-s.y)/s.scale-radius;
  accent.x=Math.max(minX,Math.min(maxX,accent.x));accent.y=Math.max(minY,Math.min(maxY,accent.y));
  for(const tile of [...tiles.filter(t=>t!==accent),accent]){
   const {x,y,size,angle,delay}=tile,isAccent=tile===accent;
   art+=enter(`<g ${isAccent?'data-pattern-accent="true" ':''}fill="${isAccent?colors.accent:colors.ink}" transform="translate(${x} ${y}) rotate(${angle}) scale(${size} ${size}) translate(-90 -90)">${body.map(b=>shape(b)).join('')}</g>`,isAccent?'pop':'tile',delay);
  }
 }else{
  const w=recipe.width,h=recipe.height;
  const items=dialogueShapes(recipe,s.dialogueHeight).map(item=>{
   const a={...item.attrs},[cx,cy]=center(item),isAccent=item.role==='accent';
   const weight=(isAccent?s.accent:s.weight)*(1+j()*.35);
   if(item.ring){const {x,y,r,w}=item.ring,inner=Math.max(1,r-w*weight);a.d=`M ${x-r} ${y} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0 M ${x-inner} ${y} a ${inner} ${inner} 0 1 1 ${inner*2} 0 a ${inner} ${inner} 0 1 1 ${-inner*2} 0`;}

   if(item.tag==='ellipse'){a.ry=+a.ry*weight;a.rx=+a.rx*(1+j()*.25);}
   if(item.tag==='circle')a.r=+a.r*weight;
   if(item.tag==='rect'){const key=+a.width>+a.height?'height':'width',pos=key==='height'?'y':'x',old=+a[key];a[key]=old*weight;a[pos]=(+a[pos]||0)+(old-a[key])/2;if(a.rx&&weight!==1)a.rx=Math.min(+a.width,+a.height)/2;}
   const dx=(cx-w/2)*(s.spacing-1)+j()*w*.12,dy=(cy-h/2)*(s.spacing-1)+j()*h*.12;
   // Dialogue has discrete height presets: equal, or a clearly shorter speaker.
   // Lower the pair together; move the shorter speaker and its dot as one unit.
   const dialogueOffset=recipe.id==='original-2'?60+(
    s.dialogueHeight!=='equal'&&((s.dialogueHeight==='right')===(cx<w/2))?40:0
   ):0;
   return {...item,attrs:a,dx,dy:dy+dialogueOffset};
  });
  // The aspiration dot stays in front when spacing brings the hills into it.
  if(recipe.id==='original-3')items.sort((a,b)=>Number(a.role==='accent')-Number(b.role==='accent'));
  const ovalIndices=items.flatMap((item,i)=>horizontalOval(item)?[i]:[]);
  const groupOvals=motion&&ovalIndices.length>1&&ovalIndices.every((i,n)=>i===ovalIndices[0]+n)&&['original-1','original-8','original-15','wellness'].includes(recipe.id);
  const side=hash(recipe.id)%2?1:-1;
  const pairedBlobs=recipe.id.startsWith('companion-')||['original-2','original-10','personal-assistants','healthcare'].includes(recipe.id);
  const gap=12/(800/w*s.scale*s.aspect);
  const renderedParts=separateAccentLines(items,gap).map((item,index)=>{
   let markup=shape(item,colors[item.role]);
   if(motion){
    const a=item.attrs,delay=index*.1;
    if(recipe.id==='wellness'){
     if(item.tag==='circle')markup=enter(markup,'breath-dot',.08,`--rise:${h*1.6}px;`);
    }else if(recipe.id==='robot-grip'){
     markup=item.tag==='circle'?enter(markup,'pop',.65):enter(markup,'side',.1,`--side:${center(item)[0]<400?-800:800}px;`);
    }else if(item.tag==='rect'||item.ring){
     const id=`reveal-${recipe.id}-${motionIndex++}`;
     let path,stroke,transform='';
     if(item.ring){const {x,y,r}=item.ring,inner=Math.max(1,r-item.ring.w*(item.role==='accent'?s.accent:s.weight)),radius=(r+inner)/2;path=`M ${x} ${y-radius} a ${radius} ${radius} 0 1 1 -.001 0`;stroke=r-inner+2;}
     else{const x=+a.x||0,y=+a.y||0,w=+a.width,h=+a.height,horizontal=w>=h;stroke=Math.min(w,h);const radius=stroke/2;path=horizontal?`M ${x+radius} ${y+h/2} h ${Math.max(.001,w-stroke)}`:`M ${x+w/2} ${y+h-radius} v ${-Math.max(.001,h-stroke)}`;transform=a.transform?` transform="${a.transform}"`:'';}
     markup=`<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="${-w*4}" y="${-h*4}" width="${w*9}" height="${h*9}" style="mask-type:luminance"><path class="recipe-motion rm-draw" style="--delay:${delay}s" d="${path}"${transform} fill="none" stroke="white" stroke-width="${stroke}" stroke-linecap="round" pathLength="1"/></mask></defs><g mask="url(#${id})">${markup}</g>`;
     if(recipe.id==='robot-scan'&&item.tag==='rect')markup=enter(markup,'side',delay,`--side:160px;`);

    }else if(item.tag==='circle'&&['original-1','original-10'].includes(recipe.id)){
     markup=enter(markup,'pop',.55);
    }else if(item.tag==='circle'&&(item.role==='accent'||recipe.id.startsWith('companion-'))){
     const flight=dotFlight(recipe,item,dotIndex++);flightStyles.push(`@keyframes ${flight.name}{${flight.frames}}`);
     markup=`<g class="recipe-motion rm-agent-dot" data-route="${flight.route}" data-easing="${flight.easing}" style="animation-name:${flight.name};animation-duration:${flight.duration}s;animation-timing-function:linear;--delay:${flight.delay}s;transform-box:fill-box;transform-origin:center">${markup}</g>`;
    }else if(pairedBlobs&&item.tag==='ellipse'){
     const direction=center(item)[0]+item.dx<w/2?-1:1;
     markup=enter(markup,'side',.1,`--side:${direction*w*1.8}px;`);
    }else if(horizontalOval(item)){
     if(!groupOvals)markup=enter(markup,'side',delay,`--side:${side*w*1.8}px;`);
    }else markup=enter(markup,'rise',delay,`--rise:${h*1.6}px;`);
   }
   let rendered=`<g transform="translate(${item.dx} ${item.dy})">${markup}</g>`;
   if(groupOvals&&index===ovalIndices[0])rendered=`<g class="recipe-motion rm-${recipe.id==='original-1'?'rise-squish':recipe.id==='original-8'?'side':recipe.id==='wellness'?'breathe':'squish'}" style="--side:${side*w*1.8}px;--rise:${h*1.6}px;--delay:0s">`+rendered;
   if(groupOvals&&index===ovalIndices.at(-1))rendered+='</g>';
   return rendered;
  });
  art=renderedParts.join('');
  if(recipe.id==='robot-arm')art=`<g transform="translate(0 -30)">${art}</g>`;
  art=`<g transform="scale(${800/w} ${450/h})">${art}</g>`;
 }
 const transform=`translate(${400+s.x} ${225+s.y}) rotate(${s.rotation}) scale(${s.scale*s.aspect} ${s.scale}) translate(-400 -225)`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">${motion?RECIPE_MOTION_STYLE+(flightStyles.length?`<style>${flightStyles.join('')}</style>`:''):''}<rect width="800" height="450" fill="${colors.background}"/><g transform="${transform}">${art}</g></svg>`;
}

// Locks constrain randomization only; direct edits and Reset remain available.
function applyRandomization(current,proposed,locks){
 const settings={...proposed.settings},colors={...proposed.colors};
 for(const key of Object.keys(settings))if(locks.has(key))settings[key]=current.settings[key];
 for(const key of ['background','ink','accent'])if(locks.has('colors')||locks.has('color-'+key))colors[key]=current.colors[key];
 let paletteId=['background','ink','accent'].every(k=>colors[k]===proposed.colors[k])?proposed.paletteId:
  ['background','ink','accent'].every(k=>colors[k]===current.colors[k])?current.paletteId:'custom';
 const selected=locks.has('recipe')?current.selected:proposed.selected;
 if(paletteId==='source'&&['background','ink','accent'].some(k=>colors[k]!==selected.palette[k]))paletteId='custom';
 return {selected,settings,colors,paletteId};
}

// Permanent workbench constraints, independent of the optional randomization locks.
const FIXED_SETTINGS=Object.freeze({aspect:1,weight:1,rotation:0,x:0,y:0,accent:1,chaos:0});
function constrainWorkbench(settings){
 const clamp=value=>Number.isFinite(value)?Math.min(1.2,Math.max(.9,value)):1;
 return {...settings,...FIXED_SETTINGS,scale:clamp(settings.scale),spacing:clamp(settings.spacing)};
}

// Animation lives inside the SVG so exported artwork plays without JavaScript.
const RECIPE_MOTION_STYLE=`<style>
.recipe-motion{animation-duration:1.15s;animation-delay:var(--delay,0s);animation-fill-mode:both;animation-timing-function:cubic-bezier(.22,1,.36,1)}
.rm-breathe,.rm-breath-dot{animation-duration:4.6s;animation-timing-function:cubic-bezier(.37,0,.63,1)}.rm-breathe{animation-name:recipe-breathe;transform-box:fill-box;transform-origin:center bottom}.rm-breath-dot{animation-name:recipe-breath-dot}
.rm-rise{animation-name:recipe-rise}.rm-side{animation-name:recipe-side;animation-duration:1.3s}.rm-squish{animation-name:recipe-squish;animation-duration:1.5s;transform-box:fill-box;transform-origin:center}.rm-tile{animation-name:recipe-tile;animation-duration:.7s;transform-box:fill-box;transform-origin:center}.rm-draw{animation-name:recipe-draw;animation-duration:1.3s;stroke-dasharray:1;stroke-dashoffset:0}
.rm-rise-squish{animation-name:recipe-rise-squish;animation-duration:1.5s;transform-box:fill-box;transform-origin:center bottom}
.rm-appear{animation-name:recipe-appear;animation-duration:.65s}
.rm-arm{animation-name:recipe-arm;animation-duration:1.8s;transform-box:view-box}.rm-wrist{animation-name:recipe-wrist;animation-duration:1.65s;transform-box:view-box}
.rm-turn{animation-name:recipe-turn;animation-duration:1.5s;transform-box:fill-box;transform-origin:center}
.rm-pop{animation-name:recipe-pop;animation-duration:.85s;animation-timing-function:cubic-bezier(.4,0,.2,1);transform-box:fill-box;transform-origin:center}
.motion-paused .recipe-motion{animation-play-state:paused}
@keyframes recipe-appear{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes recipe-arm{0%{transform:rotate(-55deg)}72%{transform:rotate(3deg)}88%{transform:rotate(-1deg)}100%{transform:rotate(0)}}
@keyframes recipe-wrist{0%{transform:rotate(85deg)}70%{transform:rotate(-4deg)}88%{transform:rotate(1deg)}100%{transform:rotate(0)}}
@keyframes recipe-turn{0%{transform:rotate(-150deg) scale(.4)}75%{transform:rotate(12deg) scale(1.04)}100%{transform:rotate(0) scale(1)}}
@keyframes recipe-pop{0%{transform:scale(0)}25%{transform:scale(.22)}60%{transform:scale(1)}76%{transform:scale(1.12)}89%{transform:scale(.96)}100%{transform:scale(1)}}
@keyframes recipe-breathe{0%{transform:translateY(var(--rise)) scale(.975,1.035);animation-timing-function:cubic-bezier(.22,.65,.35,1)}30%{transform:translateY(-6px) scale(.975,1.035)}48%{transform:translateY(4px) scale(1.02,.97)}66%{transform:translateY(-3px) scale(.986,1.02)}84%{transform:translateY(2px) scale(1.008,.988)}100%{transform:translateY(0) scale(1)}}
@keyframes recipe-breath-dot{0%{transform:translateY(var(--rise));animation-timing-function:cubic-bezier(.22,.65,.35,1)}30%{transform:translateY(-21px)}48%{transform:translateY(17px)}66%{transform:translateY(-12px)}84%{transform:translateY(7px)}100%{transform:translateY(0)}}
@keyframes recipe-rise{from{transform:translateY(var(--rise,800px))}to{transform:translateY(0)}}
@keyframes recipe-side{from{transform:translateX(var(--side))}to{transform:translateX(0)}}
@keyframes recipe-rise-squish{0%{transform:translateY(var(--rise)) scale(.82,1.22)}65%{transform:translateY(0) scale(1.12,.88)}82%{transform:translateY(0) scale(.96,1.04)}100%{transform:translateY(0) scale(1)}}
@keyframes recipe-squish{0%{transform:translateX(var(--side)) scale(1.28,.78)}65%{transform:translateX(0) scale(.86,1.14)}82%{transform:translateX(0) scale(1.045,.955)}100%{transform:translateX(0) scale(1)}}
@keyframes recipe-tile{0%{opacity:0;transform:translateY(45px) rotate(-18deg) scale(.2)}70%{opacity:1;transform:translateY(-5px) rotate(3deg) scale(1.08)}100%{opacity:1;transform:translateY(0) rotate(0) scale(1)}}
@keyframes recipe-draw{0%{stroke-dashoffset:1;opacity:0}1%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
@media(prefers-reduced-motion:reduce){.recipe-motion{animation:none!important}}
</style>`;

export { recipes, drawRecipe, DEFAULTS, constrainWorkbench };
export const palettes = DATA.catalog.pairs.filter(palette => palette.name !== 'Paper / orange');

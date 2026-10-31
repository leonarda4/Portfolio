import React,{useState} from 'react';
import {DanceGraphic,defaultQualities,danceSpeed} from './DanceGraphic';
import {Qualities} from './pose';
import {GraphicTheme,themes} from './tokens';
import {FocusMetric} from './analysis';
import {useAnimationClock} from './useAnimationClock';
const dimensions=[['Weight','Light','Strong'],['Time','Slow','Fast'],['Flow','Free','Bound'],['CI','Open','Contracted']];
export function DancePanel({theme='dark'}:{theme?:GraphicTheme}){
 const [q,setQ]=useState<Qualities>([...defaultQualities]),[paused,setPaused]=useState(false),[focus,setFocus]=useState<FocusMetric>('motion');
 const {ref,time}=useAnimationClock(paused,danceSpeed(q[1]));
 return <section aria-label="Movement interaction panel" data-dance-panel style={{...themes[theme],background:'var(--echo-bg)',color:'var(--echo-ink)',border:'1px solid var(--echo-line)',borderRadius:10,padding:24,margin:'32px auto',maxWidth:1600}}>
  <h2 style={{marginTop:0}}>Explore movement</h2><p>House dance · adjust each dimension while the body moves.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:32,alignItems:'center'}}>
   <div ref={ref} style={{flex:'1 1 280px',minWidth:0,maxWidth:540}}><DanceGraphic time={time} qualities={q} theme={theme} focus={focus}/></div>
   <div style={{flex:'1 1 240px',minWidth:0}}>
    {dimensions.map(([name,low,high],i)=><label key={name} style={{display:'block',marginBottom:24}}><span style={{display:'flex',justifyContent:'space-between'}}>{name}<output>{q[i].toFixed(2)}</output></span>
     <input aria-label={name} type="range" min="0" max="1" step=".01" value={q[i]} style={{width:'100%',accentColor:'var(--echo-ink)'}} onChange={e=>{const value=Number(e.target.value);setQ(previous=>previous.map((v,j)=>j===i?value:v) as Qualities);}}/>
     <span style={{display:'flex',justifyContent:'space-between',fontSize:12,opacity:.7}}><span>{low}</span><span>{high}</span></span>
    </label>)}
    <label>Joint circles <select aria-label="Joint circle metric" value={focus} onChange={e=>setFocus(e.target.value as FocusMetric)} style={{font:'inherit',padding:6,background:'var(--echo-bg)',color:'var(--echo-ink)'}}><option value="motion">Motion</option><option value="weight">Weight</option><option value="flow">Flow</option></select></label>
    <p style={{fontSize:13}}>Circles track shoulders, elbows, wrists, hips, knees and ankles. Larger circles show greater activity.</p>
    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button type="button" aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?'Play dance':'Pause dance'}</button><button type="button" onClick={()=>{setQ([...defaultQualities]);setFocus('motion');}}>Reset dimensions</button></div>
    <p style={{fontSize:12,opacity:.7}}>Illustrative movement controls and joint-activity proxies. Area CI compares the live box with a fixed open-pose reference.</p>
   </div>
  </div>
 </section>;
}

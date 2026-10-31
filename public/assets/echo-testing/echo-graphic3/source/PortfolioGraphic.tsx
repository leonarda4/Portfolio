import React, {useState} from 'react';
import {ContentGraphic} from './ContentGraphic';
import {useAnimationClock} from './useAnimationClock';

export function PortfolioGraphic({id,className,theme='dark'}:{id:string;className?:string;theme?:'dark'|'light'}){
 const [paused,setPaused]=useState(false);
 const {ref,time}=useAnimationClock(paused);
 return <div ref={ref} className={className}><ContentGraphic id={id} time={time} theme={theme} loop/><button type="button" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?'Play animation':'Pause animation'}</button></div>;
}

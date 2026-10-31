import {useEffect,useRef,useState} from 'react';
/** Integrate speed changes without resetting the dancer's phase. */
export function useAnimationClock(paused:boolean,speed=1){
 const ref=useRef<HTMLDivElement>(null),elapsed=useRef(3.25),rate=useRef(speed);
 rate.current=speed;
 const [time,setTime]=useState(3.25);
 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,frame=0,last=0;
  const stop=()=>{cancelAnimationFrame(frame);last=0;};
  const tick=(now:number)=>{if(!last||now-last>=1000/30){if(last)elapsed.current+=(now-last)/1000*rate.current;last=now;setTime(elapsed.current);}frame=requestAnimationFrame(tick);};
  const sync=()=>{stop();if(visible&&!document.hidden&&!paused&&!motion.matches)frame=requestAnimationFrame(tick);};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
  if(ref.current)observer.observe(ref.current);
  motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return ()=>{stop();observer.disconnect();motion.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
 },[paused]);
 return {ref,time};
}

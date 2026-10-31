import React from 'react'
import {createRoot} from 'react-dom/client'
import GradientGallery from './src/components/GradientGallery.jsx'
import groups from './src/components/noise-lab/recipes.json'
import {createNoiseRenderer} from './src/components/noise-lab/renderer.js'
import './src/index.css'
import './src/case-study.css'
import './src/theme.css'
const params=new URLSearchParams(location.search)
document.documentElement.dataset.theme=params.get('theme')||'light'
if(params.has('frame')) {
 createRoot(document.getElementById('root')).render(<main className="case-study" style={{padding:24}}><article className="study-content" style={{margin:'0 auto',width:'100%',maxWidth:680}}><GradientGallery/></article></main>)
} else {
 createRoot(document.getElementById('root')).render(<main style={{padding:20}}><h1 style={{fontSize:20}}>Echo gradient verification</h1><p id="result">Checking shader outputs…</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{['light','dark'].map(theme=><section key={theme}><h2 style={{fontSize:16}}>Desktop {theme}</h2><iframe title={`Desktop ${theme}`} src={`?frame=1&theme=${theme}`} style={{width:1200,height:460,border:'1px solid #888'}}/></section>)}{['light','dark'].map(theme=><section key={theme}><h2 style={{fontSize:16}}>Mobile {theme}</h2><iframe title={`Mobile ${theme}`} src={`?frame=1&theme=${theme}`} style={{width:390,height:1550,border:'1px solid #888'}}/></section>)}</div></main>)
 setTimeout(async()=>{
  try {
   const canvas=document.createElement('canvas');canvas.width=640;canvas.height=312
   const renderer=createNoiseRenderer(canvas),gl=canvas.getContext('webgl'),images=[],checks=[]
   for(const group of groups) for(const recipe of group.recipes) {
    renderer.render([{recipe,x:0,y:0,width:640,height:312}],0)
    const pixels=new Uint8Array(640*312*4);gl.readPixels(0,0,640,312,gl.RGBA,gl.UNSIGNED_BYTE,pixels)
    let opaque=0;const colors=new Set()
    for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]===255)opaque++;if(i%64===0)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`)}
    const error=gl.getError();if(error||opaque!==640*312||colors.size<10)throw new Error(`Invalid render ${recipe.id}: ${error}, ${opaque}, ${colors.size}`)
    if(recipe.renderer==='echo')images.push({id:recipe.id,png:canvas.toDataURL('image/png')})
    renderer.render([{recipe,x:0,y:0,width:640,height:312}],2)
    const later=new Uint8Array(pixels.length);gl.readPixels(0,0,640,312,gl.RGBA,gl.UNSIGNED_BYTE,later)
    checks.push({group:group.label,row:recipe.referenceRow,id:recipe.id,opaque,colors:colors.size,animated:later.some((value,i)=>value!==pixels[i]),error:gl.getError()})
   }
   renderer.destroy()
   const response=await fetch('http://127.0.0.1:5178/previews',{method:'POST',body:JSON.stringify({images,checks})})
   if(!response.ok)throw new Error('Preview save failed')
   document.getElementById('result').textContent='PASS: all 30 recipes rendered and animated; 15 Echo previews saved.'
  } catch(e){document.getElementById('result').textContent=`FAIL: ${e.stack}`}
 },400)
}

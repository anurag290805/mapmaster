import {clampView, createOwner, evaluateSelection, resetView} from './core.mjs';
const $ = id => document.getElementById(id);
const viewport=$('viewport'), feedback=$('feedback'), score=$('score'), target=$('target'), chooser=$('answer');
const owner=createOwner();
let abort=null, activeSvg=null, view=resetView(), manifest=null, position=0, points=0, attempts=0;
let allowed=new Set(), activeEntity=null, pointer=null, committedToken=0;
function announcement(message){feedback.textContent=message;}
function renderScore(){score.textContent=`Score ${points} · Attempts ${attempts}`;}
function applyView(){
  view=clampView(view);
  if(activeSvg){const layer=activeSvg.querySelector('#pilot-layer');layer.setAttribute('transform',`translate(${view.x} ${view.y}) translate(180 90) scale(${view.scale}) translate(-180 -90)`);}
}
function submit(id, token) {
  if(!owner.current(token) || !activeSvg || !viewport.contains(activeSvg)) return;
  const result=evaluateSelection(activeEntity,id,allowed);
  if(result==='ignored') return;
  attempts++;
  const name=manifest.entities.find(e=>e.id===id).name;
  if(result==='correct'){
    points++; activeSvg.querySelectorAll('g[data-entity]').forEach(el=>el.classList.toggle('correct',el.dataset.entity===id));
    announcement(`Correct: ${name}.`);position=(position+1)%manifest.entities.length;activeEntity=manifest.entities[position].id;target.textContent=manifest.entities[position].name;
  } else announcement(`${name} is not the current target. Try again.`);
  renderScore();
}
function setView(next){view=clampView(next);applyView();}
function install(svg,token){
  if(abort) abort.abort();abort=new AbortController();const signal=abort.signal;
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='pilot-layer';while(svg.firstChild)layer.append(svg.firstChild);svg.append(layer);
  svg.addEventListener('keydown',event=>{const item=event.target.closest?.('g[data-entity]');if(item&&(event.key==='Enter'||event.key===' ')){event.preventDefault();submit(item.dataset.entity,token);}},{signal});
  svg.addEventListener('pointerdown',event=>{if(!owner.current(token)||pointer) return; const item=event.target.closest?.('g[data-entity]');pointer={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,item:item?.dataset.entity,dist:0};svg.setPointerCapture(event.pointerId);},{signal});
  svg.addEventListener('pointermove',event=>{if(!owner.current(token)||!pointer||pointer.id!==event.pointerId)return;const dx=event.clientX-pointer.lastX,dy=event.clientY-pointer.lastY;pointer.dist=Math.max(pointer.dist,Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y));if(pointer.dist>6){const rect=svg.getBoundingClientRect();setView({...view,x:view.x+dx*360/rect.width,y:view.y+dy*180/rect.height});}pointer.lastX=event.clientX;pointer.lastY=event.clientY;},{signal});
  svg.addEventListener('pointerup',event=>{if(!owner.current(token)||!pointer||pointer.id!==event.pointerId)return;const current=pointer;pointer=null;if(current.dist<=6&&current.item){svg.querySelector(`g[data-entity="${current.item}"]`)?.focus();submit(current.item,token);}},{signal});
  svg.addEventListener('pointercancel',()=>{pointer=null;},{signal});
  svg.addEventListener('wheel',event=>{if(!owner.current(token))return;event.preventDefault();setView({...view,scale:view.scale*(event.deltaY<0?1.2:1/1.2)});},{passive:false,signal});
}
async function loadMap(){
  const token=owner.next();pointer=null;announcement('Loading map.');
  try{
    const response=await fetch('./map.svg',{cache:'no-store'});if(!response.ok)throw new Error('map request failed');
    const text=await response.text();if(!owner.current(token))return;
    const doc=new DOMParser().parseFromString(text,'image/svg+xml'), root=doc.documentElement;
    if(root.localName!=='svg'||doc.querySelector('parsererror'))throw new Error('invalid map');
    const svg=document.importNode(root,true), ids=[...svg.querySelectorAll('g[data-entity]')].map(el=>el.dataset.entity);
    if(ids.length!==allowed.size||new Set(ids).size!==allowed.size||ids.some(id=>!allowed.has(id)))throw new Error('map identity mismatch');
    install(svg,token);activeSvg=svg;committedToken=token;viewport.replaceChildren(svg);view=resetView();applyView();announcement('Map ready.');
  }catch(error){if(owner.current(token)) announcement(`Map could not be loaded: ${error.message}`);}
}
$('answer-form').addEventListener('submit',event=>{event.preventDefault();submit(chooser.value,committedToken);});
$('reload').addEventListener('click',loadMap);
$('focus-country').addEventListener('click',()=>{
  if(!allowed.has(chooser.value)||!activeSvg)return;
  const group=[...activeSvg.querySelectorAll('g[data-entity]')].find(el=>el.dataset.entity===chooser.value);
  if(!group)return;
  const paths=[...group.querySelectorAll('path')];
  const largest=paths.reduce((best,path)=>{const b=path.getBBox();return b.width*b.height>best.area?{box:b,area:b.width*b.height}:best;},{box:null,area:-1});
  if(largest.box){const b=largest.box;setView({scale:5,x:5*(180-b.x-b.width/2),y:5*(90-b.y-b.height/2)});announcement(`Map focused on ${manifest.entities.find(e=>e.id===chooser.value).name}.`);}
});
$('zoom-in').addEventListener('click',()=>setView({...view,scale:view.scale*1.25}));
$('zoom-out').addEventListener('click',()=>setView({...view,scale:view.scale/1.25}));
$('reset').addEventListener('click',()=>{view=resetView();applyView();announcement('Map view reset.');});
for(const [id,dx,dy] of [['pan-left',-25,0],['pan-right',25,0],['pan-up',0,-20],['pan-down',0,20]]) $(id).addEventListener('click',()=>setView({...view,x:view.x+dx,y:view.y+dy}));
window.addEventListener('pagehide',()=>{owner.dispose();abort?.abort();},{once:true});
try{
  const res=await fetch('./manifest.json');if(!res.ok)throw new Error('manifest request failed');manifest=await res.json();
  allowed=new Set(manifest.entities.map(e=>e.id));for(const e of manifest.entities){const option=document.createElement('option');option.value=e.id;option.textContent=e.name;chooser.append(option);}
  activeEntity=manifest.entities[0].id;target.textContent=manifest.entities[0].name;await loadMap();
}catch(error){announcement(`Pilot could not start: ${error.message}`);}

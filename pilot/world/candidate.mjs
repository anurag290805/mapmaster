import {clampView,createOwner,evaluateSelection,resetView} from '../core.mjs';
import {candidateEntities} from '../candidate-core.mjs';
const $=id=>document.getElementById(id);
const viewport=$('viewport'),feedback=$('feedback'),chooser=$('answer');
const owner=createOwner();
let entities=[], allowed=new Set(), position=0,points=0,attempts=0,review=false;
let activeSvg=null,abort=null,view=resetView(),pointer=null,committedToken=0;
const announce=text=>{feedback.textContent=text;};
const render=()=>{$('score').textContent=`Score ${points} · Attempts ${attempts}`;$('target').textContent=entities[position]?.name || 'Complete';};
function applyView(){view=clampView(view);activeSvg?.querySelector('#candidate-layer')?.setAttribute('transform',`translate(${view.x} ${view.y}) scale(${view.scale})`);}
function submit(id,token){
  if(!owner.current(token)||!activeSvg||!viewport.contains(activeSvg)||review||position>=entities.length)return;
  const result=evaluateSelection(entities[position].id,id,allowed);
  if(result==='ignored')return;
  attempts++;const entity=entities.find(e=>e.id===id);
  if(result==='correct'){points++;activeSvg.querySelector(`#${entity.domId}`)?.classList.add('correct');announce(`Correct: ${entity.name}.`);position++;}
  else announce(`${entity.name} is not the current target. Try again.`);
  render();
}
function install(svg,token){
  abort?.abort();abort=new AbortController();const signal=abort.signal;
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='candidate-layer';while(svg.firstChild)layer.append(svg.firstChild);svg.append(layer);
  svg.addEventListener('keydown',event=>{const item=event.target.closest?.('g[data-entity]');if(item&&(event.key==='Enter'||event.key===' ')){event.preventDefault();submit(item.dataset.entity,token);}},{signal});
  svg.addEventListener('pointerdown',event=>{if(!owner.current(token)||pointer)return;const direct=event.target.closest?.('g[data-entity]');const hit=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('g[data-entity]');const item=direct||(hit&&svg.contains(hit)?hit:null);pointer={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,item:item?.dataset.entity,dist:0};svg.setPointerCapture(event.pointerId);},{signal});
  svg.addEventListener('pointermove',event=>{if(!owner.current(token)||!pointer||pointer.id!==event.pointerId)return;const dx=event.clientX-pointer.lastX,dy=event.clientY-pointer.lastY;pointer.dist=Math.max(pointer.dist,Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y));if(pointer.dist>6){const rect=svg.getBoundingClientRect();view=clampView({...view,x:view.x+dx*360/rect.width,y:view.y+dy*180/rect.height});applyView();}pointer.lastX=event.clientX;pointer.lastY=event.clientY;},{signal});
  svg.addEventListener('pointerup',event=>{if(!owner.current(token)||!pointer||pointer.id!==event.pointerId)return;const p=pointer;pointer=null;if(p.dist<=6&&p.item){svg.querySelector(`[data-entity="${p.item}"]`)?.focus();submit(p.item,token);}},{signal});
  svg.addEventListener('pointercancel',()=>{pointer=null;},{signal});
  svg.addEventListener('wheel',event=>{if(!owner.current(token))return;event.preventDefault();view=clampView({...view,scale:view.scale*(event.deltaY<0?1.2:1/1.2)});applyView();},{passive:false,signal});
}
async function loadMap(){
  const token=owner.next();pointer=null;announce('Loading map.');
  try{
    const response=await fetch('../../candidate/world.svg',{cache:'no-store'});if(!response.ok)throw new Error('map request failed');
    const text=await response.text();if(!owner.current(token))return;
    const doc=new DOMParser().parseFromString(text,'image/svg+xml'),root=doc.documentElement;
    if(root.localName!=='svg'||doc.querySelector('parsererror'))throw new Error('invalid SVG');
    const svg=document.importNode(root,true),groups=[...svg.querySelectorAll('#countries > g[data-canonical-id]')];
    if(groups.length!==entities.length||new Set(groups.map(g=>g.dataset.canonicalId)).size!==allowed.size)throw new Error('map identity mismatch');
    for(const [index,entity] of entities.entries()){
      const group=groups[index];if(group.id!==entity.domId||group.dataset.canonicalId!==entity.id||group.querySelectorAll('path').length!==entity.parts)throw new Error('map association mismatch');
      group.dataset.entity=entity.id;group.setAttribute('tabindex','0');group.setAttribute('role','button');group.setAttribute('aria-label',`Map target ${index+1}`);
    }
    install(svg,token);activeSvg=svg;committedToken=token;viewport.replaceChildren(svg);view=resetView();applyView();announce('Map ready.');
  }catch(error){if(owner.current(token))announce(`Map could not be loaded: ${error.message}`);}
}
$('answer-form').addEventListener('submit',event=>{event.preventDefault();submit(chooser.value,committedToken);});
$('reload').addEventListener('click',loadMap);
$('new-session').addEventListener('click',()=>{position=0;points=0;attempts=0;review=false;$('review').setAttribute('aria-pressed','false');$('review').textContent='Enter review';render();loadMap();});
$('review').addEventListener('click',()=>{review=!review;$('review').setAttribute('aria-pressed',String(review));$('review').textContent=review?'Exit review':'Enter review';announce(review?'Review mode: selection disabled.':'Review mode ended.');});
$('focus-country').addEventListener('click',()=>{const entity=entities.find(e=>e.id===chooser.value);if(!entity||!activeSvg)return;const group=activeSvg.querySelector(`#${entity.domId}`);const paths=[...group.querySelectorAll('path')];const largest=paths.reduce((best,path)=>{const b=path.getBBox();return b.width*b.height>best.area?{box:b,area:b.width*b.height}:best;},{box:null,area:-1});if(largest.box){const b=largest.box;view=clampView({scale:5,x:-5*(b.x+b.width/2),y:-5*(b.y+b.height/2)});applyView();group.focus({preventScroll:true});announce(`Map focused on ${entity.name}.`);}});
$('zoom-in').addEventListener('click',()=>{view={...view,scale:view.scale*1.25};applyView();});
$('zoom-out').addEventListener('click',()=>{view={...view,scale:view.scale/1.25};applyView();});
$('reset').addEventListener('click',()=>{view=resetView();applyView();announce('Map view reset.');});
for(const [id,dx,dy] of [['pan-left',-25,0],['pan-right',25,0],['pan-up',0,-20],['pan-down',0,20]])$(id).addEventListener('click',()=>{view={...view,x:view.x+dx,y:view.y+dy};applyView();});
window.addEventListener('pagehide',()=>{owner.dispose();abort?.abort();},{once:true});
try{const res=await fetch('../../candidate/world-manifest.json');if(!res.ok)throw new Error('manifest request failed');entities=candidateEntities(await res.json());allowed=new Set(entities.map(e=>e.id));for(const e of entities){const option=document.createElement('option');option.value=e.id;option.textContent=e.name;chooser.append(option);}render();await loadMap();}catch(error){announce(`Candidate could not start: ${error.message}`);}

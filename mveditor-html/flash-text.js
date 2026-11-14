/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Flash htmlText: paragraph leading and empty paragraphs are layout, not whitespace. */
(function(root){
'use strict';
const tags={P:'p',B:'b',I:'i',U:'u',BR:'br',LI:'li',UL:'ul',FONT:'span',TEXTFORMAT:'div',SPAN:'span'};
const attr=(n,k)=>n.getAttribute(k)??n.getAttribute(k.toLowerCase());
const numeric=(v,f)=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):f;
const cache=new Map();let context;
function pitch(size,face,leading){
 const key=face+'|'+size;let height=cache.get(key);
 if(height===undefined){
  context=context||document.createElement('canvas').getContext('2d');
  if(context){context.font=size+'px '+face;const m=context.measureText('Mg');height=m.fontBoundingBoxAscent+m.fontBoundingBoxDescent;}
  // Chromium 86 may not expose fontBoundingBox*. Measure an inline font box
  // instead of estimating size * 1.15 (which accumulates drift on long lists).
  if((!Number.isFinite(height)||height<=0)&&document.body){
   const probe=document.createElement('div'),run=document.createElement('span');
   Object.assign(probe.style,{position:'fixed',left:'-10000px',top:'0',visibility:'hidden',pointerEvents:'none',whiteSpace:'pre',margin:'0',padding:'0',border:'0'});
   Object.assign(run.style,{display:'inline',fontFamily:face,fontSize:size+'px',fontWeight:'normal',fontStyle:'normal',lineHeight:'normal',margin:'0',padding:'0',border:'0'});
   run.append(document.createTextNode('Mg'));probe.append(run);document.body.append(probe);
   try{height=run.getBoundingClientRect().height;}finally{probe.remove();}
  }
  if(!Number.isFinite(height)||height<=0)height=Math.ceil(size*1.15);
  cache.set(key,height);
 }return Math.max(1,height+leading);
}
function render(source,target,options={}){
 const content=document.createElement('div');content.className='mvRichText';target.append(content);
 const owner=source.parentElement;
 const initial={face:owner?.getAttribute('fontFamily')||'Verdana',size:numeric(owner?.getAttribute('fontSize'),10),leading:numeric(owner?.getAttribute('leading'),2),...options};
 function walk(from,to,state){for(const node of from.childNodes){
  if(node.nodeType===3||node.nodeType===4){to.append(document.createTextNode(node.textContent));continue;}
  if(node.nodeType!==1)continue;
  const name=node.tagName.toUpperCase(),tag=tags[name];
  if(!tag){to.append(document.createTextNode(node.textContent));continue;}
  const next={...state},e=document.createElement(tag);e.dataset.flashTag=name;e.dataset.flashAttrs=JSON.stringify([...node.attributes].map(a=>[a.name,a.value]));
  if(name==='TEXTFORMAT'){
   next.leading=numeric(attr(node,'LEADING'),state.leading);
   e.className='mvRichFormat';
   for(const [key,style] of [['LEFTMARGIN','paddingLeft'],['RIGHTMARGIN','paddingRight'],['INDENT','textIndent']]){const value=attr(node,key);if(value!==null)e.style[style]=numeric(value,0)+'px';}
  }
  const face=attr(node,'FACE'),size=attr(node,'SIZE'),color=attr(node,'COLOR'),align=(attr(node,'ALIGN')||'').toLowerCase();
  if(face){next.face=face;e.style.fontFamily=face;}
  if(size!==null){next.size=Math.max(1,Math.min(200,numeric(size,state.size)));e.style.fontSize=next.size+'px';}
  if(/^#[\da-f]{6}$/i.test(color||''))e.style.color=color;
  if(['left','right','center','justify'].includes(align))e.style.textAlign=align;
  if(attr(node,'LETTERSPACING')!==null)e.style.letterSpacing=numeric(attr(node,'LETTERSPACING'),0)+'px';
  if(attr(node,'KERNING')!==null)e.style.fontKerning=attr(node,'KERNING')==='0'?'none':'normal';
  if(name==='P'||name==='LI'){
   // Set the line box from the paragraph font, including an empty FONT run.
   const fonts=Array.from(node.querySelectorAll('FONT,font'));
   const font=fonts.find(f=>attr(f,'SIZE')!==null);
   const paragraphSize=fonts.reduce((s,f)=>Math.max(s,numeric(attr(f,'SIZE'),0)),font?numeric(attr(font,'SIZE'),next.size):next.size);
   const paragraphFace=(font&&attr(font,'FACE'))||next.face;
   e.className='mvRichParagraph';e.style.fontFamily=paragraphFace;e.style.fontSize=paragraphSize+'px';
   const height=pitch(paragraphSize,paragraphFace,next.leading);
   e.style.lineHeight=height+'px';e.style.minHeight=height+'px';
  }
  walk(node,e,next);to.append(e);
 }}walk(source,content,initial);
 queueMicrotask(()=>{if(root.MVPdfText)root.MVPdfText.alignPreview(content,target,source);fit(content);});
}
function fit(content){
 const target=content.parentElement;if(content.isContentEditable)return;if(!target?.isConnected||!target.offsetHeight)return;
 const style=getComputedStyle(target),available=target.clientHeight-parseFloat(style.paddingTop||0)-parseFloat(style.paddingBottom||0);
 const scale=target.getBoundingClientRect().height/target.offsetHeight;
 const top=content.getBoundingClientRect().top;let end=0;
 for(const p of content.querySelectorAll('.mvRichParagraph')){
  const y=(p.getBoundingClientRect().top-top)/scale,line=parseFloat(p.style.lineHeight),height=p.offsetHeight;
  if(y>=available)break;
  const full=Math.max(0,Math.floor((available-y+0.01)/line));
  end=Math.max(end,y+Math.min(height,full*line));
 }
 // TextField clips the last incomplete line; keep it from spilling over a rule.
 content.style.height=Math.max(0,Math.min(available,end||available))+'px';
}
function fitAll(){document.querySelectorAll('.mvRichText').forEach(fit);}
root.MVFlashText={render,pitch,fitAll};
})(typeof window==='undefined'?globalThis:window);

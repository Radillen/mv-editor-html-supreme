/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
/* Editable physical sheets; XML coordinates remain logical and unchanged. */
(function(root){
'use strict';
function segments(height,breaks,limit=960){const cuts=[0,...new Set(breaks.filter(y=>y>0&&y<height)),height].sort((a,b)=>a-b);const out=[];for(let i=1;i<cuts.length;i++){for(let y=cuts[i-1];y<cuts[i];y+=limit)out.push({start:y,end:Math.min(cuts[i],y+limit)});}return out;}
function position(n,e){if(e.parentElement?.dataset.logicalStart!=null)e.style.top=(parseFloat(e.style.top)-Number(e.parentElement.dataset.logicalStart))+'px';}
function yAt(clientY){const views=[...document.querySelectorAll('#canvas .column[data-logical-start]')];let best=null,distance=Infinity;for(const e of views){const r=e.getBoundingClientRect(),bottom=r.top+(Number(e.dataset.logicalLimit)||e.offsetHeight)*(r.width/e.offsetWidth),d=clientY<r.top?r.top-clientY:clientY>bottom?clientY-bottom:0;if(d<distance){best=e;distance=d;}}if(!best)return null;const r=best.getBoundingClientRect(),scale=r.width/best.offsetWidth;return Number(best.dataset.logicalStart)+Math.max(0,Math.min(Number(best.dataset.logicalLimit)||best.offsetHeight,(clientY-r.top)/scale));}
function render(doc,settings,guide,h){
 const make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;};let number=0;
 for(const p of doc.querySelectorAll('Application > Page'))for(const row of p.children){if(row.getAttribute('pageSection')!=='pagebody')continue;
  for(const column of row.children){
   const height=(doc.documentElement.hasAttribute('mvImportPages')?Number(row.getAttribute('height')):Number(settings.bodyHeight))||Number(row.getAttribute('height'))||960,context=root.MVPrintGuides.settings(guide),width=768;
   const native=[...column.children].filter(n=>n.tagName==='BAND'),breaks=native.length?native.map(n=>Number(n.getAttribute('y'))):context.breaks;
   const blocks=segments(height,breaks,context.usableHeight);
   for(const block of blocks){
    const elements=[...column.children].filter(n=>n.tagName!=='BAND'&&(Number(n.getAttribute('y'))||0)>=block.start&&(Number(n.getAttribute('y'))||0)<block.end);
    if(block.start>0&&!elements.length&&!column.querySelector('[id]')&&!column.querySelector('LABEL,FRAME'))continue;
    // A terminal BAND followed only by empty trailing canvas does not create a sheet.
    if(block.start>0&&!elements.length&&!blocks.some(b=>b.start>block.start&&[...column.children].some(n=>n.tagName!=='BAND'&&Number(n.getAttribute('y'))>=b.start&&Number(n.getAttribute('y'))<b.end)))break;
    const page=make('div','page physicalSheet');Object.assign(page.style,{width:width+'px',height:'1087px'});page.dataset.sheet=String(++number);
    const head=make('div','sheetReservation sheetHeader','Reserva superior • '+context.headerHeight);Object.assign(head.style,{top:'0px',height:context.headerHeight+'px'});page.append(head);
    const content=make('div','row physicalBody');content.dataset.section='pagebody';Object.assign(content.style,{top:context.headerHeight+'px',height:(block.end-block.start)+'px'});
    const ce=make('div','column');Object.assign(ce.style,{width:(Number(column.getAttribute('width'))||width)+'px',height:(block.end-block.start)+'px'});ce.dataset.logicalStart=String(block.start);ce.dataset.logicalLimit=String(context.usableHeight);h.column(ce,column);ce.onclick=e=>{e.stopPropagation();h.choose(column);};ce.onpointerdown=e=>h.marquee(e,column,ce);content.append(ce);page.append(content);
    for(const n of elements){h.draw(n,ce);const object=ce.lastElementChild;position(n,object);if(parseFloat(object.style.left)<0||parseFloat(object.style.left)+parseFloat(object.style.width)>width){object.classList.add('outsidePaper');object.title+=' • Fora da largura da folha; o PDF pode cortar este objeto';}}
    const band=native.find(n=>Number(n.getAttribute('y'))===block.end);
    if(band){h.draw(band,ce);const view=ce.lastElementChild;view.style.top=(block.end-block.start)+'px';view.classList.add('sheetBand');}
    const max=make('div','sheetMax','Limite máximo do corpo • '+context.usableHeight);max.style.top=(context.headerHeight+context.usableHeight)+'px';page.append(max);
    const foot=make('div','sheetReservation sheetFooter','Reserva inferior • '+context.footerHeight);foot.style.height=context.footerHeight+'px';foot.style.bottom='0px';page.append(foot);
    const end=make('div','sheetEnd','Fim da folha '+number+' • 1087');page.append(end);h.canvas.append(page);h.guides(column,ce,row);
   }
  }
 }
}
root.MVPageCanvas={segments,position,yAt,render};if(typeof module!=='undefined')module.exports=root.MVPageCanvas;
})(globalThis);

/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
/* Report-only preparation: text runs, toggle centers and single-line value baselines. No shared metadata, answers, bands or PDF engine changes. */
(function(root){
'use strict';
const PROFILE='text-runs-v2',TOGGLE_PROFILE='center-v1';
const prepared=value=>['text-runs-v1',PROFILE].includes(value);
const n=(node,key,f=0)=>node.hasAttribute(key)&&Number.isFinite(Number(node.getAttribute(key)))?Number(node.getAttribute(key)):f;
function family(face){const name=face.split(',')[0].trim().replace(/^["']|["']$/g,'').toLowerCase();return {'arial':'Arial','verdana':'Verdana','times new roman':'Times New Roman','courier new':'Courier New'}[name];}
// First-line baseline/size measured with the shipped Jasper/fonts (offline probe).
function ascent(face,size){const factor={'Arial':.9545,'Verdana':1.0055,'Times New Roman':.955,'Courier New':.8325}[face];if(!factor)throw Error('Fonte não calibrada: '+face);return size*factor;}
function mergeGlyphs(glyphs){
 const runs=[];let run=null,spaces=[];
 function flush(){if(run){runs.push(run);run=null;}spaces=[];}
 for(const g of glyphs){
  if(/\s/u.test(g.text)){spaces.push(g);continue;}
  const same=run&&run.signature===g.signature&&Math.abs(run.top-g.top)<.5;
  if(!same||spaces.length>1)flush();
  if(!run)run={...g,text:g.text,right:g.right,endNode:g.node,endOffset:g.offset+g.text.length};
  else{run.text+=(spaces.length?' ':'')+g.text;run.right=g.right;run.endNode=g.node;run.endOffset=g.offset+g.text.length;}
  spaces=[];
 }flush();return runs;
}
async function measure(label){
 const host=document.createElement('div');host.className='component LABEL';
 root.MVLayoutView.style(label,host);
 Object.assign(host.style,{left:'-20000px',top:'0px',position:'fixed',zoom:'1',transform:'none',visibility:'hidden',pointerEvents:'none'});
 document.body.append(host);
 try{
  root.MVFlashText.render(label.querySelector('htmlText'),host);
  await Promise.resolve();root.MVFlashText.fitAll();
  const content=host.querySelector('.mvRichText'),origin=host.getBoundingClientRect(),clip=content.getBoundingClientRect(),glyphs=[];
  const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
   const style=getComputedStyle(node.parentElement),face=family(style.fontFamily),size=Number.parseFloat(style.fontSize);
   if(!face)throw Error('fonte sem calibração: '+style.fontFamily);
   const attrs={face,size,bold:Number(style.fontWeight)>=600||style.fontWeight==='bold',italic:style.fontStyle==='italic',underline:style.textDecorationLine.includes('underline'),color:style.color};
   const signature=JSON.stringify(attrs);
   for(let offset=0;offset<node.length;){
    const text=String.fromCodePoint(node.textContent.codePointAt(offset)),range=document.createRange();range.setStart(node,offset);range.setEnd(node,offset+text.length);
    const box=range.getBoundingClientRect();
    if(!/\s/u.test(text)&&box.height&&((box.top<clip.top-.5)||(box.bottom>clip.bottom+.5)||(box.left<clip.left-.5)||(box.right>clip.right+.5)))throw Error('texto cortado na caixa; aumente a caixa antes de preparar');
    if(box.height)glyphs.push({text,node,offset,left:box.left-origin.left,top:box.top-origin.top,right:box.right-origin.left,...attrs,signature});
    offset+=text.length;
   }
  }
  const runs=mergeGlyphs(glyphs);
  // Zero-size inline markers measure the real browser baseline, including wrapping.
  // Insert from the end so text-node offsets remain valid. Only the hidden probe changes.
  for(const run of [...runs].reverse()){
   const range=document.createRange();range.setStart(run.endNode,run.endOffset);range.collapse(true);
   const marker=document.createElement('span');Object.assign(marker.style,{display:'inline-block',width:'0',height:'0',padding:'0',margin:'0',border:'0',verticalAlign:'baseline',lineHeight:'0'});range.insertNode(marker);run.marker=marker;
  }
  return runs.map(run=>({...run,baseline:run.marker.getBoundingClientRect().top-origin.top}));
 }finally{host.remove();}
}
function location(node){let x=n(node,'x'),y=n(node,'y');for(let parent=node.parentElement;parent&&parent.tagName!=='Column';parent=parent.parentElement){x+=n(parent,'x');y+=n(parent,'y');}return 'x='+Math.round(x)+', y='+Math.round(y);}
function hex(value){if(/^#[\da-f]{6}$/i.test(value))return value;const rgb=value.match(/[\d.]+/g);return rgb?.length>=3?'#'+rgb.slice(0,3).map(v=>Math.round(Number(v)).toString(16).padStart(2,'0')).join(''):'#000000';}
function makeLabel(doc,source,run){
 const label=doc.createElement('LABEL');
 // Native Jasper adds one pixel to LABEL.x. Coordinates below target visible text.
 label.setAttribute('x',String(Math.max(0,Math.round(n(source,'x')+run.left-1))));
 label.setAttribute('y',String(Math.max(0,Math.round(n(source,'y')+run.baseline-ascent(run.face,run.size)))));
 label.setAttribute('width',String(Math.ceil(run.right-run.left)+4));label.setAttribute('height',String(Math.ceil(run.size*1.5)+2));label.setAttribute('mvPdfText',PROFILE);
 const html=doc.createElement('htmlText'),format=doc.createElement('TEXTFORMAT'),p=doc.createElement('P'),font=doc.createElement('FONT');
 format.setAttribute('LEADING','0');p.setAttribute('ALIGN','LEFT');
 for(const [key,value] of Object.entries({FACE:run.face,SIZE:String(Math.round(run.size)),COLOR:hex(run.color),LETTERSPACING:'0',KERNING:'0'}))font.setAttribute(key,value);
 let target=font;for(const [enabled,tag] of [[run.bold,'B'],[run.italic,'I'],[run.underline,'U']])if(enabled){const mark=doc.createElement(tag);target.append(mark);target=mark;}
 target.textContent=run.text;p.append(font);format.append(p);html.append(format);label.append(html);return label;
}
// Align the report preview to its native print baseline, without adding Flash's
// padding/line-leading for a second time to already-positioned text runs.
function alignPreview(content,target,source){
 const label=source.parentElement;if(!prepared(label?.getAttribute('mvPdfText'))||content.isContentEditable||!target.isConnected)return;
 const p=content.querySelector('.mvRichParagraph');if(!p)return;
 const font=label.querySelector('FONT'),face=family(font?.getAttribute('FACE')||'Verdana'),size=Number(font?.getAttribute('SIZE')||10);if(!face)return;
 target.style.padding='0px';Object.assign(content.style,{position:'absolute',left:'1px',top:'0px'});
 const marker=document.createElement('span');Object.assign(marker.style,{display:'inline-block',width:'0',height:'0',padding:'0',margin:'0',border:'0',verticalAlign:'baseline',lineHeight:'0'});p.append(marker);
 const scale=target.getBoundingClientRect().height/target.offsetHeight||1;
 const current=(marker.getBoundingClientRect().top-target.getBoundingClientRect().top)/scale;
 marker.remove();content.style.top=(ascent(face,size)-current)+'px';
}
function centerToggle(node){
 if(!['CHECKBOX','RADIOBUTTON'].includes(node.tagName)||node.getAttribute('mvPdfToggle')===TOGGLE_PROFILE)return false;
 // Native print icons are 10px; Flex icons are 14px, vertically centered in
 // the stored height. Move only the new report's print origin to keep centers.
 node.setAttribute('x',String(n(node,'x')+2));
 node.setAttribute('y',String(n(node,'y')+(n(node,'height',14)-14)/2+2));
 node.setAttribute('mvPdfToggle',TOGGLE_PROFILE);return true;
}
const VALUE_PROFILE='input-baseline-v1';
function prepareValue(node,metrics){
 if(node.getAttribute('mvPdfValue')===VALUE_PROFILE)return false;
 const dx=Math.round(metrics.left),dy=Math.round(metrics.baseline-ascent(metrics.face,metrics.size)),width=n(node,'width',150),height=n(node,'height',25);
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||dx<0||dy<0||width-dx<1||height-dy<metrics.size)throw Error('caixa pequena demais para compensar o valor');
 node.setAttribute('x',String(n(node,'x')+dx));node.setAttribute('y',String(n(node,'y')+dy));
 node.setAttribute('width',String(width-dx));node.setAttribute('height',String(height-dy));
 node.setAttribute('mvPdfValue',VALUE_PROFILE);node.setAttribute('mvPdfValueDx',String(dx));node.setAttribute('mvPdfValueDy',String(dy));return true;
}
function measureValue(node){
 const host=document.createElement('div');host.className='component '+node.tagName;root.MVLayoutView.style(node,host);
 Object.assign(host.style,{left:'-20000px',top:'0px',position:'fixed',zoom:'1',transform:'none',visibility:'hidden',pointerEvents:'none'});
 const view=root.MVLayoutView.control(node,{previewValue:'Mg'});host.append(...view.childNodes);document.body.append(host);
 try{
  const input=host.querySelector('input'),style=getComputedStyle(input),face=family(style.fontFamily),size=Number.parseFloat(style.fontSize);
  if(!face)throw Error('fonte sem calibração: '+style.fontFamily);
  const line=document.createElement('span');line.style.cssText='position:fixed;left:-20000px;top:0;display:inline-block;padding:0;margin:0;border:0;white-space:pre;visibility:hidden';
  line.style.font=style.font;line.style.lineHeight=style.lineHeight;line.append(document.createTextNode('Mg'));
  const marker=document.createElement('span');marker.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline;line-height:0';line.append(marker);document.body.append(line);
  try{
   const borderTop=parseFloat(style.borderTopWidth)||0,borderBottom=parseFloat(style.borderBottomWidth)||0,paddingTop=parseFloat(style.paddingTop)||0,paddingBottom=parseFloat(style.paddingBottom)||0;
   const lineBox=line.getBoundingClientRect(),box=input.getBoundingClientRect();
   return {face,size,left:(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.paddingLeft)||0),baseline:borderTop+paddingTop+(box.height-borderTop-borderBottom-paddingTop-paddingBottom-lineBox.height)/2+marker.getBoundingClientRect().top-lineBox.top};
  }finally{line.remove();}
 }finally{host.remove();}
}
// JasperParser.addLineWidth delegates to Integer.parseInt, including frame pens.
function normalizeTextSpacing(doc){let changed=0;for(const node of doc.querySelectorAll('[leading],TEXTFORMAT[LEADING]'))for(const key of node.tagName==='TEXTFORMAT'?['leading','LEADING']:['leading']){if(!node.hasAttribute(key))continue;const raw=node.getAttribute(key),value=Number(raw);if(!String(raw).trim()||!Number.isFinite(value)||!Number.isSafeInteger(Math.round(value)))throw Error('Entrelinhas inválidas em '+node.tagName+': '+raw);const next=String(Math.round(value));if(raw!==next){node.setAttribute(key,next);changed++;}}return changed;}
function normalizeFontSizes(doc){let changed=0;for(const node of doc.querySelectorAll('[fontSize],FONT[SIZE]')){for(const key of node.tagName==='FONT'?['fontSize','SIZE']:['fontSize']){if(!node.hasAttribute(key))continue;const raw=node.getAttribute(key),value=Number(raw);if(!String(raw).trim()||!Number.isFinite(value)||value<=0)throw Error('Tamanho de fonte inválido em '+node.tagName+': '+raw);const next=String(Math.max(1,Math.round(value)));if(raw!==next){node.setAttribute(key,next);changed++;}}}return changed;}
function normalizeLineWidths(doc){let changed=0;for(const node of doc.querySelectorAll('FRAME[lineThickness],HRULE[lineThickness],VRULE[lineThickness]')){const raw=node.getAttribute('lineThickness'),value=Number(raw);if(!String(raw).trim()||!Number.isFinite(value)||value<0)throw Error('Espessura de linha inválida em '+node.tagName+': '+raw);const next=String(Math.max(0,Math.min(30,Math.round(value))));if(raw!==next){node.setAttribute('lineThickness',next);changed++;}}return changed;}
async function prepare(doc){
 const backgrounds=globalThis.MVLayoutOperations?.normalizeTextBackgrounds(doc)||0;
 const policy=root.MVFontPolicy.normalizeDocument(doc);
 const result={families:policy.changed,fontReplacements:policy.replacements,backgrounds,pages:0,labels:0,runs:0,toggles:0,values:0,lines:normalizeLineWidths(doc),fonts:normalizeFontSizes(doc),spacing:normalizeTextSpacing(doc),skipped:[],already:0};
 if(doc.documentElement?.getAttribute('mvPageBreaks')!=='explicit-v1'){doc.documentElement?.setAttribute('mvPageBreaks','explicit-v1');result.pages=1;}
 for(const band of doc.querySelectorAll('BAND'))if(band.getAttribute('mvPageBreaks')!=='explicit-v1'){band.setAttribute('mvPageBreaks','explicit-v1');result.pages++;}
 if(document.fonts?.ready)await document.fonts.ready;
 for(const source of [...doc.querySelectorAll('LABEL')]){
  // Process static body labels separately; preserve linked headers/footers and expressions.
  let row=source.parentElement;while(row&&row.tagName!=='Row')row=row.parentElement;
  if(row?.getAttribute('pageSection')!=='pagebody')continue;
  if(prepared(source.getAttribute('mvPdfText'))){result.already++;continue;}
  const html=source.querySelector('htmlText');if(!html||!html.textContent.trim())continue;
  if(source.hasAttribute('id')||source.hasAttribute('key')||/\$[VPF]\{|&<|&lt;/.test(html.textContent)){result.skipped.push('Texto dinâmico preservado em y='+n(source,'y'));continue;}
  if(['backgroundColor','borderStyle'].some(key=>source.hasAttribute(key)&&!['','undefined','none'].includes(source.getAttribute(key)))){result.skipped.push('Caixa com fundo ou borda preservada em '+location(source));continue;}
  try{
   const runs=await measure(source);if(!runs.length)continue;
   const replacements=runs.map(run=>makeLabel(doc,source,run));
   for(const label of replacements)source.parentElement.insertBefore(label,source);
   source.remove();result.labels++;result.runs+=runs.length;
  }catch(error){result.skipped.push('Texto em '+location(source)+': '+error.message);}
 }
 for(const toggle of doc.querySelectorAll('CHECKBOX,RADIOBUTTON')){
  let row=toggle.parentElement;while(row&&row.tagName!=='Row')row=row.parentElement;
  if(row?.getAttribute('pageSection')==='pagebody'&&centerToggle(toggle))result.toggles++;
 }
 for(const field of doc.querySelectorAll('TEXT,DATE')){
  let row=field.parentElement;while(row&&row.tagName!=='Row')row=row.parentElement;
  if(row?.getAttribute('pageSection')!=='pagebody'||field.getAttribute('mvPdfValue')===VALUE_PROFILE)continue;
  if(!field.hasAttribute('id')||!['','left'].includes(field.getAttribute('textAlign')||''))continue;
  try{if(prepareValue(field,measureValue(field)))result.values++;}catch(error){result.skipped.push('Valor do campo '+field.getAttribute('id')+' em '+location(field)+': '+error.message);}
 }
 return result;
}
function confirmSaved(sent,saved,parse){
 const sentDoc=parse(sent),savedDoc=parse(saved);if(sentDoc.documentElement?.getAttribute('mvPageBreaks')==='explicit-v1'&&[...savedDoc.querySelectorAll('BAND')].some(b=>b.getAttribute('mvPageBreaks')!=='explicit-v1'))throw Error('O MV não confirmou as marcas de quebra explícita. Confira antes de imprimir.');
 function signature(xml){const doc=parse(xml);return [...doc.querySelectorAll('LABEL,CHECKBOX,RADIOBUTTON,TEXT,DATE')].filter(node=>node.hasAttribute('mvPdfText')||node.hasAttribute('mvPdfToggle')||node.hasAttribute('mvPdfValue')).map(node=>({
  tag:node.tagName,geometry:['x','y','width','height'].map(key=>n(node,key)),profile:node.getAttribute('mvPdfText')||node.getAttribute('mvPdfToggle')||node.getAttribute('mvPdfValue'),valueOffset:[node.getAttribute('mvPdfValueDx'),node.getAttribute('mvPdfValueDy')],id:node.getAttribute('id'),text:node.textContent,
  fonts:[...node.querySelectorAll('FONT')].map(font=>['FACE','SIZE','COLOR'].map(key=>font.getAttribute(key)))
 }));}
 if(JSON.stringify(signature(sent))!==JSON.stringify(signature(saved)))throw Error('O MV não confirmou todos os textos preparados para PDF. Alterações locais mantidas; confira o relatório antes de repetir.');
 return true;
}
root.MVPdfText={prepare,normalizeLineWidths,normalizeFontSizes,normalizeTextSpacing,alignPreview,centerToggle,prepareValue,VALUE_PROFILE,prepared,TOGGLE_PROFILE,confirmSaved,mergeGlyphs,makeLabel,ascent,family,PROFILE};if(typeof module!=='undefined')module.exports=root.MVPdfText;
})(globalThis);

/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
const allowed={TEXTFORMAT:['LEADING','LEFTMARGIN','RIGHTMARGIN','INDENT','BLOCKINDENT','TABSTOPS'],P:['ALIGN'],FONT:['FACE','SIZE','COLOR','LETTERSPACING','KERNING'],B:[],I:[],U:[],BR:[],UL:[],LI:[],SPAN:[]};
function attributes(tag,entries){return entries.filter(([name])=>(allowed[tag]||[]).includes(name.toUpperCase())).map(([name,value])=>[name.toUpperCase(),value]);}
// Native JasperParser reads FONT colors from the first TEXTFORMAT as one value.
// Keep one paragraph per format and remove empty sibling font runs from editing.
function normalize(html){
 let changes=0;
 for(const format of [...html.querySelectorAll('TEXTFORMAT')]){
  const paragraphs=[...format.children].filter(n=>n.tagName==='P');
  if(paragraphs.length>1&&[...format.childNodes].every(n=>n.nodeType===1?n.tagName==='P':!n.textContent.trim())){
   for(const p of paragraphs){const next=format.cloneNode(false);next.append(p);format.parentNode.insertBefore(next,format);}format.remove();changes++;
  }
 }
 for(const p of html.querySelectorAll('P')){
  const fonts=[...p.children].filter(n=>n.tagName==='FONT');
  if(fonts.length<2)continue;
  for(const font of fonts)if(font.textContent===''&&!font.querySelector('BR,LI,UL')){font.remove();changes++;}
 }
 return changes;
}
function repair(doc){let changes=0;for(const html of doc.querySelectorAll('LABEL > htmlText'))changes+=normalize(html);return changes;}
function toXML(content,source,doc){
 const html=doc.createElement('htmlText'),defaultFont=source?.querySelector('FONT'),defaultFormat=source?.querySelector('TEXTFORMAT');
 function walk(node,parent){if(node.nodeType===3){parent.append(doc.createTextNode(node.textContent));return;}if(node.nodeType!==1)return;
  let tag=node.dataset?.flashTag||({DIV:'P',STRONG:'B',EM:'I',SPAN:'FONT'}[node.tagName]||node.tagName);
  if(!(tag in allowed)){for(const child of node.childNodes)walk(child,parent);return;}
  const out=doc.createElement(tag);let entries=[];try{entries=JSON.parse(node.dataset?.flashAttrs||'[]');}catch{}
  for(const [name,value] of attributes(tag,entries))out.setAttribute(name,String(value));
  if(tag==='P'&&['left','right','center','justify'].includes(node.style.textAlign))out.setAttribute('ALIGN',node.style.textAlign.toUpperCase());
  if(tag==='FONT'){
   if(node.style.fontFamily)out.setAttribute('FACE',node.style.fontFamily.replace(/^['"]|['"]$/g,''));
   if(node.style.fontSize)out.setAttribute('SIZE',String(parseFloat(node.style.fontSize)));
   const c=node.style.color||'';if(/^#[a-f\d]{6}$/i.test(c))out.setAttribute('COLOR',c);else if(/^rgb\(/.test(c)){const rgb=c.match(/\d+/g);if(rgb?.length>=3)out.setAttribute('COLOR','#'+rgb.slice(0,3).map(v=>Number(v).toString(16).padStart(2,'0')).join(''));}
  }
  for(const child of node.childNodes)walk(child,out);parent.append(out);
 }
 for(const child of content.childNodes)walk(child,html);
 for(const p of html.querySelectorAll('P'))if(!p.querySelector('FONT')&&defaultFont){const f=doc.createElement('FONT');for(const a of defaultFont.attributes)if(allowed.FONT.includes(a.name.toUpperCase()))f.setAttribute(a.name,a.value);while(p.firstChild)f.append(p.firstChild);p.append(f);}
 // Browser-created paragraphs inherit the original leading instead of collapsing.
 for(const child of [...html.childNodes])if(child.nodeType===1&&child.tagName==='P'){const format=doc.createElement('TEXTFORMAT');if(defaultFormat)for(const a of defaultFormat.attributes)if(allowed.TEXTFORMAT.includes(a.name.toUpperCase()))format.setAttribute(a.name,a.value);html.insertBefore(format,child);format.append(child);}
 if(!html.querySelector('P')){const p=doc.createElement('P'),f=doc.createElement('FONT'),format=doc.createElement('TEXTFORMAT');if(defaultFont)for(const a of defaultFont.attributes)if(allowed.FONT.includes(a.name.toUpperCase()))f.setAttribute(a.name,a.value);if(defaultFormat)for(const a of defaultFormat.attributes)if(allowed.TEXTFORMAT.includes(a.name.toUpperCase()))format.setAttribute(a.name,a.value);while(html.firstChild)f.append(html.firstChild);let original=defaultFont;let container=f;while(original?.firstElementChild&&['B','I','U'].includes(original.firstElementChild.tagName)){original=original.firstElementChild;const mark=doc.createElement(original.tagName);while(container.firstChild)mark.append(container.firstChild);container.append(mark);container=mark;}p.append(f);format.append(p);html.append(format);}
 normalize(html);return html;
}
function fontState(nodes){
 const values=[];
 for(const node of nodes){
  const targets=['GROUP','SCREENGROUP'].includes(node.tagName)?[...node.querySelectorAll('LABEL,TEXT,TEXTAREA,DATE,COMBOBOX,CHECKBOX,RADIOBUTTON')]:[node];
  for(const target of targets){
   if(!['LABEL','TEXT','TEXTAREA','DATE','COMBOBOX','CHECKBOX','RADIOBUTTON','BUTTON'].includes(target.tagName))continue;
   const fonts=target.tagName==='LABEL'?[...target.querySelectorAll('FONT')]:[];
   for(const font of fonts.length?fonts:[null])values.push({
    family:font?.getAttribute('FACE')||target.getAttribute('fontFamily')||'Verdana',
    size:Number(font?.getAttribute('SIZE')||target.getAttribute('fontSize')||10)
   });
  }
 }
 const families=new Map(values.map(v=>[v.family.toLowerCase(),v.family])),sizes=new Set(values.map(v=>v.size));
 return {active:values.length>0,family:families.size===1?[...families.values()][0]:null,size:sizes.size===1?[...sizes][0]:null};
}
root.MVInlineText={toXML,attributes,normalize,repair,fontState};if(typeof module!=='undefined')module.exports=root.MVInlineText;
})(globalThis);

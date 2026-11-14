/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(root){
'use strict';
const number=(n,k,f=0)=>n.hasAttribute(k)?Number(n.getAttribute(k)):f;
function group(nodes){
 if(nodes.length<2)throw Error('Selecione dois ou mais objetos com Ctrl + clique.');
 const parent=nodes[0].parentElement;
 if(!nodes.every(n=>n.parentElement===parent))throw Error('Selecione objetos do mesmo contêiner.');
 const ordered=[...parent.children].filter(n=>nodes.includes(n));
 const x=Math.min(...ordered.map(n=>number(n,'x'))),y=Math.min(...ordered.map(n=>number(n,'y')));
 const right=Math.max(...ordered.map(n=>number(n,'x')+number(n,'width',150))),bottom=Math.max(...ordered.map(n=>number(n,'y')+number(n,'height',25)));
 const g=parent.ownerDocument.createElement('GROUP');
 for(const [key,value] of Object.entries({x,y,width:right-x,height:bottom-y}))g.setAttribute(key,String(value));
 parent.insertBefore(g,ordered[0]);
 for(const n of ordered){n.setAttribute('x',String(number(n,'x')-x));n.setAttribute('y',String(number(n,'y')-y));g.append(n);}let checked=false;for(const n of ordered.filter(n=>n.tagName==='RADIOBUTTON')){const answer=[...n.children].find(c=>c.tagName==='answer');if(n.getAttribute('selected')==='true'||answer?.textContent==='true'){if(checked){n.setAttribute('selected','false');if(answer)answer.textContent='false';}checked=true;}}return g;
}
function ungroup(g){
 if(!['GROUP','SCREENGROUP'].includes(g.tagName))throw Error('Selecione um grupo para desagrupar.');
 const parent=g.parentElement,children=[...g.children];
 for(const n of children){n.setAttribute('x',String(number(n,'x')+number(g,'x')));n.setAttribute('y',String(number(n,'y')+number(g,'y')));parent.insertBefore(n,g);}g.remove();return children;
}
function layer(n,mode){const p=n.parentElement;if(mode==='front')p.append(n);else if(mode==='back')p.insertBefore(n,p.firstElementChild);else if(mode==='up'&&n.nextElementSibling)n.nextElementSibling.after(n);else if(mode==='down'&&n.previousElementSibling)p.insertBefore(n,n.previousElementSibling);}
function framesBehind(root){
 for(const child of [...root.children])framesBehind(child);
 if(!['Column','GROUP','SCREENGROUP'].includes(root.tagName))return;
 const children=[...root.children],frames=children.filter(n=>n.tagName==='FRAME');
 if(!frames.length)return;
 for(const n of [...frames,...children.filter(n=>n.tagName!=='FRAME')])root.append(n);
}
function placeFrame(n){const parent=n.parentElement;if(n.tagName!=='FRAME'||!parent)return;const first=[...parent.children].find(c=>c.tagName!=='FRAME');if(first)parent.insertBefore(n,first);}
function radioPeers(n){return ['GROUP','SCREENGROUP'].includes(n.parentElement?.tagName)?[...n.parentElement.children].filter(c=>c.tagName==='RADIOBUTTON'&&c!==n):[];}
function selectionRoots(nodes){const unique=[...new Set(nodes)];return unique.filter(n=>{for(let p=n.parentElement;p;p=p.parentElement)if(unique.includes(p))return false;return true;});}
function translate(nodes,dx,dy,origins,validate=()=>{}){
 nodes=selectionRoots(nodes);if(!nodes.length)return [];
 const source=n=>origins?.get(n)||{x:number(n,'x'),y:number(n,'y')};
 const horizontal=nodes.filter(n=>n.tagName!=='BAND');
 if(horizontal.length)dx=Math.max(dx,-Math.min(...horizontal.map(n=>source(n).x)));
 dy=Math.max(dy,-Math.min(...nodes.map(n=>source(n).y)));
 const plan=nodes.map(node=>({node,x:node.tagName==='BAND'?0:source(node).x+dx,y:source(node).y+dy}));
 for(const p of plan){const adjusted=validate(p.node,p.x,p.y);if(adjusted&&Number.isFinite(adjusted.y))p.y=adjusted.y;}
 for(const p of plan){if(p.node.tagName!=='BAND')p.node.setAttribute('x',String(p.x));p.node.setAttribute('y',String(p.y));}
 return plan;
}
function dimension(n,key){return number(n,key,['CHECKBOX','RADIOBUTTON'].includes(n.tagName)?14:key==='width'?150:25);}
function alignToFirst(nodes,direction){
 nodes=selectionRoots(nodes);
 if(nodes.length<2)throw Error('Selecione primeiro a referência e depois os demais objetos com Shift + clique.');
 const modes={horizontal:['y',0,'height'],vertical:['x',0,'width'],top:['y',0,'height'],middle:['y',0.5,'height'],bottom:['y',1,'height'],left:['x',0,'width'],center:['x',0.5,'width'],right:['x',1,'width']};
 if(!modes[direction])throw Error('Direção de alinhamento inválida.');
 if(nodes.some(n=>n.tagName==='BAND'))throw Error('Quebras de página têm limites próprios e não podem participar deste alinhamento.');
 const columnOf=n=>{for(let p=n.parentElement;p;p=p.parentElement)if(p.tagName==='Column')return p;return null;};
 const column=columnOf(nodes[0]);
 if(!column||nodes.some(n=>columnOf(n)!==column))throw Error('Selecione objetos na mesma coluna de edição.');
 const [axis,factor,size]=modes[direction];
 const parentOffset=n=>{let offset=0;for(let p=n.parentElement;p&&p!==column;p=p.parentElement)offset+=number(p,axis);return offset;};
 const reference=number(nodes[0],axis)+parentOffset(nodes[0])+dimension(nodes[0],size)*factor;
 const plan=nodes.slice(1).map(node=>({node,value:reference-parentOffset(node)-dimension(node,size)*factor}));
 if(!Number.isFinite(reference)||plan.some(p=>!Number.isFinite(p.value)||p.value<0))throw Error('O alinhamento colocaria um objeto fora do seu grupo. Selecione o grupo inteiro para movê-lo.');
 for(const p of plan)p.node.setAttribute(axis,String(p.value));
 return {reference:nodes[0],axis,plan};
}
function matchSizeToFirst(nodes,mode){
 nodes=selectionRoots(nodes);
 if(nodes.length<2)throw Error('Selecione primeiro a caixa modelo e depois as demais com Shift + clique.');
 const keys=mode==='height'?['height']:mode==='width'?['width']:mode==='both'?['width','height']:null;
 if(!keys)throw Error('Opção de tamanho inválida.');
 if(nodes.some(n=>['BAND','GROUP','SCREENGROUP'].includes(n.tagName)))throw Error('Selecione caixas individuais. Para redimensionar uma tabela ou grupo, use a alça do conjunto.');
 const values=Object.fromEntries(keys.map(key=>[key,dimension(nodes[0],key)]));
 if(Object.values(values).some(v=>!Number.isFinite(v)||v<=0))throw Error('A caixa modelo precisa ter tamanho positivo.');
 for(const node of nodes.slice(1))for(const [key,value] of Object.entries(values))node.setAttribute(key,String(value));
 return {reference:nodes[0],values};
}
function identitiesAllowed(actual,allowed){const counts=new Map();for(const v of allowed)counts.set(v,(counts.get(v)||0)+1);for(const v of actual){const count=counts.get(v)||0;if(!count)return false;counts.set(v,count-1);}return true;}
// A native FRAME behind a LABEL, moved as a single native GROUP.
function textBackgroundOwner(n){for(let p=n;p;p=p.parentElement)if(p.tagName==='GROUP'&&p.getAttribute('mvTextBackground')==='native-v1')return p;return null;}
function syncTextBackground(g){if(g?.getAttribute('mvTextBackground')!=='native-v1')return;for(const child of g.children)for(const k of ['width','height'])child.setAttribute(k,g.getAttribute(k));}
function wrapTextBackground(n){if(n.tagName!=='LABEL'||!/^\d+$/.test(n.getAttribute('backgroundColor')||''))return n;const existing=textBackgroundOwner(n);if(existing){existing.children[0].setAttribute('backgroundColor',n.getAttribute('backgroundColor'));existing.children[0].setAttribute('lineColor',n.getAttribute('backgroundColor'));n.removeAttribute('backgroundColor');return existing;}const doc=n.ownerDocument,g=doc.createElement('GROUP'),frame=doc.createElement('FRAME');for(const k of ['x','y','width','height'])g.setAttribute(k,n.getAttribute(k)||(['width','height'].includes(k)?(k==='width'?'150':'25'):'0'));g.setAttribute('mvTextBackground','native-v1');for(const [k,v] of Object.entries({x:0,y:0,width:g.getAttribute('width'),height:g.getAttribute('height'),lineThickness:0,lineColor:n.getAttribute('backgroundColor'),backgroundColor:n.getAttribute('backgroundColor')}))frame.setAttribute(k,v);n.parentElement.insertBefore(g,n);g.append(frame);g.append(n);n.removeAttribute('backgroundColor');n.setAttribute('x','0');n.setAttribute('y','0');return g;}
function normalizeTextBackgrounds(doc){let changed=0;for(const n of [...doc.querySelectorAll('LABEL[backgroundColor]')])if(wrapTextBackground(n)!==n)changed++;return changed;}
root.MVLayoutOperations={textBackgroundOwner,syncTextBackground,wrapTextBackground,normalizeTextBackgrounds,group,ungroup,layer,radioPeers,framesBehind,placeFrame,selectionRoots,translate,alignToFirst,matchSizeToFirst,identitiesAllowed};
})(typeof window==='undefined'?globalThis:window);

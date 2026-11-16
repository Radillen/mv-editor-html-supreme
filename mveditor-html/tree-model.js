/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
function itemFromNode(node){
 if(!node||typeof node!=='object')throw Error('Nó de repositório inválido.');
 const instance=node.instance;
 const item=Object.assign(Object.create(null),instance||{});
 const type=node.itemType==='LAY'?'mv.editor.core.data.Layout':instance?.$amfType||node.$amfType||'mv.editor.core.data.Item';
 root.MVAMF.type(item,type);
 for(const key of ['id','name','itemType','iconName','parentItemId','key','active'])if(Object.prototype.hasOwnProperty.call(node,key))item[key]=node[key];
 if(!item.itemType)throw Error('O item recebido do MV não informa seu tipo.');
 return item;
}
const fieldKinds={TEXT:'text',TEXTINPUT:'text',TEXTAREA:'textarea',COMBOBOX:'select',CHECKBOX:'checkbox',RADIOBUTTON:'radio',DATE:'date',DATA:'date',DATAHORA:'date',NUMERICO:'number',IMAGE:'image',MARCACAOIMAGEM:'image',BARCODE:'barcode',BUTTON:'button',GRID:'grid',DATAGRID:'grid'};
function fieldKind(node){const candidates=[node.instance?.displayType?.data,node.displayType?.data,node.iconName,node.itemType];for(const value of candidates){const key=String(value||'').toUpperCase();if(fieldKinds[key])return fieldKinds[key];for(const type of Object.keys(fieldKinds).sort((a,b)=>b.length-a.length))if(key.endsWith('_'+type))return fieldKinds[type];}return null;}
function expandable(node){const cls=(node.instance?.$amfType||node.$amfType||'').split('.').pop();if(['Field','Rule','Parameter'].includes(cls)||fieldKind(node)||['CAM','REG','PAR'].includes(node.itemType))return false;return ['Group','Document','Version','Layout'].includes(cls)||/^(R_|G_|T_|A_|VER)/.test(node.itemType||'')||['DOC','LAY','CAB','ROD'].includes(node.itemType);}
const list=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
function searchText(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function filterFields(nodes,query){
 const term=searchText(query);if(!term)return list(nodes);
 const result=[];
 for(const node of list(nodes)){
  const children=filterFields(node.children||node.items,term);
  if(expandable(node)){
   if(children.length)result.push({...node,children,...('items' in node?{items:children}:{})});
  }else{
   const cls=(node.instance?.$amfType||node.$amfType||'').split('.').pop();
   if((fieldKind(node)||['CAM','PAR'].includes(node.itemType)||['Field','Parameter'].includes(cls))&&searchText(node.name||node.instance?.name).includes(term))result.push({...node});
  }
 }
 return result;
}
// The native search expands only the first branch. Resolve lazy folders before pruning.
async function searchFields(nodes,query,read){
 const seen=new Set();
 async function visit(values,parentId){
  const result=[];
  for(const original of list(values)){
   const node={...original};if(node.parentItemId==null&&parentId!=null)node.parentItemId=parentId;
   if(expandable(node)){
    const identity=String(node.itemType)+':'+String(node.id);
    if(seen.has(identity))continue;seen.add(identity);
    let children=list(node.children||node.items);
    if(!children.length){const fresh=await read(node,query);children=list(fresh?.items||fresh?.children);}
    node.children=await visit(children,node.id);if('items' in node)node.items=node.children;
   }
   result.push(node);
  }
  return result;
 }
 return filterFields(await visit(nodes),query);
}
function iconKind(node){const field=fieldKind(node);if(field)return field;const type=String(node.itemType||'');if(type.startsWith('VER'))return String(node.iconName||'').includes('PUBLISHED')||node.instance?.published?'published':'version';if(type==='DOC')return 'document';if(type==='LAY'||type==='CAB'||type==='ROD'){const mode=node.instance?.layoutType?.data||node.layoutType?.data;return mode==='RELATORIO'||/relat[oó]rio/i.test(node.name||'')?'report':'screen';}if(type==='REG')return 'rule';if(type==='PAR')return 'parameter';if(type==='CAM'||(node.instance?.$amfType||'').endsWith('.Field'))return 'field';if(type.startsWith('R_'))return 'repository';return 'folder';}
root.MVTreeModel={itemFromNode,expandable,iconKind,fieldKind,filterFields,searchFields};if(typeof module!=='undefined')module.exports=root.MVTreeModel;
})(globalThis);

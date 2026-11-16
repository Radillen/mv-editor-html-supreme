/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
const list=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const key=(parent,node)=>parent+'/'+String(node.itemType||'')+':'+String(node.id);
function remove(nodes,item){return list(nodes).filter(n=>!(n.itemType===item.itemType&&String(n.id)===String(item.id))).map(n=>{const copy={...n};for(const k of ['children','items'])if(Array.isArray(n[k])||Array.isArray(n[k]?.source))copy[k]=remove(n[k],item);return copy;});}
function create(){const open=new Map(),scroll=new Map(),horizontal=new Map(),active=new Map();return {open,scroll,horizontal,active,key,
 capture(tab,container,scroller){if(!tab)return;for(const d of container.querySelectorAll('details[data-tree-key]'))open.set(tab+d.dataset.treeKey,d.open);const selected=container.querySelector('.active[data-tree-key]');if(selected)active.set(tab,selected.dataset.treeKey);scroll.set(tab,scroller.scrollTop);horizontal.set(tab,scroller.scrollLeft||0);},
 async refresh(previous,incoming,read,expandable,onError=()=>{}){
  const next=this.merge(previous,incoming,true);let reads=0;
  const walk=async(nodes,parentPath='')=>{for(const node of list(nodes)){
   const path=key(parentPath,node),wasOpen=this.isOpen('fields',path)||this.isOpen('documents',path);
   if(wasOpen&&!String(node.itemType||'').startsWith('R_')&&expandable(node)&&reads++<100){
    try{const fresh=await read(node);if(fresh&&(fresh.items!=null||fresh.children!=null)){
     // A parent refresh returns shallow children. Keep each surviving child's
     // loaded descendants before walking its remembered open path.
     node.children=this.merge(node.children||node.items,fresh.items||fresh.children,true);
    }}catch(error){onError(error);}
   }
   if(wasOpen||String(node.itemType||'').startsWith('R_'))await walk(node.children||node.items,path);
  }};await walk(next);return next;
 },
 isOpen(tab,path,fallback=false){return open.has(tab+path)?open.get(tab+path):fallback;},
 merge(previous,incoming,preserveLazyEmpty=false){const merge=(old,fresh)=>list(fresh).map(node=>{const match=list(old).find(p=>p.itemType===node.itemType&&String(p.id)===String(node.id)),children=list(node.children||node.items),hasChildren=Array.isArray(node.children)||Array.isArray(node.children?.source)||Array.isArray(node.items)||Array.isArray(node.items?.source),oldChildren=list(match?.children||match?.items);return {...node,...(hasChildren?{children:preserveLazyEmpty&&!children.length&&oldChildren.length?oldChildren:merge(oldChildren,children)}:oldChildren.length?{children:oldChildren}:{})};});return merge(previous,incoming);}
};}
root.MVRepositoryState={create,key,remove};if(typeof module!=='undefined')module.exports=root.MVRepositoryState;
})(globalThis);

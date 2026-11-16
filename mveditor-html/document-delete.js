/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
const array=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
async function plan(client,item){
 if(item?.itemType!=='DOC')throw Error('Selecione um documento.');
 const document=await client.refresh(item),versions=[];
 for(const node of array(document.items||document.children)){
  if(!String(node.itemType||'').startsWith('VER'))throw Error('O documento possui uma estrutura inesperada. A exclusão não foi enviada.');
  const version=await client.refresh(root.MVTreeModel.itemFromNode(node));
  if(!version||!String(version.itemType||'').startsWith('VER'))throw Error('Não foi possível conferir uma versão. A exclusão não foi enviada.');
  if(version.published===true||/HIST|PUBLIC/i.test(String(version.type||'')))throw Error('O documento possui versão publicada ou histórica ('+(version.name||version.id)+'). O MV restringe a exclusão dessas versões.');
  if(version.document?.id!=null&&String(version.document.id)!==String(document.id))throw Error('Vínculo de versão inconsistente. Exclusão interrompida.');
  versions.push(version);
 }
 return {document,versions};
}
async function execute(client,approved){
 const fresh=await plan(client,approved.document);
 const ids=p=>p.versions.map(v=>String(v.id)).sort().join(',');
 if(ids(fresh)!==ids(approved))throw Error('As versões mudaram após a confirmação. Reabra a exclusão.');
 let completed=0;
 try{
  for(const version of fresh.versions){await client.call('itemResource','deleteItem',[version]);completed++;}
  await client.call('itemResource','deleteItem',[fresh.document]);
 }catch(error){throw Error(error.message+' • Versões processadas nesta tentativa: '+completed+'. Confira o documento antes de tentar novamente.');}
 return fresh.document;
}
root.MVDocumentDelete={plan,execute};if(typeof module!=='undefined')module.exports=root.MVDocumentDelete;
})(globalThis);

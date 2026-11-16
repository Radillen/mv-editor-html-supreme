/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
const array=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const folder=n=>['R_REP_DOC','G_REP_DOC','T_DOC','A_DOC'].includes(n.itemType);
async function copy(client,source,destination){
 if(source?.itemType!=='DOC')throw Error('Selecione um documento, não a Tela ou o Relatório.');
 if(!folder(destination))throw Error('Selecione uma pasta de documentos como destino.');
 const before=await client.refresh(destination);
 const ids=new Set(array(before.items||before.children).filter(n=>n.itemType==='DOC').map(n=>String(n.id)));
 const options=root.MVAMF.type({copy:true,includeFields:true,published:false},'mv.editor.core.data.ExportFilterOptions');
 await client.call('itemResource','pasteItem',[before,source,options]);
 const after=await client.refresh(destination);
 const created=array(after.items||after.children).filter(n=>n.itemType==='DOC'&&!ids.has(String(n.id)));
 if(created.length!==1)throw Error('A cópia foi enviada ao MV, mas não foi possível identificar um único documento novo. Confira a pasta de destino antes de repetir.');
 if(String(created[0].id)===String(source.id))throw Error('O MV não retornou um novo código. Confira a pasta antes de repetir.');
 return created[0];
}
function open({client,source,onCopied}){
 if(source?.itemType!=='DOC')throw Error('Selecione o documento na árvore antes de copiar.');
 const d=document.createElement('dialog');d.className='copyDocumentDialog';d.innerHTML='<h2>Copiar documento</h2><p class="copySource"></p><p>Escolha a pasta de destino:</p><div class="copyFolders"></div><p class="copyDestination">Nenhuma pasta selecionada</p><p class="copyMessage" role="status"></p><button class="copySubmit" disabled>Criar cópia nesta pasta</button><button class="copyCancel">Cancelar</button>';document.body.append(d);
 const folders=d.querySelector('.copyFolders'),message=d.querySelector('.copyMessage'),submit=d.querySelector('.copySubmit'),cancel=d.querySelector('.copyCancel');
 d.querySelector('.copySource').textContent='Origem: '+source.name+' • código '+source.id;
 let destination=null,attempted=false;
 function add(nodes,parent,path='') {for(const n of array(nodes).filter(folder)){const details=document.createElement('details'),summary=document.createElement('summary'),label=document.createElement('span'),choose=document.createElement('button'),box=document.createElement('div');label.textContent=n.name||n.itemType;summary.append(label);choose.type='button';choose.textContent='Selecionar';choose.onclick=event=>{event.stopPropagation();destination=n;d.querySelector('.copyDestination').textContent='Destino: '+path+(n.name||'');submit.disabled=attempted;};summary.append(choose);details.append(summary,box);parent.append(details);let loaded=false,loading=false;details.addEventListener('toggle',async()=>{if(!details.open||loaded||loading)return;loading=true;message.textContent='Carregando pastas…';try{const group=await client.refresh(root.MVTreeModel.itemFromNode(n));add(group.items||group.children,box,path+(n.name||'')+' / ');loaded=true;message.textContent='';}catch(e){message.textContent=e.message;}finally{loading=false;}});}}
 cancel.onclick=()=>d.close();d.addEventListener('close',()=>d.remove());
 submit.onclick=async()=>{if(attempted||!destination)return;attempted=true;submit.disabled=true;cancel.disabled=true;message.textContent='Criando cópia pelo MV…';try{const target=root.MVTreeModel.itemFromNode(destination);const created=await copy(client,source,target);message.textContent='Cópia criada • novo código: '+created.id;await onCopied(created,target);d.close();}catch(e){message.textContent=e.message+' Não repita sem conferir a pasta de destino.';}finally{cancel.disabled=false;}};
 d.showModal();message.textContent='Carregando repositório de documentos…';client.list().then(nodes=>{add(array(nodes).filter(n=>n.itemType==='R_REP_DOC'),folders);message.textContent='';}).catch(e=>message.textContent=e.message);
}
root.MVDocumentCopy={copy,open,folder};if(typeof module!=='undefined')module.exports=root.MVDocumentCopy;
})(globalThis);

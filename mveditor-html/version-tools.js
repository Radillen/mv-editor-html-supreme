/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(root){
'use strict';
const array=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const isVersion=v=>/^VER/.test(v?.itemType||'')||(v?.$amfType||'').endsWith('.Version');
const status=v=>v?.published===true?'PUBLICADA':String(v?.type?.data||v?.type||'').toUpperCase();
const canDelete=v=>isVersion(v)&&status(v)==='TESTE';
const canCreate=v=>/^(R_|G_|T_|A_)/.test(v?.itemType||'')&&v.itemType!=='G_VER_CAM';
async function deletionPlan(client,item){if(!isVersion(item))throw Error('Selecione uma versão.');const version=await client.refresh(item);if(Number(version?.id)!==Number(item.id)||!canDelete(version))throw Error('Somente versões em teste podem ser excluídas. Ativo não significa Publicado.');const documentId=Number(version.parentItemId||version.document?.id);if(Number(version.parentItemId)&&Number(version.document?.id)&&Number(version.parentItemId)!==Number(version.document.id))throw Error('O vínculo da versão com o documento está inconsistente.');if(!Number.isSafeInteger(documentId)||documentId<=0)throw Error('O MV não informou o documento da versão.');return {version,documentId};}
async function deleteVersion(client,approved){const fresh=await deletionPlan(client,approved.version);if(Number(fresh.documentId)!==Number(approved.documentId))throw Error('O vínculo da versão mudou.');await client.call('itemResource','deleteItem',[fresh.version]);const document=await client.refresh(root.MVAMF.type({id:fresh.documentId,itemType:'DOC'},'mv.editor.core.data.Document'));if(!document||document.items==null&&document.children==null)throw Error('Exclusão enviada. Atualize a árvore antes de repetir.');if(array(document.items||document.children).some(n=>Number(n.id)===Number(fresh.version.id)))throw Error('A versão ainda foi retornada pelo MV. Não repita a exclusão sem conferir.');return fresh.version;}
async function duplicate(client,item){const fresh=await client.refresh(item);if(!isVersion(fresh)||status(fresh)!=='PUBLICADA')throw Error('Selecione a versão publicada para gerar uma nova versão de teste.');await client.call('versionResource','duplicateVersion',[fresh]);return fresh;}
root.MVVersionTools={isVersion,status,canDelete,canCreate,deletionPlan,deleteVersion,duplicate};if(typeof module!=='undefined')module.exports=root.MVVersionTools;
})(globalThis);

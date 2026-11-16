/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
function content(layout,id){if(!layout||Number(layout.id)!==Number(id)||!Number.isSafeInteger(Number(id))||Number(id)<=0)throw Error('O MV não retornou o layout solicitado ('+id+').');if(layout.content!=null&&typeof layout.content!=='string')throw Error('O MV retornou conteúdo de layout inválido.');if(typeof layout.content==='string'&&layout.content.trim())return layout.content;const width=768,height=960;return '<Application><Page width="'+width+'" pageNumber="1"><Row height="'+height+'" pageSection="pagebody"><Column width="'+width+'"/></Row></Page></Application>';}
root.MVLayoutContent={content};if(typeof module!=='undefined')module.exports=root.MVLayoutContent;
})(globalThis);

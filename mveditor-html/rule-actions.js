/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
/* Action dispatch follows EditorBuilder.processRuleActions. No rule SQL executes here. */
(function(root){
'use strict';
function apply(actions,adapter){
 const rows=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
 const unsupported=[];let valid=true;
 adapter.clearValidation();
 for(const a of rows(actions?.toAnswer))adapter.answer(String(a.data),a.label);
 for(const a of rows(actions?.toEnable))adapter.enable(String(a.data),a.label==='true');
 for(const a of rows(actions?.toValidate)){valid=false;adapter.validation(String(a.data),a.label);}
 for(const a of rows(actions?.toFilter)){if(!adapter.filter||adapter.filter(String(a.data),a.label)===false)unsupported.push('Filtro do campo '+a.data);}
 return {valid,unsupported};
}
root.MVRuleActions={apply};if(typeof module!=='undefined')module.exports=root.MVRuleActions;
})(globalThis);

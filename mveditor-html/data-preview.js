/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Runtime-only data preview. No answer is inserted into the editable XML. */
(function(root){
'use strict';
const list=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const types=['TEXT','TEXTAREA','DATE','COMBOBOX'];
function createStore(){let epoch=0,scope='',values=new Map();return {
 begin(next){scope=String(next);values.clear();return ++epoch;},ticket:()=>epoch,scope:()=>scope,
 put(ticket,id,value){if(ticket!==epoch)return false;values.set(String(id),String(value??''));return true;},
 get(node){return types.includes(node.tagName)?values.get(String(node.getAttribute('id'))):undefined;},
 clear(){values.clear();epoch++;},size:()=>values.size
};}
function answers(doc){return [...doc.querySelectorAll(types.join(','))].flatMap(node=>{const answer=[...node.children].find(n=>n.tagName==='answer');return answer?[{id:node.getAttribute('id'),value:answer.textContent}]:[];});}
function scalarValue(response,parse){
 if(response?.errorMessage)throw Error(String(response.errorMessage));
 const doc=parse(String(response?.rows||'<rows/>'));
 if(doc.querySelector('parsererror'))throw Error('O MV retornou um resultado de prévia inválido.');
 const rows=[...doc.querySelectorAll('row')];if(rows.length>1)throw Error('A consulta retornou várias linhas; a prévia deste campo precisa de um único valor.');
 if(!rows.length)return '';
 const row=rows[0];return row.children.length?row.children[0].textContent:row.attributes.length?row.attributes[0].value:row.textContent;
}
function fieldSQL(field,config){return list(config?.propertyConfigurations).filter(p=>p.type==='SQL').map(p=>{
 const owner=p.dynamic?list(field.dynamicProperties).find(d=>d.name===p.name):field;
 return {name:p.name,sql:String((p.dynamic?owner?.value:owner?.[p.name])??'')};
 }).filter(p=>/^\s*(select|with)\b/i.test(p.sql));}
root.MVDataPreviewModel={createStore,answers,scalarValue,fieldSQL};if(typeof module!=='undefined')module.exports=root.MVDataPreviewModel;
if(typeof document==='undefined'||!document.getElementById('editingTools'))return;
const $=id=>document.getElementById(id),store=createStore(),localFields=new Map();let enabled=true,params=null,layoutId=null;
const bar=document.createElement('div');bar.className='editorDataPreview';bar.innerHTML='<label><input type="checkbox" id="editorPreviewData"> Prévia dos dados</label><button id="editorPreviewParams">Parâmetros da prévia…</button><button id="editorPreviewUseTest">Usar parâmetros do Teste</button><button id="editorPreviewRefresh">Atualizar dados</button><span id="editorPreviewStatus" role="status">Somente visualização</span>';$('editingTools').append(bar);
const info=s=>$('editorPreviewStatus').textContent=s;
const client=()=>root.MVGetClient();
function context(){return root.MVEditor.context();}
function eligible(){const c=context();return !!c.id&&!!c.documentId&&c.layoutType?.data!=='RELATORIO';}
function typed(rows){return root.MVAMF.type(list(rows).map(p=>root.MVAMF.type({data:p.data,label:p.label??null},'mv.editor.core.data.DataLabel')),'flex.messaging.io.ArrayCollection');}
function parameters(){const rows=list(params||root.MVTestParameters.current()).map(p=>({data:p.data,label:p.label})),c=context();const map=new Map(rows.map(p=>[p.data,p.label]));map.set('PAR_CD_DOCUMENTO',String(c.documentId));if(!map.get('PAR_SISTEMA'))map.set('PAR_SISTEMA','MVPEP');if(!map.get('PAR_INTERNO_MODO_VERSAO'))map.set('PAR_INTERNO_MODO_VERSAO','TESTE');return typed([...map].map(([data,label])=>({data,label})));}
function label(){const value=list(params||root.MVTestParameters.current()).find(p=>p.data==='PAR_CD_ATENDIMENTO')?.label;return 'Prévia'+(value?' • atendimento '+value:'');}
function paint(){root.MVEditor.repaint();}
function controls(){const active=eligible();$('editorPreviewData').checked=active&&enabled;$('editorPreviewData').disabled=!active;for(const id of ['editorPreviewParams','editorPreviewUseTest'])$(id).disabled=!active;$('editorPreviewRefresh').disabled=!active||!enabled;}
async function refresh(){
 controls();if(!enabled||!eligible())return;
 const c=context(),ticket=store.begin(c.id);paint();info('Carregando '+label().toLowerCase()+'…');
 try{
  const values=parameters(),layout=await client().call('documentResource','getDefaultLayout',[Number(c.documentId),values]);
  if(ticket!==store.ticket()||String(context().id)!==String(c.id))return;
  if(String(layout?.id)!==String(c.id))throw Error('O MV retornou outra versão da Tela. Use os parâmetros do Teste da mesma versão.');
  const xml=root.MVEditor.parse(layout.content),actions=await client().call('ruleResource','applyRulesByLayoutId',[Number(c.id),layout.content,values]);
  if(ticket!==store.ticket())return;
  for(const item of answers(xml))store.put(ticket,item.id,item.value);
  for(const item of list(actions?.toAnswer))store.put(ticket,item.data,item.label);
  for(const field of localFields.values()){if(ticket!==store.ticket())return;await fieldChanged(field);}
  if(ticket!==store.ticket())return;
  paint();info(label()+' • '+store.size()+' valores • não gravados no layout');
 }catch(error){if(ticket===store.ticket()){info('Prévia indisponível: '+error.message);paint();}}
}
async function fieldChanged(field){
 if(!eligible()||!types.includes(field.displayType?.data)||!root.MVEditor.hasField(field.id))return;localFields.set(String(field.id),field);if(!enabled)return;
 const ticket=store.ticket(),c=context(),definition=root.MVPreviewFieldDefinition?.(field),sql=fieldSQL(field,definition);
 if(!sql.length)return;
 if(!['TEXT','TEXTAREA','DATE'].includes(field.displayType?.data)){info(label()+' • salve e atualize os dados para carregar a nova lista');return;}
 try{
  const action=sql.find(p=>/a[cç][aã]o|action/i.test(p.name))||sql[0];
  const response=await client().call('itemResource','executeAction',[action.sql,field,parameters(),action.name]);
  if(ticket!==store.ticket()||String(context().id)!==String(c.id))return;
  let value=scalarValue(response,text=>new DOMParser().parseFromString(text,'application/xml'));
  if(field.displayType.data==='DATE'&&/^\d{4}-\d{2}-\d{2}/.test(value))value=value.slice(8,10)+'/'+value.slice(5,7)+'/'+value.slice(0,4);
  store.put(ticket,field.id,value);paint();info(label()+' • valor do novo campo carregado');
 }catch(error){if(ticket===store.ticket())info('Prévia do campo: '+error.message);}
}
$('editorPreviewData').onchange=()=>{enabled=$('editorPreviewData').checked;if(enabled){if(!params)params=typed(root.MVTestParameters.current());refresh();}else{store.clear();paint();controls();info('Prévia desativada');}};
$('editorPreviewRefresh').onclick=refresh;
$('editorPreviewUseTest').onclick=()=>{params=typed(root.MVTestParameters.current());store.clear();paint();if(enabled)refresh();else info('Parâmetros do Teste copiados. Ative a prévia para visualizar.');};
$('editorPreviewParams').onclick=()=>root.MVTestParameters.open({values:params||root.MVTestParameters.current(),onApply:async values=>{params=typed(values);store.clear();paint();if(enabled)await refresh();else info('Parâmetros da prévia atualizados.');},onCancel(){}}).catch(error=>info(error.message));
document.addEventListener('mv-layout-load',()=>{const c=context();{if(String(layoutId)!==String(c.id))localFields.clear();layoutId=c.id;store.clear();if(!eligible()){info('Prévia disponível na Tela');}else if(enabled)refresh();else info('Somente visualização');}controls();});
root.MVDataPreview={refresh,fieldChanged};root.MVEditor.setDataPreview(node=>enabled&&eligible()&&String(store.scope())===String(context().id)?store.get(node):undefined);controls();
})(globalThis);

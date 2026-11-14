/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* AddTemplateTextView INDIVIDUAL_TEMPLATE_STATE, using the original MV service. */
(function(root){
'use strict';
const list=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const enabled=n=>['TEXT','TEXTAREA'].includes(n.tagName)&&n.getAttribute('useTemplateText')==='true';
function service(client,id,parameters){
 if(!Number.isSafeInteger(Number(id))||Number(id)<=0)throw Error('O campo não possui um vínculo válido no MV.');
 const field=MVAMF.type({id:Number(id)},'mv.editor.core.data.Field');
 return {
  list:async(filter,page)=>list(await client.call('templateTextResource','listIndividualTemplateTextByFilter',[field,filter,parameters,page,50])),
  save:async(selected,text)=>{
   if(!text.trim())throw Error('Digite a descrição do texto padrão.');
   if(selected?.isCommon===true)throw Error('Este texto é comum. Use Novo para criar um texto individual.');
   const value=MVAMF.type({id:selected?.id??null,text,isCommon:false},'mv.editor.core.data.TemplateText');
   return client.call('templateTextResource','saveIndividualTemplateText',[field,value,parameters]);
  }
 };
}
function defaults(){return MVAMF.type(Object.entries(root.MV_CONFIG?.testParameterDefaults||{}).map(([data,label])=>MVAMF.type({data,label},'mv.editor.core.data.DataLabel')),'flex.messaging.io.ArrayCollection');}
function open({node,input,editable,onAnswer,context={}}){
 const d=document.createElement('dialog');d.className='templateTextDialog';d.setAttribute('aria-label','Texto Padrão');
 const heading=document.createElement('h2');heading.textContent='Texto Padrão';
 const search=document.createElement('input');search.placeholder='Pesquisar…';search.setAttribute('aria-label','Pesquisar texto padrão');
 const label=document.createElement('label');label.textContent='Descrição';
 const text=document.createElement('textarea');text.setAttribute('aria-label','Descrição do texto padrão');text.value=input.value;label.append(text);
 const table=document.createElement('table'),head=document.createElement('thead'),th=document.createElement('th'),tr=document.createElement('tr'),body=document.createElement('tbody');th.textContent='Descrição';tr.append(th);head.append(tr);table.append(head,body);
 const grid=document.createElement('div');grid.className='templateTextGrid';grid.append(table);
 const message=document.createElement('p');message.setAttribute('role','status');
 const footer=document.createElement('div');footer.className='templateTextActions';
 let selected=null,page=1,rows=[],busy=false,timer,api;
 const button=(name,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=fn;return b;};
 const close=button('Fechar',()=>d.close());
 const use=button('Usar',()=>{if(!editable)return;input.value=text.value;onAnswer(text.value);d.close();});
 const save=button('Salvar',()=>run(async()=>{await api.save(selected,text.value);selected=null;text.value='';page=1;await load();message.textContent='Texto padrão salvo no MV.';}));
 const fresh=button('Novo',()=>{selected=null;text.value='';text.readOnly=!editable;render();update();text.focus();});
 const previous=button('Anterior',()=>run(async()=>{page=Math.max(1,page-1);await load();}));
 const next=button('Próxima',()=>run(async()=>{page++;await load();}));
 function update(){use.disabled=busy||!editable||!text.value.trim();save.disabled=busy||!editable||selected?.isCommon===true||!text.value.trim();fresh.disabled=busy||!editable;previous.disabled=busy||page<=1;next.disabled=busy||rows.length<50;close.disabled=busy;search.disabled=busy;text.readOnly=busy||!editable||selected?.isCommon===true;}
 function render(){body.replaceChildren();for(const row of rows){const r=document.createElement('tr'),c=document.createElement('td'),b=button(row.description||row.text||String(row.id),()=>{selected=row;text.value=row.text||'';render();update();});b.setAttribute('aria-pressed',String(selected===row));b.ondblclick=()=>{if(editable){input.value=row.text||'';onAnswer(input.value);d.close();}};c.append(b);r.append(c);body.append(r);}if(!rows.length){const r=document.createElement('tr'),c=document.createElement('td');c.textContent='Nenhum texto padrão retornado pelo MV.';r.append(c);body.append(r);}}
 async function load(){rows=await api.list(search.value,page);render();message.textContent=(editable?'Textos vinculados ao campo no MV.':'Prévia na edição. Abra Teste para usar ou salvar textos.')+' • página '+page;}
 async function run(fn){if(busy)return;busy=true;update();try{await fn();}catch(error){message.textContent=error.message;}finally{busy=false;update();}}
 text.oninput=update;search.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;run(load);},300);};search.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);page=1;run(load);}};
 footer.append(previous,next,fresh,use,save,close);d.append(heading,search,label,grid,message,footer);document.body.append(d);
 d.oncancel=e=>{if(busy)e.preventDefault();};d.onclose=()=>{clearTimeout(timer);d.remove();};d.showModal();
 run(async()=>{api=service(context.client||root.MVGetClient(),Number(node.getAttribute('id')),context.parameters||defaults());await load();});
}
function attach(node,wrap,input,{editable=false,disabled=false,onAnswer=()=>{},templateContext}={}){
 if(!enabled(node))return;
 const b=document.createElement('button');b.type='button';b.className='templateTextButton';b.textContent='T';b.title='Criar ou selecionar texto padrão';b.setAttribute('aria-label','Texto padrão de '+(node.getAttribute('toolTip')||node.getAttribute('key')||'campo'));b.disabled=disabled;
 b.onpointerdown=e=>e.stopPropagation();b.ondblclick=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();open({node,input,editable:editable&&!disabled,onAnswer,context:templateContext});};wrap.append(b);
 if(node.tagName==='TEXTAREA')input.addEventListener('scroll',()=>{b.style.right=input.scrollHeight>input.clientHeight?'20px':'2px';});
}
root.MVTemplateText={enabled,service,attach};
})(typeof window==='undefined'?globalThis:window);

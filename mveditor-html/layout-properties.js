/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Specialized editors use the same native operations as the Flash inspectors. */
(function(root){
'use strict';
const array=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const summary=v=>array(v).map(p=>p.label||p.key||p.data||'').join(', ');
const fields=['id','name','tabOrder','rules','bodyHeight','width','headerId','footerId'];
const captions={id:'Código',name:'Descrição',tabOrder:'Ordem dos campos',rules:'Regras',bodyHeight:'Altura do corpo da página',width:'Largura da Página',headerId:'Código do layout de cabeçalho',footerId:'Código do layout de rodapé'};
function properties(item,config){
 const report=String(item.layoutType?.data||item.layoutType||'').toUpperCase()==='RELATORIO';
 const allowed=name=>report||!['headerId','footerId'].includes(name);
 const configured=array(config?.propertyConfigurations).filter(p=>!p.dynamic&&allowed(p.name));
 const keys=[...fields.filter(k=>k in item&&allowed(k)),...configured.map(p=>p.name).filter(k=>!fields.includes(k))];
 return keys.map(name=>({name,label:captions[name]||name,editable:!['id'].includes(name),required:['name','bodyHeight','width'].includes(name),...configured.find(p=>p.name===name)}));
}
async function open(layout,key,{client,beforeWrite,onChanged}){
 const dialog=document.createElement('dialog');dialog.className='layoutPropertyDialog';
 const title=document.createElement('h2');title.textContent=captions[key];
 const help=document.createElement('p');help.textContent='Layout '+layout.id+' • alterações confirmadas são gravadas no MV.';
 const list=document.createElement('div');list.className='layoutPropertyList';
 const message=document.createElement('p');message.setAttribute('role','status');
 const close=document.createElement('button');close.textContent='Fechar';close.onclick=()=>dialog.close();
 dialog.append(title,help,list,message,close);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());
 let busy=false,rows=[],selectedRules=[],fresh=layout;
 async function refresh(){fresh=await client.layout(Number(layout.id));
  if(key==='rules'){
   selectedRules=array(await client.call('ruleResource','listLayoutRule',[Number(layout.id)]));
   rows=array(await client.call('ruleResource','listVersionRule',[Number(fresh.parentItemId)]));
  }else rows=array(fresh.tabOrder);
  render();
 }
 async function change(action){if(busy)return;busy=true;render();try{beforeWrite();await action();await onChanged();await refresh();message.textContent='Alteração gravada e relida do MV.';}catch(e){message.textContent=e.message;}finally{busy=false;render();}}
 function button(text,action,disabled=false){const b=document.createElement('button');b.textContent=text;b.disabled=busy||disabled;b.onclick=action;return b;}
 function render(){list.replaceChildren();close.disabled=busy;
  rows.forEach((r,i)=>{const row=document.createElement('div');row.className='layoutPropertyRow';const name=document.createElement('span');name.textContent=(i+1)+'. '+(r.label||r.key||r.data);row.append(name);
   if(key==='rules'){
    const checked=selectedRules.some(s=>String(s.data)===String(r.data));
    row.append(button(checked?'Desvincular':'Vincular',()=>change(async()=>{
     
     const current=await client.layout(Number(layout.id));
     const existing=array(await client.call('ruleResource','listLayoutRule',[Number(layout.id)]));
     if(existing.some(s=>String(s.data)===String(r.data))!==checked)throw Error('Vínculos mudaram no MV. Feche e reabra as regras.');
     const rule=MVAMF.type({...r,selected:!checked},r.$amfType||'mv.editor.core.data.DataLabel');
     current.rules=MVAMF.type(checked?existing.filter(s=>String(s.data)!==String(r.data)):[...existing,rule],'flex.messaging.io.ArrayCollection');
     await client.call('ruleResource','updateLayoutRule',[current,rule]);
    })));
   }else{
    const move=to=>change(async()=>{
     
     const current=await client.layout(Number(layout.id));
     if(array(current.tabOrder).map(v=>String(v.data)).join('|')!==rows.map(v=>String(v.data)).join('|'))throw Error('A ordem mudou no MV. Feche e reabra este painel.');
     await client.call('documentResource','updateTabOrder',[Number(layout.id),i+1,to+1]);
    });
    row.append(button('Primeiro',()=>move(0),i===0),button('↑',()=>move(i-1),i===0),button('↓',()=>move(i+1),i===rows.length-1),button('Último',()=>move(rows.length-1),i===rows.length-1));
   }list.append(row);
  });
  if(!rows.length)list.textContent=key==='rules'?'Nenhuma regra cadastrada nesta versão.':'O MV não retornou campos na ordem deste layout.';
 }
 dialog.showModal();try{await refresh();}catch(e){message.textContent=e.message;}
}
root.MVLayoutProperties={properties,summary,open};
})(typeof window==='undefined'?globalThis:window);

/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
(function(root){
'use strict';
const array=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
const n=(node,key,f=0)=>node.hasAttribute(key)&&Number.isFinite(Number(node.getAttribute(key)))?Number(node.getAttribute(key)):f;
const isReport=layout=>layout?.itemType==='LAY'&&layout.layoutType?.data==='RELATORIO';
const isScreen=layout=>layout?.itemType==='LAY'&&layout.layoutType?.data==='TELA';
async function generationPlan(client,item){
 if(!isScreen(item))throw Error('Gere o relatório a partir da Tela, não de outro Relatório. Selecione a Tela na árvore.');
 const fresh=await client.layout(Number(item.id));
 if(!isScreen(fresh)||String(fresh.id)!==String(item.id)||String(fresh.documentId)!==String(item.documentId)||String(fresh.parentItemId)!==String(item.parentItemId)||fresh.content!==item.content)throw Error('A Tela mudou no MV. Reabra antes de gerar o relatório.');
 if(!Number.isSafeInteger(Number(fresh.parentItemId))||Number(fresh.parentItemId)<=0)throw Error('O MV não retornou a versão da Tela.');
 const version=await client.refresh(root.MVAMF.type({id:Number(fresh.parentItemId),itemType:'VER_DOC'},'mv.editor.core.data.Version'));
 if(String(version?.id)!==String(fresh.parentItemId)||!String(version.itemType||'').startsWith('VER'))throw Error('Não foi possível conferir a versão da Tela.');
 if(version.published===true||/HIST|PUBLIC/i.test(String(version.type?.data||version.type||'')))throw Error('Geração de relatório exige uma versão de teste.');
 return fresh;
}
// Explicit opt-in generation: identify only the newly created report in this version.
async function generateForPdf(client,source,beforeWrite=()=>{}){
 const ref=root.MVAMF.type({id:Number(source.parentItemId),itemType:'VER_DOC'},'mv.editor.core.data.Version');
 const before=await client.refresh(ref),ids=new Set();
 for(const item of array(before.items||before.children))if(item.itemType==='LAY'){
  ids.add(String(item.id));const value=await client.layout(Number(item.id));
  if(isReport(value))throw Error('Esta versão já tem Relatório. Abra-o e use Preparar relatório para PDF, ou exclua-o antes de gerar outro.');
 }
 if(!ids.has(String(source.id)))throw Error('A Tela não foi encontrada nesta versão. Atualize a árvore antes de gerar.');
 beforeWrite();await client.report(source);
 const after=await client.refresh(ref),created=array(after.items||after.children).filter(item=>item.itemType==='LAY'&&!ids.has(String(item.id)));
 if(created.length!==1)throw Error('Geração enviada, mas não foi possível identificar um único relatório novo. Atualize a árvore; nenhum relatório existente foi preparado.');
 const report=await client.layout(Number(created[0].id));
 if(!isReport(report)||String(report.documentId)!==String(source.documentId)||String(report.parentItemId)!==String(source.parentItemId))throw Error('O MV retornou outro contexto após gerar. Confira o novo Relatório na árvore.');
 return report;
}
function limits(column,band,y,layout){
 const rows=[...column.children].filter(c=>c.tagName==='BAND'&&c!==band).sort((a,b)=>n(a,'y')-n(b,'y'));
 const anchor=band?n(band,'y'):y;const previous=rows.filter(c=>n(c,'y')<=anchor).slice(-1)[0],next=rows.find(c=>n(c,'y')>anchor);
 const body=n(column.parentElement,'height',Number(layout.bodyHeight)>0?Number(layout.bodyHeight):540),page=Number(layout.bandHeight);
 let min=0,max=body;
 if(page>0){max=Math.min(body,(previous?n(previous,'y'):0)+page);min=Math.max(0,next?n(next,'y')-page:body-page);if(next)max=Math.min(max,n(next,'y'));if(previous)min=Math.max(min,n(previous,'y'));}
 return {min,max,body};
}
function position(column,band,y,layout){
 if(!isReport(layout))throw Error('Quebra de página disponível somente no layout Relatório.');
 if(column.tagName!=='Column'||column.parentElement?.getAttribute('pageSection')!=='pagebody')throw Error('Insira a quebra no corpo do relatório.');
 const range=limits(column,band,y,layout);
 if(!Number.isFinite(y)||y<0||y>range.body||(band&&(y<range.min||y>range.max)))throw Error('Quebra em '+y+' px fora do intervalo permitido pelo relatório: '+range.min+' a '+range.max+' px.');
 if([...column.children].some(c=>c!==band&&c.tagName==='BAND'&&n(c,'y')===y))throw Error('Já existe uma quebra nessa posição.');
 return y;
}
function clampPosition(column,band,y,layout){
 if(!Number.isFinite(y))throw Error('Informe uma posição numérica para a quebra.');
 const range=limits(column,band,y,layout);
 if(range.min>range.max)throw Error('Faltam quebras para completar a paginação. Insira uma quebra pelo botão antes de mover esta linha.');
 const adjusted=Math.max(Math.ceil(range.min),Math.min(Math.floor(range.max),Math.round(y)));
 if(band||![...column.children].some(b=>b.tagName==='BAND'&&n(b,'y')===adjusted))position(column,band,adjusted,layout);return adjusted;
}
function place(column,y,layout){
 if(!Number.isFinite(y))throw Error('Informe uma posição numérica para a quebra.');
 if(!isReport(layout)||column.tagName!=='Column'||column.parentElement?.getAttribute('pageSection')!=='pagebody')throw Error('Insira a quebra no corpo do Relatório.');
 const existing=[...column.children].filter(c=>c.tagName==='BAND'),added=complete(column,layout);
 let band;
 if(!existing.length&&added.length){
  band=added.reduce((best,b)=>Math.abs(n(b,'y')-y)<Math.abs(n(best,'y')-y)?b:best);
  band.setAttribute('y',String(clampPosition(column,band,y,layout)));
 }else{
  const adjusted=clampPosition(column,null,y,layout);
  band=[...column.children].find(b=>b.tagName==='BAND'&&n(b,'y')===adjusted)||insert(column,adjusted,layout);
 }
 return {band,extra:added.filter(b=>b!==band),requested:y,actual:n(band,'y')};
}
function insert(column,y,layout){position(column,null,y,layout);const band=column.ownerDocument.createElement('BAND');if(column.ownerDocument.documentElement?.getAttribute('mvPageBreaks')==='explicit-v1')band.setAttribute('mvPageBreaks','explicit-v1');band.setAttribute('y',String(y));column.append(band);return band;}
function complete(column,layout){
 if(!isReport(layout))throw Error('Completar quebras disponível somente no Relatório.');
 const page=Math.floor(Number(layout.bandHeight)),body=n(column.parentElement,'height',Number(layout.bodyHeight)||540);
 if(!Number.isFinite(page)||page<=0)throw Error('Aguarde carregar a altura útil do relatório antes de completar as quebras.');
 const boundaries=[0,...[...column.children].filter(c=>c.tagName==='BAND').map(b=>n(b,'y')).sort((a,b)=>a-b),body],positions=[];
 for(let i=1;i<boundaries.length;i++)for(let y=boundaries[i-1]+page;y<boundaries[i];y+=page){
  positions.push(y);if(positions.length>500)throw Error('Relatório exige mais de 500 quebras. Confira a altura da página.');
 }
 return positions.map(y=>insert(column,y,layout));
}
function paginationIssues(doc,layout){
 const page=Number(layout.bandHeight),errors=[];if(!isReport(layout)||!Number.isFinite(page)||page<=0)return errors;
 for(const column of doc.querySelectorAll('Column')){
  if(column.parentElement?.getAttribute('pageSection')!=='pagebody')continue;
  const body=n(column.parentElement,'height',Number(layout.bodyHeight)||540);
  const boundaries=[0,...[...column.children].filter(c=>c.tagName==='BAND').map(b=>n(b,'y')).sort((a,b)=>a-b),body];
  for(let i=1;i<boundaries.length;i++)if(boundaries[i]-boundaries[i-1]>page){
   const from=boundaries[i-1],to=boundaries[i];
   errors.push('Paginação inválida: trecho de '+from+' a '+to+' px tem '+(to-from)+' px; a folha comporta '+page+' px de corpo, considerando cabeçalho e rodapé. Adicione ou ajuste as quebras nesse trecho. A última página também precisa caber.');
  }
 }return errors;
}
function issues(doc,layout){const errors=paginationIssues(doc,layout);for(const band of doc.querySelectorAll('BAND')){
 try{position(band.parentElement,band,n(band,'y'),layout);}catch(e){errors.push(e.message);}
 for(const object of band.parentElement?.children||[]){
  if(object.tagName==='BAND')continue;
  const top=n(object,'y'),height=n(object,'height',['CHECKBOX','RADIOBUTTON'].includes(object.tagName)?14:25),y=n(band,'y');
  if(y>=top&&y<=top+height)errors.push('Quebra em '+y+' px cruza '+object.tagName+' '+(object.getAttribute('toolTip')||object.getAttribute('key')||object.getAttribute('id')||'')+' (de '+top+' a '+(top+height)+' px). Mova a quebra ou o conteúdo destacado em amarelo.');
 }
 }return errors;}
function breakMap(doc){return [...doc.querySelectorAll('BAND')].map(b=>{
 const path=[];for(let p=b.parentElement;p;p=p.parentElement){const siblings=p.parentElement?[...p.parentElement.children].filter(s=>s.tagName===p.tagName):[p];path.unshift(p.tagName+':'+siblings.indexOf(p));}
 return {path:path.join('/'),y:n(b,'y')};
 }).sort((a,b)=>a.path.localeCompare(b.path)||a.y-b.y);}
function confirmBreaks(sent,saved,parse){
 const before=breakMap(parse(sent)),after=breakMap(parse(saved));
 if(JSON.stringify(before)!==JSON.stringify(after))throw Error('O MV não confirmou as quebras enviadas. Esperado: '+(before.map(b=>b.y).join(', ')||'nenhuma')+' px; retornado: '+(after.map(b=>b.y).join(', ')||'nenhuma')+' px. O desenho local foi mantido. Confira o relatório no original antes de recarregar; a gravação não foi confirmada.');
 return true;
}
function crossing(node){if(node.tagName==='BAND'||node.parentElement?.tagName!=='Column')return false;const y=n(node,'y'),height=n(node,'height',['CHECKBOX','RADIOBUTTON'].includes(node.tagName)?14:25);return [...node.parentElement.children].some(b=>b.tagName==='BAND'&&n(b,'y')>=y&&n(b,'y')<=y+height);}
async function deletionPlan(client,item){
 if(!isReport(item))throw Error('Selecione o nó Relatório que deseja excluir.');
 const layout=await client.layout(Number(item.id));
 if(!isReport(layout)||String(layout.id)!==String(item.id)||String(layout.documentId)!==String(item.documentId))throw Error('O relatório mudou no MV. Selecione-o novamente.');
 if(!Number.isSafeInteger(Number(layout.parentItemId))||Number(layout.parentItemId)<=0)throw Error('O MV não retornou a versão do relatório.');
 const version=await client.refresh(root.MVAMF.type({id:Number(layout.parentItemId),itemType:'VER_DOC'},'mv.editor.core.data.Version'));
 if(!String(version?.itemType||'').startsWith('VER')||String(version.id)!==String(layout.parentItemId))throw Error('Não foi possível conferir a versão do relatório.');
 if(version.published===true||/HIST|PUBLIC/i.test(String(version.type?.data||version.type||'')))throw Error('O MV restringe exclusão em versões publicadas ou históricas. Crie uma versão de teste.');
 if(version.document?.id!=null&&String(version.document.id)!==String(layout.documentId))throw Error('Vínculo entre documento e versão inconsistente.');
 return {layout,version};
}
async function deleteReport(client,approved){
 const fresh=await deletionPlan(client,approved.layout);
 if(String(fresh.layout.parentItemId)!==String(approved.layout.parentItemId)||fresh.layout.content!==approved.layout.content)throw Error('O relatório mudou após a confirmação. Reabra a exclusão.');
 await client.call('itemResource','deleteItem',[fresh.layout]);
 const version=await client.refresh(fresh.version);
 if(!version||(!Array.isArray(version.items)&&!Array.isArray(version.items?.source)&&!Array.isArray(version.children)&&!Array.isArray(version.children?.source)))throw Error('Exclusão enviada, mas a lista de layouts não foi retornada. Atualize a árvore antes de repetir.');
 if(array(version.items||version.children).some(v=>String(v.id)===String(fresh.layout.id)))throw Error('Exclusão enviada, mas o relatório ainda foi retornado pelo MV. Atualize a árvore antes de repetir.');
 return fresh.layout;
}
root.MVReportTools={isReport,isScreen,generationPlan,generateForPdf,limits,position,insert,complete,place,clampPosition,issues,paginationIssues,crossing,breakMap,confirmBreaks,deletionPlan,deleteReport};
if(typeof module!=='undefined')module.exports=root.MVReportTools;
})(globalThis);

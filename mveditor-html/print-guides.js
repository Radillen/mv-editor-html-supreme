/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Read-only projection of the original ContentHelper page configuration. */
(function(root){
'use strict';
const array=v=>Array.isArray(v)?v:Array.isArray(v?.source)?v.source:[];
function settings(input={}){
 const page=Number(input.pageHeight)||1050,header=input.headerHeight==null?45:Number(input.headerHeight),footer=input.footerHeight==null?45:Number(input.footerHeight);
 if(!Number.isFinite(page)||!Number.isFinite(header)||!Number.isFinite(footer)||page<=0||header<0||footer<0||header+footer>=page)throw Error('Alturas de impressão inválidas.');
 return {...input,pageHeight:page,headerHeight:header,footerHeight:footer,usableHeight:Number(input.bandHeight)>0?Number(input.bandHeight):page-header-footer,breaks:array(input.breaks).map(Number).filter(y=>Number.isFinite(y)&&y>0).sort((a,b)=>a-b)};
}
function lines(context,height){const c=settings(context),result=[...new Set(c.breaks.filter(y=>y<height))].map(y=>({y,existing:true}));let y=(result.slice(-1)[0]?.y||0)+c.usableHeight;for(let i=0;y<height&&i<500;i++,y+=c.usableHeight)result.push({y,existing:false});return result;}
// JasperParser uses a fixed physical height of 1087, independently of Page.width.
// BAND separates detail blocks. A block that does not fit moves to another sheet;
// Jasper discards its leading empty space on overflow (verified with native fill).
function paperPlan(context,height,objects=[]){
 const c=settings(context),paperHeight=1087,paperWidth=Number(context.paperWidth)||768,capacity=paperHeight-c.headerHeight-c.footerHeight;
 const boundaries=lines(c,height).map(b=>b.y),cuts=[0,...boundaries,height].filter((v,i,a)=>i===0||v>a[i-1]);
 const pages=[];let page=null;
 function next(){page={number:pages.length+1,width:paperWidth,height:paperHeight,header:c.headerHeight,footer:c.footerHeight,used:0,inkBottom:c.headerHeight,segments:[]};pages.push(page);}
 for(let i=0;i<cuts.length-1;i++){
  const start=cuts[i],end=cuts[i+1],items=objects.filter(o=>o.top>=start&&o.top<end);
  if(!items.length&&!objects.some(o=>o.top>=end))break;
  const min=items.length?Math.max(0,Math.min(...items.map(o=>o.top))-start):0,max=items.length?Math.min(end,Math.max(...items.map(o=>o.top+o.height))):start;
  let trim=0;if(!page)next();else if(end-start>capacity-page.used){next();trim=min;}
  const top=c.headerHeight+page.used,length=end-start-trim;
  page.segments.push({start,end,trim,top,height:length});page.inkBottom=Math.max(page.inkBottom,top+max-start-trim);page.used+=length;
  if(page.used>capacity)page.overflow=true;
 }
 for(const p of pages)p.blankBottom=Math.max(0,p.height-p.inkBottom);
 return pages;
}
function crosses(top,height,boundaries){return boundaries.some(b=>top<b.y&&top+height>b.y);}
function sectionHeight(layout,parse,kind){const doc=parse(layout.content),row=doc.querySelector('Page > Row[pageSection="'+(kind==='header'?'pageheader':'pagefooter')+'"]');const height=row?Number(row.getAttribute('height')):0;if(!Number.isFinite(height)||height<0)throw Error('O layout '+layout.id+' não retornou altura de seção válida.');return height;}
async function resolve(client,input,parse){
 const data={...input};for(const kind of ['header','footer']){
  const raw=String(input[kind+'Id']||'').trim();data[kind+'Id']=raw;data[kind+'Name']='Sem layout • reserva padrão MV';data[kind+'Height']=45;
  if(raw){if(!/^\d+$/.test(raw)||Number(raw)<=0)throw Error('Código de '+(kind==='header'?'cabeçalho':'rodapé')+' inválido.');const layout=await client.layout(Number(raw));if(String(layout?.id)!==raw||!layout?.content)throw Error('O MV não retornou o layout '+raw+'.');data[kind+'Height']=sectionHeight(layout,parse,kind);data[kind+'Name']=layout.name||layout.documentName||'Layout '+raw;}
 }
 return settings(data);
}
async function load(client,layout,parse){
 let report=layout.layoutType?.data==='RELATORIO'?layout:null;
 if(!report&&Number(layout.parentItemId)>0){const version=await client.refresh(root.MVAMF.type({id:Number(layout.parentItemId),itemType:'VER_DOC'},'mv.editor.core.data.Version'));
  for(const node of array(version.items||version.children).filter(n=>n.itemType==='LAY'&&String(n.id)!==String(layout.id)).slice(0,16)){
   const candidate=await client.layout(Number(node.id));if(candidate.layoutType?.data==='RELATORIO'){if(!report||candidate.defaultLayout)report=candidate;if(candidate.defaultLayout)break;}
  }
 }
 if(!report)return settings({source:'Previsão de novo relatório • padrão MV',headerId:'',footerId:''});
 const xml=parse(report.content);return resolve(client,{paperWidth:Number(report.width)||Number(xml.querySelector('Page')?.getAttribute('width'))||768,pageHeight:report.pageHeight||1050,bandHeight:report.bandHeight,headerId:report.headerId||'',footerId:report.footerId||'',source:'Referência: relatório '+report.id,breaks:[...xml.querySelectorAll('Column > BAND')].map(b=>Number(b.getAttribute('y')))},parse);
}
root.MVPrintGuides={settings,lines,paperPlan,crosses,sectionHeight,resolve,load};if(typeof module!=='undefined')module.exports=root.MVPrintGuides;
})(globalThis);

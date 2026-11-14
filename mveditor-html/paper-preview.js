/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Live paper overview. Presentation only; never changes layout XML or BANDs. */
(function(root){
'use strict';
const $=id=>document.getElementById(id);if(!$('editingTools'))return;
const button=document.createElement('button');button.id='showPaperPreview';button.textContent='Ver folhas de impressão';button.setAttribute('aria-pressed','false');$('editingTools').append(button);
const panel=document.createElement('aside');panel.id='paperPreview';panel.className='paperPreview';panel.hidden=true;panel.setAttribute('aria-label','Folhas de impressão');
panel.innerHTML='<div class="paperPreviewHeading"><strong>Folhas de impressão</strong><button aria-label="Fechar folhas de impressão">×</button></div><p class="paperPreviewHelp">Folha inteira, incluindo as reservas. A linha de quebra marca o bloco de conteúdo; não é a borda do papel. Valores variáveis podem mudar a impressão.</p><div class="paperPreviewPages"></div>';
document.body.append(panel);let open=false;
function toggle(){open=!open;panel.hidden=!open;button.setAttribute('aria-pressed',String(open));$('workspace').classList.toggle('withPaperPreview',open);if(open)draw();}
button.onclick=toggle;panel.querySelector('button').onclick=toggle;$('preview').addEventListener('click',()=>{if(open)toggle();});
function draw(){
 if(!open||!root.MVEditor.printContext)return;
 panel.style.top=Math.max(95,$('editingTools').getBoundingClientRect().bottom)+'px';
 const body=panel.querySelector('.paperPreviewPages');body.replaceChildren();
 const context=root.MVEditor.printContext(),doc=root.MVEditor.parse(root.MVEditor.xml()),columns=[...doc.querySelectorAll('Row[pageSection="pagebody"] > Column')],views=[...document.querySelectorAll('#canvas .row[data-section="pagebody"] > .column')];
 if(!columns.length){body.textContent='Abra uma Tela ou Relatório para visualizar as folhas.';return;}
 let pageNumber=0;
 columns.forEach((column,index)=>{
  const view=views[index];if(!view)return;
  const height=Number(column.parentElement.getAttribute('height'))||Number(view.style.height)||1900;
  const objects=[...column.children].filter(n=>n.tagName!=='BAND').map(n=>({top:Number(n.getAttribute('y'))||0,height:Number(n.getAttribute('height'))||(['CHECKBOX','RADIOBUTTON'].includes(n.tagName)?14:25)}));
  const pages=root.MVPrintGuides.paperPlan(context,height,objects);
  for(const page of pages){
   const card=document.createElement('section');card.className='paperPreviewCard';const title=document.createElement('strong');title.textContent='Folha '+(++pageNumber)+' • '+page.width+' × '+page.height;card.append(title);
   const scale=Math.min(1,282/page.width),frame=document.createElement('div'),sheet=document.createElement('div');frame.className='paperPreviewFrame';frame.style.height=(page.height*scale)+'px';frame.style.width=(page.width*scale)+'px';sheet.className='paperPreviewSheet';Object.assign(sheet.style,{width:page.width+'px',height:page.height+'px',transform:'scale('+scale+')'});frame.append(sheet);card.append(frame);
   for(const [kind,top,height,text] of [['paperReserve',0,page.header,'Reserva superior: '+page.header],['paperReserve',page.height-page.footer,page.footer,'Reserva inferior: '+page.footer]]){
    const area=document.createElement('div');area.className=kind;Object.assign(area.style,{top:top+'px',height:height+'px'});area.textContent=text;sheet.append(area);
   }
   for(const segment of page.segments){
    const clip=document.createElement('div');clip.className='paperPreviewSlice';Object.assign(clip.style,{top:segment.top+'px',height:Math.min(segment.height,page.height-page.footer-segment.top)+'px',width:page.width+'px'});
    const clone=view.cloneNode(true);clone.inert=true;clone.setAttribute('aria-hidden','true');clone.className='paperPreviewColumn';Object.assign(clone.style,{position:'absolute',top:-(segment.start+segment.trim)+'px',left:'0px',width:page.width+'px',height:height+'px',zoom:'1',transform:'none'});
    clone.querySelectorAll('.printGuideLine,.BAND,.tableMoveGrip,.tableResizeHandle,.handle').forEach(n=>n.remove());
    clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    const originals=view.querySelectorAll('input,textarea,select'),copies=clone.querySelectorAll('input,textarea,select');copies.forEach((n,i)=>{n.value=originals[i].value;if('checked' in n)n.checked=originals[i].checked;n.tabIndex=-1;});
    clip.append(clone);sheet.append(clip);
   }
   for(const segment of page.segments){const line=document.createElement('div');line.className='paperPreviewBlockEnd';line.style.top=(segment.top+segment.height)+'px';line.textContent='Fim do bloco • y='+segment.end;sheet.append(line);}
   const note=document.createElement('p');note.className='paperPreviewNote';note.textContent='Do último objeto até o fim do papel: '+Math.round(page.blankBottom)+' unidades (inclui a reserva inferior).'+(page.overflow?' Bloco maior que a área da folha; confira as quebras.':'');card.append(note);body.append(card);
  }
 });
}
document.addEventListener('mv-editor-render',draw);document.addEventListener('mv-layout-load',draw);window.addEventListener('resize',draw);
})(window);

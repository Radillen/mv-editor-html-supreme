/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(){
const $=id=>document.getElementById(id);
const actions=document.querySelector('details.actions');document.addEventListener('click',event=>{if(!actions.contains(event.target)||event.target.closest('button'))actions.open=false;});document.addEventListener('keydown',event=>{if(event.key==='Escape')actions.open=false;});
$('repairTextStructure').onclick=()=>MVEditor.repairTextStructure();
$('preparePdfText').onclick=async()=>{const button=$('preparePdfText');button.disabled=true;MVEditor.setBusy(true);try{await MVEditor.preparePdfText();}catch(error){document.getElementById('operationNotice').textContent=error.message;document.getElementById('operationNotice').hidden=false;}finally{button.disabled=false;MVEditor.setBusy(false);}};
$('connectionToggle').onclick=()=>{$('connectionPanel').hidden=!$('connectionPanel').hidden;};
$('localTools').onclick=()=>$('localDialog').showModal();
$('showStructure').onclick=()=>{$('tree').hidden=!$('tree').hidden;$('repository').hidden=!$('tree').hidden;};
$('grid').onchange=()=>$('workspace').classList.toggle('no-grid',!$('grid').checked);
$('editTab').onclick=()=>{if($('workspace').classList.contains('preview'))$('preview').click();};
for(const b of document.querySelectorAll('[data-insert]'))b.onclick=()=>{$('type').value=b.dataset.insert;$('add').click();};
for(const b of document.querySelectorAll('[data-align]'))b.onclick=()=>MVEditor.setProperty('textAlign',b.dataset.align);
$('lineThickness').onchange=()=>{const value=Number($('lineThickness').value);if(Number.isFinite(value)&&value>=0&&value<=30)MVEditor.setStroke('lineThickness',value);};
$('lineColor').onchange=()=>MVEditor.setStroke('lineColor',parseInt($('lineColor').value.slice(1),16));
$('textLeading').onchange=()=>MVEditor.setTextLeading($('textLeading').value);
function syncAppearance(){const a=MVEditor.appearance();for(const id of ['alignObjectsHorizontal','alignObjectsMiddle','alignObjectsBottom','alignObjectsVertical','alignObjectsCenter','alignObjectsRight','matchHeight','matchWidth','matchSize'])$(id).disabled=MVEditor.selectionCount()<2;$('lineThickness').disabled=!a.stroke;$('lineColor').disabled=!a.stroke;$('textLeading').disabled=!a.text;$('lineThickness').value=a.thickness;$('lineColor').value=a.lineColor;$('textLeading').value=a.leading;
 const font=a.font,family=$('fontFamily'),size=$('fontSize');family.disabled=!font.active;size.disabled=!font.active;
 let placeholder=family.querySelector('option[value=""]');if(!placeholder){placeholder=document.createElement('option');placeholder.value='';family.prepend(placeholder);}
 placeholder.textContent=font.active?'Várias fontes':'—';
 if(font.family){let option=[...family.options].find(o=>o.value.toLowerCase()===font.family.toLowerCase());if(!option){option=document.createElement('option');option.value=font.family;option.textContent=font.family;family.append(option);}family.value=option.value;}else family.value='';
 size.value=font.size??'';size.placeholder=font.active?'Vários':'—';
}
document.addEventListener('mv-selection-change',syncAppearance);syncAppearance();
$('fontFamily').onchange=()=>MVEditor.setProperty('fontFamily',$('fontFamily').value);
$('fontSize').onchange=()=>MVEditor.setProperty('fontSize',String(Math.max(1,Math.min(120,Number($('fontSize').value)||12))));
$('fontColor').onchange=()=>MVEditor.setProperty('color',String(parseInt($('fontColor').value.slice(1),16)));
for(const id of ['bold','italic','underline'])$(id).onpointerdown=event=>MVEditor.keepInlineSelection(event);
$('bold').onclick=()=>MVEditor.toggleProperty('fontWeight','bold','normal');
$('italic').onclick=()=>MVEditor.toggleProperty('fontStyle','italic','normal');
$('underline').onclick=()=>MVEditor.toggleProperty('textDecoration','underline','none');
$('pageBreak').onclick=()=>MVEditor.togglePageBreak();
$('groupObjects').onclick=()=>MVEditor.groupSelection();
$('ungroupObjects').onclick=()=>MVEditor.ungroupSelection();
$('fillColor').onchange=()=>MVEditor.setProperty('backgroundColor',String(parseInt($('fillColor').value.slice(1),16)));
$('applyFill').onclick=()=>$('fillColor').onchange();
$('clearFill').onclick=()=>MVEditor.clearFill();
for(const b of document.querySelectorAll('[data-layer]'))b.onclick=()=>MVEditor.changeLayer(b.dataset.layer);
for(const [id,mode] of Object.entries({alignObjectsHorizontal:'top',alignObjectsMiddle:'middle',alignObjectsBottom:'bottom',alignObjectsVertical:'left',alignObjectsCenter:'center',alignObjectsRight:'right'}))$(id).onclick=()=>MVEditor.alignSelected(mode);
for(const [id,mode] of Object.entries({matchHeight:'height',matchWidth:'width',matchSize:'both'}))$(id).onclick=()=>MVEditor.matchSelectedSize(mode);
$('alignLeft').onclick=()=>MVEditor.align('left');$('alignCenter').onclick=()=>MVEditor.align('center');
})();

/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Shared Flash-coordinate presentation for editing and filling. XML is not offset. */
(function(root){
'use strict';
const number=(n,k,f=0)=>n.hasAttribute(k)&&Number.isFinite(Number(n.getAttribute(k)))?Number(n.getAttribute(k)):f;
const color=v=>/^\d+$/.test(v||'')?'#'+Math.min(16777215,Number(v)).toString(16).padStart(6,'0'):'';
function style(n,e){
 const tag=n.tagName,toggle=['CHECKBOX','RADIOBUTTON'].includes(tag);
 e.classList.add('mvObject',tag);
 Object.assign(e.style,{position:'absolute',left:number(n,'x')+'px',top:number(n,'y')+'px',width:Math.max(1,number(n,'width',toggle?14:tag==='BAND'?731:150))+'px',height:Math.max(1,number(n,'height',toggle?14:tag==='BAND'?8:25))+'px',fontFamily:n.getAttribute('fontFamily')||'Verdana',fontSize:Math.max(1,number(n,'fontSize',10))+'px',fontWeight:n.getAttribute('fontWeight')||'normal',fontStyle:n.getAttribute('fontStyle')||'normal',textDecoration:n.getAttribute('textDecoration')||'none',textAlign:n.getAttribute('textAlign')||'left',color:color(n.getAttribute('color'))||'#222',backgroundColor:color(n.getAttribute('backgroundColor'))});
 if(root.MVFlashText)e.style.lineHeight=root.MVFlashText.pitch(number(n,'fontSize',10),n.getAttribute('fontFamily')||'Verdana',number(n,'leading',2))+'px';
 if(toggle){
  // Flex 3.5 CheckBoxIcon and RadioButtonIcon both measure 14 x 14.
  // Button.layoutContents centers the icon in the stored component height.
  e.style.setProperty('--toggle-hit-size','14px');
  e.style.setProperty('--toggle-top',((number(n,'height',14)-14)/2)+'px');
  if(e.classList.contains('component'))e.classList.add('tightToggle');
 }
 if(toggle&&n.getAttribute('mvPdfToggle')==='center-v1'){e.style.left=(number(n,'x')-2)+'px';e.style.top=(number(n,'y')-2)+'px';e.style.width='14px';e.style.height='14px';e.style.setProperty('--toggle-top','0px');}
 if(['TEXT','DATE'].includes(tag)&&n.getAttribute('mvPdfValue')==='input-baseline-v1'){const dx=number(n,'mvPdfValueDx'),dy=number(n,'mvPdfValueDy');e.style.left=(number(n,'x')-dx)+'px';e.style.top=(number(n,'y')-dy)+'px';e.style.width=(number(n,'width')+dx)+'px';e.style.height=(number(n,'height')+dy)+'px';}
 if(tag==='BAND'){e.style.left='0px';e.style.width=number(n.parentElement,'width',731)+'px';e.style.height='1px';if(e.classList.contains('testComponent'))e.hidden=true;}
 if(['FRAME','HRULE','VRULE'].includes(tag)){e.style.borderColor=color(n.getAttribute('lineColor'))||'#000';const width=(number(n,'lineThickness',1)||1)+'px';if(tag==='HRULE')e.style.borderTopWidth=width;else if(tag==='VRULE')e.style.borderLeftWidth=width;else e.style.borderWidth=width;}
 if(tag==='HRULE'||tag==='VRULE'){// Flash lineStyle(0) draws a hairline; a CSS border of 0px disappears. Keep the native XML unchanged.
 const thickness=Math.max(0,number(n,'lineThickness',2))||1;e.style.setProperty('--rule-thickness',thickness+'px');e.style.setProperty('--rule-color',color(n.getAttribute('lineColor'))||'#000');e.style[tag==='HRULE'?'height':'width']=Math.max(1,thickness)+'px';}
}
function checked(n){const a=[...n.children].find(c=>c.tagName==='answer');return ['true','1'].includes(a?a.textContent:n.getAttribute('selected'));}
function calendar(input,onAnswer){const dialog=document.createElement('dialog');dialog.className='calendarPopup';dialog.setAttribute('aria-label','Calendário');let cursor=new Date();const parts=input.value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(parts)cursor=new Date(+parts[3],+parts[2]-1,1);const nav=document.createElement('div');nav.className='calendarNav';const previous=document.createElement('button'),next=document.createElement('button'),title=document.createElement('strong');previous.textContent='‹';previous.title='Mês anterior';next.textContent='›';next.title='Próximo mês';nav.append(previous,title,next);const grid=document.createElement('div');grid.className='calendarGrid';const close=document.createElement('button');close.textContent='Fechar';close.onclick=()=>dialog.close();function draw(){title.textContent=cursor.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});grid.replaceChildren();for(const day of ['D','S','T','Q','Q','S','S']){const e=document.createElement('strong');e.textContent=day;grid.append(e);}const year=cursor.getFullYear(),month=cursor.getMonth();for(let i=0;i<new Date(year,month,1).getDay();i++)grid.append(document.createElement('span'));for(let day=1;day<=new Date(year,month+1,0).getDate();day++){const b=document.createElement('button');b.textContent=String(day);b.setAttribute('aria-label',day+'/'+(month+1)+'/'+year);b.onclick=()=>{input.value=String(day).padStart(2,'0')+'/'+String(month+1).padStart(2,'0')+'/'+year;onAnswer(input.value);dialog.close();};grid.append(b);}}previous.onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);draw();};next.onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);draw();};dialog.append(nav,grid,close);document.body.append(dialog);dialog.onclose=()=>dialog.remove();draw();dialog.showModal();}
function control(n,{editable=false,disabled=false,onAnswer=()=>{},templateContext,previewValue}={}){
 const wrap=document.createElement('div'),tag=n.tagName,toggle=['CHECKBOX','RADIOBUTTON'].includes(tag);
 const current=previewValue!==undefined?String(previewValue):[...n.children].find(c=>c.tagName==='answer')?.textContent||'';
 if(tag==='IMAGE'){const rows=MVFieldTools.values(n),choice=rows.find(r=>r.selected)||rows[0],source=MVFieldTools.imageURL(current||n.getAttribute('source')||choice?.data,n.getAttribute('id'));if(source){const img=document.createElement('img');img.className='mvImageControl';img.src=source;img.alt=choice?.label||n.getAttribute('toolTip')||'Imagem do campo';wrap.append(img);}else{const empty=document.createElement('div');empty.className='mvImagePlaceholder';empty.textContent='▧';empty.title='Imagem: configure a Lista de Valores nas propriedades do campo';wrap.append(empty);}return wrap;}
 if(tag==='DATE'){const inner=document.createElement('div');inner.className='mvDateControl';const input=document.createElement('input');input.type='text';input.className='mvControl';input.placeholder='  /  /    ';input.maxLength=10;input.inputMode='numeric';input.value=current;input.readOnly=!editable;input.disabled=disabled;input.setAttribute('aria-label',n.getAttribute('toolTip')||n.getAttribute('key')||'Data');input.onchange=()=>{const m=input.value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/),d=m?new Date(+m[3],+m[2]-1,+m[1]):null,valid=!input.value||m&&d.getFullYear()===+m[3]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[1];input.setCustomValidity(valid?'':'Informe uma data válida no formato DD/MM/AAAA.');if(valid)onAnswer(input.value);else input.reportValidity();};const button=document.createElement('button');button.type='button';button.className='calendarButton';button.textContent='▦';button.title='Selecionar data';button.setAttribute('aria-label','Abrir calendário de '+(n.getAttribute('toolTip')||n.getAttribute('key')||'Data'));button.disabled=disabled;button.onpointerdown=e=>e.stopPropagation();button.onclick=e=>{e.stopPropagation();calendar(input,onAnswer);};inner.append(input,button);wrap.append(inner);return wrap;}
 const input=document.createElement(tag==='TEXTAREA'?'textarea':tag==='COMBOBOX'?'select':'input');
 input.className='mvControl';
 if(!['TEXTAREA','COMBOBOX'].includes(tag))input.type=toggle?(tag==='RADIOBUTTON'?'radio':'checkbox'):'text';
 if(tag==='RADIOBUTTON'){
  // Original GroupComponent manages only its direct RadioButton children.
  const parent=n.parentElement;
  const groups=[...n.ownerDocument.querySelectorAll('GROUP,SCREENGROUP')];
  input.name=['GROUP','SCREENGROUP'].includes(parent?.tagName)?'mv-group-'+groups.indexOf(parent):'mv-radio-'+[...n.ownerDocument.querySelectorAll('RADIOBUTTON')].indexOf(n);
 }
 if(tag==='COMBOBOX'){const empty=document.createElement('option');empty.value='';empty.textContent='Selecione…';input.append(empty);for(const row of MVFieldTools.values(n)){const option=document.createElement('option');option.value=String(row.data)+'||'+String(row.label||'');option.textContent=row.label||row.data;option.selected=current?String(row.data)===current.split('||')[0]:row.selected===true;input.append(option);}if(current&&![...input.options].some(o=>o.value.split('||')[0]===current.split('||')[0])){const option=document.createElement('option');option.value=current;option.textContent=current.split('||').slice(1).join('||')||current;option.selected=true;input.append(option);}}else input.value=current;
 if(toggle)input.checked=checked(n);
 input.disabled=disabled;input.required=n.getAttribute('required')==='true';
 input.tabIndex=editable?number(n,'tabIndex',0):-1;
 input.setAttribute('aria-label',n.getAttribute('toolTip')||n.getAttribute('key')||tag);
 if(!editable&&tag!=='COMBOBOX'){input.style.pointerEvents='none';input.setAttribute('aria-hidden','true');}
 input.onchange=()=>onAnswer(toggle?String(input.checked):input.value);
 wrap.append(input);if(root.MVTemplateText)root.MVTemplateText.attach(n,wrap,input,{editable,disabled,onAnswer,templateContext});return wrap;
}
const pageWidth=(page,layout={})=>Number(layout.width)>0?Number(layout.width):number(page,'width',740);
const rowHeight=(row,layout={})=>row.getAttribute('pageSection')==='pagebody'&&Number(layout.bodyHeight)>0?Number(layout.bodyHeight):number(row,'height',540);
root.MVLayoutView={style,control,checked,number,pageWidth,rowHeight};
})(window);

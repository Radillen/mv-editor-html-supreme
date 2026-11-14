/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(){
'use strict';
const shell=document.querySelector('.shell'),sidebar=document.querySelector('.sidebar'),bar=document.createElement('div');bar.className='sidebarResize';bar.tabIndex=0;bar.setAttribute('role','separator');bar.setAttribute('aria-label','Largura da barra lateral');bar.setAttribute('aria-orientation','vertical');bar.title='Arraste para redimensionar a lateral; setas ajustam pelo teclado';sidebar.after(bar);
const limit=()=>Math.max(240,Math.min(750,window.innerWidth-800));
function apply(value,save=false){const width=Math.max(240,Math.min(limit(),Number(value)||330));shell.style.setProperty('--sidebar-width',width+'px');bar.setAttribute('aria-valuenow',Math.round(width));bar.setAttribute('aria-valuemin','240');bar.setAttribute('aria-valuemax',limit());if(save)try{localStorage.setItem('mveditor-sidebar-width',String(width));}catch{}return width;}
try{apply(localStorage.getItem('mveditor-sidebar-width'));}catch{apply(330);}
bar.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();const start=event.clientX,width=sidebar.getBoundingClientRect().width;bar.setPointerCapture(event.pointerId);bar.classList.add('dragging');bar.onpointermove=e=>apply(width+e.clientX-start);bar.onpointerup=()=>{apply(parseFloat(shell.style.getPropertyValue('--sidebar-width')),true);bar.classList.remove('dragging');bar.onpointermove=null;};bar.onpointercancel=bar.onpointerup;};
bar.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;event.preventDefault();apply(event.key==='Home'?330:parseFloat(shell.style.getPropertyValue('--sidebar-width'))+(event.key==='ArrowRight'?10:-10),true);};window.addEventListener('resize',()=>apply(parseFloat(shell.style.getPropertyValue('--sidebar-width'))));
})();

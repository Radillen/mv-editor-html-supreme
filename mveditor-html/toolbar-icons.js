/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
/* Local SVG icons; no fonts, CDN or third-party requests. */
(function(){
const paths={
 save:'M3 2h11l3 3v13H3z M6 2v6h8V2 M6 18v-7h8v7',
 pageBreak:'M3 2h14v6H3z M3 14h14v6H3z M1 11h3 M7 11h3 M13 11h3 M19 11h1',
 copy:'M7 6h10v12H7z M13 6V2H3v12h4',
 remove:'M5 5l10 10 M15 5L5 15',
 undo:'M7 4L2 8l5 4 M2 8h9a6 6 0 0 1 0 12',
 redo:'M13 4l5 4-5 4 M18 8H9a6 6 0 0 0 0 12',
 group:'M2 2h5v5H2z M13 2h5v5h-5z M2 13h5v5H2z M13 13h5v5h-5z M7 4h6 M4 7v6 M16 7v6 M7 16h6',
 ungroup:'M2 2h6v6H2z M12 12h6v6h-6z M12 2h6v6 M2 12v6h6',
 front:'M3 7h10v10H3z M7 3h10v10H7z M10 6h4 M12 4v4',
 back:'M7 3h10v10 M3 7h10v10H3z M5 12h6',
 up:'M3 9h14v8H3z M10 3v9 M7 6l3-3 3 3',
 down:'M3 3h14v8H3z M10 8v9 M7 14l3 3 3-3',
 print:'M5 7V2h10v5 M5 14H2V7h16v7h-3 M5 11h10v7H5z M15 9h1',
 check:'M3 10l4 4L17 4',
 lock:'M4 8h12v10H4z M6 8V5a4 4 0 0 1 8 0v3',
 settings:'M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 1v3 M10 16v3 M1 10h3 M16 10h3 M3 3l3 3 M14 14l3 3 M17 3l-3 3 M6 14l-3 3',
 paint:'M4 3l10 10 M8 2l8 8-7 7-7-7z M16 13l2 4a2 2 0 0 1-4 0z',
 clear:'M3 3l14 14 M3 14l7-11 7 11-7 4z'
};
paths.trash='M3 5h14 M7 5V2h6v3 M5 5l1 14h8l1-14 M8 8v8 M12 8v8';
paths.paste='M7 3h6v3H7z M7 4H4v15h12V4h-3 M7 10h6 M7 14h6';
paths.duplicate='M3 3h10v12H3z M8 8h10v12H8z M10 11h6 M13 8v6';
paths.text='M3 4h14 M10 4v14 M7 18h6';
paths.horizontal='M2 11h16';paths.vertical='M10 2v18';paths.frame='M2 4h16v14H2z';
paths.table='M2 3h16v16H2z M2 8h16 M2 13h16 M7 3v16 M12 3v16';
paths.alignLeft='M2 4h15 M2 8h10 M2 12h15 M2 16h10';paths.alignCenter='M2 4h16 M5 8h10 M2 12h16 M5 16h10';paths.alignRight='M3 4h15 M8 8h10 M3 12h15 M8 16h10';
paths.objectsHorizontal='M1 10h18 M3 4h4v12H3z M12 6h5v8h-5z';paths.objectsVertical='M10 1v20 M3 4h14v4H3z M5 13h10v5H5z';
paths.objectsTop='M1 3h18 M3 5h4v13H3z M12 5h5v7h-5z';paths.objectsBottom='M1 19h18 M3 4h4v13H3z M12 10h5v7h-5z';paths.objectsLeft='M2 1v20 M4 4h13v4H4z M4 13h7v5H4z';paths.objectsRight='M18 1v20 M3 4h13v4H3z M9 13h7v5H9z';
const buttons={alignObjectsMiddle:'objectsHorizontal',alignObjectsBottom:'objectsBottom',alignObjectsCenter:'objectsVertical',alignObjectsRight:'objectsRight',alignObjectsHorizontal:'objectsTop',alignObjectsVertical:'objectsLeft',deleteItemMV:'trash',saveMV:'save',pageBreak:'pageBreak',copyObjects:'copy',pasteObjects:'paste',duplicate:'duplicate',remove:'remove',undo:'undo',redo:'redo',groupObjects:'group',ungroupObjects:'ungroup',applyFill:'paint',clearFill:'clear',testSave:'save',testPrint:'print',testCloseRegistry:'lock',testCopy:'copy',testCopyPublished:'copy',testValidate:'check',testValidateSave:'save',testParams:'settings'};
for(const b of document.querySelectorAll('[data-layer]'))buttons[b.id||('layer-'+b.dataset.layer)]=b.dataset.layer,b.id=b.id||'layer-'+b.dataset.layer;
for(const b of document.querySelectorAll('[data-insert]')){const names={LABEL:'text',HRULE:'horizontal',VRULE:'vertical',FRAME:'frame'};b.id='insert-'+b.dataset.insert;buttons[b.id]=names[b.dataset.insert];}
for(const b of document.querySelectorAll('[data-align]')){b.id='text-align-'+b.dataset.align;buttons[b.id]={left:'alignLeft',center:'alignCenter',right:'alignRight'}[b.dataset.align];}
buttons.insertTable='table';
for(const [id,name] of Object.entries(buttons)){const button=document.getElementById(id);if(!button)continue;button.setAttribute('aria-label',button.title||button.textContent);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 20 22');svg.setAttribute('aria-hidden','true');svg.classList.add('toolbarIcon');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[name]);svg.append(path);button.replaceChildren(svg);}
})();

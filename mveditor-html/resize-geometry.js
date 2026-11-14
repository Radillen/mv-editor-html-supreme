/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(root){'use strict';function box(b,corner,dx,dy){if(!['se','sw','ne','nw'].includes(corner))throw Error('Canto inválido');const left=corner.includes('w'),top=corner.includes('n');const width=Math.max(5,b.width+(left?-dx:dx)),height=Math.max(5,b.height+(top?-dy:dy));return {x:left?b.x+b.width-width:b.x,y:top?b.y+b.height-height:b.y,width,height};}root.MVResizeGeometry={box};if(typeof module!=='undefined')module.exports=root.MVResizeGeometry;})(globalThis);

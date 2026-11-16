/* Copyright (c) 2026 Rodrigo Amorim Dillemburg. Interface HTML e melhorias. Veja LICENCA.txt e TERCEIROS.md. */
/* Interface HTML e melhorias por Rodrigo Amorim Dillemburg — By @Radillen.
 * Printing font profile: unknown imported fonts fall back to Arial.
 * This is not a discovery of fonts installed in the server JVM.
 */
(function(root){'use strict';
const FAMILIES=['Arial','Verdana','Times New Roman','Courier New'];
const names={'arial':'Arial','arialmt':'Arial','verdana':'Verdana','times new roman':'Times New Roman','timesnewromanpsmt':'Times New Roman','courier new':'Courier New','couriernewpsmt':'Courier New','sans-serif':'Arial','sansserif':'Arial','serif':'Times New Roman','monospace':'Courier New','monospaced':'Courier New'};
function resolve(value){const choices=String(value||'').split(',');for(let name of choices){name=name.trim().replace(/^["']|["']$/g,'').replace(/^[A-Z]{6}\+/,'').toLowerCase();if(names[name])return names[name];}return 'Arial';}
function normalizeDocument(doc){const operations=[];for(const node of doc.querySelectorAll('[fontFamily],FONT[FACE]'))for(const key of node.tagName==='FONT'?['fontFamily','FACE']:['fontFamily']){if(!node.hasAttribute(key))continue;const before=node.getAttribute(key),after=resolve(before);if(before!==after)operations.push({node,key,before,after});}for(const op of operations)op.node.setAttribute(op.key,op.after);return {changed:operations.length,replacements:[...new Set(operations.map(op=>op.before+' → '+op.after))]};}
// Normalize DOCX before measuring words so preview and inserted text use the same family.
function normalizeRendered(container,readStyle){const elements=[container,...container.querySelectorAll('*')],operations=elements.map(node=>({node,before:readStyle(node).fontFamily})).map(op=>({...op,after:resolve(op.before)})).filter(op=>op.before!==op.after);for(const op of operations)op.node.style.fontFamily=op.after;return operations.length;}
root.MVFontPolicy={resolve,normalizeDocument,normalizeRendered,FAMILIES};if(typeof module!=='undefined')module.exports=root.MVFontPolicy;
})(globalThis);

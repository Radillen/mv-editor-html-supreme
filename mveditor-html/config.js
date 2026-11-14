/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
/* Both applications stay on the same host, scheme and port. */
(function(root){
'use strict';
const nested=location.pathname.includes('/html-next/');
root.MV_CONFIG={originalBase:nested?new URL('../',location.href).pathname:'/mveditor/'};
root.MV_CONFIG.testParameterDefaults={PAR_SISTEMA:'MVPEP'};
root.MV_CONFIG.layoutPresets={};
root.MVOriginalURL=function(path=''){const base=new URL(root.MV_CONFIG.originalBase,location.href);if(base.origin!==location.origin)throw Error('O editor original deve usar a mesma origem do HTML.');return new URL(path,base).href;};
})(globalThis);

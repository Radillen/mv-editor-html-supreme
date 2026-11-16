/* Configuração pública: personalize apenas no servidor da instituição. */
(function(root){
'use strict';
root.MV_CONFIG={originalBase:'/mveditor/'};
root.MV_CONFIG.testParameterDefaults={PAR_SISTEMA:'MVPEP'};
root.MV_CONFIG.layoutPresets={};
root.MVOriginalURL=function(path=''){const base=new URL(root.MV_CONFIG.originalBase,location.href);if(base.origin!==location.origin)throw Error('O editor original deve usar a mesma origem do HTML.');return new URL(path,base).href;};
})(globalThis);

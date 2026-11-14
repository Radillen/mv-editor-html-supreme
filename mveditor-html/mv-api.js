/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(root){
'use strict';
class MVClient{
 static faultDiagnostic(fault){
  const seen=new Set(),found=new Set();let count=0;
  function visit(value,depth){
   if(depth>7||count++>100||value==null)return;
   if(typeof value==='string'){
    for(const line of value.match(/ORA-\d{5}:[^\r\n]*/g)||[])found.add(line.slice(0,300));
    return;
   }
   if(typeof value!=='object'||seen.has(value))return;seen.add(value);
   for(const [key,v] of Object.entries(value))if(!/password|credential|token|authorization/i.test(key))visit(v,depth+1);
  }
  visit(fault,0);return [...found].slice(0,4).join(' • ');
 }
 constructor(endpoint){const url=new URL(endpoint,location.href);if(url.origin!==location.origin)throw Error('Instale o HTML na mesma origem do MV.');this.endpoint=url.href;this.dsId='nil';}
 async call(destination,operation,args=[]){return this.send(this.message(destination,operation,args));}
 message(destination,operation,args){return MVAMF.type({body:args,clientId:null,destination,headers:{DSId:this.dsId,DSEndpoint:'editor-amf'},messageId:crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random(),timestamp:0,timeToLive:0,operation,source:null},'flex.messaging.messages.RemotingMessage');}
 static needsLogin(error){return /Client\.Authentication|NotLoggedIn|HTTP 401|Authentication required/i.test(String(error?.code||'')+' '+String(error?.message||''));}
 async authenticateAndLoad(load,username,password){try{return await load();}catch(error){if(!MVClient.needsLogin(error))throw error;}try{await this.login(username,password);}catch(error){if(!/Cannot re-authenticate in the same session/i.test(error.message))throw error;}return load();}
 async login(username,password){if(!username||!password)throw Error('Informe usuário e senha do MV.');const raw=username+':'+password;let binary='';for(const ch of raw){const code=ch.charCodeAt(0);if(code>255)throw Error('Credencial contém caractere fora da codificação Latin-1 usada pelo login original.');binary+=ch;}const msg=this.message('auth',8,[]);MVAMF.type(msg,'flex.messaging.messages.CommandMessage');msg.body=btoa(binary);delete msg.source;return this.send(msg);}
 async send(message){let response;
 try{response=await fetch(this.endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/x-amf'},body:MVAMF.encodeRequest(message),redirect:'error'});}catch{throw Error('Não foi possível acessar o AMF. Pode haver redirecionamento para login CAS ou falha de rede. Use Entrar pelo autenticador MV e confira a origem da instalação.');}
 if(!response.ok)throw Error('MV retornou HTTP '+response.status+'. Verifique a conexão ou entre pelo autenticador MV.');if(!(response.headers.get('content-type')||'').includes('application/x-amf')){const error=Error('O servidor retornou uma página de login em vez de AMF. Use Entrar pelo autenticador MV.');error.code='Client.Authentication';throw error;}const packet=MVAMF.decodePacket(await response.arrayBuffer());if(packet.messages.length!==1)throw Error('Resposta AMF inesperada');const entry=packet.messages[0];let m=entry.value;if(Array.isArray(m)&&m.length===1)m=m[0];if(m?.headers?.DSId)this.dsId=m.headers.DSId;if(entry.target.endsWith('/onStatus')||m?.faultCode||m?.$amfType?.includes('ErrorMessage')){const code=m?.faultCode||m?.code||'AMF_FAULT';const error=new Error(code+': '+String(m?.faultString||m?.description||m?.message||m?.details||m?.faultDetail||'Operação recusada pelo MV'));error.code=code;const diagnostic=MVClient.faultDiagnostic(m);if(diagnostic&&!error.message.includes(diagnostic))error.message+=' • '+diagnostic;throw error;};return m&&Object.prototype.hasOwnProperty.call(m,'body')?m.body:m;}
 list(){return this.call('itemResource','listItem');}
 documents(filter=''){return this.call('itemResource','listDocuments',[filter]);}
 refresh(item,filter=''){return this.call('itemResource','refreshItem',[item,filter]);}
 layout(id){return this.call('documentResource','getLayout',[id]);}
 saveLayout(id,content){return this.call('documentResource','updateContent',[id,content]);}
 newItem(parent){return this.call('itemResource','newItem',[parent]);}
 saveItem(item){return this.call('itemResource','saveItem',[item]);}
 fields(filter=''){return this.call('itemResource','listFieldsAndParameters',[filter]);}
 addField(layoutId,fieldId){return this.call('documentResource','addFieldToLayout',[layoutId,fieldId]);}
 report(layout){return this.call('layoutResource','generateReportLayout',[layout]);}
}
root.MVClient=MVClient;
})(globalThis);

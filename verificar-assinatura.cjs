'use strict';
// Original package verification. Compare the key fingerprint with the author's independent publication.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=fs.realpathSync(__dirname);
try{
 const pub=crypto.createPublicKey(fs.readFileSync(path.join(root,'ASSINATURA-PUBLICA.pem')));
 const fingerprint=crypto.createHash('sha256').update(pub.export({format:'der',type:'spki'})).digest('hex');
 const manifest=fs.readFileSync(path.join(root,'SHA256SUMS')),signature=Buffer.from(fs.readFileSync(path.join(root,'SHA256SUMS.sig'),'utf8').trim(),'base64');
 if(!crypto.verify(null,manifest,pub,signature))throw Error('Assinatura do manifesto inválida.');
 const records=manifest.toString('utf8').trim().split('\n');
 for(const record of records){const m=/^([a-f0-9]{64})  (.+)$/.exec(record);if(!m)throw Error('Linha de manifesto inválida.');const name=m[2];if(path.isAbsolute(name)||name.split(/[\\/]/).some(p=>p==='..'))throw Error('Caminho inválido no manifesto.');const file=fs.realpathSync(path.resolve(root,name));if(!file.startsWith(root+path.sep))throw Error('Arquivo fora do pacote.');const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');if(actual!==m[1])throw Error('Arquivo alterado: '+name);}
 console.log('Assinatura e '+records.length+' arquivos conferidos.');
 console.log('Fingerprint SHA-256 da chave pública: '+fingerprint);
 console.log('Compare esse fingerprint com uma informação recebida diretamente do autor.');
}catch(error){console.error('NÃO CONFERIDO: '+error.message);process.exitCode=1;}

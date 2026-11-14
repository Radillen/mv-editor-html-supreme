/*! Docs Editor — Supreme Version. Copyright (c) 2026 Rodrigo Amorim Dillemburg.
 * Uso gratuito com preservação de autoria. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md.
 */
(function(root){
'use strict';
function headers(text){const values=String(text).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);if(!values.length)throw Error('Escreva pelo menos um título, um por linha. Cada título cria uma coluna.');if(values.length>12)throw Error('Use até 12 títulos/colunas.');return values;}
function validate(options){const rows=Number(options.rows),columns=Number(options.columns),width=Number(options.width),rowHeight=Number(options.rowHeight),headerHeight=Number(options.headerHeight);if(!Number.isInteger(rows)||rows<1||!Number.isInteger(columns)||columns<1||columns>12||rows*columns>200)throw Error('Use até 12 colunas e 200 células de preenchimento por tabela.');if(![width,rowHeight,headerHeight].every(v=>Number.isFinite(v)&&v>0)||width/columns<35||rowHeight<8||headerHeight<8)throw Error('Aumente a largura da tabela ou diminua a quantidade de colunas.');return {rows,columns,width,rowHeight,headerHeight};}
function build(doc,options,fields){const size=validate(options);if(fields.length!==size.rows*size.columns)throw Error('O MV não retornou todos os campos da tabela.');const ids=new Set(fields.map(f=>String(f.id)));if(ids.size!==fields.length||fields.some(f=>!Number.isSafeInteger(Number(f.id))||Number(f.id)<=0||f.displayType?.data!=='TEXT'))throw Error('Campos de tabela inválidos ou repetidos.');
 const create=(tag,attrs,parent)=>{const n=doc.createElement(tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));parent?.append(n);return n;};
 const height=size.headerHeight+size.rows*size.rowHeight,g=create('GROUP',{x:options.x||10,y:options.y||10,width:size.width,height}),cell=size.width/size.columns;
 create('FRAME',{x:0,y:0,width:size.width,height,lineColor:0,lineThickness:1},g);
 for(let c=1;c<size.columns;c++)create('VRULE',{x:c*cell,y:0,width:1,height,lineColor:0,lineThickness:1},g);
 for(let r=0;r<size.rows;r++)create('HRULE',{x:0,y:size.headerHeight+r*size.rowHeight,width:size.width,height:1,lineColor:0,lineThickness:1},g);
 for(let c=0;c<size.columns;c++){const label=create('LABEL',{x:c*cell+2,y:2,width:cell-4,height:size.headerHeight-4,fontSize:12,fontFamily:'Arial'},g),html=create('htmlText',{},label),format=create('TEXTFORMAT',{LEADING:2},html),p=create('P',{ALIGN:'LEFT'},format),font=create('FONT',{FACE:'Arial',SIZE:12,COLOR:'#000000'},p),b=create('B',{},font);b.textContent=options.headers?.[c]||'Coluna '+(c+1);}
 for(let r=0;r<size.rows;r++)for(let c=0;c<size.columns;c++){const field=fields[r*size.columns+c];create('TEXT',{id:field.id,key:field.key,toolTip:field.name||field.key,x:c*cell+2,y:size.headerHeight+r*size.rowHeight+2,width:cell-4,height:size.rowHeight-4,editable:'true',enabled:'true',fontSize:12,fontFamily:'Arial',tabIndex:Number(options.tabIndex||0)+r*size.columns+c+1},g);}
 return g;
}
// Recognize the native primitives emitted by build, without proprietary XML attributes.
function geometry(group){
 if(group?.tagName!=='GROUP')return null;
 const nodes=[...group.children],of=t=>nodes.filter(n=>n.tagName===t),value=(n,k)=>Number(n.getAttribute(k));
 const frames=of('FRAME'),vertical=of('VRULE').sort((a,b)=>value(a,'x')-value(b,'x')),horizontal=of('HRULE').sort((a,b)=>value(a,'y')-value(b,'y')),labels=nodes.filter(n=>n.tagName==='LABEL'||n.tagName==='GROUP'&&n.getAttribute('mvTextBackground')==='native-v1'),cells=of('TEXT');
 const columns=vertical.length+1,rows=horizontal.length;
 if(frames.length!==1||!rows||labels.length!==columns||cells.length!==rows*columns||nodes.length!==1+vertical.length+horizontal.length+labels.length+cells.length)return null;
 const xs=[0,...vertical.map(n=>value(n,'x')),value(group,'width')],ys=[0,...horizontal.map(n=>value(n,'y')),value(group,'height')];
 if(xs.some((x,i)=>!Number.isFinite(x)||(i&&x-xs[i-1]<8))||ys.some((y,i)=>!Number.isFinite(y)||(i&&y-ys[i-1]<8)))return null;
 // Scaled tables have scaled insets, not necessarily the original two pixels.
 const locate=(n,starts,key)=>starts.findIndex((start,i)=>i<starts.length-1&&value(n,key)>=start-.1&&value(n,key)<starts[i+1]-.1&&(key==='y'||value(n,'x')+value(n,'width')<=starts[i+1]+.1));
 const headings=labels.map(n=>({node:n,column:locate(n,xs,'x')})),entries=cells.map(n=>({node:n,column:locate(n,xs,'x'),row:locate(n,ys,'y')}));
 if(new Set(headings.map(v=>v.column)).size!==columns||headings.some(v=>v.column<0||value(v.node,'y')<-.1||value(v.node,'y')+value(v.node,'height')>ys[1]+.1)||entries.some(v=>v.column<0||v.row<1)||new Set(entries.map(v=>v.row+':'+v.column)).size!==cells.length)return null;
 return {group,frame:frames[0],vertical,horizontal,headings,entries,xs,ys};
}
function owner(node){for(let current=node;current;current=current.parentElement)if(geometry(current))return current;return null;}
function controls(group){const g=geometry(group);return g?{columns:g.xs.slice(1,-1).map((x,i)=>({index:i+1,x,height:g.ys[1]})),headerHeight:g.ys[1]}:null;}
function resize(g,axis,index,delta){
 if(!Number.isFinite(delta))throw Error('Deslocamento inválido.');
 const xs=[...g.xs],ys=[...g.ys];
 if(axis==='column'){
  if(!Number.isInteger(index)||index<1||index>=xs.length-1)throw Error('Divisória inválida.');
  xs[index]=Math.min(xs[index+1]-20,Math.max(xs[index-1]+20,g.xs[index]+delta));
 }else if(axis==='row'){
  if(!Number.isInteger(index)||index<1||index>=ys.length)throw Error('Divisória inválida.');
  const change=Math.max(8-(g.ys[index]-g.ys[index-1]),delta);
  for(let i=index;i<ys.length;i++)ys[i]+=change;
 }else throw Error('Eixo inválido.');
 return apply(g,xs,ys);
}
function apply(g,xs,ys){
 const set=(n,attrs)=>{for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(Math.round(v*100)/100));};
 const width=xs.slice(-1)[0],height=ys.slice(-1)[0];set(g.group,{width,height});set(g.frame,{width,height});
 g.vertical.forEach((n,i)=>set(n,{x:xs[i+1],height}));g.horizontal.forEach((n,i)=>set(n,{y:ys[i+1],width}));
 g.headings.forEach(({node,column:c})=>set(node,{x:xs[c]+2,width:xs[c+1]-xs[c]-4,height:ys[1]-4}));g.headings.forEach(({node})=>globalThis.MVLayoutOperations?.syncTextBackground(node));
 g.entries.forEach(({node,column:c,row:r})=>set(node,{x:xs[c]+2,y:ys[r]+2,width:xs[c+1]-xs[c]-4,height:ys[r+1]-ys[r]-4}));
 return {xs,ys};
}
function scale(g,width,height){const minWidth=(g.xs.slice(-1)[0])*Math.max(...g.xs.slice(1).map((x,i)=>20/(x-g.xs[i]))),minHeight=(g.ys.slice(-1)[0])*Math.max(...g.ys.slice(1).map((y,i)=>8/(y-g.ys[i])));width=Math.max(minWidth,width);height=Math.max(minHeight,height);return apply(g,g.xs.map(x=>x*width/g.xs.slice(-1)[0]),g.ys.map(y=>y*height/g.ys.slice(-1)[0]));}
function change(group,action,index,fields=[]){
 const g=geometry(group);if(!g)throw Error('A tabela foi alterada fora da grade.');const columns=g.xs.length-1,rows=g.ys.length-2;
 if(action==='addRow'&&(rows+1)*columns>200||action==='addColumn'&&(columns>=12||rows*(columns+1)>200))throw Error('Limite de 12 colunas e 200 células por tabela.');
 if(action==='removeRow'&&(!Number.isInteger(index)||index<0||index>=rows||rows===1))throw Error('Mantenha pelo menos uma linha para preenchimento.');
 if(action==='removeColumn'&&(!Number.isInteger(index)||index<0||index>=columns||columns===1))throw Error('Mantenha pelo menos uma coluna.');
 if(!['addRow','addColumn','removeRow','removeColumn'].includes(action))throw Error('Operação de tabela inválida.');
 const needed=action==='addRow'?columns:action==='addColumn'?rows:0;if(fields.length!==needed)throw Error('O MV não retornou todas as novas células.');
 let fresh=[];if(needed){const ids=new Set(g.entries.map(v=>String(v.node.getAttribute('id'))));if(fields.some(f=>ids.has(String(f.id))))throw Error('O MV retornou um identificador já usado pela tabela.');const staging=build(group.ownerDocument,{rows:needed,columns:1,width:40,rowHeight:26,headerHeight:8},fields);fresh=[...staging.children].filter(n=>n.tagName==='TEXT');}
 const xs=[...g.xs],ys=[...g.ys];let headings=g.headings.map(v=>({...v})),entries=g.entries.map(v=>({...v}));
 if(action==='addRow'){ys.push(ys.slice(-1)[0]+ys[ys.length-1]-ys[ys.length-2]);fresh.forEach((node,c)=>entries.push({node,column:c,row:rows+1}));}
 if(action==='addColumn'){xs.push(xs.slice(-1)[0]+xs[xs.length-1]-xs[xs.length-2]);const label=g.headings[0].node.cloneNode(true),html=label.querySelector('htmlText');if(html)html.textContent='Coluna '+(columns+1);else label.textContent='Coluna '+(columns+1);headings.push({node:label,column:columns});fresh.forEach((node,r)=>entries.push({node,column:columns,row:r+1}));}
 if(action==='removeRow'){const boundary=index+1,size=ys[boundary+1]-ys[boundary];ys.splice(boundary+1,1);for(let i=boundary+1;i<ys.length;i++)ys[i]-=size;entries=entries.filter(v=>v.row!==boundary).map(v=>({...v,row:v.row>boundary?v.row-1:v.row}));}
 if(action==='removeColumn'){const size=xs[index+1]-xs[index];xs.splice(index+1,1);for(let i=index+1;i<xs.length;i++)xs[i]-=size;headings=headings.filter(v=>v.column!==index).map(v=>({...v,column:v.column>index?v.column-1:v.column}));entries=entries.filter(v=>v.column!==index).map(v=>({...v,column:v.column>index?v.column-1:v.column}));}
 const doc=group.ownerDocument,create=(tag)=>{const n=doc.createElement(tag);n.setAttribute('lineColor',g.frame.getAttribute('lineColor')||'0');n.setAttribute('lineThickness',g.frame.getAttribute('lineThickness')||'1');return n;};
 const vertical=xs.slice(1,-1).map(()=>create('VRULE')),horizontal=ys.slice(1,-1).map(()=>create('HRULE'));group.replaceChildren(g.frame,...vertical,...horizontal,...headings.map(v=>v.node),...entries.map(v=>v.node));
 vertical.forEach(n=>{n.setAttribute('y','0');n.setAttribute('width','1');});horizontal.forEach(n=>{n.setAttribute('x','0');n.setAttribute('height','1');});
 const nextTab=Math.max(0,...g.entries.map(v=>Number(v.node.getAttribute('tabIndex'))||0));fresh.forEach((n,i)=>n.setAttribute('tabIndex',nextTab+i+1));
 apply({group,frame:g.frame,vertical,horizontal,headings,entries},xs,ys);return geometry(group);
}
root.MVTableBuilder={headers,validate,build,geometry,owner,controls,resize,scale,change};if(typeof module!=='undefined')module.exports=root.MVTableBuilder;
})(globalThis);

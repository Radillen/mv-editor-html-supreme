import org.codehaus.groovy.control.CompilerConfiguration
import javassist.*
import java.security.MessageDigest
// Run locally against the recipient's authorized MV installation. No original MV class is distributed.
if(args.length!=2)throw new IllegalArgumentException('Uso: CompilarPaginacao.groovy PASTA_WEB_INF_LIB RAIZ_DO_PACOTE')
def lib=new File(args[0]).canonicalFile,root=new File(args[1]).canonicalFile
String digest(File file){MessageDigest.getInstance('SHA-256').digest(file.bytes).encodeHex().toString()}
def nativeJar=new File(lib,'liberty-developer-core-1.0-SNAPSHOT.jar')
if(!nativeJar.isFile()||digest(nativeJar)!='947355f069a3d7a42f1cf20e994448d4e61a9d7e4b57704263fd652c8d79d708')throw new IllegalStateException('JAR original ausente ou incompativel; nenhuma compilacao executada.')
def groovy=new File(lib,'groovy-all-2.4.2.jar')
def assist=lib.listFiles().findAll{it.name.startsWith('javassist-')&&it.name.endsWith('.jar')}
if(!groovy.isFile()||assist.size()!=1)throw new IllegalStateException('Bibliotecas locais Groovy/Javassist ausentes ou ambiguas.')
def target=new File(root,'complementos/paginas'),out=new File(target,'classes')
def source=new File(root,'fontes-complementos/server-pages/PrintPages.groovy')
if(!source.isFile()||!new File(target,'instalar.sh').isFile())throw new IllegalStateException('Raiz de pacote invalida.')
if(out.exists())throw new IllegalStateException('A pasta classes ja existe. Use uma copia nova para nao sobrescrever uma compilacao anterior.')
out.mkdirs()
def config=new CompilerConfiguration();config.targetDirectory=out;config.targetBytecode='1.7'
new GroovyClassLoader(this.class.classLoader,config).parseClass(source.getText('UTF-8').replace('\uFEFF',''))
def pool=new ClassPool(true);pool.appendClassPath(nativeJar.path);pool.appendClassPath(groovy.path);pool.appendClassPath(assist[0].path);pool.appendClassPath(out.path)
def ct=pool.get('mv.editor.core.groovy.JasperParser');ct.getDeclaredMethod('buildReport').setName('buildReportNative')
ct.addMethod(CtNewMethod.make('public static String buildReport(Object layout, String url) { return local.mveditor.compat.PrintPages.prepare(layout, buildReportNative(layout,url)); }',ct));ct.writeFile(out.path)
def files=[new File(target,'instalar.sh'),new File(target,'mveditor-page-breaks-version.txt')]
out.eachFileRecurse{if(it.isFile()&&it.name.endsWith('.class'))files.add(it)}
String manifest=files.sort{it.path}.collect{digest(it)+'  '+target.toPath().relativize(it.toPath()).toString().replace('\\','/')+'\n'}.join('')
new File(target,'payload.sha256').setText(manifest,'UTF-8')
println 'Compilacao local concluida. Nenhum arquivo da instalacao MV foi alterado.'
println 'O resultado derivado do MV fica somente neste ambiente; nao publique classes nem JARs do fornecedor.'

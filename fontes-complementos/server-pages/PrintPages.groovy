package local.mveditor.compat
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult
import org.xml.sax.InputSource
/** Only layouts explicitly prepared by HTML opt in. No SQL, persistence or network. */
class PrintPages {
 static String prepare(Object layout,String jrxml){
  String source=mv.editor.core.groovy.ContentHelper.XMLToString(layout)
  if(!(source =~ /<BAND\b[^>]*\bmvPageBreaks=['"]explicit-v1['"]/).find())return jrxml
  def factory=DocumentBuilderFactory.newInstance();factory.namespaceAware=true
  factory.setFeature('http://apache.org/xml/features/disallow-doctype-decl',true)
  factory.setFeature('http://xml.org/sax/features/external-general-entities',false)
  factory.setFeature('http://xml.org/sax/features/external-parameter-entities',false)
  def doc=factory.newDocumentBuilder().parse(new InputSource(new StringReader(jrxml)))
  def detail=doc.getElementsByTagNameNS('*','detail').item(0)
  if(detail==null)return jrxml
  def bands=[];for(def n=detail.firstChild;n!=null;n=n.nextSibling)if(n.nodeType==1&&n.localName=='band')bands.add(n)
  boolean first=true
  for(def band:bands){
   if(band.getElementsByTagNameNS('*','reportElement').length==0)continue
   band.setAttribute('splitType','Prevent')
   if(!first){
    def spacer=doc.createElementNS(detail.namespaceURI,'band');spacer.setAttribute('height','1')
    def pageBreak=doc.createElementNS(detail.namespaceURI,'break');pageBreak.setAttribute('type','Page')
    def element=doc.createElementNS(detail.namespaceURI,'reportElement')
    ['x':'0','y':'0','width':'1','height':'1'].each{k,v->element.setAttribute(k,v)}
    pageBreak.appendChild(element);spacer.appendChild(pageBreak);detail.insertBefore(spacer,band)
   }
   first=false
  }
  def out=new StringWriter();TransformerFactory.newInstance().newTransformer().transform(new DOMSource(doc),new StreamResult(out));return out.toString()
 }
}


package local.mveditor.compat;
import java.io.InputStream;
import java.security.MessageDigest;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.RuntimeBeanReference;
import org.apache.commons.logging.LogFactory;
import mv.editor.core.controller.manager.impl.LayoutManager;
/** Replaces one existing bean definition; does not expose a new endpoint. */
public final class SafeDeleteInstaller implements BeanFactoryPostProcessor {
 public void postProcessBeanFactory(ConfigurableListableBeanFactory factory) throws BeansException {
  try {
   InputStream in=LayoutManager.class.getResourceAsStream("LayoutManager.class");
   if(in==null)throw new IllegalStateException("Classe original nao localizada.");
   MessageDigest md=MessageDigest.getInstance("SHA-256");byte[] buffer=new byte[8192];int length;
   try{while((length=in.read(buffer))!=-1)md.update(buffer,0,length);}finally{in.close();}
   byte[] digest=md.digest();char[] digits="0123456789abcdef".toCharArray();char[] chars=new char[digest.length*2];for(int i=0;i<digest.length;i++){chars[i*2]=digits[(digest[i]&255)>>>4];chars[i*2+1]=digits[digest[i]&15];}String hex=new String(chars);
   if(!"b24ea73ef81f07f536166c4fd6b6045c8db647be587a066baed1003f628ade89".equals(hex.toString()))throw new IllegalStateException("Versao do LayoutManager diferente da analisada; extensao nao aplicada.");
   if(!factory.containsBeanDefinition("layoutManager"))throw new IllegalStateException("Bean layoutManager nao localizado.");
   BeanDefinition bean=factory.getBeanDefinition("layoutManager");
   if(!LayoutManager.class.getName().equals(bean.getBeanClassName()))throw new IllegalStateException("Bean layoutManager ja foi substituido; extensao nao aplicada.");
   bean.setBeanClassName(SafeReportLayoutManager.class.getName());
   bean.getPropertyValues().add("safeSessionFactory",new RuntimeBeanReference("sessionFactory"));
   bean.getPropertyValues().add("safeTransactionManager",new RuntimeBeanReference("transactionManager"));
   LogFactory.getLog(SafeDeleteInstaller.class).info("SAFE_REPORT_DELETE installed for tested LayoutManager; original authentication and transactions retained");
  }catch(Exception e){throw new BeanInitializationException("Nao foi possivel ativar a exclusao protegida de relatorios",e);}
 }
}

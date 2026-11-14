package local.mveditor.compat;

import java.util.ArrayList;
import java.util.List;
import mv.editor.core.controller.manager.impl.LayoutManager;
import mv.editor.core.entity.EditorLayout;
import mv.editor.core.entity.EditorLayoutCampo;
import mv.editor.core.exception.BusinessException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/** Opt-in compatibility extension; uses the existing authenticated deletion path. */
public class SafeReportLayoutManager extends LayoutManager {
    private SessionFactory safeSessionFactory;
    private PlatformTransactionManager safeTransactionManager;
    private static final Log LOG = LogFactory.getLog(SafeReportLayoutManager.class);
    public void setSafeSessionFactory(SessionFactory value) { safeSessionFactory=value; }
    public void setSafeTransactionManager(PlatformTransactionManager value) { safeTransactionManager=value; }

    public void deleteLayout(final EditorLayout layout) throws BusinessException {
        if (!layout.isReport()) { deleteNative(layout); return; }
        if (layout.getCdLayout()==null || layout.getCdLayout().longValue()<=0
                || layout.getVersaoDocumento()==null
                || !Boolean.TRUE.equals(layout.getVersaoDocumento().isTest()))
            throw new IllegalStateException("Exclusao protegida exige Relatorio de uma versao de teste.");
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || TransactionSynchronizationManager.isCurrentTransactionReadOnly())
            throw new IllegalStateException("Exclusao protegida exige a transacao de escrita original do MV.");
        if (safeSessionFactory==null || safeTransactionManager==null)
            throw new IllegalStateException("Extensao de exclusao nao configurada.");
        try {
            new TransactionTemplate(safeTransactionManager).execute(new TransactionCallback<Object>() {
                public Object doInTransaction(TransactionStatus status) {
                    try {
                        preserveSharedFields(layout, safeSessionFactory.getCurrentSession());
                        deleteNative(layout);
                        safeSessionFactory.getCurrentSession().flush();
                        return null;
                    } catch (BusinessException e) { throw new NativeFailure(e); }
                }
            });
        } catch (NativeFailure e) { throw e.original; }
    }
    protected void deleteNative(EditorLayout layout) throws BusinessException { super.deleteLayout(layout); }

    static int preserveSharedFields(EditorLayout layout, Session session) {
        // Serialize deletions of this layout. Do not touch XML, field values or other layouts.
        List<?> locks=session.createSQLQuery("SELECT CD_LAYOUT FROM DBAMV.EDITOR_LAYOUT WHERE CD_LAYOUT=:layout FOR UPDATE NOWAIT")
                .setLong("layout",layout.getCdLayout().longValue()).list();
        if (locks.size()!=1) throw new IllegalStateException("Relatorio nao localizado para exclusao.");
        List<EditorLayoutCampo> links=new ArrayList<EditorLayoutCampo>(layout.getLayoutCampos());
        List<EditorLayoutCampo> shared=new ArrayList<EditorLayoutCampo>();
        for (EditorLayoutCampo link:links) {
            if (link.getPk()==null || !layout.getCdLayout().equals(link.getPk().getCdLayout())
                    || link.getCampo()==null || !link.getCampo().getCdCampo().equals(link.getPk().getCdCampo()))
                throw new IllegalStateException("Associacao de campo inconsistente. Exclusao cancelada.");
            Number count=(Number)session.createSQLQuery("SELECT COUNT(*) FROM DBAMV.EDITOR_LAYOUT_CAMPO WHERE CD_CAMPO=:field AND CD_LAYOUT<>:layout")
                    .setLong("field",link.getPk().getCdCampo().longValue())
                    .setLong("layout",layout.getCdLayout().longValue()).uniqueResult();
            if (count.longValue()>0) shared.add(link);
        }
        // Exclude shared fields from the native delete loop BEFORE it can delete their values.
        for (EditorLayoutCampo link:shared) {
            session.delete(link);
            if (!layout.getLayoutCampos().remove(link)) throw new IllegalStateException("Falha ao separar campo compartilhado.");
        }
        session.flush();
        if (!shared.isEmpty()) LOG.info("SAFE_REPORT_DELETE layout="+layout.getCdLayout()+" sharedLinks="+shared.size()+" (native deletion pending in same transaction)");
        return shared.size();
    }
    private static final class NativeFailure extends RuntimeException {
        private static final long serialVersionUID=1L;
        final BusinessException original;
        NativeFailure(BusinessException e) { super(e); original=e; }
    }
}

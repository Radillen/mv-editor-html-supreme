# Preparar o complemento de paginação localmente

Desenvolvido por Rodrigo Amorim Dillemburg.

A publicação pública inclui os fontes dos auxiliares, mas **não inclui a classe JasperParser adaptada do fornecedor**. Ela deve ser gerada localmente a partir do JAR original da instalação autorizada e compatível do destinatário. Não publique o resultado no GitHub.

1. Confira a assinatura da cópia pública original antes de personalizar.
2. Identifique o Java usado pela instalação e a pasta `forms/WEB-INF/lib` correta. O script confere o hash do JAR; não force outra versão.
3. Na raiz extraída do pacote, ajuste os caminhos abaixo. Os nomes são exemplos, não são os caminhos do autor:

```bash
MV_LIB=/CAMINHO/DO/MV/forms/WEB-INF/lib
MV_JAVA=/CAMINHO/DO/JAVA/bin/java
MV_PACOTE="$PWD"

"$MV_JAVA" -cp "$MV_LIB/*" groovy.ui.GroovyMain ferramentas/CompilarPaginacao.groovy "$MV_LIB" "$MV_PACOTE"
```

O backend de referência usa Java 7, Groovy 2.4.2 e Javassist local. O script gera classes compatíveis com Java 7, utiliza as bibliotecas da instalação e não altera o JAR nem o servidor. Execute com o Java compatível desse ambiente; versões recentes de Java podem ser incompatíveis com as bibliotecas antigas.

4. Confira o resultado:

```bash
(cd complementos/paginas && sha256sum -c payload.sha256)
```

5. Só então siga a conferência e a instalação descritas em `01-INSTALAR-NO-LINUX.md`. Compilar não instala nem exige parar o servidor; a aplicação do complemento exige a parada indicada no guia.

Se a pasta `classes` já existir, a compilação para sem sobrescrever. Para repetir, use uma cópia nova extraída e previamente verificada do pacote. Guarde os arquivos gerados e os backups usados na implantação para permitir a reversão.

A assinatura da distribuição cobre os fontes publicados. Os arquivos gerados e seu `payload.sha256` são uma compilação local, não um binário assinado pelo autor. `.gitignore` evita que sejam adicionados normalmente pelo Git, mas você ainda precisa conferir os arquivos enviados pelo site do GitHub, que não aplica esse filtro ao arrastar arquivos.

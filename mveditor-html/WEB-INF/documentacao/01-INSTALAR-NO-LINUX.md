# Instalação no Linux — Docs Editor Supreme Version

Desenvolvido por Rodrigo Amorim Dillemburg.

## 1. Requisitos e compatibilidade

Este pacote é um cliente complementar, não um servidor MV independente. O destinatário precisa de uma instalação autorizada do MV Editor, acesso administrativo ao Tomcat e autorização para instalar e validar os componentes no seu ambiente.

A referência dos complementos é **MV Editor 2020.006.09 / Java 7 / Tomcat 7.0.65**, com este SHA-256 do arquivo original `liberty-developer-core-1.0-SNAPSHOT.jar`:

```text
947355f069a3d7a42f1cf20e994448d4e61a9d7e4b57704263fd652c8d79d708
```

O HTML depende das assinaturas dos serviços AMF existentes. Outras versões precisam de verificação técnica; não há garantia de compatibilidade universal. Os instaladores dos complementos recusam outro hash. Não retire a verificação e não force a cópia de classes/JARs para outro backend.

Use navegador Chromium moderno ou Firefox moderno. O leitor PDF incluído é mais recente que o navegador da época do Flash. Comece em homologação, usando documentos de teste próprios, sem publicar modelos clínicos antes da conferência.

## 2. Conferir o pacote e guardar backup

Extraia o ZIP no computador ou numa pasta persistente de manutenção no Linux. Não execute o ZIP diretamente. Leia LICENCA.txt, AUTORIA.txt e AGENTS.md antes de adaptar ou redistribuir.

Na raiz extraída, antes de editar a configuração:

```bash
sha256sum -c SHA256SUMS
```

Todos os arquivos devem informar OK. Se houver Node.js 18+ disponível, pode conferir também a assinatura:

```bash
node verificar-assinatura.cjs
```

Compare o fingerprint da chave pública com o informado diretamente pelo autor. A verificação local de uma chave trocada junto com o pacote não comprova procedência. Verificar integridade depois de personalizar config.js apontará a personalização como uma alteração esperada; guarde uma cópia original conferida.

Faça backup do diretório HTML anterior, do descritor do contexto, dos arquivos do original que serão afetados e siga a política de backup/restauração do banco do ambiente. Os complementos criam seus próprios backups de controle, cujos caminhos devem ser guardados.

## 3. Identificar os caminhos corretos

No Linux:

```bash
ps -eo pid,args | grep '[o]rg.apache.catalina.startup.Bootstrap'
```

Identifique o `-Dcatalina.base` da instância correta e o docBase do contexto original `mveditor.xml`. A pasta original deve conter `WEB-INF/lib/liberty-developer-core-1.0-SNAPSHOT.jar`.

Defina os caminhos abaixo com os valores reais do destinatário. Não copie literalmente `/CAMINHO/...`:

```bash
MV_FORMS=/CAMINHO/DA/APLICACAO/ORIGINAL/forms
MV_TOMCAT=/CAMINHO/DA/INSTANCIA/TOMCAT
MV_HTML=/CAMINHO/PARA/mveditor-html
MV_PACOTE=/CAMINHO/DO/PACOTE/EXTRAIDO
```

Confira os arquivos e o Java usado por essa instância:

```bash
ls -l "$MV_FORMS/WEB-INF/lib/liberty-developer-core-1.0-SNAPSHOT.jar"
ls -l "$MV_TOMCAT/conf/server.xml"
sha256sum "$MV_FORMS/WEB-INF/lib/liberty-developer-core-1.0-SNAPSHOT.jar"
```

## 4. Publicar o HTML num contexto separado

Copie **a pasta mveditor-html inteira**, incluindo `vendor` e `WEB-INF`, para o destino escolhido em MV_HTML. `index.html` deve ficar diretamente dentro dela. Não copie sobre o aplicativo original. Em uma atualização, substitua a pasta estática completa após guardar o backup.

O usuário de execução do Tomcat precisa ter acesso de leitura e passagem pelos diretórios. Use o padrão de proprietário e permissões da instalação; não é necessário abrir escrita para todos.

Abra `tomcat/mveditor-html.xml` do pacote e substitua o valor de docBase pelo caminho absoluto escolhido para MV_HTML. O modelo utiliza `/opt/docs-editor/mveditor-html` apenas como exemplo.

Copie esse descritor, com o nome **mveditor-html.xml**, para a pasta de contextos da instância. O destino usual, se Engine=Catalina e Host=localhost, é:

```text
PASTA_DA_INSTANCIA/conf/Catalina/localhost/mveditor-html.xml
```

Não substitua `mveditor.xml`, `server.xml` ou arquivos globais do Tomcat. Se a pasta escolhida for o próprio appBase do Host, use o modo de deploy da instalação e evite publicar duas vezes o mesmo diretório por autoDeploy e descritor.

Se o Host não faz deploy automático, publique pelo procedimento de administração do servidor. Um primeiro deploy ou reload pode exigir reiniciar essa instância e deve ser programado. Uma simples atualização posterior de arquivos HTML/JS/CSS não exige reiniciar o Tomcat.

## 5. Configuração e autenticação

Em `mveditor-html/config.js`, o padrão é:

```javascript
originalBase: '/mveditor/'
```

Se o contexto original tiver outro nome, ajuste originalBase mantendo a mesma origem: protocolo, host e porta devem ser iguais para original e HTML. O arquivo distribuído não traz parâmetros de atendimento/paciente/usuário nem códigos de cabeçalho/rodapé do desenvolvedor. Configure parâmetros próprios na interface de Teste e Prévia.

Acesse:

```text
http://SERVIDOR:PORTA/mveditor-html/
```

Faça login com um usuário MV autorizado. O cliente usa os serviços originais; não cria um banco de usuários nem exige senha Oracle no navegador.

**CAS:** se houver autenticação central, copie somente `original-login/mveditor-html-auth.html` para a raiz da aplicação original, ao lado do index.html dela. A página usa os filtros de autenticação já existentes. Não substitua o index nem desative os filtros. Se o contexto HTML tiver outro nome, ajuste o link de retorno dessa página.

O original também deve ser acessível pela mesma origem. Se o login redireciona para a porta 80/443, publique os dois contextos pelo mesmo proxy. Não copie URLs temporárias com ticket ou jsessionid.

## 6. Complementos de paginação e exclusão

**Publicação GitHub:** a classe adaptada do MV não acompanha este pacote. Antes da conferência do complemento de páginas, siga `PREPARAR-PAGINACAO-LOCAL.md` na raiz do repositório. Não tente instalar páginas sem essa preparação.

Os complementos alteram arquivos do aplicativo original e exigem uma janela de parada da instância. Os scripts não param nem iniciam serviços automaticamente. Se o ambiente já tiver essas mesmas extensões instaladas, não reaplique para sobrescrever: confira a instalação existente e os backups antes de qualquer mudança.

Primeiro faça as duas conferências, sem alterar nada:

```bash
bash "$MV_PACOTE/complementos/paginas/instalar.sh" "$MV_FORMS" "$MV_TOMCAT"
bash "$MV_PACOTE/complementos/exclusao/instalar.sh" "$MV_FORMS" "$MV_TOMCAT"
```

Se alguma recusar a versão ou detectar conflito, pare aqui e peça avaliação técnica. Não use o marcador de versão para simular uma instalação e não copie o JAR original de outro servidor para passar na conferência.

Com as conferências aprovadas, pare somente a instância correta pelo procedimento local. Em instalações que dispõem do utilitário `tomcatctl` e usam 8030, o exemplo é `tomcatctl stop 8030`; em outros ambientes utilize a rotina correspondente.

Com a instância confirmadamente parada:

```bash
bash "$MV_PACOTE/complementos/exclusao/instalar.sh" "$MV_FORMS" "$MV_TOMCAT" --apply
bash "$MV_PACOTE/complementos/paginas/instalar.sh" "$MV_FORMS" "$MV_TOMCAT" --apply
```

Guarde os dois caminhos de backup exibidos. Inicie a mesma instância pelo procedimento local (exemplo, se disponível: `tomcatctl start 8030`). Aguarde a inicialização; um primeiro connection refused pode indicar que o Tomcat ainda está iniciando. Confira os logs se não normalizar.

Teste usando o host, porta e contexto corretos. Exemplo local para 8030:

```bash
curl -fsS http://127.0.0.1:8030/mveditor/mveditor-page-breaks-version.txt
```

Resposta esperada: `PRINT_PAGES_EXPLICIT_V1`.

Para a extensão de exclusão, procure a inicialização e eventuais falhas:

```bash
grep -a 'SAFE_REPORT_DELETE' "$MV_TOMCAT/mv-logs/mveditor.log" | tail -n 10
grep -a -E 'BeanCreationException|SafeDeleteInstaller|UnsupportedClassVersionError' "$MV_TOMCAT/logs/catalina.out" | tail -n 30
```

O marcador de páginas confirma os arquivos publicados, não substitui o teste de impressão. A ausência de uma mensagem de log de exclusão também não confirma, isoladamente, sucesso ou falha: valide a operação e a preservação dos vínculos numa cópia descartável.

## 7. Endereço sem a porta

Se Apache/Nginx já encaminha o contexto original, peça ao administrador que encaminhe também `/mveditor-html` e `/mveditor-html/` à mesma instância, seguindo a configuração existente. Não substitua o VirtualHost inteiro por um exemplo.

No caso específico de Apache com mod_jk, os dois caminhos novos devem usar o mesmo worker do original. Exemplo a adaptar, dentro do VirtualHost apropriado:

```apache
JkMount /mveditor-html WORKER_EXISTENTE_DO_MVEDITOR
JkMount /mveditor-html/* WORKER_EXISTENTE_DO_MVEDITOR
```

Confira a sintaxe pelo procedimento local antes de recarregar o Apache. O worker, o host e a porta do exemplo não são universais.

## 8. Validação e atualização

Use Ctrl+F5 no HTML. Confirme crédito do autor, repositórios e seleção da Tela correta antes de importar. Faça os testes de 02-USO-E-LIMITES.md. Valide as permissões de usuários diferentes, a autenticação e o PDF no ambiente real antes de liberar para uso amplo.

O material de desenvolvimento usa simulações locais. Compatibilidade do backend foi conferida com um ambiente específico; instalar em outra organização exige essa validação própria. Atualizações do fornecedor podem exigir nova avaliação dos complementos.

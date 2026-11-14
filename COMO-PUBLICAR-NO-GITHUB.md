# Como publicar este projeto no seu GitHub

Desenvolvido por Rodrigo Amorim Dillemburg — By @Radillen.

Este guia é para publicar o código. Quem quiser instalar no MV deve começar por `00-COMECE-AQUI-OUTRO-SERVIDOR.md` e seguir `01-INSTALAR-NO-LINUX.md`.

## 1. Use somente esta pasta revisada

Extraia `mv-editor-html-supreme-github-pronto.zip` em uma pasta separada. Você deve encontrar `README.md`, `mveditor-html/`, `LICENCA.txt` e os demais arquivos diretamente nessa pasta.

Não utilize a pasta original de desenvolvimento nem um ZIP anterior de implantação. Não acrescente documentos, capturas, logs, senhas, tokens, sua chave privada, arquivos do MV original ou as classes geradas localmente. Este pacote público tem um conjunto específico de arquivos revisados.

## 2. Crie o repositório

1. Entre na sua conta do GitHub.
2. No botão `+`, escolha **New repository**.
3. Sugestão de nome: **mv-editor-html-supreme**.
4. Sugestão de descrição: **Cliente HTML complementar para MV Editor, com importação de documentos, tabelas e preparação de impressão. Desenvolvido por Rodrigo Amorim Dillemburg.**
5. Escolha **Public**, se quer disponibilizar o código publicamente.
6. Como este pacote já contém README, .gitignore e licença, não gere outros arquivos iniciais nem selecione outra licença automática.
7. Clique em **Create repository**.

Não precisa configurar GitHub Pages: ele não substitui o backend MV.

## 3. Envie os arquivos extraídos

Na página inicial do novo repositório, use o link para enviar um arquivo existente ou **Add file → Upload files**.

Envie o conteúdo da pasta extraída, preservando as subpastas. Não envie somente o ZIP se quiser que o código e o README apareçam navegáveis. Não envie a pasta de desenvolvimento completa.

O GitHub permite até 100 arquivos por envio pelo navegador. Este projeto ultrapassa esse total. Faça dois envios:

1. Envie primeiro a pasta `mveditor-html` inteira.
2. Depois envie os arquivos da raiz e as demais pastas, sem repetir `mveditor-html`.

Confira se cada envio respeita o limite e se o GitHub manteve a estrutura das pastas. Se necessário, divida em mais envios. Na mensagem do primeiro envio, use, por exemplo, **Publicação inicial do MV Editor HTML Supreme Version** e confirme a gravação ou a proposta de alterações conforme a tela e as permissões do repositório.

O arquivo `.gitignore` começa com ponto e pode ficar oculto no seu gerenciador de arquivos. Inclua-o também. Ele ajuda nos próximos envios pelo Git, mas não impede o envio manual de arquivos pelo navegador.

## 4. Confira depois de publicar

- O README deve aparecer na página principal, com sua autoria.
- `mveditor-html/index.html` e `mveditor-html/vendor/` devem estar presentes.
- Os guias de instalação, licença, atribuições e assinatura devem acompanhar o código.
- Preserve `mveditor-html/WEB-INF/autoria/` e os avisos dentro dos arquivos.
- Não deve existir `complementos/paginas/classes/` nem o JAR original do MV no repositório público.
- O JAR próprio `complementos/exclusao/mveditor-safe-report-delete-1.0.jar` já pertence ao conjunto revisado e deve acompanhar esse complemento.

Quem baixar usa **Code → Download ZIP**, extrai o pacote e segue o README. O login será pelo próprio servidor MV da instituição, não pelo GitHub e não com credenciais do autor.

## 5. Atualizações e autoria

Edite uma cópia limpa deste projeto. Antes de cada envio, revise a lista de arquivos e não inclua configurações de uma instalação real. Não publique resultados de compilações que incorporam classes do MV.

A assinatura confirma os arquivos da distribuição original quando comparados com a chave pública confiável do autor. Uma alteração legítima muda os hashes; não altere a assinatura para apresentar um pacote modificado como original. Não publique a chave privada para permitir que outras pessoas assinem.

Créditos e instruções internas registram as condições da licença. Não são um bloqueio técnico contra edição. Contribuidores podem descrever suas próprias contribuições preservando a autoria original.

## Referências oficiais

- [Criar um repositório](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [Enviar arquivos e limites pelo navegador](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

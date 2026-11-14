# Reversão e retirada

## HTML

Retire o contexto `mveditor-html` pelo procedimento normal de undeploy da instalação e restaure a pasta/descritor anteriores a partir do backup, se houver. Não retire nem substitua o contexto original `mveditor`. Reverta também somente as rotas novas do proxy, caso tenham sido adicionadas.

## Complementos

Pare somente a instância correta. Use os caminhos exatos dos backups exibidos por cada instalador. Exemplo a preencher:

```bash
bash /PASTA/DO/PACOTE/complementos/paginas/instalar.sh /FORMS/ORIGINAL /INSTANCIA/TOMCAT --rollback /BACKUP/DE/PAGINAS
bash /PASTA/DO/PACOTE/complementos/exclusao/instalar.sh /FORMS/ORIGINAL /INSTANCIA/TOMCAT --rollback /BACKUP/DE/EXCLUSAO
```

Depois inicie a mesma instância pelo procedimento local. Os scripts conferem hashes e recusam sobrescrever modificações posteriores. Não substitua a conferência por remoção manual de arquivos desconhecidos.

A retirada não desfaz documentos já salvos, registros preenchidos ou relatórios excluídos. Restaurar dados é um procedimento separado do banco e da aplicação. Após retirar a extensão de páginas, relatórios marcados voltam ao comportamento do conversor nativo até serem tratados pelo responsável.

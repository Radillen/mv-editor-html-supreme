# MV Editor HTML — Supreme Version | By @Radillen

**Desenvolvido por Rodrigo Amorim Dillemburg.** Cliente complementar em HTML/JavaScript para uma instalação compatível do MV Editor, dispensando o Flash no navegador.

## O que oferece

- Importação de textos, linhas e molduras de PDF e DOCX como ponto de partida editável.
- Criação de tabelas com títulos, colunas e linhas, movimentação do conjunto e ajuste dos divisores.
- Alinhamento, padronização e ampliação de vários objetos.
- Visualização das folhas, áreas reservadas e quebras durante a edição.
- Prévia dos valores obtidos pelos parâmetros do MV no editor.
- Preparação do Relatório para impressão e preservação de campos compartilhados na exclusão, com os complementos compatíveis.

Arquivos escaneados precisam de OCR externo; imagens, curvas e fontes de um documento importado podem não ser reproduzidas integralmente. Confira os limites em [02-USO-E-LIMITES.md](02-USO-E-LIMITES.md).

Para publicar este pacote na sua conta, siga [COMO-PUBLICAR-NO-GITHUB.md](COMO-PUBLICAR-NO-GITHUB.md).

## Instalação em outro IP ou servidor

1. Comece por [00-COMECE-AQUI-OUTRO-SERVIDOR.md](00-COMECE-AQUI-OUTRO-SERVIDOR.md).
2. Siga [01-INSTALAR-NO-LINUX.md](01-INSTALAR-NO-LINUX.md) para caminhos, Tomcat, autenticação e proxy.
3. Antes da etapa de instalação do complemento de páginas, siga [PREPARAR-PAGINACAO-LOCAL.md](PREPARAR-PAGINACAO-LOCAL.md).
4. Valide num ambiente de teste próprio antes de liberar o uso. A impressão final precisa de conferência no MV do destinatário.

O HTML usa o endereço atual do servidor e o contexto configurado. Não existe IP do desenvolvedor embutido na configuração pública. HTML e serviços originais precisam ser acessíveis pela mesma origem.

**Não é um sistema MV independente, nem funciona integralmente em GitHub Pages.** É necessário o backend original autorizado. A referência dos complementos é MV Editor 2020.006.09 / Java 7 / Tomcat 7.0.65, com o hash descrito no guia. Não há garantia de compatibilidade com outras versões; não force os instaladores quando recusarem o ambiente.

## Estrutura

- `mveditor-html/`: cliente, bibliotecas locais e créditos internos.
- `tomcat/` e `original-login/`: modelos de publicação e retorno CAS.
- `complementos/`: instaladores; a paginação exige preparação local.
- `fontes-complementos/` e `ferramentas/`: fontes e preparação dos auxiliares.
- `LICENCA.txt`, `AUTORIA.txt`, `AGENTS.md` e `TERCEIROS.md`: condições e atribuições.
- `REVISAO-PUBLICACAO.md`: escopo da revisão do pacote para publicação.
- `SHA256SUMS` e arquivos de assinatura: conferência da cópia distribuída pelo autor.

## Autoria e uso gratuito

Uso gratuito e adaptações são permitidos nos termos de [LICENCA.txt](LICENCA.txt), com preservação do crédito **Desenvolvido por Rodrigo Amorim Dillemburg**. Contribuidores podem identificar suas alterações sem substituir a autoria original. Esta é uma licença própria; não significa domínio público nem substitui as licenças dos terceiros.

Os avisos também acompanham os arquivos do cliente, `mveditor-html/AGENTS.md` e `mveditor-html/WEB-INF/autoria/`. Eles registram as condições de uso; não impedem tecnicamente a edição nem garantem que toda IA os cumpra.

Projeto independente, sem vínculo oficial ou patrocínio do fornecedor do MV. Não estão incluídos JARs originais do MV, banco, documentos clínicos ou credenciais de instalação. Bibliotecas incluídas mantêm suas licenças: consulte [TERCEIROS.md](TERCEIROS.md).

## Verificar o pacote do autor

Antes de personalizar, na raiz extraída:

```bash
sha256sum -c SHA256SUMS
node verificar-assinatura.cjs
```

A segunda conferência é opcional e requer Node.js 18+. Compare o fingerprint público com o divulgado diretamente pelo autor. Arquivos modificados legitimamente deixam de coincidir com a distribuição assinada; a assinatura não impede alterações. Nunca publique uma chave privada, configurações reais ou os binários gerados a partir do MV.

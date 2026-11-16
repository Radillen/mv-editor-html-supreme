# MV Editor HTML — Supreme Version | By @Radillen

**Interface HTML e melhorias por Rodrigo Amorim Dillemburg, com assistência de IA.**

Módulo complementar para uma instalação compatível do MV Editor. Oferece uma interface em HTML/JavaScript para editar documentos sem depender do Flash no navegador.

O projeto foi construído a partir da análise do funcionamento do editor original e utiliza os serviços do backend MV existente. Não substitui nem representa uma reimplementação completa do sistema MV.

## O que oferece

- Importação de textos, linhas e molduras de PDF e DOCX como ponto de partida editável.
- Compatibilidade de importação PDF com o perfil testado do Cent Browser, incluindo leitor e worker.
- Conversão de fontes fora do perfil de impressão antes de medir o texto e montar a prévia da importação.
- Criação de tabelas com títulos, colunas e linhas, movimentação do conjunto e ajuste dos divisores.
- Alinhamento, padronização e ampliação de vários objetos.
- Visualização das folhas, áreas reservadas e quebras durante a edição.
- Prévia dos valores obtidos pelos parâmetros do MV no editor.
- Preparação do Relatório para impressão e preservação de campos compartilhados na exclusão, com os complementos compatíveis.

Arquivos escaneados precisam de OCR externo. Imagens, curvas e fontes de um documento importado podem não ser reproduzidas integralmente. Confira [02-USO-E-LIMITES.md](02-USO-E-LIMITES.md).

## Importação e fontes

O perfil de impressão utiliza Arial, Verdana, Times New Roman e Courier New. Famílias fora desse perfil, como Cambria ou Calibri isoladas, são substituídas por Arial. A troca ocorre antes da medição dos textos na importação de DOCX; a prévia e os objetos inseridos já utilizam a família convertida.

Para um layout antigo, abra a Tela, use **Corrigir estrutura de texto**, confira o espaço ocupado pelo texto e salve. Se já existir um Relatório, corrija e salve esse nó também ou gere um novo a partir da Tela ajustada. O botão atua somente no layout aberto e não troca novamente fontes que já pertencem ao perfil.

Mudar a fonte pode alterar a largura e as quebras do texto. A correção de um documento já montado preserva as posições; confira o resultado. Ter uma fonte no computador não significa que ela esteja disponível no Java/Jasper do servidor.

## Instalação em outro IP ou servidor

1. Comece por [00-COMECE-AQUI-OUTRO-SERVIDOR.md](00-COMECE-AQUI-OUTRO-SERVIDOR.md).
2. Siga [01-INSTALAR-NO-LINUX.md](01-INSTALAR-NO-LINUX.md) para caminhos, Tomcat, autenticação e proxy.
3. Antes da instalação do complemento de páginas, siga [PREPARAR-PAGINACAO-LOCAL.md](PREPARAR-PAGINACAO-LOCAL.md).
4. Valide em ambiente de teste antes de liberar o uso. A impressão final precisa de conferência no MV do destinatário.

O HTML usa o endereço atual do servidor e o contexto configurado. Não há IP do desenvolvedor ou parâmetros particulares de atendimento, paciente e cabeçalho/rodapé na configuração pública. HTML e serviços originais precisam ser acessíveis pela mesma origem.

Cada pessoa utiliza o usuário e senha do próprio MV da instituição, ou a autenticação central configurada no ambiente. O pacote não cria contas nem fornece credenciais de acesso.

**Não é um sistema MV independente, nem funciona integralmente em GitHub Pages.** É necessário o backend original autorizado. A referência dos complementos é MV Editor 2020.006.09 / Java 7 / Tomcat 7.0.65, com o hash descrito no guia. Outras versões exigem avaliação; não force instaladores que recusarem o ambiente.

## Atualizar uma instalação existente

Faça backup da pasta HTML e preserve as personalizações de `config.js` do servidor. Atualize os arquivos do cliente mantendo suas subpastas e licenças e use **Ctrl+F5**.

Não reinstale complementos Java somente para atualizar o HTML ou corrigir a importação/fontes. A atualização destes arquivos estáticos não exige reiniciar o Tomcat. A instalação inicial dos complementos segue o procedimento próprio, incluindo compatibilidade e parada quando indicada.

## Preparar a impressão

Monte a **Tela**, gere o **Relatório** e confira margens e quebras. No Relatório, abra a engrenagem no canto superior direito e use **Corrigir estrutura de texto** e **Preparar relatório para PDF**. Salve no MV e confira a impressão.

Se alterar a Tela depois de gerar o Relatório, as alterações não são sincronizadas automaticamente entre os dois layouts.

## Estrutura

- `mveditor-html/`: cliente, bibliotecas locais e créditos internos.
- `tomcat/` e `original-login/`: modelos de publicação e retorno CAS.
- `complementos/`: instaladores; a paginação exige preparação local.
- `fontes-complementos/` e `ferramentas/`: fontes e preparação dos auxiliares.
- `LICENCA.txt`, `AUTORIA.txt`, `AGENTS.md` e `TERCEIROS.md`: condições e atribuições.
- `REVISAO-PUBLICACAO.md`: escopo da revisão da distribuição pública.
- `SHA256SUMS` e arquivos de assinatura: conferência da cópia distribuída pelo autor.

## Autoria e uso gratuito

O uso gratuito e as adaptações das partes abrangidas pela licença estão descritos em [LICENCA.txt](LICENCA.txt), com preservação dos créditos. A autoria indicada neste projeto refere-se à interface HTML, integrações e melhorias, não ao sistema MV original.

Contribuidores podem identificar suas alterações sem substituir a autoria original. A licença própria não significa domínio público nem substitui as licenças de terceiros.

Os avisos também acompanham os arquivos do cliente, `mveditor-html/AGENTS.md` e `mveditor-html/WEB-INF/autoria/`. Eles registram as condições de uso; não impedem tecnicamente a edição nem garantem cumprimento por toda ferramenta de IA.

Projeto independente, sem vínculo oficial ou patrocínio do fornecedor do MV. Não estão incluídos JARs originais do MV, banco, documentos clínicos ou credenciais de instalação. Bibliotecas incluídas mantêm suas licenças: consulte [TERCEIROS.md](TERCEIROS.md).

## Verificar a distribuição

Antes de personalizar, na raiz extraída:

```bash
sha256sum -c SHA256SUMS
```

A conferência adicional é opcional e requer Node.js 18 ou superior:

```bash
node verificar-assinatura.cjs
```

Compare o fingerprint público com o divulgado diretamente pelo autor. Arquivos alterados legitimamente deixam de coincidir com a distribuição assinada; a assinatura não impede alterações. Nunca publique a chave privada, configurações reais ou os binários gerados a partir do MV.

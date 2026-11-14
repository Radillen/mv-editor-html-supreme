# Uso e limites

## Importar e gerar PDF

1. Crie um documento de teste e abra o nó Tela, vinculado ao MV.
2. Clique em Importar PDF / DOCX e escolha um arquivo local.
3. Confira a prévia; mantenha as páginas ou reorganize os blocos. Arraste no branco para selecionar e arraste por um texto selecionado para mover o bloco. Pode escolher a folha no seletor e usar Mover seleção.
4. Aplique no documento. Os elementos importados são textos e desenho estático, não campos do MV. Associe os campos preenchíveis depois, pelo repositório.
5. Selecione objetos da mesma folha para usar a moldura de oito alças: cantos proporcionais; laterais só largura; topo/base só altura. Nas alças laterais, o tamanho das letras é preservado. Ctrl+Z desfaz.
6. Salve a Tela e reabra para confirmar. Gere o Relatório pelo comando habitual, confira e salve. Se já existe Relatório, alterá-lo não é uma sincronização automática de todas as mudanças da Tela.
7. Teste com parâmetros próprios, salve o registro e gere o PDF. Confira conteúdo, divisão de páginas, preenchimento e impressão antes de publicar.

## Primeiros testes da instalação

- Original e HTML continuam acessíveis e autenticados.
- Usuário autorizado vê os repositórios esperados; usuário sem permissão não ganha acesso por usar o HTML.
- Salvar e reler uma alteração de texto/posição numa Tela de teste funciona também ao reabrir o original.
- Importar um PDF e um DOCX de teste não cria nem reutiliza campos de outros documentos.
- Um documento com duas folhas gera Relatório com as divisões escolhidas e PDF com a separação correta.
- Uma cópia descartável de relatório com campos compartilhados é excluída sem retirar campos nem conteúdo dos outros layouts. Não faça esse teste num documento em uso.

## Limites relevantes

A importação é aproximada: extrai textos e desenho simples de linhas/molduras. Não importa fotos, logos, curvas, texto PDF rotacionado nem campos preenchíveis. PDF escaneado precisa de OCR antes. Fontes substituídas, tabelas ou arquivos complexos podem exigir ajuste. DOCX depende da renderização no navegador. A prévia mostra a conversão antes da aplicação.

Até 25 MB por arquivo, 30 páginas e 8000 objetos; DOCX descompactado limitado a 80 MB. Arquivos protegidos por senha não são importados nesta versão.

A representação da folha considera geometria, áreas reservadas e quebras. Não é uma execução do Jasper a cada movimento; texto variável ou conteúdo que cresce precisa ser conferido no PDF real. SQL e regras continuam dependendo do backend e dos parâmetros fornecidos. A prévia não grava suas respostas no XML do layout.

A exclusão preserva vínculos compartilhados no cenário atendido, mas não elimina bloqueios de outros tipos, de versão publicada/histórico ou regras do MV. Nenhuma constraint é desativada. Nunca repita automaticamente uma exclusão ou gravação de resultado incerto.

Seleção e redimensionamento em conjunto exigem objetos da mesma folha e contêiner, sem a linha de quebra. A lateral direita pode ser redimensionada e guarda a preferência no navegador.

## Onde conferir erros

Mensagem no rodapé/faixa de avisos; logs da instância em `mv-logs/mveditor.log` e `logs/catalina.out`. 404 normalmente aponta para deploy/rota; redirecionamento de login ou 401/403 exige conferir autenticação e origem; fault AMF vem do serviço original. Não envie senhas, cookies ou dados clínicos para suporte.

## Fonte decimal após ampliar

O backend de referência exige tamanhos inteiros de fonte. A ampliação e a gravação normalizam esses valores para o inteiro positivo mais próximo. Para um layout já gravado com fonte decimal, abra o nó afetado, use **Corrigir estrutura de texto**, salve no MV e repita o teste de impressão. O botão corrige o layout aberto; não altera outros documentos e não recalcula as posições ou quebras. Valores como 10.137 passam a 10, e 11.8 passam a 12.

A revisão de formatação cobre também `leading` das caixas de texto e `LEADING` do texto formatado, além das fontes e espessuras. Esses atributos são inteiros no backend de referência. Coordenadas e dimensões que o conversor aceita como decimais são preservadas. Uma ampliação que ultrapasse a área útil da folha ainda exige ajustar o desenho ou a paginação.

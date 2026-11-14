Comece pelo README.md desta publicação GitHub. A paginação exige a preparação local descrita em PREPARAR-PAGINACAO-LOCAL.md.

# Docs Editor — Supreme Version 1.0

Desenvolvido por **Rodrigo Amorim Dillemburg**. Distribuição gratuita com preservação de autoria.

Para outro IP, domínio ou servidor, comece por **00-COMECE-AQUI-OUTRO-SERVIDOR.md** e depois siga **01-INSTALAR-NO-LINUX.md**. O projeto precisa do backend original do MV Editor; não é um servidor MV independente.

## Conteúdo

- `mveditor-html/`: cliente HTML/JavaScript completo, incluindo leitores locais de PDF e DOCX.
- `tomcat/mveditor-html.xml`: modelo de descritor do contexto; ajuste o caminho antes de instalar.
- `original-login/mveditor-html-auth.html`: retorno opcional de autenticação CAS.
- `complementos/paginas/`: paginação explícita para o backend compatível.
- `complementos/exclusao/`: preservação de campos compartilhados ao excluir relatórios.
- `fontes-complementos/`: fontes dos auxiliares desenvolvidos para os complementos.
- `02-USO-E-LIMITES.md`: uso, limites e teste inicial.
- `03-REVERTER.md`: como retirar os componentes.
- `LICENCA.txt`, `AUTORIA.txt`, `TERCEIROS.md`: condições de uso e créditos.
- `AGENTS.md`: orientações para ferramentas de IA manterem autoria e licença.
- `SHA256SUMS`, `SHA256SUMS.sig`, `ASSINATURA-PUBLICA.pem`: integridade e assinatura do pacote.
- `verificar-assinatura.cjs`: conferência opcional com Node.js 18 ou superior.

## Autoria e alterações

É permitido adaptar tecnicamente o projeto conforme a licença. Preserve o crédito original visível e os avisos nos arquivos. Quem modificar pode acrescentar seu nome e descrever suas alterações, sem substituir o autor original nem apresentar uma versão modificada como sendo a distribuição original.

`AGENTS.md` orienta IAs compatíveis; não impede que uma pessoa remova ou ignore instruções. A assinatura detecta modificações em uma cópia conferida com a chave pública confiável; não bloqueia a edição ou o funcionamento de uma versão modificada.

Nenhuma chave privada de assinatura é distribuída. Para confiar na assinatura, compare o fingerprint da chave pública com uma informação recebida diretamente do autor, por um canal independente. Substituir simultaneamente arquivos, chave e assinatura permite criar outra distribuição; a chave pública confiável identifica qual é a oficial.

## Dados e direitos de terceiros

A configuração distribuída não contém os atendimentos, pacientes, usuários e códigos de cabeçalho/rodapé usados no ambiente de desenvolvimento. Não estão incluídos banco, documentos clínicos, senhas, cookies ou os JARs originais de instalação do MV. Os complementos exigem a instalação original e o hash compatível descrito no guia. Bibliotecas e componentes do fornecedor não recebem nova licença por este pacote; consulte TERCEIROS.md.

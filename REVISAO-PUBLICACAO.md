# Revisão do pacote para publicação

Data: 16/11/2026. Autor: Rodrigo Amorim Dillemburg.

## Escopo

Esta revisão se aplica somente ao conteúdo deste pacote público, não à pasta de desenvolvimento completa nem a futuras alterações ou ao histórico de outro repositório.

Foram examinados os arquivos distribuídos, incluindo os arquivos internos do JAR próprio de exclusão, por padrões de chaves privadas, tokens de serviços, autenticação embutida em URL, cabeçalhos de autorização, senhas atribuídas como texto fixo, caminhos pessoais de Windows, endereços privados do ambiente de origem e exemplos identificáveis dos documentos de teste. A configuração pública foi conferida separadamente.

## Resultado

Não foram identificadas credenciais reais, chaves privadas ou dados clínicos no pacote final revisado. O campo de senha do login e os controles de PDF.js são código de interface; não contêm senha embutida. A chave pública de verificação e os hashes de compatibilidade são públicos e não concedem acesso.

Foram excluídos da publicação: banco, documentos clínicos, PDFs/DOCX de teste, capturas, logs, histórico Git local, arquivos de análise, chave privada de assinatura, configurações específicas do desenvolvedor, JARs originais do MV e a classe compilada adaptada JasperParser. O complemento de paginação pode ser preparado localmente conforme o guia, sem publicar o resultado.

As bibliotecas abertas incluídas conservam suas licenças. O JAR incluído em complementos/exclusao contém somente as classes auxiliares próprias e seu manifesto. Não é o JAR original do MV.

## Limites

A varredura por padrões e a revisão manual não são uma prova matemática de ausência de todo segredo ou uma auditoria de segurança completa do produto. Antes de publicar alterações futuras, revise também os novos arquivos, sua configuração e os arquivos exibidos pelo GitHub. Nunca envie a pasta de desenvolvimento completa.

As instruções de autoria estão na raiz, nos avisos dos arquivos originais, em mveditor-html/AGENTS.md e em mveditor-html/WEB-INF/autoria/. Elas não são credenciais, não constituem bloqueio técnico e não garantem cumprimento por toda ferramenta de IA.

## Atualização desta revisão

A cópia pública usa o cliente atual e uma configuração genérica. Guias e complementos anteriores foram conferidos contra o manifesto assinado do autor. A chave privada de assinatura permanece fora do pacote. Esta revisão não abrange o histórico remoto do GitHub nem arquivos enviados separadamente pelo navegador.

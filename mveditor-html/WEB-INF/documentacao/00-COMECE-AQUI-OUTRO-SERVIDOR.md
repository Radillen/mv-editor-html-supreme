# Instalar em outro servidor ou hospital

Desenvolvido por Rodrigo Amorim Dillemburg.

## O IP pode ser diferente

O pacote de compartilhamento não fica preso ao IP do desenvolvedor. Ele usa o endereço pelo qual você abriu o editor. Não é necessário procurar e substituir IP nos arquivos JavaScript.

Exemplo fictício: se o MV original do destinatário abre em:

```text
http://192.0.2.10:8080/mveditor/
```

O HTML deve ser publicado na mesma origem e abrir em:

```text
http://192.0.2.10:8080/mveditor-html/
```

Nesse caso, mantenha em `mveditor-html/config.js`:

```javascript
originalBase: '/mveditor/'
```

O navegador combina esse caminho com o endereço atual. IP, nome do servidor, protocolo e porta acompanham o acesso. O número 8080 é apenas exemplo: use a porta real da instalação.

Se o original tiver outro contexto, como `/editor-clinico/`, altere somente `originalBase` para esse caminho. Preserve a barra final.

## Usando um nome de domínio ou acesso sem porta

Também pode ser, por exemplo:

```text
https://mv.exemplo.org/mveditor/
https://mv.exemplo.org/mveditor-html/
```

Apache/Nginx precisa encaminhar os dois contextos e suas subrotas ao backend correto. Siga o proxy já utilizado pelo MV. O certificado, DNS e autenticação devem corresponder ao endereço público escolhido.

Não abra o HTML por uma porta e o original por outra. O cliente exige a mesma origem: protocolo, nome/IP e porta. Não basta colocar o IP de outro servidor em `originalBase`; para separar servidores físicos, o administrador deve publicar ambos atrás da mesma origem pelo proxy.

## O que o administrador precisa adaptar

| Item | O que usar no destino |
| --- | --- |
| Endereço de acesso | IP ou domínio real e porta do destinatário |
| Caminho da aplicação original | Pasta `forms` do MV Editor desse servidor |
| Instância do Tomcat | `catalina.base` da instância que atende esse MV Editor |
| Destino do HTML | Uma pasta separada para `mveditor-html` |
| `docBase` do descritor | Caminho absoluto da pasta HTML escolhida |
| `originalBase` | Contexto original; normalmente `/mveditor/` |
| CAS/proxy | Configuração de autenticação e encaminhamento do destino |
| Teste/Prévia | Parâmetros e códigos próprios do ambiente do destinatário |

Não copie códigos de paciente, atendimento, cabeçalho ou rodapé de outra instituição. O pacote compartilhável já remove esses valores do desenvolvedor.

## Ordem da instalação

1. Leia `01-INSTALAR-NO-LINUX.md`: ele contém os comandos, compatibilidade, backup e implantação.
2. Confira a assinatura/integridade da cópia original antes de personalizar.
3. Identifique caminhos, contexto, porta e versão do MV no destino.
4. Publique a pasta HTML separada e ajuste o descritor do Tomcat.
5. Configure autenticação/proxy quando usados.
6. Confira a compatibilidade dos complementos em modo de conferência; só instale se aprovados.
7. Abra a URL do destinatário e valide login, repositórios, salvar, geração de relatório, impressão e exclusão numa cópia de teste.

**Importante:** outro IP não é um problema, mas outra versão do MV pode exigir adaptação. Os complementos deste pacote são específicos para o hash descrito no guia. Não force a instalação em versões recusadas. O pacote não inclui nem instala o sistema MV original.

## Se não abrir ou não conectar

- **404 no HTML:** confira contexto publicado, `docBase`, acesso de leitura e proxy.
- **HTML abre, mas serviços falham:** confira `originalBase`, a URL original e o encaminhamento de suas subrotas.
- **Volta ao login ou redireciona para outra porta:** confira CAS e a origem pública dos dois contextos.
- **Complemento recusa o JAR:** não force; confira a versão e solicite avaliação técnica.

Depois de atualizar o HTML, use Ctrl+F5. Nunca abra `index.html` diretamente como arquivo local: o cliente precisa dos serviços e da sessão do servidor MV.

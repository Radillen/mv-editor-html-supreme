# Bibliotecas locais para importação

- PDF.js / pdfjs-dist 5.4.624: https://github.com/mozilla/pdf.js — Apache-2.0; legacy/build/pdf.mjs e pdf.worker.mjs copiados como pdf-import.js e pdf.worker.js, sem mudança no código.
- docx-preview 0.4.1: https://github.com/VolodymyrBaydalka/docxjs — Apache-2.0.
- JSZip 3.10.2: https://github.com/Stuk/jszip — MIT ou GPLv3; distribuído sob MIT.

Arquivos obtidos dos pacotes npm dessas versões. Licenças completas nesta pasta. Distribuir também standard_fonts.

## Compatibilidade de importação — 16/11/2026

O importador carrega agora pdf-import-compat.js e pdf.worker-compat.js, derivados dos mesmos fontes PDF.js 5.4.624 usando esbuild 0.25.12 com alvo ES2020/Chrome 80. Isso transforma sintaxe de métodos privados e blocos estáticos sem trocar a versão do leitor nem reduzir as proteções de importação. Os originais e a licença Mozilla/Apache-2.0 permanecem nesta pasta. A transformação de sintaxe não garante suporte a toda versão do Cent Browser; a importação deve ser validada no navegador em uso. Para reproduzir: npm ci --prefix tools/pdf-compat --ignore-scripts; node tools/build-pdf-compat.cjs.

Revisão 2: inclui polyfills core-js 3.46.0 (MIT, COREJS-LICENSE) para Array.at, TypedArray.at, String.at e Object.hasOwn antes de executar o leitor e o worker. O worker tem um ambiente global separado; a correção precisa estar nos dois arquivos. Reproduzido pattern.at is not a function e validada a conversão de PDF sintético no Cent Browser 4.3.9.248 instalado localmente.

A revisão 2 também cobre structuredClone no caminho fake worker. ArrayBuffer.transfer é inicializado antes de structuredClone para preservar transferência de buffers no Cent antigo. Testes aprovados no Cent Browser 4.3.9.248 e Chrome, com worker normal e fake worker forçado.

# Integração das páginas de serviços

## Rotas e fontes

| Rota | Repositório de origem (DiegoSapio97) | Commit importado |
|---|---|---|
| `/ansiedade` | `inspem-digital-copia` | `c4c66fb4ca157d06f142a4b6b615e3b432514ac7` |
| `/depressao` | `INSPEM-DEPRESSAO` | `8954338cb0b1591f520b32060b3264b8f6bb18f1` |
| `/tdah` | `INSPEM-TDAH` | `4d4e75295b6e715ff38424178fee206328e6fa06` |
| `/avaliacao-neuropsicologica` | `inspem-avaliacao-neuropsi` | `ddea0216865a398b9739eb0f8b0540e57b4cf262` |
| `/sexualidade` | `inspem-sexualidade` | Snapshot de trabalho aprovado, com base em `c4c66fb4ca157d06f142a4b6b615e3b432514ac7`; não é uma exportação exata desse commit |

Cada `src/pages/<serviço>.astro` importa uma página completa de `src/services/<serviço>/pages/index.astro`. A fonte e o SHA também estão registrados em `source.json` dentro de cada serviço. As cópias são independentes dos repositórios de origem: alterações no GitHub não são sincronizadas automaticamente.

## Preservação e adaptações

- Conteúdo clínico, seções, fotografias, fontes, estilos e interações locais vêm das versões de origem.
- Os estilos de cada serviço são importados apenas no layout daquela página. A página principal não importa esses estilos; a navegação usa documentos completos, não transições SPA.
- As imagens ficam em `/servicos/<serviço>/assets/`, evitando conflitos de nomes.
- URLs canônicas apontam para a subpágina em `https://inspem.com.br`.
- Cabeçalhos e rodapés retornam à página principal. Uma faixa discreta oferece “Página inicial” e um seletor dos cinco serviços, inclusive no celular.
- Âncoras dos cabeçalhos de depressão/TDAH apontam para suas próprias seções, não para a home geral.
- O antigo `<main>` do bloco hero virou `<div>` para manter um único marco principal envolvendo todo o conteúdo.
- `src/services/integration.css` contém ajustes compartilhados limitados para links legais, cabeçalho e brilho decorativo. Esses ajustes não garantem ausência de overflow global: há uma pendência conhecida nas larguras móveis das quatro páginas anteriores a sexualidade.
- As cinco seções de equipe usam `tiago_alto_fc1b84.webp`, com dimensões intrínsecas 1391 × 1131 e enquadramento superior centralizado. O teste de integridade verifica o SHA-256 `0591fbe517548f280eb0991f0ee2fe7fcefd9615ee6b4ee3424e9475a6ab4b83` em cada cópia e no build. Essa atualização posterior à importação não altera heros nem retratos.

## Documentos institucionais e privacidade

Todas as páginas usam os documentos revisados do site principal em `/politica-de-privacidade` e `/termos-de-uso`, com link para `#cookies`. Não foram importadas políticas antigas que alegavam uso de Analytics/cookies sem implementação correspondente. Os documentos principais não foram sobrescritos.

Os iframes automáticos do Google Maps das fontes foram substituídos por um cartão com link externo. Google Maps só é acessado após clique; nenhuma incorporação, Analytics, Pixel ou cookie não essencial foi adicionada. WhatsApp e referências externas continuam sendo links. O carrossel é JavaScript local; perguntas frequentes usam `<details>` nativo.

As informações clínicas e operacionais preservadas das fontes não foram revalidadas nesta integração; alterações futuras de preços, equipe ou condições devem ser revisadas pela clínica.

## Reproduzir ou atualizar a importação

1. Clone cada repositório em uma pasta de fontes fora deste projeto e selecione o SHA indicado. O script recusa fontes com modificações rastreadas ou SHA diferente do esperado.
2. Execute, na raiz deste projeto: `node scripts/import-service.mjs <pasta-das-fontes> ansiedade`. Repita com `depressao`, `tdah` e `avaliacao-neuropsicologica`.
3. Se a cópia já existir, a execução padrão recusa sobrescrita. Após salvar e revisar suas mudanças, use `--replace-generated` explicitamente. Isso sobrescreve os arquivos gerados daquele serviço; não use se houver alterações manuais que deseja preservar.
4. Para atualizar a versão de origem, revise primeiro o novo diff e atualize conscientemente o SHA esperado em `scripts/import-service.mjs`. Mudanças no formato dos componentes podem exigir adaptação do importador. Atualize esta tabela após verificar a nova importação.
5. O importador não remove arquivos obsoletos e não reaplica automaticamente a atualização posterior da foto da equipe. Preserve e reaplique as adaptações locais aprovadas antes de aceitar uma nova importação; os testes da foto devem continuar passando.
6. Execute `npm test` e verifique navegação, perguntas frequentes, carrossel, links legais, imagens, estilos e ausência de chamadas externas automáticas. Revise 320, 390, 430, 768 e 1440 px.

O build não executa o importador nem consulta a rede. Os repositórios originais não são modificados pelo script.

Sexualidade foi importada separadamente com `node scripts/import-sexualidade.mjs <arvore-de-trabalho-aprovada>`. Esse script registra hashes dos arquivos de origem e recusa sobrescrever uma integração existente. Apenas o commit-base não reproduz o snapshot aprovado: a versão completa integrada é a cópia versionada neste projeto. Os hashes em seu `source.json` descrevem a origem antes das adaptações, não os arquivos finais integrados.

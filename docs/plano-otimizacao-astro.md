# Plano de melhorias — otimização Astro da INSPEM

## Objetivo e estado

Reduzir transferência de recursos e trabalho do navegador, melhorar carregamento e manter a aparência, o conteúdo aprovado e a acessibilidade. Mirar notas máximas nas quatro categorias principais do Lighthouse, sem prometer 100 em todas as execuções nem confundir nota com qualidade completa.

**Estado:** planejamento; nenhuma melhoria abaixo foi implementada por este documento. Não autoriza commit, push, deploy, edição do contêiner GTM nem alteração de conteúdo clínico/jurídico.

**Base auditada:** commit `940b59c35e64f089d98a168db646f27a53e179b4`. A auditoria anterior executou `npm run test`: oito páginas e 31 testes aprovados. Antes de executar este plano, conferir o estado atual do Git e os arquivos, pois pode haver alterações posteriores.

**Escopo:** home, ansiedade, depressão, TDAH, avaliação neuropsicológica, sexualidade, Política de Privacidade e Termos de Uso. As cinco páginas de serviços são o foco da otimização de componentes Astro.

## Restrições obrigatórias

- Preservar a identidade visual, textos aprovados, preços, endereço e destinos de contato.
- Preservar o arquivo original `tiago_alto_fc1b84.webp`, sem recompressão, edição ou crop. SHA-256 aprovado: `0591fbe517548f280eb0991f0ee2fe7fcefd9615ee6b4ee3424e9475a6ab4b83`.
- Variantes responsivas devem ser arquivos separados, sem alterar pessoas ou enquadramento; comparar nitidez e rostos nas cinco larguras.
- Não retirar conteúdo nem rastreamento autorizado apenas para melhorar uma nota.
- Não instalar framework de interface, biblioteca de carrossel ou navegação client-side sem necessidade demonstrada.
- Não alterar texto clínico, identificação profissional ou política jurídica por inferência.
- Preservar alterações locais preexistentes e manter correções de importadores separadas da otimização visual.
- Checks somente após verificação. Erros recebem itens vinculados por letras, como `2.2.a`, sem renumerar o plano. A subtarefa original permanece aberta até a correção e revalidação.
- Registrar continuidade apenas em marcos estáveis, com nota curta de conclusão, evidência, bloqueio e próxima subtarefa.

## Diagnóstico resumido

A arquitetura estática é adequada: não foram encontradas ilhas hidratadas nos HTMLs gerados. O JavaScript próprio é pequeno. A prioridade não é reescrever Astro, mas otimizar imagens, fontes, CSS emitido e terceiros.

| Serviço | HTML gzip local, bytes | CSS gzip local, bytes | Imagens lazy/total | Imagens com srcset |
|---|---:|---:|---:|---:|
| Ansiedade | 10.041 | 10.055 | 5/11 | 0 |
| Depressão | 10.245 | 9.912 | 5/11 | 0 |
| TDAH | 10.141 | 9.812 | 5/11 | 0 |
| Avaliação neuropsicológica | 9.801 | 9.919 | 5/10 | 0 |
| Sexualidade | 8.172 | 10.102 | 7/10 | 0 |

Essas medições são do build local auditado, não da transferência HTTP. Não incluem imagens, fontes ou scripts baixados pelo GTM. Não somar JavaScript inline ao HTML, pois já está contido nele.

Achados confirmados:
- `Photo.astro` apenas renderiza `<img>`; não gera variantes responsivas.
- Imagens em `public/` são copiadas sem otimização automática pelo Astro.
- Equipe/supervisores não têm lazy em ansiedade, depressão, TDAH e avaliação neuropsicológica.
- Sexualidade já tem hero eager/high e equipe/supervisor lazy.
- A sala de atendimento declara 1200×480 nos cinco catálogos, mas o arquivo é 1280×720.
- Há várias camadas globais de CSS e implementações comuns copiadas por serviço.
- Os serviços já antecipam duas fontes; a home usa outra estratégia. Não adicionar preloads em massa.
- O build não entrega `robots.txt`.
- GTM carrega incondicionalmente no código; interface de consentimento prometida pela política não está implementada localmente. O comportamento do contêiner remoto não foi certificado.

Duplicações de assets em disco não significam download de todas as cópias em uma página. Compartilhar código também não reduz automaticamente o HTML emitido.

## 1. Linha de base e proteção contra regressões

- [ ] **1.1 Conferir o estado atual.** Ler checkpoint, executar `git status`, registrar commit e mudanças locais; revisar manifestos e testes. Resultado: escopo atual identificado sem sobrescrever trabalho alheio.
- [ ] **1.2 Revalidar build e contratos.** Executar `npm run test` e registrar páginas/testes atuais. Resultado: linha de base reproduzível; não usar o resultado histórico como teste novo.
- [ ] **1.3 Medir por rota.** Executar três medições comparáveis mobile/desktop por rota avaliada; salvar relatórios e medianas, dispositivo, rede, versão e estado de consentimento. Resultado: LCP e gargalos próprios de cada página identificados, sem extrapolar a nota da home.
- [ ] **1.4 Registrar aparência e comportamento.** Capturas via Playwright MCP em 320, 390, 430, 768 e 1440 px; menu, galeria, foco, FAQ e overflow. Resultado: referência visual anterior às mudanças.
- [ ] **1.5 Adaptar a estratégia de testes.** Planejar testes semânticos para srcset/sizes, prioridade, lazy, dimensões e rotas. Manter o hash do original; evitar contagens textuais frágeis que confundam preload/srcset com duplicação indevida. Resultado: critérios definidos antes de editar a implementação.

**Aceite do marco:** build de referência aprovado, evidências arquivadas e gargalos por rota identificados. Scripts de teste funcional devem bloquear terceiros quando apropriado; não disparar mensagens ou conversões reais.

## 2. Imagens responsivas e carregamento seletivo

- [ ] **2.1 Corrigir metadados da sala.** Atualizar dimensões em `src/services/{slug}/data/photos.ts` para corresponder ao arquivo 1280×720. Não recortar o asset. Resultado: atributos corretos e galeria visualmente revalidada.
- [ ] **2.2 Definir uma implementação responsiva comum.** Escolher entre `astro:assets` com fontes importáveis e derivados explícitos gerados no build. Não presumir que trocar `<img>` por `<Image>` mantendo URLs de `public/` resolverá tudo. Resultado: estratégia compatível com a versão instalada e com os testes de preservação do original.
- [ ] **2.3 Implementar variantes e seleção.** Expor srcset/sizes ou propriedades equivalentes no componente comum; usar larguras baseadas no tamanho renderizado e DPR. Resultado: `currentSrc` e downloads adequados em cada viewport, sem perda perceptível ou distorção.
- [ ] **2.4 Priorizar apenas o recurso crítico.** Na home, tratar a foto identificada como LCP no PDF e confirmar por medição atual. Nos serviços, conferir LCP móvel/desktop; preservar o eager/high de Sexualidade quando adequado. Resultado: prioridade e preload coerentes, sem downloads duplicados de variantes.
- [ ] **2.5 Adiar imagens abaixo da dobra.** Aplicar lazy em equipe/supervisores dos quatro serviços quando confirmado que não são LCP; preservar lazy da galeria e de Sexualidade. Resultado: menor competição inicial por rede, sem imagens críticas atrasadas.
- [ ] **2.6 Otimizar logo.** Comparar resolução exibida, transparência e nitidez; gerar derivado somente se houver benefício. Não substituir por SVG inventado. Resultado: logo legível e download adequado.
- [ ] **2.7 Revalidar.** Rodar testes, comparar hashes originais, screenshots e medições. Resultado: originais intactos, nenhum novo overflow/CLS e ganho documentado ou reversão da tentativa sem benefício.

**Arquivos principais:** `src/pages/index.astro`, `src/services/{slug}/components/Photo.astro`, componentes Hero/Equipe/Localizacao, catálogos de fotos e testes de imagens. Sexualidade possui caminhos próprios em `components/sexualidade/` e `data/sexualidadePhotos.ts`.

**Aceite do marco:** imagens corretas, responsivas e com carregamento apropriado, sem regressão visual. Não estabelecer economia em bytes ou ganho de pontos antes da medição.

## 3. Fontes e CSS

- [ ] **3.1 Auditar fontes realmente usadas.** Conferir pesos/itálico, arquivos WOFF2 e uso acima da dobra. Resultado: não anunciar faixa variável sem verificar o arquivo real.
- [ ] **3.2 Ajustar preloads com medição.** Manter apenas recursos críticos; evitar duplicar os preloads já presentes nos serviços. Avaliar fallback métrico na home. Resultado: downloads sem redundância e comportamento estável em rede lenta.
- [ ] **3.3 Mapear a cascata.** Examinar `fonts.css → global.css → refinements.css → device-mobile.css → integration.css`, estados e media queries. Resultado: mapa de regras compartilhadas e diferenças por rota.
- [ ] **3.4 Consolidar base comum.** Extrair regras comprovadamente idênticas mantendo ordem e especificidade; conservar variantes explícitas de cada serviço. Resultado: código mais simples sem fazer todas as rotas carregarem estilos desnecessários.
- [ ] **3.5 Remover regras comprovadamente sem uso.** Conferir cobertura em todas as larguras e interações antes de apagar. Priorizar Sexualidade como candidata à análise de estilos herdados, não à remoção automática. Resultado: CSS emitido menor com UI preservada.
- [ ] **3.6 Validar limites de media queries.** Além da matriz habitual, testar 430, 431, 480 e 481 px se tocar `device-mobile.css`. Resultado: sem saltos indesejados; não tratar limite mobile de 430 px como bloqueio desktop.
- [ ] **3.7 Medir efeitos gráficos se necessário.** Perfil de pintura/composição antes de reduzir blur/filtros. Resultado: manter ou alterar com evidência, não por suspeita.

**Aceite do marco:** redução ou simplificação demonstrada, sem regressão visual/tipográfica; tamanho gzip local e transferência real reportados separadamente.

## 4. Componentes Astro e manutenção

- [ ] **4.1 Compartilhar infraestrutura.** Avaliar layout-base parametrizado por rota, componente de imagem e galeria comuns. Resultado: menos cópias, preservando conteúdo e componentes específicos.
- [ ] **4.2 Preservar renderização estática.** Manter listas/perguntas resolvidas no build e scripts pequenos processados pelo Astro. Resultado: nenhuma hidratação ou biblioteca nova desnecessária.
- [ ] **4.3 Compartilhar URLs idênticas quando útil.** Conferir hashes/referências e planejar migração para reaproveitamento de cache entre páginas. Resultado: assets iguais com destino comum sem quebrar contratos ou links necessários.
- [ ] **4.4 Revisar assets sem referência.** Verificar usos indiretos/externos antes de remover. Resultado: limpeza de armazenamento/deploy descrita como tal, não como ganho fictício no carregamento inicial.
- [ ] **4.5 Proteger importadores.** Impedir que reimportações revertam foto, GTM e otimizações; revisar entrada de arquivos não rastreados, staging/diff e falhas parciais. Resultado: importação reproduzível sem execução destrutiva no site atual.
- [ ] **4.6 Melhorar gates de desenvolvimento.** Avaliar typecheck compatível, testes browser e build reproduzível com lock/runtime documentados. Resultado: verificação real, não apenas configuração strict sem execução.

**Aceite do marco:** manutenção mais simples e comportamento preservado; refatoração só mantida se benefício e risco forem justificáveis. Não modificar dependências apenas para perseguir nota.

## 5. SEO, semântica e navegação

- [ ] **5.1 Implementar robots válido.** Criar arquivo de texto simples e validar o build. Não declarar sitemap inexistente. Resultado: arquivo correto localmente; resposta de produção validada no marco 7.
- [ ] **5.2 Diferenciar metadados.** Títulos/descrições específicos para ansiedade e TDAH. Resultado: metadados únicos e coerentes por rota, sem promessa de ranking.
- [ ] **5.3 Corrigir ID duplicado.** Manter `cookies` em apenas um elemento da política, preservando fragmento público e texto. Resultado: IDs únicos e links funcionais.
- [ ] **5.4 Respeitar movimento reduzido.** Corrigir `scrollBy` das galerias para não forçar smooth nessa preferência. Resultado: teste do comportamento em ambos os estados.
- [ ] **5.5 Melhorar navegação por teclado.** Skip link, landmark adequado para serviços, foco e fallback do menu desktop sem JavaScript. Resultado: navegação funcional nas oito rotas.
- [ ] **5.6 Propor navegação mobile de seções.** Aprovar apresentação antes de implementar; distinguir melhoria de UX de falha automática de Lighthouse. Resultado: acesso às seções sem regressão visual.
- [ ] **5.7 Validar ícones e nomes acessíveis.** Ocultar SVGs decorativos e nomear grupos significativos corretamente. Resultado: árvore de acessibilidade e leitura verificadas.
- [ ] **5.8 Encaminhar revisão editorial separada.** Confirmar nome profissional, nome institucional no alt, link oficial de avaliações e afirmações clínicas com os responsáveis. Resultado: decisões documentadas; nenhuma substituição por suposição.

**Aceite do marco:** testes automáticos mais revisão manual. Nota 100 de acessibilidade não substitui teclado/leitor de tela.

## 6. GTM, consentimento e terceiros

- [ ] **6.1 Obter inventário autorizado do contêiner.** Identificar tags, gatilhos, destinos e consentimento. Preservar `GTM-MCCB6QVW`; não inferir duplicação pela presença de gtm.js e gtag.js. Resultado: diagnóstico remoto fundamentado.
- [ ] **6.2 Aprovar comportamento de consentimento.** Definir aceitar, recusar, categorias, revogar e acesso posterior; avaliar modo básico versus avançado. Resultado: decisão coerente com a política e com as requisições permitidas.
- [ ] **6.3 Implementar controles e bloqueios necessários.** Considerar também noscript; não tratar banner visual como bloqueio de tags. Resultado: funcionamento verificável antes/depois de cada escolha.
- [ ] **6.4 Remover redundâncias confirmadas.** Ajustar tags/eventos/gatilhos apenas com autorização. Resultado: custo menor sem perda de medição aprovada e sem dados clínicos indevidamente enviados.
- [ ] **6.5 Testar matriz de consentimento.** Sem escolha, recusar, aceitar, revogar e mudar de rota. Resultado: rede/cookies/eventos conferidos em ambiente controlado, sem conversões reais.

**Aceite do marco:** interface e comportamento aprovados e testados. Repositório sozinho não comprova configuração de GA/Ads, retenção ou conformidade jurídica. Não atrasar rastreamento artificialmente apenas para enganar a auditoria.

## 7. Hospedagem, medição final e entrega

- [ ] **7.1 Identificar provedor e deploy.** Confirmar servidor, raiz publicada, artefato/commit e rollback. Resultado: nenhuma regra inventada para infraestrutura desconhecida.
- [ ] **7.2 Conferir respostas HTTP.** Verificar robots, caminho inexistente, HTML, CSS, fontes e imagens; status/MIME/cache/compressão. Resultado: arquivo ausente não retorna home disfarçada; 404 e rotas funcionam.
- [ ] **7.3 Ajustar cache e compressão conforme servidor.** Assets versionados com cache apropriado; HTML revalidável. Resultado: cabeçalhos e bytes de rede confirmados após deploy autorizado.
- [ ] **7.4 Executar regressão completa.** `npm run test`, oito rotas, matriz visual, teclado, FAQ, navegação, galerias e links. Resultado: nenhuma aprovação visual baseada apenas em build.
- [ ] **7.5 Comparar métricas equivalentes.** Medianas de três execuções por cenário; separar consentimento recusado/concedido, mobile/desktop e laboratório/campo. Resultado: ganhos e regressões explícitos por rota.
- [ ] **7.6 Publicar somente com autorização.** Commit/push/deploy são decisões separadas; reler destinos/arquivos/cabeçalhos exatos após publicação. Resultado: versão correta realmente entregue, não apenas push bem-sucedido.

**Metas de trabalho:** buscar 100 nas quatro categorias, sem garantia; LCP ≤2,5 s, FCP ≤1,8 s, TBT ≤200 ms em laboratório, CLS ≤0,1 e preferencialmente próximo do zero atual. TBT não mede INP de usuários reais. Essas faixas não equivalem automaticamente a nota 100.

## Prioridade por subpágina

| Página | Primeira intervenção candidata | Cuidado específico |
|---|---|---|
| Home | Foto responsiva e prioridade LCP | Confirmar medição atual e preservar original |
| Ansiedade | Imagens responsivas e lazy seletivo | Não presumir preload desktop suficiente no mobile |
| Depressão | Mesma infraestrutura responsiva comum | Preservar texto e diferenças da rota |
| TDAH | Imagens e metadados específicos | CSS menor não prova carregamento mais rápido |
| Avaliação neuropsicológica | Imagens e dimensões corretas | Não cortar conteúdo do processo de avaliação |
| Sexualidade | Variantes e CSS herdado sem uso comprovado | Já possui eager/high no hero e lazy na equipe |
| Páginas legais | Fontes/navegação/IDs e consentimento | Preservar conteúdo substantivo aprovado |

## Decisões pendentes antes da execução correspondente

1. Provedor/hospedagem e método atual de publicação.
2. Autorização do bloco de implementação; este documento não é essa autorização.
3. Acesso autorizado ou export sanitizado do GTM e comportamento de consentimento aprovado.
4. Confirmação de link de avaliações e informações institucionais/clínicas pelos responsáveis.

## Fontes técnicas

- Astro — imagens, processamento e diretório public: https://docs.astro.build/en/guides/images/
- Astro — processamento de scripts, bundling e deduplicação: https://docs.astro.build/en/guides/client-side-scripts/
- Google — otimização do LCP: https://web.dev/articles/optimize-lcp
- Google — pontuação de desempenho: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
- Google — fontes: https://web.dev/learn/performance/optimize-web-fonts
- Google — custo de terceiros: https://developer.chrome.com/docs/lighthouse/performance/third-party-summary
- Google — robots.txt: https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- Google — pontuação de acessibilidade: https://developer.chrome.com/docs/lighthouse/accessibility/scoring
- Google — modos de consentimento: https://developers.google.com/tag-platform/security/concepts/consent-mode

## Evidências complementares da auditoria

- `C:/Users/diego/AppData/Local/hermes/cache/audit360/auditoria-360-consolidada.md`
- `C:/Users/diego/AppData/Local/hermes/cache/audit360/inventario-consolidado.json`
- `C:/Users/diego/AppData/Local/hermes/cache/pagespeed-analysis/avaliacao-pagespeed.md`

Os arquivos de cache são referências locais e podem não acompanhar o repositório. O presente documento registra o diagnóstico e o plano essenciais sem depender deles para compreender o escopo.

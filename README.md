# INSPEM — Site principal

Página institucional da INSPEM para acesso aos serviços de psicologia presencial em Porto Alegre.

## Serviços

- Ansiedade
- Depressão
- TDAH
- Avaliação neuropsicológica
- Sexualidade

As páginas completas estão integradas em `/ansiedade`, `/depressao`, `/tdah`, `/avaliacao-neuropsicologica` e `/sexualidade`. Os cartões e o menu da página principal levam a esses destinos. Cada subpágina oferece retorno à página inicial e navegação entre serviços.

Os repositórios de origem permanecem separados e intactos. Este projeto guarda cópias versionadas dos componentes, dados e estilos em `src/services/<serviço>` e imagens em `public/servicos/<serviço>/assets`. Não é necessário acessar o GitHub para executar o site. Consulte [a documentação de integração](docs/integracao-servicos.md) para fontes, decisões de privacidade e atualização.

## Desenvolvimento

Requer Node.js 22.19.0 ou superior.

```sh
npm install
npm run dev
```

O servidor local usa `http://localhost:4329`.

```sh
npm test
```

O teste executa o build de produção e verifica os destinos dos cinco serviços, imagens e recursos locais, âncoras, navegação de retorno, URLs canônicas, a integridade da foto aprovada da equipe e os contratos da página principal e dos documentos institucionais.

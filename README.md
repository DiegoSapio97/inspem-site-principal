# INSPEM — Site principal

Página institucional da INSPEM para acesso aos serviços de psicologia presencial em Porto Alegre.

## Serviços

- Ansiedade
- Depressão
- TDAH
- Avaliação neuropsicológica

Os caminhos `/ansiedade`, `/depressao`, `/tdah` e `/avaliacao-neuropsicologica` são pontos de montagem de implantação. As páginas correspondentes serão fornecidas posteriormente por repositórios separados; portanto, respostas 404 nesses caminhos durante o desenvolvimento local, antes da integração de implantação, são esperadas.

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

O teste executa o build de produção e verifica os principais destinos da página.

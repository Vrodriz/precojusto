# 📌 Preço Justo -- Desafio Técnico Angular

## 🚀 Sobre o projeto

Aplicação Angular desenvolvida como parte do desafio técnico **Preço
Justo**.\
O objetivo foi construir um sistema de gerenciamento de **Posts** e
**Comentários**, consumindo a API pública
[JSONPlaceholder](https://jsonplaceholder.typicode.com/).

A aplicação segue boas práticas de Angular, RxJS e arquitetura limpa,
priorizando experiência do usuário, organização do código e
acessibilidade.

------------------------------------------------------------------------

## ⚙️ Funcionalidades

### 📄 Posts

-   ✅ Listar posts com **paginação, busca e ordenação**\
-   ✅ Visualizar detalhes de um post em modal\
-   ✅ Criar posts (**update otimista**)\
-   ✅ Editar posts via modal com formulário reativo\
-   ✅ Excluir posts com confirmação e rollback em caso de erro

### 💬 Comentários

-   ✅ Listar comentários de um post\
-   ✅ Adicionar novo comentário (**update otimista**)\
-   ✅ Editar comentário inline (**simulação no cache in-memory**)\
-   ✅ Excluir comentário (**update otimista**)

> ⚠️ **Observação**: a API JSONPlaceholder não oferece
> `PUT /comments/:id`.\
> Por isso, a edição de comentários foi **simulada apenas no cache
> in-memory**, mantendo a interface funcional.

------------------------------------------------------------------------

## 🛠️ Tecnologias utilizadas

-   [Angular 17+](https://angular.io/)\
-   [RxJS](https://rxjs.dev/)\
-   [Tailwind CSS](https://tailwindcss.com/)\
-   [TypeScript](https://www.typescriptlang.org/)\
-   API pública:
    [JSONPlaceholder](https://jsonplaceholder.typicode.com/)

------------------------------------------------------------------------

## 📂 Estrutura de pastas

``` bash
src/app/
  core/
    interceptors/   # BaseUrlInterceptor + ErrorInterceptor
  models/           # interfaces/DTOs
  features/
    post-list/      # listagem de posts
    post-detail/    # detalhe + comentários
    post-edit/      # modal de edição de post
```

------------------------------------------------------------------------

## 🧩 Arquitetura & Boas Práticas

-   ✅ **Standalone Components**\
-   ✅ **AsyncPipe** para evitar `subscribe` manuais em componentes\
-   ✅ **BehaviorSubject** para cache in-memory de posts e comentários\
-   ✅ **Update otimista + rollback** em caso de erro\
-   ✅ **Paginação, busca e ordenação client-side**\
-   ✅ **Interceptors globais** (Base URL + tratamento de erros)\
-   ✅ **Design responsivo** com Tailwind CSS\
-   ✅ **Acessibilidade básica** (`aria`, navegação via teclado, modais
    com foco)

------------------------------------------------------------------------

## ▶️ Como executar o projeto

### 1. Clonar o repositório

``` bash
git clone https://github.com/seu-usuario/preco-justo-angular.git
cd precojusto
```

### 2. Instalar dependências

``` bash
npm install
```

### 3. Rodar o servidor de desenvolvimento

``` bash
ng serve
```

Acesse em: <http://localhost:4200>

------------------------------------------------------------------------

## 📌 Observações finais

-   A API JSONPlaceholder não suporta atualização real de
    **comentários** (`PUT`/`PATCH`).\
    → Implementação feita em **cache local (in-memory)** para manter a
    interface funcional.\
-   Para **posts (`/posts`)**, todas as operações CRUD foram
    implementadas com chamadas reais à API + cache otimista.\
-   Interceptors configurados para **base URL automática** e
    **tratamento global de erros**.

------------------------------------------------------------------------

✨ Projeto desenvolvido como parte do desafio técnico **Preço Justo**.

# PDS
Desenvolvimento de uma Aplicação Web para Gestão de Receitas e Despesas

Resumo do Projeto
Este projeto é uma aplicação web completa e intuitiva para o controle financeiro pessoal, desenvolvida como um trabalho de conclusão de curso (TCC). A ferramenta foi concebida para fornecer uma solução simples e eficiente para que usuários possam gerenciar suas finanças, registrar transações, categorizar gastos e visualizar sua saúde financeira através de relatórios visuais.

Construído com tecnologias web modernas, o projeto demonstra a aplicação de conceitos de engenharia de software e a viabilidade de utilizar plataformas BaaS (Backend as a Service) para a criação de soluções escaláveis e robustas.

Funcionalidades Principais
O sistema foi projetado com um foco rigoroso em usabilidade e oferece as seguintes funcionalidades-chave:

✅ Autenticação Segura: Sistema de login e registro de usuários integrado ao Firebase Authentication.

✅ Gerenciamento de Transações (CRUD): Permite adicionar, editar e excluir receitas e despesas de forma simples.

✅ Categorização Hierárquica: Organização de transações em categorias e subcategorias personalizáveis.

✅ Dashboards Visuais: Gráficos interativos (pizza e barras) para uma análise visual e instantânea do fluxo financeiro.

✅ Filtros Avançados: Filtre transações por data, tipo, categoria ou descrição para uma análise detalhada.

✅ Geração de Relatórios: Exporte relatórios financeiros completos em formato PDF.

✅ Design Responsivo: Interface otimizada para desktops, tablets e smartphones.

Tecnologias Utilizadas
O projeto foi desenvolvido com um stack tecnológico moderno e eficiente, priorizando a performance e a manutenibilidade do código.

Frontend:

HTML5: Estrutura semântica da aplicação.

CSS3: Estilização e responsividade da interface (Flexbox e Grid).

JavaScript (Vanilla): Lógica de negócio e interatividade.

Backend as a Service (BaaS):

Firebase: Plataforma do Google utilizada para:

Firebase Authentication: Gerenciamento de autenticação de usuários.

Cloud Firestore: Banco de dados NoSQL para persistência dos dados.

Firebase Hosting: Hospedagem da aplicação.

Metodologia de Desenvolvimento
Este projeto seguiu um modelo de ciclo de vida incremental, dividindo o desenvolvimento em fases claras:

Análise de Requisitos: Levantamento de necessidades do usuário e definição de requisitos funcionais e não-funcionais.

Design da Solução: Criação da arquitetura, modelagem de dados e prototipação da interface (UI/UX).

Implementação: Desenvolvimento modular e incremental das funcionalidades.

Testes e Validação: Condução de testes funcionais e de usabilidade para garantir a qualidade e a eficácia da solução.

Como Executar o Projeto Localmente
Para clonar e executar este projeto em sua máquina, siga os passos abaixo:

Clone o Repositório:

Bash

git clone https://github.com/seu-usuario/nome-do-repositorio.git
cd nome-do-repositorio
Configurar o Firebase:

Crie um projeto no console do Firebase.

Adicione um aplicativo web ao seu projeto Firebase e copie suas credenciais de configuração.

Crie um arquivo firebaseConfig.js no diretório raiz do projeto e cole as credenciais.

Habilite os serviços de Authentication (Sign-in method: Email/Password) e Cloud Firestore em seu projeto Firebase.

Executar a Aplicação:

Abra o arquivo index.html em seu navegador web.

A aplicação está pronta para ser utilizada!

Trabalhos Futuros
Este projeto serve como uma base sólida para futuras melhorias, incluindo:

Integração com APIs Financeiras: Importação automática de extratos bancários.

Funcionalidades de Orçamento: Definição de metas e alertas de gastos.

Inteligência Artificial: Uso de IA para categorização automática de transações.

Recursos Colaborativos: Compartilhamento de contas entre usuários.

Este projeto é resultado de um trabalho de conclusão de curso.

Autor: Felipe Valim

Orientador: Ramon Lummertz

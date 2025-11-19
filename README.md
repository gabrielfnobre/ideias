# 🚀 PROENG Innovation Hub

**Central de Inovação e Gestão de Ideias**

O **PROENG Innovation Hub** é uma plataforma web desenvolvida para fomentar a cultura de inovação interna. O sistema permite que colaboradores submetam ideias, votem nas melhores propostas e acompanhem o progresso através de um quadro Kanban interativo.

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-blue)
![Tech](https://img.shields.io/badge/Tech-React_|_PHP_|_Tailwind-06b6d4)

## ✨ Funcionalidades Principais

*   **💡 Gestão de Ideias**: Submissão simplificada de novas ideias com título e descrição.
*   **🗳️ Votação Social**: Sistema de "curtidas" para validar as ideias mais populares.
*   **📊 Quadro Kanban**: Visualização e gestão do fluxo de ideias (Elaboração → Triagem → Avaliação → Aprovada) com Drag & Drop nativo.
*   **📱 Design Responsivo**: Interface moderna e adaptável para mobile (menu hambúrguer, colunas empilhadas).
*   **🏆 Gamificação**: Sistema de pontos e recompensas para engajar os colaboradores (Loja de Recompensas).
*   **🤖 Preparado para IA**: Estrutura pronta para integração com N8N e IA para análise automática de similaridade e viabilidade.

## 🛠️ Tecnologias Utilizadas

### Frontend
*   **React (via CDN)**: Utilizado com ES Modules para uma arquitetura leve sem necessidade de build complexo (Webpack/Vite).
*   **Tailwind CSS**: Estilização utilitária para um design moderno e responsivo.
*   **Chart.js**: Visualização de dados no Dashboard.
*   **Lucide Icons**: Ícones vetoriais leves.

### Backend
*   **PHP (Native)**: API RESTful simples e performática.
*   **MySQL**: Banco de dados relacional para armazenamento de usuários, ideias e votos.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
*   Servidor Web (Apache/Nginx) com PHP 7.4+.
*   MySQL.
*   (Recomendado) XAMPP ou Laragon.

### Instalação

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/engfabio/ideias.git
    cd ideias
    ```

2.  **Configuração do Banco de Dados**:
    *   Crie um banco de dados MySQL (ex: `u260496377_ideias`).
    *   Importe o esquema inicial (se disponível) ou utilize a rota de seed para criar a estrutura.
    *   Configure as credenciais em `api/kernel.php`:
        ```php
        $this->db = new PDO('mysql:host=localhost;dbname=SEU_BANCO', 'SEU_USUARIO', 'SUA_SENHA');
        ```

3.  **Execução**:
    *   Coloque a pasta do projeto no diretório público do seu servidor (ex: `htdocs` no XAMPP).
    *   Acesse `http://localhost/ideias` no navegador.

## 🔮 Roadmap & Futuro

*   [ ] **Integração N8N**: Webhook para disparar análises de IA ao criar ideias.
*   [ ] **Busca Vetorial**: Implementar busca semântica para evitar ideias duplicadas.
*   [ ] **Notificações**: Alertas por e-mail ou push sobre status das ideias.

---

Desenvolvido com foco em **Inovação** e **Agilidade**.
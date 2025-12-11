/**
 * =============================================================================================
 * API SERVICE – EXPLICAÇÃO COMPLETA PARA QUALQUER USUÁRIO OU DESENVOLVEDOR
 * =============================================================================================
 *
 * SOBRE ESTE ARQUIVO:
 * -----------------------------------------------------------------------------
 * Este arquivo centraliza todas as funções de comunicação com a API do sistema,
 * permitindo buscar ou enviar dados para o backend sem precisar repetir código.
 *
 * COMO FUNCIONA?
 * -----------------------------------------------------------------------------
 * - Todos os caminhos (endpoints) são relativos, o que facilita rodar o sistema em subpastas.
 * - O objeto `api` reúne métodos simples para cada ação/exigência típica da plataforma.
 * - Não é preciso entender requisições AJAX para usar – é só chamar funções como `api.login`, etc.
 *
 * COMO USAR NA SUA APLICAÇÃO:
 * -----------------------------------------------------------------------------
 * Importar o objeto `api` e usar o método que se encaixa na necessidade.
 * Exemplo:
 *      import { api } from './services/api';
 *      api.getIdeas().then(result => { ... });
 *
 * DETALHES DE IMPLEMENTAÇÃO:
 * -----------------------------------------------------------------------------
 * - Todos os métodos retornam uma Promise, então você pode usar `then` ou `await`.
 * - Já faz o tratamento de erro: se algo falhar, retorna `{ ok: false, error: ... }`
 * - Usa headers `Content-Type: application/json` sempre que envia dados.
 *
 * LISTA DE ENDPOINTS/MÉTODOS DISPONÍVEIS:
 * -----------------------------------------------------------------------------
 * | Categoria   | Função           | Descrição                                              |
 * |-------------|------------------|--------------------------------------------------------|
 * | Auth        | signup           | Cadastra novo usuário                                  |
 * |             | login            | Login com email/senha                                  |
 * |             | logout           | Encerra sessão                                         |
 * |             | googleLogin      | Login usando Google (OAuth)                            |
 * |             | requestReset     | Solicita reset de senha usando e-mail                  |
 * | Campanhas   | getCampaigns     | Lista todas as campanhas ativas                        |
 * | Ideias      | getIdeas         | Busca lista de ideias (pode filtrar por parâmetros)    |
 * |             | getIdea          | Busca detalhes de uma ideia (por ID)                   |
 * |             | createIdea       | Cadastra uma nova ideia                                |
 * |             | updateStatus     | Altera status de uma ideia (ex: aprovar ou rejeitar)   |
 * |             | updateIdea       | Atualiza os campos de uma ideia já existente           |
 * |             | vote             | Registra um voto positivo para uma ideia               |
 * |             | comment          | Adiciona comentário a uma ideia                        |
 * | Estatísticas| getDashboard     | Dados agregados e resumos para painéis                 |
 * |             | getLeaderboard   | Traz ranking de usuários (pontuação, ideias, etc)      |
 *
 * EXPLICAÇÃO DE USO DE CADA MÉTODO NA PRÁTICA:
 * -----------------------------------------------------------------------------
 * - Todos retornam os dados já convertidos de JSON. Não precisa usar response.json().
 * - Se houver erro de rede, retorna:      { ok: false, error: 'network_error' }
 * - Se sucesso, retorna o objeto esperado do backend (geralmente inclui `ok: true`)
 *
 * OBS: Sempre usar await ou .then para tratar o resultado, pois são métodos assíncronos.
 */

// Caminho base para as chamadas da API (ajuste aqui se o backend mudar de subpasta!)
const API_BASE = 'api/index.php?route=';

export const api = {
    /**
     * (INTERNO) Função utilitária que faz a requisição real.
     * - Monta o caminho completo usando o nome da rota.
     * - Faz POST ou GET dependendo do método.
     * - Já trata conversão do corpo (body) e do retorno.
     * - Captura e padroniza erros de conexão/rede.
     *
     * @param {string} route   Caminho (ex: 'ideas/list', 'auth/login')
     * @param {object} [options] Opções adicionais p/ fetch (método, body, etc)
     * @returns {Promise<object>} Resposta da API (já como objeto JS)
     */
    async request(route, options = {}) {
        try {
            // Faz a chamada fetch
            const response = await fetch(`${API_BASE}${route}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            // Converte resposta para objeto JS
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Error [${route}]:`, error);
            // Sempre devolve padrão erro para facilitar tratamento na interface
            return { ok: false, error: 'network_error' };
        }
    },

    // ===================== AUTENTICAÇÃO =====================
    /**
     * Cria um novo usuário.
     * @param {object} payload - Dados do usuário (nome, email, senha)
     * @returns {Promise<object>} Resposta da API
     */
    async signup(payload) {
        return this.request('auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    },

    /**
     * Faz login do usuário.
     * @param {object} payload - { email, senha }
     * @returns {Promise<object>} Resposta da API
     */
    async login(payload) {
        return this.request('auth/login', { method: 'POST', body: JSON.stringify(payload) });
    },

    /**
     * Encerra a sessão do usuário logado.
     * @returns {Promise<object>} Resposta da API
     */
    async logout() {
        return this.request('auth/logout', { method: 'POST' });
    },

    /**
     * Login usando credencial Google (OAuth2)
     * @param {string} idToken - Token recebido do Google
     * @returns {Promise<object>} Resposta da API
     */
    async googleLogin(idToken) {
        return this.request('auth/google', { method: 'POST', body: JSON.stringify({ id_token: idToken }) });
    },

    /**
     * Solicita redefinição de senha por e-mail
     * @param {string} email - E-mail cadastrado do usuário
     * @returns {Promise<object>} Resposta da API
     */
    async requestReset(email) {
        return this.request('auth/request-reset', { method: 'POST', body: JSON.stringify({ email }) });
    },

    /**
     * Busca os dados de um usuário pelo id
     * @param {number|string} id - ID do usuário
     * @returns {Promise<object>} Resposta da API (id, email, name, etc)
     */
    async getUserById(id) {
        return this.request('user/get', { method: 'POST', body: JSON.stringify({ id }) });
    },

    // ===================== CAMPANHAS =====================
    /**
     * Lista todas as campanhas cadastradas no sistema.
     * @returns {Promise<object>} Resposta da API (array de campanhas)
     */
    async getCampaigns() {
        return this.request('campaigns/list');
    },

    // ===================== IDEIAS =====================
    /**
     * Busca lista de ideias.
     * @param {string} [params] - String de parâmetros para filtro/paginação (opcional)
     * @returns {Promise<object>} Resposta da API (array de ideias)
     */
    async getIdeas(params = '') {
        return this.request(`ideas/list&${params}`);
    },

    /**
     * Busca detalhes de uma ideia específica pelo ID.
     * @param {number|string} id - ID da ideia
     * @returns {Promise<object>} Resposta da API (detalhes da ideia)
     */
    async getIdea(id) {
        return this.request(`ideas/get&id=${id}`);
    },

    /**
     * Cadastra uma nova ideia enviada pelo usuário.
     * @param {object} payload - Dados da ideia (título, descrição, etc)
     * @returns {Promise<object>} Resposta da API
     */
    async createIdea(payload) {
        return this.request('ideas/create', { method: 'POST', body: JSON.stringify(payload) });
    },

    /**
     * Atualiza o status de uma ideia (aprovada, rejeitada, em triagem etc)
     * @param {number|string} id - ID da ideia
     * @param {string} status - Novo status
     * @returns {Promise<object>} Resposta da API
     */
    async updateStatus(id, status) {
        return this.request('ideas/update_status', { method: 'POST', body: JSON.stringify({ id, status }) });
    },

    /**
     * (NOVO!) Atualiza dados de uma ideia já existente.
     * @param {object} payload - Dados completos da ideia a ser editada
     * @returns {Promise<object>} Resposta da API
     */
    async updateIdea(payload) {
        return this.request('ideas/update', { method: 'POST', body: JSON.stringify(payload) });
    },

    /**
     * Vota positivamente em uma ideia.
     * @param {number|string} id - ID da ideia
     * @returns {Promise<object>} Resposta da API
     */
    async vote(id) {
        return this.request('ideas/vote', { method: 'POST', body: JSON.stringify({ id }) });
    },

    /**
     * Conta o número de votos de uma ideia específica.
     * @param {number|string} id - ID da ideia
     * @returns {Promise<object>} Resposta da API com a contagem de votos
     */
    async countVotes(id) {
        return this.request('ideas/count_votes', { method: 'POST', body: JSON.stringify({ id }) });
    },

    /**
     * Adiciona comentário a uma ideia.
     * @param {number|string} id - ID da ideia
     * @param {string} text - Conteúdo do comentário
     * @returns {Promise<object>} Resposta da API
     */
    async comment(id, text) {
        return this.request('ideas/comment', { method: 'POST', body: JSON.stringify({ id, text }) });
    },

    /**
     * Lista todos os textos dos comentários de uma ideia específica.
     * @param {number|string} id - ID da ideia
     * @returns {Promise<object>} Resposta da API com os textos dos comentários
     */
    async listComments(id) {
        return this.request('ideas/list_comments', { method: 'POST', body: JSON.stringify({ id }) });
    },

    // ===================== ESTATÍSTICAS & RANKING =====================
    /**
     * Busca dados do dashboard (resumo para painel administrativo).
     * @returns {Promise<object>} Resumo dos principais dados da plataforma
     */
    async getDashboard() { 
        return this.request('stats/dashboard');
    },

    /**
     * Busca ranking/placar dos melhores usuários (gamificação).
     * @returns {Promise<object>} Lista de usuários e suas pontuações
     */
    async getLeaderboard() {
        return this.request('stats/leaderboard');
    },

    /**
     * Busca foto do usuário pelo REGISTER do colaborador.
     * @param {string|number} register - Código (REGISTER) do colaborador
     * @returns {Promise<object>} Resposta da API com a foto ou erro
     */
    async getUserPhoto(register) {
        return this.request('user/photo', { 
            method: 'POST', 
            body: JSON.stringify({ register }) 
        });
    },
};

// Exemplo de uso para testar:
api.getUserPhoto('009601').then(console.log);

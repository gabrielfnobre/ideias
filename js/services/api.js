/**
 * Service responsible for all API communications.
 * Uses relative paths to ensure compatibility with subdirectories.
 */
const API_BASE = 'api/index.php?route=';

export const api = {
    /**
     * Generic fetch wrapper with error handling
     * @param {string} route - The API route (e.g., 'ideas/list')
     * @param {object} [options] - Fetch options
     * @returns {Promise<any>}
     */
    async request(route, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${route}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Error [${route}]:`, error);
            return { ok: false, error: 'network_error' };
        }
    },

    // Auth
    async signup(payload) { return this.request('auth/signup', { method: 'POST', body: JSON.stringify(payload) }); },
    async login(payload) { return this.request('auth/login', { method: 'POST', body: JSON.stringify(payload) }); },
    async logout() { return this.request('auth/logout', { method: 'POST' }); },
    async googleLogin(idToken) { return this.request('auth/google', { method: 'POST', body: JSON.stringify({ id_token: idToken }) }); },
    async requestReset(email) { return this.request('auth/request-reset', { method: 'POST', body: JSON.stringify({ email }) }); },

    // Campaigns
    async getCampaigns() { return this.request('campaigns/list'); },

    // Ideas
    async getIdeas(params = '') { return this.request(`ideas/list&${params}`); },
    async getIdea(id) { return this.request(`ideas/get&id=${id}`); },
    async createIdea(payload) { return this.request('ideas/create', { method: 'POST', body: JSON.stringify(payload) }); },
    async updateStatus(id, status) { return this.request('ideas/update_status', { method: 'POST', body: JSON.stringify({ id, status }) }); },
    async updateIdea(payload) { return this.request('ideas/update', { method: 'POST', body: JSON.stringify(payload) }); }, // New endpoint
    async vote(id) { return this.request('ideas/vote', { method: 'POST', body: JSON.stringify({ id }) }); },
    async comment(id, text) { return this.request('ideas/comment', { method: 'POST', body: JSON.stringify({ id, text }) }); },

    // Stats
    async getDashboard() { return this.request('stats/dashboard'); },
    async getLeaderboard() { return this.request('stats/leaderboard'); }
};

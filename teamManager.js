/**
 * Módulo TeamManager - Gerencia operações CRUD de times
 * Responsável por criar, validar e gerenciar times
 */

export class TeamManager {
    constructor() {
        this.teams = [];
        this.availableColors = ['red', 'green', 'blue', 'yellow', 'orange'];
        this.colorNames = {
            'red': 'Vermelho',
            'green': 'Verde', 
            'blue': 'Azul',
            'yellow': 'Amarelo',
            'orange': 'Laranja'
        };
    }

    /**
     * Cria um novo time
     * @param {string} color - Cor do time
     * @param {Array} players - Array de nomes dos jogadores
     * @returns {Object} - Time criado
     */
    createTeam(color, players) {
        const team = {
            id: Date.now() + Math.random(), // ID único
            color: color,
            players: players.filter(name => name.trim() !== ''), // Remove nomes vazios
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            playerStats: {}
        };

        // Inicializar estatísticas dos jogadores
        team.players.forEach(player => {
            team.playerStats[player] = {
                goals: 0,
                assists: 0
            };
        });

        return team;
    }

    /**
     * Adiciona um time à lista
     * @param {Object} team - Time a ser adicionado
     */
    addTeam(team) {
        this.teams.push(team);
    }

    /**
     * Valida se uma cor já está sendo usada
     * @param {string} color - Cor a ser validada
     * @param {string} excludeTeamId - ID do time a ser excluído da validação (para edição)
     * @returns {boolean} - True se a cor já está em uso
     */
    isColorInUse(color, excludeTeamId = null) {
        return this.teams.some(team => 
            team.color === color && team.id !== excludeTeamId
        );
    }

    /**
     * Valida os dados de um time
     * @param {string} color - Cor do time
     * @param {Array} players - Array de jogadores
     * @returns {Object} - Resultado da validação
     */
    validateTeam(color, players) {
        const errors = [];

        // Validar cor
        if (!color) {
            errors.push('Cor do time é obrigatória');
        } else if (this.isColorInUse(color)) {
            errors.push('Esta cor já está sendo usada por outro time');
        }

        // Validar jogadores
        const validPlayers = players.filter(name => name.trim() !== '');
        if (validPlayers.length < 2) {
            errors.push('Cada time deve ter pelo menos 2 jogadores');
        }
        if (validPlayers.length > 6) {
            errors.push('Cada time pode ter no máximo 6 jogadores');
        }

        // Verificar nomes duplicados
        const uniqueNames = new Set(validPlayers.map(name => name.trim().toLowerCase()));
        if (uniqueNames.size !== validPlayers.length) {
            errors.push('Não pode haver jogadores com nomes duplicados no mesmo time');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            validPlayers: validPlayers
        };
    }

    /**
     * Busca um time por ID
     * @param {string|number} teamId - ID do time
     * @returns {Object|null} - Time encontrado ou null
     */
    getTeamById(teamId) {
        return this.teams.find(team => team.id === teamId) || null;
    }

    /**
     * Busca um time por cor
     * @param {string} color - Cor do time
     * @returns {Object|null} - Time encontrado ou null
     */
    getTeamByColor(color) {
        return this.teams.find(team => team.color === color) || null;
    }

    /**
     * Retorna todos os times
     * @returns {Array} - Array de times
     */
    getAllTeams() {
        return [...this.teams];
    }

    /**
     * Atualiza as estatísticas de um time após uma partida
     * @param {string|number} teamId - ID do time
     * @param {string} result - Resultado ('win', 'draw', 'loss')
     * @param {number} goalsFor - Gols marcados
     * @param {number} goalsAgainst - Gols sofridos
     */
    updateTeamStats(teamId, result, goalsFor, goalsAgainst) {
        const team = this.getTeamById(teamId);
        if (!team) return;

        team.goalsFor += goalsFor;
        team.goalsAgainst += goalsAgainst;

        switch (result) {
            case 'win':
                team.wins++;
                break;
            case 'draw':
                team.draws++;
                break;
            case 'loss':
                team.losses++;
                break;
        }
    }

    /**
     * Atualiza as estatísticas de um jogador
     * @param {string|number} teamId - ID do time
     * @param {string} playerName - Nome do jogador
     * @param {number} goals - Gols marcados
     * @param {number} assists - Assistências
     */
    updatePlayerStats(teamId, playerName, goals = 0, assists = 0) {
        const team = this.getTeamById(teamId);
        if (!team || !team.playerStats[playerName]) return;

        team.playerStats[playerName].goals += goals;
        team.playerStats[playerName].assists += assists;
    }

    /**
     * Retorna o nome da cor em português
     * @param {string} color - Cor em inglês
     * @returns {string} - Nome da cor em português
     */
    getColorName(color) {
        return this.colorNames[color] || color;
    }

    /**
     * Retorna as cores disponíveis
     * @returns {Array} - Array de cores disponíveis
     */
    getAvailableColors() {
        return [...this.availableColors];
    }

    /**
     * Carrega times de dados salvos
     * @param {Array} teamsData - Dados dos times
     */
    loadTeams(teamsData) {
        this.teams = teamsData || [];
    }

    /**
     * Reseta todos os times
     */
    reset() {
        this.teams = [];
    }

    /**
     * Calcula pontos de um time (3 por vitória, 1 por empate)
     * @param {Object} team - Time
     * @returns {number} - Pontos do time
     */
    calculatePoints(team) {
        return (team.wins * 3) + (team.draws * 1);
    }

    /**
     * Calcula saldo de gols de um time
     * @param {Object} team - Time
     * @returns {number} - Saldo de gols
     */
    calculateGoalDifference(team) {
        return team.goalsFor - team.goalsAgainst;
    }
}


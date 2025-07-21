/**
 * Módulo MatchManager - Gerencia a lógica das partidas
 * Responsável por criar, controlar e finalizar partidas
 */

export class MatchManager {
    constructor(teamManager) {
        this.teamManager = teamManager;
        this.currentMatch = null;
        this.allMatches = [];
        this.lastWinnerTeam = null;
        this.lastMatchWasDraw = false;
        this.teamThatDidNotPlayLastMatch = null;
        this.teamThatDidNotPlayPenultimateMatch = null;
    }

    /**
     * Cria uma nova partida
     * @param {Object} teamA - Time A
     * @param {Object} teamB - Time B
     * @returns {Object} - Partida criada
     */
    createMatch(teamA, teamB) {
        this.currentMatch = {
            id: Date.now() + Math.random(),
            teamA: teamA,
            teamB: teamB,
            scoreA: 0,
            scoreB: 0,
            goals: [],
            isEnded: false,
            isAnnulled: false,
            startTime: new Date(),
            endTime: null
        };

        return this.currentMatch;
    }

    /**
     * Adiciona um gol à partida atual
     * @param {string} team - 'A' ou 'B'
     * @param {string} scorer - Nome do jogador que marcou
     * @param {string} assist - Nome do jogador que deu assistência (opcional)
     * @param {string} time - Tempo do gol
     * @returns {boolean} - True se o gol foi adicionado com sucesso
     */
    addGoal(team, scorer, assist = null, time = null) {
        if (!this.currentMatch || this.currentMatch.isEnded) {
            return false;
        }

        // Validar se o jogador que marcou não é o mesmo que deu assistência
        if (assist && scorer === assist) {
            throw new Error('Um jogador não pode dar assistência para seu próprio gol');
        }

        const goal = {
            id: Date.now() + Math.random(),
            team: team,
            scorer: scorer,
            assist: assist,
            time: time || new Date().toLocaleTimeString(),
            timestamp: new Date()
        };

        this.currentMatch.goals.push(goal);

        // Atualizar placar
        if (team === 'A') {
            this.currentMatch.scoreA++;
        } else {
            this.currentMatch.scoreB++;
        }

        // Verificar se a partida deve terminar automaticamente (2 gols)
        if (this.currentMatch.scoreA >= 2 || this.currentMatch.scoreB >= 2) {
            this.endMatch();
        }

        return true;
    }

    /**
     * Remove o último gol da partida
     * @returns {boolean} - True se um gol foi removido
     */
    removeLastGoal() {
        if (!this.currentMatch || this.currentMatch.goals.length === 0) {
            return false;
        }

        const lastGoal = this.currentMatch.goals.pop();
        
        // Atualizar placar
        if (lastGoal.team === 'A') {
            this.currentMatch.scoreA--;
        } else {
            this.currentMatch.scoreB--;
        }

        return true;
    }

    /**
     * Finaliza a partida atual
     * @returns {Object|null} - Resultado da partida ou null se não há partida
     */
    endMatch() {
        if (!this.currentMatch || this.currentMatch.isEnded) {
            return null;
        }

        this.currentMatch.isEnded = true;
        this.currentMatch.endTime = new Date();

        // Determinar resultado
        let result;
        let winnerTeam = null;

        if (this.currentMatch.scoreA > this.currentMatch.scoreB) {
            result = 'teamA_wins';
            winnerTeam = this.currentMatch.teamA;
        } else if (this.currentMatch.scoreB > this.currentMatch.scoreA) {
            result = 'teamB_wins';
            winnerTeam = this.currentMatch.teamB;
        } else {
            result = 'draw';
        }

        // Atualizar estatísticas dos times
        this.updateTeamStatistics();

        // Atualizar estatísticas dos jogadores
        this.updatePlayerStatistics();

        // Adicionar partida ao histórico
        this.allMatches.push({...this.currentMatch});

        // Atualizar lógica de próxima partida
        this.updateNextMatchLogic(result, winnerTeam);

        const matchResult = {
            result: result,
            winner: winnerTeam,
            scoreA: this.currentMatch.scoreA,
            scoreB: this.currentMatch.scoreB,
            goals: [...this.currentMatch.goals]
        };

        return matchResult;
    }

    /**
     * Anula a partida atual
     * @returns {boolean} - True se a partida foi anulada
     */
    annulMatch() {
        if (!this.currentMatch) {
            return false;
        }

        this.currentMatch.isAnnulled = true;
        this.currentMatch.isEnded = true;
        this.currentMatch.endTime = new Date();

        // Não adicionar ao histórico nem atualizar estatísticas
        this.currentMatch = null;

        return true;
    }

    /**
     * Atualiza as estatísticas dos times após a partida
     */
    updateTeamStatistics() {
        const { teamA, teamB, scoreA, scoreB } = this.currentMatch;

        if (scoreA > scoreB) {
            // Time A venceu
            this.teamManager.updateTeamStats(teamA.id, 'win', scoreA, scoreB);
            this.teamManager.updateTeamStats(teamB.id, 'loss', scoreB, scoreA);
        } else if (scoreB > scoreA) {
            // Time B venceu
            this.teamManager.updateTeamStats(teamB.id, 'win', scoreB, scoreA);
            this.teamManager.updateTeamStats(teamA.id, 'loss', scoreA, scoreB);
        } else {
            // Empate
            this.teamManager.updateTeamStats(teamA.id, 'draw', scoreA, scoreB);
            this.teamManager.updateTeamStats(teamB.id, 'draw', scoreB, scoreA);
        }
    }

    /**
     * Atualiza as estatísticas dos jogadores após a partida
     */
    updatePlayerStatistics() {
        this.currentMatch.goals.forEach(goal => {
            const team = goal.team === 'A' ? this.currentMatch.teamA : this.currentMatch.teamB;
            
            // Atualizar gols
            this.teamManager.updatePlayerStats(team.id, goal.scorer, 1, 0);
            
            // Atualizar assistências
            if (goal.assist) {
                this.teamManager.updatePlayerStats(team.id, goal.assist, 0, 1);
            }
        });
    }

    /**
     * Atualiza a lógica para determinar a próxima partida
     * @param {string} result - Resultado da partida
     * @param {Object|null} winnerTeam - Time vencedor (se houver)
     */
    updateNextMatchLogic(result, winnerTeam) {
        // Determinar qual time não jogou nesta partida
        const allTeams = this.teamManager.getAllTeams();
        const currentTeamIds = [this.currentMatch.teamA.id, this.currentMatch.teamB.id];
        const teamThatDidNotPlay = allTeams.find(team => !currentTeamIds.includes(team.id));

        // Atualizar variáveis de controle
        this.teamThatDidNotPlayPenultimateMatch = this.teamThatDidNotPlayLastMatch;
        this.teamThatDidNotPlayLastMatch = teamThatDidNotPlay;

        if (result === 'draw') {
            this.lastMatchWasDraw = true;
            this.lastWinnerTeam = null;
        } else {
            this.lastMatchWasDraw = false;
            this.lastWinnerTeam = winnerTeam;
        }
    }

    /**
     * Sugere a próxima partida baseada na lógica do jogo
     * @returns {Object|null} - Sugestão de próxima partida ou null
     */
    suggestNextMatch() {
        const allTeams = this.teamManager.getAllTeams();
        
        if (allTeams.length !== 3) {
            return null;
        }

        // Se a última partida foi empate, não há sugestão automática
        if (this.lastMatchWasDraw) {
            return null;
        }

        // Se há um vencedor e um time que não jogou, sugerir partida entre eles
        if (this.lastWinnerTeam && this.teamThatDidNotPlayLastMatch) {
            return {
                teamA: this.lastWinnerTeam,
                teamB: this.teamThatDidNotPlayLastMatch,
                isAutomatic: true
            };
        }

        return null;
    }

    /**
     * Retorna a partida atual
     * @returns {Object|null} - Partida atual ou null
     */
    getCurrentMatch() {
        return this.currentMatch;
    }

    /**
     * Retorna todas as partidas
     * @returns {Array} - Array de partidas
     */
    getAllMatches() {
        return [...this.allMatches];
    }

    /**
     * Carrega dados de partidas salvas
     * @param {Object} data - Dados das partidas
     */
    loadMatchData(data) {
        this.allMatches = data.allMatches || [];
        this.lastWinnerTeam = data.lastWinnerTeam || null;
        this.lastMatchWasDraw = data.lastMatchWasDraw || false;
        this.teamThatDidNotPlayLastMatch = data.teamThatDidNotPlayLastMatch || null;
        this.teamThatDidNotPlayPenultimateMatch = data.teamThatDidNotPlayPenultimateMatch || null;
    }

    /**
     * Reseta todos os dados de partidas
     */
    reset() {
        this.currentMatch = null;
        this.allMatches = [];
        this.lastWinnerTeam = null;
        this.lastMatchWasDraw = false;
        this.teamThatDidNotPlayLastMatch = null;
        this.teamThatDidNotPlayPenultimateMatch = null;
    }

    /**
     * Verifica se uma partida está em andamento
     * @returns {boolean} - True se há partida em andamento
     */
    hasActiveMatch() {
        return this.currentMatch && !this.currentMatch.isEnded;
    }

    /**
     * Retorna estatísticas gerais das partidas
     * @returns {Object} - Estatísticas gerais
     */
    getGeneralStats() {
        const totalMatches = this.allMatches.length;
        const totalGoals = this.allMatches.reduce((sum, match) => 
            sum + match.scoreA + match.scoreB, 0);
        
        return {
            totalMatches,
            totalGoals,
            averageGoalsPerMatch: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : 0
        };
    }
}


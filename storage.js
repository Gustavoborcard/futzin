/**
 * Módulo Storage - Abstrai operações de localStorage
 * Responsável por salvar e carregar dados da aplicação
 */

const LOCAL_STORAGE_KEY = "futebolAppDados";

export class Storage {
    /**
     * Salva o estado atual no localStorage
     * @param {Object} data - Dados para salvar
     * @param {Array} data.teams - Array de times
     * @param {Array} data.allMatches - Array de todas as partidas
     * @param {Object|null} data.lastWinnerTeam - Último time vencedor
     * @param {boolean} data.lastMatchWasDraw - Se a última partida foi empate
     * @param {Object|null} data.teamThatDidNotPlayLastMatch - Time que não jogou na última partida
     * @param {Object|null} data.teamThatDidNotPlayPenultimateMatch - Time que não jogou na penúltima partida
     */
    static saveData(data) {
        const dataToSave = {
            teams: data.teams,
            allMatches: data.allMatches,
            lastWinnerTeamId: data.lastWinnerTeam ? data.lastWinnerTeam.id : null,
            lastMatchWasDraw: data.lastMatchWasDraw,
            teamThatDidNotPlayLastMatchId: data.teamThatDidNotPlayLastMatch ? data.teamThatDidNotPlayLastMatch.id : null,
            teamThatDidNotPlayPenultimateMatchId: data.teamThatDidNotPlayPenultimateMatch ? data.teamThatDidNotPlayPenultimateMatch.id : null
        };
        
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
            console.log("Dados salvos no localStorage.");
            return true;
        } catch (error) {
            console.error("Erro ao salvar dados no localStorage:", error);
            return false;
        }
    }

    /**
     * Carrega o estado do localStorage
     * @returns {Object|null} - Dados carregados ou null se não houver dados
     */
    static loadData() {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!savedData) {
            console.log("Nenhum dado salvo encontrado no localStorage.");
            return null;
        }

        try {
            const parsedData = JSON.parse(savedData);
            console.log("Dados carregados do localStorage.");
            return {
                teams: parsedData.teams || [],
                allMatches: parsedData.allMatches || [],
                lastWinnerTeamId: parsedData.lastWinnerTeamId,
                lastMatchWasDraw: parsedData.lastMatchWasDraw || false,
                teamThatDidNotPlayLastMatchId: parsedData.teamThatDidNotPlayLastMatchId,
                teamThatDidNotPlayPenultimateMatchId: parsedData.teamThatDidNotPlayPenultimateMatchId
            };
        } catch (error) {
            console.error("Erro ao carregar dados do localStorage:", error);
            // Se houver erro ao parsear, limpar dados corrompidos
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return null;
        }
    }

    /**
     * Verifica se existem dados salvos
     * @returns {boolean} - True se existem dados salvos
     */
    static hasData() {
        return localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
    }

    /**
     * Remove todos os dados salvos
     */
    static clearData() {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log("Dados removidos do localStorage.");
    }
}


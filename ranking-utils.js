/**
 * Utilitário para calcular ranking ordinal denso (dense ranking)
 * No ranking ordinal denso, jogadores com a mesma pontuação recebem a mesma posição,
 * e a próxima posição é incrementada em 1 (não pula posições).
 * 
 * Exemplo:
 * - Jogador A: 5 gols -> 1º lugar
 * - Jogador B: 5 gols -> 1º lugar  
 * - Jogador C: 3 gols -> 2º lugar (não 3º)
 * - Jogador D: 2 gols -> 3º lugar
 */

/**
 * Calcula o ranking ordinal denso para uma lista de jogadores
 * @param {Array} players - Array de jogadores com suas estatísticas
 * @param {string} statField - Campo da estatística para ranking ('goals' ou 'assists')
 * @returns {Array} Array de jogadores com campo 'rank' adicionado
 */
function calculateDenseRanking(players, statField) {
    // Filtrar apenas jogadores com estatísticas > 0
    const playersWithStats = players.filter(player => player[statField] > 0);
    
    if (playersWithStats.length === 0) {
        return [];
    }
    
    // Ordenar por estatística (decrescente)
    const sortedPlayers = [...playersWithStats].sort((a, b) => b[statField] - a[statField]);
    
    // Calcular ranking ordinal denso
    let currentRank = 1;
    let previousValue = null;
    
    const rankedPlayers = sortedPlayers.map((player, index) => {
        const currentValue = player[statField];
        
        // Se o valor mudou, atualizar o rank
        if (previousValue !== null && currentValue !== previousValue) {
            currentRank = index + 1;
        }
        
        previousValue = currentValue;
        
        return {
            ...player,
            rank: currentRank
        };
    });
    
    return rankedPlayers;
}

/**
 * Formata a posição do ranking para exibição
 * @param {number} rank - Posição no ranking
 * @returns {string} Posição formatada (ex: "1º", "2º", etc.)
 */
function formatRankPosition(rank) {
    return `${rank}º`;
}

// Exportar funções para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateDenseRanking,
        formatRankPosition
    };
}

// Para uso direto no browser
if (typeof window !== 'undefined') {
    window.RankingUtils = {
        calculateDenseRanking,
        formatRankPosition
    };
}


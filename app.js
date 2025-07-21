/**
 * Aplicação Principal - Gerenciador de Partidas de Futebol
 * Ponto de entrada que importa e coordena todos os módulos
 */

// Importar módulos
import { Storage } from './modules/storage.js';
import { Timer } from './modules/timer.js';
import { TeamManager } from './modules/teamManager.js';
import { MatchManager } from './modules/matchManager.js';
import { UIController } from './modules/uiController.js';

/**
 * Classe principal da aplicação
 */
class FutebolApp {
    constructor() {
        // Inicializar gerenciadores
        this.teamManager = new TeamManager();
        this.matchManager = new MatchManager(this.teamManager);
        this.uiController = new UIController();
        this.timer = new Timer();
        
        // Estado da aplicação
        this.currentMatch = null;
        this.isInitialized = false;
        
        // Configurar callbacks do timer
        this.setupTimerCallbacks();
        
        // Inicializar aplicação
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            // Criar modal de boas-vindas
            this.createWelcomeModal();
            
            // Carregar dados salvos
            this.loadSavedData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Mostrar modal de boas-vindas após um delay
            setTimeout(() => {
                this.showWelcomeModal();
            }, 500);
            
            this.isInitialized = true;
            console.log('Aplicação inicializada com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
        }
    }

    /**
     * Configura os callbacks do timer
     */
    setupTimerCallbacks() {
        this.timer.setOnTick((timeString) => {
            this.uiController.updateTimer(timeString);
        });

        this.timer.setOnExpire(() => {
            this.uiController.updateTimerStatus('Tempo esgotado!');
            this.uiController.addTemporaryClass('match-timer', 'pulse');
        });
    }

    /**
     * Carrega dados salvos do localStorage
     */
    loadSavedData() {
        const savedData = Storage.loadData();
        if (savedData) {
            // Carregar times
            this.teamManager.loadTeams(savedData.teams);
            
            // Carregar dados de partidas
            const matchData = {
                allMatches: savedData.allMatches,
                lastWinnerTeam: this.teamManager.getTeamById(savedData.lastWinnerTeamId),
                lastMatchWasDraw: savedData.lastMatchWasDraw,
                teamThatDidNotPlayLastMatch: this.teamManager.getTeamById(savedData.teamThatDidNotPlayLastMatchId),
                teamThatDidNotPlayPenultimateMatch: this.teamManager.getTeamById(savedData.teamThatDidNotPlayPenultimateMatchId)
            };
            
            this.matchManager.loadMatchData(matchData);
            
            console.log('Dados carregados com sucesso');
        }
    }

    /**
     * Salva dados no localStorage
     */
    saveData() {
        const dataToSave = {
            teams: this.teamManager.getAllTeams(),
            allMatches: this.matchManager.getAllMatches(),
            lastWinnerTeam: this.matchManager.lastWinnerTeam,
            lastMatchWasDraw: this.matchManager.lastMatchWasDraw,
            teamThatDidNotPlayLastMatch: this.matchManager.teamThatDidNotPlayLastMatch,
            teamThatDidNotPlayPenultimateMatch: this.matchManager.teamThatDidNotPlayPenultimateMatch
        };
        
        Storage.saveData(dataToSave);
    }

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        // Botões de configuração de times
        this.setupTeamConfigListeners();
        
        // Botões de configuração de partida
        this.setupMatchConfigListeners();
        
        // Botões de controle da partida
        this.setupMatchControlListeners();
        
        // Botões de timer
        this.setupTimerListeners();
        
        // Modais
        this.setupModalListeners();
        
        // Botões de estatísticas
        this.setupStatsListeners();
        
        // Selects de cores
        this.setupColorSelectListeners();
        
        // Selects de times
        this.setupTeamSelectListeners();
    }

    /**
     * Configura listeners para configuração de times
     */
    setupTeamConfigListeners() {
        // Botões de adicionar jogador
        document.querySelectorAll('.add-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.addPlayerInput(e));
        });

        // Botão de salvar times
        const saveTeamsBtn = document.getElementById('save-teams-btn');
        if (saveTeamsBtn) {
            saveTeamsBtn.addEventListener('click', () => this.saveTeams());
        }
    }

    /**
     * Configura listeners para configuração de partida
     */
    setupMatchConfigListeners() {
        const startMatchBtn = document.getElementById('start-match-btn');
        if (startMatchBtn) {
            startMatchBtn.addEventListener('click', () => this.startMatch());
        }
    }

    /**
     * Configura listeners para controle da partida
     */
    setupMatchControlListeners() {
        // Botões de gol
        const teamAGoalBtn = document.getElementById('team-a-goal-btn');
        const teamBGoalBtn = document.getElementById('team-b-goal-btn');
        
        if (teamAGoalBtn) {
            teamAGoalBtn.addEventListener('click', () => this.openGoalModal('A'));
        }
        
        if (teamBGoalBtn) {
            teamBGoalBtn.addEventListener('click', () => this.openGoalModal('B'));
        }

        // Botões de ação da partida
        const endMatchBtn = document.getElementById('end-match-btn');
        const annulMatchBtn = document.getElementById('annul-match-btn');
        
        if (endMatchBtn) {
            endMatchBtn.addEventListener('click', () => this.endMatch());
        }
        
        if (annulMatchBtn) {
            annulMatchBtn.addEventListener('click', () => this.uiController.showAnnulModal());
        }
    }

    /**
     * Configura listeners para o timer
     */
    setupTimerListeners() {
        const startBtn = document.getElementById('timer-start-btn');
        const pauseBtn = document.getElementById('timer-pause-btn');
        const resetBtn = document.getElementById('timer-reset-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTimer());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseTimer());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }
    }

    /**
     * Configura listeners para modais
     */
    setupModalListeners() {
        // Modal de gol
        const saveGoalBtn = document.getElementById('save-goal-btn');
        const closeModalBtn = document.querySelector('.close-modal');
        
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', () => this.saveGoal());
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.uiController.hideGoalModal());
        }

        // Modal de anulação
        const confirmAnnulBtn = document.getElementById('confirm-annul-btn');
        const cancelAnnulBtn = document.getElementById('cancel-annul-btn');
        
        if (confirmAnnulBtn) {
            confirmAnnulBtn.addEventListener('click', () => this.annulMatch());
        }
        
        if (cancelAnnulBtn) {
            cancelAnnulBtn.addEventListener('click', () => this.uiController.hideAnnulModal());
        }

        // Fechar modais clicando fora
        window.addEventListener('click', (e) => {
            const goalModal = document.getElementById('goal-modal');
            const annulModal = document.getElementById('annul-modal');
            
            if (e.target === goalModal) {
                this.uiController.hideGoalModal();
            }
            
            if (e.target === annulModal) {
                this.uiController.hideAnnulModal();
            }
        });
    }

    /**
     * Configura listeners para estatísticas
     */
    setupStatsListeners() {
        // Botões de estatísticas gerais
        document.querySelectorAll('.all-stats-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showAllStats());
        });

        // Botão de voltar
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backFromStats());
        }

        // Botão de nova partida
        const newMatchBtn = document.getElementById('new-match-btn');
        if (newMatchBtn) {
            newMatchBtn.addEventListener('click', () => this.setupNewMatch());
        }

        // Botão de gerar imagem de estatísticas
        const generateImageBtn = document.getElementById('generate-all-stats-image-btn');
        if (generateImageBtn) {
            generateImageBtn.addEventListener('click', () => this.generateAllStatsImage());
        }

        // Botão de copiar tabela
        const copyTableBtn = document.getElementById('copy-table-btn');
        if (copyTableBtn) {
            copyTableBtn.addEventListener('click', () => this.copyStatsTable());
        }
    }

    /**
     * Configura listeners para selects de cores
     */
    setupColorSelectListeners() {
        const colorSelects = document.querySelectorAll('#team1-color, #team2-color, #team3-color');
        colorSelects.forEach(select => {
            // Aplicar cor inicial
            this.uiController.updateTeamColorDisplay(select);
            
            select.addEventListener('change', (e) => {
                if (this.isColorAlreadySelected(e.target)) {
                    alert('Esta cor já está sendo usada por outro time. Por favor, escolha uma cor diferente.');
                    e.target.value = e.target.dataset.lastValue || '';
                }
                
                this.uiController.updateTeamColorDisplay(e.target);
                e.target.dataset.lastValue = e.target.value;
            });
            
            select.dataset.lastValue = select.value;
        });
    }

    /**
     * Configura listeners para selects de times
     */
    setupTeamSelectListeners() {
        const teamSelects = document.querySelectorAll('#team-a-select, #team-b-select');
        teamSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.uiController.updateMatchSetupColors();
            });
        });
    }

    /**
     * Adiciona input de jogador
     */
    addPlayerInput(event) {
        const teamNumber = event.target.dataset.team;
        const playersContainer = document.getElementById(`team${teamNumber}-players`);
        const currentInputs = playersContainer.querySelectorAll('.player-input');
        
        if (currentInputs.length >= 6) {
            alert('Máximo de 6 jogadores por time.');
            return;
        }
        
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-input';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name large-input';
        input.placeholder = `Nome do Jogador ${currentInputs.length + 1}`;
        input.maxLength = 20;
        
        playerDiv.appendChild(input);
        playersContainer.appendChild(playerDiv);
    }

    /**
     * Salva os times configurados
     */
    saveTeams() {
        const teams = [];
        let hasErrors = false;
        
        for (let i = 1; i <= 3; i++) {
            const color = document.getElementById(`team${i}-color`).value;
            const playerInputs = document.querySelectorAll(`#team${i}-players .player-name`);
            const players = Array.from(playerInputs).map(input => input.value.trim()).filter(name => name !== '');
            
            const validation = this.teamManager.validateTeam(color, players);
            
            if (!validation.isValid) {
                alert(`Erro no Time ${i}:\n${validation.errors.join('\n')}`);
                hasErrors = true;
                break;
            }
            
            const team = this.teamManager.createTeam(color, validation.validPlayers);
            teams.push(team);
        }
        
        if (!hasErrors) {
            // Limpar times existentes e adicionar novos
            this.teamManager.reset();
            teams.forEach(team => this.teamManager.addTeam(team));
            
            // Salvar dados
            this.saveData();
            
            // Ir para configuração de partida
            this.uiController.showSection('match-setup');
            this.updateTeamSelects();
            
            alert('Times salvos com sucesso!');
        }
    }

    /**
     * Atualiza os selects de times
     */
    updateTeamSelects() {
        const teams = this.teamManager.getAllTeams();
        this.uiController.updateTeamSelects(teams);
        
        // Verificar se há sugestão automática
        const suggestion = this.matchManager.suggestNextMatch();
        if (suggestion) {
            this.applySuggestion(suggestion);
        }
    }

    /**
     * Aplica sugestão automática de partida
     */
    applySuggestion(suggestion) {
        const teamASelect = document.getElementById('team-a-select');
        const teamBSelect = document.getElementById('team-b-select');
        
        if (teamASelect && teamBSelect) {
            teamASelect.value = suggestion.teamA.id;
            teamBSelect.value = suggestion.teamB.id;
            
            this.uiController.updateMatchSetupColors();
            this.uiController.showAutoMatchMessage();
        }
    }

    /**
     * Inicia uma nova partida
     */
    startMatch() {
        const teamAId = document.getElementById('team-a-select').value;
        const teamBId = document.getElementById('team-b-select').value;
        
        if (!teamAId || !teamBId) {
            alert('Selecione ambos os times para iniciar a partida.');
            return;
        }
        
        if (teamAId === teamBId) {
            alert('Selecione times diferentes para a partida.');
            return;
        }
        
        const teamA = this.teamManager.getTeamById(parseInt(teamAId));
        const teamB = this.teamManager.getTeamById(parseInt(teamBId));
        
        // Criar partida
        this.currentMatch = this.matchManager.createMatch(teamA, teamB);
        
        // Atualizar interface
        this.uiController.showSection('match-in-progress');
        this.uiController.updateMatchDisplay(this.currentMatch, this.teamManager);
        this.uiController.updateGoalsHistory([], this.currentMatch, this.teamManager);
        this.uiController.updateTimerStatus('Aguardando início');
        
        // Resetar timer
        this.timer.reset();
        this.uiController.updateTimer(this.timer.getFormattedTime());
        this.uiController.updateTimerButtons(false);
    }

    /**
     * Inicia o cronômetro
     */
    startTimer() {
        this.timer.start();
        this.uiController.updateTimerButtons(true);
        this.uiController.updateTimerStatus('Partida em andamento');
    }

    /**
     * Pausa o cronômetro
     */
    pauseTimer() {
        this.timer.pause();
        this.uiController.updateTimerButtons(false);
        this.uiController.updateTimerStatus('Partida pausada');
    }

    /**
     * Reseta o cronômetro
     */
    resetTimer() {
        this.timer.reset();
        this.uiController.updateTimerButtons(false);
        this.uiController.updateTimerStatus('Aguardando início');
    }

    /**
     * Abre modal de gol
     */
    openGoalModal(team) {
        if (!this.currentMatch || this.currentMatch.isEnded) {
            alert('Não há partida em andamento.');
            return;
        }
        
        this.uiController.showGoalModal(team, this.currentMatch);
    }

    /**
     * Salva um gol
     */
    saveGoal() {
        const modal = document.getElementById('goal-modal');
        const team = modal.dataset.team;
        const scorer = document.getElementById('goal-scorer').value;
        const assist = document.getElementById('goal-assist').value;
        
        if (!scorer) {
            alert('Selecione quem marcou o gol.');
            return;
        }
        
        if (assist && scorer === assist) {
            alert('Um jogador não pode dar assistência para seu próprio gol.');
            return;
        }
        
        try {
            const time = this.timer.getFormattedTime();
            this.matchManager.addGoal(team, scorer, assist || null, time);
            
            // Atualizar interface
            this.uiController.updateScore(this.currentMatch.scoreA, this.currentMatch.scoreB);
            this.uiController.updateGoalsHistory(this.currentMatch.goals, this.currentMatch, this.teamManager);
            
            // Salvar dados
            this.saveData();
            
            // Fechar modal
            this.uiController.hideGoalModal();
            
            // Verificar se a partida terminou automaticamente
            if (this.currentMatch.isEnded) {
                this.showMatchStats();
            }
            
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Finaliza a partida
     */
    endMatch() {
        if (!this.currentMatch || this.currentMatch.isEnded) {
            alert('Não há partida em andamento.');
            return;
        }
        
        const result = this.matchManager.endMatch();
        
        if (result) {
            // Parar timer
            this.timer.pause();
            
            // Salvar dados
            this.saveData();
            
            // Mostrar estatísticas
            this.showMatchStats();
        }
    }

    /**
     * Anula a partida
     */
    annulMatch() {
        if (this.matchManager.annulMatch()) {
            // Parar e resetar timer
            this.timer.destroy();
            this.timer = new Timer();
            this.setupTimerCallbacks();
            
            // Voltar para configuração de partida
            this.uiController.showSection('match-setup');
            this.uiController.hideAnnulModal();
            
            alert('Partida anulada com sucesso.');
        }
    }

    /**
     * Mostra estatísticas da partida
     */
    showMatchStats() {
        // Atualizar interface de estatísticas
        const statsTeamAColor = document.getElementById('stats-team-a-color');
        const statsTeamBColor = document.getElementById('stats-team-b-color');
        const statsTeamAScore = document.getElementById('stats-team-a-score');
        const statsTeamBScore = document.getElementById('stats-team-b-score');
        const statsGoalsList = document.getElementById('stats-goals-list');
        
        if (statsTeamAColor) {
            statsTeamAColor.className = `team-color-display team-${this.currentMatch.teamA.color}`;
            statsTeamAColor.textContent = this.teamManager.getColorName(this.currentMatch.teamA.color);
        }
        
        if (statsTeamBColor) {
            statsTeamBColor.className = `team-color-display team-${this.currentMatch.teamB.color}`;
            statsTeamBColor.textContent = this.teamManager.getColorName(this.currentMatch.teamB.color);
        }
        
        if (statsTeamAScore) statsTeamAScore.textContent = this.currentMatch.scoreA;
        if (statsTeamBScore) statsTeamBScore.textContent = this.currentMatch.scoreB;
        
        // Atualizar lista de gols
        if (statsGoalsList) {
            if (this.currentMatch.goals.length === 0) {
                statsGoalsList.innerHTML = '<p class="no-goals">Nenhum gol marcado</p>';
            } else {
                statsGoalsList.innerHTML = '';
                this.currentMatch.goals.forEach(goal => {
                    const goalDiv = document.createElement('div');
                    goalDiv.className = 'goal-entry';
                    
                    const team = goal.team === 'A' ? this.currentMatch.teamA : this.currentMatch.teamB;
                    const teamColorName = this.teamManager.getColorName(team.color);
                    
                    let goalText = `⚽ ${goal.scorer} (${teamColorName}) - ${goal.time}`;
                    if (goal.assist) {
                        goalText += ` | Assistência: ${goal.assist}`;
                    }
                    
                    goalDiv.textContent = goalText;
                    statsGoalsList.appendChild(goalDiv);
                });
            }
        }
        
        this.uiController.showSection('match-stats');
    }

    /**
     * Configura nova partida
     */
    setupNewMatch() {
        this.currentMatch = null;
        this.uiController.showSection('match-setup');
        this.updateTeamSelects();
        this.uiController.hideAutoMatchMessage();
    }

    /**
     * Mostra estatísticas gerais
     */
    showAllStats() {
        this.uiController.setPreviousSection(document.querySelector('.section-container:not(.hidden)').id);
        this.generateTeamsStats();
        this.uiController.showSection('all-stats');
    }

    /**
     * Volta das estatísticas
     */
    backFromStats() {
        this.uiController.goToPreviousSection();
    }

    /**
     * Gera estatísticas dos times
     */
    generateTeamsStats() {
        const teams = this.teamManager.getAllTeams();
        const container = document.getElementById('teams-stats-container');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        teams.forEach(team => {
            const card = this.createTeamStatsCard(team);
            container.appendChild(card);
        });
    }

    /**
     * Cria card de estatísticas de um time
     */
    createTeamStatsCard(team) {
        const card = document.createElement('div');
        card.className = 'team-stats-card';
        
        const points = this.teamManager.calculatePoints(team);
        const goalDifference = this.teamManager.calculateGoalDifference(team);
        const colorName = this.teamManager.getColorName(team.color);
        
        card.innerHTML = `
            <div class="team-stats-header">
                <div class="team-stats-name team-${team.color}">
                    Time ${colorName}
                </div>
                <div class="team-stats-record">
                    ${team.wins}V - ${team.draws}E - ${team.losses}D | ${points} pts
                </div>
                <div class="team-stats-goals">
                    Gols: ${team.goalsFor} / Sofridos: ${team.goalsAgainst} / Saldo: ${goalDifference >= 0 ? '+' : ''}${goalDifference}
                </div>
            </div>
            
            <div class="player-stats">
                <h4>Estatísticas dos Jogadores</h4>
                <div class="player-stats-list">
                    ${this.generatePlayerStatsList(team)}
                </div>
            </div>
        `;
        
        return card;
    }

    /**
     * Gera lista de estatísticas dos jogadores
     */
    generatePlayerStatsList(team) {
        if (!team.playerStats || Object.keys(team.playerStats).length === 0) {
            return '<p class="no-goals">Nenhuma estatística disponível</p>';
        }
        
        const players = Object.entries(team.playerStats)
            .sort(([,a], [,b]) => b.goals - a.goals)
            .map(([name, stats]) => `
                <div class="player-stats-item">
                    <span class="player-name">${name}</span>
                    <span class="player-stats-data">${stats.goals} gols, ${stats.assists} assistências</span>
                </div>
            `);
        
        return players.join('');
    }

    /**
     * Verifica se uma cor já está selecionada
     */
    isColorAlreadySelected(currentSelect) {
        const allSelects = document.querySelectorAll('#team1-color, #team2-color, #team3-color');
        const selectedColors = Array.from(allSelects)
            .filter(select => select !== currentSelect && select.value)
            .map(select => select.value);
        
        return selectedColors.includes(currentSelect.value);
    }

    /**
     * Cria modal de boas-vindas
     */
    createWelcomeModal() {
        const welcomeModal = document.createElement('div');
        welcomeModal.id = 'welcome-modal';
        welcomeModal.className = 'modal hidden';
        
        welcomeModal.innerHTML = `
            <div class="modal-content">
                <h2>Gerenciador de Partidas de Futebol</h2>
                <p>Bem-vindo ao Gerenciador de Partidas!</p>
                <div class="welcome-options" id="welcome-options">
                    <!-- Opções serão adicionadas dinamicamente -->
                </div>
            </div>
        `;
        
        document.body.appendChild(welcomeModal);
        
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .welcome-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Mostra modal de boas-vindas
     */
    showWelcomeModal() {
        const welcomeModal = document.getElementById('welcome-modal');
        const welcomeOptions = document.getElementById('welcome-options');
        const hasSavedData = Storage.hasData();
        
        // Limpar opções
        welcomeOptions.innerHTML = '';
        
        // Opção continuar (se há dados salvos)
        if (hasSavedData) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'primary-btn';
            continueBtn.innerHTML = '<i class="fas fa-play"></i> Continuar Contagem';
            continueBtn.addEventListener('click', () => {
                welcomeModal.classList.add('hidden');
                
                const teams = this.teamManager.getAllTeams();
                if (teams.length === 3) {
                    this.uiController.showSection('match-setup');
                    this.updateTeamSelects();
                } else {
                    this.uiController.showSection('team-setup');
                }
            });
            welcomeOptions.appendChild(continueBtn);
        }
        
        // Opção nova contagem
        const newCountBtn = document.createElement('button');
        newCountBtn.className = 'secondary-btn';
        newCountBtn.innerHTML = '<i class="fas fa-redo"></i> Começar Nova Contagem';
        newCountBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja começar uma nova contagem? Todos os dados salvos serão perdidos.')) {
                this.resetAllData();
                welcomeModal.classList.add('hidden');
                this.uiController.showSection('team-setup');
            }
        });
        welcomeOptions.appendChild(newCountBtn);
        
        // Mostrar modal
        welcomeModal.classList.remove('hidden');
        
        // Esconder todas as seções
        this.uiController.sections.forEach(section => {
            document.getElementById(section).classList.add('hidden');
        });
    }

    /**
     * Reseta todos os dados
     */
    resetAllData() {
        // Limpar localStorage
        Storage.clearData();
        
        // Resetar gerenciadores
        this.teamManager.reset();
        this.matchManager.reset();
        
        // Resetar timer
        this.timer.destroy();
        this.timer = new Timer();
        this.setupTimerCallbacks();
        
        // Resetar estado
        this.currentMatch = null;
        
        // Resetar interface
        this.uiController.resetTeamSetupUI();
        
        console.log('Todos os dados foram resetados.');
    }

    /**
     * Gera imagem de estatísticas (placeholder)
     */
    generateAllStatsImage() {
        alert('Funcionalidade de geração de imagem será implementada em versão futura.');
    }

    /**
     * Copia tabela de estatísticas (placeholder)
     */
    copyStatsTable() {
        alert('Funcionalidade de cópia de tabela será implementada em versão futura.');
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.futebolApp = new FutebolApp();
});


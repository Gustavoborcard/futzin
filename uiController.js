/**
 * Módulo UIController - Controla a manipulação das seções e interface
 * Responsável por mostrar/esconder seções, atualizar elementos da UI e gerenciar modais
 */

export class UIController {
    constructor() {
        this.sections = [
            "team-setup",
            "match-setup", 
            "match-in-progress",
            "match-stats",
            "all-stats"
        ];
        this.previousSection = null;
    }

    /**
     * Mostra uma seção específica e esconde as demais
     * @param {string} sectionId - ID da seção a ser mostrada
     */
    showSection(sectionId) {
        this.sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                if (section === sectionId) {
                    element.classList.remove("hidden");
                } else {
                    element.classList.add("hidden");
                }
            }
        });
    }

    /**
     * Atualiza os selects de times na configuração de partida
     * @param {Array} teams - Array de times
     */
    updateTeamSelects(teams) {
        const teamASelect = document.getElementById("team-a-select");
        const teamBSelect = document.getElementById("team-b-select");

        if (!teamASelect || !teamBSelect) return;

        // Limpar opções existentes
        teamASelect.innerHTML = '<option value="" disabled selected>Selecione o Time A</option>';
        teamBSelect.innerHTML = '<option value="" disabled selected>Selecione o Time B</option>';

        // Adicionar opções dos times
        teams.forEach(team => {
            const colorName = this.getColorName(team.color);
            
            const optionA = document.createElement("option");
            optionA.value = team.id;
            optionA.textContent = `Time ${colorName}`;
            optionA.dataset.color = team.color;
            teamASelect.appendChild(optionA);

            const optionB = document.createElement("option");
            optionB.value = team.id;
            optionB.textContent = `Time ${colorName}`;
            optionB.dataset.color = team.color;
            teamBSelect.appendChild(optionB);
        });
    }

    /**
     * Atualiza as cores dos selects na configuração de partida
     */
    updateMatchSetupColors() {
        const teamASelect = document.getElementById("team-a-select");
        const teamBSelect = document.getElementById("team-b-select");

        if (!teamASelect || !teamBSelect) return;

        // Atualizar cor do Time A
        const selectedOptionA = teamASelect.options[teamASelect.selectedIndex];
        if (selectedOptionA && selectedOptionA.dataset.color) {
            this.updateSelectColor(teamASelect, selectedOptionA.dataset.color);
        } else {
            this.resetSelectColor(teamASelect);
        }

        // Atualizar cor do Time B
        const selectedOptionB = teamBSelect.options[teamBSelect.selectedIndex];
        if (selectedOptionB && selectedOptionB.dataset.color) {
            this.updateSelectColor(teamBSelect, selectedOptionB.dataset.color);
        } else {
            this.resetSelectColor(teamBSelect);
        }
    }

    /**
     * Atualiza a cor de um select
     * @param {HTMLElement} select - Elemento select
     * @param {string} color - Cor a ser aplicada
     */
    updateSelectColor(select, color) {
        select.className = `large-select team-${color}`;
        select.style.color = "white";
        select.style.fontWeight = "bold";
    }

    /**
     * Reseta a cor de um select
     * @param {HTMLElement} select - Elemento select
     */
    resetSelectColor(select) {
        select.className = "large-select";
        select.style.color = "";
        select.style.fontWeight = "";
    }

    /**
     * Atualiza a exibição da cor do time
     * @param {HTMLElement} select - Select de cor do time
     */
    updateTeamColorDisplay(select) {
        const selectedColor = select.value;
        
        if (selectedColor) {
            select.className = `large-select team-${selectedColor}`;
            select.style.color = "white";
            select.style.fontWeight = "bold";
        } else {
            select.className = "large-select";
            select.style.color = "";
            select.style.fontWeight = "";
        }
    }

    /**
     * Atualiza a interface da partida em andamento
     * @param {Object} match - Dados da partida
     * @param {Object} teamManager - Instância do TeamManager
     */
    updateMatchDisplay(match, teamManager) {
        // Atualizar cores dos times
        const teamAColorDisplay = document.getElementById("match-team-a-color");
        const teamBColorDisplay = document.getElementById("match-team-b-color");
        
        if (teamAColorDisplay) {
            teamAColorDisplay.className = `team-color-display team-${match.teamA.color}`;
            teamAColorDisplay.textContent = teamManager.getColorName(match.teamA.color);
        }
        
        if (teamBColorDisplay) {
            teamBColorDisplay.className = `team-color-display team-${match.teamB.color}`;
            teamBColorDisplay.textContent = teamManager.getColorName(match.teamB.color);
        }

        // Atualizar nomes das cores nos botões de gol
        const teamAColorName = document.getElementById("team-a-color-name");
        const teamBColorName = document.getElementById("team-b-color-name");
        
        if (teamAColorName) {
            teamAColorName.textContent = teamManager.getColorName(match.teamA.color);
        }
        
        if (teamBColorName) {
            teamBColorName.textContent = teamManager.getColorName(match.teamB.color);
        }

        // Atualizar cores dos botões de gol
        const teamAGoalBtn = document.getElementById("team-a-goal-btn");
        const teamBGoalBtn = document.getElementById("team-b-goal-btn");
        
        if (teamAGoalBtn) {
            teamAGoalBtn.className = `goal-btn team-a white-text team-${match.teamA.color}`;
        }
        
        if (teamBGoalBtn) {
            teamBGoalBtn.className = `goal-btn team-b white-text team-${match.teamB.color}`;
        }

        // Atualizar placar
        this.updateScore(match.scoreA, match.scoreB);
    }

    /**
     * Atualiza o placar na interface
     * @param {number} scoreA - Placar do time A
     * @param {number} scoreB - Placar do time B
     */
    updateScore(scoreA, scoreB) {
        const teamAScore = document.getElementById("team-a-score");
        const teamBScore = document.getElementById("team-b-score");
        
        if (teamAScore) teamAScore.textContent = scoreA;
        if (teamBScore) teamBScore.textContent = scoreB;
    }

    /**
     * Atualiza o cronômetro na interface
     * @param {string} timeString - Tempo formatado (MM:SS)
     */
    updateTimer(timeString) {
        const timerElement = document.getElementById("match-timer");
        if (timerElement) {
            timerElement.textContent = timeString;
        }
    }

    /**
     * Atualiza o status do cronômetro
     * @param {string} status - Status do cronômetro
     */
    updateTimerStatus(status) {
        const statusElement = document.getElementById("match-status");
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    /**
     * Atualiza os botões de controle do cronômetro
     * @param {boolean} isRunning - Se o cronômetro está rodando
     */
    updateTimerButtons(isRunning) {
        const startBtn = document.getElementById("timer-start-btn");
        const pauseBtn = document.getElementById("timer-pause-btn");
        
        if (startBtn && pauseBtn) {
            if (isRunning) {
                startBtn.classList.add("hidden");
                pauseBtn.classList.remove("hidden");
            } else {
                startBtn.classList.remove("hidden");
                pauseBtn.classList.add("hidden");
            }
        }
    }

    /**
     * Atualiza o histórico de gols
     * @param {Array} goals - Array de gols
     * @param {Object} match - Dados da partida
     * @param {Object} teamManager - Instância do TeamManager
     */
    updateGoalsHistory(goals, match, teamManager) {
        const goalsHistory = document.getElementById("goals-history");
        if (!goalsHistory) return;

        if (goals.length === 0) {
            goalsHistory.innerHTML = '<p class="no-goals">Nenhum gol marcado ainda</p>';
            return;
        }

        goalsHistory.innerHTML = '';
        goals.forEach(goal => {
            const goalDiv = document.createElement("div");
            goalDiv.className = "goal-entry";
            
            const team = goal.team === 'A' ? match.teamA : match.teamB;
            const teamColorName = teamManager.getColorName(team.color);
            
            let goalText = `⚽ ${goal.scorer} (${teamColorName}) - ${goal.time}`;
            if (goal.assist) {
                goalText += ` | Assistência: ${goal.assist}`;
            }
            
            goalDiv.textContent = goalText;
            goalsHistory.appendChild(goalDiv);
        });
    }

    /**
     * Mostra modal de gol
     * @param {string} team - 'A' ou 'B'
     * @param {Object} match - Dados da partida
     */
    showGoalModal(team, match) {
        const modal = document.getElementById("goal-modal");
        const scorerSelect = document.getElementById("goal-scorer");
        const assistSelect = document.getElementById("goal-assist");
        
        if (!modal || !scorerSelect || !assistSelect) return;

        const teamData = team === 'A' ? match.teamA : match.teamB;
        
        // Limpar selects
        scorerSelect.innerHTML = '<option value="" disabled selected>Selecione quem marcou</option>';
        assistSelect.innerHTML = '<option value="" disabled selected>Nenhuma assistência</option>';
        
        // Adicionar jogadores
        teamData.players.forEach(player => {
            const scorerOption = document.createElement("option");
            scorerOption.value = player;
            scorerOption.textContent = player;
            scorerSelect.appendChild(scorerOption);
            
            const assistOption = document.createElement("option");
            assistOption.value = player;
            assistOption.textContent = player;
            assistSelect.appendChild(assistOption);
        });
        
        // Armazenar qual time marcou
        modal.dataset.team = team;
        
        // Mostrar modal
        modal.classList.remove("hidden");
    }

    /**
     * Esconde modal de gol
     */
    hideGoalModal() {
        const modal = document.getElementById("goal-modal");
        if (modal) {
            modal.classList.add("hidden");
        }
    }

    /**
     * Mostra modal de anulação
     */
    showAnnulModal() {
        const modal = document.getElementById("annul-modal");
        if (modal) {
            modal.classList.remove("hidden");
        }
    }

    /**
     * Esconde modal de anulação
     */
    hideAnnulModal() {
        const modal = document.getElementById("annul-modal");
        if (modal) {
            modal.classList.add("hidden");
        }
    }

    /**
     * Mostra mensagem de configuração automática de partida
     */
    showAutoMatchMessage() {
        const message = document.getElementById("auto-match-message");
        if (message) {
            message.classList.remove("hidden");
        }
    }

    /**
     * Esconde mensagem de configuração automática de partida
     */
    hideAutoMatchMessage() {
        const message = document.getElementById("auto-match-message");
        if (message) {
            message.classList.add("hidden");
        }
    }

    /**
     * Retorna o nome da cor em português
     * @param {string} color - Cor em inglês
     * @returns {string} - Nome da cor em português
     */
    getColorName(color) {
        const colorNames = {
            'red': 'Vermelho',
            'green': 'Verde',
            'blue': 'Azul', 
            'yellow': 'Amarelo',
            'orange': 'Laranja'
        };
        return colorNames[color] || color;
    }

    /**
     * Define a seção anterior para controle de navegação
     * @param {string} sectionId - ID da seção anterior
     */
    setPreviousSection(sectionId) {
        this.previousSection = sectionId;
    }

    /**
     * Retorna para a seção anterior
     */
    goToPreviousSection() {
        if (this.previousSection) {
            this.showSection(this.previousSection);
        }
    }

    /**
     * Adiciona classe de animação a um elemento
     * @param {string} elementId - ID do elemento
     * @param {string} className - Nome da classe de animação
     * @param {number} duration - Duração da animação em ms
     */
    addTemporaryClass(elementId, className, duration = 1500) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
            setTimeout(() => {
                element.classList.remove(className);
            }, duration);
        }
    }

    /**
     * Reseta a interface de configuração de times
     */
    resetTeamSetupUI() {
        // Limpar selects de cores
        const colorSelects = document.querySelectorAll("#team1-color, #team2-color, #team3-color");
        colorSelects.forEach(select => {
            select.value = "";
            this.resetSelectColor(select);
        });
        
        // Limpar campos de jogadores
        for (let i = 1; i <= 3; i++) {
            const playersContainer = document.getElementById(`team${i}-players`);
            if (playersContainer) {
                const playerInputs = playersContainer.querySelectorAll(".player-input");
                
                // Remover inputs adicionais (manter apenas os 2 primeiros)
                for (let j = 2; j < playerInputs.length; j++) {
                    playersContainer.removeChild(playerInputs[j]);
                }
                
                // Limpar os inputs padrão
                const defaultInputs = playersContainer.querySelectorAll("input");
                defaultInputs.forEach(input => {
                    input.value = "";
                });
            }
        }
    }
}


// Variáveis Globais
let teams = [];
let currentMatch = {
    teamA: null,
    teamB: null,
    scoreA: 0,
    scoreB: 0,
    goals: [],
    timerInterval: null,
    timerSeconds: 7 * 60, // 7 minutos em segundos
    isTimerRunning: false,
    isMatchEnded: false,
    timeExpired: false,
    viewingStats: false, // Flag para controlar visualização de estatísticas
    startTime: null, // Timestamp de início da partida
    pausedTime: 0, // Tempo total pausado em milissegundos
    lastPauseStart: null, // Timestamp do último pause
    endTime: null // Timestamp do fim da partida (quando atinge 3 gols ou é encerrada manualmente)
};

const GOAL_LIMIT = 2; // Número de gols para acionar a pausa da partida

let allMatches = [];
let lastWinnerTeam = null;
let previousSection = null; // Para controlar o retorno após visualizar estatísticas

// Novas variáveis para a lógica de predefinição
let lastMatchWasDraw = false;
let teamThatDidNotPlayLastMatch = null;
let teamThatDidNotPlayPenultimateMatch = null;

// Chave para o localStorage
const LOCAL_STORAGE_KEY = "futebolAppDados";

// --- Funções de Persistência --- 

// Salva o estado atual no localStorage
function saveDataToLocalStorage() {
    const dataToSave = {
        teams: teams,
        allMatches: allMatches,
        lastWinnerTeamId: lastWinnerTeam ? lastWinnerTeam.id : null,
        lastMatchWasDraw: lastMatchWasDraw,
        teamThatDidNotPlayLastMatchId: teamThatDidNotPlayLastMatch ? teamThatDidNotPlayLastMatch.id : null,
        teamThatDidNotPlayPenultimateMatchId: teamThatDidNotPlayPenultimateMatch ? teamThatDidNotPlayPenultimateMatch.id : null
    };
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Dados salvos no localStorage.");
    } catch (error) {
        console.error("Erro ao salvar dados no localStorage:", error);
        // Poderia adicionar um alerta para o usuário aqui se o localStorage estiver cheio ou indisponível
    }
}

// Carrega o estado do localStorage
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            teams = parsedData.teams || [];
            allMatches = parsedData.allMatches || [];
            
            // Restaurar referências de times nas variáveis auxiliares
            lastWinnerTeam = teams.find(team => team.id === parsedData.lastWinnerTeamId) || null;
            lastMatchWasDraw = parsedData.lastMatchWasDraw || false;
            teamThatDidNotPlayLastMatch = teams.find(team => team.id === parsedData.teamThatDidNotPlayLastMatchId) || null;
            teamThatDidNotPlayPenultimateMatch = teams.find(team => team.id === parsedData.teamThatDidNotPlayPenultimateMatchId) || null;
            
            console.log("Dados carregados do localStorage.");
            return true; // Indica que dados foram carregados
        } catch (error) {
            console.error("Erro ao carregar dados do localStorage:", error);
            // Se houver erro ao parsear, limpar dados corrompidos
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return false; // Indica que dados não foram carregados
        }
    } else {
        console.log("Nenhum dado salvo encontrado no localStorage.");
        return false; // Indica que não há dados salvos
    }
}

// Reseta todos os dados salvos e variáveis em memória
function resetAllData() {
    if (confirm("Tem certeza que deseja apagar TODOS os dados salvos (times, partidas, estatísticas)? Esta ação não pode ser desfeita.")) {
        // Limpar localStorage
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        
        // Resetar variáveis em memória para o estado inicial
        teams = [];
        allMatches = [];
        currentMatch = {
            teamA: null,
            teamB: null,
            scoreA: 0,
            scoreB: 0,
            goals: [],
            timerInterval: null,
            timerSeconds: 7 * 60,
            isTimerRunning: false,
            isMatchEnded: false,
            timeExpired: false,
            viewingStats: false,
            startTime: null,
            pausedTime: 0,
            lastPauseStart: null,
            endTime: null
        };
        lastWinnerTeam = null;
        previousSection = null;
        lastMatchWasDraw = false;
        teamThatDidNotPlayLastMatch = null;
        teamThatDidNotPlayPenultimateMatch = null;
        
        console.log("Todos os dados foram resetados.");
        
        // Redirecionar para a tela de configuração de times
        showSection("team-setup");
        // Limpar a interface de configuração de times (caso já estivesse preenchida)
        resetTeamSetupUI(); 
    }
}

// Função para inicializar a persistência de dados
function initializeDataPersistence() {
    // Tentar carregar dados do localStorage
    const dataLoaded = loadDataFromLocalStorage();
    
    // Se não houver dados salvos, não precisamos fazer nada aqui
    // O modal de boas-vindas será mostrado pela função showWelcomeModal()
    console.log("Persistência de dados inicializada.");
}

// Função para criar o modal de boas-vindas (sem botão de reset na interface)
// COMENTADO: Substituído pela nova seção welcome-screen
/*
function createWelcomeModalAndResetButton() {
    // Criar o modal de boas-vindas
    const welcomeModal = document.createElement("div");
    welcomeModal.id = "welcome-modal";
    welcomeModal.className = "modal hidden";
    
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
    
    // Adicionar estilo CSS para os novos elementos
    const style = document.createElement("style");
    style.textContent = `
        .welcome-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 20px;
        }
        
        header {
            position: relative;
        }
    `;
    
    document.head.appendChild(style);
}
*/

// Função para mostrar o modal de boas-vindas
// COMENTADO: Substituído pela nova seção welcome-screen
/*
function showWelcomeModal() {
    const welcomeModal = document.getElementById("welcome-modal");
    const welcomeOptions = document.getElementById("welcome-options");
    const hasSavedData = localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
    
    // Limpar opções anteriores
    welcomeOptions.innerHTML = '';
    
    // Adicionar opção "Continuar Contagem" apenas se houver dados salvos
    if (hasSavedData) {
        const continueBtn = document.createElement("button");
        continueBtn.id = "continue-btn";
        continueBtn.className = "primary-btn";
        continueBtn.innerHTML = '<i class="fas fa-play"></i> Continuar Contagem';
        continueBtn.addEventListener("click", () => {
            welcomeModal.classList.add("hidden");
            
            // Se temos times salvos, mostrar a tela de configuração de partida
            // Caso contrário, mostrar a tela de configuração de times
            if (teams.length === 3) {
                showSection("match-setup");
                updateTeamSelects(); // Atualizar os selects com os times carregados
            } else {
                showSection("team-setup");
            }
        });
        welcomeOptions.appendChild(continueBtn);
    }
    
    // Sempre adicionar opção "Começar Nova Contagem"
    const newCountBtn = document.createElement("button");
    newCountBtn.id = "new-count-btn";
    newCountBtn.className = "secondary-btn";
    newCountBtn.innerHTML = '<i class="fas fa-redo"></i> Começar Nova Contagem';
    newCountBtn.addEventListener("click", () => {
        resetAllData();
        welcomeModal.classList.add("hidden");
        showSection("team-setup");
    });
    welcomeOptions.appendChild(newCountBtn);
    
    // Sempre mostrar o modal de boas-vindas ao iniciar
    welcomeModal.classList.remove("hidden");
    
    // Esconder todas as seções enquanto o modal estiver visível
    const sections = ["team-setup", "match-setup", "match-in-progress", "match-stats", "all-stats"];
    sections.forEach(section => {
        document.getElementById(section).classList.add("hidden");
    });
}
*/

// --- Fim Funções de Persistência ---

// Pré-carregar imagem de fundo original (para o app, não para a imagem gerada)
const originalBackgroundImage = new Image();
originalBackgroundImage.src = "images/background.jpeg";

// REMOVIDO: Pré-carregamento da imagem de fundo e ícones para estatísticas
// const statsBackgroundImage = new Image();
// statsBackgroundImage.src = "images/background_new.png";
// const goldenBallIcon = new Image();
// goldenBallIcon.src = "images/golden_ball.png";
// const goldenBootIcon = new Image();
// goldenBootIcon.src = "images/golden_boot.png";

// Função auxiliar para mostrar uma seção específica e esconder as demais
function showSection(sectionId) {
    const sections = [
        "welcome-screen",
        "team-setup",
        "match-setup",
        "match-in-progress",
        "match-stats",
        "all-stats"
    ];
    
    sections.forEach(section => {
        if (section === sectionId) {
            document.getElementById(section).classList.remove("hidden");
        } else {
            document.getElementById(section).classList.add("hidden");
        }
    });
}

// Função para resetar a interface de configuração de times
function resetTeamSetupUI() {
    // Limpar selects de cores
    const colorSelects = document.querySelectorAll("#team1-color, #team2-color, #team3-color");
    colorSelects.forEach(select => {
        select.value = "";
        select.style.backgroundColor = "";
        select.style.color = "";
        select.style.fontWeight = "";
    });
    
    // Limpar campos de jogadores
    for (let i = 1; i <= 3; i++) {
        const playersContainer = document.getElementById(`team${i}-players`);
        // Manter apenas os dois primeiros inputs (padrão)
        const playerInputs = playersContainer.querySelectorAll(".player-input");
        
        // Remover inputs adicionais
        for (let j = 2; j < playerInputs.length; j++) {
            playersContainer.removeChild(playerInputs[j]);
        }
        
        // Limpar os dois inputs padrão
        const defaultInputs = playersContainer.querySelectorAll("input");
        defaultInputs.forEach(input => {
            input.value = "";
        });
    }
}

// Elementos DOM
document.addEventListener("DOMContentLoaded", function () {
    // Implementar a persistência de dados
    initializeDataPersistence();
    
    // Event listeners para os novos botões da welcome-screen
    const continueBtn = document.getElementById("continue-btn");
    const newCountBtn = document.getElementById("new-count-btn");
    
    // Esconder o botão 'Continuar Contagem' por padrão
    if (continueBtn) {
        continueBtn.classList.add('hidden');
    }

    if (!loadDataFromLocalStorage()) {
        showSection("welcome-screen");
    } else {
        // Se há dados salvos, mostrar o botão 'Continuar Contagem'
        if (continueBtn) {
            continueBtn.classList.remove('hidden');
        }
        showSection("welcome-screen"); // Sempre mostrar a welcome-screen primeiro se houver dados
    }
    
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            if (teams.length === 3) {
                showSection("match-setup");
                updateTeamSelects();
            } else {
                showSection("team-setup");
            }
        });
    }
    
    if (newCountBtn) {
        newCountBtn.addEventListener("click", () => {
            resetAllData();
            showSection("team-setup");
        });
    }
    // Botões de configuração de times
    const addPlayerBtns = document.querySelectorAll(".add-player-btn");
    const saveTeamsBtn = document.getElementById("save-teams-btn");

    // Botões de configuração de partida
    const startMatchBtn = document.getElementById("start-match-btn");

    // Botões de controle do cronômetro
    const timerStartBtn = document.getElementById("timer-start-btn");
    const timerPauseBtn = document.getElementById("timer-pause-btn");
    const timerResetBtn = document.getElementById("timer-reset-btn");

    // Botões de gol
    const teamAGoalBtn = document.getElementById("team-a-goal-btn");
    const teamBGoalBtn = document.getElementById("team-b-goal-btn");

    // Botões de ações da partida
    const endMatchBtn = document.getElementById("end-match-btn");
    const annulMatchBtn = document.getElementById("annul-match-btn");

    // Botões do modal de gol
    const saveGoalBtn = document.getElementById("save-goal-btn");
    const deleteGoalBtn = document.getElementById("delete-goal-btn");
    const closeModalBtn = document.querySelector(".close-modal");

    // Botões do modal de anulação
    const confirmAnnulBtn = document.getElementById("confirm-annul-btn");
    const cancelAnnulBtn = document.getElementById("cancel-annul-btn");
    const closeAnnulModalBtn = document.querySelector("#annul-modal .close-modal");

    // Botões de estatísticas
    const allStatsBtn = document.querySelectorAll(".all-stats-btn");
    const backBtn = document.getElementById("back-btn");
    const newMatchBtn = document.getElementById("new-match-btn");
    const generateAllStatsImageBtn = document.getElementById(
        "generate-all-stats-image-btn"
    );

    // Adicionar event listeners
    addPlayerBtns.forEach((btn) => {
        btn.addEventListener("click", addPlayerInput);
    });

    saveTeamsBtn.addEventListener("click", saveTeams);
    startMatchBtn.addEventListener("click", startMatch);

    timerStartBtn.addEventListener("click", startTimer);
    timerPauseBtn.addEventListener("click", pauseTimer);
    timerResetBtn.addEventListener("click", resetTimer);

    teamAGoalBtn.addEventListener("click", () => openGoalModal("A"));
    teamBGoalBtn.addEventListener("click", () => openGoalModal("B"));

    endMatchBtn.addEventListener("click", endMatch);

    // Event listeners para anulação de partida
    if (annulMatchBtn) {
        annulMatchBtn.addEventListener("click", openAnnulModal);
    }

    if (confirmAnnulBtn) {
        confirmAnnulBtn.addEventListener("click", annulMatch);
    }

    if (cancelAnnulBtn) {
        cancelAnnulBtn.addEventListener("click", closeAnnulModal);
    }

    if (closeAnnulModalBtn) {
        closeAnnulModalBtn.addEventListener("click", closeAnnulModal);
    }

    saveGoalBtn.addEventListener("click", saveGoal);
    deleteGoalBtn.addEventListener("click", deleteGoal);
    closeModalBtn.addEventListener("click", closeGoalModal);

    newMatchBtn.addEventListener("click", setupNewMatch);

    // Usar querySelectorAll para pegar todos os botões de estatísticas
    allStatsBtn.forEach((btn) => {
        btn.addEventListener("click", showAllStats);
    });

    // Botão para voltar da tela de estatísticas
    if (backBtn) {
        backBtn.addEventListener("click", backFromStats);
    }

    if (generateAllStatsImageBtn) {
        generateAllStatsImageBtn.addEventListener("click", generateAllStatsImage);
    }
    
    // Adicionar event listener para o botão de copiar tabela
    const copyTableBtn = document.getElementById("copy-table-btn");
    if (copyTableBtn) {
        copyTableBtn.addEventListener("click", copyStatsTable);
    }

    // Fechar modal ao clicar fora
    window.addEventListener("click", (e) => {
        const goalModal = document.getElementById("goal-modal");
        if (e.target === goalModal) {
            closeGoalModal();
        }

        const annulModal = document.getElementById("annul-modal");
        if (e.target === annulModal) {
            closeAnnulModal();
        }
    });

    // Adicionar event listeners para os selects de cores
    const colorSelects = document.querySelectorAll(
        "#team1-color, #team2-color, #team3-color"
    );
    colorSelects.forEach((select) => {
        // Aplicar a cor inicial ao carregar a página
        updateTeamColorDisplay(select);

        // Adicionar listener para mudanças
        select.addEventListener("change", function () {
            // Verificar se a cor já está em uso
            if (isColorAlreadySelected(this)) {
                alert(
                    "Esta cor já está sendo usada por outro time. Por favor, escolha uma cor diferente."
                );
                // Reverter para a cor anterior
                this.value = this.dataset.lastValue || "";
            }

            // Atualizar a cor do campo
            updateTeamColorDisplay(this);

            // Salvar a cor atual como última cor válida
            this.dataset.lastValue = this.value;
        });

        // Salvar a cor inicial
        select.dataset.lastValue = select.value;
    });

    // Adicionar event listeners para os selects de times na configuração de partida
    const teamSelects = document.querySelectorAll("#team-a-select, #team-b-select");
    teamSelects.forEach((select) => {
        select.addEventListener("change", function () {
            updateMatchSetupColors();
        });
    });

    // Limitar o número de caracteres nos campos de nome de jogador
    document.addEventListener("input", function (e) {
        if (e.target.classList.contains("player-name")) {
            if (e.target.value.length > 20) {
                e.target.value = e.target.value.slice(0, 20);
            }
        }
    });
});

// Função para verificar se a cor já está selecionada em outro time
function isColorAlreadySelected(currentSelect) {
    const selectedColor = currentSelect.value;
    const currentId = currentSelect.id;

    // Se não há cor selecionada, não há conflito
    if (!selectedColor) return false;

    const colorSelects = document.querySelectorAll(
        "#team1-color, #team2-color, #team3-color"
    );
    for (let select of colorSelects) {
        if (select.id !== currentId && select.value === selectedColor) {
            return true;
        }
    }

    return false;
}

// Função para atualizar a exibição da cor do time
function updateTeamColorDisplay(select) {
    const selectedColor = select.value;

    if (selectedColor) {
        // Aplicar a cor de fundo ao select
        select.style.backgroundColor = getComputedTeamColor(selectedColor);
        select.style.color = getContrastColor(selectedColor);
        select.style.fontWeight = "bold";
    } else {
        // Sem cor selecionada
        select.style.backgroundColor = "";
        select.style.color = "";
        select.style.fontWeight = "";
    }
}

// Função para atualizar as cores na configuração de partida
function updateMatchSetupColors() {
    const teamASelect = document.getElementById("team-a-select");
    const teamBSelect = document.getElementById("team-b-select");

    if (teamASelect.value) {
        const teamAColor = teams.find((team) => team.id == teamASelect.value)?.color || "";
        teamASelect.style.backgroundColor = getComputedTeamColor(teamAColor);
        teamASelect.style.color = getContrastColor(teamAColor);
        teamASelect.style.fontWeight = "bold";
    } else {
        teamASelect.style.backgroundColor = "";
        teamASelect.style.color = "";
        teamASelect.style.fontWeight = "";
    }

    if (teamBSelect.value) {
        const teamBColor = teams.find((team) => team.id == teamBSelect.value)?.color || "";
        teamBSelect.style.backgroundColor = getComputedTeamColor(teamBColor);
        teamBSelect.style.color = getContrastColor(teamBColor);
        teamBSelect.style.fontWeight = "bold";
    } else {
        teamBSelect.style.backgroundColor = "";
        teamBSelect.style.color = "";
        teamBSelect.style.fontWeight = "";
    }
}

// Função para obter a cor computada do time
function getComputedTeamColor(color) {
    const colors = {
        red: "#e74c3c",
        green: "#2ecc71",
        blue: "#3498db",
        yellow: "#f1c40f",
        orange: "#e67e22",
    };

    return colors[color] || "#bdc3c7"; // Cinza claro como fallback
}

// Função para obter a cor de contraste (texto)
function getContrastColor(color) {
    // Cores escuras para texto claro
    if (color === "blue" || color === "red" || color === "orange") {
        return "#ffffff";
    }
    // Cores claras para texto escuro
    return "#000000";
}

// Funções de gerenciamento de times
function addPlayerInput(e) {
    const teamId = e.target.dataset.team;
    const playersContainer = document.getElementById(`team${teamId}-players`);
    const playerInputs = playersContainer.querySelectorAll(".player-input");

    // Verificar se já atingiu o limite de 6 jogadores
    if (playerInputs.length >= 6) {
        alert("Máximo de 6 jogadores por time!");
        return;
    }

    const newPlayerInput = document.createElement("div");
    newPlayerInput.className = "player-input";
    newPlayerInput.innerHTML = `
        <input type="text" placeholder="Nome do Jogador ${playerInputs.length + 1
        }" class="player-name large-input" maxlength="20">
    `;

    playersContainer.appendChild(newPlayerInput);
}

function saveTeams() {
    teams = [];

    // Coletar dados dos times
    for (let i = 1; i <= 3; i++) {
        const teamColorSelect = document.getElementById(`team${i}-color`);
        const teamColor = teamColorSelect.value;

        if (!teamColor) {
            alert(`Selecione uma cor para o Time ${i}!`);
            return;
        }

        const playerInputs = document.querySelectorAll(
            `#team${i}-players .player-name`
        );

        const players = [];
        playerInputs.forEach((input) => {
            const playerName = input.value.trim();
            if (playerName) {
                players.push({
                    name: playerName.substring(0, 20), // Limitar a 20 caracteres
                    goals: 0,
                    assists: 0,
                });
            }
        });

        if (players.length < 2) {
            alert(`O Time ${i} precisa ter pelo menos 2 jogadores!`);
            return;
        }

        teams.push({
            id: i,
            name: `Time ${getColorName(teamColor)}`,
            color: teamColor,
            players: players,
            wins: 0,
            losses: 0,
            draws: 0,
            goalsScored: 0,
            goalsConceded: 0,
        });
    }

    // Salvar os times no localStorage
    saveDataToLocalStorage();

    // Mostrar seção de configuração de partida
    document.getElementById("team-setup").classList.add("hidden");
    document.getElementById("match-setup").classList.remove("hidden");

    // Preencher os selects de times
    updateTeamSelects();
}

function getColorName(color) {
    const colorNames = {
        red: "Vermelho",
        green: "Verde",
        blue: "Azul",
        yellow: "Amarelo",
        orange: "Laranja",
    };

    return colorNames[color] || color;
}

function updateTeamSelects() {
    const teamASelect = document.getElementById("team-a-select");
    const teamBSelect = document.getElementById("team-b-select");
    const autoMatchMessage = document.getElementById("auto-match-message");
    const autoMatchMessageSpan = autoMatchMessage.querySelector("span");

    teamASelect.innerHTML = 
        '<option value="">Selecione um time</option>';
    teamBSelect.innerHTML = 
        '<option value="">Selecione um time</option>';

    teams.forEach((team) => {
        teamASelect.innerHTML += `<option value="${team.id}">${team.name}</option>`;
        teamBSelect.innerHTML += `<option value="${team.id}">${team.name}</option>`;
    });

    // Lógica de predefinição para a próxima partida
    if (allMatches.length > 0) {
        if (lastMatchWasDraw) {
            // Regra de Empate: time que não jogou a última vs. time que não jogou a penúltima
            if (teamThatDidNotPlayLastMatch && teamThatDidNotPlayPenultimateMatch) {
                teamASelect.value = teamThatDidNotPlayLastMatch.id;
                teamBSelect.value = teamThatDidNotPlayPenultimateMatch.id;
                autoMatchMessageSpan.textContent = `Empate anterior: ${teamThatDidNotPlayLastMatch.name} (não jogou a última) vs. ${teamThatDidNotPlayPenultimateMatch.name} (não jogou a penúltima)`;
                autoMatchMessage.classList.remove("hidden");
            } else {
                // Caso de borda: empate na primeira partida, seleção manual
                autoMatchMessage.classList.add("hidden");
            }
        } else if (lastWinnerTeam) {
            // Regra de Vitória: vencedor vs. time que não jogou a última
            if (teamThatDidNotPlayLastMatch) {
                teamASelect.value = lastWinnerTeam.id;
                teamBSelect.value = teamThatDidNotPlayLastMatch.id;
                autoMatchMessageSpan.textContent = `Vitória anterior: ${lastWinnerTeam.name} (vencedor) vs. ${teamThatDidNotPlayLastMatch.name} (não jogou)`;
                autoMatchMessage.classList.remove("hidden");
            } else {
                 // Caso de borda improvável, seleção manual
                autoMatchMessage.classList.add("hidden");
            }
        } else {
            // Outros casos (pouco provável, mas para segurança)
             autoMatchMessage.classList.add("hidden");
        }
    } else {
        // Primeira partida
        autoMatchMessage.classList.add("hidden");
    }

    // Atualizar cores dos selects após definir os valores
    updateMatchSetupColors();
}

// Funções de gerenciamento de partida
function startMatch() {
    document.getElementById("match-timer").classList.remove("pulse");
    const teamAId = document.getElementById("team-a-select").value;
    const teamBId = document.getElementById("team-b-select").value;

    if (!teamAId || !teamBId) {
        alert("Selecione dois times para a partida!");
        return;
    }

    if (teamAId === teamBId) {
        alert("Selecione times diferentes para a partida!");
        return;
    }

    // Antes de definir o novo 'não jogou', guardar o anterior como 'penúltimo'
    teamThatDidNotPlayPenultimateMatch = teamThatDidNotPlayLastMatch;

    // Configurar a partida atual
    currentMatch.teamA = teams.find((team) => team.id == teamAId);
    currentMatch.teamB = teams.find((team) => team.id == teamBId);
    currentMatch.scoreA = 0;
    currentMatch.scoreB = 0;
    currentMatch.goals = [];
    currentMatch.timerSeconds = 7 * 60;
    currentMatch.isTimerRunning = false;
    currentMatch.isMatchEnded = false;
    currentMatch.timeExpired = false;
    currentMatch.viewingStats = false;
    currentMatch.startTime = null; // Inicializar como null para ser definido no startTimer
    currentMatch.pausedTime = 0;
    currentMatch.lastPauseStart = null;
    currentMatch.endTime = null; // Resetar o tempo final

    // Identificar o time que não está jogando a partida ATUAL
    teamThatDidNotPlayLastMatch = teams.find(
        (team) => team.id != teamAId && team.id != teamBId
    );

    // Resetar flags da partida anterior
    lastMatchWasDraw = false;
    lastWinnerTeam = null;

    // Atualizar a interface
    updateMatchDisplay();

    // Mostrar seção da partida
    document.getElementById("match-setup").classList.add("hidden");
    document.getElementById("match-in-progress").classList.remove("hidden");
}

function updateMatchDisplay() {
    // Atualizar os elementos de exibição de cor do time
    const teamAColorDisplay = document.getElementById("match-team-a-color");
    const teamBColorDisplay = document.getElementById("match-team-b-color");

    teamAColorDisplay.textContent = getColorName(currentMatch.teamA.color);
    teamBColorDisplay.textContent = getColorName(currentMatch.teamB.color);

    // Atualizar placar
    document.getElementById("team-a-score").textContent = currentMatch.scoreA;
    document.getElementById("team-b-score").textContent = currentMatch.scoreB;

    // Atualizar timer e status
    updateTimerDisplay();
    document.getElementById("match-status").textContent = currentMatch.isTimerRunning
        ? "Em andamento"
        : "Aguardando início";

    // Atualizar histórico de gols
    updateGoalsHistory();

    // Aplicar cores dos times
    applyTeamColors();
    
    // Atualizar informações de vitórias dos times
    updateTeamsWinsDisplay();

    // Atualizar texto dos botões de gol
    updateGoalButtonsText();

    // Atualizar visibilidade dos botões do timer
    if (currentMatch.isTimerRunning) {
        document.getElementById("timer-start-btn").classList.add("hidden");
        document.getElementById("timer-pause-btn").classList.remove("hidden");
    } else {
        document.getElementById("timer-start-btn").classList.remove("hidden");
        document.getElementById("timer-pause-btn").classList.add("hidden");
    }
}

function applyTeamColors() {
    const teamAElements = document.querySelectorAll(".team-a");
    const teamBElements = document.querySelectorAll(".team-b");

    // Remover classes de cores anteriores
    const colorClasses = [
        "team-red",
        "team-green",
        "team-blue",
        "team-yellow",
        "team-orange",
    ];

    teamAElements.forEach((element) => {
        colorClasses.forEach((cls) => element.classList.remove(cls));
        element.classList.add(`team-${currentMatch.teamA.color}`);
    });

    teamBElements.forEach((element) => {
        colorClasses.forEach((cls) => element.classList.remove(cls));
        element.classList.add(`team-${currentMatch.teamB.color}`);
    });
}

function updateGoalButtonsText() {
    // Função removida - botões agora têm texto fixo "Gol"
    // Não é mais necessário atualizar o texto dos botões dinamicamente
}

// Funções de gerenciamento do cronômetro
function startTimer() {
    if (currentMatch.isTimerRunning) return;

    currentMatch.isTimerRunning = true;

    // Registrar o horário de início se for a primeira vez
    if (currentMatch.startTime === null || typeof currentMatch.startTime === 'string') {
        currentMatch.startTime = Date.now();
    } else if (currentMatch.lastPauseStart !== null) {
        // Se estava pausado, adicionar o tempo pausado ao total
        currentMatch.pausedTime += Date.now() - currentMatch.lastPauseStart;
        currentMatch.lastPauseStart = null;
    }

    // Atualizar interface
    document.getElementById("timer-start-btn").classList.add("hidden");
    document.getElementById("timer-pause-btn").classList.remove("hidden");
    document.getElementById("match-status").textContent = "Em andamento";

    // Iniciar o intervalo do timer
    currentMatch.timerInterval = setInterval(() => {
        // Não atualizar se estiver visualizando estatísticas
        if (!currentMatch.viewingStats) {
            updateTimerFromTimestamp();
        }

        if (currentMatch.timerSeconds <= 0) {
            pauseTimer();
            currentMatch.timeExpired = true;
            document.getElementById("match-status").textContent = "Tempo esgotado";
            document.getElementById("match-timer").classList.add("pulse");
        }

        updateTimerDisplay();
    }, 100); // Atualizar mais frequentemente para maior precisão
}

function pauseTimer() {
    if (!currentMatch.isTimerRunning) return;

    currentMatch.isTimerRunning = false;
    
    // Registrar o momento do pause
    if (currentMatch.startTime !== null) {
        currentMatch.lastPauseStart = Date.now();
    }
    
    clearInterval(currentMatch.timerInterval);

    // Atualizar interface
    document.getElementById("timer-start-btn").classList.remove("hidden");
    document.getElementById("timer-pause-btn").classList.add("hidden");
    document.getElementById("match-status").textContent = "Pausado";
}

function resetTimer() {
    pauseTimer();
    currentMatch.timerSeconds = 7 * 60;
    currentMatch.timeExpired = false;
    
    // Resetar timestamps
    currentMatch.startTime = null;
    currentMatch.pausedTime = 0;
    currentMatch.lastPauseStart = null;

    // Atualizar interface
    updateTimerDisplay();
    document.getElementById("match-status").textContent = "Aguardando início";
    document.getElementById("match-timer").classList.remove("pulse");
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentMatch.timerSeconds / 60);
    const seconds = currentMatch.timerSeconds % 60;

    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    document.getElementById("match-timer").textContent = formattedTime;
}

// Função para atualizar o timer baseado em timestamps
function updateTimerFromTimestamp() {
    if (currentMatch.startTime === null) return;
    
    const now = Date.now();
    const startTimeMs = typeof currentMatch.startTime === 'string' 
        ? new Date(currentMatch.startTime).getTime() 
        : currentMatch.startTime;
    
    const totalPausedTime = currentMatch.pausedTime + 
        (currentMatch.lastPauseStart !== null ? now - currentMatch.lastPauseStart : 0);
    
    // Calcular tempo decorrido (em milissegundos)
    const elapsedTime = now - startTimeMs - totalPausedTime;
    
    // Converter para segundos e calcular tempo restante
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const totalTimeInSeconds = 7 * 60; // 7 minutos
    
    currentMatch.timerSeconds = Math.max(0, totalTimeInSeconds - elapsedSeconds);
}

// Função para editar um gol existente
function editGoal(goalIndex) {
    // Permitir edição de gols mesmo após atingir GOAL_LIMIT, 
    // desde que a partida não tenha sido finalizada pelo botão "Encerrar Partida"
    // (A verificação será feita apenas na função openGoalModal para novos gols)

    const goal = currentMatch.goals[goalIndex];
    if (!goal) {
        alert("Gol não encontrado!");
        return;
    }

    const goalModal = document.getElementById("goal-modal");
    const goalModalTitle = document.getElementById("goal-modal-title");
    const goalScorer = document.getElementById("goal-scorer");
    const goalAssist = document.getElementById("goal-assist");
    const saveGoalBtn = document.getElementById("save-goal-btn");
    const deleteGoalBtn = document.getElementById("delete-goal-btn");
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    const goalTypeToggle = document.querySelector(".goal-type-toggle");
    const assistGroup = document.getElementById("assist-group");

    // Configurar modal para modo de edição
    goalModalTitle.textContent = "Editar Gol";
    saveGoalBtn.textContent = "Salvar Alterações";
    deleteGoalBtn.classList.remove("hidden");

    // Armazenar dados de edição no modal
    goalModal.dataset.editing = "true";
    goalModal.dataset.goalIndex = goalIndex;
    goalModal.dataset.team = goal.team;

    // Configurar toggle baseado no tipo de gol
    goalTypeCheckbox.checked = goal.isOwnGoal || false;
    if (goal.isOwnGoal) {
        goalTypeToggle.classList.add("contra-active");
        assistGroup.classList.add("hidden");
    } else {
        goalTypeToggle.classList.remove("contra-active");
        assistGroup.classList.remove("hidden");
    }

    // Limpar selects
    goalScorer.innerHTML = '<option value="">Selecione o jogador</option>';
    goalAssist.innerHTML = '<option value="">Nenhuma assistência</option>';

    // Determinar qual time usar para os jogadores
    let playersTeam;
    if (goal.isOwnGoal) {
        // Gol contra - jogadores do time adversário
        playersTeam = goal.team === "A" ? currentMatch.teamB : currentMatch.teamA;
    } else {
        // Gol a favor - jogadores do próprio time
        playersTeam = goal.team === "A" ? currentMatch.teamA : currentMatch.teamB;
    }

    // Preencher jogadores
    playersTeam.players.forEach((player, index) => {
        const selected = player.name === goal.scorer ? 'selected' : '';
        goalScorer.innerHTML += `<option value="${index}" ${selected}>${player.name}</option>`;
    });

    // Preencher assistências (apenas se não for gol contra)
    if (!goal.isOwnGoal) {
        playersTeam.players.forEach((player, index) => {
            if (player.name !== goal.scorer) {
                const selected = goal.assist && player.name === goal.assist ? 'selected' : '';
                goalAssist.innerHTML += `<option value="${index}" ${selected}>${player.name}</option>`;
            }
        });
    }

    // Mostrar o modal
    goalModal.classList.remove("hidden");
}

// Funções de gerenciamento de gols
function openGoalModal(team) {
    // Permitir marcar gols mesmo após o término do tempo
    if (currentMatch.isMatchEnded) {
        alert("A partida já foi encerrada!");
        return;
    }

    const goalModal = document.getElementById("goal-modal");
    const goalModalTitle = document.getElementById("goal-modal-title");
    const goalScorer = document.getElementById("goal-scorer");
    const goalAssist = document.getElementById("goal-assist");
    const saveGoalBtn = document.getElementById("save-goal-btn");
    const deleteGoalBtn = document.getElementById("delete-goal-btn");
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    const goalTypeToggle = document.querySelector(".goal-type-toggle");
    const assistGroup = document.getElementById("assist-group");

    // Resetar modal para modo de criação
    goalModalTitle.textContent = "Registrar Gol";
    saveGoalBtn.textContent = "Salvar Gol";
    deleteGoalBtn.classList.add("hidden");

    // Limpar dados de edição
    delete goalModal.dataset.editing;
    delete goalModal.dataset.goalIndex;

    // Resetar toggle para "A favor" (padrão)
    goalTypeCheckbox.checked = false;
    goalTypeToggle.classList.remove("contra-active");
    assistGroup.classList.remove("hidden");

    // Limpar selects
    goalScorer.innerHTML = '<option value="">Selecione o jogador</option>';
    goalAssist.innerHTML = '<option value="">Nenhuma assistência</option>';

    // Salvar o time que marcou o gol para uso posterior
    goalModal.dataset.team = team;

    // Preencher jogadores do time que marcou o gol (inicialmente "A favor")
    const scoringTeam = team === "A" ? currentMatch.teamA : currentMatch.teamB;
    scoringTeam.players.forEach((player, index) => {
        goalScorer.innerHTML += `<option value="${index}">${player.name}</option>`;
    });

    // Atualizar opções de assistência imediatamente
    updateAssistOptions();

    // Mostrar o modal
    goalModal.classList.remove("hidden");
}

function updateAssistOptions() {
    const goalModal = document.getElementById("goal-modal");
    const team = goalModal.dataset.team;
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    const isEditing = goalModal.dataset.editing === "true";

    // Determinar qual time usar baseado no tipo de gol
    let playersTeam;
    if (goalTypeCheckbox.checked) {
        // Gol contra - usar jogadores do time adversário
        playersTeam = team === "A" ? currentMatch.teamB : currentMatch.teamA;
    } else {
        // Gol a favor - usar jogadores do próprio time
        playersTeam = team === "A" ? currentMatch.teamA : currentMatch.teamB;
    }

    const goalScorer = document.getElementById("goal-scorer");
    const goalAssist = document.getElementById("goal-assist");

    // Limpar select de assistência
    goalAssist.innerHTML = '<option value="">Nenhuma assistência</option>';

    // Se não há jogador selecionado para o gol ou é gol contra, não preencher assistências
    if (!goalScorer.value || goalTypeCheckbox.checked) return;

    // Preencher jogadores do time para assistência, excluindo o marcador do gol
    playersTeam.players.forEach((player, index) => {
        if (index != goalScorer.value) {
            // Se estamos editando, manter a seleção de assistência atual
            let selected = '';
            if (isEditing) {
                const goalIndex = parseInt(goalModal.dataset.goalIndex);
                const currentGoal = currentMatch.goals[goalIndex];
                if (currentGoal && currentGoal.assist && player.name === currentGoal.assist) {
                    selected = 'selected';
                }
            }
            goalAssist.innerHTML += `<option value="${index}" ${selected}>${player.name}</option>`;
        }
    });
}

function closeGoalModal() {
    document.getElementById("goal-modal").classList.add("hidden");
}

function saveGoal() {
    const goalModal = document.getElementById("goal-modal");
    const team = goalModal.dataset.team;
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    const isOwnGoal = goalTypeCheckbox.checked;
    const isEditing = goalModal.dataset.editing === "true";
    const goalIndex = isEditing ? parseInt(goalModal.dataset.goalIndex) : null;

    // Determinar qual time usar para os jogadores
    let playersTeam;
    if (isOwnGoal) {
        // Gol contra - jogadores do time adversário
        playersTeam = team === "A" ? currentMatch.teamB : currentMatch.teamA;
    } else {
        // Gol a favor - jogadores do próprio time
        playersTeam = team === "A" ? currentMatch.teamA : currentMatch.teamB;
    }

    const goalScorer = document.getElementById("goal-scorer");
    const goalAssist = document.getElementById("goal-assist");

    if (!goalScorer.value) {
        alert("Selecione o jogador que marcou o gol!");
        return;
    }

    const scorerIndex = parseInt(goalScorer.value);
    const assistIndex = goalAssist.value ? parseInt(goalAssist.value) : null;

    const scorer = playersTeam.players[scorerIndex];
    const assist = assistIndex !== null ? playersTeam.players[assistIndex] : null;

    if (isEditing) {
        // Modo de edição - atualizar gol existente
        const oldGoal = currentMatch.goals[goalIndex];
        
        // Reverter estatísticas antigas
        const oldScoringTeam = oldGoal.team === "A" ? currentMatch.teamA : currentMatch.teamB;
        const oldScorer = oldScoringTeam.players.find(p => p.name === oldGoal.scorer);
        const oldAssist = oldGoal.assist ? oldScoringTeam.players.find(p => p.name === oldGoal.assist) : null;
        
        if (!oldGoal.isOwnGoal) {
            if (oldScorer) oldScorer.goals--;
            if (oldAssist) oldAssist.assists--;
        }
        
        // Ajustar placar se o time mudou
        if (oldGoal.team !== team) {
            if (oldGoal.team === "A") {
                currentMatch.scoreA--;
                currentMatch.scoreB++;
            } else {
                currentMatch.scoreB--;
                currentMatch.scoreA++;
            }
        }
        
        // Aplicar novas estatísticas
        if (!isOwnGoal) {
            scorer.goals++;
            if (assist) {
                assist.assists++;
            }
        }
        
        // Atualizar o gol no array
        currentMatch.goals[goalIndex] = {
            team: team,
            scorer: scorer.name,
            assist: assist && !isOwnGoal ? assist.name : null,
            time: oldGoal.time, // Manter o tempo original
            isOwnGoal: isOwnGoal
        };
        
    } else {
        // Modo de criação - adicionar novo gol
        // Incrementar estatísticas
        if (!isOwnGoal) {
            scorer.goals++;
            if (assist) {
                assist.assists++;
            }
        }
        // Atualizar placar
        if (team === "A") {
            currentMatch.scoreA++;
        } else {
            currentMatch.scoreB++;
        }

        // Registrar o gol no histórico
        const goalTime = formatTimerForGoal();

        currentMatch.goals.push({
            team: team,
            scorer: scorer.name,
            assist: assist && !isOwnGoal ? assist.name : null,
            time: goalTime,
            isOwnGoal: isOwnGoal
        });
    }

    // Atualizar a interface
    updateMatchDisplay();

    // Fechar o modal
    closeGoalModal();

    // Verificar se a partida atingiu o placar de finalização
    if (currentMatch.scoreA === GOAL_LIMIT || currentMatch.scoreB === GOAL_LIMIT) {
        handleMatchFinishByScore();
    } else {
        // Salvar os dados atualizados no localStorage se a partida ainda não terminou
        saveDataToLocalStorage();
    }
}

/**
 * Lida com a finalização da partida por placar (GOAL_LIMIT gols),
 * pausando o jogo e desabilitando controles específicos.
 */
function handleMatchFinishByScore() {
    // 1. Registrar o tempo final da partida ANTES de pausar o cronômetro
    currentMatch.endTime = Date.now();

    // 2. Pausar o cronômetro se ele estiver rodando
    if (currentMatch.isTimerRunning) {
        pauseTimer();
    }

    // 3. Alterar a mensagem de status
    const matchStatus = document.getElementById("match-status");
    if (matchStatus) {
        matchStatus.textContent = "Partida encerrada";
    }

    // 4. Desabilitar botões do cronômetro e de registro de novos gols
    document.getElementById("timer-start-btn").disabled = true;
    document.getElementById("timer-pause-btn").disabled = true;
    document.getElementById("timer-reset-btn").disabled = true;
    document.getElementById("team-a-goal-btn").disabled = true;
    document.getElementById("team-b-goal-btn").disabled = true;

    // Marcar que a partida está "tecnicamente" encerrada para evitar novos gols
    // mas sem finalizar os dados ainda.
    currentMatch.isMatchEnded = true; 

    // Os dados só serão salvos em definitivo ao clicar em "Encerrar Partida"
    // Portanto, não chamamos saveDataToLocalStorage() aqui.
    console.log(`Partida atingiu ${GOAL_LIMIT} gols. Controles pausados. Tempo final registrado:`, new Date(currentMatch.endTime));
}

// Função para excluir um gol
function deleteGoal() {
    const goalModal = document.getElementById("goal-modal");
    const goalIndex = parseInt(goalModal.dataset.goalIndex);
    
    if (!confirm("Tem certeza que deseja excluir este gol? Esta ação não pode ser desfeita.")) {
        return;
    }
    
    const goal = currentMatch.goals[goalIndex];
    if (!goal) {
        alert("Gol não encontrado!");
        return;
    }
    
    // Reverter estatísticas dos jogadores
    const scoringTeam = goal.team === "A" ? currentMatch.teamA : currentMatch.teamB;
    const scorer = scoringTeam.players.find(p => p.name === goal.scorer);
    const assist = goal.assist ? scoringTeam.players.find(p => p.name === goal.assist) : null;
    
    if (!goal.isOwnGoal) {
        if (scorer) scorer.goals--;
        if (assist) assist.assists--;
    }
    
    // Ajustar placar
    if (goal.team === "A") {
        currentMatch.scoreA--;
    } else {
        currentMatch.scoreB--;
    }
    
    // Remover o gol do array
    currentMatch.goals.splice(goalIndex, 1);
    
    // Atualizar a interface
    updateMatchDisplay();
    
    // Fechar o modal
    closeGoalModal();
    
    // Salvar os dados atualizados
    saveDataToLocalStorage();
}

function formatTimerForGoal() {
    const minutes = Math.floor(currentMatch.timerSeconds / 60);
    const seconds = currentMatch.timerSeconds % 60;

    if (currentMatch.timeExpired) {
        return "Tempo Extra";
    }

    // Calcula o tempo decorrido desde o início (7:00)
    const elapsedSecondsTotal = 7 * 60 - currentMatch.timerSeconds;
    const elapsedMinutes = Math.floor(elapsedSecondsTotal / 60);
    const elapsedSeconds = elapsedSecondsTotal % 60;

    return `${elapsedMinutes.toString().padStart(2, "0")}:${elapsedSeconds
        .toString()
        .padStart(2, "0")}`;
}

function updateGoalsHistory() {
    const goalsHistory = document.getElementById("goals-history");

    if (currentMatch.goals.length === 0) {
        goalsHistory.innerHTML =
            '<p class="no-goals">Nenhum gol marcado ainda</p>';
        return;
    }

    goalsHistory.innerHTML = "";

    currentMatch.goals.forEach((goal, index) => {
        const goalEntry = document.createElement("div");
        goalEntry.className = "goal-entry";

        const teamName = goal.team === "A"
            ? getColorName(currentMatch.teamA.color)
            : getColorName(currentMatch.teamB.color);
        const teamClass = goal.team === "A"
            ? currentMatch.teamA.color
            : currentMatch.teamB.color;

        let goalText = `<strong>${goal.time}</strong> - <span class="team-${teamClass}-text">${teamName}</span>: ${goal.scorer}`;

        // Adicionar indicação de gol contra
        if (goal.isOwnGoal) {
            goalText += " <em>(Gol Contra)</em>";
        } else if (goal.assist) {
            goalText += ` (Assistência: ${goal.assist})`;
        }

        // Adicionar botão de editar apenas se a partida não foi finalizada pelo botão "Encerrar Partida"
        // Permitir edição mesmo após atingir GOAL_LIMIT, mas não após encerramento definitivo
        // Como não temos uma flag específica para "finalizada definitivamente", 
        // vamos permitir edição sempre que estivermos na tela de partida em andamento
        const isInMatchProgress = !document.getElementById("match-in-progress").classList.contains("hidden");
        if (isInMatchProgress) {
            goalText += ` <button class="edit-goal-btn" onclick="editGoal(${index})" title="Editar gol"><i class="fas fa-edit"></i></button>`;
        }

        goalEntry.innerHTML = goalText;
        goalsHistory.appendChild(goalEntry);
    });
}

// Funções de gerenciamento de partida
function endMatch() {
    // Reabilitar botões para a próxima partida
    document.getElementById("timer-start-btn").disabled = false;
    document.getElementById("timer-pause-btn").disabled = false;
    document.getElementById("timer-reset-btn").disabled = false;
    document.getElementById("team-a-goal-btn").disabled = false;
    document.getElementById("team-b-goal-btn").disabled = false;

    if (currentMatch.isMatchEnded) {
        // Se a partida já foi marcada como encerrada (pelo placar de GOAL_LIMIT gols),
        // o tempo final já foi registrado em handleMatchFinishByScore()
        // apenas prossiga para salvar os dados e mostrar as estatísticas.
    } else {
        // Se o encerramento foi manual (pelo botão, antes dos GOAL_LIMIT gols),
        // registrar o tempo final agora e executar a lógica padrão de encerramento.
        currentMatch.endTime = Date.now();
        pauseTimer();
        currentMatch.isMatchEnded = true;
    }

    // Atualizar estatísticas dos times e definir flags para próxima partida
    updateTeamStats();

    // Registrar a partida no histórico usando o tempo final registrado
    allMatches.push({
        teamA: currentMatch.teamA,
        teamB: currentMatch.teamB,
        scoreA: currentMatch.scoreA,
        scoreB: currentMatch.scoreB,
        goals: [...currentMatch.goals],
        date: new Date(currentMatch.endTime).toISOString(), // Usar o tempo final registrado
        startTime: typeof currentMatch.startTime === 'number' 
            ? new Date(currentMatch.startTime).toISOString() 
            : currentMatch.startTime // Adicionar o timestamp de início da partida
    });
    
    // Salvar os dados atualizados no localStorage
    saveDataToLocalStorage();

    // Mostrar estatísticas da partida
    showMatchStats();
}

function openAnnulModal() {
    document.getElementById("annul-modal").classList.remove("hidden");
}

function closeAnnulModal() {
    document.getElementById("annul-modal").classList.add("hidden");
}

function annulMatch() {
    // Fechar o modal
    closeAnnulModal();

    // Pausar o timer
    pauseTimer();

    // Voltar para a configuração de partida sem atualizar estatísticas
    document.getElementById("match-in-progress").classList.add("hidden");
    document.getElementById("match-setup").classList.remove("hidden");

    // Resetar a partida atual
    currentMatch.isMatchEnded = true; // Marcar como encerrada para evitar problemas
    // Não adicionar ao allMatches
    // Não chamar updateTeamStats
    // Resetar flags para a próxima partida?
    lastWinnerTeam = null;
    lastMatchWasDraw = false;
    // Manter teamThatDidNotPlayLastMatch e teamThatDidNotPlayPenultimateMatch como estavam antes desta partida anulada
    teamThatDidNotPlayLastMatch = teamThatDidNotPlayPenultimateMatch; // Reverter para o estado anterior

    // Atualizar selects para a próxima partida (provavelmente manual agora)
    updateTeamSelects();
}

function updateTeamStats() {
    // Determinar o resultado da partida e definir flags
    if (currentMatch.scoreA > currentMatch.scoreB) {
        // Time A venceu
        currentMatch.teamA.wins++;
        currentMatch.teamB.losses++;
        lastWinnerTeam = currentMatch.teamA;
        lastMatchWasDraw = false;
    } else if (currentMatch.scoreB > currentMatch.scoreA) {
        // Time B venceu
        currentMatch.teamB.wins++;
        currentMatch.teamA.losses++;
        lastWinnerTeam = currentMatch.teamB;
        lastMatchWasDraw = false;
    } else {
        // Empate
        currentMatch.teamA.draws++;
        currentMatch.teamB.draws++;
        lastWinnerTeam = null;
        lastMatchWasDraw = true;
    }

    // Atualizar gols marcados e sofridos
    currentMatch.teamA.goalsScored += currentMatch.scoreA;
    currentMatch.teamA.goalsConceded += currentMatch.scoreB;

    currentMatch.teamB.goalsScored += currentMatch.scoreB;
    currentMatch.teamB.goalsConceded += currentMatch.scoreA;
}

function showMatchStats() {
    // Atualizar os elementos de exibição de cor do time
    const teamAColorDisplay = document.getElementById("stats-team-a-color");
    const teamBColorDisplay = document.getElementById("stats-team-b-color");

    teamAColorDisplay.textContent = getColorName(currentMatch.teamA.color);
    teamBColorDisplay.textContent = getColorName(currentMatch.teamB.color);

    // Atualizar placar
    document.getElementById("stats-team-a-score").textContent = currentMatch.scoreA;
    document.getElementById("stats-team-b-score").textContent = currentMatch.scoreB;

    // Atualizar histórico de gols
    const statsGoalsList = document.getElementById("stats-goals-list");

    if (currentMatch.goals.length === 0) {
        statsGoalsList.innerHTML = '<p class="no-goals">Nenhum gol marcado</p>';
    } else {
        statsGoalsList.innerHTML = "";

        currentMatch.goals.forEach((goal) => {
            const goalEntry = document.createElement("div");
            goalEntry.className = "goal-entry";

            const teamName =
                goal.team === "A"
                    ? getColorName(currentMatch.teamA.color)
                    : getColorName(currentMatch.teamB.color);
            const teamClass =
                goal.team === "A"
                    ? currentMatch.teamA.color
                    : currentMatch.teamB.color;

            let goalText = `<strong>${goal.time}</strong> - <span class="team-${teamClass}-text">${teamName}</span>: ${goal.scorer}`;

            if (goal.assist) {
                goalText += ` (Assistência: ${goal.assist})`;
            }

            goalEntry.innerHTML = goalText;
            statsGoalsList.appendChild(goalEntry);
        });
    }

    // Aplicar cores dos times
    const teamAElements = document.querySelectorAll(".team-a");
    const teamBElements = document.querySelectorAll(".team-b");

    const colorClasses = [
        "team-red",
        "team-green",
        "team-blue",
        "team-yellow",
        "team-orange",
    ];

    teamAElements.forEach((element) => {
        colorClasses.forEach((cls) => element.classList.remove(cls));
        element.classList.add(`team-${currentMatch.teamA.color}`);
    });

    teamBElements.forEach((element) => {
        colorClasses.forEach((cls) => element.classList.remove(cls));
        element.classList.add(`team-${currentMatch.teamB.color}`);
    });

    // Mostrar seção de estatísticas
    document.getElementById("match-in-progress").classList.add("hidden");
    document.getElementById("match-stats").classList.remove("hidden");
}

function setupNewMatch() {
    document.getElementById("match-stats").classList.add("hidden");
    document.getElementById("match-setup").classList.remove("hidden");

    // Atualizar os selects de times com a nova lógica de predefinição
    updateTeamSelects();
    
    // Salvar os dados atualizados no localStorage
    saveDataToLocalStorage();
}

// Função para mostrar estatísticas gerais
function showAllStats() {
    // Salvar a seção atual para retornar depois
    const sections = [
        "team-setup",
        "match-setup",
        "match-in-progress",
        "match-stats",
    ];
    for (const section of sections) {
        if (!document.getElementById(section).classList.contains("hidden")) {
            previousSection = section;
            break;
        }
    }

    // Marcar que estamos visualizando estatísticas
    if (previousSection === "match-in-progress") {
        currentMatch.viewingStats = true;
        // Não pausar o timer aqui, ele já verifica a flag viewingStats
    }

    // Esconder todas as seções
    sections.forEach((section) => {
        document.getElementById(section).classList.add("hidden");
    });

    // Mostrar seção de estatísticas gerais
    document.getElementById("all-stats").classList.remove("hidden");

    // Preencher estatísticas
    updateAllStats();
}

// Função para voltar da tela de estatísticas
function backFromStats() {
    // Esconder estatísticas gerais
    document.getElementById("all-stats").classList.add("hidden");

    // Se estava em uma partida em andamento, voltar para ela
    if (previousSection === "match-in-progress" && currentMatch.viewingStats) {
        document.getElementById("match-in-progress").classList.remove("hidden");
        currentMatch.viewingStats = false; // Resetar a flag ao voltar

        // Atualizar a interface da partida
        updateMatchDisplay();
    } else if (previousSection) {
        // Voltar para a seção anterior registrada
        document.getElementById(previousSection).classList.remove("hidden");
    } else {
        // Caso padrão: voltar para a configuração de partida
        document.getElementById("match-setup").classList.remove("hidden");
    }
    previousSection = null; // Limpar a seção anterior
}

function updateAllStats() {
    const teamsStatsContainer = document.getElementById("teams-stats-container");
    teamsStatsContainer.innerHTML = "";

    // Calcular tempo total jogado por cada time
    const teamPlayTimes = {};
    teams.forEach(team => {
        teamPlayTimes[team.name] = 0;
    });

    allMatches.forEach(match => {
        if (match.date && match.startTime) {
            // Usar match.date como tempo final da partida (que agora reflete o tempo real de encerramento)
            const durationSec = Math.floor((new Date(match.date) - new Date(match.startTime)) / 1000);
            teamPlayTimes[match.teamA.name] += durationSec;
            teamPlayTimes[match.teamB.name] += durationSec;
        }
    });

    teams.forEach((team) => {
        const teamCard = document.createElement("div");
        teamCard.className = "team-stats-card";

        const teamHeader = document.createElement("div");
        teamHeader.className = "team-stats-header";

        const teamName = document.createElement("div");
        teamName.className = `team-stats-name team-${team.color}`;
        teamName.textContent = team.name;

        const teamRecord = document.createElement("div");
        teamRecord.className = "team-stats-record";
        teamRecord.textContent = `V: ${team.wins} | D: ${team.losses} | E: ${team.draws}`;

        teamHeader.appendChild(teamName);
        teamHeader.appendChild(teamRecord);

        const teamGoals = document.createElement("div");
        teamGoals.className = "team-stats-goals";
        teamGoals.textContent = `Gols marcados: ${team.goalsScored} | Gols sofridos: ${team.goalsConceded}`;

        // Adicionar tempo jogado
        const teamPlayTime = document.createElement("div");
        teamPlayTime.className = "team-stats-playtime";
        
        const totalSec = teamPlayTimes[team.name] || 0;
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        const playTime = `${m}m ${s}s`;
        
        teamPlayTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${playTime}`;

        const playerStats = document.createElement("div");
        playerStats.className = "player-stats";

        const playerStatsTitle = document.createElement("h4");
        playerStatsTitle.textContent = "Estatísticas dos Jogadores";

        const playerStatsList = document.createElement("div");
        playerStatsList.className = "player-stats-list";

        // Ordenar jogadores por gols e filtrar jogadores sem gols/assistências
        const sortedPlayers = [...team.players]
            .sort((a, b) => b.goals - a.goals)
            .filter((player) => player.goals > 0 || player.assists > 0);

        if (sortedPlayers.length === 0) {
            const noStats = document.createElement("p");
            noStats.className = "no-goals";
            noStats.textContent = "Nenhuma estatística registrada";
            playerStatsList.appendChild(noStats);
        } else {
            sortedPlayers.forEach((player) => {
                const playerItem = document.createElement("div");
                playerItem.className = "player-stats-item";

                const playerName = document.createElement("div");
                playerName.textContent = player.name;

                const playerData = document.createElement("div");
                playerData.textContent = `Gols: ${player.goals} | Assist: ${player.assists}`;

                playerItem.appendChild(playerName);
                playerItem.appendChild(playerData);
                playerStatsList.appendChild(playerItem);
            });
        }

        playerStats.appendChild(playerStatsTitle);
        playerStats.appendChild(playerStatsList);

        teamCard.appendChild(teamHeader);
        teamCard.appendChild(teamGoals);
        teamCard.appendChild(teamPlayTime); // Inserir tempo jogado após gols
        teamCard.appendChild(playerStats);

        teamsStatsContainer.appendChild(teamCard);
    });

    // Adicionar seção de artilheiros e assistências
    const topScorersSection = document.createElement("div");
    topScorersSection.className = "team-stats-card";
    topScorersSection.style.width = "100%";

    const topScorersTitle = document.createElement("h3");
    topScorersTitle.textContent = "Artilheiros";
    topScorersTitle.style.textAlign = "center";

    const topScorersList = document.createElement("div");
    topScorersList.className = "player-stats-list";

    // Obter todos os jogadores
    let allPlayers = [];
    teams.forEach((team) => {
        team.players.forEach((player) => {
            allPlayers.push({
                name: player.name,
                goals: player.goals,
                assists: player.assists,
                team: team.name,
                color: team.color,
            });
        });
    });

    // Ordenar por gols e filtrar jogadores sem gols
    const topScorers = [...allPlayers]
        .sort((a, b) => b.goals - a.goals)
        .filter((player) => player.goals > 0);

    // Aplicar ranking ordinal denso aos artilheiros
    const rankedScorers = window.RankingUtils.calculateDenseRanking(topScorers, 'goals');

    if (rankedScorers.length === 0) {
        const noScorers = document.createElement("p");
        noScorers.className = "no-goals";
        noScorers.textContent = "Nenhum gol registrado";
        noScorers.style.textAlign = "center";
        topScorersList.appendChild(noScorers);
    } else {
        rankedScorers.forEach((player) => {
            const playerItem = document.createElement("div");
            playerItem.className = "player-stats-item";

            const playerRank = document.createElement("div");
            playerRank.textContent = window.RankingUtils.formatRankPosition(player.rank);
            playerRank.style.marginRight = "10px";

            const playerName = document.createElement("div");
            playerName.textContent = player.name;
            playerName.style.color = getComputedTeamColor(player.color);
            playerName.style.fontWeight = "bold";
            playerName.style.flex = "1";

            const playerData = document.createElement("div");
            playerData.textContent = `${player.goals} gols`;

            playerItem.appendChild(playerRank);
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerData);
            topScorersList.appendChild(playerItem);
        });
    }

    const topAssistsTitle = document.createElement("h3");
    topAssistsTitle.textContent = "Passes para Gol";
    topAssistsTitle.style.textAlign = "center";
    topAssistsTitle.style.marginTop = "20px";

    const topAssistsList = document.createElement("div");
    topAssistsList.className = "player-stats-list";

    // Ordenar por assistências e filtrar jogadores sem assistências
    const topAssists = [...allPlayers]
        .sort((a, b) => b.assists - a.assists)
        .filter((player) => player.assists > 0);

    // Aplicar ranking ordinal denso às assistências
    const rankedAssists = window.RankingUtils.calculateDenseRanking(topAssists, 'assists');

    if (rankedAssists.length === 0) {
        const noAssists = document.createElement("p");
        noAssists.className = "no-goals";
        noAssists.textContent = "Nenhuma assistência registrada";
        noAssists.style.textAlign = "center";
        topAssistsList.appendChild(noAssists);
    } else {
        rankedAssists.forEach((player) => {
            const playerItem = document.createElement("div");
            playerItem.className = "player-stats-item";

            const playerRank = document.createElement("div");
            playerRank.textContent = window.RankingUtils.formatRankPosition(player.rank);
            playerRank.style.marginRight = "10px";

            const playerName = document.createElement("div");
            playerName.textContent = player.name;
            playerName.style.color = getComputedTeamColor(player.color);
            playerName.style.fontWeight = "bold";
            playerName.style.flex = "1";

            const playerData = document.createElement("div");
            playerData.textContent = `${player.assists} assist.`;

            playerItem.appendChild(playerRank);
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerData);
            topAssistsList.appendChild(playerItem);
        });
    }

    topScorersSection.appendChild(topScorersTitle);
    topScorersSection.appendChild(topScorersList);
    topScorersSection.appendChild(topAssistsTitle);
    topScorersSection.appendChild(topAssistsList);

    teamsStatsContainer.appendChild(topScorersSection);
}

// Função para copiar tabela de estatísticas
function copyStatsTable() {
    // Obter a data atual formatada (dd/mm/aaaa)
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    
    // Cabeçalho da tabela
    let tableText = "Jogador\tGols\tAssistências\tVitórias\tEmpates\tDerrotas\tData\n";
    
    // Coletar dados de todos os jogadores de todos os times
    teams.forEach(team => {
        team.players.forEach(player => {
            // Para cada jogador, precisamos calcular vitórias, empates e derrotas
            // Usamos as estatísticas do time como aproximação
            tableText += `${player.name}\t${player.goals}\t${player.assists}\t${team.wins}\t${team.draws}\t${team.losses}\t${formattedDate}\n`;
        });
    });
    
    // Copiar para a área de transferência
    navigator.clipboard.writeText(tableText)
        .then(() => {
            // Feedback visual para o usuário
            const copyTableBtn = document.getElementById("copy-table-btn");
            const originalText = copyTableBtn.innerHTML;
            copyTableBtn.innerHTML = '<i class="fas fa-check"></i> Tabela Copiada!';
            
            // Restaurar o texto original após 2 segundos
            setTimeout(() => {
                copyTableBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Tabela';
            }, 2000);
        })
        .catch(err => {
            alert("Erro ao copiar tabela: " + err);
        });
}

// Função para gerar imagem de estatísticas (REFEITA v11)
function generateAllStatsImage() {
    const canvas = document.getElementById("stats-canvas");
    const ctx = canvas.getContext("2d");
    
    // Calcular tempo total jogado por cada time
    const teamPlayTimes = {};
    teams.forEach(team => { teamPlayTimes[team.name] = 0; });

    allMatches.forEach(match => {
        if (match.date && match.startTime) {
           // Usar match.date como tempo final da partida (que agora reflete o tempo real de encerramento)
           const durationInSeconds = Math.floor(
             (new Date(match.date) - new Date(match.startTime)) / 1000
        );
        teamPlayTimes[match.teamA.name] += durationInSeconds;
        teamPlayTimes[match.teamB.name] += durationInSeconds;
    }
    });

    // Configurações de Layout
    const canvasWidth = 1080;
    const canvasHeight = 1080; // Ajustar conforme necessário
    const padding = 40;
    const headerHeight = 80;
    const teamBlockHeight = 300;
    const statsBlockHeight = 350;
    const blockSpacing = 20;
    const columnSpacing = 20;
    const teamColWidth = (canvasWidth - 2 * padding - 2 * columnSpacing) / 3;
    const statsColWidth = (canvasWidth - 2 * padding - columnSpacing) / 2;

    // Configurar tamanho do canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fundo claro
    ctx.fillStyle = "#f4f4f4"; // Cinza bem claro
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Obter data atual formatada
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    // Desenhar Cabeçalho
    ctx.fillStyle = "#333"; // Cor escura para texto
    ctx.font = "bold 36px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Estatísticas Gerais", canvasWidth / 2, padding + 30);

    ctx.font = "24px Montserrat, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(formattedDate, canvasWidth - padding, padding + 30);

    // Traço horizontal abaixo do título
    ctx.fillStyle = "#3498db"; // var(--primary-color)
    ctx.fillRect(padding, padding + 60, canvasWidth - 2 * padding, 2); // Linha azul

    // Desenhar Blocos dos Times (3 colunas)
    const teamY = headerHeight + padding;
    teams.forEach((team, index) => {
        const teamX = padding + index * (teamColWidth + columnSpacing);

        // Fundo do bloco
        ctx.fillStyle = "#ffffff"; // Fundo branco para os cards
        ctx.fillRect(teamX, teamY, teamColWidth, teamBlockHeight);
        // Sombra suave (opcional)
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillRect(teamX, teamY, teamColWidth, teamBlockHeight);
        ctx.shadowColor = "transparent"; // Resetar sombra

        // Cabeçalho colorido do time
        const teamHeaderHeight = 50;
        ctx.fillStyle = getComputedTeamColor(team.color);
        ctx.fillRect(teamX, teamY, teamColWidth, teamHeaderHeight);

        // Nome do time no cabeçalho
        ctx.fillStyle = getContrastColor(team.color);
        ctx.font = "bold 22px Montserrat, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(team.name, teamX + teamColWidth / 2, teamY + teamHeaderHeight / 2 + 8);

        // Conteúdo do bloco do time
        let currentY = teamY + teamHeaderHeight + 25;
        ctx.fillStyle = "#333";
        ctx.font = "bold 18px Montserrat, sans-serif";
        ctx.textAlign = "center";

        // V/D/E
        ctx.fillText(`V: ${team.wins} | D: ${team.losses} | E: ${team.draws}`, teamX + teamColWidth / 2, currentY);
        currentY += 25;

        // Gols / Sofridos / Tempo jogado
           // 1. Calcular tempo jogado
           const totalSeconds = teamPlayTimes[team.name] || 0;
           const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
           const ss = (totalSeconds % 60).toString().padStart(2, "0");

           // 2. Montar string com o ícone + tempo
           const clockIcon = "\uf017";  // ícone Font Awesome clock (regular)
           const lineText = `Gols: ${team.goalsScored} | Sofridos: ${team.goalsConceded} | ${clockIcon} ${mm}:${ss}`;

           // 3. Aplicar estilo com Font Awesome + Montserrat
           ctx.font = "16px 'Montserrat', 'Font Awesome 6 Free', sans-serif";
           ctx.fillStyle = "#555";
           ctx.textAlign = "center";

           // 4. Centralizar e desenhar
           const centerX = teamX + teamColWidth / 2;
           ctx.fillText(lineText, centerX, currentY);

           // 5. Avançar a linha
           currentY += 35;

        // Título Jogadores
        ctx.font = "bold 18px Montserrat, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Jogadores", teamX + 15, currentY+5);
        currentY += 25;

        // Lista de Jogadores
        ctx.font = "15px Montserrat, sans-serif";
        const sortedPlayers = [...team.players]
            .sort((a, b) => a.name.localeCompare(b.name)) // (Ordena por nome em ordem alfabética)
            //.filter((player) => player.goals > 0 || player.assists > 0);

        if (sortedPlayers.length === 0) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#888";
            ctx.fillText("Nenhuma estatística", teamX + teamColWidth / 2, currentY);
        } else {
            sortedPlayers.slice(0, 6).forEach((player) => { // Limitar a 6 para caber
                const playerText = `${player.name} (G: ${player.goals} | A: ${player.assists})`;
                ctx.textAlign = "left";
                ctx.fillStyle = "#333";
                // Truncar nome se necessário (embora o layout deva ajudar)
                const maxTextWidth = teamColWidth - 30; // Largura útil
                let displayText = playerText;
                if (ctx.measureText(displayText).width > maxTextWidth) {
                    while (ctx.measureText(displayText + "...").width > maxTextWidth && displayText.length > 0) {
                        displayText = displayText.slice(0, -1);
                    }
                    displayText += "...";
                }
                ctx.fillText(displayText, teamX + 15, currentY);
                currentY += 22; // Espaçamento entre jogadores
            });
        }
    });

    // Desenhar Blocos de Estatísticas Gerais (2 colunas)
    const statsY = teamY + teamBlockHeight + blockSpacing;

    // --- Coluna Artilheiros ---
    const scorersX = padding;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(scorersX, statsY, statsColWidth, statsBlockHeight);
    ctx.shadowColor = "transparent";

    let currentStatsY = statsY + 30;
    ctx.fillStyle = "#333";
    ctx.font = "bold 24px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Artilheiros", scorersX + statsColWidth / 2, currentStatsY + 5);
    currentStatsY += 40;

    // Lista de Artilheiros
    ctx.font = "16px Montserrat, sans-serif";
    let allPlayers = [];
    teams.forEach((team) => {
        team.players.forEach((player) => {
            allPlayers.push({ ...player, teamColor: team.color });
        });
    });

    const topScorers = [...allPlayers]
        .sort((a, b) => b.goals - a.goals)
        .filter((player) => player.goals > 0)
        .slice(0, 10); // Limitar a 10 para caber

    // Aplicar ranking ordinal denso aos artilheiros na imagem
    const rankedScorersForImage = window.RankingUtils.calculateDenseRanking(topScorers, 'goals');

    if (rankedScorersForImage.length === 0) {
        ctx.fillStyle = "#888";
        ctx.textAlign = "center";
        ctx.fillText("Nenhum gol registrado", scorersX + statsColWidth / 2, currentStatsY + 5);
    } else {
        rankedScorersForImage.forEach((player) => {
            const rankText = window.RankingUtils.formatRankPosition(player.rank);
            const playerText = `${player.name}`;
            const scoreText = `${player.goals} Gols`;

            const rankX = scorersX + 30;
            const scoreX = scorersX + statsColWidth - 30;
            const nameX = scorersX + 60;
            const maxNameWidth = statsColWidth - 120; // Espaço para nome

            // Rank
            ctx.fillStyle = "#888";
            ctx.textAlign = "right";
            ctx.fillText(rankText, rankX, currentStatsY);

            // Nome (com cor e truncamento)
            ctx.fillStyle = getComputedTeamColor(player.teamColor);
            ctx.textAlign = "left";
            let displayName = playerText;
            if (ctx.measureText(displayName).width > maxNameWidth) {
                 while (ctx.measureText(displayName + "...").width > maxNameWidth && displayName.length > 0) {
                    displayName = displayName.slice(0, -1);
                }
                displayName += "...";
            }
            ctx.fillText(displayName, nameX, currentStatsY);

            // Score
            ctx.fillStyle = "#333";
            ctx.textAlign = "right";
            ctx.fillText(scoreText, scoreX, currentStatsY);

            currentStatsY += 28; // Espaçamento entre artilheiros
        });
    }

    // --- Coluna Passes para Gol ---
    const assistsX = padding + statsColWidth + columnSpacing;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(assistsX, statsY, statsColWidth, statsBlockHeight);
    ctx.shadowColor = "transparent";

    currentStatsY = statsY + 30;
    ctx.fillStyle = "#333";
    ctx.font = "bold 24px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Passes para Gol", assistsX + statsColWidth / 2, currentStatsY + 5);
    currentStatsY += 40;

    // Lista de Passes
    ctx.font = "16px Montserrat, sans-serif";
    const topAssists = [...allPlayers]
        .sort((a, b) => b.assists - a.assists)
        .filter((player) => player.assists > 0)
        .slice(0, 7); // Limitar a 7 para caber

    // Aplicar ranking ordinal denso às assistências na imagem
    const rankedAssistsForImage = window.RankingUtils.calculateDenseRanking(topAssists, 'assists');

    if (rankedAssistsForImage.length === 0) {
        ctx.fillStyle = "#888";
        ctx.textAlign = "center";
        ctx.fillText("Nenhuma assistência", assistsX + statsColWidth / 2, currentStatsY + 5);
    } else {
        rankedAssistsForImage.forEach((player) => {
            const rankText = window.RankingUtils.formatRankPosition(player.rank);
            const playerText = `${player.name}`;
            const scoreText = `${player.assists} Assist.`;

            const rankX = assistsX + 30;
            const scoreX = assistsX + statsColWidth - 30;
            const nameX = assistsX + 60;
            const maxNameWidth = statsColWidth - 120;

            // Rank
            ctx.fillStyle = "#888";
            ctx.textAlign = "right";
            ctx.fillText(rankText, rankX, currentStatsY);

            // Nome (com cor e truncamento)
            ctx.fillStyle = getComputedTeamColor(player.teamColor);
            ctx.textAlign = "left";
            let displayName = playerText;
             if (ctx.measureText(displayName).width > maxNameWidth) {
                 while (ctx.measureText(displayName + "...").width > maxNameWidth && displayName.length > 0) {
                    displayName = displayName.slice(0, -1);
                }
                displayName += "...";
            }
            ctx.fillText(displayName, nameX, currentStatsY);

            // Score
            ctx.fillStyle = "#333";
            ctx.textAlign = "right";
            ctx.fillText(scoreText, scoreX, currentStatsY);

            currentStatsY += 28; // Espaçamento entre assistências
        });
    }

    // Rodapé (Opcional, pode remover se quiser mais minimalista)
    const footerY = canvasHeight - 40;
    ctx.fillStyle = "#aaa";
    ctx.font = "14px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Gerado por Futzin App", canvasWidth / 2, footerY);

    // Converter para imagem e fazer download
    try {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `estatisticas_futebol_${formattedDate.replace(/\//g, "-")}.png`;
        link.click();
    } catch (e) {
        console.error("Erro ao gerar ou baixar a imagem:", e);
        alert("Ocorreu um erro ao gerar ou baixar a imagem de estatísticas.");
    }
}

// REMOVIDO: Função de fallback para ícones
// function drawFallbackIcons(ctx, col1X, col2X, colWidth, topStatsY) { ... }

// Função para lidar com o toggle de gol contra
function handleGoalTypeToggle() {
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    const goalTypeToggle = document.querySelector(".goal-type-toggle");
    const assistGroup = document.getElementById("assist-group");
    
    if (goalTypeCheckbox.checked) {
        // Gol contra ativado
        goalTypeToggle.classList.add("contra-active");
        assistGroup.classList.add("hidden");
    } else {
        // Gol a favor ativado
        goalTypeToggle.classList.remove("contra-active");
        assistGroup.classList.remove("hidden");
    }
    
    // Atualizar lista de jogadores
    updatePlayersList();
}

// Função para atualizar a lista de jogadores baseada no tipo de gol
function updatePlayersList() {
    const goalModal = document.getElementById("goal-modal");
    const team = goalModal.dataset.team;
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    const goalScorer = document.getElementById("goal-scorer");
    const goalAssist = document.getElementById("goal-assist");
    
    // Determinar qual time deve aparecer na lista
    let playersTeam;
    if (goalTypeCheckbox.checked) {
        // Gol contra - mostrar jogadores do time adversário
        playersTeam = team === "A" ? currentMatch.teamB : currentMatch.teamA;
    } else {
        // Gol a favor - mostrar jogadores do próprio time
        playersTeam = team === "A" ? currentMatch.teamA : currentMatch.teamB;
    }
    
    // Limpar e preencher select de jogadores
    goalScorer.innerHTML = '<option value="">Selecione o jogador</option>';
    playersTeam.players.forEach((player, index) => {
        goalScorer.innerHTML += `<option value="${index}">${player.name}</option>`;
    });
    
    // Limpar select de assistência
    goalAssist.innerHTML = '<option value="">Nenhuma assistência</option>';
    
    // Atualizar opções de assistência se necessário
    if (!goalTypeCheckbox.checked) {
        updateAssistOptions();
    }
}

// Adicionar event listener para o select de jogador que marcou o gol
document.addEventListener("DOMContentLoaded", function () {
    const goalScorer = document.getElementById("goal-scorer");
    if (goalScorer) {
        goalScorer.addEventListener("change", updateAssistOptions);
    }
    
    // Event listener para o toggle switch de gol contra
    const goalTypeCheckbox = document.getElementById("goal-type-checkbox");
    if (goalTypeCheckbox) {
        goalTypeCheckbox.addEventListener("change", handleGoalTypeToggle);
    }
});



// Função para atualizar a exibição de vitórias dos times na página "Partida em Andamento"
function updateTeamsWinsDisplay() {
    const teamsWinsDisplay = document.getElementById("teams-wins-display");
    
    if (!teamsWinsDisplay) {
        return; // Se o elemento não existir, sair da função
    }
    
    // Limpar conteúdo anterior
    teamsWinsDisplay.innerHTML = '';
    
    // Verificar se há times configurados
    if (!teams || teams.length === 0) {
        return;
    }
    
    // Criar elementos para cada time
    teams.forEach(team => {
        const teamWinInfo = document.createElement('div');
        teamWinInfo.className = 'team-win-info';
        
        // Nome do time
        const teamName = document.createElement('div');
        teamName.className = 'team-win-name';
        teamName.textContent = `Time ${getColorName(team.color)}`;
        
        // Número de vitórias
        const winCount = document.createElement('div');
        winCount.className = `team-win-count ${team.color}`;
        winCount.textContent = team.wins || 0;
        
        // Label "vitórias"
        const winLabel = document.createElement('div');
        winLabel.className = 'team-win-label';
        winLabel.textContent = team.wins === 1 ? 'vitória' : 'vitórias';
        
        // Adicionar elementos ao container do time
        teamWinInfo.appendChild(teamName);
        teamWinInfo.appendChild(winCount);
        teamWinInfo.appendChild(winLabel);
        
        // Adicionar ao container principal
        teamsWinsDisplay.appendChild(teamWinInfo);
    });
}

// Função auxiliar para obter o nome da cor em português
function getColorName(color) {
    const colorNames = {
        red: 'Vermelho',
        green: 'Verde',
        blue: 'Azul',
        yellow: 'Amarelo',
        orange: 'Laranja'
    };
    
    return colorNames[color] || color;
}


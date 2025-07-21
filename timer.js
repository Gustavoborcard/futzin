/**
 * Classe Timer - Gerencia o cronômetro da partida
 * Responsável por controlar o tempo da partida (iniciar, pausar, resetar)
 */

export class Timer {
    constructor() {
        this.seconds = 7 * 60; // 7 minutos em segundos
        this.interval = null;
        this.isRunning = false;
        this.isExpired = false;
        this.onTick = null; // Callback para atualizar a UI
        this.onExpire = null; // Callback quando o tempo expira
    }

    /**
     * Inicia o cronômetro
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            if (this.seconds > 0) {
                this.seconds--;
                if (this.onTick) {
                    this.onTick(this.getFormattedTime());
                }
            } else {
                this.expire();
            }
        }, 1000);
    }

    /**
     * Pausa o cronômetro
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Reseta o cronômetro para 7 minutos
     */
    reset() {
        this.pause();
        this.seconds = 7 * 60;
        this.isExpired = false;
        if (this.onTick) {
            this.onTick(this.getFormattedTime());
        }
    }

    /**
     * Marca o cronômetro como expirado
     */
    expire() {
        this.pause();
        this.isExpired = true;
        if (this.onExpire) {
            this.onExpire();
        }
    }

    /**
     * Retorna o tempo formatado (MM:SS)
     * @returns {string} - Tempo formatado
     */
    getFormattedTime() {
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Retorna o tempo em segundos
     * @returns {number} - Segundos restantes
     */
    getSeconds() {
        return this.seconds;
    }

    /**
     * Verifica se o cronômetro está rodando
     * @returns {boolean} - True se está rodando
     */
    getIsRunning() {
        return this.isRunning;
    }

    /**
     * Verifica se o cronômetro expirou
     * @returns {boolean} - True se expirou
     */
    getIsExpired() {
        return this.isExpired;
    }

    /**
     * Define callback para quando o tempo é atualizado
     * @param {Function} callback - Função a ser chamada a cada segundo
     */
    setOnTick(callback) {
        this.onTick = callback;
    }

    /**
     * Define callback para quando o tempo expira
     * @param {Function} callback - Função a ser chamada quando o tempo acaba
     */
    setOnExpire(callback) {
        this.onExpire = callback;
    }

    /**
     * Destrói o timer e limpa recursos
     */
    destroy() {
        this.pause();
        this.onTick = null;
        this.onExpire = null;
    }
}


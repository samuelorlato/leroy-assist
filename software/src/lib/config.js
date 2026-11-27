/*
 * Velocidade das respostas simuladas. Útil para gravar o vídeo:
 *   ?speed=0.6  -> mais rápido
 *   ?speed=1.5  -> mais lento
 */
const params = new URLSearchParams(window.location.search);

export const SPEED = Math.min(3, Math.max(0.1, parseFloat(params.get('speed')) || 1));

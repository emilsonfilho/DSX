// src/main.js
import { SegmentTree } from './core/SegmentTree.js';
import { SumStrategy } from './core/Operations.js';
import { StateManager } from './state/StateManager.js';

// 1. Array inicial (8 elementos para uma árvore perfeitamente balanceada)
const arrayInicial = [1, 2, 3, 4, 5, 6, 7, 8];

console.log("Inicializando a Segment Tree...");
// A própria construção (build) já vai gerar os primeiros frames!
const arvore = new SegmentTree(arrayInicial, SumStrategy);

// 2. Disparando um Range Update
// Vamos somar +10 em todos os elementos do índice 1 ao 4
console.log("Executando updateRange [1, 4] com valor +10...");
arvore.updateRange(1, 0, arrayInicial.length - 1, 1, 4, 10);

// 3. Resgatando a fita cassete (Histórico)
const historicoDePassos = arvore.history;
console.log(`Total de frames gravados: ${historicoDePassos.length}`);

// 4. A função "falsa" da Yasmin (apenas para testes)
function renderizarNoConsole(frameAtual, passoAtual, totalPassos) {
    console.log(`\n--- Passo ${passoAtual + 1}/${totalPassos} ---`);
    console.log(`Ação: ${frameAtual.mensagem}`);
    
    // Vamos imprimir apenas os nós que têm alguma lazy tag pendente
    // para provar que a preguiça está funcionando!
    const nosLazy = frameAtual.nodes.filter(no => no.lazy !== 0);
    
    if (nosLazy.length > 0) {
        console.table(nosLazy.map(no => ({
            ID: no.id,
            Range: `[${no.range[0]}, ${no.range[1]}]`,
            Valor: no.value,
            Lazy: no.lazy,
            Status: no.status
        })));
    } else {
        console.log("Nenhuma Lazy Tag pendente neste frame.");
    }
}

// 5. Instanciando o Gerenciador de Estado e carregando a fita
const controle = new StateManager(renderizarNoConsole);
controle.loadHistory(historicoDePassos);

// 6. Testando os controles (Simulando botões)
// Como o Vite roda no navegador, vamos colocar o controle no objeto global "window"
// para você poder brincar com ele direto no console do Chrome!
window.meuControle = controle;

console.log("\nPronto! Para testar a animação no tempo, abra o console do navegador e digite:");
console.log("meuControle.next()");
console.log("meuControle.play()");
console.log("meuControle.setSpeed(500)");
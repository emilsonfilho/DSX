export const NodeStatus = Object.freeze({
    IDLE: "idle",                 // Nó parado, sem ação no momento
    VISITING: "visiting",         // Nó sendo visitado durante uma query ou update
    UPDATING: "updating",         // Nó que acabou de ter seu valor agregado alterado
    LAZY_PENDING: "lazy_pending", // Nó que recebeu a tag, mas ainda não fez push down
    PUSHING_DOWN: "pushing_down"  // Nó que está passando a tag para os filhos agora
});
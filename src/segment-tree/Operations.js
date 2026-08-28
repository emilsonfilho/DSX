const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export const SumStrategy = {
    neutral: 0,
    merge: (esq, dir) => esq + dir,
    applyLazy: (currentValue, lazy, rangeLength) => currentValue + lazy * rangeLength,
    joinLazy: (oldLazy, newLazy) => oldLazy + newLazy,
}

export const MinStrategy = {
    neutral: Infinity,
    merge: (esq, dir) => Math.min(esq, dir),
    applyLazy: (currentValue, lazy, rangeLength) => currentValue + lazy,
    joinLazy: (oldLazy, newLazy) => oldLazy + newLazy,
}

export const MaxStrategy = {
    neutral: -Infinity,
    merge: (esq, dir) => Math.max(esq, dir),
    applyLazy: (currentValue, lazy, rangeLength) => currentValue + lazy,
    joinLazy: (oldLazy, newLazy) => oldLazy + newLazy,
}

export const XORStrategy = {
    neutral: 0,
    merge: (esq, dir) => esq ^ dir,
    applyLazy: (currentValue, lazy, rangeLength) => currentValue ^ (lazy * (rangeLength % 2)),
    joinLazy: (oldLazy, newLazy) => oldLazy ^ newLazy,
}

export const GCDStrategy = {
    neutral: 0,
    merge: (esq, dir) => gcd(esq, dir),
    applyLazy: (currentValue, lazy, rangeLength) => currentValue + lazy,
    joinLazy: (oldLazy, newLazy) => oldLazy + newLazy,
}

export const AndStrategy = {
    // -1 em binário é só bits 1 (0b111...1), o elemento neutro do E bit a bit
    neutral: -1,
    merge: (esq, dir) => esq & dir,
    applyLazy: (currentValue, lazy) => currentValue & lazy,
    // 0 é o valor usado pra marcar "sem lazy pendente", então não pode virar operando do E
    joinLazy: (oldLazy, newLazy) => (oldLazy === 0 ? newLazy : oldLazy & newLazy),
}

/**
 * Catálogo das operações expostas na interface
 */
export const Strategies = Object.freeze({
    sum: { key: "sum", label: "SOMA", resultLabel: "Soma", updateVerb: "Somado", strategy: SumStrategy },
    min: { key: "min", label: "MÍN", resultLabel: "Mínimo", updateVerb: "Somado", strategy: MinStrategy },
    max: { key: "max", label: "MÁX", resultLabel: "Máximo", updateVerb: "Somado", strategy: MaxStrategy },
    gcd: { key: "gcd", label: "MDC", resultLabel: "MDC", upadateVerb: "Aplicado MDC com", strategy: GCDStrategy },
    xor: { key: "xor", label: "XOR", resultLabel: "XOR", updateVerb: "Aplicado XOR com", strategy: XORStrategy },
    and: { key: "and", label: "AND", resultLabel: "AND", updateVerb: "Aplicado AND com", strategy: AndStrategy },
});

export const DEFAULT_STRATEGY_KEY = "sum";
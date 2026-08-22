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

/**
 * Catálogo das operações expostas na interface
 */
export const Strategies = Object.freeze({
    sum: { key: "sum", label: "SOMA", resultLabel: "Soma", strategy: SumStrategy },
    min: { key: "min", label: "MÍN", resultLabel: "Mínimo", strategy: MinStrategy },
    max: { key: "max", label: "MÁX", resultLabel: "Máximo", strategy: MaxStrategy },
});

export const DEFAULT_STRATEGY_KEY = "sum";
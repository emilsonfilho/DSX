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


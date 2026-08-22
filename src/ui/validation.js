export const MAX_ELEMENTS = 32;
export const COMFORTABLE_ELEMENTS = 16;

const isBlank = (text) => !text || text.trim() === "";

/** "1, 2, 3" | "1 2 3" -> [1, 2, 3] */
export function parseArray(text) {
    if (isBlank(text)) return { ok: false, error: "Digite ao menos um número no array." };

    const parts = text.split(/[\s,;]+/).filter(Boolean);
    const values = parts.map(Number);

    const invalid = parts.find((_, i) => !Number.isFinite(values[i]));
    if (invalid !== undefined) return { ok: false, error: `“${invalid}” não é um número válido.` };

    if (values.length > MAX_ELEMENTS)
        return { ok: false, error: `Máximo de ${MAX_ELEMENTS} elementos para visualização.` };

    return { ok: true, value: values };
}

export function parseNumber(text, label) {
    if (isBlank(text)) return { ok: false, error: `Preencha o campo “${label}”.` };

    const value = Number(text);
    if (!Number.isFinite(value)) return { ok: false, error: `“${text}” não é um número válido.` };

    return { ok: true, value };
}

export function parseIndex(text, label, size) {
    const parsed = parseNumber(text, label);
    if (!parsed.ok) return parsed;

    if (!Number.isInteger(parsed.value))
        return { ok: false, error: `O campo “${label}” precisa ser um índice inteiro.` };

    if (parsed.value < 0 || parsed.value >= size)
        return { ok: false, error: `Índice ${parsed.value} fora do array (válido: 0 a ${size - 1}).` };

    return parsed;
}

export function parseRange(startText, endText, size) {
    const start = parseIndex(startText, "Intervalo inicial", size);
    if (!start.ok) return start;

    const end = parseIndex(endText, "Alcance final", size);
    if (!end.ok) return end;

    if (start.value > end.value)
        return { ok: false, error: "O início do intervalo não pode ser maior que o fim." };

    return { ok: true, value: [start.value, end.value] };
}
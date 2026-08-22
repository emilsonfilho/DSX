//Calcula a forma canônica da Segment Tree a partir do tamanho do array.

export function layoutTree(size) {
    const positions = new Map();
    const edges = [];

    let column = 0;
    let maxDepth = 0;

    function walk(index, left, right, depth) {
        maxDepth = Math.max(maxDepth, depth);

        if (left === right) {
            const x = column++;
            positions.set(index, { x, y: depth, range: [left, right], isLeaf: true });
            return x;
        }

        const middle = Math.floor((left + right) / 2);
        const leftX = walk(2 * index, left, middle, depth + 1);
        const rightX = walk(2 * index + 1, middle + 1, right, depth + 1);
        const x = (leftX + rightX) / 2;

        positions.set(index, { x, y: depth, range: [left, right], isLeaf: false });
        edges.push([index, 2 * index], [index, 2 * index + 1]);

        return x;
    }

    if (size > 0) walk(1, 0, size - 1, 0);

    return { positions, edges, columns: Math.max(column, 1), depth: maxDepth };
}

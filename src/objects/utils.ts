export interface Neighbor {
    col: number,
    row: number
};

const DIRECTIONS = [
    [
        { col:  1, row:  0 }, { col:  0, row: -1 },
        { col: -1, row: -1 }, { col: -1, row:  0 },
        { col: -1, row:  1 }, { col:  0, row:  1 }
    ],
    [
        { col:  1, row:  0 }, { col:  1, row: -1 },
        { col:  0, row: -1 }, { col: -1, row:  0 },
        { col:  0, row:  1 }, { col:  1, row:  1 }
    ]
];

export function getNeighbors(col: number, row: number, cols: number, rows: number): Neighbor[] {
    let parity = row & 1,
        neighbors: Neighbor[] = [];

    DIRECTIONS[parity].forEach((dir)=> {
        let nCol = col + dir.col,
            nRow = row + dir.row;

        if (nCol < 0)           { nCol += cols; }
        if (nCol >= this.cols)  { nCol -= cols; }
        if (nRow < 0)           { nRow += rows; }
        if (nRow >= this.rows)  { nRow -= rows; }

        neighbors.push({ col: nCol, row: nRow });
    });

    return neighbors;
}

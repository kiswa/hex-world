import { Neighbor, getNeighbors } from './utils';

export interface LifeRules {
    factor: number,
    create: {
        min: number,
        max: number
    },
    survive: {
        min: number,
        max: number
    }
};

export class LifeSim {
    private map: boolean[] = [];

    constructor(private rows: number, private cols: number,
                private generations: number, private rules: LifeRules) {
        for (let col = 0; col < cols; ++col) {
            for (let row = 0; row < rows; ++row) {
                this.map[col + row * cols] = Math.random() < rules.factor;
            }
        }
    }

    runSimulation(): boolean[] {
        for (let x = 0; x < this.generations; ++x) {
            this.advanceMap()
        }

        return this.map;
    }

    getLivingNeighborCount(col: number, row: number): number {
        let neighborCount = 0;

        getNeighbors(col, row, this.cols, this.rows).forEach((n) => {
            if (this.map[n.col + n.row * this.cols]) {
                neighborCount += 1;
            }
        });

        return neighborCount;
    }

    private advanceMap(): void {
        let nextGen: boolean[] = [],
            neighborCount: number,
            index: number;

        for (let col = 0; col < this.cols; ++col) {
            for (let row = 0; row < this.rows; ++row) {
                index = col + row * this.cols;
                neighborCount = this.getLivingNeighborCount(col, row);

                nextGen[index] = this.map[index];

                if (this.map[index]) {
                    if (neighborCount < this.rules.survive.min ||
                            neighborCount > this.rules.survive.max) {
                        nextGen[index] = false;
                    }
                } else {
                    if (neighborCount >= this.rules.create.min &&
                            neighborCount <= this.rules.create.max) {
                        nextGen[index] = true;
                    }
                }
            }
        }

        this.map = nextGen.slice();
    }
}

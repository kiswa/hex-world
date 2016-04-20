import { Hexagon, HexType } from './hexagon';
import { LifeRules, LifeSim } from './life-sim';
import { Neighbor, getNeighbors } from './utils';

export class HexMap {
    activeHex: Hexagon;
    hexagons: Hexagon[];

    constructor(private game: Phaser.Game,
                private cols: number,
                private rows: number,
                private hexSize: number) {
        this.hexagons = new Array<Hexagon>();

        this.createHexagons();
        this.generateMap();
    }

    hexAt(col: number, row: number): Hexagon {
        return this.hexagons[col + row * this.cols];
    }


    private generateMap(): void {
        let lakeMap = new LifeSim(this.rows, this.cols, 5, {
                factor: 0.45,
                create: { min: 3, max: 6 },
                survive: { min: 2, max: 6 }
            }),
            grassMap = new LifeSim(this.rows, this.cols, 5, {
                factor: 0.3,
                create: { min: 2, max: 6 },
                survive: { min: 2, max: 5 }
            });

        let map = lakeMap.runSimulation();
        let grass = grassMap.runSimulation();

        // Remove single hexagon lakes
        for (let x = 0; x < this.cols; ++x) {
            for (let y = 0; y < this.rows; ++y) {
                if (lakeMap.getLivingNeighborCount(x, y) === 6) {
                    map[x + y * this.cols] = true;
                }
            }
        }

        for (let i = 0; i < map.length; ++i) {
            this.hexagons[i].setType(map[i] ? HexType.Dirt : HexType.Water);
        }

        // Add sand around lakes
        for (let i = 0; i < this.hexagons.length; ++i) {
            let hex = this.hexagons[i];

            if (hex.getType() === HexType.Water) {
                getNeighbors(hex.mapPoint.col, hex.mapPoint.row,
                    this.cols, this.rows).
                    forEach((n) => {
                        let neighbor = this.hexagons[n.col + n.row * this.cols];

                        if (neighbor && neighbor.getType() === HexType.Dirt) {
                            neighbor.setType(HexType.Sand);
                        }
                    });
            }
        }

        // Set tiles to Grass by second simulation results
        // (with a chance of creating a Forest)
        for (let i = 0; i < this.hexagons.length; ++i) {
            let hex = this.hexagons[i];

            if (hex && hex.getType() === HexType.Dirt) {
                if (grass[i]) {
                    if (Math.random() < 0.2) {
                        hex.setType(HexType.Forest);
                    } else {
                        hex.setType(HexType.Grass);
                    }
                }
            }
        }
    }

    private createHexagons(): void {
        let index = 0,
            width = Math.sqrt(3) / 2 * this.hexSize;

        for (let col = 0; col < this.cols; ++col) {
            for (let row = 0; row < this.rows; ++row) {
                let gamePos = { x: 0, y: 0 };

                gamePos.x = ((col + 1) * width * 2) + 5;
                gamePos.y = ((row + 1) * width * 1.8) + 5;

                if (row & 1) { gamePos.x += width; }

                let hex = new Hexagon(this.game, gamePos.x, gamePos.y,
                                      this.hexSize, HexType.Dirt);

                hex.mapPoint.col = col;
                hex.mapPoint.row = row;
                hex.mapPoint.gridToCube();
                hex.sprite.events.onInputOver.add(this.onSpriteMouseOver, this);
                hex.sprite.events.onInputOut.add(this.onSpriteMouseOut, this);


                this.hexagons[col + row * this.cols] = hex;
            }
        }
    }

    private onSpriteMouseOver(sprite: Phaser.Sprite) {
        this.activeHex = sprite['hexagon'];
        sprite.tint = 0xeeeeee;
    }

    private onSpriteMouseOut(sprite: Phaser.Sprite) {
        sprite.tint = 0xffffff;
    }
}

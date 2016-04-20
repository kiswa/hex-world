import { PointConverter } from './point-converter';

export var HexType = {
    Empty :  '',
    Water : '#83929f',
    Grass : '#668d3c',
    Dirt  : '#855723',
    Sand  : '#a9a18c',
    Forest: '#4c692d'
};

 export class Hexagon {
    public sprite: Phaser.Sprite;
    public mapPoint: PointConverter;

    constructor(private game: Phaser.Game,
                private x: number, private y: number,
                private size: number, private type: string) {
        this.mapPoint = new PointConverter();

        this.sprite = game.add.sprite(x, y, this.getBitmapData());
        this.sprite.anchor.setTo(0.5);
        this.sprite.inputEnabled = true;
        this.sprite.autoCull = true;
        this.sprite['hexagon'] = this;
    }

    public displayDebugInfo(x: number, y: number): void {
        let debug = this.game.debug;

        debug.start(x, y);

        debug.spriteInfo(this.sprite, x, y);
        debug.line(`Type: ${this.getTypeName()} Coords: (${this.mapPoint.col}, ${this.mapPoint.row})`);

        debug.stop();
    }

    public getType(): string {
        return this.type;
    }

    public getTypeName(): string {
        let type = '';
        switch(this.type) {
            case HexType.Water:
                type = 'Water';
                break;
            case HexType.Grass:
                type = 'Grass';
                break;
            case HexType.Dirt:
                type = 'Dirt';
                break;
            case HexType.Sand:
                type = 'Sand';
                break;
            case HexType.Forest:
                type = 'Forest';
                break;
        }

        return type;
    }

    public setType(type: string) {
        this.type = type;
        this.sprite.loadTexture(this.getBitmapData());
    }

    private getBitmapData(): Phaser.BitmapData {
        let pos = { x: this.size, y: this.size },
            angle, x, y;

        if (this.game.cache.checkKey(Phaser.Cache.BITMAPDATA, this.type)) {
            return this.game.cache.getBitmapData(this.type);
        }

        let bmd = this.game.add.bitmapData(
            this.size * 2, this.size * 2, this.type, true);

        bmd.ctx.strokeStyle = this.getBorderColor();
        bmd.ctx.fillStyle = this.type;
        bmd.ctx.beginPath();

        for (let i = 0; i <= 6; ++i) {
            angle = 2 * Math.PI / 6 * (i + 0.5);
            x = pos.x + this.size * Math.cos(angle);
            y = pos.y + this.size * Math.sin(angle);

            if (i === 0) {
                bmd.ctx.moveTo(x, y);
            } else {
                bmd.ctx.lineTo(x, y);
            }
        }

        bmd.ctx.stroke();
        bmd.ctx.fill();

        return bmd;
    }

    private getBorderColor(): string {
        let hex = this.type.replace(/[^0-9a-f]/gi, ''),
            lum = -0.2,
            newHex = "#",
            c;

        for (let i = 0; i < 3; ++i) {
            // Convert the current hex string part to an integer
            c = parseInt(hex.substr(i * 2, 2), 16);
            // Modify luminosity, limiting to 0-255 and convert back to hex string
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);

            newHex += c;
        }

        return newHex;
    }
 }

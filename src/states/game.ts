import { HexMap } from '../objects/hex-map';
import { HexType } from '../objects/hexagon';

export class Game extends Phaser.State {
    private hexMap: HexMap;

    private zoom = {
        viewWidth: 800,
        viewHeight: 600,
        mapWidth: 800 * 3,
        mapHeight: 600 * 3,
        sizeX: 800 * 3,
        sizeY: 600 * 3,
        scale: 1,
        easing: 0.1,
        step: 200
    };
    private oldCamera: Phaser.Point;

    //private text: Phaser.Text;
    private debugSprite: Phaser.Sprite;
    private zoomGroup: Phaser.Group;

    create() {
        let fontStyle = {
            font: '18px Walter Turncoat',
            fill: '#7edcfc'
        };

        this.game.time.advancedTiming = true;
        this.game.world.bounds.setTo(0, 0,
                                     this.zoom.mapWidth, this.zoom.mapHeight);

        this.zoomGroup = this.game.add.group();

        let mouse = this.game.input.mouse;
        mouse.callbackContext = this;
        mouse.mouseWheelCallback = this.onMouseWheel;

        let camera = this.game.camera;
        camera.bounds.setTo(0, 0, this.zoom.mapWidth, this.zoom.mapHeight);
        camera.focusOnXY(this.zoom.mapWidth / 2, this.zoom.mapHeight / 2);

        //this.text = this.add.text(camera.x + this.zoom.viewWidth / 2,
        //                          camera.y + this.zoom.viewHeight / 2,
        //                         '', fontStyle);
        //this.text.anchor.setTo(0.5);

        this.hexMap = new HexMap(this.game, 97, 81, 14);

        for (let hex of this.hexMap.hexagons) {
            this.zoomGroup.add(hex.sprite);
        }
    }

    render() {
        this.game.debug.text('FPS: ' + this.game.time.fps, 2, 12);

        if (this.hexMap.activeHex) {
            this.hexMap.activeHex.displayDebugInfo(2, 26);
        }
    }

    update() {
        let camera = this.game.camera;
        let input = this.game.input;
        let zoomPoint = new Phaser.Point();
        let hex = this.hexMap.activeHex;

        //if (hex) {
        //    this.text.setText('Location: (' + hex.mapPoint.col + ', ' +
        //        hex.mapPoint.row + ') Type: ' + hex.getTypeName() +
        //        ' Zoom: ' + this.zoom.scale);
        //}
        //this.text.x = this.game.camera.x + this.zoom.viewWidth / 2;
        //this.text.y = this.game.camera.y + this.zoom.viewHeight / 2;

        zoomPoint.x = input.mousePointer.worldX;
        zoomPoint.y = input.mousePointer.worldY;

        if (this.game.input.activePointer.isDown) {
            if (this.oldCamera) {
                camera.x += this.oldCamera.x - input.activePointer.position.x;
                camera.y += this.oldCamera.y - input.activePointer.position.y;
            }

            this.oldCamera = this.game.input.activePointer.position.clone();
        } else {
            this.oldCamera = null;

            let prevScale = this.zoomGroup.scale.clone();
            let nextScale = prevScale.clone();

            let rescaleX = this.zoom.mapWidth /
                (this.zoom.mapWidth * prevScale.x);
            let rescaleY = this.zoom.mapHeight /
                (this.zoom.mapHeight * prevScale.y);

            nextScale.x = prevScale.x +
                (this.zoom.scale - prevScale.x) * this.zoom.easing;
            nextScale.y = prevScale.y +
                (this.zoom.scale - prevScale.y) * this.zoom.easing;

            let deltaX = (zoomPoint.x - camera.position.x) * (nextScale.x - prevScale.x);
            let deltaY = (zoomPoint.y - camera.position.y) * (nextScale.y - prevScale.y);

            if (prevScale.x !== nextScale.x || prevScale.y !== nextScale.y) {
                let scaleDeltaX = nextScale.x / prevScale.x;
                let scaleDeltaY = nextScale.y / prevScale.y;
                let focusX = camera.position.x * scaleDeltaX + deltaX * rescaleX;
                let focusY = camera.position.y * scaleDeltaY + deltaY * rescaleY;

                camera.focusOnXY(focusX, focusY);
            }

            this.zoomGroup.scale.x +=
                (this.zoom.scale - this.zoomGroup.scale.x) * this.zoom.easing;
            this.zoomGroup.scale.y +=
                (this.zoom.scale - this.zoomGroup.scale.y) * this.zoom.easing;
        }

        camera.x = Phaser.Math.clamp(camera.x, 0,
                                     this.zoom.sizeX - this.zoom.viewWidth);
        camera.y = Phaser.Math.clamp(camera.y, 0,
                                     this.zoom.sizeY - this.zoom.viewHeight);
    }

    private onMouseWheel(event) {
        let wheelDelta = event.wheelDelta;

        if (wheelDelta < 0) {
            this.zoom.sizeX -= this.zoom.step;
            this.zoom.sizeY -= this.zoom.step * (3 / 4); // Aspect ratio correction
        } else {
            this.zoom.sizeX += this.zoom.step;
            this.zoom.sizeY += this.zoom.step * (3 / 4); // Aspect ratio correction
        }

        this.zoom.sizeX = Phaser.Math.clamp(this.zoom.sizeX,
                                            this.zoom.viewWidth,
                                            this.zoom.mapWidth);
        this.zoom.sizeY = Phaser.Math.clamp(this.zoom.sizeY,
                                            this.zoom.viewHeight,
                                            this.zoom.mapHeight);
        this.zoom.scale = (this.zoom.sizeX / this.zoom.mapWidth);
    }
}

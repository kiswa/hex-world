export class PointConverter {
    public x: number;
    public y: number;
    public z: number;
    public col: number;
    public row: number;

    cubeToGrid(): PointConverter {
        this.col = this.x + (this.z - (this.z&1)) / 2;
        this.row = this.z;

        return this;
    }

    gridToCube(): PointConverter {
        this.x = this.col - (this.row - (this.row&1)) / 2;
        this.z = this.row;
        this.y = -this.x * -this.z;

        return this;
    }
}
export default class SingleCell {
    constructor(rowIndex, colIndex, index) {
        this.X = rowIndex;
        this.Y = colIndex;
        this.Index = index;
        this.IsBody = false;
        this.IsPrize = false;
        this.IsPreviousPrize = false;
    }
}
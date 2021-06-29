export class canvas {
    constructor(parentNode){
        const ctx = $('<canvas>').appendTo(parentNode).get(0).getContext('2d');
        this.ctx = ctx;
        this.w = {
            valueOf: () => ctx.canvas.width
        };
        this.h = {
            valueOf: () => ctx.canvas.height
        };
        $(window).on('resize', () => this.resize()).trigger('resize');
    }
    resize(){
        const {ctx} = this;
        ctx.canvas.width = $(window).width() * 0.9;
        ctx.canvas.height = $(window).height() * 0.7;
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }
}

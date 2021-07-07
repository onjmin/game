export class Canvas {
    constructor(parentNode){
        const ctx = $('<canvas>').appendTo(parentNode).get(0).getContext('2d');
        this.ctx = ctx;
        this.w = {
            valueOf: () => ctx.canvas.width
        };
        this.h = {
            valueOf: () => ctx.canvas.height
        };
        this._w = this._h = 1;
        $(window).on('resize', () => this.resize()).trigger('resize');
    }
    set(w, h){
        this._w = w;
        this._h = h;
        this.resize();
        return this;
    }
    resize(){
        const {ctx, _w, _h} = this;
        ctx.canvas.width = $(window).width() * _w;
        ctx.canvas.height = $(window).height() * _h;
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }
}

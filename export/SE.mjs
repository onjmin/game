import {load} from 'https://rpgen3.github.io/mylib/export/imgur.mjs';
import {imgToBuf} from 'https://rpgen3.github.io/mylib/export/strToImg.mjs';
export const audio = new class {
    constructor(){
        const ctx = new AudioContext;
        this.ctx = ctx;
        this._gain = ctx.createGain()
    }
    set gain(v){
        this._gain.gain.value = v;
    }
    make(buf){
        return this.ctx.decodeAudioData(buf);
    }
    play(buf){
        const {ctx, _gain} = this,
              src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(_gain).connect(ctx.destination);
        src.start();
    }
};
export const SE = (list => {
    const obj = {};
    for(const [k, v] of Object.entries(list)) imgur.load(v).then(buf=>audio.make(imgToBuf(buf))).then(buf=>{
        obj[k] = () => audio.play(buf);
    });
    return obj;
})({
    damage: 'ru01WWV',
    jump: 'vSaXiRd',
    wall: 'DFGjmWF'
});

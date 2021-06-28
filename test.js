$("<input>").appendTo('body').attr({
    type: "file"
}).on("change",e => {
    const fr = new FileReader;
    fr.onload = () => load(fr.result);
    fr.readAsArrayBuffer(e.target.files[0]);
});
const load = buffer => {
    const data = new Uint8Array(buffer),
          w = Math.sqrt(data.length * 4 / 3 >> 2) + 1 | 0,
          unit = (w << 1) ** 2,
          data2 = new Uint8ClampedArray(unit),
          width = w,
          height = w;
    console.log(data)
    const max = unit >> 2;
    for(let i = 0; i < max; i++){
        let j = i * 4,
            k = i * 3;
        data2[j] = data[k]
        data2[j + 1] = data[k + 1];
        data2[j + 2] = data[k + 2];
    }
    const cv = $('<canvas>').prop({width, height}),
          ctx = cv.get(0).getContext('2d');
    ctx.putImageData(new ImageData(data2, w, w), 0, 0);
    decode(ctx);
    return cv.appendTo('body');
};
const decode = async ctx => {
    const {width, height} = ctx.canvas,
          {data} = ctx.getImageData(0, 0, width, height),
          unit = data.length / 4;
    const data2 = [...new Array(data.length * 3 / 4)];
    const max = unit;
    for(let i = 0; i < max; i++){
        let j = i * 3,
            k = i * 4;
        data2[j] = data[k]
        data2[j + 1] = data[k + 1];
        data2[j + 2] = data[k + 2];
    }
    let data3;
    for(let i = max * 3 - 1; i >= 0; i--) {
        let v = data2[i];
        if(!v) continue;
        data3 = data2.slice(0, i);
        break;
    }
    console.log(data2)
    window.a = data3
    console.log(data3.buffer);
    const audioCtx = new AudioContext,
          audioBuf = await audioCtx.decodeAudioData(new Uint8Array(data3).buffer),
          src = audioCtx.createBufferSource();
    src.buffer = audioBuf
    src.connect(audioCtx.destination);
    //src.start(0);
};

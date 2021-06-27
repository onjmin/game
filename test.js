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
          len = (w << 1) ** 2,
          data2 = new Uint8ClampedArray(len),
          width = w,
          height = w;
    console.log(data)
    for(let i = 0; i < len >> 2; i++){
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
          len = data.length / 4;
    const data2 = new Uint8Array(data.length * 3 / 4);
    const max = len >> 2;
    let lastIdx = 0;
    for(let i = 0; i < max; i++){
        let m = max - i - 1,
            j = m * 3,
            k = m * 4;
        const a = data.slice(k , k + 3);
        data2[j] = a[0];
        data2[j + 1] = a[1];
        data2[j + 2] = a[2];
        if(!lastIdx) continue;
        const idx = a.indexOf(0);
        if(idx === -1 || idx === 0) continue;
        lastIdx = i + idx;
    }
    console.log(data2.buffer);
    const audioCtx = new AudioContext,
          audioBuf = await audioCtx.decodeAudioData(new Uint8Array(data2.slice(0,lastIdx)).buffer),
          src = audioCtx.createBufferSource();
    src.buffer = audioBuf
    src.connect(audioCtx.destination);
    src.start(0);
};

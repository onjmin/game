(async()=>{
    await import('https://rpgen3.github.io/lib/lib/jquery-3.5.1.min.js');
    const rpgen3 = await Promise.all([
        'input',
        'imgur',
        'strToImg'
    ].map(v=>import(`https://rpgen3.github.io/mylib/export/${v}.mjs`))).then(v=>Object.assign({},...v));
    const undef = void 0;
    const html = $('body').css({
        'text-align': 'center',
        padding: '1em'
    });
    const header = $('<div>').appendTo(html),
          body = $('<div>').appendTo(html),
          footer = $('<div>').appendTo(html);
    class Mover {
        constructor(id){
            this.x = this.y = 0;
            this._delete = layer.set(this);
            rpgen3.imgur.load(id).then(img => {
                this.img = img;
                if(this.w !== undef && this.h !== undef) return;
                this.w = img.width;
                this.h = img.height;
            });
        }
        update(){
            if(this.img) cv.ctx.drawImage(this.img, this.x, this.y);
        }
        delete(){
            this._delete();
        }
        goto(x, y){
            this.x = x;
            this.y = y;
            return this;
        }
        move(x, y){
            this.x += x;
            this.y += y;
        }
    }
    class Anime extends Mover {
        constructor(...arg){
            super(...arg);
            const rate = 3;
            this.w = this.h = 16 * rate;
            this.anime = 500;
            this.direct = 'd';
        }
        update(){
            if(!this.img) return;
            const {w} = this,
                  index = 'wdsa'.indexOf(this.direct);
            const x = g_nowTime % this.anime < this.anime / 2 ? 0 : 1;
            const unit = 16;
            cv.ctx.drawImage(
                this.img,
                x * unit, index * unit, unit, unit,
                this.x, this.y, w, w
            );
        }
        move(x, y){
            super.move(x, y);
            if(x < 0) this.direct = 'a';
            else if(x > 0) this.direct = 'd';
            else if(y < 0) this.direct = 'w';
            else if(y > 0) this.direct = 's';
        }
    }
    class Player extends Anime {
        constructor(...arg){
            super(...arg);
            this.gravity = 5;
            this.HP = 3;
            this.horizon = {
                valueOf: () => g_horizonY - this.h
            };
        }
        update(){
            if(!this.img) return;
            if(this._jump) this.y -= this._jump--;
            if(this.y < this.horizon) this.y += this.gravity;
            else {
                this.y = +this.horizon;
                this.anime = 500;
                if(['ArrowUp','z',undef].some(v=>g_keys.get(v))) this.jump();
            }
            if(this.x < 0) {
                this.x = 0;
                SE?.wall();
            }
            else if(g_keys.get('ArrowLeft')) this.move(-5,0);
            if(this.x + this.w > cv.w) {
                this.x = cv.w - this.w;
                SE?.wall();
            }
            else if(g_keys.get('ArrowRight')) this.move(5,0);
            if(!this._damage || g_nowTime % 200 < 100) super.update();
        }
        jump(){
            this._jump = 20;
            this.anime = 100;
            SE?.jump();
        }
        damage(){
            if(this._damage) return;
            this.HP--;
            this._damage = true;
            setTimeout(() => {
                this._damage = false;
            },2000);
            SE?.damage();
        }
    }
    class Enemy extends Anime {
        constructor(...arg){
            super(...arg);
            this.collide = 1;
        }
        update(){
            if(!this.img) return;
            if(this.isCollide(tsukinose)) tsukinose.damage();
            super.update();
        }
        isCollide(mover){
            const {x,y,w,h} = mover;
            return this.collide * ((this.x - x) ** 2 + (this.y - y) ** 2) <= (this.w/2 + w/2) ** 2;
        }
    }
    const cv = new class {
        constructor(){
            const ctx = $('<canvas>').appendTo(footer).get(0).getContext('2d');
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
    };
    const g_horizonY = cv.h - 100;
    const layer = new class {
        constructor(){
            this.m = new Map;
            this._m = new Map;
            this.sorted = [];
        }
        set(v, z = 0){
            const {m, _m} = this,
                  zz = z;
            if(_m.has(z)) z = _m.get(z);
            while(m.has(z)) z++;
            m.set(z, v);
            _m.set(zz, z);
            this.sorted = [...m.keys()].sort();
            return () => m.delete(z);
        };
    };
    let g_nowTime;
    const update = () => {
        g_nowTime = performance.now();
        cv.ctx.clearRect(0, 0, cv.w, cv.h);
        for(const v of layer.sorted) layer.m.get(v).update();
        requestAnimationFrame(update);
    };
    update();
    let g_keys = new Map;
    $(window)
        .on('keydown keyup', ({key, type}) => g_keys.set(key, type === 'keydown'))
        .on('touchstart touchend', ({type}) => g_keys.set(undef, type === 'touchstart'))
        .on('blur contextmenu mouseleave', () => (g_keys = new Map));
    const tsukinose = new Player('orQHJ51').goto(cv.w / 2, 0);
    const kuso = new Enemy('i3AI9Pw');
    kuso.goto(cv.w * 0.1, g_horizonY - kuso.h);
    const audio = new class {
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
    const SE = (list => {
        const obj = {};
        for(const [k, v] of Object.entries(list)) rpgen3.imgur.load(v).then(buf=>audio.make(rpgen3.imgToBuf(buf))).then(buf=>{
            obj[k] = () => audio.play(buf);
        });
        return obj;
    })({
        damage: 'ru01WWV',
        jump: 'vSaXiRd',
        wall: 'DFGjmWF'
    });
    const rpgen4 = await Promise.all([
        'BGM'
    ].map(v=>import(`https://rpgen3.github.io/game/export/${v}.mjs`))).then(v=>Object.assign({},...v));
    const bgm = new rpgen4.BGM({
        id: 327497232,
        start: 18,
        end: 290,
        auto: true
    });
    layer.set(bgm);
    const inputVolume = rpgen3.addInputNum(header,{
        label: '音量',
        save: true
    });
    inputVolume.elm.on('change', () => {
        audio.gain = inputVolume / 100;
        bgm.volume = +inputVolume;
    }).trigger('change');
})();

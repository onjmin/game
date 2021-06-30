(async()=>{
    const {importAll, importAllSettled, getScript} = await import('https://rpgen3.github.io/mylib/export/import.mjs');
    await getScript('https://rpgen3.github.io/lib/lib/jquery-3.5.1.min.js');
    const rpgen3 = await importAll([
        'input',
        'imgur',
        'strToImg'
    ].map(v => `https://rpgen3.github.io/mylib/export/${v}.mjs`));
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
        update(ctx){
            if(this.img) ctx.drawImage(this.img, this.x, this.y);
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
        update(ctx){
            if(!this.img) return;
            const {w} = this,
                  index = 'wdsa'.indexOf(this.direct);
            const x = g_nowTime % this.anime < this.anime / 2 ? 0 : 1;
            const unit = 16;
            ctx.drawImage(
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
            this._wall = 0;
        }
        update(ctx){
            if(!this.img) return;
            if(this._jump) this.y -= this._jump--;
            if(this.y < this.horizon) this.y += this.gravity;
            else {
                this.y = +this.horizon;
                this.anime = 500;
                if(isKeyDown(['ArrowUp','z','w',' ',undef])) this.jump();
            }
            if(isKeyDown(['ArrowLeft','a'])) this.move(-5,0);
            if(this.x < 0) {
                this.x = 0;
                this.wall();
            }
            if(isKeyDown(['ArrowRight','d'])) this.move(5,0);
            if(this.x + this.w > cv.w) {
                this.x = cv.w - this.w;
                this.wall();
            }
            if(!this._damage || g_nowTime % 200 < 100) super.update(ctx);
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
        wall(){
            if(g_nowTime - this._wall < 1000) return;
            this._wall = g_nowTime;
            SE?.wall();
        }
    }
    class Enemy extends Anime {
        constructor(...arg){
            super(...arg);
            this.collide = 1;
        }
        update(ctx){
            if(!this.img) return;
            if(this.isCollide(tsukinose)) tsukinose.damage();
            super.update(ctx);
        }
        isCollide(mover){
            const {x,y,w,h} = mover;
            return this.collide * ((this.x - x) ** 2 + (this.y - y) ** 2) <= (this.w/2 + w/2) ** 2;
        }
    }
    class SimpleText {
        constructor({x = 0, y = 0, text = '', color = 'black', size = 16}){
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
            this.size = size;
            layer.set(this, 999);
        }
        update(ctx){
            const {x, y, text, color, size} = this;
            ctx.fillStyle = color;
            ctx.font = `bold ${size}px 'ＭＳ ゴシック'`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(text, x, y);
        }
    }
    const rpgen4 = await importAllSettled([
        'isKeyDown',
        'canvas',
        'layer',
        'BGM',
        'SE'
    ].map(v => `https://rpgen3.github.io/game/export/${v}.mjs`));
    const {layer, isKeyDown} = rpgen4,
          cv = new rpgen4.canvas(footer),
          g_horizonY = {
              valueOf: () => cv.h * 0.9
          };
    let g_nowTime;
    const update = () => {
        g_nowTime = performance.now();
        cv.ctx.clearRect(0, 0, cv.w, cv.h);
        for(const v of layer.sorted) layer.m.get(v).update(cv.ctx);
        requestAnimationFrame(update);
    };
    update();
    const BGM = new rpgen4.BGM({
        id: 327497232,
        start: 18,
        end: 290,
        auto: true
    });
    layer.set(BGM);
    const SE = rpgen4.SE({
        damage: 'ru01WWV',
        jump: 'vSaXiRd',
        wall: 'DFGjmWF'
    });
    const inputVolume = rpgen3.addInputNum(header,{
        label: '音量',
        save: true
    });
    inputVolume.elm.on('input', () => {
        rpgen4.audio.gain = inputVolume / 100;
        BGM.volume = +inputVolume;
    }).trigger('input');
    const tsukinose = new Player('orQHJ51').goto(cv.w / 2 - 8, 0);
    const kuso = new Enemy('i3AI9Pw');
    kuso.goto(cv.w * 0.1, g_horizonY - kuso.h);
    new SimpleText({
        text: {
            toString: () => `HP：${tsukinose.HP}`
        },
        size: 30
    });
    new SimpleText({
        text: {
            toString: () => `time：${g_nowTime | 0}`
        },
        size: 30,
        y: 30,
    });
})();

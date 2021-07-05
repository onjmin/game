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
        padding: '1em',
        'user-select': 'none'
    });
    const header = $('<div>').appendTo(html),
          body = $('<div>').appendTo(html),
          footer = $('<div>').appendTo(html);
    class Mover {
        constructor(id){
            this.x = this.y = 0;
            this.z = 0;
            rpgen3.imgur.load(id).then(img => {
                this.img = img;
                if(this.w !== undef && this.h !== undef) return;
                this.w = img.width;
                this.h = img.height;
            });
        }
        set z(v){
            if(this.delete) this.delete();
            this.delete = layer.set(this, v);
        }
        update(ctx){
            if(this.img) ctx.drawImage(this.img, this.x, this.y);
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
            if(!this.img || this.hide) return;
            const {img, x, y, w, anime, direct} = this,
                  index = 'wdsa'.indexOf(direct),
                  xx = g_nowTime % anime < anime / 2 ? 0 : 1,
                  unit = 16;
            ctx.drawImage(
                img,
                xx * unit, index * unit, unit, unit,
                x, y, w, w
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
    class Falling extends Anime {
        constructor(...arg){
            super(...arg);
            this.gravity = 5;
            this.horizon = {
                valueOf: () => g_horizonY - this.h
            };
        }
        update(ctx){
            if(!this.img) return;
            if(this._jump) this.y -= this._jump--;
            if(this.y < this.horizon) this.y += this.gravity;
            else {
                this._jump = null;
                this.y = +this.horizon;
                this.anime = 500;
            }
            super.update(ctx);
        }
        jump(){
            if(this._jump !== null) return;
            this._jump = 20;
            this.anime = 100;
            return true;
        }
    }
    const type_player = 0,
          type_enemy = 1;
    class Player extends Falling {
        constructor(...arg){
            super(...arg);
            this.HP = 3;
            this._wall = 0;
            this.quadtree = new Quadtree(this);
            this.type = type_player;
        }
        update(ctx){
            if(!this.img) return;
            if(isKeyDown(['ArrowUp','z','w',' ',undef])) this.jump();
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
            this.hide = this._damage && g_nowTime % 200 < 100;
            super.update(ctx);
            const {x,y,w,h} = this;
            this.quadtree.updateXY(x, y, x + w, y + h);
        }
        jump(){
            if(super.jump()) SE.jump?.();
        }
        damage(){
            if(this._damage) return;
            this.HP--;
            this._damage = true;
            setTimeout(() => {
                this._damage = false;
            },2000);
            SE.damage?.();
        }
        wall(){
            if(g_nowTime - this._wall < 1000) return;
            this._wall = g_nowTime;
            SE.wall?.();
        }
    }
    class Enemy extends Falling {
        constructor(...arg){
            super(...arg);
            this.collide = 1;
            this.quadtree = new Quadtree(this);
            this.type = type_enemy;
        }
        update(ctx){
            if(!this.img) return
            this.move(-5, 0);
            if(this.x + this.w < 0) this.x = cv.w;
            if(Math.random() < 0.001) this.jump();
            if(Math.random() < 0.001) spawnTeki();
            super.update(ctx);
            const {x,y,w,h} = this;
            this.quadtree.updateXY(x, y, x + w, y + h);
        }
        hit(obj){
            if(obj.type !== type_player) return;
            const {x,y,w,h} = obj;
            if((this.x - x) ** 2 + (this.y - y) ** 2 <= ((this.w/2 + w/2) ** 2) * this.collide) tsukinose.damage();
        }
    }
    class SimpleText {
        constructor({text = '', color = 'black', size = 16}){
            this.x = this.y = 0;
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
        goto(x, y){
            this.x = x;
            this.y = y;
            return this;
        }
    }
    const rpgen4 = await importAllSettled([
        'isKeyDown',
        'Quadtree',
        'Canvas',
        'layer',
        'BGM',
        'SE'
    ].map(v => `https://rpgen3.github.io/game/export/${v}.mjs`));
    const {layer, isKeyDown, Quadtree} = rpgen4,
          cv = new rpgen4.Canvas(footer),
          g_horizonY = {
              valueOf: () => cv.h * 0.9
          };
    Quadtree.setCV(cv);
    layer.set(Quadtree);
    let g_nowTime;
    const update = () => {
        g_nowTime = performance.now();
        cv.ctx.clearRect(0, 0, cv.w, cv.h);
        layer.forEach(v => v.update(cv.ctx));
        requestAnimationFrame(update);
    };
    update();
    const BGM = rpgen4.BGM ? new rpgen4.BGM({
        id: 327497232,
        start: 18,
        end: 290,
        auto: true
    }) : null;
    if(BGM) layer.set(BGM);
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
        if(BGM) BGM.volume = +inputVolume;
    }).trigger('input');
    const tsukinose = new Player('orQHJ51').goto(16, 0);
    tsukinose.z = 100;
    const spawnTeki = (()=>{
        let i = 0;
        return () => i < cv.w / 600 + 1 && ++i && (new Enemy('i3AI9Pw').goto(cv.w + 1000, 0).collide = 0.1);
    })();
    spawnTeki();
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
        size: 30
    }).goto(0, 30);
})();

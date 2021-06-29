(async()=>{
    await import('https://rpgen3.github.io/lib/lib/jquery-3.5.1.min.js');
    const rpgen3 = await Promise.all([
        'imgur',
        'strToImg'
    ].map(v=>import(`https://rpgen3.github.io/mylib/export/${v}.mjs`))).then(v=>Object.assign({},...v));
    const undef = void 0;
    const h = $('body').css({
        'text-align': 'center',
        padding: '1em'
    });
    class Mover {
        constructor(url){
            this.x = this.y = 0;
            this._delete = z.set(this);
            const img = new Image;
            img.onload = () => {
                this.ready = true;
                if(this.w !== undef && this.h !== undef) return;
                this.w = img.width;
                this.h = img.height;
            };
            img.src = url;
            this.img = img;
        }
        update(){
            if(this.ready) cv.ctx.drawImage(this.img, this.x, this.y);
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
            if(!this.ready) return;
            const {w} = this,
                  ww = w / 2,
                  index = 'wdsa'.indexOf(this.direct);
            const x = g_nowTime % this.anime < this.anime / 2 ? 0 : 1;
            const unit = 16;
            cv.ctx.drawImage(
                this.img,
                x * unit, index * unit, unit, unit,
                this.x - ww, this.y - ww, w, w
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
            this.horizon = g_horizonY - this.h;
            this.HP = 3;
        }
        update(){
            if(!this.ready) return;
            if(!this.jumping && (g_keys.get('z') || g_keys.get('ArrowUp'))) this.jump();
            if(g_keys.get('ArrowLeft')) this.move(-5,0);
            else if(g_keys.get('ArrowRight')) this.move(5,0);
            if(this._jump) this.y -= this._jump--;
            if(this.y < this.horizon) this.y += this.gravity;
            else {
                this.y = this.horizon;
                this.anime = 500;
            }
            if(!this._damage || g_nowTime % 200 < 100) super.update();
        }
        jump(){
            if(this._jump || this.y < this.horizon) return;
            this._jump = 20;
            this.anime = 100;
        }
        damage(){
            if(this._damage) return;
            this.HP--;
            this._damage = true;
            setTimeout(() => {
                this._damage = false;
            },2000);
            damageSE.start();
        }
    }
    class Enemy extends Anime {
        update(){
            if(!this.ready) return;
            if(this.collision(tsukinose)) tsukinose.damage();
            super.update();
        }
        collision(mover){
            const {x,y,w,h} = mover;
            return (this.x - x) ** 2 + (this.y - y) ** 2 <= (this.w/2 + w/2) ** 2;
        }
    }
    const cv = new class {
        constructor(){
            const ctx = $('<canvas>').appendTo(h).prop({
                width: 550,
                height: 550,
            }).get(0).getContext('2d');
            this.ctx = ctx;
            this.w = {
                valueOf: () => ctx.canvas.width
            };
            this.h = {
                valueOf: () => ctx.canvas.height
            };
            // ドットを滑らかにしないおまじない
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
        }
    };
    const g_horizonY = cv.h - 100;
    const z = new class {
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
        for(const z of z.sorted) z.m.get(z).update();
        requestAnimationFrame(update);
    };
    update();
    const g_keys = new Map;
    $(window).on('keydown keyup', ({key, type}) => g_keys.set(key, type === 'keydown'));
    const tsukinose = new Player('https://i.imgur.com/orQHJ51.png').goto(300 / 2, 0);
    const kuso = new Enemy('https://i.imgur.com/i3AI9Pw.png');
    kuso.goto(50, g_horizonY - kuso.h);
    const damageSE = rpgen3.imgToAudio(await rpgen3.imgur.load('ru01WWV'));
    const se = 'vSaXiRd'
    })();

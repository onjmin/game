(async()=>{
    await import('https://rpgen3.github.io/lib/lib/jquery-3.5.1.min.js');
    const rpgen3 = await Promise.all([
        'baseN',
        'css',
        'hankaku',
        'random',
        'save',
        'url',
        'util',
        'strToImg'
    ].map(v=>import(`https://rpgen3.github.io/mylib/export/${v}.mjs`))).then(v=>Object.assign({},...v));
    const undef = void 0;
    const h = $("<body>").appendTo("html").css({
        "text-align": "center",
        padding: "1em"
    });
    class Mover {
        constructor(url){
            this.x = this.y = 0;
            this._delete = setZ(this);
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
            if(this.ready) g_ctx.drawImage(this.img, this.x, this.y);
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
            g_ctx.drawImage(
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
    window.a = new Map;
    class Player extends Anime {
        constructor(...arg){
            super(...arg);
            this.gravity = 5;
            this.horizon = g_horizonY - this.h;
            this.HP = 3;
        }
        update(){
            if(!this.ready) return;
            if(!this.jumping && g_keys.get('z')) this.jump();
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
    const g_ctx = $('<canvas>').appendTo(h).prop({
        width: 550,
        height: 550,
    }).get(0).getContext('2d');
    // ドットを滑らかにしないおまじない
    g_ctx.mozImageSmoothingEnabled = false;
    g_ctx.webkitImageSmoothingEnabled = false;
    g_ctx.msImageSmoothingEnabled = false;
    g_ctx.imageSmoothingEnabled = false;
    let g_nowTime;
    const g_horizonY = g_ctx.canvas.height - 100;
    class map {
        constructor(){
            const m = new Map,
                  zMap = new Map;
            let sorted = [];
        }
    }
    const setZ = (()=>{
        const m = new Map,
              zMap = new Map;
        let sorted = [];
        const set = (v, z = 0) => {
            const zz = z;
            if(zMap.has(z)) z = zMap.get(z);
            while(m.has(z)) z++;
            m.set(z, v);
            zMap.set(zz, z);
            sorted = [...m.keys()].sort();
            return () => m.delete(z);
        };
        const update = () => {
            g_nowTime = performance.now();
            const {width, height} = g_ctx.canvas;
            g_ctx.clearRect(0, 0, width, height);
            for(const z of sorted) m.get(z).update();
            requestAnimationFrame(update);
        };
        update();
        return set;
    })();
    const g_keys = new Map;
    $(window).on('keydown keyup', ({key, type}) => g_keys.set(key, type === 'keydown'));
    const tsukinose = new Player('https://i.imgur.com/orQHJ51.png').goto(300 / 2, 0);
    const kuso = new Enemy('https://i.imgur.com/i3AI9Pw.png');
    kuso.goto(50, g_horizonY - kuso.h);
    window.a = tsukinose;
})();

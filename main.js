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
    const timer = (func, ms) => {
        let id, old = 0;
        const loop = () => {
            const now = performance.now();
            if (ms <= now - old) {
                old = now;
                func();
            }
            id = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    };
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
        goto(x,y){
            this.x = x;
            this.y = y;
            return this;
        }
    }
    class Anime extends Mover {
        constructor(...arg){
            super(...arg);
            this.x = this.y = 16;
            this.anime = 500;
            this._anime = 0;
        }
        update(){
            if(!this.ready) return;
            const {w} = this,
                  ww = w / 2,
                  index = 'wdsa'.indexOf(this.order);
            g_ctx.drawImage(this.img, this._anime++ % this.anime * w, index * w, w, w,
                            this.x - ww, this.y - ww, w, w);
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
            if(!this.jumping && g_keys.get('z')) this.jump();
            if(this.jumpPower) this.y -= this.jumpPower--;
            if(this.y < this.horizon) this.y += this.gravity;
            else this.y = this.horizon;
            if(!this.hide || g_nowTime % 100 < 50) super.update();
        }
        jump(){
            if(this.jumpPower) return;
            this.jumpPower = 100;
            this.anime = 250;
        }
        damage(){
            this.HP--;
            this.hide = true;
            timer(() => {
                this.hide = false;
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
        width: 300,
        height: 300,
    }).get(0).getContext('2d');
    let g_nowTime;
    const g_horizonY = 200;
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
})();

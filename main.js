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
    const h = $("<body>").appendTo("html").css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>").appendTo(h).text("ツキノセラン製作予定地");
    class Mover {
        constructor(url){
            this.img = new Image;
            this.img.src = url;
        }
        setWH(w,h){
            this.w = w;
            this.h = h;
        }
        jump(x,y){
            this.x = x;
            this.y = y;
        }
        move(x,y){
            this.x += x;
            this.y += y;
        }
        draw(ctx){
            ctx.drawImage
        }
    }
    class Anime extends Mover {
        constructor(url){
            super(url);
            this.anime = 0;
        }
        draw(ctx){
            const w = this.w / 2,
                  ww = w / 2,
                  index = 'wdsa'.indexOf(this.order);
            ctx.drawImage(this.img, this.anime % 2 * w, index * w, w, w,
                          this.x - ww, this.y - ww, w, w);
        }
    }
    class Human extends Anime {
    }
    class Teki extends Anime {
        collision(mover){
            const {x,y,w,h} = mover;
            return (this.x - x) ** 2 + (this.y - y) ** 2 <= (this.w/2 + w/2) ** 2;
        }
    }
    const tsukinose = new Human('https://i.imgur.com/orQHJ51.png');
    const ctx = $('<canvas>').appendTo(h).prop({
        width: 500,
        height: 500,
    }).get(0).getContext('2d');
    const drawList = [];
    const update = () => {
        for(const v of drawList) v.draw(ctx);
        requestAnimationFrame(update);
    };
    update();
})();

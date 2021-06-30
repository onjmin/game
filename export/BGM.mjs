export class BGM {
    constructor({id,start,end,auto}){
        this.start = start * 1000;
        this.end = end * 1000;
        const w = SC.Widget($('<iframe>').hide().appendTo('body').attr({
            scrolling: 'no',
            frameborder: 'no',
            playsinline: 1,
            allow: 'autoplay',
            src: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}`
        }).get(0));
        this.w = w;
        if(auto) w.bind(SC.Widget.Events.READY, () => this.play());
        w.bind(SC.Widget.Events.FINISH, () => w.seekTo(0).play());
    }
    play(){
        this.playing = true;
        this.w.play();
    }
    stop(){
        this.playing = false;
        this.w.pause();
    }
    set volume(v){ // 0 ~ 100
        this.w.setVolume(v);
    }
    update(){
        if(!this.playing) return;
        this.w.getPosition(r => {
            if(this.end <= r) this.w.seekTo(this.start);
        });
    }
}

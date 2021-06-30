import {List} from 'https://rpgen3.github.io/game/export/List.mjs';
const layer = new class {
    constructor(){
        this.m = new Map;
        this._m = new Map;
        this.list = new List();
    }
    set(v, z = 0){
        const {m, _m, list} = this,
              zz = z;
        if(_m.has(z)) z = _m.get(z);
        while(m.has(z)) z++;
        m.set(z, v);
        _m.set(zz, z);
        list.add(z);
        return () => {
            m.delete(z);
            list.delete(z);
        };
    }
};

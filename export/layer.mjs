import {SortedList} from 'https://rpgen3.github.io/game/export/SortedList.mjs';
export const layer = new class {
    constructor(){
        this._a = new Map;
        this._b = new Map;
        this._c = new SortedList();
    }
    set(v, z = 0){
        const {_a, _b, _c} = this,
              zz = z;
        if(_b.has(z)) z = _b.get(z);
        while(_a.has(z)) z++;
        _a.set(z, v);
        _b.set(zz, z);
        _c.add(z);
        return () => {
            _a.delete(z);
            _c.delete(z);
        };
    }
    forEach(func){
        this._c.forEach(z => func(this._a.get(z)));
    }
};

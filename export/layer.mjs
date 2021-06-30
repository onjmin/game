export const layer = new class {
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
        this.sort();
        return () => {
            m.delete(z);
            this.sort();
        };
    }
    sort(){
        this.sorted = [...this.m.keys()].sort();
    }
};

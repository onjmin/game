// http://marupeke296.com/COL_2D_No8_QuadTree.html
import {LinkedList} from 'https://rpgen3.github.io/game/export/LinkedList.mjs';
const BitSeparate32 = n => { // ビット分割関数
    n = (n|(n<<8)) & 0x00ff00ff;
    n = (n|(n<<4)) & 0x0f0f0f0f;
    n = (n|(n<<2)) & 0x33333333;
    return (n|(n<<1)) & 0x55555555;
};
const Get2DMortonNumber = ([x, y]) => BitSeparate32(x) | (BitSeparate32(y) << 1); // 2D空間のモートン番号を算出
const calcMostBit = n => { // 最上位ビットの位置
    let i = 0;
    while(n) {
        n >>= 1;
        i++;
    }
    return i;
};
const layerNum = 6,
      splitNum = 2 ** (layerNum - 1); // 縦横の分割数
let g_cv;
const toXY = xy => {
    const ar = [];
    for(let i = 0; i < 2; i++) ar.push(xy[i] / (g_cv[i ? 'h' : 'w'] / splitNum) | 0);
    return ar;
};
const layerFirstIndex = [...new Array(layerNum + 1).keys()].map(i => (4 ** i - 1) / 3);
const toIndex = (wa, sd) => { // 座標からtreeのIndexを計算
    const a = Get2DMortonNumber(toXY(wa)),
          bit = calcMostBit(a ^ Get2DMortonNumber(toXY(sd))),
          L = bit >> 1;
    return (a >> bit) + layerFirstIndex[layerNum - L - 1];
};
const tree = [...new Array(layerFirstIndex[layerNum])].map(() => new LinkedList());
const roadMap = (()=>{
    const ar = [],
          max = layerFirstIndex[layerNum] - 1;
    const recur = index => {
        ar.push(index);
        const idx = (index << 2) + 1;
        if(idx > max) return;
        for(let i = 0; i < 4; i++) recur(idx + i);
        ar.push(index);
    };
    recur(0);
    return ar;
})();
const check = tree => {
    let idx = 0;
    const stack = [],
          idxMax = roadMap.length - 1 - layerNum;
    while(true){
        if(idx > idxMax) break;
        const now = roadMap[idx],
              ar = [],
              list = tree[now];
        if(list.length) list.forEach(v => ar.push(v));
        for(const v of ar){
            for(const w of ar) if(v !== w) v.hit?.(w);
            for(const w of stack) {
                v.hit?.(w);
                w.hit?.(v);
            }
        }
        const next = roadMap[++idx];
        if(now > next) { // 親ノードに戻るとき
            const max = tree[roadMap[idx++]].length;
            for(let i = 0; i < max; i++) stack.pop(); // 親ノードの値をすべて破棄
        }
        else if(now + 1 === next) continue; // 弟ノードへ向かうとき
        else for(let i = 0; i < ar.length; i++) stack.push(ar[i]); // 子ノードへ向かうとき
    }
};
export class Quadtree {
    constructor(value){
        this.list = {value};
        this.index = null;
    }
    set(wa, sd){ // 左上と右下の座標配列
        const idx = toIndex(wa, sd);
        if(this.index === idx) return;
        if(this.index !== null) tree[this.index].delete(this.list);
        if(idx >= 0 && idx < tree.length){
            tree[idx].add(this.list);
            this.index = idx;
        }
        else this.index = null;
    }
    static check(){
        check(tree);
    }
    static setCV(cv){
        g_cv = cv;
    }
}

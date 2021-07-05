export class LinkedList {
    constructor(){
        this.length = 0;
        const first = {},
              last = {prev: first};
        first.next = last;
        this.first = first;
        this.last = last;
    }
    add(obj){
        this.length++;
        const {last} = this,
              {prev} = last;
        last.prev = prev.next = obj;
        obj.prev = prev;
        obj.next = last;
    }
    delete(obj){
        this.length--;
        const {prev, next} = obj;
        prev.next = next;
        next.prev = prev;

    }
    forEach(func){
        let now = this.first;
        while(true){
            const {next} = now;
            if(next === this.last) break;
            else func(next.value);
            now = next;
        }
    }
}

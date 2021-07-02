export class SortedList {
    constructor(){
        const first = {},
              last = {prev: first};
        first.next = last;
        this.first = first;
        this.last = last;
    }
    add(value){
        let now = this.last;
        while(true){
            const {prev} = now;
            if(prev === this.first || prev.value < value) {
                prev.next = now.prev = {value, prev, next: now};
                break;
            }
            now = prev;
        }
    }
    delete(value){
        let now = this.last;
        while(true){
            const {prev} = now;
            if(prev === this.first) break;
            else if(prev.value === value) {
                prev.prev.next = now;
                now.prev = prev.prev;
                break;
            }
            now = prev;
        }
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

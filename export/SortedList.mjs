const undef = void 0;
export class SortedList {
    constructor(){
        this.list = {};
    }
    add(value){
        let now = this.list;
        while(true){
            const {next} = now;
            if(!next) return (now.next = {value});
            else if(next.value > value) return (now.next = {value, next});
            now = next;
        }
    }
    delete(value){
        let now = this.list;
        while(true){
            const {next} = now;
            if(!next) return;
            else if(next.value === value) return (now.next = next.next);
            now = next;
        }
    }
    forEach(func){
        let now = this.list;
        while(true){
            const {next} = now;
            if(!next) return;
            else if(next.value !== undef) func(next.value);
            now = next;
        }
    }
}

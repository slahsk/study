import {Human} from './Human';

class Vacation implements Human{
    private age:number;
    private name : string;
    private destination : string;

    public getAge() {
        return this.age;
    }
    public getName(){
        return this.name;
    }
    

    private constructor(name : string, age : number){
        this.age = age;
        this.name = name;

    }

    public setDestination(destination : string){
        this.destination = destination;
    }
    public getDestination(){
        return this.destination;
    }

    public static go(name : string, age: number):Vacation{
        return new Vacation(name, age);
    }


}



let v = Vacation.go("HJ", 12);
v.setDestination("서울");

console.log(v.getAge());
console.log(v.getName());
console.log(v.getDestination());


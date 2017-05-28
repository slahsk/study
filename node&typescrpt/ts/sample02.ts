class Test{
    aa : string;
    private bb : number = 5;

    constructor(msg : string){
        this.aa = msg;
    }

    getMessage(){
        return this.aa + this.bb;
    }

}

var obj = new Test("aaaaa");

console.log(obj.getMessage());

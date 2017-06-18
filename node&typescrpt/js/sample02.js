var Test = (function () {
    function Test(msg) {
        this.bb = 5;
        this.aa = msg;
    }
    Test.prototype.getMessage = function () {
        return this.aa + this.bb;
    };
    return Test;
}());
var obj = new Test("aaaaa");
console.log(obj.getMessage());

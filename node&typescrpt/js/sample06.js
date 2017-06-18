"use strict";
exports.__esModule = true;
var Vacation = (function () {
    function Vacation(name, age) {
        this.age = age;
        this.name = name;
    }
    Vacation.prototype.getAge = function () {
        return this.age;
    };
    Vacation.prototype.getName = function () {
        return this.name;
    };
    Vacation.prototype.setDestination = function (destination) {
        this.destination = destination;
    };
    Vacation.prototype.getDestination = function () {
        return this.destination;
    };
    Vacation.go = function (name, age) {
        return new Vacation(name, age);
    };
    return Vacation;
}());
var v = Vacation.go("HJ", 12);
v.setDestination("서울");
console.log(v.getAge());
console.log(v.getName());
console.log(v.getDestination());

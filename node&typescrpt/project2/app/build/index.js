"use strict";
exports.__esModule = true;
var Name_1 = require("./module/Name");
var Message_1 = require("./module2/Message");
var nameObj = new Name_1["default"]("HJ");
var messageObj = new Message_1["default"]();
console.log(nameObj.getName() + " " + messageObj.getMessage());

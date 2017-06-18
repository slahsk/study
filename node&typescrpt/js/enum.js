var Direction;
(function (Direction) {
    Direction[1] = "Up";
    Direction["Up"] = 1;
    Direction[2] = "Down";
    Direction["Down"] = 2
    Direction[Direction["Left"] = 3] = "Left";
    Direction[Direction["Right"] = 4] = "Right";
})(Direction || (Direction = {}));

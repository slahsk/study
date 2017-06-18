var mySearch;
mySearch = function (src, sub) {
    var result = src.search(sub);
    return result > -1;
};
var bb = function (aa) {
    //코딩
    var test = aa("aa", "bb");
    //서비스 로직
    //로직
};
bb(function (src, sub) {
    var result = src.search(sub);
    return result > -1;
});
bb(mySearch);

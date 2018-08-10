(function (global) {
    "use strict";

    var Dndne = function () {
        this.sendBox = getDomById("sendBox");
        this.receiveBox = getDomById("receiveBox");
        this.canvas = getDomById("canvas");
        this.tools = getDomById("tools");

        this.alignLeft = getDomById("tool_alignleft");
        this.alignRight = getDomById("tool_alignright");
        this.alignCenter = getDomById("tool_aligncenter");
        this.toolDelete = getDomById("tool_delete");
        this.underline = getDomById("tool_underline");
        this.bold = getDomById("tool_bold");
        this.save = getDomById("tool_save");
        this.fullpage = getDomById("tool_fullpage");
        this.escfull = getDomById("tool_escfull");

        this.origin = getDomById("origin");
        this.reduce = getDomById("reduce");
        this.enlarge = getDomById("enlarge");
        this.scaleNum = getDomById("scaleVal");

        this.pageList = getDomById("page_list");
        this.addPage = getDomById("add_page");

        this.signature = getDomById("signature");

        this.mask = getDomById("pop_mask");
        this.cancel = getDomById("pop_cancel");
        this.popDelete = getDomById("pop_delete");

        //   一些全局的属性
        this.clickData = {}; // 用于保存点击数据
        this.draggy = false; // 为 true 时说明点到了 draggable 元素
        this.dnddy = false; // 为 true 时说明点到了 dndne 元素
        this.pages = []; //用于保存所有页面

    };

    Dndne.prototype = {
        init: function () {},
        // 根据传进来的数据创建 Dndne
        createDndne: function (data) {
            var dndne = document.createElement("div");
            dndne.style.position = "absolute";
            dndne.style.zIndex = 11;
            dndne.style.height = data.height;
            dndne.style.width = data.width;
            dndne.style.color = data.color;
            dndne.style.fontSize = data.fontSize;
            dndne.style.fontFamily = data.fontFamily;
            dndne.style.border = data.border;
            dndne.style.borderRadius = data.borderRadius;
            dndne.style.lineHeight = data.lineHeight;
            dndne.style.textAlign = data.textAlign;
            dndne.innerText = data.innerText;
            dndne.setAttribute("class", "dndne dndne-active");
            return dndne;
        },
        drop: function(e,elem){
            // 不同的场合可能需要修改哦
            var x1 = this.canvas.offsetLeft + this.sendBox.offsetWidth;
            var x2 = x1 + this.canvas.offsetWidth;
            var y1 = this.canvas.offsetTop + this.receiveBox.offsetTop;
            var y2 = y1 + this.canvas.offsetHeight;
            if(e.pageX>x1 && e.pageX<x2 && e.pageY>y1 && e.pageY<y2){
                this.canvas.appendChild(elem);
            }else{
                document.body.removeChild(elem);
            }
        },
        run: function () {
            var _this = this;
            EventListen.addEvent(document, 'mousedown', function (event) {
                var e = event || window.event;
                var target = e.target || e.srcElement;
                var classListStr = target.getAttribute("class");
                if (classListStr.indexOf('draggable') !== -1) {
                    stopDefault(e);
                    _this.draggy = true;
                    // 取到我们想要的css属性并放到一个对象中
                    _this.clickData.height = getCSS(target, 'height');
                    _this.clickData.width = getCSS(target, 'width');
                    _this.clickData.color = getCSS(target, 'color');
                    _this.clickData.fontSize = getCSS(target, 'fontSize');
                    _this.clickData.fontFamily = getCSS(target, 'fontFamily');
                    _this.clickData.border = getCSS(target, 'border');
                    _this.clickData.borderRadius = getCSS(target, 'borderRadius');
                    _this.clickData.lineHeight = getCSS(target, 'lineHeight');
                    _this.clickData.textAlign = getCSS(target, 'textAlign');
                    _this.clickData.innerText = target.innerText;
                    _this.clickData.x = e.offsetX;
                    _this.clickData.y = e.offsetY;
                    var dndne = _this.createDndne(_this.clickData);
                    dndne.style.left = e.pageX - parseInt(_this.clickData.x) + "px";
                    dndne.style.top = e.pageY - parseInt(_this.clickData.y) + "px";
                    document.body.appendChild(dndne);
                }
                if (classListStr.indexOf('dndne') !== -1) {
                    _this.clickData.x = e.offsetX;
                    _this.clickData.y = e.offsetY;
                    target.setAttribute("class", "dndne dndne-current");
                }
                if (target.getAttribute("contenteditable") === true) {

                }
            });
            EventListen.addEvent(document, "mousemove", function (event) {
                var e = event || window.event;
                stopDefault(e);
                var activeDnd = document.querySelectorAll(".dndne-active")[0];
                // var currentDnd = document.querySelectorAll(".dndne-current")[0];
                if (_this.draggy === true) {
                    activeDnd.style.left = e.pageX - parseInt(_this.clickData.x) + "px";
                    activeDnd.style.top = e.pageY - parseInt(_this.clickData.y) + "px";
                }
                // if (dnddy === true && isDragging === true) {
                //     dndneThis.style.left = e.pageX - parseInt(styleObj.x) + "px";
                //     dndneThis.style.top = e.pageY - parseInt(styleObj.y) + "px";
                // }
            });
            EventListen.addEvent(document, 'mouseup', function (event) {
                var e = event || window.event;
                var target = e.target || e.srcElement;
                var classListStr = target.getAttribute("class");
                if (classListStr.indexOf('dndne dndne-active') !== -1) {
                    _this.draggy = false;
                    target.setAttribute("class", "dndne");
                    _this.drop(e,target);
                }
                // if (classListStr.indexOf('dndne dndne-current') !== -1) {
                //     dnddy = false;
                //     target.setAttribute("class", "dndne");
                // }
            });
        }
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = Dndne;

    if (typeof define === 'function') define(function () {
        return Dndne;
    });

    global.Dndne = Dndne;

})(this);
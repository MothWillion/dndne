(function (global) {
    "use strict";
  
    var Dndne = function () {
        this.container = getDomById("dndne_box");
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
  
        this.canvasLeft = this.container.offsetLeft + this.sendBox.offsetWidth + this.canvas.offsetLeft;
        this.canvasTop = this.canvas.offsetTop + this.receiveBox.offsetTop + this.container.offsetTop;
  
        //   一些全局的属性
        this.clickData = {}; // 用于保存点击数据
        this.draggy = false; // 为 true 时说明点到了 draggable 元素
        this.dnddy = false; // 为 true 时说明点到了 dndne 元素
        this.curDndState = {
            editable: false,
            moveable: true,
            locked: false
        };
        this.pages = []; //用于保存所有页面
    };
  
    Dndne.prototype = {
        init: function () {},
        // 根据传进来的数据创建 Dndne
        createDndne: function (data,isSign) {
            var dndne = document.createElement("div");
            dndne.style.position = "absolute";
            dndne.style.zIndex = 11;
            dndne.style.height = data.height;
            dndne.style.width = data.width;
            dndne.style.color = data.color;
            dndne.style.fontSize = data.fontSize;
            dndne.style.fontFamily = data.fontFamily;
            dndne.style.lineHeight = data.lineHeight;
            dndne.style.textAlign = data.textAlign;
            dndne.innerText = data.innerText;
            if(isSign){
                dndne.style.border = data.borderWidth + " " + data.borderStyle + " " + data.borderColor;
                dndne.style.borderRadius = data.borderRadius;
                dndne.setAttribute("class", "dndne dndne-active signature");
            }else{
                dndne.setAttribute("class", "dndne dndne-active");
            }
            return dndne;
        },
        drag: function (e,elem) {
            var xRange = e.pageX - this.clickData.x - this.canvasLeft;
            var yRange = e.pageY - this.clickData.y - this.canvasTop;
            elem.style.left = returnARange(xRange, 0, this.canvas.offsetWidth - elem.offsetWidth) + "px";
            elem.style.top = returnARange(yRange, 0, this.canvas.offsetHeight - elem.offsetHeight) + "px";
        },
        drop: function (e, elem, isFirst) {
            var x1 = this.canvasLeft;
            var x2 = x1 + this.canvas.offsetWidth;
            var y1 = this.canvasTop;
            var y2 = y1 + this.canvas.offsetHeight;
            if (e.pageX > x1 && e.pageX < x2 && e.pageY > y1 && e.pageY < y2) {
                var xRange = e.pageX - this.clickData.x - this.canvasLeft;
                var yRange = e.pageY - this.clickData.y - this.canvasTop;
                if (isFirst) {
                    elem.style.left = xRange + "px";
                    elem.style.top = yRange + "px";
                    this.canvas.appendChild(elem);
                } else {
                    elem.style.left = returnARange(xRange, 0, this.canvas.offsetWidth - elem.offsetWidth) + "px";
                    elem.style.top = returnARange(yRange, 0, this.canvas.offsetHeight - elem.offsetHeight) + "px";
                }
            } else {
                document.body.removeChild(elem);
            }
        },
        run: function () {
            var _this = this;
            EventListen.addEvent(document, 'mousedown', function (event) {
                var e = event || window.event;
                var target = e.target || e.srcElement;
                var classListStr = target.getAttribute("class");
                var dndnes = _this.canvas.querySelectorAll(".dndne-current");
                for(var i=0;i<dndnes.length;i++){
                    dndnes[i].classList.remove('dndne-current');
                }
                if (classListStr.indexOf('draggable') !== -1) {
                    stopDefault(e);
                    _this.draggy = true;
                    // 取到我们想要的css属性并放到一个对象中
                    _this.clickData.height = getCSS(target, 'height');
                    _this.clickData.width = getCSS(target, 'width');
                    _this.clickData.color = getCSS(target, 'color');
                    _this.clickData.fontSize = getCSS(target, 'font-size');
                    _this.clickData.fontFamily = getCSS(target, 'font-family');
                    // border 属性是由上下左右四个值组成的，要分别取（兼容火狐、IE）。由于四边值一样所以取其一
                    _this.clickData.borderRadius = getCSS(target, 'border-top-left-radius');
                    _this.clickData.borderWidth = getCSS(target, 'border-top-width');
                    _this.clickData.borderStyle = getCSS(target, 'border-top-style');
                    _this.clickData.borderColor = getCSS(target, 'border-top-color');
                    _this.clickData.lineHeight = getCSS(target, 'line-height');
                    _this.clickData.textAlign = getCSS(target, 'text-align');
                    _this.clickData.innerText = target.innerText;
                    _this.clickData.x = e.offsetX;
                    _this.clickData.y = e.offsetY;
                    if(classListStr.indexOf('signature') !== -1){
                        var dndne = _this.createDndne(_this.clickData,true);
                    }else{
                        var dndne = _this.createDndne(_this.clickData,false);
                    }
                    dndne.style.left = e.pageX - _this.clickData.x + "px";
                    dndne.style.top = e.pageY - _this.clickData.y + "px";
                    document.body.appendChild(dndne);
                }
                if (classListStr.indexOf('dndne') !== -1) {
                    _this.dnddy = true;
                    var currentDnds = document.querySelectorAll(".dndne-current");
                    for(var i=0;i<currentDnds.length;i++){
                        currentDnds[i].setAttribute("class","dndne");
                    }
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
                var currentDnd = document.querySelectorAll(".dndne-current")[0];
                if (_this.draggy === true) {
                    activeDnd.style.left = e.pageX - _this.clickData.x + "px";
                    activeDnd.style.top = e.pageY - _this.clickData.y + "px";
                }
                if (_this.dnddy === true && _this.curDndState.editable === false) {
                    _this.drag(e,currentDnd);
                }
            });
            EventListen.addEvent(document, 'mouseup', function (event) {
                var e = event || window.event;
                var target = e.target || e.srcElement;
                var classListStr = target.getAttribute("class");
                if (classListStr.indexOf('dndne dndne-active') !== -1) {
                    _this.draggy = false;
                    target.setAttribute("class", "dndne");
                    _this.drop(e, target, true);
                }
                if (classListStr.indexOf('dndne dndne-current') !== -1) {
                    _this.dnddy = false;
                    _this.drop(e, target, false);
                    // target.setAttribute("class", "dndne");
                }
            });
        }
    };
  
    if (typeof module !== 'undefined' && module.exports) module.exports = Dndne;
  
    if (typeof define === 'function') define(function () {
        return Dndne;
    });
  
    global.Dndne = Dndne;
  
  })(this);
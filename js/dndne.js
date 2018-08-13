"document" in self && ("classList" in document.createElement("_") && (!document.createElementNS || "classList" in document.createElementNS("http://www.w3.org/2000/svg", "g")) || ! function (t) {
    "use strict";
    if ("Element" in t) {
        var e = "classList",
            n = "prototype",
            i = t.Element[n],
            s = Object,
            r = String[n].trim || function () {
                return this.replace(/^\s+|\s+$/g, "")
            },
            o = Array[n].indexOf || function (t) {
                for (var e = 0, n = this.length; n > e; e++)
                    if (e in this && this[e] === t) return e;
                return -1
            },
            c = function (t, e) {
                this.name = t, this.code = DOMException[t], this.message = e
            },
            a = function (t, e) {
                if ("" === e) throw new c("SYNTAX_ERR", "The token must not be empty.");
                if (/\s/.test(e)) throw new c("INVALID_CHARACTER_ERR", "The token must not contain space characters.");
                return o.call(t, e)
            },
            l = function (t) {
                for (var e = r.call(t.getAttribute("class") || ""), n = e ? e.split(/\s+/) : [], i = 0, s = n.length; s > i; i++) this.push(n[i]);
                this._updateClassName = function () {
                    t.setAttribute("class", this.toString())
                }
            },
            u = l[n] = [],
            h = function () {
                return new l(this)
            };
        if (c[n] = Error[n], u.item = function (t) {
                return this[t] || null
            }, u.contains = function (t) {
                return ~a(this, t + "")
            }, u.add = function () {
                var t, e = arguments,
                    n = 0,
                    i = e.length,
                    s = !1;
                do t = e[n] + "", ~a(this, t) || (this.push(t), s = !0); while (++n < i);
                s && this._updateClassName()
            }, u.remove = function () {
                var t, e, n = arguments,
                    i = 0,
                    s = n.length,
                    r = !1;
                do
                    for (t = n[i] + "", e = a(this, t); ~e;) this.splice(e, 1), r = !0, e = a(this, t); while (++i < s);
                r && this._updateClassName()
            }, u.toggle = function (t, e) {
                var n = this.contains(t),
                    i = n ? e !== !0 && "remove" : e !== !1 && "add";
                return i && this[i](t), e === !0 || e === !1 ? e : !n
            }, u.replace = function (t, e) {
                var n = a(t + "");
                ~n && (this.splice(n, 1, e), this._updateClassName())
            }, u.toString = function () {
                return this.join(" ")
            }, s.defineProperty) {
            var f = {
                get: h,
                enumerable: !0,
                configurable: !0
            };
            try {
                s.defineProperty(i, e, f)
            } catch (p) {
                void 0 !== p.number && -2146823252 !== p.number || (f.enumerable = !1, s.defineProperty(i, e, f))
            }
        } else s[n].__defineGetter__ && i.__defineGetter__(e, h)
    }
}(self), function () {
    "use strict";
    var t = document.createElement("_");
    if (t.classList.add("c1", "c2"), !t.classList.contains("c2")) {
        var e = function (t) {
            var e = DOMTokenList.prototype[t];
            DOMTokenList.prototype[t] = function (t) {
                var n, i = arguments.length;
                for (n = 0; i > n; n++) t = arguments[n], e.call(this, t)
            }
        };
        e("add"), e("remove")
    }
    if (t.classList.toggle("c3", !1), t.classList.contains("c3")) {
        var n = DOMTokenList.prototype.toggle;
        DOMTokenList.prototype.toggle = function (t, e) {
            return 1 in arguments && !this.contains(t) == !e ? e : n.call(this, t)
        }
    }
    "replace" in document.createElement("_").classList || (DOMTokenList.prototype.replace = function (t, e) {
        var n = this.toString().split(" "),
            i = n.indexOf(t + "");
        ~i && (n = n.slice(i), this.remove.apply(this, n), this.add(e), this.add.apply(this, n.slice(1)))
    }), t = null
}());
(function (global) {
    "use strict";

    var Dndne = function () {
        this.container = this.getDomById("dndne_box");
        this.sendBox = this.getDomById("sendBox");
        this.receiveBox = this.getDomById("receiveBox");
        this.canvas = this.getDomById("canvas");
        this.tools = this.getDomById("tools");

        this.alignLeft = this.getDomById("tool_alignleft");
        this.alignRight = this.getDomById("tool_alignright");
        this.alignCenter = this.getDomById("tool_aligncenter");
        this.toolDelete = this.getDomById("tool_delete");
        this.underline = this.getDomById("tool_underline");
        this.bold = this.getDomById("tool_bold");
        this.save = this.getDomById("tool_save");
        this.fullpage = this.getDomById("tool_fullpage");
        this.escfull = this.getDomById("tool_escfull");

        this.origin = this.getDomById("origin");
        this.reduce = this.getDomById("reduce");
        this.enlarge = this.getDomById("enlarge");
        this.scaleNum = this.getDomById("scaleVal");

        this.pageList = this.getDomById("page_list");
        this.addPage = this.getDomById("add_page");

        this.signature = this.getDomById("signature");

        this.mask = this.getDomById("pop_mask");
        this.cancel = this.getDomById("pop_cancel");
        this.popDelete = this.getDomById("pop_delete");

        this.canvasLeft = this.container.offsetLeft + this.sendBox.offsetWidth + this.canvas.offsetLeft;
        this.canvasTop = this.canvas.offsetTop + this.receiveBox.offsetTop + this.container.offsetTop;

        //   一些全局的属性
        this.canDrag = false; // 初始元素点击能否拖拽的标志位
        this.clickData = {}; // 用于保存点击数据
        this.draggy = false; // 为 true 时说明点到了 draggable 元素
        this.dnddy = false; // 为 true 时说明点到了 dndne 元素
        this.curDndState = {
            editable: false,
            moveable: true,
            locked: false
        };
        this.pages = []; //用于保存所有页面
        this.zIndex = 0;
    };

    Dndne.prototype = {
        init: function (config) {
            this.zIndex = config.zIndex;
        },


        run: function () {
            var _this = this;
            // 为了让业务逻辑更加清晰，具体的判断都封装在函数中了
            this.addEvent(document, 'mousedown', function (event) {
                _this.getDndneData(event);
                _this.creatNewDndne(event, _this.clickData);
            });
            this.addEvent(document, 'mousemove', function (event) {
                _this.newDndneMove(event);
            });
            this.addEvent(document, 'mouseup', function (event) {
                _this.newDndneDrop(event);
                _this.removeActive(event);
            });
        },




        // 1、隐藏目标元素 2、获取点击数据  3、设置拖拽标志位
        getDndneData: function (e) {
            var target = e.target || e.srcElement;
            var isDraggable = target.classList.contains("draggable");
            if (isDraggable) {
                target.classList.add("hide-style");
                this.clickData.height = this.getCSS(target, 'height');
                this.clickData.width = this.getCSS(target, 'width');
                this.clickData.color = this.getCSS(target, 'color');
                this.clickData.fontSize = this.getCSS(target, 'font-size');
                this.clickData.fontFamily = this.getCSS(target, 'font-family');
                this.clickData.innerText = target.innerText;
                this.clickData.borderRadius = this.getCSS(target, 'border-top-left-radius');
                this.clickData.borderWidth = this.getCSS(target, 'border-top-width');
                this.clickData.borderStyle = this.getCSS(target, 'border-top-style');
                this.clickData.borderColor = this.getCSS(target, 'border-top-color');
                this.clickData.lineHeight = this.getCSS(target, 'line-height');
                this.clickData.textAlign = this.getCSS(target, 'text-align');
                this.clickData.x = e.offsetX;
                this.clickData.y = e.offsetY;
                this.canDrag = true;
            }
        },
        creatNewDndne: function (e, data) {
            var target = e.target || e.srcElement;
            var isDraggable = target.classList.contains("draggable");
            var isSign = target.classList.contains("signature");
            if (isDraggable) {
                this.removeActive(e);
                if (isSign) {
                    this.createSign(e, data);
                } else {
                    this.createText(e, data);
                }
            }
        },
        createSign: function (e, data) {
            var signature = document.createElement("div");
            signature.setAttribute("class", "newdndne dndne-sign");
            signature.style.position = "absolute";
            signature.style.boxSizing = "border-box";
            signature.style.zIndex = this.zIndex + 1;
            signature.style.left = e.pageX - this.clickData.x - parseInt(data.borderWidth) + "px";
            signature.style.top = e.pageY - this.clickData.y - parseInt(data.borderWidth) + "px";
            signature.style.width = data.width;
            signature.style.height = data.height;
            signature.style.lineHeight = data.lineHeight;
            signature.style.textAlign = data.textAlign;
            signature.style.color = data.color;
            signature.style.fontSize = data.fontSize;
            signature.style.fontFamily = data.fontFamily;
            signature.style.borderRadius = data.borderRadius;
            signature.style.border = data.borderWidth + " " + data.borderStyle + " " + data.borderColor;
            signature.innerText = data.innerText;
            document.body.appendChild(signature);
        },
        createText: function (e, data) {
            var text = document.createElement("div");
            text.setAttribute("class", "newdndne dndne-text");
            text.style.position = "absolute";
            text.style.boxSizing = "border-box";
            text.style.zIndex = this.zIndex + 1;
            text.style.left = e.pageX - this.clickData.x + "px";
            text.style.top = e.pageY - this.clickData.y + "px";
            text.style.width = data.width;
            text.style.height = data.height;
            text.style.color = data.color;
            text.style.fontSize = data.fontSize;
            text.style.fontFamily = data.fontFamily;
            text.innerText = data.innerText;
            document.body.appendChild(text);
        },
        newDndneMove: function (e) {
            var newdndne = document.querySelector(".newdndne");
            if (this.canDrag) {
                this.clickData.width = newdndne.offsetWidth;
                this.clickData.height = newdndne.offsetHeight;
                newdndne.style.left = e.pageX - this.clickData.x + "px";
                newdndne.style.top = e.pageY - this.clickData.y + "px";
            }
        },
        newDndneDrop: function (e) {
            this.canDrag = false;
            var originDrag = document.querySelector(".hide-style");
            originDrag && originDrag.classList.remove("hide-style");
            var target = e.target || e.srcElement;
            var isNewdndne = target.classList.contains("newdndne");
            var isSign = target.classList.contains("dndne-sign");
            var inCanvas = this.inCanvas(e);
            if (isNewdndne) {
                if (inCanvas) {
                    target.classList.remove("newdndne");
                    if (isSign) {
                        this.creatDndne(target, true);
                    } else {
                        this.creatDndne(target, false);
                    }
                } else {
                    document.body.removeChild(target);
                }
            }
        },
        inCanvas: function (e) {
            var x1 = this.canvasLeft;
            var x2 = x1 + this.canvas.offsetWidth;
            var y1 = this.canvasTop;
            var y2 = y1 + this.canvas.offsetHeight;
            if (e.pageX > x1 && e.pageX < x2 && e.pageY > y1 && e.pageY < y2) {
                return true;
            } else {
                return false;
            }
        },
        creatDndne: function (elem, isSign) {
            var dndne = document.createElement("div");
            dndne.setAttribute("class", "dndne active");
            dndne.style.width = this.clickData.width + "px";
            dndne.style.height = this.clickData.height + "px";
            var t = parseInt(this.getCSS(elem, "top"));
            var l = parseInt(this.getCSS(elem, "left"));
            dndne.style.top = t - this.canvasTop + "px";
            dndne.style.left = l - this.canvasLeft + "px";

            elem.style.top = 0;
            elem.style.left = 0;
            dndne.appendChild(elem);

            var sticktl = document.createElement("div");
            var sticktr = document.createElement("div");
            var stickbl = document.createElement("div");
            var stickbr = document.createElement("div");
            var stickl = document.createElement("div");
            var stickr = document.createElement("div");
            sticktl.setAttribute("class", "stick stick-tl");
            sticktr.setAttribute("class", "stick stick-tr");
            stickbl.setAttribute("class", "stick stick-bl");
            stickbr.setAttribute("class", "stick stick-br");
            stickl.setAttribute("class", "stick stick-l");
            stickr.setAttribute("class", "stick stick-r");

            dndne.appendChild(sticktl);
            dndne.appendChild(sticktr);
            dndne.appendChild(stickbl);
            dndne.appendChild(stickbr);
            if (!isSign) {
                dndne.appendChild(stickl);
                dndne.appendChild(stickr);
            }

            this.canvas.appendChild(dndne);
        },
        removeActive: function (e) {
            var target = e.target || e.srcElement;
            var isActive;
            target.parentNode ? isActive = target.parentNode.classList.contains("active") : isActive = false;
            if (!isActive) {
                var activeDndne = this.canvas.querySelector(".active");
                activeDndne && activeDndne.classList.remove("active");
            }
        },






        // 一些工具函数
        getDomById: function (id) {
            return document.getElementById(id);
        },
        getCSS: function (elem, styl) {
            return elem.currentStyle ? elem.currentStyle[styl] : window.getComputedStyle(elem, null)[styl];
        },
        addEvent: function (node, eventName, handler) {
            if (node.addEventListener) {
                node.addEventListener(eventName, handler);
            } else if (node.attachEvent) {
                node.attachEvent("on" + eventName, handler);
            } else {
                node["on" + eventName] = handler;
            }
        },
        removeEvent: function (node, eventName, handler) {
            if (node.removeEventListener) {
                node.removeEventListener(eventName, handler);
            } else if (node.detachEvent) {
                node.detachEvent("on" + eventName, handler);
            } else {
                node["on" + eventName] = null;
            }
        },
        stopBubble: function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation()
            } else if (window.event) {
                window.event.cancelBubble = true;
            }
        },
        stopDefault: function (e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            return false;
        }
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = Dndne;

    if (typeof define === 'function') define(function () {
        return Dndne;
    });

    global.Dndne = Dndne;

})(this);
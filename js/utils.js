// 绑定事件的兼容方案
var EventListen = {
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
    }
};
// 简化 execCommand 函数
function dndneCommand(cmd, val) {
    document.execCommand(cmd, false, val);
}
// 简化 getElementById 函数
function getDomById(id) {
    return document.getElementById(id);
}
// 阻止事件冒泡
function stopBubble(event) {
    var e = event || window.event;
    if (e && e.stopPropagation) {
        e.stopPropagation()
    } else if (window.event) {
        window.event.cancelBubble = true;
    }
}
// 阻止默认行为
function stopDefault(event) {
    var e = event || window.event;
    if (e && e.preventDefault) {
        e.preventDefault();
    } else {
        window.event.returnValue = false;
    }
    // return false;
}
// 获取元素css属性的方法
function getCSS(elem, styl) {
    return window.getComputedStyle(elem, null)[styl] || elem.currentStyle[styl];
}
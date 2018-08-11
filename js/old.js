function stopBubble(e) {
  var e = e || window.event;
  if (e && e.stopPropagation) {
      e.stopPropagation()
  } else if (window.event) {
      window.event.cancelBubble = true;
  }
}

function stopDefault(e) {
  var e = e || window.event;
  if (e && e.preventDefault) {
      e.preventDefault();
  } else {
      window.event.returnValue = false;
  }
  return false;
}

function selectText(element) {
  var text = element;
  if (document.body.createTextRange) {
      var range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select();
  } else if (window.getSelection) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
  } else {
      alert("none");
  }
}

function insertAfter(newElement, targentElement) {
  var parent = targentElement.parentNode;
  if (parent.lastChild == targentElement) {
      parent.appendChild(newElement);
  } else {
      parent.insertBefore(newElement, targentElement.nextSibling)
  }
}

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
(function (global) {
  "use strict";

  var Dndne = function () {
      this.container = document.getElementById("dndne_box");
      this.dndneElemList = document.querySelectorAll(".dndne");
      this.sendBox = document.getElementById("sendBox");
      this.receiveBox = document.getElementById("receiveBox");
      this.canvas = document.getElementById("canvas");
      this.tools = document.getElementById("tools");
      this.alignLeft = document.getElementById("tool_alignleft");
      this.alignRight = document.getElementById("tool_alignright");
      this.alignCenter = document.getElementById("tool_aligncenter");
      this.toolDelete = document.getElementById("tool_delete");
      this.underline = document.getElementById("tool_underline");
      this.bold = document.getElementById("tool_bold");
      this.save = document.getElementById("tool_save");
      this.fullpage = document.getElementById("tool_fullpage");
      this.escfull = document.getElementById("tool_escfull");
      this.origin = document.getElementById("origin");
      this.reduce = document.getElementById("reduce");
      this.enlarge = document.getElementById("enlarge");
      this.scaleNum = document.getElementById("scaleVal");
      this.pageList = document.getElementById("page_list");
      this.addPage = document.getElementById("add_page");
      this.signature = document.getElementById("signature");
      this.mask = document.getElementById("pop_mask");
      this.cancel = document.getElementById("pop_cancel");
      this.popDelete = document.getElementById("pop_delete");
      this.vdomData = {};
      this.domData = {};
      this.scaleVal = 10;
      this.activeUtils = {};
      this.activeNum = 0;
      this.userSelection = null;
      this.pages = [];
      this.returnPages = [];
  };

  Dndne.prototype = {
      init: function () {
          var _this = this;
          this.vdomEvent();
          this.cookieShow();
          this.addNewPage();
          this.copyPage();
          this.deletePage();
          this.bindScale();
          EventListen.addEvent(_this.save, "click", function () {
              _this.savePage();
          });
          EventListen.addEvent(_this.fullpage, "click", function () {
              _this.container.style.position = "fixed";
              _this.container.style.left = 0;
              _this.container.style.top = 0;
              _this.container.style.width = "100%";
              _this.container.style.zIndex = 10002;
              _this.container.style.height = "100%";
              this.style.display = "none";
              _this.escfull.style.display = "block";
              document.body.style.overflow = "hidden";
          });
          EventListen.addEvent(this.escfull, "click", function () {
              this.style.display = "none";
              _this.fullpage.style.display = "block";
              _this.container.style.position = "relative";
              _this.container.style.height = "940px";
              document.body.style.overflow = "auto";
          });
      },
      vdomEvent: function () {
          var _this = this;
          var drag = document.querySelectorAll(".draggable");
          for (var i = 0; i < drag.length; i++) {
              EventListen.addEvent(drag[i], "mousedown", function () {
                  stopBubble();
                  stopDefault();
                  var _elem = this;
                  _this.getXY(_elem, _this.sendBox, 1);
                  _this.getAttr(_elem, 1);
                  var vdom = _this.render("vdom", _elem);
                  _elem.style.opacity = 0;
                  _this.removeUtils();
                  _this.removeEmptySpan();
                  _this.activeNum = 0;
                  _this.activeUtils = {};
                  _this.render("tools");
                  var doms = _this.getDom();
                  for (var k = 0; k < doms.length; k++) {
                      _this.normalState(doms[k]);
                  }

                  function _move() {
                      _this.move(vdom, _this.sendBox, 1);
                  }
                  EventListen.addEvent(document, "mousemove", _move);
                  EventListen.addEvent(vdom, "mouseup", function () {
                      if (_this.showDom(_elem, this)) {
                          if (this.getAttribute("signature") == "yes") {
                              var elem = _this.render("dom", vdom);
                              elem.setAttribute("active", "yes");
                              _this.render("tools");
                              _this.bindTools(elem);
                              _this.domEvent();
                          } else {
                              var elem = _this.render("dom", vdom);
                              _this.removeUtils();
                              _this.render("utils", elem);
                              elem.setAttribute("active", "yes");
                              _this.bindChange(elem);
                              _this.render("tools");
                              _this.bindTools(elem);
                              _this.domEvent();
                              elem.style.border = "1px dashed #7f7f7f";
                          }
                      }
                      EventListen.removeEvent(document, "mousemove", _move);
                  });
              });
              EventListen.addEvent(drag[i], "mouseup", function () {
                  stopBubble();
              });
          }
          EventListen.addEvent(this.tools, "mousedown", function () {
              stopBubble();
          });
      },
      domEvent: function () {
          var _this = this;
          var doms = this.getDom();
          for (var j = 0; j < doms.length; j++) {
              EventListen.addEvent(doms[j], "mousedown", function () {
                  stopBubble();
                  var _elem = this;
                  if (_elem.getAttribute("signature") == "yes") {
                      _this.getXY(_elem, _this.canvas, 2);
                      _this.removeUtils();
                      _elem.setAttribute("active", "yes");
                      _this.render("tools");
                      _this.bindTools(_elem);
                  } else {
                      if (_elem.getAttribute("active") == "no") {
                          _this.normalState(_elem);
                      }
                      _this.getXY(_elem, _this.canvas, 2);
                      _this.removeUtils();
                      _this.removeEmptySpan();
                      _this.render("utils", _elem);
                      _elem.setAttribute("active", "yes");
                      _this.bindChange(_elem);
                      _this.render("tools");
                      _this.bindTools(_elem);
                  }

                  function _move() {
                      if (_elem.getAttribute("signature") == "yes") {
                          _this.removeUtils();
                          _elem.style.border = "2px dashed red";
                          _this.move(_elem, _this.canvas, 2);
                      } else {
                          _this.removeUtils();
                          _elem.style.border = "1px dashed #7f7f7f";
                          _this.move(_elem, _this.canvas, 2);
                      }
                  }
                  EventListen.addEvent(document, "mousemove", _move);
                  EventListen.addEvent(_elem, "mouseup", function () {
                      if (_elem.getAttribute("signature") == "yes") {
                          _this.removeUtils();
                          _elem.setAttribute("active", "yes");
                          EventListen.removeEvent(document, "mousemove", _move);
                      } else {
                          _this.removeUtils();
                          _elem.setAttribute("active", "yes");
                          _this.render("utils", _elem);
                          _this.bindChange(_elem);
                          EventListen.removeEvent(document, "mousemove", _move);
                      }
                  });
              });
              EventListen.addEvent(doms[j], "dblclick", function () {
                  if (this.getAttribute("signature") == "yes") {
                      stopBubble();
                      stopDefault();
                  } else {
                      stopBubble();
                      _this.autoUtils(this);
                      _this.editState(this);
                      selectText(this);
                  }
              });
              EventListen.addEvent(doms[j], "blur", function () {
                  window.onerror = function () {
                      return true;
                  }
                  if (this.innerText == "") {
                      _this.canvas.removeChild(this);
                  }
              });
              EventListen.addEvent(doms[j], "click", function () {
                  stopBubble();
                  var userSelection;
                  if (window.getSelection) {
                      userSelection = window.getSelection();
                  } else if (document.selection) {
                      document.selection.createRange().removeAllRanges();
                      userSelection = document.selection.createRange();
                  }
                  _this.userSelection = userSelection;
              });
          }
          EventListen.addEvent(document, "mousedown", function () {
              stopBubble();
              // stopDefault();
              _this.activeNum = 0;
              var doms = _this.getDom();
              for (var j = 0; j < doms.length; j++) {
                  doms[j].setAttribute("active", "no");
                  _this.render("tools");
                  doms[j].setAttribute("moveable", "yes");
                  doms[j].setAttribute("contenteditable", false);
                  _this.removeUtils();
                  _this.normalState(doms[j]);
              }
              _this.removeEmptySpan();
          });
      },
      render: function (component, elem) {
          var _this = this;
          if (component == "vdom") {
              var e = e || window.event;
              var vdom = document.createElement("div");
              if (elem.id == "signature") {
                  vdom.style.position = "absolute";
                  vdom.style.left = (e.pageX || e.clientX) - this.sendBox.offsetLeft - this.vdomData.x + "px";
                  vdom.style.top = (e.pageY || e.clientY) - this.vdomData.y + "px";
                  vdom.style.zIndex = 10003;
                  vdom.innerText = this.vdomData.innerText;
                  vdom.style.fontSize = this.vdomData.fontSize;
                  vdom.style.color = this.vdomData.color;
                  vdom.style.fontWeight = this.vdomData.fontWeight;
                  vdom.style.width = this.vdomData.width;
                  vdom.style.height = this.vdomData.height;
                  vdom.style.lineHeight = this.vdomData.lineHeight;
                  vdom.style.border = this.vdomData.border;
                  vdom.style.borderRadius = this.vdomData.borderRadius;
                  vdom.style.textAlign = this.vdomData.textAlign;
                  vdom.setAttribute("signature", "yes");
              } else {
                  vdom.style.position = "absolute";
                  vdom.style.left = (e.pageX || e.clientX) - this.sendBox.offsetLeft - this.vdomData.x + "px";
                  vdom.style.top = (e.pageY || e.clientY) - this.vdomData.y + "px";
                  vdom.style.zIndex = 10003;
                  vdom.innerText = this.vdomData.innerText;
                  vdom.style.fontSize = this.vdomData.fontSize;
                  vdom.style.color = this.vdomData.color;
                  vdom.style.fontWeight = this.vdomData.fontWeight;
                  vdom.style.width = this.vdomData.width;
                  vdom.style.lineHeight = this.vdomData.lineHeight;
              }
              vdom.style.cursor = "move";
              document.body.appendChild(vdom);
              return vdom;
          } else if (component == "dom") {
              var e = e || window.event;
              var dom = document.createElement("div");
              dom.style.position = "absolute";
              dom.style.left = ((e.pageX || e.clientX) - this.sendBox.offsetLeft - this.sendBox.offsetWidth - this.container.offsetLeft - this.canvas.offsetLeft - (this.vdomData.x * this.scaleVal / 10) - (this.canvas.offsetWidth * (1 - this.scaleVal / 10) / 2)) / (this.scaleVal / 10) + "px";
              dom.style.top = ((e.pageY || e.clientY) - this.canvas.offsetTop - this.container.offsetTop - (this.vdomData.y * this.scaleVal / 10) - (this.canvas.offsetHeight * (1 - this.scaleVal / 10) / 2)) / (this.scaleVal / 10) + "px";
              dom.style.zIndex = 10003;
              if (elem.getAttribute("signature") == "yes") {
                  dom.style.height = this.vdomData.height;
                  dom.style.lineHeight = this.vdomData.lineHeight;
                  dom.style.border = this.vdomData.border;
                  dom.style.borderRadius = this.vdomData.borderRadius;
                  dom.innerText = this.vdomData.innerText;
                  dom.style.fontSize = this.vdomData.fontSize;
                  dom.style.color = this.vdomData.color;
                  dom.style.fontWeight = this.vdomData.fontWeight;
                  dom.style.width = this.vdomData.width;
                  dom.style.textAlign = "center";
                  dom.style.cursor = "move";
                  dom.style.textDecoration = "none";
                  dom.style.zIndex = 10100;
                  dom.setAttribute("moveable", "yes");
                  dom.setAttribute("active", "yes");
                  dom.setAttribute("signature", "yes");
                  dom.setAttribute("class", "dom signature");
              } else {
                  dom.innerText = this.vdomData.innerText;
                  dom.style.fontSize = this.vdomData.fontSize;
                  dom.style.color = this.vdomData.color;
                  dom.style.fontWeight = this.vdomData.fontWeight;
                  dom.style.width = this.vdomData.width;
                  dom.style.lineHeight = this.vdomData.lineHeight;
                  dom.style.textAlign = "center";
                  dom.style.cursor = "move";
                  dom.style.textDecoration = "none";
                  dom.setAttribute("class", "dom");
                  dom.setAttribute("contenteditable", false);
                  dom.setAttribute("moveable", "yes");
                  dom.setAttribute("active", "yes");
              }
              this.canvas.appendChild(dom);
              return dom;
          } else if (component == "utils") {
              var oLeft, oRight;
              if (_this.activeUtils.oLeft && elem.getAttribute("active") == "yes") {
                  oLeft = _this.activeUtils.oLeft;
                  oRight = _this.activeUtils.oRight;
              } else {
                  oLeft = document.createElement("div");
                  oRight = document.createElement("div");
                  _this.activeUtils.oLeft = oLeft;
                  _this.activeUtils.oRight = oRight;
              }
              oLeft.setAttribute("class", "util");
              oLeft.setAttribute("title", "拉伸");
              oRight.setAttribute("class", "util");
              oRight.setAttribute("title", "拉伸");
              oLeft.style.cursor = "w-resize";
              oRight.style.cursor = "e-resize";
              oLeft.style.left = elem.offsetLeft - 6 + "px";
              oLeft.style.top = elem.offsetTop + elem.offsetHeight / 2 - 6 + "px";
              oRight.style.left = elem.offsetLeft + elem.offsetWidth - 6 + "px";
              oRight.style.top = elem.offsetTop + elem.offsetHeight / 2 - 6 + "px";
              elem.style.border = "1px dashed #7f7f7f";
              _this.canvas.appendChild(oLeft);
              _this.canvas.appendChild(oRight);
          }
      },
      getXY: function (elem, parent, type) {
          var e = e || window.event;
          if (type == 1) {
              var x = (e.pageX || e.clientX) - parent.offsetLeft - elem.offsetLeft - this.container.offsetLeft;
              var y = (e.pageY || e.clientY) - parent.offsetTop - elem.offsetTop - this.container.offsetTop;
              this.vdomData.x = x;
              this.vdomData.y = y;
          } else if (type == 2) {
              var x = (e.pageX || e.clientX) - parent.offsetLeft - elem.offsetLeft - this.sendBox.offsetWidth - this.container.offsetLeft;
              var y = (e.pageY || e.clientY) - parent.offsetTop - elem.offsetTop - this.container.offsetTop;
              this.domData.x = x;
              this.domData.y = y;
          }
      },
      getAttr: function (elem, type) {
          if (type == 1) {
              if (elem.id == "signature") {
                  this.vdomData.height = window.getComputedStyle(elem).height || elem.currentStyle['height'];
                  this.vdomData.lineHeight = window.getComputedStyle(elem).lineHeight || elem.currentStyle['line-height'];
                  this.vdomData.border = "2px dashed red";
                  this.vdomData.borderRadius = "60px";
                  this.vdomData.textAlign = window.getComputedStyle(elem).textAlign || elem.currentStyle['text-align'];
                  this.vdomData.width = window.getComputedStyle(elem).width || elem.currentStyle['width'];
                  this.vdomData.fontSize = window.getComputedStyle(elem).fontSize || elem.currentStyle['font-size'];
                  this.vdomData.color = window.getComputedStyle(elem).color || elem.currentStyle['color'];
                  this.vdomData.fontWeight = window.getComputedStyle(elem).fontWeight || elem.currentStyle['font-weight'];
                  this.vdomData.innerText = elem.innerText;
              } else {
                  this.vdomData.lineHeight = window.getComputedStyle(elem).lineHeight || elem.currentStyle['line-height'];
                  this.vdomData.width = window.getComputedStyle(elem).width || elem.currentStyle['width'];
                  this.vdomData.fontSize = window.getComputedStyle(elem).fontSize || elem.currentStyle['font-size'];
                  this.vdomData.color = window.getComputedStyle(elem).color || elem.currentStyle['color'];
                  this.vdomData.fontWeight = window.getComputedStyle(elem).fontWeight || elem.currentStyle['font-weight'];
                  this.vdomData.innerText = elem.innerText;
              }
          } else if (type == 2) {
              this.domData.lineHeight = window.getComputedStyle(elem).lineHeight || elem.currentStyle['line-height'];
              this.domData.width = window.getComputedStyle(elem).width || elem.currentStyle['width'];
              this.domData.fontSize = window.getComputedStyle(elem).fontSize || elem.currentStyle['font-size'];
              this.domData.color = window.getComputedStyle(elem).color || elem.currentStyle['color'];
              this.domData.fontWeight = window.getComputedStyle(elem).fontWeight || elem.currentStyle['font-weight'];
              this.domData.innerText = elem.innerText;
          }
      },
      move: function (elem, parent, type) {
          var e = e || window.event;
          if (type == 1) {
              stopDefault();
              elem.style.left = (e.pageX || e.clientX) - parent.offsetLeft - this.vdomData.x + "px";
              elem.style.top = (e.pageY || e.clientY) - parent.offsetTop - this.vdomData.y + "px";
          } else if (type == 2 && elem.getAttribute("moveable") == "yes") {
              stopDefault();
              elem.style.left = (e.pageX || e.clientX) - parent.offsetLeft - this.domData.x - this.sendBox.offsetWidth - this.container.offsetLeft + "px";
              elem.style.top = (e.pageY || e.clientY) - parent.offsetTop - this.domData.y - this.container.offsetTop + "px";
          }
      },
      showDom: function (elem, vdom) {
          var e = e || window.event;
          var x1 = (e.pageX || e.clientX) - this.canvas.offsetLeft - this.sendBox.offsetWidth - this.container.offsetLeft;
          var x2 = this.canvas.offsetWidth;
          var y1 = (e.pageY || e.clientY) - this.canvas.offsetTop - this.container.offsetTop;
          var y2 = this.canvas.offsetHeight;
          var x1s = x2 * (1 - this.scaleVal / 10) / 2;
          var x2s = x2 * this.scaleVal / 10 + x2 * (1 - this.scaleVal / 10) / 2;
          var y1s = y2 * (1 - this.scaleVal / 10) / 2;
          var y2s = y2 * this.scaleVal / 10 + y2 * (1 - this.scaleVal / 10) / 2;
          elem.style.opacity = 1;
          document.body.removeChild(vdom);
          if (x1 > x1s && x1 < x2s && y1 > y1s && y1 < y2s) {
              return true;
          }
      },
      getDom: function () {
          var doms = document.querySelectorAll(".dom");
          return doms;
      },
      removeUtils: function () {
          var utils = document.querySelectorAll(".util");
          var doms = this.getDom();
          window.onerror = function () {
              return true;
          }
          for (var i = 0; i < utils.length; i++) {
              this.canvas.removeChild(utils[i]);
          }
          for (var m = 0; m < doms.length; m++) {
              doms[m].style.border = "1px dashed transparent";
              doms[m].setAttribute("active", "no");
          }
      },
      autoUtils: function (elem) {
          var _this = this;
          elem.oninput = function OnInput() {
              _this.removeUtils();
              _this.render("utils", elem);
              elem.setAttribute("active", "yes");
          }
          elem.onpropertychange = function OnPropChanged() {
              _this.removeUtils();
              _this.render("utils", elem);
              elem.setAttribute("active", "yes");
          }
      },
      bindChange: function (elem) {
          var _this = this;
          EventListen.addEvent(_this.activeUtils.oLeft, "mousedown", function () {
              stopBubble();
              var util = this;
              _this.editState(elem);
              elem.setAttribute("active", "yes");
              _this.activeNum = 1;

              function _changeL() {
                  stopBubble();
                  stopDefault();
                  var e = e || window.event;
                  var x = (e.pageX || e.clientX) - _this.canvas.offsetLeft - _this.sendBox.offsetWidth - _this.container.offsetLeft;
                  var w = _this.container.offsetLeft + parseInt(elem.offsetLeft) + parseInt(elem.style.width) + _this.canvas.offsetLeft + _this.sendBox.offsetWidth - (e.pageX || e.clientX) > 20 ? _this.container.offsetLeft + parseInt(elem.offsetLeft) + parseInt(elem.style.width) + _this.canvas.offsetLeft + _this.sendBox.offsetWidth - (e.pageX || e.clientX) : 20;
                  elem.style.width = w + "px";
                  elem.style.left = x + "px";
                  util.style.left = x - util.offsetWidth / 2 + "px";
                  _this.removeUtils();
                  elem.setAttribute("active", "yes");
                  _this.render("utils", elem);
              }
              EventListen.addEvent(document, "mousemove", _changeL)
              EventListen.addEvent(document, "mouseup", function () {
                  _this.bindTools(elem);
                  EventListen.removeEvent(document, "mousemove", _changeL)
              })
          })
          EventListen.addEvent(_this.activeUtils.oRight, "mousedown", function () {
              stopBubble();
              var util = this;
              _this.editState(elem);
              elem.setAttribute("active", "yes");
              _this.activeNum = 1;

              function _changeR() {
                  stopBubble();
                  stopDefault();
                  var e = e || window.event;
                  var x = (e.pageX || e.clientX) - _this.canvas.offsetLeft - _this.sendBox.offsetWidth - _this.container.offsetLeft;
                  var w = x - elem.offsetLeft > 20 ? x - elem.offsetLeft : 20;
                  elem.style.width = w + "px";
                  elem.style.left = elem.offsetLeft + "px";
                  util.style.left = elem.offsetLeft + w - util.offsetWidth / 2 + "px";
                  _this.removeUtils();
                  elem.setAttribute("active", "yes");
                  _this.render("utils", elem);
              }
              EventListen.addEvent(document, "mousemove", _changeR)
              EventListen.addEvent(document, "mouseup", function () {
                  _this.bindTools(elem);
                  EventListen.removeEvent(document, "mousemove", _changeR)
              })
          })

      },
      bindTools: function (elem) {
          var _this = this;
          EventListen.addEvent(this.alignLeft, "mousedown", function () {
              if (elem.getAttribute("active") == "yes" && elem.getAttribute("signature") !== "yes") {
                  stopBubble();
                  elem.style.textAlign = "left";
              }
          });
          EventListen.addEvent(this.alignCenter, "mousedown", function () {
              if (elem.getAttribute("active") == "yes" && elem.getAttribute("signature") !== "yes") {
                  stopBubble();
                  elem.style.textAlign = "center";
              }
          });
          EventListen.addEvent(this.alignRight, "mousedown", function () {
              if (elem.getAttribute("active") == "yes" && elem.getAttribute("signature") !== "yes") {
                  stopBubble();
                  elem.style.textAlign = "right";
              }
          });
          EventListen.addEvent(this.toolDelete, "mousedown", function () {
              if (elem.getAttribute("active") == "yes") {
                  stopBubble();
                  _this.canvas.removeChild(elem);
                  _this.removeUtils();
                  _this.render("tools");
              }
          });
          EventListen.addEvent(this.bold, "mousedown", function () {
              if (elem.getAttribute("active") == "yes" && elem.getAttribute("signature") !== "yes") {
                  stopBubble();
                  if (_this.userSelection) {
                      var range = _this.userSelection.getRangeAt(0);
                      var txt = range.extractContents().textContent;
                      var span = document.createElement("span");
                      span.style.fontWeight = "bold";
                      span.innerText = txt;
                      range.insertNode(span);
                  } else {
                      elem.style.fontWeight = "bold";
                  }
              }
          });
          EventListen.addEvent(this.underline, "mousedown", function () {
              if (elem.getAttribute("active") == "yes" && elem.getAttribute("signature") !== "yes") {
                  stopBubble();
                  if (_this.userSelection) {
                      var range = _this.userSelection.getRangeAt(0);
                      var txt = range.extractContents().textContent;
                      var span = document.createElement("span");
                      span.style.textDecoration = "underline";
                      span.innerText = txt;
                      range.insertNode(span);
                  } else {
                      elem.style.textDecoration = "underline";
                  }
              }
          });
      },
      bindScale: function () {
          var _this = this;
          EventListen.addEvent(this.origin, "mousedown", function () {
              stopBubble();
              stopDefault();
              _this.scaleVal = 10;
              _this.scaleNum.innerText = _this.scaleVal * 10 + "%";
              _this.canvas.style.transform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.webkitTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.mozTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.msTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.oTransform = "scale(" + _this.scaleVal / 10 + ")";
          });
          EventListen.addEvent(this.reduce, "mousedown", function () {
              stopBubble();
              stopDefault();
              if (_this.scaleVal > 5) {
                  _this.scaleVal -= 1;
              }
              _this.scaleNum.innerText = _this.scaleVal * 10 + "%";
              _this.canvas.style.transform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.webkitTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.mozTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.msTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.oTransform = "scale(" + _this.scaleVal / 10 + ")";
          });
          EventListen.addEvent(this.enlarge, "mousedown", function () {
              stopBubble();
              stopDefault();
              if (_this.scaleVal < 12) {
                  _this.scaleVal += 1;
              }
              _this.scaleNum.innerText = _this.scaleVal * 10 + "%";
              _this.canvas.style.transform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.webkitTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.mozTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.msTransform = "scale(" + _this.scaleVal / 10 + ")";
              _this.canvas.style.oTransform = "scale(" + _this.scaleVal / 10 + ")";
          });
      },
      editState: function (elem) {
          elem.style.zIndex = 10101;
          elem.style.backgroundColor = "inherit";
          elem.style.outline = "none";
          elem.style.cursor = "text";
          elem.setAttribute("contenteditable", true);
          elem.setAttribute("moveable", "no");
          elem.setAttribute("active", "yes");
      },
      normalState: function (elem) {
          elem.style.zIndex = 10003;
          elem.style.backgroundColor = "transparent";
          elem.style.cursor = "move";
          elem.setAttribute("contenteditable", false);
          elem.setAttribute("moveable", "yes");
          elem.setAttribute("active", "yes");
      },
      removeEmptySpan: function () {
          var spans = this.canvas.getElementsByTagName("span");
          for (var i = 0; i < spans.length; i++) {
              if (spans[i].innerText == "") {
                  spans[i].parentNode.removeChild(spans[i]);
              }
          }
      },
      savePage: function () {
          var active = document.querySelectorAll(".active")[0].querySelectorAll(".min-page")[0];
          var _this = this;
          _this.removeUtils();
          _this.pages = [];
          _this.pages.push(_this.canvas.innerHTML);
          var vcanvas = document.createElement("div");
          vcanvas.innerHTML = _this.pages[0];
          vcanvas.style.transform = "scale(0.2353)";
          vcanvas.setAttribute("class", "page-boxes");
          window.sessionStorage.setItem(active.id, JSON.stringify(vcanvas.innerHTML));
          active.innerHTML = "";
          var pages = _this.pageList.innerHTML;
          window.sessionStorage.setItem("page_list", JSON.stringify(pages));
          _this.showPages();
          active.appendChild(vcanvas);
      },
      addNewPage: function () {
          var _this = this;
          EventListen.addEvent(this.addPage, "click", function () {
              var active = document.querySelectorAll(".active")[0].querySelectorAll(".min-page")[0];
              var activeId = active.id.slice(4, active.id.length);
              _this.canvas.innerHTML = "";
              activeId = Math.floor(Math.random(0, 1) * 10000);
              var pageItems = document.querySelectorAll(".page-item");
              for (var i = 0; i < pageItems.length; i++) {
                  pageItems[i].setAttribute("class", "page-item");
              }
              var pageItem = document.createElement("li");
              pageItem.setAttribute("class", "page-item active");
              _this.pageList.appendChild(pageItem);
              var minPage = document.createElement("div");
              minPage.setAttribute("class", "min-page");
              minPage.setAttribute("id", "page" + activeId);
              pageItem.appendChild(minPage);
              var pageMask = document.createElement("div");
              pageMask.setAttribute("class", "page-mask");
              pageMask.innerText = "正在编辑此页";
              pageItem.appendChild(pageMask);
              var pageCopy = document.createElement("div");
              pageCopy.setAttribute("class", "page-copy");
              pageCopy.setAttribute("title", "复制此页");
              pageItem.appendChild(pageCopy);
              var pageDelete = document.createElement("div");
              pageDelete.setAttribute("class", "page-delete");
              pageDelete.setAttribute("title", "删除此页");
              pageItem.appendChild(pageDelete);
              var pageNum = document.createElement("div");
              pageNum.setAttribute("class", "page-num");
              pageNum.innerText = document.querySelectorAll(".min-page").length;
              pageItem.appendChild(pageNum);
              window.sessionStorage.setItem("page" + activeId, JSON.stringify(" "));
              _this.pageList.scrollTop = _this.pageList.scrollHeight;
              _this.savePage();
          });
      },
      showPages: function () {
          var _this = this;
          var masks = document.querySelectorAll(".page-mask");
          for (var i = 0; i < masks.length; i++) {
              EventListen.addEvent(masks[i], "mousedown", function (event) {
                  var event = event || window.event;
                  var target = event.target || event.srcElement;
                  var pageItems = document.querySelectorAll(".page-item");
                  for (var j = 0; j < pageItems.length; j++) {
                      pageItems[j].setAttribute("class", "page-item");
                  }
                  target.parentNode.setAttribute("class", "page-item active");
                  var active = document.querySelectorAll(".active")[0].querySelectorAll(".min-page")[0];
                  _this.canvas.innerHTML = JSON.parse(window.sessionStorage.getItem(active.id));
                  _this.domEvent();
              });
          }
      },
      cookieShow: function () {
          if (window.sessionStorage.getItem("page_list")) {
              this.pageList.innerHTML = JSON.parse(window.sessionStorage.getItem("page_list"));
              var activePage = document.querySelectorAll(".active")[0].querySelectorAll(".min-page")[0];
              this.canvas.innerHTML = JSON.parse(window.sessionStorage.getItem(activePage.id));
              var vcanvas = document.createElement("div");
              vcanvas.innerHTML = this.canvas.innerHTML;
              vcanvas.style.transform = "scale(0.2353)";
              vcanvas.setAttribute("class", "page-boxes");
              activePage.appendChild(vcanvas);
              // this.domEvent();
          }
      },
      copyPage: function () {
          var _this = this;
          EventListen.addEvent(_this.pageList, "click", function (event) {
              var e = event || window.event;
              var target = e.target || e.srcElement;
              if (target.getAttribute("class") == "page-copy") {
                  var copyingLi = target.parentNode;
                  console.log(copyingLi);
                  var newLi = document.createElement("li");
                  newLi.setAttribute("class", "page-item");
                  newLi.innerHTML = copyingLi.innerHTML;
                  insertAfter(newLi, copyingLi);
                  var minPage = newLi.querySelectorAll(".min-page")[0];
                  var copy_Page = copyingLi.querySelectorAll(".min-page")[0];
                  var copyPageId = "page" + Math.floor(Math.random(0, 1) * 10000);
                  minPage.id = copyPageId;
                  var box = document.getElementById(minPage.id).querySelectorAll(".page-boxes")[0];
                  var checkCode = box.querySelectorAll(".check-code")[0];
                  if (_this.isPage1(copy_Page.id) == true) {
                      box.removeChild(checkCode);
                  }
                  window.sessionStorage.setItem(minPage.id, JSON.stringify(box.innerHTML));
                  var pageNums = document.querySelectorAll(".page-num");
                  for (var n = 0; n < pageNums.length; n++) {
                      pageNums[n].innerText = n + 1;
                  }
                  var pages = _this.pageList.innerHTML;
                  window.sessionStorage.setItem("page_list", JSON.stringify(pages));
                  _this.showPages();
                  _this.savePage();
              }
          });
      },
      deletePage: function () {
          var _this = this;
          EventListen.addEvent(_this.pageList, "click", function (event) {
              var e = event || window.event;
              var target = e.target || e.srcElement;
              if (target.getAttribute("class") == "page-delete") {
                  var deleteBtns = document.querySelectorAll(".page-delete");
                  var deletingLi = target.parentNode;
                  var page = deletingLi.querySelectorAll(".min-page")[0];
                  var pageId = page.id;
                  if (deleteBtns.length == 1) {
                      _this.showTip("delete_tip1");
                  } else if (_this.isPage1(pageId)) {
                      _this.showTip("delete_tip4");
                  } else {
                      if (deletingLi.getAttribute("class") == "page-item") {
                          _this.mask.style.display = "block";
                          EventListen.addEvent(_this.cancel, "click", function () {
                              _this.mask.style.display = "none";
                          });

                          EventListen.addEvent(_this.popDelete, "click", function () {
                              _this.mask.style.display = "none";
                              window.onerror = function () {
                                  return true;
                              }
                              _this.pageList.removeChild(deletingLi);
                              window.sessionStorage.removeItem(pageId);
                              var pageNums = document.querySelectorAll(".page-num");
                              for (var n = 0; n < pageNums.length; n++) {
                                  pageNums[n].innerText = n + 1;
                              }
                              var pages = _this.pageList.innerHTML;
                              window.sessionStorage.setItem("page_list", JSON.stringify(pages));
                              _this.showTip("delete_tip2");
                          });
                      } else {
                          _this.showTip("delete_tip3");
                      }
                  }
              }
          });
      },
      showTip: function (id) {
          document.getElementById(id).style.top = "60px";
          document.getElementById(id).style.opacity = 1;
          setTimeout(function () {
              document.getElementById(id).style.top = "30px";
              document.getElementById(id).style.opacity = 0;
          }, 2000);
      },
      initPage: function (options) {
          var initPage = '<div class="check-code" style="position: absolute;width: 595px;top: 24px;left: 0;">' +
              '<div style="position: absolute;top: 0;left: 24px;width: 60px;height: 60px;"><img style="width:60px;height:60px;" src="' + options.src + '"/></div>' +
              '<div style="position: absolute;top: -32px;left: 90px;transform: scale(0.5); -webkit-transform: scale(0.5); -moz-transform: scale(0.5); -ms-transform: scale(0.5); -o-transform: scale(0.5);transform-origin: 0 center; -webkit-transform-origin: 0 center; -moz-transform-origin: 0 center; -ms-transform-origin: 0 center; -o-transform-origin: 0 center;">' +
              '<div style="font-size: 24px;color: #333;">共筑保函查验系统</div>' +
              '<div style="font-size: 20px;color: #999;margin-top: -5px;">' + options.url + '</div>' +
              '<div style="border-top: 1px solid #ececec;margin: 10px 0;"></div>' +
              '<div style="font-size: 20px;color: #666;">校验码：' + options.checkCode + '</div>' +
              '<div style="font-size: 20px;color: #666;">编号：' + options.checkNumber + '</div>' +
              '</div>' +
              '<img style="position: absolute;top: 0;right: 24px;width: 42px;height: 53px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK4AAADeCAYAAACkLjsvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjVDRTU1NURDN0E4MTExRThCQzFEQzEyQTQ1OTBEN0M0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjVDRTU1NUREN0E4MTExRThCQzFEQzEyQTQ1OTBEN0M0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NUNFNTU1REE3QTgxMTFFOEJDMURDMTJBNDU5MEQ3QzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NUNFNTU1REI3QTgxMTFFOEJDMURDMTJBNDU5MEQ3QzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4e2TknAAAWJElEQVR42uxd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"/></div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 213px; top: 114px; z-index: 10003; font-size: 28px; color: rgb(51, 51, 51); font-weight: 400; width: 168px; text-align: center; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">投标保函</div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 420px; top: 170px; z-index: 10003; font-size: 18px; color: rgb(51, 51, 51); font-weight: 400; width: 126px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">保函编号：xxx</div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 225px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 507px; line-height: 30px; text-align: center; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;"><div style="text-align: left;"><span style="text-decoration: underline;">&nbsp;xx项目部&nbsp;</span>（招标人名称）：</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; &nbsp;鉴于<span style="text-decoration: underline;">&nbsp;xx公司</span>（以下称“投标人”）于<span style="text-decoration: underline;">&nbsp;x年x月x日&nbsp;</span>参加（项目名称）<span style="text-decoration: underline;">&nbsp;xx项目&nbsp;</span>（招标编号）<span style="text-decoration: underline;">&nbsp;XXXX-xx&nbsp;</span>，<span style="text-decoration: underline;">&nbsp;xx担保公司&nbsp;</span>（以下简称“我 方”）无条件地、不可撤销地保证：投标人在规定的投标文件有效期内撤销或修改其投标文件的，或者投标人在收到中标通知书后无正当理由拒签合同或拒交规定履约担保的，我方承担保证责任。收到你方书面通知后，在7日内无条件向你方支付人民币（大写）<span style="text-decoration: underline;">&nbsp;xxxxx&nbsp;</span>元整。</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; &nbsp;本保函在投标有效期内保持有效。要求我方承担保证责任的通知应在投标有效期内（投标有效期从招标文件规定的提交投标文件截止之日起计算120天）送达我方。</div></div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 560px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 223px; line-height: 30px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">担保人名称：<u>&nbsp;xxx担保公司&nbsp;</u>（盖单位章）</div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 586px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 338px; line-height: 30px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">地&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址：<span style="text-decoration: underline;">&nbsp;xxxxxxx&nbsp;</span></div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 612px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 174px; line-height: 30px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">邮&nbsp;政&nbsp;编&nbsp;码：<span style="text-decoration: underline;">&nbsp;xxxxxx&nbsp;</span></div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 638px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 174px; line-height: 30px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">电&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;话：<span style="text-decoration: underline;">&nbsp;xxxx-xxxxxxxx&nbsp;</span></div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 664px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 178px; line-height: 30px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">传&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;真：<span style="text-decoration: underline;">&nbsp;xxxx-xxxxxxxx&nbsp;</span></div>' +
              '<div class="dom" contenteditable="false" moveable="yes" active="no" style="position: absolute; left: 44px; top: 690px; z-index: 10003; font-size: 12px; color: rgb(51, 51, 51); font-weight: 400; width: 181px; line-height: 30px; text-align: left; cursor: move; text-decoration: none; border: 1px dashed transparent; background-color: transparent; outline: none;">日&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;期：<span style="text-decoration: underline;">&nbsp;xxxx年 xx月xx日&nbsp;</span></div>' +
              '<div moveable="yes" active="no" signature="yes" class="dom signature" contenteditable="false" style="position: absolute; left: 222px; top: 512px; z-index: 10003; height: 120px; line-height: 120px; border: 1px dashed transparent; border-radius: 60px; font-size: 18px; color: rgb(255, 0, 0); font-weight: 400; width: 120px; text-align: center; cursor: move; text-decoration: none; background-color: transparent;">签章位置</div>';
          this.canvas.innerHTML = initPage;
          var vcanvas = document.createElement("div");
          vcanvas.innerHTML = initPage;
          vcanvas.style.transform = "scale(0.2353)";
          vcanvas.setAttribute("class", "page-boxes");
          document.getElementById("page1").appendChild(vcanvas);
          this.init();
          this.savePage();
          this.showPages();
          this.domEvent();
      },
      returnPagesList: function () {
          var boxes = document.querySelectorAll(".page-boxes");
          for (var i = 0; i < boxes.length; i++) {
              this.returnPages.push(boxes[i].innerHTML);
          }
          return this.returnPages;
      },
      isPage1: function (id) {
          var num = id.slice(4);
          if (num == "1") {
              return true;
          } else {
              return false;
          }
      }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Dndne;

  if (typeof define === 'function') define(function () {
      return Dndne;
  });

  global.Dndne = Dndne;

})(this);
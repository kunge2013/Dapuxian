/*
 * @author liyuelong1020@gmail.com
 * @date 15-5-11 下午4:23
 * @version 1.0.0
 * @description 自定义事件
 */

(function () {

    // 轻触，长按，滑屏，滑屏结束，左滑屏，右滑屏，上滑屏，下滑屏
    let EventList = ['tap', 'longTap', 'swipe', 'swipeEnd', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown'];

    // 判断类型是否为数字
    let isNumber = function(num) {
        return Object.prototype.toString.call(num) === '[object Number]';
    };

    // 计算旋转角度
    let getAngle = function(x, y) {
        let angle = Math.atan(Math.abs(y / x)) / Math.PI * 180;
        if(x <= 0 && y <= 0) {
            angle = 180 - angle;
        } else if(x <= 0 && y >= 0){
            angle += 180;
        } else if(x >= 0 && y >= 0) {
            angle = 360 - angle;
        }
        return angle;
    };

    // 创建一个触摸点对象
    let createPoint = function() {
        return Object.defineProperties({}, {
            length: {
                get: function() {
                    return Object.keys(this).length;
                },
                set: function(value) {
                    return false;
                },
                enumerable: false
            },
            keys: {
                value: function(i) {
                    return this[Object.keys(this)[i]];
                },
                writable: false,
                enumerable: false
            },
            empty: {
                value: function() {
                    for(let i in this){
                        if(this.hasOwnProperty(i)){
                            delete this[i];
                        }
                    }
                },
                writable: false,
                enumerable: false
            }
        });
    };

    // 定义滑屏事件
    let bindEvent = function(node) {
        node.__bind_custom_event__ = true;

        // 坐标点
        let point = {
            target: null,                     // 事件触发 DOM 节点
            startStamp: 0,                    // 事件开始时间戳
            endStamp: 0,                      // 事件结束时间戳
            startApart: 0,                    // 多点触摸开始触摸间距值
            endApart: 0,                      // 多点触摸结束触摸间距值
            startAngle: 0,                    // 多点触摸开始触摸角度值
            endAngle: 0,                      // 多点触摸结束触摸角度值
            startX: createPoint(),            // 开始触摸 X 坐标点
            startY: createPoint(),            // 开始触摸 Y 坐标点
            endX: createPoint(),              // 结束触摸 X 坐标点
            endY: createPoint(),              // 结束触摸 Y 坐标点
            diffX: createPoint(),             // 触摸 X 坐标偏移量
            diffY: createPoint()              // 触摸 Y 坐标偏移量
        };

        // 事件处理
        let handler = function(e) {
            // 事件触发 DOM 节点
            point.target = e.target;

            switch(e.type) {
                case 'touchstart':
                    // 重置坐标点信息
                    point.startX.empty();
                    point.startY.empty();
                    point.diffX.empty();
                    point.diffY.empty();

                    // 保存开始坐标点
                    [].slice.call(e.touches).forEach(function(touche, index) {
                        let i = touche.identifier || index;
                        point.startX[i] = point.endX[i] = touche.clientX;
                        point.startY[i] = point.endY[i] = touche.clientY;
                    });

                    // 开始时间戳
                    point.startStamp = point.endStamp = Date.now();

                    // 如果是多点触摸则计算开始触摸间距
                    if(e.touches.length > 1){
                        let start_x = point.startX.keys(1) - point.startX.keys(0);
                        let start_y = point.startY.keys(1) - point.startY.keys(0);
                        point.startApart = Math.sqrt(start_x * start_x + start_y * start_y);
                        point.startAngle = getAngle(start_x, start_y);
                    }

                    break;
                case 'touchmove':

                    // 移动中的坐标点（结束坐标点）
                    [].slice.call(e.touches).forEach(function(touche, index) {
                        let i = touche.identifier || index;
                        point.endX[i] = touche.clientX;
                        point.endY[i] = touche.clientY;
                        isNumber(point.startX[i]) && (point.diffX[i] = point.endX[i] - point.startX[i]);
                        isNumber(point.startY[i]) && (point.diffY[i] = point.endY[i] - point.startY[i]);
                    });

                    // 如果是多点触摸则计算移动触摸间距
                    if(e.touches.length > 1){
                        let end_x = point.endX.keys(1) - point.endX.keys(0);
                        let end_y = point.endY.keys(1) - point.endY.keys(0);
                        point.endApart = Math.sqrt(end_x * end_x + end_y * end_y);
                        point.endAngle = getAngle(end_x, end_y);
                    }

                    // 触发滑屏事件
                    node.trigger('swipe', point, e);

                    break;
                case 'touchcancel':
                case 'touchend':

                    point.endStamp = Date.now();
                    point.endX.empty();
                    point.endY.empty();

                    // 结束坐标点
                    [].slice.call(e.changedTouches).forEach(function(touche, index) {
                        let i = touche.identifier || index,
                            diffX = point.diffX[i],
                            diffY = point.diffY[i];

                        if(Math.abs(diffX) > 0 || Math.abs(diffY) > 0) {
                            if(Math.abs(diffX) < Math.abs(diffY) && diffY < 0){
                                // 上滑屏
                                node.trigger('swipeUp', point, e);
                            } else if(Math.abs(diffX) < Math.abs(diffY) && diffY > 0) {
                                // 下滑屏
                                node.trigger('swipeDown', point, e);
                            } else if(Math.abs(diffX) > Math.abs(diffY) && diffX < 0) {
                                // 左滑屏
                                node.trigger('swipeLeft', point, e);
                            } else if(Math.abs(diffX) > Math.abs(diffY) && diffX > 0) {
                                // 右滑屏
                                node.trigger('swipeRight', point, e);
                            }

                            // 滑屏结束事件
                            node.trigger('swipeEnd', point, e);
                        } else {
                            // 点击事件
                            node.trigger('tap', point, e);
                            if(point.endStamp - point.startStamp > 500){
                                // 长按事件
                                node.trigger('longTap', point, e);
                            }
                        }
                    });

                    break;
            }
        };

        node.addEventListener('touchstart', handler, false);
        node.addEventListener('touchmove', handler, false);
        node.addEventListener('touchend', handler, false);
        node.addEventListener('touchcancel', handler, false);
    };


    // 事件触发
    Element.prototype.trigger = function (type, data, e) {
        let event = document.createEvent('HTMLEvents');
        event.initEvent(type, true, true);
        event.data = data || {};
        event.eventName = type;
        event.target = this;

        // 取消默认事件
        if(e && e instanceof Event){
            let oldPreventDefault = event.preventDefault;
            let oldStopPropagation = event.stopPropagation;
            event.preventDefault = function() {
                e.preventDefault();
                oldPreventDefault.apply(event, arguments);
            };
            event.stopPropagation = function() {
                e.stopPropagation();
                oldStopPropagation.apply(event, arguments);
            };
        }

        this.dispatchEvent(event);
        return this;
    };

    // 重写事件监听函数
    let oldEventListener = Element.prototype.addEventListener;

    // 事件委托
    let matches = Element.prototype.matches ||
        Element.prototype.matchesSelector ||
        Element.prototype.webkitMatchesSelector;
    Element.prototype.addEventListener = Element.prototype.on = function(event) {
        let node = this;
        let args = [].slice.call(arguments);
        let selector, callback;

        let eventArr = String(event).split('.');
        let eventNameSpace = eventArr[1] || 'all';
        event = eventArr[0];

        if(({}).toString.call(args[1]) === '[object String]'){
            selector = args[1];
        }

        if(selector && ({}).toString.call(args[2]) === '[object Function]'){
            callback = args[2];
        } else if(({}).toString.call(args[1]) === '[object Function]') {
            callback = args[1];
        } else {
            callback = function() {};
        }

        if(EventList.indexOf(event) > -1 && !this.__bind_custom_event__){
            bindEvent(node);
        }

        // 记录委托的事件
        if(!node.__custom_event_live__){
            node.__custom_event_live__ = {};
        }
        if(!node.__custom_event_live__[eventNameSpace]){
            node.__custom_event_live__[eventNameSpace] = {};
        }
        if(!node.__custom_event_live__[eventNameSpace][event]){
            node.__custom_event_live__[eventNameSpace][event] = [];
        }

        if(selector) {
            // 事件委托回调函数
            let handler = function(e) {
                let target = e.target;
                // 如果是自定义事件则 target 为 e.data.target
                if(EventList.indexOf(event) > -1 && target === node && e.data && e.data.target){
                    target = e.data.target;
                }
                // 匹配选中的子节点
                let selected = matches.call(target, selector);
                while(!selected && target.parentNode && target !== node){
                    target = target.parentNode;
                    selected = matches.call(target, selector);
                }
                if(selected){
                    callback.call(target, e);
                }
            };

            node.__custom_event_live__[eventNameSpace][event].push(handler);
            oldEventListener.call(node, event, handler, false);
        } else {
            node.__custom_event_live__[eventNameSpace][event].push(callback);
            oldEventListener.call(node, event, callback, false);
        }

        return node;
    };
    Element.prototype.off = function(event, handler) {
        let node = this;

        let eventArr = String(event).split('.');
        let eventNameSpace = eventArr[1] || 'all';
        event = eventArr[0];

        if(({}).toString.call(handler) === '[object Function]'){
            node.removeEventListener(event, handler, false);
        } else if(node.__custom_event_live__ &&
            node.__custom_event_live__[eventNameSpace] &&
            node.__custom_event_live__[eventNameSpace][event] &&
            node.__custom_event_live__[eventNameSpace][event].length){
            node.__custom_event_live__[eventNameSpace][event].forEach(function(handler) {
                node.removeEventListener(event, handler, false);
            });
        }
        return node;
    };

    // 只触发一次的事件
    Element.prototype.one = function(event, callback) {
        let node = this;
        let one = function(e) {
            node.removeEventListener(event, one, false);
            callback.call(this, e);
        };
        node.addEventListener(event, one, false);
        return node;
    };

})();

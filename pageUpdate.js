/**
 * page滑动要修改的地方
 */

function Page(){
	
}

(function () {
    var moving = false;
    var obj = {};
    var tapEvent = document.createEvent("CustomEvent");
    tapEvent.initCustomEvent("tap", true, false, obj);

    var touchstart = function (ev) { 
        ev.stopPropagation();
    };

    var touchend = function (isTarget) {
        return function (ev) {
            ev.stopPropagation();
            var target = ev.target;
            if (!moving) {
                ev.preventDefault();
                var touch = ev.changedTouches[0];
                obj.clientX = touch.clientX;
                obj.clientY = touch.clientY;
                target.dispatchEvent(tapEvent);
            }
            moving = false;
        }
    };

    var touchmove = function (ev) {
        ev.stopPropagation();
        moving = true;
    };

    var defualtSlideFn = function (ev) {
        var x = ev.detail.deltaX, y = ev.detail.deltaY;
        return x == 0 || Math.abs(y) / Math.abs(x) > 1;
    };

    var isScroll = undefined,
        startObj = {},
        moveObj = {},
        endObj = {},
        sTime = null;

    var slideStartEvent = document.createEvent("CustomEvent");
    slideStartEvent.initCustomEvent("slidestart", true, false, startObj);

    var slideMoveEvent = document.createEvent("CustomEvent");
    slideMoveEvent.initCustomEvent("slidemove", true, false, moveObj);

    var slideEndEvent = document.createEvent("CustomEvent");
    slideEndEvent.initCustomEvent("slideend", true, false, endObj);

    var slidestart = function (ev) {
        ev.stopPropagation();
        startObj.x = ev.touches[0].clientX;
        startObj.y = ev.touches[0].clientY;
        sTime = Date.now();
    };

    var slidemove = function (doSlideFn) {
        doSlideFn = doSlideFn || defualtSlideFn;
        return function (ev) {
            moving = true;
            var target = ev.target;
            var clientX = ev.changedTouches[0].clientX, 
                clientY = ev.changedTouches[0].clientY,
                deltaX = clientX - startObj.x,
                deltaY = clientY - startObj.y;

            if (isScroll === undefined) {
                if (doSlideFn.call(this, {detail: { deltaX: deltaX, deltaY: deltaY, clientX: clientX, clientY: clientY, target: target }})) {
                    isScroll = true;
                }
                else {
                    isScroll = false;
                    target.dispatchEvent(slideStartEvent);
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            }
            else if (isScroll === false) {
                ev.preventDefault();
                ev.stopPropagation();
                moveObj.deltaX = deltaX;
                moveObj.deltaY = deltaY;
                moveObj.clientX = clientX;
                moveObj.clientY = clientY;
                target.dispatchEvent(slideMoveEvent);
            }
        }
    }
    
    var slideend = function (ev) {
        if (isScroll === false) {
            var target = ev.target;
            ev.stopPropagation();
            moving = false;
            var clientX = ev.changedTouches[0].clientX, 
                clientY = ev.changedTouches[0].clientY;
            
            endObj.deltaX = clientX - startObj.x;
            endObj.deltaY = clientY - startObj.y;
            endObj.clientX = clientX;
            endObj.clientY = clientY;
            endObj.elapsed = Date.now() - sTime;
            target.dispatchEvent(slideEndEvent);
        }
        isScroll = undefined;
    };

    Page.prototype.attachSlide = function (key, startFn,  fn, endFn, propation, slideFn) {
        this.attachEvent(key, "touchstart", slidestart, propation);
        this.attachEvent(key, "touchmove", slidemove(slideFn), propation);
        this.attachEvent(key, "touchend", slideend, propation);
        this.attachEvent(key, "slidestart", startFn, propation);
        this.attachEvent(key, "slidemove", fn, propation);
        this.attachEvent(key, "slideend", endFn, propation);
        return this;
    }
    
    Page.prototype.attachTap = function (key, fn, propation, isTarget) {
        this.attachEvent(key, "touchstart", touchstart, propation);
        this.attachEvent(key, "touchmove", touchmove, propation);
        this.attachEvent(key, "touchend", touchend(isTarget), propation);
        this.attachEvent(key, "tap", fn, propation);
        return this;
    }
})();
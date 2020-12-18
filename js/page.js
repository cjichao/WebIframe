function Page(title,url) {
	this.title = title || '';
	this.url = url;
	this.domList = {};
	this.eventList = [];
}

Page.prototype = {
	render: function(fn) {
		console.error('要重写')
	},
	fetch: function(url, callback) {
		var self = Page.prototype;
		var that = this;
		if (self.fetch[url] && typeof callback === 'function') {
			callback(self.fetch[url])
		} else {
			var xhr;
			//考虑兼容性
			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else if (window.ActiveObject) { //兼容IE6以下版本
				xhr = new ActiveXobject('Microsoft.XMLHTTP');
			}
			xhr.open('GET', url, true);
			xhr.send(null);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						var result = xhr.responseText;
						self.fetch[url] = result; // 将请求的页面缓存
						if (typeof callback === 'function') {
							callback(result);
						}
					} 
				}
			}
		}
	},
	getDomObj: function() {
		// need overwrite
	},
	// removeDomObj: function() {

	// },
	// init: function(el) {
	// 	var dom = document.querySelector(el);
	// 	this.render(dom);
	// 	this.getDomObj();
	// },
	// unit: function() {
	// 	this.removeDomObj();
	// },
	// 卸载
	_dispose: function() {
		this._removeEventListeners();
		this._removeDom();
	},
	// 装载
	_initialize: function(container) {
		// 这里container是 #app容器
		this.getDomObj(container);
		this._addEventListeners();
	},
	attachDom: function(cssQuery, key, dom) {
		// example:("#id", "id", dom)  id为key， value为该代码document.querySelector("#id")获得的元素
		dom = dom || document; // app容器
		this.domList[key] = dom.querySelector(cssQuery);
		return this;
	},
	// 添加存储事件
	attachEvent: function(key, eventStr, fn, propation, doFn) {
		// 1.eventList是一个数组，每个元素都是一个对象eventObj， eventObj拥有key字段和eventArray字段
		// 2.key字段与domList的key对应
		// 3.eventArray是一个数组，存储绑定事件的详情，每个事件详情都有method字段代表事件类型， 
		//	 eventArray字段代表事件函数的数组，每个事件函数都有函数本身，以及事件的传播方向（冒泡或者捕获）
		propation = propation || false;
		var eventList = this.eventList;
		doFn = doFn || fn.bind(this);
		var eventObj = this._getEvent(eventList, {
			key: key
		});
		if (eventObj) {
			var eventArray = eventObj.eventArray;
			var methodEventObj = this._getEvent(eventArray, {
				method: eventStr
			});
			if (methodEventObj) {
				var fnArray = methodEventObj.fnArray;
				var obj = this._getEvent(fnArray, {
					backFn: fn,
					propation: propation
				});
				if (!obj) {
					fnArray.push({
						backFn: fn,
						propation: propation,
						doFn: doFn
					});
				}
			} else {
				eventArray.push({
					method: eventStr,
					fnArray: [{
						backFn: fn,
						propation: propation,
						doFn: doFn
					}]
				});
			}
		} else {
			eventList.push({
				key: key,
				eventArray: [{
					method: eventStr,
					fnArray: [{
						backFn: fn,
						propation: propation,
						doFn: doFn
					}]
				}]
			});
		}
		return this;
	},
	_getEvent: function(arr, obj) {
		for (var i = 0; i < arr.length; i++) {
			var val = true;
			for (var key in obj) {
				val = val && (arr[i][key] === obj[key]);
			}
			if (val) return arr[i];
		}
		return null;
	},
	_removeDom: function() {
		var domList = this.domList;
		for (var key in domList) {
			domList[key] = null;
		}
	},
	_addEventListeners: function() {
		var domList = this.domList,
			eventList = this.eventList;
		for (var i = 0, len = eventList.length; i < len; i++) {
			var eventObj = eventList[i];
			var dom = domList[eventObj.key];
			var eventArray = eventObj.eventArray;
			for (var j = 0, len2 = eventArray.length; j < len2; j++) {
				var methodEventObj = eventArray[j];
				var key = methodEventObj.method; // click,hover,tap,touchstart...
				var fnArray = methodEventObj.fnArray;
				for (var ii = 0; ii < fnArray.length; ii++) {
					dom.addEventListener(key, fnArray[ii].doFn, fnArray[ii].propation);
				}
			}
		}
	},
	_removeEventListeners: function() {
		var domList = this.domList,
			eventList = this.eventList;
		for (var i = 0, len = eventList.length; i < len; i++) {
			var eventObj = eventList[i];
			var dom = domList[eventObj.key];
			var eventArray = eventObj.eventArray;
			for (var j = 0, length = eventArray.length; j < length; j++) {
				var methodEventObj = eventArray[j];
				var key = methodEventObj.method;
				var fnArray = methodEventObj.fnArray;
				for (var ii = 0; ii < fnArray.length; ii++) {
					dom.removeEventListener(key, fnArray[ii].doFn, fnArray[ii].propation);
				}
			}
		}
		this.eventList.length = 0;
	},
	attachTap: (function() {
		var moving = false, //是否移动
			touched = false; //是否触碰屏幕
		var obj = {
			eventName: '这是自定义事件'
		};
		// 创建自定义事件,返回事件对象
		var tapEvent = document.createEvent("CustomEvent");
		// 事件对象初始化  // tapEvent.detail能看到obj的所有内容
		tapEvent.initCustomEvent("tap", true, false, obj);

		var touchstart = function(e) {
			e.stopPropagation();
			touched = true;
			// console.log("触碰")
		};

		var touchend = function(e) {
			var touch = e.changedTouches[0];
			e.preventDefault(); // 阻止默认
			e.stopPropagation(); //阻止冒泡
			var target = e.target;
			// 移动的时候碰到按钮不触发按钮事件
			if (!moving) {
				obj.clientX = touch.clientX;
				obj.clientY = touch.clientY;
				// 这个target节点将成为事件的目标节点,触发这个事件
				// console.log(target)
				// console.log(tapEvent)
				target.dispatchEvent(tapEvent);
			}
			touched = false;
			moving = false;
		};

		var touchmove = function(e) {
			e.stopPropagation();
			if (touched) {
				moving = true;
			}
			// console.log("移动")
		};
		// key: 元素的名字(和attachDom中的key对应)
		return function(key, fn, propation) {
			// attachEvent: function(key, eventStr, fn, propation, doFn)
			this.attachEvent(key, "touchstart", touchstart, propation);
			this.attachEvent(key, "touchmove", touchmove, propation);
			this.attachEvent(key, "touchend", touchend, propation);
			this.attachEvent(key, "tap", fn, propation);
			return this;
		}
	})(),
	// 滑动屏幕
	attachSlide: (function() {
		// 默认滑动方法
		var defualtSlideFn = function(x, y) {
			// x=0是防止后面除以0,就是往上或下
			// Math.abs(y) > Math.abs(x) 说明整体是往上或下，这时Math.abs(y) / Math.abs(x) > 1
			// Math.abs(y) < Math.abs(x) 说明整体是往左或右，这时Math.abs(y) / Math.abs(x) < 1
			return x == 0 || Math.abs(y) / Math.abs(x) > 1
		};
		var isScroll = undefined,
			touched = false, // 是否按下
			startObj = {
				name: '滑动开始'
			}, // e.detail访问
			moveObj = {
				name: '滑动中'
			}, // e.detail访问
			endObj = {
				name: '滑动结束'
			}, // e.detail访问
			sTime = null; // 触碰开始时间

		// 注册滑动开始事件
		var slideStartEvent = document.createEvent("CustomEvent");
		slideStartEvent.initCustomEvent("slidestart", true, false, startObj);

		// 注册滑动中事件
		var slideMoveEvent = document.createEvent("CustomEvent");
		slideMoveEvent.initCustomEvent("slidemove", true, false, moveObj);

		// 注册滑动结束事件
		var slideEndEvent = document.createEvent("CustomEvent");
		slideEndEvent.initCustomEvent("slideend", true, false, endObj);

		// touchstart 事件
		var slidestart = function(e) {
			// console.log(e)
			e.stopPropagation();
			touched = true;

			startObj.x = e.touches[0].clientX;
			startObj.y = e.touches[0].clientY;
			sTime = Date.now();
		};

		// touchmove 事件
		var slidemove = function(doSlideFn) {
			doSlideFn = doSlideFn || defualtSlideFn;
			return function(e) {
				var target = e.target;
				var clientX = e.changedTouches[0].clientX,
					clientY = e.changedTouches[0].clientY,
					deltaX = clientX - startObj.x,
					deltaY = clientY - startObj.y;
				// console.log(deltaX,deltaY)

				if (isScroll === undefined) {
					var res = doSlideFn(deltaX, deltaY);
					console.log('res:' + res)
					if (res) {
						isScroll = true; //上下滑动
					} else {
						isScroll = false; //左右滑动开始的时候
						target.dispatchEvent(slideStartEvent); // 触发滑动开始事件
						e.preventDefault();
						e.stopPropagation();
					}
				} else if (isScroll === false) {
					// 左右滑动的时候移动的时候
					e.preventDefault();
					e.stopPropagation();
					moveObj.deltaX = deltaX;
					moveObj.deltaY = deltaY;
					moveObj.clientX = clientX;
					moveObj.clientY = clientY;
					target.dispatchEvent(slideMoveEvent); // 触发滑动中事件
				}
			}
		}

		// touchend事件
		var slideend = function(e) {
			var target = e.target;
			// console.log(target)
			e.stopPropagation();
			touched = false;
			var clientX = e.changedTouches[0].clientX,
				clientY = e.changedTouches[0].clientY;

			if (isScroll === false) {
				// 左右滑动
				endObj.deltaX = clientX - startObj.x; // 大于0，右滑动，小于0，左滑动
				endObj.deltaY = clientY - startObj.y;
				endObj.clientX = clientX;
				endObj.clientY = clientY;
				endObj.elapsed = Date.now() - sTime; // 总滑动时间,用来计算速度
				target.dispatchEvent(slideEndEvent);
			}
			isScroll = undefined;
		};

		var startfn = function(e) {};
		var movefn = function(e) {};
		var endfn = function(e) {};

		return function(key, fnsObj, propation) {
			var startFn = fnsObj.startFn || startfn;
			var moveFn = fnsObj.moveFn || movefn;
			var endFn = fnsObj.endFn || endfn;
			var slideFn = fnsObj.slideFn || defualtSlideFn;

			this.attachEvent(key, "touchstart", slidestart, propation);
			this.attachEvent(key, "touchmove", slidemove(slideFn), propation);
			this.attachEvent(key, "touchend", slideend, propation);
			this.attachEvent(key, "slidestart", startFn, propation);
			this.attachEvent(key, "slidemove", moveFn, propation);
			this.attachEvent(key, "slideend", endFn, propation);
			return this;
		}
	})()
}

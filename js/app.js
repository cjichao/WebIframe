function App(id) {
	this.currectPage = null; // 当前页面(动态)
	this.pageContainer = null; //可变页面的容器
	this.staticPage = null; // 存放静态布局页面，可以调用其方法更改外部布局
	this.containerId = id || '#app';
	this.routeObj = {}; // 路由对象，存放路由记录  对象放置页面对象，key代表页面的url， value为Page对象
	this.history = new History();
}
App.prototype = {
	render: function(page) {
		// 如果是当前页面就不改变
		if (this.currectPage == page) return false;
		// 获取容器
		var pageContainer = this.pageContainer = this.pageContainer || document.querySelector(this.containerId); //页面容器

		// 存在当前页面，就卸载当前页面
		if (this.currectPage) {
			this.currectPage._dispose();
		} else {
			console.log("没有卸载当前页面")
		}
		// 将新页面赋值给当前页面
		this.currectPage = page;
		// 网页标题就是当前页面的标题
		document.title = page.title;
		page.render(function(html) {
			pageContainer.innerHTML = html;
			page._initialize(pageContainer);
		});
	},
	initialize: function(staticPage, indexPage) {
		// staticPage : 存放静态布局页面，可以调用其方法更改外部布局
		staticPage = this.staticPage = staticPage || App.emptyPage;
		var that = this;
		staticPage.render(function(html) {
			// 不存在app容器就添加
			if (!document.getElementById('app')) {
				var body = document.body;
				/*
					beforebegin：在当前元素节点的前面。
					afterbegin：在当前元素节点的里面，插在它的第一个子元素之前。
					beforeend：在当前元素节点的里面，插在它的最后一个子元素之后。
					afterend：在当前元素节点的后面。
				 */
				body.insertAdjacentHTML('afterbegin', html);
				staticPage._initialize(body);
			}
			if (staticPage.domList.app) {
				that.pageContainer = staticPage.domList.app;
			} else {
				console.error("staticPage必须要有容器");
			}
			// console.log("切换页面")
			// that.render(indexPage, true);
			that._renderPage(indexPage);
			console.log('that.routeObj:', that.routeObj)

			/*
				当活动历史记录条目更改时，将触发popstate事件。
				如果被激活的历史记录条目是通过对history.pushState（）的调用创建的，
				或者受到对history.replaceState（）的调用的影响，
				popstate事件的state属性包含历史条目的状态对象的副本。
				需要注意的是调用history.pushState()或history.replaceState()不会触发popstate事件。
				只有在做出浏览器动作时，才会触发该事件，
				如用户点击浏览器的回退按钮（或者在Javascript代码中调用history.back()或者history.forward()方法）
			 */
			window.addEventListener("popstate", function(e) {
				if (e.state && e.state.data) {
					// console.log("e.state:", e.state)
					var url = e.state.data;   // 前进或者后退的页面
					var page = that.routeObj[url]; // 从缓存的页面中读取后退前进的页面
					var urlObj = that.history.getSurround();  // 获取当前页面的前一页和后一页
					console.log(urlObj)
					if (urlObj.prev == url) {
						var a = that.history.back();
						// console.log("a:" + a)
						that.isRenderBack = true;
						that.render(page);
					} else if (urlObj.next == url) {
						that.history.forward();
						that.isRenderBack = false;
						that.render(page);
					}
					// that._renderPage(page);
				}
			}, false);
		});
	},
	/**
	 * @param {Object} page
	 * @param {Object} isBack  是否可以返回
	 */
	_attachHistory: function(page, isBack) {
		var newUrl = page.url || '';
		// console.log(newUrl)
		if (isBack) {
			console.log("执行了替换")
			// replaceState()替换当前的历史记录
			history.replaceState({
				data: newUrl
			}, "新页面标题", newUrl);
			// 往自定义history对象添加路由
			this.history.replaceState(newUrl);
		} else {
			console.log("执行了添加")
			// pushState()可以创建历史，可以配合popstate事件，可以使用history.go(-1)返回到上一个页面。
			history.pushState({
				data: newUrl
			}, "新页面标题", newUrl);
			// 往自定义history对象添加路由
			this.history.pushState(newUrl);
		}
		console.log('this.history:', this.history)
	},
	_renderPage: function(page) {
		// 如果当前有页面，就卸载这个页面
		if (this.currectPage) {
			this.currectPage._dispose();
		}
		this.currectPage = page;
		this._attachHistory(page, false);
		this.routeObj[page.url] = page;  // 将当前页面缓存起来，后退前进读取
		page.app = this;
		// 网页标题就是当前页面的标题
		document.title = page.title;
		var pageContainer = this.pageContainer;
		page.render(function(html) {
			pageContainer.innerHTML = html;
			page._initialize(pageContainer);
		})
	}
}


/**
 * @param {Object} obj
 * @param {Object} options
 * 将options的属性添加给obj
 */
App.extend = function(obj, options) {
	options = options || {};
	for (var key in options) {
		var desptor = Object.getOwnPropertyDescriptor(options, key);
		console.log(key,desptor)
		if (desptor.value) {
			// 将options的每一项值赋值给obj,这里obj是page对象
			// 就是将每一项添加到page对象上
			obj[key] = desptor.value;
		} else {
			if (desptor.get && desptor.set) {
				Object.defineProperty(obj, key, {
					get: desptor.get,
					set: desptor.set
				});
			} else if (desptor.get) {
				Object.defineProperty(obj, key, {
					get: desptor.get
				});
			} else {
				Object.defineProperty(obj, key, {
					set: desptor.set
				});
			}
		}
	}
	return obj;
}

App.createPage = function(title, url, options) {
	var page = new Page(title, url);
	App.extend(page, options);
	return page;
}

// 静态布局的容器
App.emptyPage = App.createPage('', '', {
	render: function(fn) {
		// fn("<div class='pageContainer'></div>");
		fn("<div id='app' class='h500'></div>");
	},
	getDomObj: function(dom) {
		// this.attachDom(".pageContainer", "pageContainer", dom);
		this.attachDom("#app", "app");
	}
});


function History() {
	this.history = []; // 代表浏览器中的页面的url
	this.index = null; // 表示当前页面的url的索引值
}

History.prototype = {
	// 添加
	pushState: function(url) {

		if (this.index !== null) {
			var len = this.history.length;
			var nextIndex = this.index + 1;
			this.history.splice(nextIndex, len - nextIndex, url);
			this.index = nextIndex;
		} else {
			this.history.push(url);
			this.index = 0;
		}
		console.log("索引值", this.index)
		return url;
	},
	// 替换
	replaceState: function(url) {
		if (this.index) {
			this.history.splice(this.index, 1, url);
		} else {
			this.history.push(url);
			this.index = 0;
		}
		return url;
	},
	back: function() {
		if (this.index === null) return "";
		return this.history[this.index === 0 ? 0 : --this.index];
	},
	forward: function() {
		if (this.index === null) return "";
		var len = this.history.length;
		return this.history[this.index === len - 1 ? len - 1 : ++this.index];
	},
	// 获取当前索引值前后位置的url值
	getSurround: function() {
		var len = this.history.length;
		// 空页面
		if (this.index === null) {
			return {
				next: "",
				prev: ""
			};
		} else if (len === 1) {
			// 只有一个页面，只打开第一页
			return {
				next: "",
				prev: ""
			};
			// 下面都是超过两个页面
		} else if (this.index === 0) {
			// 索引是第一页时，只有下一页
			return {
				next: this.history[1], // 下一页url
				prev: ""
			};
		} else if (this.index === len - 1) {
			// 索引是第最后时，只有上一页
			return {
				next: "",
				prev: this.history[len - 2]
			}
		} else {
			return {
				next: this.history[this.index + 1],
				prev: this.history[this.index - 1]
			}
		}
	}
}

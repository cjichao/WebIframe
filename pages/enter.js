var indexPage = App.createPage('首页', '/自己做的插件/框架/index.html#index', {
	// getDomObj: function(dom) {
	// 	console.log(dom)
	// 	this.attachDom(".bts", 'bts', dom).attachEvent('bts', 'click', this.clickHandler, false);
	// },
	// clickHandler: function(e) {
	// 	e.preventDefault()
	// 	var target = e.target;
	// 	var action = target.dataset.action;
	// 	switch (action) {
	// 		case 'register':
	// 			// app.render(registerPage);
	// 			app.initialize(null, registerPage);
	// 			break;
	// 		case 'login':
	// 			// app.render(loginPage);
	// 			app.initialize(null, loginPage);
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// },
	render: function(fn) {
		this.fetch("./pages/enter.html", function(text) {
			fn(text);
		});
	},
	getDomObj: function(dom) {
		this.attachDom(".bts", "bts", dom)
			.attachDom("#app", "app")
			.attachSlide("app", {
				endFn: this.endFn
			})
			.attachTap("bts", this.tapHandler, false);
	},
	tapHandler: function(ev) {
		var target = ev.target;
		var action = target.dataset.action;
		switch (action) {
			case "register":
				app.initialize(null, registerPage);
				// app.render(registerPage);
				break;
			case "login":
				app.initialize(null, loginPage);
				// app.render(loginPage);
				break;
		}
	},
	endFn: function(e) {
		console.log(e.detail)
		var speed = 1000 * e.detail.deltaX / e.detail.elapsed;
		console.log(speed)
		if (speed > 500) {
			// 右滑动
			app.render(registerPage);
		} else if (speed < -500) {
			// 左滑动
			app.render(loginPage);
		} else {
			console.log('没触发')
		}
	}
});

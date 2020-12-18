var loginPage = App.createPage('登录', '/自己做的插件/框架/index.html#login', {
	// getDomObj: function(dom) {
	// 	this.attachDom('.header_back', 'back', dom)
	// 		.attachDom("[data-action='login']", 'login', dom)
	// 		.attachEvent('back', 'click', this.clickBack, false)
	// 		.attachEvent('login', 'click', this.clickLogin, false);
	// },
	// clickBack: function() {
	// 	app.render(indexPage);
	// },
	// clickLogin: function(e) {
	// 	e.preventDefault();
	// 	// app.render();
	// 	console.log("登录成功");
	// 	alert("登录成功");
	// },
	render: function(fn) {
		this.fetch("./pages/login.html", function(text) {
			// console.log(text)
			fn(text);
		});
	},
	getDomObj: function(dom) {
		this.attachDom('.header_back', 'back', dom)
			.attachDom("[data-action='login']", 'login', dom)
			.attachDom('#app', 'app')
			.attachSlide('app', {
				endFn: this.endFn
			})
			.attachTap('back', this.clickBack, false)
			.attachTap('login', this.clickLogin, false);
	},
	clickBack: function() {
		app.initialize(null, indexPage);
		// app.render(indexPage);
	},
	clickLogin: function(e) {
		e.preventDefault();
		console.log("登录成功");
		alert("登录成功");
	},
	endFn: function(e) {
		// console.log(e.detail)
		var speed = 1000 * e.detail.deltaX / e.detail.elapsed;
		console.log(speed)
		if (speed > 500) {
			// 右滑动
			app.render(indexPage);
		} else if (speed < -500) {
			// 左滑动
			app.render(indexPage);
		} else {
			console.log('没触发')
		}
	}
})

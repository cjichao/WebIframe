var registerPage = App.createPage("注册", '/自己做的插件/框架/index.html#register', {
	render: function(fn) {
		this.fetch("./pages/register.html", function(text) {
			// console.log(text)
			fn(text);
		});
	},
	getDomObj: function(dom) {
		this.attachDom('.header_back', 'back', dom)
			.attachDom("[data-action='register']", 'register', dom)
			.attachEvent('back', 'click', this.clickBack, false)
			.attachEvent('register', 'click', this.clickRegister, false);
	},
	clickBack: function() {
		app.initialize(null, indexPage);
		// app.render(indexPage);
	},
	clickRegister: function(e) {
		e.preventDefault();
		// app.render();
		console.log("注册成功");
		alert("注册成功");
	}
})

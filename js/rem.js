var isWeixin = function() { //判断是否是微信
	var ua = navigator.userAgent.toLowerCase();
	return ua.match(/MicroMessenger/i) == "micromessenger";
};

function getBigFont() {
	var docEl = document.documentElement;
	// console.log(docEl)
	var docWidth = window.innerWidth;
	// console.log(docWidth)
	var fakeBody = document.createElement('body');

	var rem = docWidth / 10;
	docEl.style.fontSize = rem + 'px';
	var d = document.createElement('div');
	d.style.cssText = 'width:1rem;height:0;overflow: hidden;position:absolute;z-index:-1;visibility: hidden;';
	fakeBody.appendChild(d);
	docEl.appendChild(fakeBody);
	var realRem = d.getBoundingClientRect().width.toFixed(1) / 1;
	docEl.removeChild(fakeBody);
	docEl.style.cssText = '';
	// console.log(realRem, rem);
	return {
		realRem: realRem,
		rem: rem
	}
}
var __fontDiff = getBigFont();

(function() {
	if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
		handleFontSize();
	} else {
		document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
	}

	function handleFontSize() {
		// 设置网页字体为默认大小
		WeixinJSBridge.invoke('setFontSizeCallback', {
			'fontSize': 0
		});
		setTimeout(function() {
			console.log("shsh1")
			document.documentElement.style.fontSize = __fontDiff.rem + 'px';
		}, 0)
		// 重写设置网页字体大小的事件
		WeixinJSBridge.on('menu:setfont', function() {
			WeixinJSBridge.invoke('setFontSizeCallback', {
				'fontSize': 0
			});
			setTimeout(function() {
				document.documentElement.style.fontSize = __fontDiff.rem + 'px';
			}, 0)
		});
	}
})();


(function(win, doc) {
	var docEl = doc.documentElement;

	function setRemUnit() {
		var docWidth = docEl.clientWidth;
		var rem = docWidth / 10;
		// 按照iphone X的高度定制最大宽度
		// if (docWidth >= 812) {
		// 	rem = 81.2;
		// }
		if (typeof __articleEditMode__ !== 'undefined' && __articleEditMode__) {
			docEl.classList.add('article-edit-mode');
		} else {
			if (__fontDiff.realRem !== __fontDiff.rem) {
				// docEl.style.cssText = 'font-size: ' + rem + 'px !important';
				// docEl.style.cssText = 'font-size: 37.6px !important';
				docEl.style.cssText = 'font-size: ' + rem / (__fontDiff.realRem / __fontDiff.rem) + 'px !important';
			} else {
				docEl.style.cssText = 'font-size: ' + rem + 'px';
			}
		}
	}

	var resetRemUnit = null;

	win.addEventListener('resize', function() {
		if (innerWidth <= 250) return;
		clearTimeout(resetRemUnit);
		resetRemUnit = setTimeout(setRemUnit, 200);
	}, false);
	win.addEventListener('pageshow', function(e) {
		if (e.persisted) {
			clearTimeout(resetRemUnit);
			resetRemUnit = setTimeout(setRemUnit, 200)
		}
	}, false);

	setRemUnit();

	if (win.devicePixelRatio && win.devicePixelRatio >= 2) {
		var testEl = doc.createElement('div');
		var fakeBody = doc.createElement('body');
		testEl.style.border = '0.5px solid red';
		fakeBody.appendChild(testEl);
		docEl.appendChild(fakeBody);

		if (testEl.offsetHeight === 1) {
			docEl.classList.add('hairlines');
		}

		docEl.removeChild(fakeBody);
	}

	if (doc.readyState === 'complete') {
		setFontSize();
	} else {
		doc.addEventListener('DOMContentLoaded', function(e) {
			setFontSize();
		}, false);
	}

	function setFontSize(num) {
		if (__fontDiff.realRem !== __fontDiff.rem) {
			doc.body.style.fontSize = 12 / (__fontDiff.realRem / __fontDiff.rem) + 'px';
		} else {
			doc.body.style.fontSize = 12 + 'px';
		}
	}
})(window, document);

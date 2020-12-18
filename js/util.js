function req(option, which) {
	option = option || {};
	var url = option.url;
	url = my.paas.host + url;
	if (url.indexOf('?') > -1) {
		url += '&';
	} else {
		url += '?';
	}
	url += 'timestamp=' + new Date().toISOString() + '&app_key=' + paasAppKey;
	if (which == 'user') {
		url = url + "&user_id=" + my.paas.user_id;
		url = url + "&access_token=" + my.paas.access_token;
	}
	var data = option.data || {};
	var type = option.type || 'get';
	var success = option.success;
	var error = option.error;
	$.ajax({
		url: url,
		type: type,
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			'x-aqua-sign': getPaaS_x_aqua_sign(type, url)
		},
		success: function(data) {
			success && success(data);
		},
		error: function(e) {
			error && error(e);
		},
		complete: function(xhr, status) {}
	})
}

function addZero(num) {
	num = String(num);
	if (num.length == 1) {
		num = '0' + num;
	}
	return num;
}

var util = {
	addZero: addZero,
	req: req
}

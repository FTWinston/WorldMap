"use strict";

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadData(url) {
	url = url.replace('gist.github.com', 'gist.githubusercontent.com');
	
	if (url.indexOf('gist.githubusercontent.com') != -1 ) {
		if (url.charAt(url.length - 1) != '/');
			url += '/';
		
		var suffix = 'raw/';
		if (url.substr(-suffix.length) !== suffix)
			url += 'raw';
	}
	
	if (url.indexOf('://') == -1) {
		url = 'http://' + url;
	}
	
	$.getJSON(url, '', function (data) {
		addLinks(data);
		tables = data;
		listTables();
		$('#intro').hide();
		$('#displayRoot').show();
	});
}

$(function () {
	$('#loadUrl').click(function () {
		var url = $('#dataUrl').val();
		loadData(url);
		return false;
	});
	
	
	$('#modeSwitch').click(function () {
		$('body').toggleClass('edit');
		map.updateSize();
	});
});

var data;
var queryUrl = getParameterByName('source');
if (queryUrl != null)
	loadData(queryUrl);	
else
	data = new MapData(37, 37);
var map = new MapView(document.getElementById('mapRoot'), data);

document.getElementById('modeSwitch').onclick = function() {
	document.getElementById('editorRoot').classList.toggle('edit');
	map.updateSize();
	return false;
}
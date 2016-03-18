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
		editor.view.data = MapData.loadFromJSON(data);
		editor.view.updateSize();
		editor.drawCellTypes();
	});
}

var view = new MapView(document.getElementById('mapRoot'), new MapData(9, 9));
var editor = new MapEditor(view);

var queryUrl = getParameterByName('source');
if (queryUrl != null)
	loadData(queryUrl);	

document.getElementById('modeSwitch').addEventListener('click', function() {
	document.getElementById('editorRoot').classList.toggle('edit');
	editor.view.updateSize();
	return false;
});

/*
document.getElementById('loadUrl').addEventListener('click', function() {
	var url = document.getElementById('dataUrl').value;
	loadData(url);
	return false;
});
*/
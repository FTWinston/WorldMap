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
		data = MapData.loadFromJSON(data);
		map = new MapView(document.getElementById('mapRoot'), data);
	});
}

var data;
var queryUrl = getParameterByName('source');
if (queryUrl != null)
	data = loadData(queryUrl);	
else
	data = new MapData(9, 9);
var map = new MapView(document.getElementById('mapRoot'), data);
/*
document.getElementById('loadUrl').addEventListener('click', function() {
	var url = document.getElementById('dataUrl').value;
	loadData(url);
	return false;
});
*/
document.getElementById('modeSwitch').addEventListener('click', function() {
	document.getElementById('editorRoot').classList.toggle('edit');
	map.updateSize();
	return false;
});

document.getElementById('addBrushLink').addEventListener('click', function() {
	document.getElementById('brushName').value = '';
	document.getElementById('brushColor').value = '';
	document.getElementById('brushEdit').style.display = '';
	return false;
});

document.querySelector('#brushEdit .dialog-buttons .ok').addEventListener('click', function() {
	var type = new CellType(document.getElementById('brushName').value, document.getElementById('brushColor').value);
	map.data.cellTypes.push(type);
	map.drawCellTypes(document.getElementById('brushList'));
	return false;
});

var resizeWizard = new Wizard(document.getElementById('resize-wizard'), function (resize) {
	var number = parseInt(resize.number);
	if (resize.change != 'add')
		number = -number;
	
	switch (resize.edge) {
	case 'top':
		map.data.changeHeight(number, false);
		break;
	case 'bottom':
		map.data.changeHeight(number, true);
		break;
	case 'left':
		map.data.changeWidth(number, false);
		break;
	case 'right':
		map.data.changeWidth(number, true);
		break;
	}
	map.updateSize();
});

document.getElementById('resizeLink').addEventListener('click', function() {
	resizeWizard.show();
	return false;
});
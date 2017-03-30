function getParameterByName(name: string, url: string = null) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function get(url: string, callback: (string) => void, contentType: string = null) {
    let req = new XMLHttpRequest();
    req.open('GET', url);

    if (contentType !== null)
        req.setRequestHeader('Content-Type', contentType);

    req.onload = function() {
        if (req.status == 200)
            callback(req.response);
        else
            console.error(Error(req.statusText));
    };
    req.onerror = function() {
        console.error(Error('Network error'));
    };

    req.send();
}

function loadData(url: string) {
	url = url.replace('gist.github.com', 'gist.githubusercontent.com');
	
	if (url.indexOf('gist.githubusercontent.com') != -1 ) {
		if (url.charAt(url.length - 1) != '/')
			url += '/';
		
		let suffix = 'raw/';
		if (url.substr(-suffix.length) !== suffix)
			url += 'raw';
	}
	
	if (url.indexOf('://') == -1) {
		url = 'http://' + url;
	}
	
    get(url, function(data) {
        editor.view.data = MapData.loadFromJSON(data);
		editor.view.updateSize();
		editor.drawCellTypes();
    });
}

let view = new MapView(document.getElementById('mapRoot'), new MapData(500, 500));
let editor = new MapEditor(view);

let queryUrl = getParameterByName('source');
if (queryUrl != null)
	loadData(queryUrl);	

document.getElementById('modeSwitch').addEventListener('click', function() {
	document.getElementById('editorRoot').classList.toggle('edit');
	editor.view.updateSize();
	return false;
});

/*
document.getElementById('loadUrl').addEventListener('click', function() {
	let url = document.getElementById('dataUrl').value;
	loadData(url);
	return false;
});
*/
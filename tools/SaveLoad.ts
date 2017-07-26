class SaveLoad {
    static readonly localStorageName = 'savedMap';
    static readonly apiRoot = 'https://jsonbin.io/b/';

    static loadData (callback: (data: string|null) => void) {
        let identifier = SaveLoad.getQueryParam('id');
        if (identifier === undefined) {
            callback(null);
            return;
        }
        
        let url = SaveLoad.apiRoot + identifier;
        SaveLoad.getAjax(url, callback);

        // local storage of single map file
        //callback(window.localStorage.getItem(SaveLoad.localStorageName));
    }

    static saveData(dataJson: string, callback: (success: boolean) => void) {
        let identifier = SaveLoad.getQueryParam('id');
        let url = identifier === undefined ? SaveLoad.apiRoot + 'new' : SaveLoad.apiRoot + 'update/' + identifier;

        let dataObj = { snippet: dataJson };
        SaveLoad.postAjax(url, JSON.stringify(dataObj), function (data) {
            if (identifier === undefined) {
                identifier = JSON.parse(data).id;
                url = window.location.href.split('?')[0] + '?id=' + identifier;
                window.history.pushState(identifier, document.title, url);
            }

            callback(true);
        });

        // local storage of single map file
        //window.localStorage.setItem(SaveLoad.localStorageName, dataJson);
    }

    static clearSaved() {
        window.localStorage.removeItem(SaveLoad.localStorageName);
    }

    private static queryParams?: {[key:string]:string} = undefined;
    public static getQueryParam(name: string) {
        if (SaveLoad.queryParams === undefined) {
            SaveLoad.queryParams = {};
            let vars = window.location.search.substring(1).split('&');

            for (let i=0;i<vars.length;i++) {
                let pair = vars[i].split('=');
                SaveLoad.queryParams[pair[0]] = pair[1];
            }
        }

        return SaveLoad.queryParams[name];
    }

    private static getAjax(url: string, success: (data: string) => void) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
        };
        xhr.send();
        return xhr;
    }

    private static postAjax(url: string, data: any, success: (data: string) => void) {
        var params = typeof data == 'string' ? data : Object.keys(data).map(
                function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
            ).join('&');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
        };
        xhr.setRequestHeader('Content-Type', 'application/json');//'application/x-www-form-urlencoded');
        xhr.send(params);
        return xhr;
    }
}
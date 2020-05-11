let api = (function(){
    let module = {};
    let ws = null;

    module.connect = function(url) {
        ws = new WebSocket(url);
        return ws;
    };

    module.send = function(data) {
        ws.send(JSON.stringify(data));
    };

    module.getWebSocket = function() {
        return ws;
    };
    
    return module;
})();

export default api;
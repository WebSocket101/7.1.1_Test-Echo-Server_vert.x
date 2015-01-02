var vertx = require('vertx');
var console = require('vertx/console');
var webServer = vertx.createHttpServer();
var sockets = [];
var clients = 0;

webServer.websocketHandler(function(ws) {
	if(ws.path() === "/watch") {
		clients++;
		sockets.push(ws);
		for (var i = 0; i < sockets.length; i++)
			sockets[i].writeTextFrame(clients);
		ws.closeHandler(function(buffer){
			clients--;
			if(sockets.indexOf(ws) >= 0)
				sockets.splice(sockets.indexOf(ws),1);
			for (var i = 0; i < sockets.length; i++)
			 	sockets[i].writeTextFrame(clients);
		});
	}
	else if(ws.path() === "/echo") {
		clients++;
		for(var i = 0; i < sockets.length;i++)
			sockets[i].writeTextFrame(clients);
		ws.dataHandler(function(buffer) {
			ws.writeTextFrame(buffer.toString());
		});	
		ws.closeHandler(function(buffer) {
			clients--;
			for (var i = 0; i < sockets.length; i++)
			 	sockets[i].writeTextFrame(clients);
		});
	}
	else{
		ws.reject();
	}
});

webServer.requestHandler(function(req) {
	req.response.sendFile("index.html");
});

webServer.listen(3000);
console.log("Der EchoServer laeuft auf dem Port 3000");
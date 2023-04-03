/*
 * APP DISTRIBUTION ON NODE JS SERVER
 */
var express = require('express');
var server = express();
server.set('port', 8080);
server.use(express.static(__dirname + '/'));

server.get('/',function(req, res) {
  res.sendfile('./home');
});

server.get('/',function(req, res) {
  res.sendfile('./displacement');
});

/*
 * PROXY CONFIGURATION
 */
var HASH_MAP_EXTERNAL_SERVICES = {
    "RHETICUS_API" : "http://localhost:8090",
    "MARINE" : "http://localhost:8080/marine",
    "DISPLACEMENT" : "http://localhost:8080/displacement",
  	"IFFI" : "https://sinacloud.isprambiente.it/arcgisina/services/iffi/Progetto_IFFI_WMS_public/MapServer/WMSServer",
  	"GEOSERVER" : "http://carme.planetek.it",
    "MULE" : "http://carme.planetek.it:9097",
    "NGINX_PDF": "http://localhost:8089"
};

var httpProxy = require('http-proxy');
httpProxy.prototype.onError = function (err) {
	console.log(err);
};

var proxyOptions = {
  changeOrigin: true
};
var apiProxy = httpProxy.createProxyServer(proxyOptions);
// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.

function deleteAuthorizationFromRequestHeaders(req) {
  //console.log('RAW headers from the target', JSON.stringify(req.headers, true, 2));
  if (req.headers["authorization"]){
    // auth is in base64(username:password)  so we need to decode the base64
    delete req.headers["authorization"];
  }
}

// Grab proxyReq
apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
  //deleteAuthorizationFromRequestHeaders(req);
});

// Grab proxyRes and add CORS
apiProxy.on('proxyRes', function (proxyRes, req, res) {
  //console.log(req.headers);
  if (proxyRes.headers["www-authenticate"]){
    delete proxyRes.headers["www-authenticate"];
  }
  proxyRes.headers["Access-Control-Allow-Origin"] = "*";
  //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

//Grab error messages
apiProxy.on('error', function (err, req, res) {
  res.end('Something went wrong. And we are reporting a custom error message.');
});

// Grab all requests to the server with "/displacement".
server.all("/displacement", function(req, res) {
  req.url = req.url.replace('/displacement','');
	//console.log("Forwarding rheticus requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.DISPLACEMENT});
});

// Grab all requests to the server with "/marine".
server.all("/marine", function(req, res) {
	req.url = req.url.replace('/marine','');
	//console.log("Forwarding rheticus requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.MARINE});
});

// Grab all requests to the server with "/iffi".
server.all("/iffi*", function(req, res) {
  deleteAuthorizationFromRequestHeaders(req);
	req.url = req.url.replace('/iffi/','');
	//console.log("Forwarding IFFI API requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.IFFI});
});

// Grab all requests to the server with "/rheticusapi".
server.all("/rheticusapi*", function(req, res) {
	req.url = req.url.replace('/rheticusapi/','');
	//console.log("Forwarding RHETICUS API requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.RHETICUS_API});
});

// Grab all requests to the server with "/oauth".
server.all("/oauth/token", function(req, res) {
	//console.log("Forwarding RHETICUS API requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.RHETICUS_API});
});

// Grab all requests to the server with "/oauth".
// server.all("/rheticusjapi/*", function(req, res) {
//   req.url = req.url.replace('/rheticusjapi','');
// 	//console.log("Forwarding RHETICUS API requests to: "+req.url);
// 	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.RHETICUS_JAVA_API});
// });

// Grab all requests to the server with "/geoserver".
server.all("/geoserver*", function(req, res) {
  // auth is in base64(username:password)  so we need to decode the base64
  var auth = req.headers['authorization'];
  console.log(auth===undefined)
  //console.log("Authorization Header is: ", auth);
  if ((auth===undefined) && (req.query.BASIC_AUTH!==undefined) && (req.query.BASIC_AUTH!=="")){
    console.log(req.query.BASIC_AUTH);
    req.headers['authorization'] = "Basic " + req.query.BASIC_AUTH;
    req.headers['Host'] = "carme.planetek.it";
  }
  if (req.query.BASIC_AUTH){
    delete req.query.BASIC_AUTH;
  }
  if (req.headers["upgrade-insecure-requests"]){
    delete req.headers["upgrade-insecure-requests"];
  }
  //console.log("Forwarding Geoserver API requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.GEOSERVER});
});

// Grab all requests to the server with "/esb".
server.all("/esb*", function(req, res) {
	req.url = req.url.replace('/esb/','');
	//console.log("Forwarding MULE requests to: "+req.url);
	apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.MULE});
});

// Grab all requests to the server with "/esb".
server.all("/home/pdf*", function(req, res) {
  req.url = req.url.replace('/home/pdf/','');
  //console.log("Forwarding MULE requests to: "+req.url);
  apiProxy.web(req, res, {target: HASH_MAP_EXTERNAL_SERVICES.NGINX_PDF});
});

/*
 * Start Server.
 */
server.listen(server.get('port'), function() {
  console.log('Express server listening on port ' + server.get('port'));
});

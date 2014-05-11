var emptyPort   = require('empty-port')
var http        = require('http')
var request     = require('request')
var querystring = require('querystring')

module.exports.start = function(serviceName, processCommand) {
  var createServer = function(port) {
    http.createServer(function (req, res) {
      var body = "";

      req.on('data', function (chunk) {
        body += chunk;
      })

      req.on('end', function () {
        res.writeHead(200, {'Access-Control-Allow-Origin': '*'})
        res.end('OK!');

        if (body) {
          var formData = JSON.parse(body);
          processCommand(formData)
        }
      });
    }).listen(port)

    console.log("Listinging on port " + port)
  }

  var registerServer = function(port) {
    var serviceEndpoint = {name: serviceName, endpoint: "http://localhost:" + port}
    var serviceData = JSON.stringify(serviceEndpoint)

    request.post("http://localhost:9000/services", {body: serviceData}, function(err) {
      if (err) {
        console.error("Couldn't register service at " + serviceData + " with router!")
        throw err
      }
    });
  }

  emptyPort({}, function(err, port) {
    createServer(port)
    registerServer(port)
  })
}

module.exports.talk = function(message) {
  request.get("http://localhost:4000?say=" + querystring.escape(message), function(err) {
    if (err) {
      return console.error("Couldnt request voice server", err)
    }
  });
}
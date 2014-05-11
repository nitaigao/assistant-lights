  var http        = require('http'),
      request     = require('request'),
      querystring = require('querystring');

function changeLightState(state) {
  var textState = state ? "On" : "Off"
  var message = "Switching Lights " + textState
  console.log(message)
  
  request.get("http://localhost:4000?say=" + querystring.escape(message), function(err) {
    if (err) {
      return console.error("Couldnt request voice server", err)
    }
  });

  request.post("http://localhost:5000/api/device/Lights?state=" + textState.toLowerCase(), function(err) {
    if (err) {
      return console.error("Couldnt post to light server", err)
    }
  });
}

function toggleLight() {
  request.get("http://localhost:5000/api/device/Lights", function(err, response) {
    var lightState = JSON.parse(response.body).state
    changeLightState(!lightState)
  });
}

function processCommand(command) {
  console.log(command)

  if (command.on_off != undefined) {
    if (command.on_off.value == 'toggle') {
      toggleLight()
    }

    if (command.on_off.value == 'on') {
      changeLightState(1)
    }

    if (command.on_off.value == 'off') {
      changeLightState(0)
    }
  }
}

function createServer(port) {
  http.createServer(function (req, res) {
    var body = "";

    req.on('data', function (chunk) {
      body += chunk;
    })

    req.on('end', function () {
      res.writeHead(200, {'Access-Control-Allow-Origin': '*'})
      res.end('OK!');

      var formData = JSON.parse(body);
      processCommand(formData)
    });

  }).listen(port)
}

function start() {
  createServer(8100)
}

start()

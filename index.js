var request   = require('request'),
    faye      = require('faye'),
    settings  = require('env-settings')
;

function changeLightState(state) {
  var textState = state ? "On" : "Off"
  var message = "Switching Lights " + textState
  console.log(message);

  var client = new faye.Client(settings.brain + '/');
  client.publish('/responses', message);

  request.post("http://localhost:5000/api/device/Lights?state=" + textState.toLowerCase(), function(err) {
    if (err) {
      return console.error("Couldnt post to light server", err)
    }
  });
}

function toggleLight() {
  console.log("Toggling Lights...");
  request.get("http://localhost:5000/api/device/Lights", function(err, response) {
    var lightState = JSON.parse(response.body).state
    changeLightState(!lightState)
  });
}

function start() {
  var client = new faye.Client(settings.brain + '/');
  client.subscribe('/light_control', function(message) {
    var command = JSON.parse(message);
    if (command.commands.on_off != undefined) {
      for (var i = 0; i < command.commands.on_off.length; i++) {
        var lightCommand = command.commands.on_off[i];

        if (lightCommand.value == 'toggle') {
          toggleLight()
        }

        if (lightCommand.value == 'on') {
          changeLightState(1)
        }

        if (lightCommand.value == 'off') {
          changeLightState(0)
        }
      }
    }
  });
}

start();

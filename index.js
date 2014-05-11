var service = require('./service')
var request = require('request')

function changeLightState(state) {
  var textState = state ? "On" : "Off"
  var message = "Switching Lights " + textState
  console.log(message)

  service.talk(message)
  
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

service.start("light_control", function(command) {
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
});
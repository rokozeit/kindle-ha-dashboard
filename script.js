var secrets = null;
var config = [];

document.addEventListener('dblclick', function (event) {
  event.preventDefault();
});

function createDeviceControls(id, initialValue, step, min, max, unit, onChange, disabled) {
  var wrapper = document.createElement('div');
  wrapper.className = 'controls-wrapper';
  wrapper.id = id;

  var display = document.createElement('div');
  display.className = 'controls-display';
  display.innerHTML = (initialValue || 0) + (unit || '');

  var minusBtn = document.createElement('button');
  minusBtn.className = 'controls-button';
  minusBtn.innerHTML = '-';

  var plusBtn = document.createElement('button');
  plusBtn.className = 'controls-button';
  plusBtn.innerHTML = '+';

  var value = Number(initialValue) || 0;

  function updateDisplay() {
    display.innerHTML = value + (unit || '');
    onChange(value);
  }

  minusBtn.onclick = function () {
    if (value > min) {
      value = Math.max(min, value - step);
      updateDisplay();
    }
  };

  plusBtn.onclick = function () {
    if (value < max) {
      value = Math.min(max, value + step);
      updateDisplay();
    }
  };

  wrapper.appendChild(display);
  wrapper.appendChild(minusBtn);
  wrapper.appendChild(plusBtn);

  minusBtn.disabled = disabled;
  plusBtn.disabled = disabled;

  wrapper.setValue = function (newValue) {
    value = Number(newValue) || 0;
    updateDisplay();
  };

  return wrapper;
}


function createDeviceSwitch(id, initialState, onToggle, iconClasses) {
  var btn = document.createElement('span');
  btn.id = id;
  btn.className = 'device-switch';

  var icon = document.createElement('i');
  icon.className = (initialState === 'on')
    ? (iconClasses.on || 'fas fa-lightbulb')
    : (iconClasses.off || 'far fa-lightbulb');
  btn.appendChild(icon);

  if (initialState === 'on') {
    btn.className += ' on';
  }

  var state = initialState;

  btn.onclick = function () {
    state = (state === 'on') ? 'off' : 'on';

    icon.className = (state === 'on')
      ? (iconClasses.on || 'fas fa-lightbulb')
      : (iconClasses.off || 'far fa-lightbulb');

    btn.className = 'device-switch' + (state === 'on' ? ' on' : '');

    onToggle(state);
  };

  return btn;
}

function createDeviceControlWrapper(id, initialState, labelText, controlInitial, unit, onToggle, onControlChange, iconClasses) {
  var wrapper = document.createElement('div');
  wrapper.className = 'device-control-wrapper';
  wrapper.id = id;

  var leftCell = document.createElement('div');
  leftCell.className = 'device-control-left';

  var rightCell = document.createElement('div');
  rightCell.className = 'device-control-right';

  var controlDisabled = (initialState !== 'on');

  var control = createDeviceControls(id + '_control', controlInitial, 5, 0, 100, unit, function (value) {
    onControlChange(value);
  }, controlDisabled);

  control.setControlsDisabled = function (disabled) {
    var buttons = control.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = disabled;
    }
    var displays = control.getElementsByClassName('controls-display');
    if (displays.length > 0) {
      displays[0].style.color = disabled ? 'gray' : 'black';
    }
  };

  rightCell.appendChild(control);

  var toggleButton = createDeviceSwitch(id + '_toggle', initialState, function (newState) {
    controlDisabled = (newState !== 'on');

    control.setControlsDisabled(controlDisabled);

    var service = (newState === 'on') ? 'turn_on' : 'turn_off';
    callHomeAssistantService('light', service, { entity_id: id });

    if (newState === 'on') {
      setTimeout(function () {
        callHomeAssistantAPI(id, function (err, data) {
          if (!err && data && data.attributes) {
            var updatedValue = controlInitial; // fallback

            if (typeof data.attributes.brightness !== 'undefined') {
              updatedValue = Math.round((data.attributes.brightness / 255) * 100);
            } else if (typeof data.attributes.brightness_pct !== 'undefined') {
              updatedValue = data.attributes.brightness_pct;
            } else if (typeof data.attributes.temperature !== 'undefined') {
              updatedValue = data.attributes.temperature;
            } else if (!isNaN(parseFloat(data.state))) {
              updatedValue = parseFloat(data.state);
            }

            var displays = control.getElementsByClassName('controls-display');
            if (displays.length > 0) {
              displays[0].innerHTML = updatedValue + (unit || '');
            }

            control.setValue(updatedValue);
          }
        });
      }, 1000);
    }

    onToggle(newState);
  }, iconClasses);

  leftCell.appendChild(toggleButton);

  var label = document.createElement('span');
  label.className = 'device-control-text';
  label.innerHTML = labelText;
  leftCell.appendChild(label);

  wrapper.appendChild(leftCell);
  wrapper.appendChild(rightCell);

  return wrapper;
}



function createSensorDisplay(config) {
  var wrapper = document.createElement('div');
  wrapper.className = 'sensor-display-wrapper';
  wrapper.id = config.id;

  var leftCell = document.createElement('div');
  leftCell.className = 'sensor-cell left-cell';

  var iconWrapper = document.createElement('div');
  iconWrapper.className = 'sensor-icon-wrapper';

  var icon = document.createElement('i');
  icon.className = config.iconClass;
  iconWrapper.appendChild(icon);

  var label = document.createElement('span');
  label.className = 'sensor-label';
  label.innerHTML = config.labelText;

  leftCell.appendChild(iconWrapper);
  leftCell.appendChild(label);

  var rightCell = document.createElement('div');
  rightCell.className = 'sensor-cell right-cell';

  var valueSpan = document.createElement('span');
  valueSpan.className = 'sensor-value';
  valueSpan.innerHTML = (config.value != null ? config.value : '') + (config.unit || '');
  rightCell.appendChild(valueSpan);

  wrapper.appendChild(leftCell);
  wrapper.appendChild(rightCell);

  return wrapper;
}

function createDeviceStatus(config) {
  var wrapper = document.createElement('div');
  wrapper.className = 'device-status-wrapper';
  wrapper.id = config.id;

  var icon = document.createElement('i');
  var state = config.state || 'off';

  var iconClasses = config.iconClasses || {};
  icon.className = (state === 'on')
    ? (iconClasses.on || 'fas fa-check-circle')
    : (iconClasses.off || 'far fa-circle');
  icon.classList.add('device-status-icon');

  var label = document.createElement('span');
  label.className = 'device-status-label';
  label.innerHTML = config.labelText || '';

  wrapper.appendChild(icon);
  wrapper.appendChild(label);

  return wrapper;
}

function createCard(id, title, children) {
  var wrapper = document.createElement('div');
  wrapper.className = 'card';
  wrapper.id = id;

  var header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = title;

  var body = document.createElement('div');
  body.className = 'card-body';

  children.forEach(function (child) {
    body.appendChild(child);
  });

  wrapper.appendChild(header);
  wrapper.appendChild(body);

  return wrapper;
}

function callHomeAssistantAPI(entityId, callback) {
  var apiCallUrl = secrets.url + '/api/states/' + encodeURIComponent(entityId);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", apiCallUrl, true);
  xhr.setRequestHeader("Authorization", 'Bearer ' + secrets.token);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        callback(null, response);
      } catch (e) {
        callback(e);
      }
    } else if (xhr.readyState === 4) {
      callback(new Error("HTTP error: " + xhr.status));
    }
  };

  xhr.send();
}

function callHomeAssistantService(domain, service, data) {
  var apiCallUrl = secrets.url + "/api/services/" + domain + "/" + service;

  try {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiCallUrl, true);

    xhr.setRequestHeader("Authorization", "Bearer " + secrets.token);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("Service call OK:", domain + "/" + service);
        } else {
          console.error("Service call failed:", xhr.status, xhr.responseText);
          alert("Error when switching: " + xhr.status);
        }
      }
    };

    var json = JSON.stringify(data || {});
    xhr.send(json);
  } catch (e) {
    console.error("Exception during service call to home assistant:", e);
  }
}

function renderTabs(config) {
  var tabList = document.getElementById('tab-list');
  var tabContent = document.getElementById('tab-content');

  tabList.innerHTML = '';
  tabContent.innerHTML = '';

  for (var i = 0; i < config.tabs.length; i++) {
    (function (index) {
      var tab = config.tabs[index];
      var tabElement = document.createElement('li');
      tabElement.textContent = tab.title;
      tabElement.setAttribute('data-index', index);

      if (index === 0) {
        tabElement.className = 'active';
        renderCards(tab.cards);
      }

      tabElement.addEventListener('click', function () {
        var allTabs = document.querySelectorAll('#tab-list li');
        for (var j = 0; j < allTabs.length; j++) {
          allTabs[j].className = '';
        }
        tabElement.className = 'active';
        renderCards(tab.cards);
      });

      tabList.appendChild(tabElement);
    })(i);
  }
}

function renderCards(cards) {
  var tabContent = document.getElementById('tab-content');
  tabContent.innerHTML = '';

  for (var i = 0; i < cards.length; i++) {
    (function (card) {
      var cardDiv = document.createElement('div');
      cardDiv.className = 'card';

      var header = document.createElement('div');
      header.className = 'card-header';
      header.textContent = card.title;
      cardDiv.appendChild(header);

      var body = document.createElement('div');
      body.className = 'card-body';
      cardDiv.appendChild(body);

      for (var j = 0; j < card.items.length; j++) {
        (function (item) {
          callHomeAssistantAPI(item.entity_id, function (err, data) {
            if (err) {
              body.appendChild(document.createTextNode('Error at ' + item.name));
              console.error('Error when calling ', item.entity_id, ':', err);
              return;
            }

            if (item.type === 'sensor') {
              var sensorElem = createSensorDisplay({
                id: item.entity_id,
                iconClass: item.iconClass,
                labelText: item.name,
                value: data.state,
                unit: item.unit
              });
              body.appendChild(sensorElem);
            } else if (item.type === 'control') {
              var controlInitial = item.controlInitial;

              if (data.attributes) {
                if (typeof data.attributes.brightness !== 'undefined') {
                  controlInitial = Math.round((data.attributes.brightness / 255) * 100);
                } else if (typeof data.attributes.brightness_pct !== 'undefined') {
                  controlInitial = data.attributes.brightness_pct;
                } else if (typeof data.attributes.temperature !== 'undefined') {
                  controlInitial = data.attributes.temperature;
                }
              } else if (!isNaN(parseFloat(data.state))) {
                controlInitial = parseFloat(data.state);
              }

              var controlElem = createDeviceControlWrapper(
                item.entity_id,
                data.state,
                item.name,
                controlInitial,
                item.unit,
                function (newState) {
                  var service = (newState === 'on') ? 'turn_on' : 'turn_off';
                  callHomeAssistantService('light', service, {
                    entity_id: item.entity_id
                  });
                },
                function (value) {
                  if (item.entity_id.indexOf('light.') === 0) {
                    callHomeAssistantService('light', 'turn_on', {
                      entity_id: item.entity_id,
                      brightness_pct: Math.round(value)
                    });
                  } else if (item.entity_id.indexOf('climate.') === 0) {
                    callHomeAssistantService('climate', 'set_temperature', {
                      entity_id: item.entity_id,
                      temperature: value
                    });
                  }
                },
                item.iconClasses
              );
              body.appendChild(controlElem);
            } else if (item.type === 'status') {
              var statusElem = createDeviceStatus({
                id: item.entity_id,
                labelText: item.name,
                state: data.state,
                iconClasses: item.iconClasses
              });
              body.appendChild(statusElem);
            }
          });
        })(card.items[j]);
      }

      tabContent.appendChild(cardDiv);
    })(cards[i]);
  }
}


function loadStates() {
  var dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';  // Vorherigen Inhalt leeren
  renderTabs(config);
}

// Optional: alle 30 Sekunden aktualisieren
setInterval(loadStates, 30000);

function loadSecrets(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'secrets.json', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        secrets = JSON.parse(xhr.responseText);
        callback();
      } else {
        console.error('Error loading secrets.json:', xhr.status, xhr.statusText);
        alert('Error loading secrets.json. Please chec.');
      }
    }
  };
  xhr.send();
}

function loadConfig(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'config.json', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        config = JSON.parse(xhr.responseText);
        callback();
      } else {
        console.error('Error loading config.json:', xhr.status, xhr.statusText);
        alert('Error loading config.json. Please check the configuration.');
      }
    }
  };
  xhr.send();
}

loadSecrets(function () {
  loadConfig(function () {
    renderTabs(config);
  });
});
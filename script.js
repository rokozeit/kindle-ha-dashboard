var config = null,
    entityCards = {};

var secrets = null,
    entityCards = {};

function httpRequest(method, url, token, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) callback(xhr.status, xhr.responseText);
    };
    xhr.send();
}

function loadConfig(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'config.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            config = JSON.parse(xhr.responseText);
            callback();
        }
    };
    xhr.send();
}

function loadSecrets(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'secrets.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            secrets = JSON.parse(xhr.responseText);
            callback();
        }
    };
    xhr.send();
}


function createContainer(cssClasses, cssId) {
    var container = document.createElement('div');
    container.id = cssId;
    container.classList.add(cssClasses);
    return container;
}

function createIcon(cssClasses, faIcon) {
    var icon = document.createElement('i');
    icon.className = faIcon || 'fa fa-question';
    icon.classList.add(cssClasses);
    return icon;
}

function createSwitchView(ccsClass, entity) {
    var switchContainer = createContainer('sensor-row', 'switch_' + entity.entity_id);
}

function createSeonsorView(body, entity) {

    var sensorContainer = createContainer('sensor-row', 'sensor_' + entity.entity_id);

    var icon = createIcon('icon', 'fa ' + (entity.icon || 'fa-tachometer'))

    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = entity.name;

    var valueSpan = document.createElement('span');
    valueSpan.className = 'value';
    valueSpan.id = 'val_' + entity.entity_id;
    valueSpan.textContent = '-';

    sensorContainer.appendChild(icon);
    sensorContainer.appendChild(nameSpan);
    sensorContainer.appendChild(valueSpan);
    body.appendChild(sensorContainer);

    if (!entityCards[entity.entity_id]) entityCards[entity.entity_id] = [];
    entityCards[entity.entity_id].push({ value: valueSpan });
}

function createCardGroup(cardConfig) {
    var card = document.createElement('div');
    card.className = 'card';

    var header = document.createElement('div');
    header.className = 'card-header';
    var h3 = document.createElement('h3');
    h3.textContent = cardConfig.name;
    header.appendChild(h3);
    card.appendChild(header);

    var body = document.createElement('div');
    body.className = 'card-body';

    cardConfig.entities.forEach(function (entity) {
        if (entity.type === 'sensor') {
            createSeonsorView(body, entity);
        } else if (entity.type === 'light' || entity.type === 'switch') {
            // outer container for either light or switch containing icon and inner controls
            var lightOrSwitchOuterContainer = document.createElement('div');
            lightOrSwitchOuterContainer.className = 'light-switch-container';

            var icon = createIcon('icon', entity.icon ? entity.icon : 'fa ' + (entity.type === 'light' ? 'fa-lightbulb-o' : 'fa-plug'));
            
            lightOrSwitchOuterContainer.appendChild(icon);

            // container for light switch and brightness controls
            var lightOrSwitchInnerContainer = document.createElement('div');
            lightOrSwitchInnerContainer.className =  'inner-part';


            var switchContainer = createSwitchView('sensor-row-inner', entity);

            // container for the switch (either light or switch)
            var switchContainer = document.createElement('div');
            switchContainer.className = 'sensor-row-inner';

            var label = document.createElement('label');
            label.textContent = entity.name;
            label.className = 'name';
            label.classList.add('spacing')

            switchContainer.appendChild(label);

            var btn = document.createElement('button');
            btn.className = 'btn off';
            btn.classList.add('value');
            btn.innerHTML = 'Laden...';

            if (entity.type === 'light') {
                var brightnessControll = document.createElement('div');
                brightnessControll.className = 'sensor-row-inner';

                var lbl = document.createElement('label');
                lbl.textContent = 'Helligkeit %: ';
                lbl.className = 'name';
                lbl.classList.add('spacing')

                brightnessControll.appendChild(lbl);

                var brightnessInputControll = document.createElement('div');
                brightnessInputControll.className = 'value';

                var brightnessTextInput = document.createElement('input');
                brightnessTextInput.type = 'number';
                brightnessTextInput.min = 0;
                brightnessTextInput.max = 100;
                brightnessTextInput.value = 50;
                // brightnessTextInput.disabled = true; // Initially disabled until light is turned on
                brightnessTextInput.className = 'brightness';
                brightnessInputControll.appendChild(brightnessTextInput);

                brightnessButtons = document.createElement('div');
                brightnessButtons.className = 'button';

                var minus = document.createElement('button');
                minus.innerHTML = '-';
                minus.className = 'button';
                brightnessInputControll.appendChild(minus);

                var plus = document.createElement('button');
                plus.innerHTML = '+';
                plus.className = 'button';
                brightnessInputControll.appendChild(plus);

                brightnessControll.appendChild(brightnessInputControll);

                btn.onclick = function () {
                    toggleEntity(entity, btn.innerHTML === 'Off' ? 'off' : 'on', btn);
                };

                minus.onclick = function () {
                    var v = Math.max(0, parseInt(brightnessTextInput.value, 10) - 10);
                    brightnessTextInput.value = v;
                    setLightBrightness(entity, v);
                };

                plus.onclick = function () {
                    var v = Math.min(100, parseInt(brightnessTextInput.value, 10) + 10);
                    brightnessTextInput.value = v;
                    setLightBrightness(entity, v);
                };

                brightnessTextInput.onchange = function () {
                    var v = Math.max(0, Math.min(100, parseInt(brightnessTextInput.value, 10)));
                    brightnessTextInput.value = v;
                    setLightBrightness(entity, v);
                };

                switchContainer.appendChild(btn);

                lightOrSwitchInnerContainer.appendChild(switchContainer);
                lightOrSwitchInnerContainer.appendChild(brightnessControll);
                lightOrSwitchOuterContainer.appendChild(lightOrSwitchInnerContainer);

                if (!entityCards[entity.entity_id]) entityCards[entity.entity_id] = [];
                entityCards[entity.entity_id].push({ button: btn, brightness: brightnessTextInput });

            } else if (entity.type === 'switch') {
                btn.onclick = function () {
                    var st = btn.innerHTML === 'Off' ? 'off' : 'on';
                    toggleEntity(entity, st);
                };

                switchContainer.appendChild(btn);
                lightOrSwitchOuterContainer.appendChild(switchContainer);

                if (!entityCards[entity.entity_id]) entityCards[entity.entity_id] = [];
                entityCards[entity.entity_id].push({ button: btn });
            }

            body.appendChild(lightOrSwitchOuterContainer);
        }
    });

    card.appendChild(body);
    document.getElementById('container').appendChild(card);
}

function toggleEntity(entity, state) {
    var domain = entity.type,
        url = secrets.url + '/api/services/' + domain + '/turn_' + state,
        data = { entity_id: entity.entity_id };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + secrets.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) loadStates();
    };
    xhr.send(JSON.stringify(data));
}

function setLightBrightness(entity, percent) {
    var url = secrets.url + '/api/services/light/turn_on',
        data = {
            entity_id: entity.entity_id,
            brightness: Math.round((percent / 100) * 255)
        };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + secrets.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) loadStates();
    };
    xhr.send(JSON.stringify(data));
}

function loadStates() {
    var url = secrets.url + '/api/states';
    httpRequest('GET', url, secrets.token, function (status, res) {
        if (status !== 200) return;
        var arr = JSON.parse(res);
        for (var i = 0; i < arr.length; i++) {
            var s = arr[i],
                cardList = entityCards[s.entity_id];
            if (!cardList) continue;

            cardList.forEach(function (card) {
                if (card.button) {
                    var st = s.state;
                    card.button.className = 'btn ' + (st === 'on' ? 'on' : 'off');
                    card.button.classList.add('value');
                    card.button.innerHTML = st === 'on' ? 'Off' : 'On';
                }
                if (card.brightness) {
                    var pct = Math.round((s.attributes.brightness / 255) * 100);
                    card.brightness.value = isNaN(pct) ? 0 : pct;
                    card.brightness.disabled = (s.state !== 'on');
                }
                if (card.value) {
                    var v = s.state;
                    if (s.attributes.unit_of_measurement) v += ' ' + s.attributes.unit_of_measurement;
                    card.value.innerHTML = v;
                }
            });
        }
    });
}

loadSecrets(function () {
    loadConfig(function () {
        for (var c = 0; c < config.cards.length; c++) {
            createCardGroup(config.cards[c]);
        }
        loadStates();
        setInterval(loadStates, 10000);
    });
});

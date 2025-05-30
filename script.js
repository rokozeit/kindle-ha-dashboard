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
            var sensorContainer = document.createElement('div');
            sensorContainer.className = 'sensor-row';

            var icon = document.createElement('i');
            icon.className = 'fa ' + (entity.icon || 'fa-tachometer');
            icon.classList.add('icon');

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
        } else if (entity.type === 'light' || entity.type === 'switch') {
            var lightOrSwitchContainer = document.createElement('div');
            lightOrSwitchContainer.className = 'sensor-row';

            var icon = document.createElement('i');
            icon.className = 'fa ' + (entity.type === 'light' ? 'fa-lightbulb-o' : 'fa-plug');
            icon.classList.add('icon');

            lightOrSwitchContainer.appendChild(icon);

            var switchContainer = document.createElement('div');
            switchContainer.className = 'switch-container';

            var label = document.createElement('span');
            label.textContent = entity.name;
            label.className = 'name';
        
            switchContainer.appendChild(label);

            var btn = document.createElement('button');
            btn.className = 'btn off';
            btn.innerHTML = 'Laden...';

            if (entity.type === 'light') {
                var brightnessControll = document.createElement('div');
                brightnessControll.className = 'brightness-control';

                var lbl = document.createElement('label');
                lbl.textContent = 'Helligkeit %: ';
                lbl.className = 'name';
                brightnessControll.appendChild(lbl);

                brightnessInputControll = document.createElement('div');
                brightnessInputControll.className = 'input';


                var brightnessInput = document.createElement('input');
                brightnessInput.type = 'number';
                brightnessInput.min = 0;
                brightnessInput.max = 100;
                brightnessInput.value = 50;
                brightnessInputControll.appendChild(brightnessInput);

                var minus = document.createElement('button');
                minus.innerHTML = '-';
                brightnessInputControll.appendChild(minus);

                var plus = document.createElement('button');
                plus.innerHTML = '+';
                brightnessInputControll.appendChild(plus);

                brightnessControll.appendChild(brightnessInputControll);

                btn.onclick = function () {
                    toggleEntity(entity, btn.innerHTML === 'Off' ? 'off' : 'on', btn);
                };

                minus.onclick = function () {
                    var v = Math.max(0, parseInt(brightnessInput.value, 10) - 10);
                    brightnessInput.value = v;
                    setLightBrightness(entity, v);
                };

                plus.onclick = function () {
                    var v = Math.min(100, parseInt(brightnessInput.value, 10) + 10);
                    brightnessInput.value = v;
                    setLightBrightness(entity, v);
                };

                brightnessInput.onchange = function () {
                    var v = Math.max(0, Math.min(100, parseInt(brightnessInput.value, 10)));
                    brightnessInput.value = v;
                    setLightBrightness(entity, v);
                };

                switchContainer.appendChild(btn);

                lightOrSwitchContainer.appendChild(switchContainer);
                lightOrSwitchContainer.appendChild(brightnessControll);


                if (!entityCards[entity.entity_id]) entityCards[entity.entity_id] = [];
                entityCards[entity.entity_id].push({ button: btn, brightness: brightnessInput });

            } else if (entity.type === 'switch') {
                btn.onclick = function () {
                    var st = btn.innerHTML === 'Off' ? 'off' : 'on';
                    toggleEntity(entity, st, btn);
                };

                switchContainer.appendChild(btn);
                lightOrSwitchContainer.appendChild(switchContainer);

                if (!entityCards[entity.entity_id]) entityCards[entity.entity_id] = [];
                entityCards[entity.entity_id].push({ button: btn });
            }

            body.appendChild(lightOrSwitchContainer);
        }
    });

    card.appendChild(body);
    document.getElementById('container').appendChild(card);
}

function toggleEntity(entity, state, btn, brightnessPercent) {
    var domain = entity.type,
        url = secrets.url + '/api/services/' + domain + '/turn_' + state,
        data = { entity_id: entity.entity_id };

    if (entity.type === 'light' && state === 'on' && typeof brightnessPercent !== 'undefined') {
        data.brightness = Math.round((brightnessPercent / 100) * 255);
    }

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

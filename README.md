# Kindle Dashboard for Home Assistant

Transform your **Kindle Paperwhite (7th Gen)** into a low-power, always-on **smart home display** using Home Assistant.

> This project is designed for older Kindle devices running firmware **below 5.16.4** with the crappy browser.



## Motivation

The browser on older Kindles is extremely limited and cannot render full-featured [Home Assistant](https://www.home-assistant.io/) dashboards.

Most similar projects only display **static screenshots** of the dashboard. While functional, I wanted something **more interactive**, without fully rebuilding the UI from scratch everytime.



## About the Project

This project aims to:

- Render simplified, old Kindle-compatible dashboards
- Provide minimal interactivity (e.g., toggling lights, showing live data)
- Run on old Kindle e.g. Paperwhite (7th Gen) in **experimental browser mode**

I’m not a professional developer — this was a learning project heavily assisted by **ChatGPT**.


## What You Can Do

The great news: **you can use this project without jailbreaking your Kindle**.

Simply host this project on an HTTP web server and access it from your Kindle’s **experimental browser**.

- The dashboard is built using **plain HTML, CSS, and JavaScript** — no complex frameworks or dependencies.
- The dashboard uses no fancy new javascript or css things, so the old Kindle browser can cope with it.
- You’ll need to set up a basic HTTP server (e.g., Apache, Nginx, Python HTTP server, etc.).
- Once [configured](#config), copy the project files into your server’s public directory (e.g., `/var/www/html` or `htdocs`).
- Open your Kindle browser and navigate to the hosted `index.html`.

> ℹ For help setting up a web server, there are plenty of online tutorials. This guide assumes you already have that part covered.


## Configuration

To get the dashboard running, you'll need to configure two files:

- `secrets.json` — contains sensitive information like the Home Assistant URL and access token  
- `config.json` — defines the layout and content of your dashboard


### Home Assistant Access: `secrets.json`

Also see `./secrets_sample.json`

You must provide the URL to your Home Assistant instance and a **Long-Lived Access Token**.

> Note: In some cases, hostnames like `http://homeassistant.local:8123` may not work. Using a direct IP address is more reliable (e.g., `http://192.168.0.123:8123`).

#### Example `secrets.json`

```json
{
    "url": "Your Home Assistant URL here. Example: http://192.168.0.123:8123",
    "token": "Your Home Assistant Long-Lived Access Token here."
}
```

### The Dash Board Config: `config.json`
The `config.json` file defines the **structure and content** of your dashboard. You can organize your smart home devices into high level logical sections - tabs and into lower level logical sections - cards, and each card contains one or more **entities** (lights, sensors, etc.). You are free on how to do so.

Tabs can be used e.g. to organize different rooms.

Cards can be used e.g. to organize different device types within the tabs dashboard.

#### Example `config.json` - snippet with card
Each card has a `name` displayed to the user in the card header and a list of `entities`. I only tested a view. You might mess up the layout here easily.

```json
{
  "tabs": [
    {
      "id": "some tab id",
      "title": "Some Title",
      "cards": [
        {
          "id": "some card id",
          "title": "Some Card Title",
          "items": []
        }
      ]
    }]
}
```

#### Entities
The current configuration supports the following Home Assistant entity types:

- **Controls**
  Controlls can currently control light (currently no color control) and radiator termostates
  - Toggle on/off  
  - Adjust value (brightness in %, temperature in °C)

- **Sensors**  
  - Read-only values such as:
    - Temperature
    - Humidity
    - Any other sensor entity supported by Home Assistant (not tested)

- **Statur**  
  - Read-only values for binary sensors (e.g. door / window sensors)


For each entity you provide:

  - **type**: one of `sensor` (e.g. temperature or humidity), `status` (binary sensor) or `control` (e.g. lights or radiator termostats)
  - **name**: a human readable name displayed in the dashboard
  - **entity_id**: the home assistant entity id of the device.

For `sensor` you provide one and for `device` and `status` you provide two icons from [font awsome](https://fontawesome.com/search?ic=free).

For `control` and `sensor` you also provide a unit. For light it is usually `'%'`, for temperature it is `'°C'`. No other configs are currently supported. 


## Putting it all together

I configured two tabs (`Living Room` and `Kitchen`). The `Living Room` contains two cards and the `Kitchen` one card. Both tabs contain a `Climate` card with `temperature` and `humidity` sensor. The `Living Room` also includes a card with a `control` for a light as well as one for a binary sensor for doors and windows.

The following example contains comments starting with `//`. This is not officially supported in json. So remove them or use the `./config_sample.json`

```json
{
  // two tabs are defined
  "tabs": [
    {
      // first tab
      "id": "livingroom",
      "title": "Living Room",
      "cards": [
        {
          // first card in first tab
          "id": "card1",
          "title": "Climate",
          "items": [
            {
              // a sensor displaying the temperature
              "type": "sensor",
              // entity id of the sensor within home assistent
              "entity_id": "sensor.sonoff_snzb_02d_temperature",
              // the css class for the font awesome icon 
              "iconClass": "fas fa-thermometer-half",
              // the display name
              "name": "Temperature",
              // the displayed unit
              "unit": "°C"
            },
            {
              // a sensor displaying the humidity
              "type": "sensor",
              "entity_id": "sensor.sonoff_snzb_02d_humidity",
              "iconClass": "fas fa-tint",
              "name": "Humidity",
              "unit": "%"
            }
          ]
        },
        {
          // second card in first tab
          "id": "card2",
          "title": "Small Light",
          "items": [
            {
              // a control for a ligth to turn it on and off and adjust brightness
              "type": "control",
              // entity id of the sensor within home assistent
              "entity_id": "light.osram_light",
              // the display name
              "name": "Light",
              // the displayed unit - for lights this is %, for termostates it is °C
              "unit": "%",
              // the css classes for on and off state (font awesome)
              "iconClasses": {
                "on": "fas fa-lightbulb",
                "off": "far fa-lightbulb"
              }
            }
          ]
        },
        {
          // third card in first tab
          "id": "card3",
          "title": "Doors & Windows",
          "items": [
            {
              // a binary sensor displaying the status of the sensor
              "type": "status",
              // entity id of the sensor within home assistent
              "entity_id": "binary_sensor.lumi_lumi_sensor_magnet_aq2_offnung",
              // the display name
              "name": "Door Entrance",
              // the css classes for on and off state (font awesome)
              "iconClasses": {
                "on": "fas fa-door-open",
                "off": "fas fa-door-closed"
              }
            }
          ]
        }
      ]
    },
    {
      // second tab
      "id": "kitchen",
      "title": "Kitchen",
      "cards": [
        {
          // first (and here only) card in the second tab
          "id": "card1",
          "title": "Climate",
          "items": [
            {
              // a sensor displaying the temperature
              "type": "sensor",
              "entity_id": "sensor.tze204_s139roas_ts0601_temperaturw",
              "iconClass": "fas fa-thermometer-half",
              "name": "Temperaturw",
              "unit": "°C"
            },
            {
              // a sensor displaying the humidity              
              "type": "sensor",
              "entity_id": "sensor.tze204_s139roas_ts0601_humidity",
              "iconClass": "fas fa-tint",
              "name": "Humidity",
              "unit": "%"
            }
          ]
        }
      ]
    }
  ]
}
```

Feel free to configure these tabs and cards as you wish.

# Final words
> Use this project on your own risk. Do not expose secrets. Have fun.

# Kindle Dashboard for Home Assistant

Transform your **Kindle Paperwhite (7th Gen)** into a low-power, always-on **smart home display** using Home Assistant.

> This project is designed for older Kindle devices running firmware **below 5.16.4** with the crappy browser.



## Motivation

The browser on older Kindles is extremely limited and cannot render full-featured [Home Assistant](https://www.home-assistant.io/) dashboards.

Most similar projects only display **static screenshots** of the dashboard. While functional, I wanted something **more interactive**, without fully rebuilding the UI from scratch everytime.



## About the Project

This project aims to:

- Render simplified, Kindle-compatible dashboards
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
The `config.json` file defines the **structure and content** of your dashboard. You can organize your smart home devices into logical sections (called "cards"), and each card contains one or more **entities** (lights, sensors, etc.). You are free on how to do so. However, as stated before, I am not a pro and it might mess up the layout. It is all experimental.

#### Example `config.json` - snippet with card
Each card has a `name` displayed to the user in the card header and a list of `entities`. I only tested a view. You might mess up the layout here easily.

```json
{
  "cards": [
    {
      "name": "My Card Name",
      "entities": []
    }
  ]
}
```

#### Entities
The current configuration supports the following Home Assistant entity types:

- **Lights**  
  - Toggle on/off  
  - Adjust brightness (if supported by the light entity)

- **Switches**  
  - Simple on/off control

- **Sensors**  
  - Read-only values such as:
    - Temperature
    - Humidity
    - Any other sensor entity supported by Home Assistant


For each entity you provide a human readable `name` (displayed in the dashboard), the `type` (`sensor`, `light` or `switch`), the home assistant `entity_id` of the device and a icon name from [font awsome](https://fontawesome.com/search?ic=free) to be displayed in front of the entity (only free once).

| Key         | Description                                                |
| -- |   |
| `entity_id` | The entity id of your device at home assistant. It usually starts with e.g. `sensor`, `light` or `switch`. See examples below. You will find them within home assistant. |
| `name`      | The display name shown to the user for this entity.  |
| `type`      | Type of entity. Currently supported are `sensor`, `light` or `switch`. |
| `icon`      | Icon name from [Font Awesome]https://fontawesome.com/search?ic=free (`fa-*`), e.g.: `fa-lightbulb`. You can skip this and use some defautl set icons.  |

#### Putting it all together

Also see `./config_sample.json`

I configured two cards for living room and kitchen in the dashboard. Both include a `temperature` and a `humidity` sensor. The living room also includes a `light`.

```json
{
  "cards": [
    {
      "name": "Living Room",
      "entities": [
        {
          "entity_id": "light.osram_light",
          "name": "Small Light",
          "type": "light"
        },
        {
          "entity_id": "sensor.sonoff_snzb_02d_temperatur",
          "name": "Temperatur",
          "type": "sensor",
          "icon": "fa-thermometer-half"
        },
        {
          "entity_id": "sensor.sonoff_snzb_02d_luftfeuchtigkeit",
          "name": "Humidity",
          "type": "sensor",
          "icon": "fa-tint"
        }
      ]
    },
    {
      "name": "Kitchen",
      "entities": [
        {
          "entity_id": "sensor.tze204_s139roas_ts0601_temperatur",
          "name": "Temperatur",
          "type": "sensor",
          "icon": "fa-thermometer-half"
        },
        {
          "entity_id": "sensor.tze204_s139roas_ts0601_luftfeuchtigkeit",
          "name": "Luftfeuchtigkeit",
          "type": "sensor",
          "icon": "fa-tint"
        }
      ]
    }
  ]
}
```

Feel free to configure these cards as you wish. You can e.g. group similar sensors like temperature in one card and switches in another. But be aware of the bad coding. You might find some features I did not intend. ;-)

# Final words
> Use this project on your own risk. Do not expose secrets. Have fun.

# Kindle Dashboard for Home Assistant

Transform your **Kindle Paperwhite (7th Gen)** into a low-power, always-on **smart home display** using Home Assistant.

> This project is designed for older Kindle devices running firmware **below 5.16.4** with the crappy browser.

---

## Motivation

The browser on older Kindles is extremely limited and cannot render full-featured [Home Assistant](https://www.home-assistant.io/) dashboards.

Most similar projects only display **static screenshots** of the dashboard. While functional, I wanted something **more interactive**, without fully rebuilding the UI from scratch everytime.

---

## About the Project

This project aims to:

- Render simplified, Kindle-compatible dashboards
- Provide minimal interactivity (e.g., toggling lights, showing live data)
- Run on old Kindle e.g. Paperwhite (7th Gen) in **experimental browser mode**

I’m not a professional developer — this was a learning project heavily assisted by **ChatGPT**.


## What You Can Do

The great news: **you can use this project without jailbreaking your Kindle**.

### Option 1: Use Without Jailbreaking

Simply host this project on an HTTP web server and access it from your Kindle’s **experimental browser**.

- The dashboard is built using **plain HTML, CSS, and JavaScript** — no complex frameworks or dependencies.
- The dashboard uses no fancy new javascript or css things, so the old Kindle browser can cope with it.
- You’ll need to set up a basic HTTP server (e.g., Apache, Nginx, Python HTTP server, etc.).
- Once [configured](#config), copy the project files into your server’s public directory (e.g., `/var/www/html` or `htdocs`).
- Open your Kindle browser and navigate to the hosted `index.html`.

> ℹ For help setting up a web server, there are plenty of online tutorials. This guide assumes you already have that part covered.

---

### Option 2: Use With Jailbroken Kindle

You may choose to **jailbreak your Kindle** and host the project directly on the device.

> **Disclaimer:** Jailbreaking may violate terms of service, void warranties, or be restricted in some countries. Proceed at your own risk.

To use this method:

1. Jailbreak your Kindle (if you choose to).
2. Complete the necessary [configuration steps](#config).
3. Copy the project files directly onto the Kindle’s file system.
4. Open `index.html` in the experimental browser.

---

## Configuration

To get the dashboard running, you'll need to configure two files:

- `secrets.json` — contains sensitive information like the Home Assistant URL and access token  
- `config.json` — defines the layout and content of your dashboard

---

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
The dashboard can display different cards. In a card different entities can be grouped. You are free on how to do so. It might mess up the layout though.

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
Currently the configuration supports the following entities:

- Lights (switch and brightness ajustion)
- Switches
- Sensors (like temperature or humidity)

For each entity you provide a human readable `name` (displayed in the dashboard), the `type` (`sensor`, `light` or `switch`), the home assistant `entity_id` of the device and a icon name from [font awsome](https://fontawesome.com/search?ic=free) to be displayed in front of the entity (only free once).

| Key         | Description                                                |
| ----------- | ---------------------------------------------------------  |
| `entity_id` | The entity id of your device at home assistant                          |
| `name`      | Display name shown to the user.                            |
| `type`      | Type of entity, e.g., `sensor`, `light` or `switch`. |
| `icon`      | Icon name from Font Awesome (`fa-*`), e.g.: `fa-lightbulb`. For `light` and `switch` you can skip this and use my defautl.  |

#### Putting it all together

Also see `./config_sample.json`

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
          "entity_id": "light.osram_light_kitchen",
          "name": "Kitchen Light",
          "type": "light"
        },
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

> You should now be ready for deployment


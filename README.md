# Homebridge DUKA SmartFan Wifi

This is a Homebridge plugin which allows you to control your DUKA SmartFan Wifi devices from HomeKit. This plugin is heavily based on ([PaulMT's Blueberg Vento plugin](https://github.com/PaulMT/homebridge-blauberg-vento)).

## Installation

1. This is Homebridge plugin, so make sure you have Homebridge Server up & running ([Homebridge site](https://homebridge.io)).
2. Assign static IP address to your device (see your router settings).
3. Install **homebridge-duka-smartfan** plugin using Homebridge UI or use this command: `sudo npm install -g homebridge-duka-smartfan`.
4. Configure plugin using Homebridge UI or `~/.homebridge/config.json`.
   ```json
   {
     "platform": "DukaSmartFan",
     "devices": [
       {
         "name": "Bedroom Fan",
         "ip": "192.168.1.1",
         "deviceId": "0123456789ABCDEF",
         "password": "1111"
       }
     ]
   }
   ```
   Config properties:
   - Device Name (name): Accessory name in iOS Home app.
   - IP Address (ip): Your device static IP address.
   - Device ID (deviceId): Your device ID (you can find it in DUKA SmartFan mobile app).
   - Password (password): Your device password (default 1111, can be changed in mobile app).

## Features:

- Turning Fan on and off

## Supported Models:

- DUKA SmartFan WiFi - Firmware 2.2

## Release notes:

### 0.0.1

- First fork which allows you to add multiple devices and turn the on/off.

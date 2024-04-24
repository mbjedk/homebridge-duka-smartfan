# Homebridge DUKA SmartFan Wifi

This is a Homebridge plugin which allows you to control your DUKA SmartFan Wifi devices from HomeKit. This plugin is heavily based on ([PaulMT's Blueberg Vento plugin](https://github.com/PaulMT/homebridge-blauberg-vento)). Full documentation for a similar SmartFan can be found on ([this page](https://www.ventilatieshop.com/media/ventilatieshop/downloads/b/1/b168_1en_01preview.pdf)]. So far, only the most common features are supported.

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
- Boost function
- External Switch as Motion Sensor

## Supported Models:

- DUKA SmartFan WiFi - Firmware 2.2

## Release notes:

### 0.0.5

- Added External Switch as Motion Sensor

### 0.0.4

- Added Boost-function

### 0.0.3

- First fork which allows you to add multiple devices and turn the on/off.

## Parameter-reference

| Parameter Number | Mode           | Description                                                       | Possible Values                                                                                                    | Size (bytes) |
| ---------------- | -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------ |
| 1/0x0001         | R/W/RW         | Fan On/Off                                                        | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 2/0x0002         | R              | Battery status                                                    | 0 - discharged (absent), 1-normal rate of charge                                                                   | 1            |
| 3/0x0003         | R/W/RW         | 24 hours mode selection                                           | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 4/0x0004         | R              | Current fan speed (rpm)                                           | 0...6000 RPM                                                                                                       | 2            |
| 5/0x0005         | R/W/RW         | BOOST mode On/Off                                                 | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 6/0x0006         | R              | Current BOOST timer countdown in seconds                          | 0...86400 seconds                                                                                                  | 3            |
| 7/0x0007         | R              | Current status of the built-in timer                              | 0-Off, 1-On                                                                                                        | 1            |
| 8/0x0008         | R              | Current status of fan operation by humidity sensor                | 0-Off, 1-On                                                                                                        | 1            |
| 10/0x000A        | R              | Current status of fan operation by temperature sensor             | 0-Off, 1-On                                                                                                        | 1            |
| 11/0x000B        | R              | Current status of fan operation by motion sensor                  | 0-Off, 1-On                                                                                                        | 1            |
| 12/0x000C        | R              | Current status of fan operation by signal from an external switch | 0-Off, 1-On                                                                                                        | 1            |
| 13/0x000D        | R              | Current status of fan operation in interval ventilation mode      | 0-Off, 1-On                                                                                                        | 1            |
| 14/0x000E        | R              | Current status of fan operation in SILENT mode                    | 0-Off, 1-On                                                                                                        | 1            |
| 15/0x000F        | R/W/RW         | Permission of operation based on humidity sensor readings         | 0-Off, 1-in automatic mode, 2-in manual mode                                                                       | 1            |
| 17/0x0011        | R/W/RW         | Permission of operation based on temperature sensor readings      | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 18/0x0012        | R/W/RW         | Permission of operation based on motion sensor readings           | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 19/0x0013        | R/W/RW         | Permission of operation based on signal from an external switch   | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 24/0x0018        | R/W/RW/INC/DEC | Max speed setpoint                                                | 30...100 %                                                                                                         | 1            |
| 26/0x001A        | R/W/RW/INC/DEC | Silent speed setpoint                                             | 30...100 %                                                                                                         | 1            |
| 27/0x001B        | R/W/RW/INC/DEC | Interval ventilation speed setpoint                               | 30...100 %                                                                                                         | 1            |
| 29/0x001D        | R/W/RW         | Interval ventilation mode activation                              | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 30/0x001E        | R/W/RW         | Silent mode activation                                            | 0-Off, 1-On, 2-Invert                                                                                              | 1            |
| 31/0x001F        | R/W/RW         | Silent Mode start time in seconds                                 | 0...86400 seconds                                                                                                  | 3            |
| 32/0x0020        | R/W/RW         | Silent Mode end time in seconds                                   | 0...86400 seconds                                                                                                  | 3            |
| 33/0x0021        | R/W/RW         | Current time of the fan internal clock in seconds                 | 0...86400 seconds                                                                                                  | 3            |
| 35/0x0023        | R/W/RW/INC/DEC | Turn-off delay timer/BOOST setpoint                               | 0-Off, 2-5 minutes, 3-15 minutes, 4-30 minutes, 6-60 minutes                                                       | 1            |
| 36/0x0024        | R/W/RW/INC/DEC | Turn-on delay timer setpoint                                      | 0-Off, 1-2 minutes, 2-5 minutes                                                                                    | 1            |
| 37/0x0025        | W              | Resetting parameters to factory settings                          | Any byte                                                                                                           | 1            |
| 124/0x007C       | R              | Device search on the local Ethernet network                       | Text ("0...9", "A...F")                                                                                            | 16           |
| 134/0x0086       | R              | Controller base firmware version and date                         | Byte 1-firmware version (major), Byte 2-firmware version (minor), Byte 3-day, Byte 4-month, Byte 5 and Byte 6-year | 6            |
| 148/0x0094       | R/W/RW         | Wi-Fi operation mode                                              | 1-client, 2-access point                                                                                           | 1            |
| 149/0x0095       | R/W/RW         | Wi-Fi name in Client mode                                         | Text 1 ... 32                                                                                                      | 1            |
| 150/0x0096       | R/W/RW         | Wi-Fi password                                                    | Text 8 ... 64                                                                                                      | 1            |
| 153/0x0099       | R/W/RW         | Wi-Fi data encryption type                                        | 48-OPEN, 50-WPA_PSK, 51-WPA2_PSK, 52-WPA_WPA2_PSK                                                                  | 1            |
| 154/0x009A       | R/W/RW         | Wi-Fi frequency channel                                           | 1...13                                                                                                             | 1            |
| 155/0x009B       | R/W/RW         | Wi-Fi module DHCP                                                 | 0-STATIC, 1-DHCP, 2-Invert                                                                                         | 1            |
| 156/0x009C       | R/W/RW         | IP address assigned to Wi-Fi module                               | Byte 1-0...255, Byte 2-0...255, Byte 3-0...255, Byte 4-0...255                                                     | 4            |
| 157/0x009D       | R/W/RW         | Wi-Fi module subnet mask                                          | Byte 1-0...255, Byte 2-0...255, Byte 3-0...255, Byte 4-0...255                                                     | 4            |
| 158/0x009E       | R/W/RW         | Wi-Fi module main gateway                                         | Byte 1 - 0...255, Byte 2 - 0...255, Byte 3 - 0...255, Byte 4 - 0...255                                             | 4            |
| 160/0x00A0       | W              | Apply new Wi-Fi parameters and quit Wi-Fi module Setup Mode       | Any byte                                                                                                           | 1            |
| 163/0x00A3       | R              | Current Wi-Fi module IP address                                   | 0...255                                                                                                            | 4            |
| 185/0x00B9       | R              | Unit type                                                         | 2                                                                                                                  | 1            |

For more details, visit [Blauberg Ventilatoren](https://www.blaubergventilatoren.de).

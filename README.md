# Inner Range Inception to MQTT
A docker container to interface Inner Range Inception with MQTT to be used with home automation like Home Assistant

## Setup Steps
1. Create a [MQTT server](https://hub.docker.com/_/eclipse-mosquitto)
2. Setup config file `configuration.yml` in `/config` directory (example below)
3. Setup docker compose file (example below)
4. Enable Home Assistant MQTT discovery if integrating with Home Assistant (optional): https://www.home-assistant.io/docs/mqtt/discovery/
5. Run the app by running `docker-compose up --build`

## Example Docker Compose File
```
version: '3'
services:
  inception-mqtt:
    container_name: inception-mqtt
    image: matthewlarner/inception-mqtt:latest
    volumes:
      - ./config:/usr/src/app/config
    environment:
      - TZ=Australia/Sydney
    restart: always
```

## Example Config

Refer to https://github.com/matthew-larner/inception-mqtt/blob/main/configuration.yml.example

## How it works
This docker container communicates with the [Inception REST API](https://skytunnel.com.au/Inception/API_SAMPLE/ApiDoc). It will automatically create the following items in Home Assistant if you have [MQTT discovery enabled](https://www.home-assistant.io/docs/mqtt/discovery/). 

You may also find references to the API on your local Inception controller. "http://local_Inception_IP_address/ApiDoc" 

You need to have one of the following Home Assistant classes in the input description in Inception in order for the input to be displayed in Home Assistant; motion, garage, door, rex, opening, power, smoke, vibration, window, cold, heat, light or moisture.

| Inception | Home Assistant |
|-----------|----------------|
| Area      | Alarm          |
| Door      | Lock           |
| Input     | Binary Sensor  |
| Output    | Switch         |

### Inputs
The name of the Inputs in Inception needs to contain one of the following words (case insensitive), otherwise it won't show up in Home Assistant:
- `motion`
- `garage`
- `door`
- `gate`
- `button`
- `rex`
- `opening`
- `power`
- `smoke`
- `vibration`
- `shock`
- `cold`
- `heat`
- `light`
- `moisture`
- `break`
- `glass`
- `window'
- `louvre`


### Outputs
The name of the Inputs in Inception needs to contain one of the following words (case insensitive), otherwise it won't show up in Home Assistant:
- `siren`
- `screamer`
- `door`
- `garage`
- `gate`

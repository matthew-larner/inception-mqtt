# inception-mqtt
A docker container to interface Inner Range Inception with MQTT to be used with home automation like Home Assistant

## Setup Steps
1. Create a [MQTT server](https://hub.docker.com/_/eclipse-mosquitto)
2. Create `configuration.yml` based on `configuration.yml.example`
3. Run the app by running `docker-compose up --build`

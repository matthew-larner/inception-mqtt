# Inner Range Inception to MQTT
A docker container to interface Inner Range Inception with MQTT to be used with home automation like Home Assistant

If you get value from this project, please support me!

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/matthewlars)

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
    image: ghcr.io/matthew-larner/inception-mqtt:latest
    volumes:
      - ./config:/usr/src/app/config
      # - ./certs:/usr/src/app/certs  # Optional: mount TLS certificates
    environment:
      - TZ=Australia/Sydney
    restart: unless-stopped
```

## Example Config

Refer to https://github.com/matthew-larner/inception-mqtt/blob/main/configuration.yml.example

## MQTT TLS/SSL

To encrypt the MQTT connection with TLS:

1. Set `tls: true` in your `configuration.yml` and update the port (standard MQTTS port is `8883`)
2. Mount your certificate files into the container by adding a volume to your docker compose:
   ```yaml
   volumes:
     - ./config:/usr/src/app/config
     - ./certs:/usr/src/app/certs
   ```
3. Add the certificate paths to your config:
   ```yaml
   mqtt:
     broker: 192.168.1.102
     port: 8883
     tls: true
     cafile: /usr/src/app/certs/ca.crt
   ```

### TLS Config Options

| Option | Required | Description |
|--------|----------|-------------|
| `tls` | Yes | Set to `true` to enable TLS |
| `cafile` | No | Path to CA certificate file |
| `certfile` | No | Path to client certificate (for mutual TLS) |
| `keyfile` | No | Path to client private key (for mutual TLS) |
| `reject_unauthorized` | No | Set to `false` to allow self-signed certificates (default: `true`) |

### Self-Signed Certificates

If your MQTT broker uses a self-signed certificate (common with Mosquitto), set `reject_unauthorized: false` in your config, or provide the CA certificate via `cafile`.

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
- `pir`
- `louvre`
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
- `window`

### Outputs
The name of the Inputs in Inception needs to contain one of the following words (case insensitive), otherwise it won't show up in Home Assistant:
- `siren`
- `screamer`
- `door`
- `garage`
- `gate`

## Custom MQTT Commands

These are optional MQTT commands which can't be done via Home Assistant entities.

### Timed Output
By default, when turning a switch on in Home Assistant, it will publish the MQTT message:

- Topic: `inception/switch/0392896c-9d10-4bfe-9602-851eae0fdc3c/set`
- Payload: `On`

You can optionally supply an integer instead and it will trigger the output to turn on for the number of seconds supplied, then off. You can find the topic from the Home Assistant discovery topic on MQTT (e.g. homeassistant/switch/* -> command_topic). To do this, push to MQTT directly:

**Turn on the output for 3 seconds:**

- Topic: `inception/switch/0392896c-9d10-4bfe-9602-851eae0fdc3c/set`
- Payload: `3`

### Unlock a Door
By default, when unlocking a door via Home Assistant, it sends 'Open' to Inception, which unlocks the door for a set number of seconds (as defined via the Inception dashboard), then locks it again. You may want to keep the door unlocked. You can find the topic from the Home Assistant discovery topic on MQTT (e.g. homeassistant/lock/* -> command_topic). To do this, push to MQTT directly:

**To Unlock door:**

- Topic: `inception/lock/98512c65-4d2e-58ec-9d1c-3445dbe65215/set`
- Payload: `Unlock`

**To Lock door:**

- Topic: `inception/lock/98512c65-4d2e-58ec-9d1c-3445dbe65215/set`
- Payload: `Unlock`

**To Open door** (unlock for x number of seconds as defined in the Inception dashboard):

- Topic: `inception/lock/98512c65-4d2e-58ec-9d1c-3445dbe65215/set`
- Payload: `Open`

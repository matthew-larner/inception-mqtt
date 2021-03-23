# Inner Range Inception to MQTT
An addon for Home Assistant OS to interface Inner Range Inception with MQTT.

![](https://csd.com.au/ts1508996558/attachments/BlogPost/30/Inception%20Panel%20with%20Logo%20-%20HR%20(Custom)%20(2).png)

This addon requires a MQTT broker has been setup on home assistant already to work.

This addon is a fork from [matthew-larner/inception-mqtt](https://github.com/matthew-larner/inception-mqtt) that used a separate docker container to run the service. 
This service is the same as above (assuming fork does not diverge too much due to updates on original project), wrapped as an addon that allows users of Home Assistant OS (supervised) to run the service.

## Setup Steps
1. Setup an [MQTT integration](https://www.home-assistant.io/integrations/mqtt/) (if not already done) to be run in home assistant. 
2. Set config in addon configuration tab. Details below.
3. Start addon - monitor log tab.

## Configuration Tab
Below are the configs you need to set. The others have defaults already set.
#### Base URL: http://192.168.1.104/
  Enter the base URL of your inception controller. Eg:  http://192.168.1.123 OR http://192.168.1.123/api/v1 newer panel requires '/api/v1' - make sure to include it if you get an authentication error in logs.

#### Username
  Enter an Inception username. You need to setup a user in the inception web interface that has:
  * Web Page Profile: REST Web API User
  * Username & password set
  * Appropriate permissions assigned

#### Password
  Enter the password you setup for this user as above.

#### Alarm code
  Enter a code to use as the code on Home Assistant only; has not connection to the inception user codes.

## How it works
This addon communicates with the [Inception REST API](https://skytunnel.com.au/Inception/API_SAMPLE/ApiDoc). It will automatically create the following items in Home Assistant via [MQTT discovery](https://www.home-assistant.io/docs/mqtt/discovery/):
| Inception | Home Assistant |
|-----------|----------------|
| Area      | Alarm          |
| Door      | Lock           |
| Input     | Binary Sensor  |
| Output    | Switch         |

This addon works by querying your existing home assistant mqtt broker, hence why you don't need to supply the mqtt address/port/username/password. External broker not supported (but could be easily).

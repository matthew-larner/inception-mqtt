import { IClientOptions } from 'mqtt';

import * as mqtt from './entities/mqtt';
import * as inception from './entities/inception';
import * as homeAssistant from './entities/homeAssistant';
import * as inceptionPolling from './entities/inceptionPolling';

import { Config } from './contracts'

const main = async () => {
  try {
    // Get configuration
    const config: Config = {
      mqtt: {
        broker: process.env.MQTT_HOST,
        port: parseInt(process.env.MQTT_PORT, 10),
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASSWORD,
        qos: process.env.MQTT_QOS === '0' ? 0 : process.env.MQTT_QOS === '1' ? 1 : 2,
        retain: process.env.MQTT_RETAIN === 'true',
        discovery: process.env.MQTT_DISCOVERY  === 'true',
        discovery_prefix: process.env.MQTT_DISCOVERY_PREFIX,
        topic_prefix: process.env.MQTT_TOPIC_PREFIX,
        availability_topic: process.env.MQTT_AVAILABILITY_TOPIC,
        alarm_code: parseInt(process.env.MQTT_ALARM_CODE, 10),
      },
      inception: {
        base_url: process.env.BASE_URL,
        port: parseInt(process.env.PORT, 10),
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        polling_timeout: parseInt(process.env.POLLING_TIMEOUT, 10),
        polling_delay: parseInt(process.env.POLLING_DELAY, 10),
      }
    };

    const availabilityTopic = config.mqtt.availability_topic;

    const mqttConnectOptions = {
      will: {
        topic: availabilityTopic,
        payload: 'offline',
        qos: 1,
        retain: true
      }
    } as IClientOptions;

    mqtt.connect(config.mqtt, mqttConnectOptions);

    const publishStatusChange = (isConnected: boolean) => {
      mqtt.publish(availabilityTopic, isConnected ? 'online' : 'offline');
    };

    await inception.connect(config.inception, publishStatusChange);
    await homeAssistant.connect(config.mqtt);
    await inceptionPolling.polling();

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

main();
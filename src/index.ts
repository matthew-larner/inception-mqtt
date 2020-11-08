import * as YAML from 'yaml';
import * as fs from 'fs';
import { IClientOptions } from 'mqtt';

import * as mqtt from './entities/mqtt';
import * as inception from './entities/inception';
import * as homeAssistant from './entities/homeAssistant';
import * as inceptionPolling from './entities/inceptionPolling';

const main = async () => {
  try {
    // Get and parse configuration
    const config = YAML.parse(fs.readFileSync('./config/configuration.yml', 'utf8'));
    const {
      mqtt: mqttConfig,
      inception: [inceptionConfig]
    } = config;

    const availabilityTopic = mqttConfig.availability_topic;

    const mqttConnectOptions = {
      will: {
        topic: availabilityTopic,
        payload: 'offline',
        qos: 1,
        retain: true
      }
    } as IClientOptions;

    mqtt.connect(mqttConfig, mqttConnectOptions);

    const publishStatusChange = (isConnected: boolean) => {
      mqtt.publish(availabilityTopic, isConnected ? 'online' : 'offline');
    };

    await inception.connect(inceptionConfig, publishStatusChange);
    await homeAssistant.connect(mqttConfig);
    await inceptionPolling.polling();

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

main();
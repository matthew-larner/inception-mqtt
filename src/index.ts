import * as YAML from 'yaml';
import * as fs from 'fs';
import { IClientOptions, MqttClient } from 'mqtt';

import mqtt from './entities/mqtt';
import inception from './entities/inception';
import * as inceptionHandler from './entities/inceptionHandler';

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

    const mqttOnConnect = (client: MqttClient) => {
      client.publish(availabilityTopic, 'online', {
        qos: mqttConfig.qos,
        retain: mqttConfig.retain
      });
    };
    const mqttClient = mqtt(mqttConfig, mqttConnectOptions, mqttOnConnect);

    const inceptionInstance = inception(inceptionConfig);
    await inceptionInstance.authenticate();

    const controlAreas = await inceptionInstance.getControlAreas();
    controlAreas.map(area => {
      const name = area.Name;
      const areaId = area.ID;
      const topic = `${mqttConfig.discovery_prefix}/alarm_control_panel/${areaId}/config`;
      const commandTopic = `inception/alarm_control_panel/${areaId}/set`;
      const message = {
        name,
        state_topic: `inception/alarm_control_panel/${areaId}`,
        command_topic: commandTopic,
        availability_topic: availabilityTopic,
        code: mqttConfig.alarm_code,
        code_arm_required: false,
        payload_arm_away: 'Arm',
        payload_arm_home: 'ArmStay',
        payload_arm_night: 'ArmSleep',
        payload_disarm: 'Disarm'
      };
      mqttClient.publish(topic, JSON.stringify(message));
      mqttClient.subscribe(commandTopic);

      const areaHandler = inceptionHandler.handler(commandTopic, async (payload: string) => {
        await inceptionInstance.postControlAreaActivity(areaId, payload);
      });
      mqttClient.onMessage(areaHandler);
    });

    const controlDoors = await inceptionInstance.getControlDoors();
    controlDoors.map(door => {
      const name = door.Name;
      const doorId = door.ID;
      const topic = `${mqttConfig.discovery_prefix}/lock/${doorId}/config`;
      const commandTopic = `inception/lock/${doorId}/set`;
      const message = {
        name,
        state_topic: `inception/lock/${doorId}`,
        command_topic: commandTopic,
        availability_topic: availabilityTopic,
        optimistic: false,
        payload_lock: 'Lock',
        payload_unlock: 'Unlock'
      }
      mqttClient.publish(topic, JSON.stringify(message));
      mqttClient.subscribe(commandTopic);

      const doorHandler = inceptionHandler.handler(commandTopic, async (payload: string) => {
        await inceptionInstance.postControlDoorActivity(doorId, payload);
      });
      mqttClient.onMessage(doorHandler);
    });

    const controlOutputs = await inceptionInstance.getControlOutputs();
    controlOutputs.map(output => {
      const name = output.Name;
      const outputId = output.ID;
      const topic = `${mqttConfig.discovery_prefix}/switch/${outputId}/config`;
      const commandTopic = `inception/switch/${outputId}/set`;

      let icon = 'mdi:help-circle';

      if (name.toLowerCase().includes('screamer') || name.toLowerCase().includes('siren')) {
        icon = 'mdi:bullhorn-outline';
      } else if (name.toLowerCase().includes('door')) {
        icon = 'mdi:door-closed-lock';
      } else if (name.toLowerCase().includes('garage')) {
        icon = 'mdi:door-garage';
      } else if (name.toLowerCase().includes('gate')) {
        icon = 'mdi:door-gate';
      }

      const message = {
        name,
        state_topic: `inception/switch/${outputId}`,
        command_topic: commandTopic,
        availability_topic: availabilityTopic,
        optimistic: false,
        payload_off: 'Off',
        payload_on: 'On',
        icon
      }
      mqttClient.publish(topic, JSON.stringify(message));
      mqttClient.subscribe(commandTopic);

      const outputHandler = inceptionHandler.handler(commandTopic, async (payload: string) => {
        await inceptionInstance.postControlOutputActivity(outputId, payload);
      });
      mqttClient.onMessage(outputHandler);
    });

    const controlInputs = await inceptionInstance.getControlInputs();
    controlInputs.map(input => {
      const name = input.Name;
      const outputId = input.ID;
      const topic = `${mqttConfig.discovery_prefix}/binary_sensor/${outputId}/config`;
      const commandTopic = `inception/binary_sensor/${outputId}/set`;

      let deviceClass = [
        'door',
        'motion',
        'opening',
        'power',
        'smoke',
        'vibration',
        'window',
        'cold',
        'heat',
        'light',
        'moisture'
      ].find(device => name.toLowerCase().includes(device)) || 'None';

      if (name.toLowerCase().includes('garage')) {
        deviceClass = 'garage_door';
      } else if (name.toLowerCase().includes('rex')) {
        deviceClass = 'door';
      }

      const message = {
        name,
        state_topic: `inception/binary_sensor/${outputId}`,
        command_topic: commandTopic,
        availability_topic: availabilityTopic,
        device_class: deviceClass
      }
      mqttClient.publish(topic, JSON.stringify(message));

      // Does not listen to command_topic
    });

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

main();
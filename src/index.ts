import * as YAML from 'yaml';
import * as fs from 'fs';
import { IClientOptions, MqttClient } from 'mqtt';

import mqtt from './entities/mqtt';
import inception from './entities/inception';
import * as inceptionHandler from './entities/inceptionHandler';

const main = async () => {
  try {
    // Get and parse configuration
    const config = YAML.parse(fs.readFileSync('./configuration.yml', 'utf8'));
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

    // const controlDoors = await inceptionInstance.getControlDoors();
    // controlDoors.map(door => {
    //   const name = door.Name;
    //   const topic = `${mqttConfig.discovery_prefix}/lock/${name}/config`;
    //   const message = {
    //     name,
    //     state_topic: `inception/lock/living_room/${name}`,
    //     command_topic: `inception/lock/living_room/${name}/set`,
    //     availability_topic: availabilityTopic,
    //     optimistic: false,
    //     payload_lock: 'Lock',
    //     payload_unlock: 'Unlock'
    //   }
    //   mqttClient.publish(topic, JSON.stringify(message));
    // });

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

main();
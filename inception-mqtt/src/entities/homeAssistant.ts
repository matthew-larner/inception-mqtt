import * as inception from './inception';
import * as mqtt from './mqtt';
import { MqttConfig } from '../contracts'

let mqttConfig: MqttConfig;

const mqttMessageHandler = (commandTopic: string, callback: (payload: string) => Promise<void>) =>
  async (topic: string, message: Buffer) => {
    if (topic === commandTopic) {
      const payload = message.toString();

      await callback(payload);
    }
  };

const startControlAreas = async () => {
  const controlAreas = await inception.getControlAreas();
  controlAreas.map(area => {
    const name = area.Name;
    const areaId = area.ID;
    const topic = `${mqttConfig.discovery_prefix}/alarm_control_panel/${areaId}/config`;
    const commandTopic = `inception/alarm_control_panel/${areaId}/set`;
    const message = {
      name,
      state_topic: `inception/alarm_control_panel/${areaId}`,
      command_topic: commandTopic,
      availability_topic: mqttConfig.availability_topic,
      code: mqttConfig.alarm_code,
      code_arm_required: false,
      payload_arm_away: 'Arm',
      payload_arm_home: 'ArmStay',
      payload_arm_night: 'ArmSleep',
      payload_disarm: 'Disarm'
    };
    mqtt.publish(topic, JSON.stringify(message));
    mqtt.subscribe(commandTopic);

    const areaHandler = mqttMessageHandler(commandTopic, async (payload: string) => {
      await inception.postControlAreaActivity(areaId, payload);
    });
    mqtt.onMessage(areaHandler);
  });
}

const startControlDoors = async () => {
  const controlDoors = await inception.getControlDoors();
  controlDoors.map(door => {
    const name = door.Name;
    const doorId = door.ID;
    const topic = `${mqttConfig.discovery_prefix}/lock/${doorId}/config`;
    const commandTopic = `inception/lock/${doorId}/set`;
    const message = {
      name,
      state_topic: `inception/lock/${doorId}`,
      command_topic: commandTopic,
      availability_topic: mqttConfig.availability_topic,
      optimistic: false,
      payload_lock: 'Lock',
      payload_unlock: 'Unlock'
    }
    mqtt.publish(topic, JSON.stringify(message));
    mqtt.subscribe(commandTopic);

    const doorHandler = mqttMessageHandler(commandTopic, async (payload: string) => {
      await inception.postControlDoorActivity(doorId, payload);
    });
    mqtt.onMessage(doorHandler);
  });
}

const startControlOutputs = async () => {
  const controlOutputs = await inception.getControlOutputs();
  controlOutputs.map(output => {
    const name = output.Name;
    const outputId = output.ID;
    const topic = `${mqttConfig.discovery_prefix}/switch/${outputId}/config`;
    const commandTopic = `inception/switch/${outputId}/set`;

    let icon = 'mdi:help-circle';

    if (['screamer', 'siren'].some(i => name.toLowerCase().includes(i))) {
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
      availability_topic: mqttConfig.availability_topic,
      optimistic: false,
      payload_off: 'Off',
      payload_on: 'On',
      icon
    }
    mqtt.publish(topic, JSON.stringify(message));
    mqtt.subscribe(commandTopic);

    const outputHandler = mqttMessageHandler(commandTopic, async (payload: string) => {
      await inception.postControlOutputActivity(outputId, payload);
    });
    mqtt.onMessage(outputHandler);
  });
}

const startControlInputs = async () => {
  const controlInputs = await inception.getControlInputs();
  controlInputs.map(input => {
    const name = input.Name;
    const outputId = input.ID;
    const topic = `${mqttConfig.discovery_prefix}/binary_sensor/${outputId}/config`;

    let deviceClass = [
      'motion',
      'garage',
      'door',
      'gate',
      'button',
      'rex',
      'opening',
      'power',
      'smoke',
      'vibration',
      'window',
      'cold',
      'heat',
      'light',
      'moisture',
      'break',
      'glass'
    ].find(device => name.toLowerCase().includes(device)) || 'opening';

    // override found device
    if (deviceClass === 'garage') {
      deviceClass = 'garage_door';
    } else if (deviceClass === 'rex') {
      deviceClass = 'door';
    } else if (deviceClass === 'gate') {
      deviceClass = 'door';
    } else if (deviceClass === 'button') {
      deviceClass = 'connectivity';
    } else if (deviceClass === 'vibration') {
      deviceClass = 'vibration';
    } else if (deviceClass === 'break') {
      deviceClass = 'vibration';
    } else if (deviceClass === 'glass') {
      deviceClass = 'window';
    }

    const message = {
      name,
      state_topic: `inception/binary_sensor/${outputId}`,
      availability_topic: mqttConfig.availability_topic,
      device_class: deviceClass,
      payload_off: 'Off',
      payload_on: 'On',
    }
    mqtt.publish(topic, JSON.stringify(message));
  });
};

export const connect = async (config: MqttConfig) => {
  mqttConfig = config;

  await Promise.all([
    startControlAreas(),
    startControlDoors(),
    startControlOutputs(),
    startControlInputs()
  ]);
}
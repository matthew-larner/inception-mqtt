import * as inception from './inception';
import * as mqtt from './mqtt';

let mqttConfig: any;

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
    const commandTopic = `${mqttConfig.topic_prefix}/alarm_control_panel/${areaId}/set`;
    const stateTopic = `${mqttConfig.topic_prefix}/alarm_control_panel/${areaId}`;
    const message = {
      name,
      state_topic: stateTopic,
      command_topic: commandTopic,
      availability_topic: mqttConfig.availability_topic,
      code: mqttConfig.alarm_code,
      code_arm_required: false,
      payload_arm_away: 'Arm',
      payload_arm_home: 'ArmStay',
      payload_arm_night: 'ArmSleep',
      payload_disarm: 'Disarm',
      unique_id: `${areaId}`
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
    const commandTopic = `${mqttConfig.topic_prefix}/lock/${doorId}/set`;
    const stateTopic = `${mqttConfig.topic_prefix}/lock/${doorId}`;
    const message = {
      name,
      state_topic: stateTopic,
      command_topic: commandTopic,
      availability_topic: mqttConfig.availability_topic,
      optimistic: false,
      payload_lock: 'Lock',
      payload_unlock: 'TimedUnlock',
      unique_id: `${doorId}`
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
    const commandTopic = `${mqttConfig.topic_prefix}/switch/${outputId}/set`;
    const stateTopic = `${mqttConfig.topic_prefix}/switch/${outputId}`;

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
      state_topic: stateTopic,
      command_topic: commandTopic,
      availability_topic: mqttConfig.availability_topic,
      optimistic: false,
      payload_off: 'Off',
      payload_on: 'On',
      unique_id: `${outputId}`,
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
    const stateTopic = `${mqttConfig.topic_prefix}/binary_sensor/${outputId}`;

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
      'shock',
      'cold',
      'heat',
      'light',
      'moisture',
      'break',
      'glass',
      'window'
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
    } else if (deviceClass === 'shock') {
      deviceClass = 'vibration';
    } else if (deviceClass === 'louvre') {
      deviceClass = 'window';
    } else if (deviceClass === 'glass') {
      deviceClass = 'window';
    }

    const message = {
      name,
      state_topic: stateTopic,
      availability_topic: mqttConfig.availability_topic,
      device_class: deviceClass,
      payload_off: 'Off',
      payload_on: 'On',
      unique_id: `${outputId}`
    }
    mqtt.publish(topic, JSON.stringify(message));
  });
};

export const connect = async (config: any) => {
  mqttConfig = config;

  await Promise.all([
    startControlAreas(),
    startControlDoors(),
    startControlOutputs(),
    startControlInputs()
  ]);
}

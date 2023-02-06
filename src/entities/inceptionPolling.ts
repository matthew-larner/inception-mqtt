import { MonitorStateUpdatesPayloadInterface, StateResultInterface } from '../contracts';
import * as inception from './inception';
import * as mqtt from './mqtt';
import * as utils from './utils';

export const polling = async (mqttConfig: any) => {
  const publishAreaStateUpdates = (id: string, publicState: number) => {
    const topic = `${mqttConfig.topic_prefix}/alarm_control_panel/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    let message: string;

    console.log(`Polling area received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if (utils.isStringIndexContains(publicStateBin, 11, '1')) {
      message = 'triggered';
    } else if (utils.isStringIndexContains(publicStateBin, 10, '1')) {
      message = 'pending';
    } else if (utils.isStringIndexContains(publicStateBin, 9, '1')) {
      message = 'arming';
    } else if (utils.isStringIndexContains(publicStateBin, 4, '1')) {
      message = 'armed_away';
    } else if (utils.isStringIndexContains(publicStateBin, 3, '1')) {
      message = 'armed_home';
    } else if (utils.isStringIndexContains(publicStateBin, 2, '1')) {
      message = 'armed_night';
    } else if (utils.isStringIndexContains(publicStateBin, 1, '1')) {
      message = 'disarmed';
    } else if (utils.isStringIndexContains(publicStateBin, 12, '1')) {
      message = 'armed_away';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishInputStateUpdates = (id: string, publicState: number) => {
    const topic = `${mqttConfig.topic_prefix}/binary_sensor/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    let message: string;

    console.log(`Polling input received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if ([12, 11, 9, 8].some(i => utils.isStringIndexContains(publicStateBin, i, '1'))) {
      message = 'On';
    } else if ([10, 6].some(i => utils.isStringIndexContains(publicStateBin, i, '1'))) {
      message = 'Off';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishOutputStateUpdates = (id: string, publicState: number) => {
    const topic = `${mqttConfig.topic_prefix}/switch/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    let message: string;

    console.log(`Polling output received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if (utils.isStringIndexContains(publicStateBin, 12, '1')) {
      message = 'On';
    } else if (utils.isStringIndexContains(publicStateBin, 11, '1')) {
      message = 'Off';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishDoorStateUpdates = (id: string, publicState: number) => {
    const topic = `${mqttConfig.topic_prefix}/lock/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    let message: string;

    console.log(`Polling door received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if (utils.isStringIndexContains(publicStateBin, 12, '1')) {
      message = 'UNLOCKED';
    } else if (utils.isStringIndexContains(publicStateBin, 4, '1')) {
      message = 'LOCKED';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };

  const stateChangeMapping = {
    'AreaStateRequest': publishAreaStateUpdates,
    'InputStateRequest': publishInputStateUpdates,
    'OutputStateRequest': publishOutputStateUpdates,
    'DoorStateRequest': publishDoorStateUpdates
  };

  let monitorUpdatesPayload: MonitorStateUpdatesPayloadInterface[];

  const initPayload = () => {
    monitorUpdatesPayload = [
      {
        ID: "AreaStateRequest",
        RequestType: "MonitorEntityStates",
        InputData: {
          stateType: "AreaState",
          timeSinceUpdate: "0"
        }
      },
      {
        ID: "InputStateRequest",
        RequestType: "MonitorEntityStates",
        InputData: {
          stateType: "InputState",
          timeSinceUpdate: "0"
        }
      },
      {
        ID: "OutputStateRequest",
        RequestType: "MonitorEntityStates",
        InputData: {
          stateType: "OutputState",
          timeSinceUpdate: "0"
        }
      },
      {
        ID: "DoorStateRequest",
        RequestType: "MonitorEntityStates",
        InputData: {
          stateType: "DoorState",
          timeSinceUpdate: "0"
        }
      }
    ];
  }

  while (true) {
    try {
      if (!monitorUpdatesPayload) {
        initPayload();
      }

      console.log('Polling monitor updates with payload ' + JSON.stringify(monitorUpdatesPayload));

      const response = await inception.monitorUpdates(monitorUpdatesPayload, initPayload);
      const result = response.Result as StateResultInterface;

      const handler = stateChangeMapping[response?.ID];

      if (handler) {
        result.stateData.forEach(item => handler(item.ID, item.PublicState));
        monitorUpdatesPayload.find(item => item.ID === response.ID).InputData.timeSinceUpdate = result.updateTime.toString(); // updates `timeSinceUpdate` = 'Result.updateTime' for the new long polling request.
      }
    } catch (error) {
      console.error('Inception polling encountered an error: ', error.message);
    }
  }
};
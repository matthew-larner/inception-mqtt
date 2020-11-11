import { MonitorUpdatesPayloadInterface } from '../contracts';
import * as inception from './inception';
import * as mqtt from './mqtt';
import * as utils from './utils';

export const polling = async () => {
  const publishAreaStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/alarm_control_panel/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    const indexOfOne = publicStateBin.indexOf('1') + 1;
    let message: string;

    console.log(`Polling area received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if (indexOfOne === 11) {
      message = 'triggered';
    } else if (indexOfOne === 10) {
      message = 'pending';
    } else if (indexOfOne === 9) {
      message = 'arming';
    } else if (indexOfOne === 4) {
      message = 'armed_away';
    } else if (indexOfOne === 3) {
      message = 'armed_home';
    } else if (indexOfOne === 2) {
      message = 'armed_night';
    } else if (indexOfOne === 1) {
      message = 'disarmed';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishInputStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/binary_sensor/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    const indexOfOne = publicStateBin.indexOf('1') + 1;
    let message: string;

    console.log(`Polling input received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if ([12, 11, 9, 8].includes(indexOfOne)) {
      message = 'On';
    } else if ([10, 6].includes(indexOfOne)) {
      message = 'Off';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishOutputStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/switch/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    const indexOfOne = publicStateBin.indexOf('1') + 1;
    let message: string;

    console.log(`Polling ouput received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if (indexOfOne === 12) {
      message = 'On';
    } else if (indexOfOne === 11) {
      message = 'Off';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishDoorStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/lock/${id}`;
    const publicStateBin = utils.numberToBinaryStringWithZeroPadding(publicState, 12);
    const indexOfOne = publicStateBin.indexOf('1') + 1;
    let message: string;

    console.log(`Polling door received id '${id}' with public state '${publicState}' in binary '${publicStateBin}'`);

    if (indexOfOne === 12) {
      message = 'UNLOCKED';
    } else if (indexOfOne === 1) {
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

  let monitorUpdatesPayload: MonitorUpdatesPayloadInterface[];

  while (true) {
    try {
      if (!monitorUpdatesPayload || !inception.getIsConnected()) {
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

      console.log('Polling monitor updates with payload ' + JSON.stringify(monitorUpdatesPayload));

      const response = await inception.monitorUpdates(monitorUpdatesPayload);

      const handler = stateChangeMapping[response?.ID];

      if (handler) {
        response.Result.stateData.forEach(item => handler(item.ID, item.PublicState));
        monitorUpdatesPayload.find(item => item.ID === response.ID).InputData.timeSinceUpdate = response.Result.updateTime.toString(); // updates `timeSinceUpdate` = 'Result.updateTime' for the new long polling request.
      }
    } catch (error) {
      console.error('Inception polling encountered an error: ', error.message);
    }
  }
};
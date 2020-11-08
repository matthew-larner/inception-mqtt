import * as inception from './inception';
import * as mqtt from './mqtt';

export const polling = async () => {
  const publishAreaStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/alarm_control_panel/${id}`;
    let message: string;

    if ([1, 256].includes(publicState)) {
      message = 'armed_away';
    } else if (publicState === 2) {
      message = 'triggered';
    } else if ([4, 16].includes(publicState)) {
      message = 'pending';
    } else if (publicState === 8) {
      message = 'arming';
    } else if ([32, 2048].includes(publicState)) {
      message = 'disarmed';
    } else if (publicState === 512) {
      message = 'armed_home';
    } else if (publicState === 1024) {
      message = 'armed_night';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishInputStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/binary_sensor/${id}`;
    let message: string;

    if ([1, 2, 8].includes(publicState)) {
      message = 'On';
    } else if ([4, 64].includes(publicState)) {
      message = 'Off';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishOutputStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/switch/${id}`;
    let message: string;

    if (publicState === 1) {
      message = 'On';
    } else if (publicState === 2) {
      message = 'Off';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };
  const publishDoorStateUpdates = (id: string, publicState: number) => {
    const topic = `inception/lock/${id}`;
    let message: string;

    if (publicState === 1) {
      message = 'UNLOCKED';
    } else if (publicState === 256) {
      message = 'LOCKED';
    } else {
      // ignore if unexpected public state
      return;
    }

    mqtt.publish(topic, message);
  };

  const monitorUpdatesPayload = [
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

  const stateChangeMapping = {
    'AreaStateRequest': publishAreaStateUpdates,
    'InputStateRequest': publishInputStateUpdates,
    'OutputStateRequest': publishOutputStateUpdates,
    'DoorStateRequest': publishDoorStateUpdates
  };

  while (true) {
    try {
      const response = await inception.monitorUpdates(monitorUpdatesPayload);

      const handler = stateChangeMapping[response?.ID];

      if (handler) {
        response.Result.stateData.forEach(item => handler(item.ID, item.PublicState));
        monitorUpdatesPayload.find(item => item.ID === response.ID).InputData.timeSinceUpdate = response.Result.updateTime.toString(); // updates `timeSinceUpdate` = 'Result.updateTime' for the new long polling request.
      }
    } catch (error) {
      console.error(error.message);
    }
  }
};
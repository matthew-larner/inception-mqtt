import axios, { AxiosError } from 'axios';
import * as delay from 'delay';

import { ControlObjectInterface, MonitorStateUpdatesResponseInterface, MonitorReviewUpdatesResponseInterface } from '../contracts';

let config: any;
let userID = '';
let isConnected = false;
let wasConnectedOnce = false;
let onAuthenticatedHandler: (isConnected: boolean) => void;

const responseErrorHandler = async (error: AxiosError, onUnAuthorizedHandler?: () => void) => {
  if (!error.response && !['TIMEOUT'].some((i) => error.message.toUpperCase().includes(i))) {
    onAuthenticatedHandler(false);
    isConnected = false;
  }

  if (error?.response?.status === 401) {
    onUnAuthorizedHandler?.();
    await authenticate();
  }
};

const authenticate = async (): Promise<void> => {
  try {
    const response = await axios.post(config.base_url + '/authentication/login', {
      Username: config.username,
      Password: config.password
    });

    // Kill app if authentication fails
    if (response.data.Response.Result !== "Success") {
      console.error('Killing application due to failed inception authentication');
      process.exit(1);
    }

    userID = response.data.UserID;
    isConnected = true;
    wasConnectedOnce = true;

    onAuthenticatedHandler(true);
  } catch (error) {
    console.error('Error in inception authentication: ' + error.message);

    if (!wasConnectedOnce) {
      process.exit(1);
    }
  }
};

export const getControlAreas = async (): Promise<ControlObjectInterface[]> => {
  try {
    const response = await axios.get(config.base_url + '/control/area', {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in getting control areas: ' + error.message);

    await responseErrorHandler(error);

    return [];
  }
};

export const postControlAreaActivity = async (id: string, controlType: string) => {
  try {
    await axios.post(`${config.base_url}/control/area/${id}/activity`, {
      Type: 'ControlArea',
      AreaControlType: controlType
    }, {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    console.log(`Posted control area activity for area id '${id}' with area control type '${controlType}'`);
  } catch (error) {
    console.error('Error in posting control area activity: ' + error.message);

    await responseErrorHandler(error);
  }
}

export const getControlDoors = async (): Promise<ControlObjectInterface[]> => {
  try {
    const response = await axios.get(config.base_url + '/control/door', {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in getting control doors: ' + error.message);

    await responseErrorHandler(error);

    return [];
  }
};

export const postControlDoorActivity = async (id: string, controlType: string) => {
  try {
    await axios.post(`${config.base_url}/control/door/${id}/activity`, {
      Type: 'ControlDoor',
      DoorControlType: controlType,
      TimeSecs: 5
    }, {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    console.log(`Posted control door activity for door id '${id}' with door control type '${controlType}'`);
  } catch (error) {
    console.error('Error in posting control door activity: ' + error.message);

    await responseErrorHandler(error);
  }
}

export const getControlOutputs = async (): Promise<ControlObjectInterface[]> => {
  try {
    const response = await axios.get(config.base_url + '/control/output', {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in getting control outputs: ' + error.message);

    await responseErrorHandler(error);

    return [];
  }
};

export const postControlOutputActivity = async (id: string, controlType: string) => {
  try {
    await axios.post(`${config.base_url}/control/output/${id}/activity`, {
      Type: 'ControlOutput',
      OutputControlType: controlType
    }, {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    console.log(`Posted control output activity for output id '${id}' with output control type '${controlType}'`);
  } catch (error) {
    console.error('Error in posting control output activity: ' + error.message);

    await responseErrorHandler(error);
  }
}

export const getControlInputs = async (): Promise<ControlObjectInterface[]> => {
  try {
    const response = await axios.get(config.base_url + '/control/input', {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in getting control inputs: ' + error.message);

    await responseErrorHandler(error);

    return [];
  }
};

export const monitorUpdates = async (payload: any[], onUnAuthorizedHandler: () => void): Promise<MonitorStateUpdatesResponseInterface|MonitorReviewUpdatesResponseInterface> => {
  try {
    const timeout = (config.polling_timeout ?? 60) * 1000;
    const response = await axios.post(`${config.base_url}/monitor-updates`, payload, {
      headers: {
        Cookie: `LoginSessId=${userID}`
      },
      timeout
    });

    console.log('Successfully polled monitor updates with response ' + JSON.stringify(response.data));

    if (!isConnected) {
      onAuthenticatedHandler(true);
      isConnected = true;
    }

    return response.data;
  } catch (error) {
    console.error('Error in posting monitor updates: ' + error.message);

    await responseErrorHandler(error, onUnAuthorizedHandler);

    const delaySeconds = (config.polling_delay || 10) * 1000;
    await delay(delaySeconds);
  }
}

export const connect = async (configuration: any, onAuthenticated: (isConnected: boolean) => void) => {
  config = configuration;
  onAuthenticatedHandler = onAuthenticated;

  await authenticate();
};
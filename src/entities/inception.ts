import axios, { AxiosResponse } from 'axios';

import { ControlObjectInterface, MonitorUpdatesResponseInterface } from '../contracts';

let config: any;
let userID = '';
let onAuthenticatedHandler: (isConnected: boolean) => void;

const unauthorizedHandling = async (response: AxiosResponse) => {
  if (response?.status === 401) {
    onAuthenticatedHandler(false);
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

    onAuthenticatedHandler(true);
  } catch (error) {
    console.error('Error in inception authentication: ' + error.message);
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

    await unauthorizedHandling(error.response);

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

    await unauthorizedHandling(error.response);
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

    await unauthorizedHandling(error.response);

    return [];
  }
};

export const postControlDoorActivity = async (id: string, controlType: string) => {
  try {
    await axios.post(`${config.base_url}/control/door/${id}/activity`, {
      Type: 'ControlDoor',
      DoorControlType: controlType
    }, {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    console.log(`Posted control door activity for door id '${id}' with door control type '${controlType}'`);
  } catch (error) {
    console.error('Error in posting control door activity: ' + error.message);

    await unauthorizedHandling(error.response);
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

    await unauthorizedHandling(error.response);

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

    await unauthorizedHandling(error.response);
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

    await unauthorizedHandling(error.response);

    return [];
  }
};

export const monitorUpdates = async (payload: any[]): Promise<MonitorUpdatesResponseInterface> => {
  try {
    const response = await axios.post(`${config.base_url}/monitor-updates`, payload, {
      headers: {
        Cookie: `LoginSessId=${userID}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in posting monitor updates: ' + error.message);

    await unauthorizedHandling(error.response);
  }
}

export const connect = async (configuration: any, onAuthenticated: (isConnected: boolean) => void) => {
  config = configuration;
  onAuthenticatedHandler = onAuthenticated;

  await authenticate();
};
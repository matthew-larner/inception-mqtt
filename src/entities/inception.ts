import axios from 'axios';

import { ControlObjectInterface } from '../contracts';

export default (config: any) => {
  let userID = '';

  const authenticate = async (): Promise<void> => {
    const response = await axios.post(config.base_url + '/authentication/login', {
      Username: config.username,
      Password: config.password
    });

    userID = response.data.UserID;
    console.log(userID);
  };

  const getControlAreas = async (): Promise<ControlObjectInterface[]> => {
    try {
      const response = await axios.get(config.base_url + '/control/area', {
        headers: {
          Cookie: `LoginSessId=${userID}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error in getting control areas: ' + error.message);
      return [];
    }
  };

  const postControlAreaActivity = async (id: string, controlType: string) => {
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
    }
  }

  const getControlDoors = async (): Promise<ControlObjectInterface[]> => {
    try {
      const response = await axios.get(config.base_url + '/control/door', {
        headers: {
          Cookie: `LoginSessId=${userID}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error in getting control doors: ' + error.message);
      return [];
    }
  };

  const postControlDoorActivity = async (id: string, controlType: string) => {
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
    }
  }

  const getControlOutputs = async (): Promise<ControlObjectInterface[]> => {
    try {
      const response = await axios.get(config.base_url + '/control/output', {
        headers: {
          Cookie: `LoginSessId=${userID}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error in getting control outputs: ' + error.message);
      return [];
    }
  };

  const postControlOutputActivity = async (id: string, controlType: string) => {
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
    }
  }

  const getControlInputs = async (): Promise<ControlObjectInterface[]> => {
    try {
      const response = await axios.get(config.base_url + '/control/input', {
        headers: {
          Cookie: `LoginSessId=${userID}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error in getting control inputs: ' + error.message);
      return [];
    }
  };

  return {
    authenticate,
    getControlAreas,
    postControlAreaActivity,
    getControlDoors,
    postControlDoorActivity,
    getControlOutputs,
    postControlOutputActivity,
    getControlInputs
  }
};
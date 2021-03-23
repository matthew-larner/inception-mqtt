export interface ControlObjectInterface {
  ReportingID: number;
  ID: string;
  Name: string;
}

export type StateRequestType = "AreaStateRequest" | "DoorStateRequest" | "InputStateRequest" | "OutputStateRequest";

export interface MonitorUpdatesPayloadInterface {
  ID: StateRequestType;
  RequestType: string;
  InputData: {
    stateType: string;
    timeSinceUpdate: string;
  }
}

export interface MonitorUpdatesResponseInterface {
  ID: StateRequestType;
  Result: {
    updateTime: number;
    stateData: StateDataInterface[];
  }
}

export interface StateDataInterface {
  ID: string;
  PublicState: number;
}

export interface MqttConfig {
  broker: string,
  port: number,
  username: string,
  password: string,
  qos: 0 | 1 | 2,
  retain: boolean,
  discovery: boolean,
  discovery_prefix: string,
  topic_prefix: string,
  availability_topic: string,
  alarm_code: number,
}

export interface InceptionConfig {
  base_url: string,
  port: number,
  username: string,
  password: string,
  polling_timeout: number,
  polling_delay: number,
}

export interface Config {
  mqtt: MqttConfig,
  inception: InceptionConfig
}

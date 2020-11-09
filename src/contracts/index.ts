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
export interface ControlObjectInterface {
  ReportingID: number;
  ID: string;
  Name: string;
}

export interface MonitorUpdatesResponseInterface {
  ID: "AreaStateRequest" | "DoorStateRequest" | "InputStateRequest" | "OutputStateRequest";
  Result: {
    updateTime: number;
    stateData: StateDataInterface[];
  }
}

export interface StateDataInterface {
  ID: string;
  PublicState: number;
}
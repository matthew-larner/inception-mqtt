export interface ControlObjectInterface {
  ReportingID: number;
  ID: string;
  Name: string;
}

export type StateRequestType = "AreaStateRequest" | "DoorStateRequest" | "InputStateRequest" | "OutputStateRequest";

export interface MonitorStateUpdatesPayloadInterface {
  ID: StateRequestType;
  RequestType: string;
  InputData: MonitorStateInputData
}

export interface MonitorStateUpdatesResponseInterface {
  ID: StateRequestType;
  Result: StateResultInterface
}

export interface StateResultInterface {
  updateTime: number;
  stateData: StateDataInterface[];
}

export interface StateDataInterface {
  ID: string;
  PublicState: number;
}

export interface MonitorReviewUpdatesResponseInterface {
  ID: string
  Result: ReviewDataInterface[]
}

export interface ReviewDataInterface {
  ID: string;
  Description: string;
  MessageCategory: number;
  What: string;
  Where: string;
  WhenTicks: number;
}

export interface MonitorStateInputData {
  stateType: string;
  timeSinceUpdate: string;
}

export type LiveReviewRequestType = "LiveReviewEvents";

export interface MonitorReviewUpdatesPayloadInterface {
  ID: LiveReviewRequestType;
  RequestType: LiveReviewRequestType;
  InputData: MonitorReviewInputData
}

export interface MonitorReviewInputData {
  referenceId: string;
  referenceTime: number;
}
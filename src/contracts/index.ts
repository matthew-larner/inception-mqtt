import { OnMessageCallback } from 'mqtt';

export interface MqttClient {
  onMessage: (callback: OnMessageCallback) => void;
  publish: (topic: string, payload: string) => void;
  subscribe: (topic: string) => void;
}

export interface ControlObjectInterface {
  ReportingID: number;
  ID: string;
  Name: string;
}
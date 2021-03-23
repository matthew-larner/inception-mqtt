declare namespace NodeJS {
    export interface ProcessEnv {
      MQTT_HOST: string;
      MQTT_PORT: string;
      MQTT_USER: string;
      MQTT_PASSWORD: string;
      MQTT_QOS: string;
      MQTT_RETAIN: string;
      MQTT_DISCOVERY: string;
      MQTT_DISCOVERY_PREFIX: string;
      MQTT_TOPIC_PREFIX: string;
      MQTT_AVAILABILITY_TOPIC: string;
      MQTT_ALARM_CODE: string;
      BASE_URL: string;
      PORT: string;
      USERNAME: string;
      PASSWORD: string;
      POLLING_TIMEOUT: string;
      POLLING_DELAY: string;
    }
}
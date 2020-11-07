import * as mqtt from 'mqtt';

const connect = (config: any, connectOptions: mqtt.IClientOptions, onConnected: (client: mqtt.MqttClient) => void) => {

  const client = mqtt.connect(`mqtt://${config.broker}:${config.port}`, connectOptions);

  client.on('error', (err) => {
    console.log(`Mqtt error: ${err.message}`);
  });

  client.on('connect', () => {
    console.log('Connected to mqtt');

    onConnected(client);
  });

  client.on('close', () => {
    console.log('Mqtt connection closed');
  });

  const onMessage = (callback: mqtt.OnMessageCallback) => {
    client.on('message', callback);
  };

  const publish = (topic: string, payload: string) => {
    console.log(`Sending payload: ${payload} to topic: ${topic}`);
    client.publish(topic, payload, {
      qos: config.qos,
      retain: config.retain
    });
  };

  const subscribe = (topic: string) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.log(`Cannot subscribe to topic ${topic}: ${err}`);
      } else {
        console.log('Subscribed to topic:', topic);
      }
    });
  }

  return {
    onMessage,
    publish,
    subscribe
  };
};

export default connect;
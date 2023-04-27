import { MonitorReviewUpdatesPayloadInterface, ReviewDataInterface, LiveReviewRequestType } from '../contracts';
import * as inception from './inception';
import * as mqtt from './mqtt';

export const polling = async (mqttConfig: any) => {

  const liveReviewEvents = 'LiveReviewEvents';

  const publishLiveReviewUpdates = (data: ReviewDataInterface) => {
    const topic = `${mqttConfig.topic_prefix}/event`;
    const { Description, MessageCategory, What, Where } = data;

    mqtt.publish(topic, JSON.stringify({
      Description,
      MessageCategory,
      What,
      Where
    }), false);
  };
  
  let monitorUpdatesPayload: MonitorReviewUpdatesPayloadInterface[];
  const initPayload = () => {
    monitorUpdatesPayload = [
      {
        ID: liveReviewEvents,
        RequestType: liveReviewEvents,
        InputData: {
         referenceId: null,
         referenceTime: null
        }
      }
    ];
  }

  while (true) {
    try {
      if (!monitorUpdatesPayload) {
        initPayload();
      }

      console.log('Polling monitor updates with payload ' + JSON.stringify(monitorUpdatesPayload));

      const response = await inception.monitorUpdates(monitorUpdatesPayload, initPayload);
      const results = response.Result as unknown as ReviewDataInterface[];

      if(!results || !Array.isArray(results) || results.length < 1) {
        throw { message: `Invalid response from monitoring API: ${JSON.stringify(response)}` };
      }

      for( let result of results) {
         publishLiveReviewUpdates(result);
      }

      const lastResult = results[results.length-1];
      monitorUpdatesPayload = [{
        ID: liveReviewEvents,
            RequestType: liveReviewEvents,
            InputData: {
             referenceId: null,
             referenceTime: lastResult.WhenTicks+1000
            }
      }];

    } catch (error) {
      console.error('Inception polling encountered an error: ', error.message);
    }
  }
};
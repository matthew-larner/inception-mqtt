import { MonitorReviewUpdatesPayloadInterface, ReviewDataInterface } from '../contracts';
import * as inception from './inception';
import * as mqtt from './mqtt';

export const polling = async () => {

  const publishLiveReviewUpdates = (data: ReviewDataInterface) => {
    const topic = `inception/event`;
    const { Description, MessageCategory, What, Where } = data;

    mqtt.publish(topic, JSON.stringify({
      Description,
      MessageCategory,
      What,
      Where
    }));
  };
  
  let monitorUpdatesPayload: MonitorReviewUpdatesPayloadInterface[];

  const initPayload = () => {
    monitorUpdatesPayload = [
      {
        ID: "LiveReviewEvents",
        RequestType: "LiveReviewEvents",
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
      const newMonitorUpdatesPayload = [];

      for( let result of results) {
         publishLiveReviewUpdates(result);
         newMonitorUpdatesPayload.push({
            ID: "LiveReviewEvents",
            RequestType: "LiveReviewEvents",
            InputData: {
             referenceId: result.ID,
             referenceTime: result.WhenTicks
            }
         });
         monitorUpdatesPayload = newMonitorUpdatesPayload;
      }

    } catch (error) {
      console.error('Inception polling encountered an error: ', error.message);
    }
  }
};
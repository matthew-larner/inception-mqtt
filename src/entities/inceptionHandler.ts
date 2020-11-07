export const handler = (commandTopic: string, callback: (payload: string) => Promise<void>) =>
  async (topic: string, message: Buffer) => {
    if (topic === commandTopic) {
      const payload = message.toString();

      await callback(payload);
    }
  };

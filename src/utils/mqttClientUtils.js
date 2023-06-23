import mqtt from "precompiled-mqtt";

export const createDregMqttClient = () => {
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
  const client = mqtt.connect(`ws://81.26.80.192:8080`, {
    clientId: clientId,
    username: "dregserver2",
    password: "T#eP0wer"
  });
  client.on('connect', () => console.log("connected"));
  client.on('disconnect', () => console.log("disconnected"));

  return client;
}
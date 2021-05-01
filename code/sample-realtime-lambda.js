const AWS = require('aws-sdk');
const MQTT = require("async-mqtt");
const SNS = new AWS.SNS();
const TopicArn = process.env.TOPIC_ARN;
const MqttEndpoint = process.env.MQTT_ENDPOINT
let client;

exports.handler = async (event) => {
    // Aufbau einer MQTT Verbindung zu IoT Core
    if (!client) {
        client = await MQTT.connect(MqttEndpoint);
    }

    let output = [];
    for (let record of event.records) {
        try {
            // Daten aus base64 dekodieren
            const data = Buffer.from(record.data, 'base64');

            // versendet Alarm via SNS
            await SNS.publish({ Subject: `Schwellwertüberschreitung!`,
                Message: `Rohdaten:\n ${JSON.stringify(data, null, 4)}`,
                TopicArn, MessageDeduplicationId: record.recordId
            });

            // versendet einen Shutdown Befehl via MQTT
            await client.publish("geraet/"+record.deviceId, 
                { action: "shutdown" })
            // Nachricht erfolgreich verarbeitet
            output.push({recordId: record.recordId, result: 'Ok'});
        } catch (err) {
            // Fehler aufgetreten - erneuten Versuch via Kinesis Data Analytics
            console.error("Fehler bei", record.recordId, "wegen", err);
            output.push({recordId: record.recordId, result: 'DeliveryFailed'});
        }
    }
    return { records: output }
}

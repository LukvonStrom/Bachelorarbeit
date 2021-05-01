import { parseResult } from '@nordicsemiconductor/timestream-helpers'
const AWS = require('aws-sdk');
const TimestreamQuery = new AWS.TimestreamQuery();
const SNS = new AWS.SNS();
const TopicArn = process.env.TOPIC_ARN;
const Database = process.env.DATABASE;
const Table = process.env.TABLE;
let results;

async function getData(nextToken = null) {
    let queryData = await TimestreamQuery.query({
        // Code ist *nicht* SQL-Injection sicher!
        QueryString: "SELECT device_id, count(*) AS count" +
            ` FROM "${Database}"."${Table}"`+
            " WHERE measure_name = 'co2' AND time > ago(10m)" +
            " AND measure_value::bigint > 60" +
            " GROUP BY device_id",
        NextToken: nextToken
    }).promise()

    results = results.concat(parseResult(queryData))
    if (queryData.nextToken) {
        await getData(queryData.nextToken);
    }
}

exports.handler = async (event) => {
    try {
        let time = event.time ?  new Date(event.time) : new Date();

        await getData();
        for (let {device_id, count} of results) {
            // versendet Alarm via SNS
            await SNS.publish({Subject: `Schwellwertüberschreitung in ${device_id}!`,
                Message: `${count} mal in den letzten 15 Minuten überschritten`,
                TopicArn, MessageDeduplicationId: time+device_id
            }).promise();

            // versendet einen Shutdown Befehl via MQTT
            await client.publish("geraet/" + device_id,{ action: "shutdown" })
        }


    } catch (err) {
        console.error(err)
        // Fehler erneut werfen, damit CloudWatch Alarm geschalten wird
        throw err;
    }

}

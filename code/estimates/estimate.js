const fs = require('fs');
const path = require('path')
let sensorcount = 200;
let alertsPerMonth = 5;
let months = 3;

let result = [];

for (let i = 1; i <= sensorcount; i++) {
    for (let month = 0; month <= months; month++) {
        for (let alert = 1; alert <= alertsPerMonth; alert++) {
            let alertDate = new Date(2021, month, alert, 2, 0, 0)
            result.push({
                deviceId: `Sensor-${i}`,
                timestamp: alertDate.toISOString(),
                value: Math.floor(Math.random() * 1000) + 100
            })
        }
    }

}

let filtered = result.filter(element =>
    (element.deviceId == "Sensor-1")
    && element.timestamp == "2021-01-01T01:00:00.000Z")

const estimatePath = path.join(__dirname, '/estimate.json')
const fEstimatePath = path.join(__dirname, '/filtered-estimate.json')

fs.writeFileSync(estimatePath, JSON.stringify(result, null, 4))
fs.writeFileSync(fEstimatePath, JSON.stringify(filtered, null, 4))

let stats = fs.statSync(estimatePath)
console.log("Size in KB", stats.size / (1024))
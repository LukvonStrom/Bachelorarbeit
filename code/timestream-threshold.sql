WITH neueUeberschreitungen AS (
  SELECT device_id, BIN(time, 10m) AS zeitfenster,
    ROUND(AVG(measure_value::bigint), 2) AS co2wert 
  FROM "iot-device-simulator"."air_quality" 
  WHERE time between ago(10m) and now() AND measure_name = 'co2' 
    AND measure_value::bigint > 500 
  GROUP BY device_id,
    BIN(time, 10m)
),
historie AS (
  SELECT device_id, count(*) AS historischeUeberschreitungen 
  FROM "iot-device-simulator"."air_quality" 
  WHERE measure_name = 'co2' AND measure_value::bigint > 500 
  GROUP BY device_id 
)
SELECT neueUeberschreitungen.device_id AS geraeteId, zeitfenster,
  co2wert, historischeUeberschreitungen 
FROM neueUeberschreitungen 
INNER JOIN historie ON neueUeberschreitungen.device_id = historie.device_id
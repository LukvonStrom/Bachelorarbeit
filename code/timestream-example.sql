SELECT DeviceType,
  measure_name,
  BIN(time, 120m) AS binned_timestamp,
  ROUND(AVG(measure_value::double), 2) AS avg,
  ROUND(APPROX_PERCENTILE(measure_value::double, 0.99), 2) AS p99 
FROM "iot - demo".iot 
WHERE measure_name = 'temperature' 
  AND time > ago(24h) 
GROUP BY DeviceType,
  measure_name,
  BIN(time, 120m) 
ORDER BY ABS(avg - p99) DESC
final KTable<Long, CountAndSum> ratingCountAndSum =
	ratingsById.aggregate(() -> new CountAndSum(0 L, 0.0),
		(key, value, aggregate) -> {
			aggregate.setCount(aggregate.getCount() + 1);
			aggregate.setSum(aggregate.getSum() + value);
			return aggregate;
		},
		Materialized.with(Long(), countAndSumSerde));

final KTable<Long, Double> ratingAverage =
	ratingCountAndSum.mapValues(value -> value.getSum() / value.getCount(),
		Materialized.as("average-ratings"));
const redis = require('../redis');

module.exports = time => {
	if (typeof global.it === 'function')
		return async (ctx, next) => next();

	return async (ctx, next) => {
		const {url} = ctx.request;
		const key = `cache:${url}`;

		const value = await redis.get(key);

		if (typeof value === 'string') {
			ctx.body = JSON.parse(value);

			return;
		}

		await next();

		await redis.set(key, JSON.stringify(ctx.body));
		await redis.expire(key, time);
	};
};

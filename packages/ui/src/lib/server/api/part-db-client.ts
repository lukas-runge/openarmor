import { createClient } from './part-db/client';
import { env } from '$env/dynamic/private';

export const partDbClient = createClient({
	baseUrl: env.PART_DB_BASE_URL,
	headers: {
		Authorization: `Bearer ${env.PART_DB_API_TOKEN}`
	}
});

import { env } from '$env/dynamic/private';
import { createClient } from 'openpnp-rest-api-client';

export const openPnpClient = createClient({
	baseUrl: env.OPENPNP_BASE_URL
});

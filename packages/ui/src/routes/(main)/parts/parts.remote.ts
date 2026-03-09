import { command, query } from '$app/server';
import { openPnpClient } from '$lib/server/api/openpnp-client';
import { partDbClient } from '$lib/server/api/part-db-client';
import { apiPartsGetCollection } from '$lib/server/api/part-db/index';
import {
	listParts,
	deletePartById,
	createPart,
	listPackages,
	getPackageById,
	createPackage
} from 'openpnp-rest-api-client';
import * as v from 'valibot';

function ensureSuccess<T>(result: { data?: T; error?: any }): T {
	if (result.error) {
		throw new Error(result.error);
	}
	if (result.data === undefined) {
		throw new Error('No data returned');
	}
	return result.data;
}

export const getPartDBParts = query(async () => {
	return ensureSuccess(
		await apiPartsGetCollection({ client: partDbClient, query: { itemsPerPage: 10000 } })
	)['hydra:member'];
});

export const getOpenPnpParts = query(async () => {
	return ensureSuccess(await listParts({ client: openPnpClient }));
});

export const deleteOpenPnpPart = command(v.string(), async (id: string) => {
	ensureSuccess(await deletePartById({ client: openPnpClient, path: { id } }));
	await getOpenPnpParts().refresh();
});

export const createOpenPnpPart = command(
	v.object({
		id: v.string(),
		name: v.nullable(v.string()),
		height: v.nullable(v.number()),
		package: v.nullable(v.string()),
		speed: v.nullable(v.number()),
		fiducialVision: v.nullable(v.string()),
		bottomVision: v.nullable(v.string()),
		throughBoardDepth: v.nullable(v.number())
	}),
	async (part) => {
		const pkg = (await getPackageById({ client: openPnpClient, path: { id: part.package! } })).data;
		if (!pkg) {
			await createPackage({
				client: openPnpClient,
				body: {
					pkg: {
						id: part.package!,
						description: null,
						tapeSpecification: null,
						pickVacuumLevel: null,
						placeBlowOffLevel: null,
						bottomVision: null,
						fiducialVision: null
					}
				}
			});
		}

		ensureSuccess(await createPart({ client: openPnpClient, body: { part } }));
		await getOpenPnpParts().refresh();
	}
);

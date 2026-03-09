<script lang="ts">
	import {
		createOpenPnpPart,
		deleteOpenPnpPart,
		getOpenPnpParts,
		getPartDBParts
	} from './parts.remote';

	let progress: { progress: number; label: string } | undefined = $state();

	async function createAllPartsInPartDB() {
		const partDBParts = await getPartDBParts();
		for (let i = 0; i < partDBParts.length; i++) {
			const part = partDBParts[i];
			progress = { progress: i / partDBParts.length, label: `Creating ${part.name} (${part.id})` };
			await createOpenPnpPart({
				id: part.id!.toString(),
				name: part.name,
				height: 5,
				package: part.footprint?.name || 'Unknown',
				speed: 1,
				fiducialVision: null,
				bottomVision: null,
				throughBoardDepth: 0
			});
		}
		progress = undefined;
	}

	async function deleteAllOpenPnpParts() {
		const openPnpParts = await getOpenPnpParts();
		for (let i = 0; i < openPnpParts.length; i++) {
			const part = openPnpParts[i];
			progress = { progress: i / openPnpParts.length, label: `Deleting ${part.name} (${part.id})` };
			await deleteOpenPnpPart(part.id);
		}
		progress = undefined;
	}
</script>

<h1>Parts</h1>

<div class="card my-3">
	<div class="card-body">
		{#if progress}
			<div class="d-flex align-items-center">
				<div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
				<span>{progress.label}</span>
			</div>
			<div class="progress mt-2">
				<div
					class="progress-bar progress-bar-striped progress-bar-animated"
					role="progressbar"
					style="width: {progress.progress * 100}%"
					aria-valuenow={progress.progress * 100}
					aria-valuemin="0"
					aria-valuemax="100"
				></div>
			</div>
		{:else}
			<button class="btn btn-outline-danger" onclick={deleteAllOpenPnpParts}>
				Delete all parts in OpenPnP
			</button>
			<button
				class="btn btn-outline-primary"
				onclick={async () => {
					await deleteAllOpenPnpParts();
					await createAllPartsInPartDB();
				}}
			>
				Recreate all parts in OpenPnP from PartDB
			</button>
		{/if}
	</div>
</div>

<div class="row">
	<div class="col-sm-6">
		<h3>PartDB Parts</h3>
		<div class="table-responsive">
			<table class="table table-sm table-hover">
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Picture</th>
						<th>Description</th>
						<th>Category</th>
						<th>Footprint</th>
						<th>Manufacturer</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each await getPartDBParts() as part}
						<tr>
							<td>{part.id}</td>
							<td>{part.name}</td>
							<td>
								<img
									class="thumbnail"
									src={part.master_picture_attachment?.thumbnail_url}
									alt={part.name}
								/>
							</td>
							<td>{part.description}</td>
							<td>{part.category?.full_path}</td>
							<td>{part.footprint?.name}</td>
							<td>{part.manufacturer?.name}</td>
							<td>
								{#if !(await getOpenPnpParts()).some((p) => p.name === part.name)}
									<button
										class="btn btn-sm btn-outline-primary"
										aria-label="Create in OpenPnP"
										onclick={async () => {
											await createOpenPnpPart({
												id: part.id!.toString(),
												name: part.name,
												height: 5,
												package: part.footprint?.name || 'Unknown',
												speed: 1,
												fiducialVision: null,
												bottomVision: null,
												throughBoardDepth: 0
											});
										}}
									>
										<i class="fas fa-plus"></i>
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="col-sm-6">
		<h3>OpenPNP Parts</h3>
		<div class="table-responsive">
			<table class="table table-sm table-hover">
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Height</th>
						<th>Package</th>
						<th>Speed</th>
						<th>Fiducial Vision</th>
						<th>Bottom Vision</th>
						<th>Through Board Depth</th>
					</tr>
				</thead>
				<tbody>
					{#each await getOpenPnpParts() as part}
						<tr>
							<td>{part.id}</td>
							<td>{part.name}</td>
							<td>{part.height}</td>
							<td>{part.package}</td>
							<td>{part.speed}</td>
							<td>{part.fiducialVision}</td>
							<td>{part.bottomVision}</td>
							<td>{part.throughBoardDepth}</td>
							<td>
								<button
									class="btn btn-sm btn-outline-danger"
									onclick={() => deleteOpenPnpPart(part.id)}
									aria-label="Delete part"
								>
									<i class="fas fa-trash"></i>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.thumbnail {
		max-width: 2rem;
		max-height: 2rem;
		object-fit: contain;
	}
</style>

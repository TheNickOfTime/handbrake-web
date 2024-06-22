import { DirectoryItems } from '../../../../../types/directory';
// import { HandbrakeOutputExtensions } from '../../../../../types/file-extensions';

export function HandleNameCollision(newItems: DirectoryItems, existingItems: DirectoryItems) {
	const fileCollisions: { [index: string]: number[] } = {};

	newItems.forEach((newItem, newItemIndex) => {
		// Init fileCollisions object with an empty array
		fileCollisions[newItem.name] = [];

		// Check for collisions against existing files
		existingItems.forEach((existingItem) => {
			if (newItem.name + newItem.extension == existingItem.name + existingItem.extension) {
				fileCollisions[newItem.name].push(newItemIndex);
				console.log(
					`'${newItem.name + newItem.extension}' collides with existing file '${
						existingItem.name + existingItem.extension
					}' at the output path.`
				);
				return;
			}
		});

		// Check for collisions against other output files that may now have the same name
		newItems
			.filter((_, index) => index != newItemIndex)
			.forEach((otherNewItem) => {
				if (
					newItem.name == otherNewItem.name &&
					!fileCollisions[newItem.name].includes(newItemIndex)
				) {
					fileCollisions[newItem.name].push(newItemIndex);
					console.log(
						`${newItem.name + newItem.extension} collides with another output ${
							otherNewItem.name + otherNewItem.extension
						}`
					);
					return;
				}
			});
	});

	const renamedItems: DirectoryItems = JSON.parse(JSON.stringify(newItems));
	Object.values(fileCollisions).forEach((collisionArray) => {
		let fileIndex = 1;
		collisionArray.forEach((value) => {
			// Increment the file index while a filename with the appended index exists either in the existing or renamed files
			while (
				existingItems
					.map((existingItem) => existingItem.name + existingItem.extension)
					.includes(
						renamedItems[value].name + `_${fileIndex}` + renamedItems[value].extension
					) ||
				renamedItems
					.map((item) => item.name)
					.includes(renamedItems[value].name + `_${fileIndex}`)
			) {
				fileIndex += 1;
			}

			const newName = renamedItems[value].name + `_${fileIndex}`;
			renamedItems[value].name = newName;
		});
	});

	return renamedItems;
}

// export function GetOutputItemsFromInputItems(
// 	inputItems: DirectoryItems,
// 	extension: HandbrakeOutputExtensions
// ) {}

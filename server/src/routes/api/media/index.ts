import {
	type GetMediaDirectoryRequest,
	type GetMediaDirectoryResponse,
	type PutMediaDirectoryRequest,
	type PutMediaDirectoryResponse,
} from '@handbrake-web/shared/types/api/media';
import { Router } from 'express';
import fs from 'node:fs';
import { access, mkdir, readdir, stat } from 'node:fs/promises';
import { join, parse, relative, resolve } from 'node:path';
import { env } from 'node:process';

const router = Router();

// Directory ---------------------------------------------------------------------------------------

// Get directory
router.get(
	'/media/directory',
	async (req: GetMediaDirectoryRequest, res: GetMediaDirectoryResponse) => {
		// Prevent filesystem access outside of the media path
		if (relative(resolve(env.VIDEO_PATH!), resolve(req.query.path)).match(/^\.\./)) {
			res.status(403).json({ error: `'${req.query.path}' is not a media path.` });
			return;
		}

		// Get directory info
		try {
			const item = await stat(req.query.path);
			if (item.isDirectory()) {
				const dir = await readdir(req.query.path, {
					encoding: 'utf-8',
					withFileTypes: true,
				});

				res.status(200).json({
					parentPath: resolve(req.query.path, '..'),
					currentPath: req.query.path,
					items: dir.map((child) => {
						return {
							isDirectory: child.isDirectory(),
							fullPath: join(child.parentPath, child.name),
							parsedPath: parse(join(child.parentPath, child.name)),
						};
					}),
				});
			} else {
				// Respond with error if not a path
				res.status(404).json({ error: `'${req.query.path}' is not a directory.` });
			}
		} catch (err) {
			res.status(404).json({
				// Respond with error if the file cannot be stat-ed
				error: `No media exists at path '${req.query.path}'.`,
			});
		}
	}
);

// Create directory
router.put(
	'/media/directory',
	async (req: PutMediaDirectoryRequest, res: PutMediaDirectoryResponse) => {
		// Prevent filesystem access outside of the media path
		if (relative(resolve(env.VIDEO_PATH!), resolve(req.query.parentPath)).match(/^\.\.\//)) {
			res.status(403).json({ error: `'${req.query.parentPath}' is not a media path.` });
			return;
		}

		try {
			// Check if the program has write permissions in the parent dir
			await access(req.query.parentPath, fs.constants.W_OK);

			// Get parent directory permissions to copy to new directory
			const parentMode = (await stat(req.query.parentPath)).mode;

			// Make new directory
			const fullPath = join(req.query.parentPath, req.query.directoryName);
			await mkdir(fullPath, { mode: parentMode, recursive: false });
			res.status(201);
		} catch (err) {
			res.status(404).json({
				// Respond with error if the file cannot be stat-ed
				error: `Cannot create a directory at path '${join(
					req.query.parentPath,
					req.query.directoryName
				)}'.`,
			});
		}
	}
);

export { router as mediaRoutes };

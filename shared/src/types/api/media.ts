import { type Request, type Response } from 'express';
import type { ParsedPath } from 'node:path';
import type { ResponseError } from '.';

export interface MediaDirectoryItem {
	isDirectory: boolean;
	fullPath: string;
	parsedPath: ParsedPath;
}

// .../api/media/directory -------------------------------------------------------------------------
export type GetMediaDirectoryRequest = Request<{}, {}, {}, GetMediaDirectoryRequestQuery>;
export interface GetMediaDirectoryRequestQuery {
	path: string;
	recursive?: boolean;
}

export type GetMediaDirectoryResponse = Response<GetMediaDirectoryResponseBody | ResponseError>;
export interface GetMediaDirectoryResponseBody {
	parentPath: string;
	currentPath: string;
	items: MediaDirectoryItem[];
}

export type PutMediaDirectoryRequest = Request<{}, {}, {}, PutMediaDirectoryRequestQuery>;
export interface PutMediaDirectoryRequestQuery {
	parentPath: string;
	directoryName: string;
}

export type PutMediaDirectoryResponse = Response;

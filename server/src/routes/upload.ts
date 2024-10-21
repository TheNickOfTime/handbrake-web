import bodyParser from 'body-parser';
import express, { Express, Request } from 'express';
import logger from 'logging';
import multer from 'multer';
import { GetConfig } from 'scripts/config';

export default function UploadRoutes(app: Express) {
	// Define how to store uploaded files from multer
	const storage = multer.diskStorage({
		destination: (req, file, setDestination) => {
			setDestination(
				null,
				req.body['upload-path'] || GetConfig().upload['default-upload-path']
			);
		},
		filename: (req, file, setFilename) => {
			setFilename(null, file.originalname);
		},
	});
	const upload = multer({ storage: storage });

	// Primary upload route
	app.post('/upload', upload.single('file-upload'), (req, res) => {
		const file = req.file;

		if (file) {
			logger.info(`[upload] New file '${file.filename}' uploaded to '${file.destination}'.`);
		}

		res.sendStatus(200);
	});
}

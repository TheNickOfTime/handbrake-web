import path from 'path';
import { cwd } from 'process';

export const getDataPath = () => process.env.DATA_PATH || path.join(cwd(), '../data');
export const getVideoPath = () => process.env.VIDEO_PATH || path.resolve(cwd(), '../video');

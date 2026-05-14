import express from 'express';
import { getMainCategories, getSubCategories, getMetadata } from '../controllers/metadataController.js';

const router = express.Router();

router.get('/main-categories', getMainCategories);
router.get('/categories', getSubCategories);
router.get('/', getMetadata);

export default router;

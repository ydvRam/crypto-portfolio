const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/src/middleware/authMiddleware');
const { addAsset, getAssets, updateAsset, deleteAsset } = require('../controllers/assetController');
const { validateRequest } = require('../../auth/src/middleware/validationMiddleware');
const { addAssetValidation, updateAssetValidation } = require('../validations/assetValidations');

router.post('/', protect, validateRequest(addAssetValidation), addAsset);
router.get('/:portfolioId', protect, getAssets);
router.put('/:id', protect, validateRequest(updateAssetValidation), updateAsset);
router.delete('/:id', protect, deleteAsset);

module.exports = router;

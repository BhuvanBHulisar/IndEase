import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { protect as auth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * IDENTITY & PROFILE ROUTES
 */

// @route   GET api/profile
// @desc    Get current user profile
router.get('/', auth, profileController.getProfile);

// @route   PATCH api/profile
// @desc    Update user profile data
router.patch('/', auth, profileController.updateProfile);
router.patch('/verify', auth, profileController.verifyProfile);

// @route   POST api/profile/skills
// @desc    Add skill to expert arsenal
router.post('/skills', auth, profileController.addSkill);

// @route   DELETE api/profile/skills/:skill
// @desc    Remove skill from expert arsenal
router.delete('/skills/:skill', auth, profileController.removeSkill);

export default router;

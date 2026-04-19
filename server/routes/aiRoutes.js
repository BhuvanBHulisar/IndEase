import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.middleware.js';
import db from '../config/db.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/diagnose
router.post('/diagnose', protect, async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service not configured' });
    }
    const { machineName, machineType, machineYear, manufacturer, issueDescription, videoPath } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let parts = [];

        // Add video if provided
        if (videoPath && fs.existsSync(videoPath)) {
            const videoData = fs.readFileSync(videoPath);
            const base64Video = videoData.toString('base64');
            const mimeType = 'video/mp4';
            parts.push({
                inlineData: { data: base64Video, mimeType }
            });
        }

        // Add text prompt
        parts.push({
            text: `You are an expert industrial machine fault diagnosis system.

Machine Details:
- Name: ${machineName || 'Unknown'}
- Type: ${machineType || 'Industrial Machine'}
- Year: ${machineYear || 'Unknown'}
- Manufacturer: ${manufacturer || 'Unknown'}
- Issue Description: ${issueDescription || 'No description provided'}

${videoPath ? 'Also analyse the uploaded video carefully — look for visual faults, abnormal movements, smoke, leaks, sparks, and listen for unusual sounds.' : ''}

Respond ONLY in this exact JSON format, no extra text, no markdown:
{
  "faultSummary": "one sentence summary of the likely fault",
  "likelyFaults": ["fault 1", "fault 2", "fault 3"],
  "severity": "Low",
  "requiredExpertise": ["skill1", "skill2"],
  "estimatedRepairTime": "2-4 hours",
  "urgencyReason": "one sentence explanation",
  "confidence": 85,
  "videoFindings": "what was observed in the video or null if no video"
}`
        });

        const result = await model.generateContent(parts);
        const raw = result.response.text();
        const clean = raw.replace(/```json|```/g, '').trim();
        const diagnosis = JSON.parse(clean);

        res.json({ success: true, diagnosis });
    } catch (err) {
        console.error('Gemini diagnosis error:', err);
        res.status(500).json({ error: 'AI diagnosis failed', details: err.message });
    }
});

// POST /api/ai/match-expert
router.post('/match-expert', protect, async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service not configured' });
    }
    const { jobId, diagnosis } = req.body;

    try {
        // Fetch available experts
        const experts = await db.query(`
            SELECT u.id, u.name,
                   pp.specialization, pp.skills,
                   pp.level, pp.service_city,
                   pp.years_experience,
                   COALESCE(pp.avg_rating, 5.0) as rating,
                   COALESCE(pp.completed_jobs, 0) as completed_jobs
            FROM users u
            JOIN producer_profiles pp ON pp.user_id = u.id
            WHERE u.role = 'producer'
            AND pp.status = 'available'
            ORDER BY pp.avg_rating DESC
        `);

        if (!experts.rows.length) {
            return res.json({ success: false, message: 'No experts available currently' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(`
You are an expert matching system for industrial machine repairs.

Fault Diagnosis:
${JSON.stringify(diagnosis, null, 2)}

Available Experts:
${JSON.stringify(experts.rows, null, 2)}

Pick the BEST expert based on required expertise match, rating, and experience.
Respond ONLY in this exact JSON format, no extra text, no markdown:
{
  "bestExpertId": "uuid here",
  "bestExpertName": "name here",
  "reason": "one sentence why this expert is best match",
  "matchScore": 92
}`);

        const raw = result.response.text();
        const clean = raw.replace(/```json|```/g, '').trim();
        const match = JSON.parse(clean);

        // Auto-assign expert to job
        if (jobId && match.bestExpertId) {
            await db.query(
                `UPDATE service_requests 
                 SET producer_id = $1, status = 'assigned',
                     ai_matched = TRUE, ai_match_reason = $2
                 WHERE id = $3`,
                [match.bestExpertId, match.reason, jobId]
            );

            // Notify expert via socket
            if (global.io) {
                global.io.to(`user_${match.bestExpertId}`).emit('new_service_request', {
                    jobId,
                    message: `You have been AI-matched to a service request.`,
                    aiMatched: true
                });
            }
        }

        res.json({ success: true, match });
    } catch (err) {
        console.error('Gemini matching error:', err);
        res.status(500).json({ error: 'AI matching failed', details: err.message });
    }
});

export default router;

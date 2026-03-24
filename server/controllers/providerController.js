import { getExpertStats, getFullExpertPerformance } from '../services/expertPerformanceService.js';

export async function getProviderStats(req, res) {
    try {
        const stats = await getExpertStats(req.params.id);

        if (!stats) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        return res.json(stats);
    } catch (error) {
        console.error('[ProviderStats] Retrieval failure:', error);
        return res.status(500).json({ message: 'Failed to retrieve provider stats' });
    }
}

export async function getProviderPerformance(req, res) {
    try {
        const performance = await getFullExpertPerformance(req.params.id);

        if (!performance) {
            return res.status(404).json({ message: 'Provider performance not found' });
        }

        return res.json(performance);
    } catch (error) {
        console.error('[ProviderPerformance] Retrieval failure:', error);
        return res.status(500).json({ message: 'Failed to retrieve provider performance' });
    }
}

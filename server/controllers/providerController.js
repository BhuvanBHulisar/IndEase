import { getExpertStats, getFullExpertPerformance } from '../services/expertPerformanceService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPTY_PERFORMANCE = {
    points: 0, level: 'Starter', salary: 0, levelSalary: 0,
    jobsCompleted: 0, rating: 5.0, acceptanceRate: '100%',
    avgCompletionTime: '0 hrs', totalJobsDeclined: 0,
    totalJobEarnings: 0, monthJobEarnings: 0,
    totalSalaryPaid: 0, lifetimeEarnings: 0,
    recentPointEvents: [],
    nextSalaryDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    isEmpty: true
};

export async function getProviderStats(req, res) {
    if (!UUID_REGEX.test(req.params.id)) {
        return res.json({ points: 0, level: 'Starter', salary: 0, recentActivity: [] });
    }
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
    if (!UUID_REGEX.test(req.params.id)) {
        return res.json({ ...EMPTY_PERFORMANCE });
    }
    try {
        const performance = await getFullExpertPerformance(req.params.id);
        if (!performance) {
            return res.json({ ...EMPTY_PERFORMANCE });
        }
        return res.json(performance);
    } catch (error) {
        console.error('[ProviderPerformance] Retrieval failure:', error);
        return res.status(500).json({ message: 'Failed to retrieve provider performance' });
    }
}

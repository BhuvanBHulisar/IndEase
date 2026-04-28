/** Maps DB / API status to the 4-step consumer service tracker. */

export const SERVICE_STEPS = ['Pending', 'Expert Found', 'In Progress', 'Completed'];

/** Sent in chat when expert marks a job completed (consumer + expert). */
export const SERVICE_COMPLETION_MESSAGE =
  'This service request has been marked as completed. Thank you for using IndEase.';

/**
 * @param {string} raw — e.g. broadcast, accepted, payment_pending, in_progress, completed
 * @param {string} [legacyStatus] — old UI-only labels from mock data
 * @returns {{ stageIndex: number, label: string, badgeVariant: 'yellow' | 'blue' | 'green' }}
 */
export function getServiceStageMeta(raw, legacyStatus) {
  const r = (raw || '').toLowerCase();
  if (r === 'broadcast' || r === 'pending') {
    return { stageIndex: 0, label: 'Pending', badgeVariant: 'yellow' };
  }
  if (r === 'accepted' || r === 'payment_pending') {
    return { stageIndex: 1, label: 'Expert Found', badgeVariant: 'blue' };
  }
  if (r === 'in_progress') {
    return { stageIndex: 2, label: 'In Progress', badgeVariant: 'blue' };
  }
  if (r === 'completed') {
    return { stageIndex: 3, label: 'Completed', badgeVariant: 'green' };
  }

  const leg = (legacyStatus || '').trim();
  if (leg === 'Pending') return { stageIndex: 0, label: 'Pending', badgeVariant: 'yellow' };
  if (leg === 'Expert Found') return { stageIndex: 1, label: 'Expert Found', badgeVariant: 'blue' };
  if (leg === 'In Progress') return { stageIndex: 2, label: 'In Progress', badgeVariant: 'blue' };
  if (leg === 'Completed') return { stageIndex: 3, label: 'Completed', badgeVariant: 'green' };

  return { stageIndex: 0, label: 'Pending', badgeVariant: 'yellow' };
}

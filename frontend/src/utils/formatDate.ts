/**
 * utils/formatDate.ts
 * Date formatting helpers
 */

export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

export const formatDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

export const calculateAge = (dateOfBirth?: string | Date | null): string => {
  if (!dateOfBirth) return 'Age unknown';
  try {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    if (years === 0) {
      const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return `${Math.max(1, monthDiff)} month${monthDiff > 1 ? 's' : ''} old`;
    }
    return `${years} year${years > 1 ? 's' : ''} old`;
  } catch {
    return 'Age unknown';
  }
};

import { AuditLog } from '../models/AuditLog';

export const logAdminAction = async (params: {
  adminId: string;
  action: string;
  target: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> => {
  try {
    await AuditLog.create({
      admin: params.adminId,
      action: params.action,
      target: params.target,
      targetId: params.targetId,
      meta: params.meta,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write entry:', err);
  }
};

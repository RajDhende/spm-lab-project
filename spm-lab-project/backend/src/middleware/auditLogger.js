import AuditLog from '../models/AuditLog.js';

export const auditLogger = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    // Always send the original response exactly once
    const sendResult = originalSend.call(this, data);

    // Log after response is sent (fire-and-forget)
    try {
      if (req.user && req.method !== 'GET' && res.statusCode >= 200 && res.statusCode < 400) {
        const fullPath = req.originalUrl || `${req.baseUrl || ''}${req.path || ''}`;
        const entityType = getEntityTypeFromPath(fullPath);
        if (entityType !== 'AI_Model' && entityType !== 'Unknown') {
          let entityId = req.params?.id || req.body?._id || res.locals?.entityId || null;
          if (!entityId && data) {
            try {
              const parsed = typeof data === 'string' ? JSON.parse(data) : data;
              if (parsed && typeof parsed === 'object') {
                if (parsed._id) {
                  entityId = parsed._id;
                } else if (Array.isArray(parsed) && parsed[0] && parsed[0]._id) {
                  entityId = parsed[0]._id;
                } else if (parsed.data && parsed.data._id) {
                  entityId = parsed.data._id;
                }
              }
            } catch (_) {}
          }

          if (entityId) {
            const auditData = {
              action: getActionFromMethod(req.method),
              entityType,
              entityId,
              performedBy: req.user._id,
              details: {
                method: req.method,
                path: req.path,
                body: sanitizeBody(req.body),
              },
              ipAddress: req.ip || req.connection?.remoteAddress,
              userAgent: req.get('user-agent'),
            };

            AuditLog.create(auditData).catch(err => {
              console.error('Audit log error:', err);
            });
          }
        }
      }
    } catch (_) {}

    return sendResult;
  };

  next();
};

const getActionFromMethod = (method) => {
  const methodMap = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
  };
  return methodMap[method] || 'UPDATE';
};

const getEntityTypeFromPath = (path) => {
  if (path.includes('/tickets')) return 'Ticket';
  if (path.includes('/users')) return 'User';
  if (path.includes('/workflow')) return 'Workflow';
  if (path.includes('/ai')) return 'AI_Model';
  return 'Unknown';
};

const sanitizeBody = (body) => {
  const sanitized = { ...body };
  if (sanitized.password) delete sanitized.password;
  return sanitized;
};


import ApiError from '../utils/ApiError.js';

const restrictTo = (...roles) => {
  return (request, _response, next) => {
    if (!request.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    if (roles.length === 0) {
      return next(new ApiError(500, 'RBAC roles must be configured'));
    }

    if (!roles.includes(request.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }

    return next();
  };
};

export { restrictTo };
export const tenantScope = (req, res, next) => {
  if (!req.user || !req.user.organizationId) {
    res.status(401);
    return next(new Error("Not authorized, no organization context"));
  }
  req.organizationId = req.user.organizationId;
  next();
};

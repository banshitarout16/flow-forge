// Usage: router.post("/", protect, tenantScope, roleCheck("org_admin", "manager"), controller)
export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Forbidden: insufficient role permissions"));
    }
    next();
  };
};

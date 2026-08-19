import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";


export const registerOrganization = asyncHandler(async (req, res) => {
  const { orgName, domainType, adminName, adminEmail, password } = req.body;

  if (!orgName || !adminName || !adminEmail || !password) {
    res.status(400);
    throw new Error("orgName, adminName, adminEmail and password are required");
  }

  const slug = orgName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const existingOrg = await Organization.findOne({ slug });
  if (existingOrg) {
    res.status(400);
    throw new Error("An organization with a similar name already exists");
  }

  const organization = await Organization.create({ name: orgName, slug, domainType });

  const adminUser = await User.create({
    organizationId: organization._id,
    name: adminName,
    email: adminEmail,
    password,
    role: "org_admin",
  });

  organization.createdBy = adminUser._id;
  await organization.save();

  const accessToken = generateAccessToken(adminUser);
  const refreshToken = generateRefreshToken(adminUser);

  res.status(201).json({
    user: adminUser.toSafeObject(),
    organization: { id: organization._id, name: organization.name, slug: organization.slug },
    accessToken,
    refreshToken,
  });
});


export const login = asyncHandler(async (req, res) => {
  const { orgSlug, email, password } = req.body;

  if (!orgSlug || !email || !password) {
    res.status(400);
    throw new Error("orgSlug, email and password are required");
  }

  const organization = await Organization.findOne({ slug: orgSlug.toLowerCase().trim() });
  if (!organization) {
    res.status(401);
    throw new Error("Invalid organization, email, or password");
  }

  const user = await User.findOne({ organizationId: organization._id, email: email.toLowerCase().trim() });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Invalid organization, email, or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid organization, email, or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    user: user.toSafeObject(),
    organization: { id: organization._id, name: organization.name, slug: organization.slug },
    accessToken,
    refreshToken,
  });
});


export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

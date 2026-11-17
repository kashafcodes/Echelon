import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRET = "lokart_dev_secret_key_change_in_production_2026";

export function getJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

export function generateToken(user, rememberMe = false) {
  const expiresIn = rememberMe ? "30d" : (process.env.JWT_EXPIRES_IN || "7d");
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn },
  );
}

export function sendTokenResponse(user, statusCode, response, vendor = null, rememberMe = false) {
  const token = generateToken(user, rememberMe);
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + maxAge),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  response.cookie("token", token, cookieOptions);

  return response.status(statusCode).json({
    ok: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar || "",
      address: user.address,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    vendor: vendor
      ? {
          id: vendor._id,
          businessName: vendor.businessName,
          description: vendor.description,
          category: vendor.category,
          businessAddress: vendor.businessAddress,
          verificationStatus: vendor.verificationStatus,
        }
      : null,
  });
}

export function clearTokenCookie(response) {
  response.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import { getJwtSecret } from "../utils/token.js";

export async function authenticate(request, response, next) {
  try {
    let token = null;

    // Check Authorization header (Bearer token)
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith("Bearer ")
    ) {
      token = request.headers.authorization.split(" ")[1];
    } else if (request.cookies && request.cookies.token) {
      // Check HTTP-only cookie
      token = request.cookies.token;
    }

    if (!token) {
      return response.status(401).json({
        ok: false,
        message: "Authentication required. Please log in.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return response.status(401).json({
        ok: false,
        message: "Invalid or expired session. Please log in again.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return response.status(401).json({
        ok: false,
        message: "User account not found or deactivated.",
      });
    }

    request.user = user;

    if (user.role === "vendor") {
      const vendor = await Vendor.findOne({ userId: user._id });
      request.vendor = vendor;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return response.status(500).json({
      ok: false,
      message: "Internal authentication error.",
    });
  }
}

export function authorize(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({
        ok: false,
        message: `Forbidden: role '${request.user?.role || "anonymous"}' is not authorized to access this resource.`,
      });
    }
    next();
  };
}

export function requireVendorApproved(request, response, next) {
  if (request.user.role !== "vendor") {
    return next();
  }
  if (!request.vendor || request.vendor.verificationStatus !== "approved") {
    return response.status(403).json({
      ok: false,
      message: "Vendor account is pending administrator approval.",
      verificationStatus: request.vendor?.verificationStatus || "pending",
    });
  }
  next();
}

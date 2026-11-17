import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import { sendTokenResponse, clearTokenCookie } from "../utils/token.js";

function validateAddress(address, label = "Address") {
  if (!address || typeof address !== "object") {
    return `${label} is required.`;
  }
  const required = ["province", "district", "municipality", "ward", "street"];
  for (const field of required) {
    if (!address[field] || !String(address[field]).trim()) {
      return `${label}: ${field} is required.`;
    }
  }
  return null;
}

/**
 * POST /api/auth/register
 * Public registration for Customers and Vendors only.
 */
export async function register(request, response) {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role = "customer",
      address,
      // Vendor fields
      businessName,
      description,
      category,
      businessAddress,
      businessAddressSameAsResidential = false,
    } = request.body;

    // 1. Role validation
    if (role === "admin") {
      return response.status(403).json({
        ok: false,
        message: "Admin accounts cannot be created through public registration.",
      });
    }

    if (!["customer", "vendor"].includes(role)) {
      return response.status(400).json({
        ok: false,
        message: "Invalid role specified. Only 'customer' or 'vendor' are allowed.",
      });
    }

    // 2. Common required fields validation
    if (!name || !name.trim()) {
      return response.status(400).json({ ok: false, message: "Full Name is required." });
    }
    if (!email || !email.trim()) {
      return response.status(400).json({ ok: false, message: "Email Address is required." });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email.trim())) {
      return response.status(400).json({ ok: false, message: "Please provide a valid email address." });
    }
    if (!phone || !phone.trim()) {
      return response.status(400).json({ ok: false, message: "Phone Number is required." });
    }
    if (!password) {
      return response.status(400).json({ ok: false, message: "Password is required." });
    }
    if (password.length < 6) {
      return response.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters long.",
      });
    }
    if (password !== confirmPassword) {
      return response.status(400).json({
        ok: false,
        message: "Passwords do not match.",
      });
    }

    // 3. Residential Address validation
    const addressError = validateAddress(address, "Residential Address");
    if (addressError) {
      return response.status(400).json({ ok: false, message: addressError });
    }

    // 4. Vendor fields validation if role is vendor
    let resolvedBusinessAddress = null;
    if (role === "vendor") {
      if (!businessName || !businessName.trim()) {
        return response.status(400).json({
          ok: false,
          message: "Business / Shop Name is required for vendors.",
        });
      }
      if (!description || !description.trim()) {
        return response.status(400).json({
          ok: false,
          message: "Business Description is required for vendors.",
        });
      }
      if (!category || !category.trim()) {
        return response.status(400).json({
          ok: false,
          message: "Product Category is required for vendors.",
        });
      }

      if (businessAddressSameAsResidential) {
        resolvedBusinessAddress = { ...address };
      } else {
        const bAddressError = validateAddress(businessAddress, "Business Address");
        if (bAddressError) {
          return response.status(400).json({ ok: false, message: bAddressError });
        }
        resolvedBusinessAddress = businessAddress;
      }
    }

    // 5. Check duplicate email
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return response.status(409).json({
        ok: false,
        message: "An account with this email address already exists. Please log in.",
      });
    }

    // 6. Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role,
      address: {
        country: address.country?.trim() || "Nepal",
        province: address.province.trim(),
        district: address.district.trim(),
        municipality: address.municipality.trim(),
        ward: address.ward.trim(),
        street: address.street.trim(),
        landmark: address.landmark?.trim() || "",
      },
    });

    await user.save();

    // 7. Create Vendor document if role is vendor
    let vendor = null;
    if (role === "vendor") {
      vendor = new Vendor({
        userId: user._id,
        businessName: businessName.trim(),
        description: description.trim(),
        category: category.trim(),
        businessAddress: {
          country: resolvedBusinessAddress.country?.trim() || "Nepal",
          province: resolvedBusinessAddress.province.trim(),
          district: resolvedBusinessAddress.district.trim(),
          municipality: resolvedBusinessAddress.municipality.trim(),
          ward: resolvedBusinessAddress.ward.trim(),
          street: resolvedBusinessAddress.street.trim(),
          landmark: resolvedBusinessAddress.landmark?.trim() || "",
        },
        verificationStatus: "pending",
      });
      await vendor.save();
    }

    // 8. Return response with token & cookie
    return sendTokenResponse(user, 201, response, vendor, false);
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return response.status(400).json({ ok: false, message: messages.join(", ") });
    }
    return response.status(500).json({
      ok: false,
      message: "An error occurred during registration. Please try again.",
    });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(request, response) {
  try {
    const { email, password, rememberMe = false } = request.body;

    if (!email || !email.trim()) {
      return response.status(400).json({ ok: false, message: "Email Address is required." });
    }
    if (!password) {
      return response.status(400).json({ ok: false, message: "Password is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return response.status(401).json({
        ok: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        ok: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return response.status(401).json({
        ok: false,
        message: "Invalid email or password.",
      });
    }

    let vendor = null;
    if (user.role === "vendor") {
      vendor = await Vendor.findOne({ userId: user._id });
    }

    return sendTokenResponse(user, 200, response, vendor, Boolean(rememberMe));
  } catch (error) {
    console.error("Login error:", error);
    return response.status(500).json({
      ok: false,
      message: "An error occurred during login. Please try again.",
    });
  }
}

/**
 * GET /api/auth/me
 * Protected endpoint returning current user session
 */
export async function getMe(request, response) {
  try {
    const user = request.user;
    const vendor = request.vendor || null;

    return response.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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
            createdAt: vendor.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("getMe error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch user session." });
  }
}

/**
 * POST /api/auth/logout
 */
export function logout(_request, response) {
  clearTokenCookie(response);
  return response.json({
    ok: true,
    message: "Logged out successfully.",
  });
}

/**
 * PUT /api/auth/profile
 * Updates name, phone, address, and vendor details if vendor
 */
export async function updateProfile(request, response) {
  try {
    const user = request.user;
    const { name, phone, address, businessName, description, category, businessAddress } =
      request.body;

    if (name && name.trim()) user.name = name.trim();
    if (phone && phone.trim()) user.phone = phone.trim();

    if (address) {
      const addressError = validateAddress(address, "Address");
      if (addressError) {
        return response.status(400).json({ ok: false, message: addressError });
      }
      user.address = {
        country: address.country?.trim() || "Nepal",
        province: address.province.trim(),
        district: address.district.trim(),
        municipality: address.municipality.trim(),
        ward: address.ward.trim(),
        street: address.street.trim(),
        landmark: address.landmark?.trim() || "",
      };
    }

    await user.save();

    let vendor = null;
    if (user.role === "vendor") {
      vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) {
        if (businessName && businessName.trim()) vendor.businessName = businessName.trim();
        if (description && description.trim()) vendor.description = description.trim();
        if (category && category.trim()) vendor.category = category.trim();
        if (businessAddress) {
          const bAddressError = validateAddress(businessAddress, "Business Address");
          if (bAddressError) {
            return response.status(400).json({ ok: false, message: bAddressError });
          }
          vendor.businessAddress = {
            country: businessAddress.country?.trim() || "Nepal",
            province: businessAddress.province.trim(),
            district: businessAddress.district.trim(),
            municipality: businessAddress.municipality.trim(),
            ward: businessAddress.ward.trim(),
            street: businessAddress.street.trim(),
            landmark: businessAddress.landmark?.trim() || "",
          };
        }
        await vendor.save();
      }
    }

    return response.json({
      ok: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        isActive: user.isActive,
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
  } catch (error) {
    console.error("Update profile error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to update profile.",
    });
  }
}

/**
 * PUT /api/auth/password
 * Changes the authenticated user's password
 */
export async function changePassword(request, response) {
  try {
    const user = request.user;
    const { currentPassword, newPassword, confirmNewPassword } = request.body;

    if (!currentPassword) {
      return response.status(400).json({ ok: false, message: "Current password is required." });
    }
    if (!newPassword) {
      return response.status(400).json({ ok: false, message: "New password is required." });
    }
    if (newPassword.length < 6) {
      return response.status(400).json({
        ok: false,
        message: "New password must be at least 6 characters long.",
      });
    }
    if (newPassword !== confirmNewPassword) {
      return response.status(400).json({
        ok: false,
        message: "New passwords do not match.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return response.status(400).json({
        ok: false,
        message: "Current password does not match our records.",
      });
    }

    user.password = newPassword;
    await user.save();

    return response.json({
      ok: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return response.status(500).json({
      ok: false,
      message: "An error occurred while changing password.",
    });
  }
}

/**
 * GET /api/auth/admin/users
 * Admin only: view registered users and vendors
 */
export async function getAdminUsers(_request, response) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const vendors = await Vendor.find().populate("userId", "name email phone").sort({ createdAt: -1 });

    return response.json({
      ok: true,
      counts: {
        totalUsers: users.length,
        customers: users.filter((u) => u.role === "customer").length,
        vendors: vendors.length,
        pendingVendors: vendors.filter((v) => v.verificationStatus === "pending").length,
        approvedVendors: vendors.filter((v) => v.verificationStatus === "approved").length,
      },
      users,
      vendors,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return response.status(500).json({ ok: false, message: "Failed to load admin user data." });
  }
}

/**
 * PUT /api/auth/admin/vendors/:id/status
 * Admin only: approve or reject vendor application
 */
export async function updateVendorStatus(request, response) {
  try {
    const { id } = request.params;
    const { status } = request.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return response.status(400).json({
        ok: false,
        message: "Status must be 'approved', 'rejected', or 'pending'.",
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { returnDocument: "after" },
    ).populate("userId", "name email phone");

    if (!vendor) {
      return response.status(404).json({ ok: false, message: "Vendor application not found." });
    }

    return response.json({
      ok: true,
      message: `Vendor verification status updated to '${status}'.`,
      vendor,
    });
  } catch (error) {
    console.error("Update vendor status error:", error);
    return response.status(500).json({ ok: false, message: "Failed to update vendor status." });
  }
}

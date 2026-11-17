import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes.js";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lokart_test";

async function runTests() {
  console.log("=== LokArt Authentication System End-to-End Tests ===");

  await mongoose.connect(uri);
  console.log("Connected to test database.");

  // Clear test collections
  await User.deleteMany({ email: /@test\.lokart$/ });
  await Vendor.deleteMany({});

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  // Helper fetch
  async function api(path, method = "GET", body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data, headers: res.headers };
  }

  try {
    // 1. Missing address fields validation
    console.log("\nScenario 1: Missing address fields validation");
    const resMissingAddress = await api("/register", "POST", {
      name: "Incomplete Address User",
      email: "incomplete@test.lokart",
      phone: "9800000001",
      password: "Password123!",
      confirmPassword: "Password123!",
      role: "customer",
      address: {
        province: "Madhesh Province",
        // missing district, municipality, ward, street
      },
    });
    assert(
      resMissingAddress.status === 400 && resMissingAddress.data.ok === false,
      `Rejected registration with missing address fields (status: ${resMissingAddress.status}, message: "${resMissingAddress.data?.message}")`,
    );

    // 2. Invalid password handling (short & mismatch)
    console.log("\nScenario 2: Invalid password handling");
    const resShortPass = await api("/register", "POST", {
      name: "Short Pass User",
      email: "short@test.lokart",
      phone: "9800000002",
      password: "123",
      confirmPassword: "123",
      role: "customer",
      address: {
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj",
        ward: "2",
        street: "Link Road",
      },
    });
    assert(
      resShortPass.status === 400 && resShortPass.data.message.includes("6 characters"),
      `Rejected password shorter than 6 chars: "${resShortPass.data?.message}"`,
    );

    const resMismatchPass = await api("/register", "POST", {
      name: "Mismatch User",
      email: "mismatch@test.lokart",
      phone: "9800000002",
      password: "Password123!",
      confirmPassword: "DifferentPassword123!",
      role: "customer",
      address: {
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj",
        ward: "2",
        street: "Link Road",
      },
    });
    assert(
      resMismatchPass.status === 400 && resMismatchPass.data.message.includes("match"),
      `Rejected mismatching passwords: "${resMismatchPass.data?.message}"`,
    );

    // 3. Customer registration and login
    console.log("\nScenario 3: Customer registration and login");
    const customerPayload = {
      name: "Aarti Sharma",
      email: "aarti@test.lokart",
      phone: "9845112233",
      password: "SecureCustomer123!",
      confirmPassword: "SecureCustomer123!",
      role: "customer",
      address: {
        country: "Nepal",
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj Metropolitan City",
        ward: "4",
        street: "Adarshnagar",
        landmark: "Near Clock Tower",
      },
    };
    const resCustReg = await api("/register", "POST", customerPayload);
    assert(
      resCustReg.status === 201 && resCustReg.data.ok === true && resCustReg.data.user.role === "customer",
      `Customer registered successfully (ID: ${resCustReg.data?.user?.id}, Role: ${resCustReg.data?.user?.role})`,
    );
    const customerToken = resCustReg.data.token;
    assert(Boolean(customerToken), "JWT token returned in registration response");

    // Verify password is NOT in response
    assert(resCustReg.data.user.password === undefined, "Plain-text password is NOT leaked in response");

    // Customer login
    const resCustLogin = await api("/login", "POST", {
      email: "aarti@test.lokart",
      password: "SecureCustomer123!",
    });
    assert(
      resCustLogin.status === 200 && resCustLogin.data.ok === true,
      `Customer login successful with valid credentials (token generated)`,
    );

    // Customer wrong password
    const resCustWrongPass = await api("/login", "POST", {
      email: "aarti@test.lokart",
      password: "WrongPassword!",
    });
    assert(
      resCustWrongPass.status === 401 && resCustWrongPass.data.ok === false,
      `Login rejected for invalid password (status: 401)`,
    );

    // 4. Duplicate email prevention
    console.log("\nScenario 4: Duplicate email prevention");
    const resDuplicate = await api("/register", "POST", customerPayload);
    assert(
      resDuplicate.status === 409 && resDuplicate.data.ok === false,
      `Duplicate email prevented with status 409 Conflict: "${resDuplicate.data?.message}"`,
    );

    // 5. Vendor registration (with pending verificationStatus)
    console.log("\nScenario 5: Vendor registration with initial 'pending' status");
    const vendorPayload = {
      name: "Sita Devi Mithila",
      email: "sita@test.lokart",
      phone: "9845998877",
      password: "ArtisanPassword123!",
      confirmPassword: "ArtisanPassword123!",
      role: "vendor",
      address: {
        country: "Nepal",
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj",
        ward: "8",
        street: "Mithila Marg",
        landmark: "Devi Temple",
      },
      businessName: "Sita Mithila Arts & Crafts",
      description: "Authentic handmade Mithila paintings on natural canvas and handmade paper.",
      category: "Mithila Art",
      businessAddressSameAsResidential: true,
    };
    const resVendReg = await api("/register", "POST", vendorPayload);
    assert(
      resVendReg.status === 201 &&
        resVendReg.data.user.role === "vendor" &&
        resVendReg.data.vendor?.verificationStatus === "pending",
      `Vendor registered with status: "${resVendReg.data?.vendor?.verificationStatus}" (Business: ${resVendReg.data?.vendor?.businessName})`,
    );
    const vendorToken = resVendReg.data.token;
    const vendorId = resVendReg.data.vendor.id;

    // Verify vendor login returns vendor details and pending status
    const resVendLogin = await api("/login", "POST", {
      email: "sita@test.lokart",
      password: "ArtisanPassword123!",
    });
    assert(
      resVendLogin.status === 200 &&
        resVendLogin.data.vendor?.verificationStatus === "pending" &&
        resVendLogin.data.vendor?.category === "Mithila Art",
      `Vendor login returns shop details with verificationStatus: "${resVendLogin.data?.vendor?.verificationStatus}"`,
    );

    // 6. Public Admin registration prevention
    console.log("\nScenario 6: Public Admin registration prevention");
    const resAdminAttempt = await api("/register", "POST", {
      name: "Hacker Admin",
      email: "hacker@test.lokart",
      phone: "9800000000",
      password: "Password123!",
      confirmPassword: "Password123!",
      role: "admin",
      address: {
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj",
        ward: "1",
        street: "Main St",
      },
    });
    assert(
      resAdminAttempt.status === 403 && resAdminAttempt.data.ok === false,
      `Public admin registration blocked with status 403: "${resAdminAttempt.data?.message}"`,
    );

    // 7. Protected route: GET /api/auth/me
    console.log("\nScenario 7: Protected route GET /api/auth/me");
    const resUnauthMe = await api("/me", "GET");
    assert(
      resUnauthMe.status === 401,
      `Unauthenticated /api/auth/me request rejected with status 401`,
    );

    const resAuthMeCust = await api("/me", "GET", null, customerToken);
    assert(
      resAuthMeCust.status === 200 && resAuthMeCust.data.user.email === "aarti@test.lokart",
      `Authenticated customer /api/auth/me verified user: ${resAuthMeCust.data.user.name}`,
    );

    const resAuthMeVend = await api("/me", "GET", null, vendorToken);
    assert(
      resAuthMeVend.status === 200 &&
        resAuthMeVend.data.vendor.businessName === "Sita Mithila Arts & Crafts",
      `Authenticated vendor /api/auth/me verified vendor shop: ${resAuthMeVend.data.vendor.businessName}`,
    );

    // 8. Profile update: PUT /api/auth/profile
    console.log("\nScenario 8: Customer Profile update & Password Change");
    const resUpdateProfile = await api(
      "/profile",
      "PUT",
      {
        name: "Aarti Sharma (Updated)",
        phone: "9845112299",
      },
      customerToken,
    );
    assert(
      resUpdateProfile.status === 200 &&
        resUpdateProfile.data.user.name === "Aarti Sharma (Updated)" &&
        resUpdateProfile.data.user.phone === "9845112299",
      `Profile updated successfully to: ${resUpdateProfile.data.user.name}`,
    );

    // Test password change rejection with wrong current password
    const resWrongCurPass = await api(
      "/password",
      "PUT",
      {
        currentPassword: "IncorrectCurrentPassword!",
        newPassword: "BrandNewPassword123!",
        confirmNewPassword: "BrandNewPassword123!",
      },
      customerToken,
    );
    assert(
      resWrongCurPass.status === 400 && resWrongCurPass.data.ok === false,
      `Rejected password change with wrong current password (status: 400)`,
    );

    // Test successful password change
    const resChangePass = await api(
      "/password",
      "PUT",
      {
        currentPassword: "SecureCustomer123!",
        newPassword: "BrandNewPassword123!",
        confirmNewPassword: "BrandNewPassword123!",
      },
      customerToken,
    );
    assert(
      resChangePass.status === 200 && resChangePass.data.ok === true,
      `Password changed successfully: "${resChangePass.data.message}"`,
    );

    // Verify login with new password
    const resLoginNewPass = await api("/login", "POST", {
      email: "aarti@test.lokart",
      password: "BrandNewPassword123!",
    });
    assert(
      resLoginNewPass.status === 200 && resLoginNewPass.data.ok === true,
      `Login successful using newly updated password`,
    );

    // 9. Unauthorized admin access prevention
    console.log("\nScenario 9: Unauthorized admin access prevention");
    const resCustAccessAdmin = await api("/admin/users", "GET", null, customerToken);
    assert(
      resCustAccessAdmin.status === 403,
      `Customer cannot access /api/auth/admin/users (status: 403 Forbidden)`,
    );

    const resVendAccessAdmin = await api("/admin/users", "GET", null, vendorToken);
    assert(
      resVendAccessAdmin.status === 403,
      `Vendor cannot access /api/auth/admin/users (status: 403 Forbidden)`,
    );

    // 10. Seed Admin Account and Admin Operations
    console.log("\nScenario 10: Secure Admin creation & Admin vendor approval");
    const adminUser = new User({
      name: "LokArt System Admin",
      email: "admin@test.lokart",
      phone: "9800000000",
      password: "AdminSuperSecret123!",
      role: "admin",
      address: {
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj Metropolitan City",
        ward: "10",
        street: "LokArt HQ",
      },
    });
    await adminUser.save();
    console.log("  ✓ Admin account created through protected process.");

    const resAdminLogin = await api("/login", "POST", {
      email: "admin@test.lokart",
      password: "AdminSuperSecret123!",
    });
    assert(
      resAdminLogin.status === 200 && resAdminLogin.data.user.role === "admin",
      `Admin login successful (role: ${resAdminLogin.data.user.role})`,
    );
    const adminToken = resAdminLogin.data.token;

    // Admin view registered users and vendor applications
    const resAdminUsers = await api("/admin/users", "GET", null, adminToken);
    assert(
      resAdminUsers.status === 200 &&
        resAdminUsers.data.counts.totalUsers >= 3 &&
        resAdminUsers.data.vendors.length >= 1,
      `Admin fetched registered users and vendor list (Total: ${resAdminUsers.data.counts.totalUsers}, Vendors: ${resAdminUsers.data.vendors.length})`,
    );

    // Admin approve vendor
    const resApprove = await api(
      `/admin/vendors/${vendorId}/status`,
      "PUT",
      { status: "approved" },
      adminToken,
    );
    assert(
      resApprove.status === 200 && resApprove.data.vendor.verificationStatus === "approved",
      `Admin successfully approved vendor application! Status is now: "${resApprove.data.vendor.verificationStatus}"`,
    );

    // Verify vendor's /me now reflects approved status
    const resVendAfterApproval = await api("/me", "GET", null, vendorToken);
    assert(
      resVendAfterApproval.data.vendor.verificationStatus === "approved",
      `Vendor session now reflects approved verificationStatus ("${resVendAfterApproval.data.vendor.verificationStatus}")`,
    );

    // 11. Logout test
    console.log("\nScenario 11: Logout endpoint");
    const resLogout = await api("/logout", "POST");
    assert(
      resLogout.status === 200 && resLogout.data.ok === true,
      `Logout response succeeded: "${resLogout.data.message}"`,
    );

    console.log(`\n==============================================`);
    console.log(`Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==============================================\n`);

    server.close();
    await mongoose.disconnect();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();

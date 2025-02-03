const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const bcrypt = require("bcrypt");
const axios = require('axios');

//Importing Middleware
const { generateToken, verifyToken } = require("../middlewares/auth");

//Importing Models
const User = require("../models/user");
const Role = require("../models/role");
const Partner = require('../models/partner');


// Importing Utils
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");


//Importing Controllers
const sharedController = require("./shared");

const constructUserDetails = (user, userRole, token) => {
  const userDetails = {
    id: user.id,
    email: user.email ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    addressline1: user.addressline1 ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    zipcode: user.zipcode ?? '',
    organisationName: user.organisationName ?? '',
    occupation: user.occupation ?? '',
    country: user.country ?? '',
    profileType: user.profileType ?? '',
    investmentExperience: user.investmentExperience ?? '',
    areaOfExpertise: user.areaOfExpertise ?? '',
    spouseName: user.spouseName ?? '',
    spouseEmail: user.spouseEmail ?? '',
    role: userRole ?? '',
    kycApproved: user.kycApproved ?? false
  };

  let userDetailsString = JSON.stringify(userDetails);
  const redirectURL = `${process.env.UI_DASHBOARD_URL}?token=${token}&userId=${user.id}&userDetails=${userDetailsString}&role=${userRole.name}&isAuthenticated=true`;
  return redirectURL;
};


exports.googleAuth = catchAsync(async (req, res) => {
  const profile = req.user;
  let roleName = "investor"
  let redirectURL;

  if (!profile.given_name || !profile.family_name || !profile.emails[0]?.value) {
    throw new AppError("Missing required fields from Google account. Please complete your account", 400);
  }

  if (!profile.email_verified) {
    throw new AppError("Please verify your google account.", 400);
  }

  let user = await User.findOne({
    where: { socialEmail: profile.emails[0].value }
  });

  const role = await Role.findOne({ where: { name: roleName, enable: true } });

  if (role) {
    let inputObj = {
      firstName: profile.given_name,
      lastName: profile.family_name,
      socialId: profile.id,
      socialToken: profile.accessToken ?? "",
      roleId: role.id,
      lastLoginDate: new Date()
    };

    if (user && !user.socialId && !user.socialToken) {
      user = await user.update(inputObj);
    } else if (!user) {
      inputObj["socialEmail"] = profile.emails[0].value;
      user = await User.create(inputObj);
    }

    let token = generateToken(user.id);
    if (!user.profileType) {
      redirectURL = `${process.env.UI_REGISTRATION_URL}?token=${token}&userId=${user.id}&firstName=${user.firstName}&lastName=${user.lastName}&socialEmail=${user.socialEmail}`;
    } else {
      redirectURL = constructUserDetails(user, role, token);
    }
  } else {
    redirectURL = `${process.env.UI_FAILURE_URL}`;
  }

  return res.writeHead(301, { Location: redirectURL }).end();
});

exports.azureAuth = catchAsync(async (req, res) => {
  const profile = req.user;
  let roleName = "investor"
  let redirectURL;

  if (!profile.givenName || !profile.surname || !profile.mail) {
    throw new AppError("Missing required fields from Microsoft account. Please complete your account", 400);
  }

  if (!profile.mail) {
    throw new AppError("Please verify your Microsoft account.", 400);
  }

  let user = await User.findOne({
    where: { socialEmail: profile.mail }
  });

  const role = await Role.findOne({ where: { name: roleName, enable: true } });

  if (role) {
    let inputObj = {
      firstName: profile.givenName,
      lastName: profile.surname,
      socialId: profile.id,
      socialToken: profile.accessToken ?? "",
      roleId: role.id,
      lastLoginDate: new Date()
    };

    if (user && !user.socialId && !user.socialToken) {
      user = await user.update(inputObj);
    } else if (!user) {
      inputObj["socialEmail"] = profile.mail;
      user = await User.create(inputObj);
    }

    let token = generateToken(user.id);
    if (!user.profileType) {
      redirectURL = `${process.env.UI_REGISTRATION_URL}?token=${token}&userId=${user.id}&firstName=${user.firstName}&lastName=${user.lastName}&socialEmail=${user.socialEmail}`;
    } else {

      redirectURL = constructUserDetails(user, role, token);

    }
  } else {
    redirectURL = `${process.env.UI_FAILURE_URL}`;
  }

  return res.writeHead(301, { Location: redirectURL }).end();
});

exports.auth = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new AppError("Please provide a valid email", 400);
  }

  if (!password) {
    throw new AppError("Please provide a valid password", 400);
  }

  // Check if the email already exists
  const existingUser = await User.findOne({ where: { email: email }, include: [{ model: Role, as: "role" }], });

  if (!existingUser || !existingUser.email || !existingUser.password) {
    throw new AppError("User details not found. Please register", 400);
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatch) {
    throw new AppError("Incorrect password", 400);
  }

  if (existingUser) {
    await existingUser.update({ lastLoginDate: new Date() })
  }
  const token = generateToken(existingUser.id);
  res.locals.token = token

  sharedController.response(res, existingUser, {}, "user successfully signed in")

});

exports.logout = catchAsync(async (req, res) => {
  const provider = req.session?.passport?.user?.provider;
  const accessToken = req.session?.passport?.user?.accessToken;
  let revokeUrl;

  if (provider === 'google') {
    revokeUrl = `https://oauth2.googleapis.com/revoke?token=${accessToken}`;
  }

  if (revokeUrl && accessToken) {
    await axios.default.post(revokeUrl);
  }

  await req.session.destroy();
  res.clearCookie('connect.sid');
  sharedController.response(res);
});

const signup = async (data) => {
  if (data.userId) {
    const updated = await User.update(data, { where: { id: data.userId }, returning: true });

    if (updated[1] > 0) {
      data = await User.findOne({ where: { id: data.userId }, include: [{ model: Role, as: "role" }], });
    }

  } else {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;
    const createUser = await User.create(data);
    if (createUser) {
      data = await User.findOne({ where: { id: createUser.id }, include: [{ model: Role, as: "role" }] });
    }
  }

  return Promise.resolve(data);
};

exports.userSignup = catchAsync(async (req, res) => {
  const id = req.body.id;
  let bearerToken = req.headers.authorization;
  let user, statusCode, message, verifyId, token, existingUser, userRole;
  const roleName = "investor"
  let userDetails = {};

  const json = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    addressline1: req.body.addressline1,
    city: req.body.city,
    state: req.body.state,
    zipcode: req.body.zipcode,
    organisationName: req.body.organisationName,
    occupation: req.body.occupation,
    country: req.body.country,
    profileType: req.body.profileType,
    investmentExperience: req.body.investmentExperience,
    areaOfExpertise: req.body.areaOfExpertise,
    spouseName: req.body.spouseName,
    spouseEmail: req.body.spouseEmail,
    institutionName: req.body.institutionName,
    accreditation: req.body.accreditation,
    referredBy: req.body.referredBy
  };

  await sharedController.validateRequestBody(json, ["spouseName", "spouseEmail", "institutionName", "accreditation", "referredBy"]);

  if (bearerToken) {
    bearerToken = bearerToken.replace(/^Bearer\s+/, "");

    verifyId = verifyToken(bearerToken);

    if (!verifyId) {
      throw new AppError("Unauthorized", 401);
    }
  }

  // Check if the email already exists
  if (id || verifyId) {
    existingUser = await User.findOne({
      where: { id: id ? id : verifyId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });
  }

  if (!existingUser?.roleId) {
    userRole = await Role.findOne({ where: { name: roleName, enable: true }, });
    if (!userRole) {
      throw new AppError("Role Not Found", 400)
    }
  }

  const data = {
    userId: existingUser?.id ?? "",
    email: json.email ?? existingUser?.email ?? "",
    firstName: json.firstName ?? existingUser?.firstName ?? "",
    lastName: json.lastName ?? existingUser?.lastName ?? "",
    phone: json.phone ?? existingUser?.phone ?? "",
    addressline1: json.addressline1 ?? existingUser?.addressline1 ?? "",
    city: json.city ?? existingUser?.city ?? "",
    state: json.state ?? existingUser?.state ?? "",
    zipcode: json.zipcode ?? existingUser?.zipcode ?? "",
    organisationName: json.organisationName ?? existingUser?.organisationName ?? "",
    occupation: json.occupation ?? existingUser?.occupation ?? "",
    roleId: userRole?.id ?? existingUser?.roleId ?? "",
    socialId: json.socialId ?? existingUser?.socialId ?? "",
    socialToken: json.socialToken ?? existingUser?.socialToken ?? "",
    country: json.country ?? existingUser?.country ?? "",
    profileType: json.profileType ?? existingUser?.profileType ?? "",
    investmentExperience: json.investmentExperience ?? existingUser?.investmentExperience ?? "",
    areaOfExpertise: json.areaOfExpertise ?? existingUser?.areaOfExpertise ?? "",
    spouseName: json.spouseName ?? existingUser?.spouseName ?? "",
    spouseEmail: json.spouseEmail ?? existingUser?.spouseEmail ?? "",
    institutionName: json.institutionName ?? existingUser?.institutionName ?? "",
    accreditation: json.accreditation,
    referredBy: json.referredBy
  };

  if (!existingUser?.password) {
    data['password'] = req.body.password
  }

  user = await signup(data);

  token = generateToken(user.id);
  res.locals.token = token;

  if (!existingUser) {
    statusCode = 201;
    userDetails = user
    message = "User registration successful";
  } else {
    statusCode = 200;
    userDetails = user
    delete userDetails.password;
    message = "User details successfully updated.";
  }

  sharedController.response(res, userDetails, {}, message, statusCode)
});


//GET Partner Details
exports.getPartnerDetails = catchAsync(async (req, res) => {

  const partner = await Partner.findOne({ active: true });

  sharedController.response(res, partner)

})
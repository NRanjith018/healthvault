const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'healthvault_secret_key_jwt_2026', {
    expiresIn: '7d'
  });
};

// Register Patient
const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, bloodGroup, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'patient'
    });

    const patient = await Patient.create({
      userId: user._id,
      name,
      email: user.email,
      phone: phone || '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || '',
      bloodGroup: bloodGroup || '',
      address: address || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register Doctor (Must be approved by Admin)
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, qualification, experience, hospitalClinic } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ success: false, message: 'Please provide all required doctor fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor'
    });

    const doctor = await Doctor.create({
      userId: user._id,
      name,
      email: user.email,
      phone: phone || '',
      specialization: specialization || 'General Physician',
      qualification: qualification || 'MBBS',
      experience: experience || '1 Year',
      hospitalClinic: hospitalClinic || 'City Hospital',
      approvalStatus: 'pending' // pending by default!
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account registered successfully! Your account is currently pending administrator verification.',
      pendingApproval: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Role specific checks
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
      if (profile && profile.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: `Your doctor account status is currently: ${profile.approvalStatus}. Please wait for admin approval.`
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;

    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  getMe
};

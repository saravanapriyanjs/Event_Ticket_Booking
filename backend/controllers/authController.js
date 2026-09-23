const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organizer = require('../models/Organizer');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

// USER REGISTER
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// USER LOGIN
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, 'user');

    res.json({
      message: 'User login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ORGANIZER REGISTER
const registerOrganizer = async (req, res, next) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ message: 'Name, email, password and organizationName are required.' });
    }

    const existingOrg = await Organizer.findOne({ email: email.toLowerCase() });
    if (existingOrg) {
      return res.status(409).json({ message: 'Organizer with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const organizer = await Organizer.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      organizationName,
      role: 'organizer',
    });

    const token = generateToken(organizer._id, 'organizer');

    res.status(201).json({
      message: 'Organizer registered successfully',
      token,
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        organizationName: organizer.organizationName,
        role: organizer.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ORGANIZER LOGIN
const loginOrganizer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const organizer = await Organizer.findOne({ email: email.toLowerCase() });
    if (!organizer) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(organizer._id, 'organizer');

    res.json({
      message: 'Organizer login successful',
      token,
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        organizationName: organizer.organizationName,
        role: organizer.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT LOGGED IN PROFILE
const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (role === 'organizer') {
      const organizer = await Organizer.findById(id).select('-password');
      if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
      return res.json({ profile: organizer });
    } else {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ profile: user });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerOrganizer,
  loginOrganizer,
  getMe,
};

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('./models');
const {
  clientOrigin, googleClientId, googleClientSecret, googleCallbackUrl,
  jwtSecret, jwtRefreshSecret, nodeEnv
} = require('./config');

const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: nodeEnv === 'production' };
const accessCookie = { ...cookieOptions, maxAge: 15 * 60 * 1000 };
const refreshCookie = { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 };

passport.use(new GoogleStrategy(
  { clientID: googleClientId, clientSecret: googleClientSecret, callbackURL: googleCallbackUrl },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const emailObj = profile.emails?.[0];
      if (!emailObj?.verified) return done(null, false, { message: 'Google account email is not verified.' });

      const email = emailObj.value.toLowerCase().trim();
      let user = await User.findOne({ email });

      if (user) {
        // Link googleId if the account existed before OAuth migration
        if (!user.googleId) { user.googleId = profile.id; await user.save(); }
      } else {
        user = await User.create({
          email,
          googleId: profile.id,
          name: profile.displayName || '',
          profilePicture: profile.photos?.[0]?.value || ''
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Passport requires serialize/deserialize even when not using sessions
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (err) { done(err); }
});

function issueTokens(user) {
  const accessToken = jwt.sign({ id: user._id.toString(), email: user.email }, jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id.toString() }, jwtRefreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

async function setTokens(res, user) {
  const tokens = issueTokens(user);
  // Store a SHA-256 hash of the refresh token — no bcrypt needed without passwords
  user.refreshTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
  await user.save();
  res.cookie('accessToken', tokens.accessToken, accessCookie);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookie);
  return tokens;
}

function googleCallback(req, res) {
  // req.user is set by passport.authenticate in app.js
  setTokens(res, req.user).then(() => {
    res.redirect(`${clientOrigin}/chat`);
  }).catch(() => {
    res.redirect(`${clientOrigin}/login?error=auth_failed`);
  });
}

async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Please sign in again.' });
  try {
    const payload = jwt.verify(token, jwtRefreshSecret);
    const user = await User.findById(payload.id);
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    if (!user || user.refreshTokenHash !== hash) throw new Error('invalid');
    await setTokens(res, user);
    res.json({ user: { id: user._id, email: user.email, name: user.name, profilePicture: user.profilePicture } });
  } catch {
    res.status(401).json({ message: 'Please sign in again.' });
  }
}

function logout(req, res) {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ message: 'Signed out.' });
}

module.exports = { passport, googleCallback, refresh, logout };

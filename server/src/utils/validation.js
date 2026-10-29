const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return 'Invalid email format';
  }
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least 1 number';
  }
  return null;
}

module.exports = { validateEmail, validatePassword };

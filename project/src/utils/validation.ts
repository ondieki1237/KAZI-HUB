export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters long and contain at least one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone number validation for Kenya numbers
  const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50;
};

export const validateUsername = (username: string): boolean => {
  // Username must be 3-20 characters and can contain letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateForm = (data: Record<string, any>): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(data).forEach(([field, value]) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.push({
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      });
      return;
    }

    switch (field) {
      case 'email':
        if (!validateEmail(value)) {
          errors.push({
            field,
            message: 'Please enter a valid email address',
          });
        }
        break;
      case 'password':
        if (!validatePassword(value)) {
          errors.push({
            field,
            message: 'Password must be at least 8 characters long and contain at least one number',
          });
        }
        break;
      case 'phone':
      case 'phoneNumber':
        if (!validatePhone(value)) {
          errors.push({
            field,
            message: 'Please enter a valid phone number',
          });
        }
        break;
      case 'name':
        if (!validateName(value)) {
          errors.push({
            field,
            message: 'Name must be between 2 and 50 characters',
          });
        }
        break;
      case 'username':
        if (!validateUsername(value)) {
          errors.push({
            field,
            message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores',
          });
        }
        break;
    }
  });

  return errors;
}; 
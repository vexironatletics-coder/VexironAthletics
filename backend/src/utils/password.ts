import { MIN_PASSWORD_LENGTH } from './constants';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const PASSWORD_REQUIREMENTS_MSG = `Password must be at least ${MIN_PASSWORD_LENGTH} characters and include at least one letter and one number`;

export const isStrongPassword = (password: string): boolean =>
  password.length >= MIN_PASSWORD_LENGTH && PASSWORD_PATTERN.test(password);

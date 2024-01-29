import * as bcrypt from "bcrypt";

export async function encryptPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

export async function comparePassword(
  inputPassword: string,
  userPassword: string
) {
  const result = await bcrypt.compare(inputPassword, userPassword);

  return result;
}

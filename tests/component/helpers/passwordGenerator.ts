import { faker } from "@faker-js/faker";

function generatePassword() {
  const length = Math.floor(Math.random() * (30 - 8 + 1)) + 8;

  let password =
    faker.string.alpha({ length: 1, casing: "lower" }) +
    faker.string.alpha({ length: 1, casing: "upper" }) +
    faker.string.numeric(1);

  const remainingLength = length - 3;
  password += faker.internet.password({
    length: remainingLength,
    memorable: false,
  });

  return faker.helpers.shuffle(password.split("")).join("");
}

export = generatePassword;

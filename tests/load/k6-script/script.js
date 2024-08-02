import http from "k6/http";
import { check, sleep } from "k6";
import ws from "k6/ws";
import { SharedArray } from "k6/data";
import { client } from "./client";

const users = new SharedArray("users data", function () {
  const fileContent = open("./auth-data.json");
  const parsedData = JSON.parse(fileContent);
  return parsedData.user;
});

const employees = new SharedArray("employees data", function () {
  const fileContent = open("./auth-data.json");
  const parsedData = JSON.parse(fileContent);
  return parsedData.employee;
});

export const options = {
  vus: 30,
  duration: "5m",
};

function pause() {
  sleep(Math.random() * 2);
}

function requestHelper(path, body, method, token) {
  let headers;
  if (token) headers = generateHeaders(token);
  else headers = generateHeaders();

  let payload = JSON.stringify(body);
  let response;

  if (method === "GET")
    response = http.get(`http://localhost:3001/api${path}`, {
      headers: headers,
    });

  if (method === "POST")
    response = http.post(`http://localhost:3001/api${path}`, payload, {
      headers: headers,
    });

  check(response, {
    tapFlow: (r) => r.status === 200,
  });

  pause();

  return JSON.parse(response.body);
}

function generateHeaders(token) {
  let headers;
  if (token)
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  else
    headers = {
      "Content-Type": "application/json",
    };

  return headers;
}

export default function () {
  //LOGIN
  const userIndex = Math.floor(Math.random() * users.length);
  const user = requestHelper(
    "/auth/login",
    {
      email: users[userIndex].email,
      password: users[userIndex].password,
    },
    "POST",
    null
  );
  const userToken = user.data.auth.accessToken;
  //GET RESTAURANTS
  let restaurants = requestHelper(
    "/restaurants?page=1&limit=20&time=10:00&dayNoOfTheWeek=7",
    {},
    "GET",
    userToken
  );
  const restaurantIndex = Math.floor(
    Math.random() * restaurants.data.restaurants.length
  );
  const restaurant = restaurants.data.restaurants[restaurantIndex];

  //IF ISNT OWNED, GET ONE
  if (!restaurant.isOwned) {
    const userCard = requestHelper(
      "/userCards/buy",
      {
        userId: user.data.user.id,
        cardId: restaurant.cardId,
      },
      "POST",
      userToken
    );
  }

  //Employee Login
  const scanner = employees.find(
    (employee) => employee.restaurantId === restaurant.id
  );
  const employee = requestHelper(
    "/employees/login",
    {
      email: scanner.email,
      password: scanner.password,
    },
    "POST",
    null
  );
  const employeeToken = employee.data.auth.accessToken;
  let generateRes = requestHelper("/taps/generate", {}, "POST", userToken);
  let redeemRes = requestHelper(
    "/taps/redeem",
    { encryptedData: generateRes.data.encryptedData },
    "POST",
    employeeToken
  );
}

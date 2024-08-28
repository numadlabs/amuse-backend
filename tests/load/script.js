import http from "k6/http";
import { check, sleep } from "k6";
import ws from "k6/ws";
import { SharedArray } from "k6/data";

const URL = "https://amuse-backend-staging-478fc2297634.herokuapp.com";
const SOCKETURL = `ws://amuse-backend-staging-478fc2297634.herokuapp.com/socket.io/?EIO=4&transport=websocket`;

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
  vus: 15,
  duration: "1m",
};

function pause() {
  sleep(Math.random() * 1.5 + 0.5);
}

function requestHelper(path, body, method, token) {
  let headers;
  if (token) headers = generateHeaders(token);
  else headers = generateHeaders();

  let payload = JSON.stringify(body);
  let response;

  if (method === "GET")
    response = http.get(`${URL}/api${path}`, {
      headers: headers,
    });

  if (method === "POST")
    response = http.post(`${URL}/api${path}`, payload, {
      headers: headers,
    });

  if (response.status !== 200) {
    console.log(payload, response.body);
  }

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

function generateEmail() {
  const uniqueId = `user${__VU}${__ITER}${Date.now()}`;
  return `${uniqueId}@gmail.com`;
}

export default function () {
  //REGISTER
  //const email = generateEmail();
  // const user = requestHelper(
  //   "/auth/register",
  //   {
  //     email: "gombochir.dev@gmail.com",
  //     password: "Password12",
  //     verificationCode: 1234,
  //     nickname: "Load Tester",
  //   },
  //   "POST",
  //   null
  // );
  // check(user, () => {
  //   user.data.auth.accessToken !== null;
  // });
  // const userToken = user.data.auth.accessToken;

  const host = http.get(`${URL}`, {
    "Content-Type": "application/json",
  });
  console.log(`1 user: ${__VU} iter: ${__ITER} host: ${host.body}`);

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
    "/restaurants?page=1&limit=20&time=10:00:00&dayNoOfTheWeek=7",
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
      `/userCards/${restaurant.cardId}/buy`,
      {},
      "POST",
      userToken
    );
  }
  // if (restaurantIndex < Math.floor(restaurants.data.restaurants.length / 2)) {
  //   const userBonuses = requestHelper(
  //     `/bonus/${restaurant.id}/restaurant?type=REDEEMABLE`,
  //     {},
  //     "GET",
  //     userToken
  //   );
  //   const bonusIndex = Math.floor(Math.random() * userBonuses.data.length);
  //   const bought = requestHelper(
  //     `/userBonus/${userBonuses.data[bonusIndex].id}/buy`,
  //     {},
  //     "POST",
  //     userToken
  //   );
  //   console.log(`Bought bonus: ${bought.data}`);
  // }
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

  const host1 = http.get(`${URL}`, {
    "Content-Type": "application/json",
  });
  console.log(`2 user: ${__VU} iter: ${__ITER} host: ${host1.body}`);

  // START OF WEBSOCKET
  let RECEIVED_TAP_RESPONSE = false;
  let ISDONE = false;
  var res = ws.connect(SOCKETURL, null, function (socket) {
    socket.on("open", function open() {});
    socket.on("message", function (message) {
      // console.log(`Message received: ${message}`);
      if (message === "40") {
        socket.send("40");
      }
      if (message[0] === "0") {
        socket.send("40");
      }
      if (message.startsWith("40") && message.length > 2) {
        socket.send(`42["register", "${user.data.user.id}"]`);
        const employeeToken = employee.data.auth.accessToken;
        let generateRes = requestHelper(
          "/taps/generate",
          {},
          "POST",
          userToken
        );
        let redeemRes = requestHelper(
          "/taps/redeem",
          { encryptedData: generateRes.data.encryptedData },
          "POST",
          employeeToken
        );
        setTimeout(() => {
          ISDONE = true;
        }, 2500);
      }
      if (message.startsWith("42")) {
        const data = JSON.parse(message.slice(2));
        const event = data[0];
        const payload = data[1];
        if (event === "tap-scan") {
          RECEIVED_TAP_RESPONSE = true;
          // console.log(event, payload);
        }
      }
    });
    socket.on("error", function (e) {
      console.error("Socket error:", e);
    });
    socket.setInterval(function () {
      if (ISDONE || RECEIVED_TAP_RESPONSE) {
        // console.log(RECEIVED_TAP_RESPONSE);
        check(RECEIVED_TAP_RESPONSE, {
          "CHECK-IN FLOW (INCLUDING THE SOCKET)": (result) => result == true,
        });
        socket.close();
      }
    }, 100);
  });
}

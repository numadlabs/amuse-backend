const fs = require("fs");

const users = JSON.parse(fs.readFileSync("./auth-data.json")).user;
const employees = JSON.parse(fs.readFileSync("./auth-data.json")).employee;

module.exports = {
  login: async function (context, events, done) {
    const userIndex = Math.floor(Math.random() * users.length);
    const user = await context.http.post("/auth/login", {
      json: {
        email: users[userIndex].email,
        password: users[userIndex].password,
      },
    });

    context.userToken = user.body.auth.accessToken;
    context.userId = user.body.user.id; // Store user ID for use in Socket.IO
    done();
  },

  getRestaurants: async function (context, events, done) {
    const response = await context.http.get(
      "/restaurants?page=1&limit=20&time=10:00&dayNoOfTheWeek=7",
      {
        headers: {
          Authorization: `Bearer ${context.userToken}`,
        },
      }
    );

    context.restaurants = response.body.restaurants;
    done();
  },

  conditionalUserCard: async function (context, events, done) {
    const restaurantIndex = Math.floor(
      Math.random() * context.restaurants.length
    );
    const restaurant = context.restaurants[restaurantIndex];

    if (!restaurant.isOwned) {
      await context.http.post("/userCards/buy", {
        json: {
          userId: context.userId,
          cardId: restaurant.cardId,
        },
        headers: {
          Authorization: `Bearer ${context.userToken}`,
        },
      });
    }
    done();
  },

  registerSocket: async function (context, events, done) {
    await context.socketio.emit("register", { userId: context.userId });
    done();
  },

  listenTapScan: async function (context, events, done) {
    const timeout = 10000; // Timeout duration in milliseconds
    let tapScanReceived = false;

    context.socketio.on("tap-scan", function (data) {
      context.tapScanData = data; // Store tap-scan data
      tapScanReceived = true;
    });

    // Wait for tap-scan event or timeout
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (tapScanReceived) {
        return done(); // Event received, proceed
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // Polling interval
    }

    // If timeout is reached and event is not received, mark test as failed
    return done(
      new Error("tap-scan event was not emitted within the timeout period.")
    );
  },

  loginEmployee: async function (context, events, done) {
    const employeeIndex = Math.floor(Math.random() * employees.length);
    const employee = await context.http.post("/employees/login", {
      json: {
        email: employees[employeeIndex].email,
        password: employees[employeeIndex].password,
      },
    });

    context.employeeToken = employee.body.auth.accessToken;
    done();
  },

  generateTap: async function (context, events, done) {
    await context.http.post(
      "/api/taps/generate",
      {},
      {
        headers: {
          Authorization: `Bearer ${context.userToken}`,
        },
      }
    );
    done();
  },

  redeemTap: async function (context, events, done) {
    await context.http.post(
      "/api/taps/redeem",
      {},
      {
        headers: {
          Authorization: `Bearer ${context.employeeToken}`,
        },
      }
    );
    done();
  },
};

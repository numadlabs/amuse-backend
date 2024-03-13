"use strict";
require("dotenv").config();
const port = process.env.PORT || 3001;
const server = require("./app");
server.listen(port, () => {
  console.log(`Server has started on port: ${port}`);
});

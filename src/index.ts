import { config } from "./config/config";
const { server } = require("./app");

server.listen(config.PORT, () => {
  console.log(`Server has started on port: ${config.PORT}`);
});

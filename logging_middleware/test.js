const Log = require("./logger");

async function run() {
  const result = await Log(
    "backend",
    "info",
    "service",
    "logging middleware initialized"
  );

  console.log(result);
}

run();
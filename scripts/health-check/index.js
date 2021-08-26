const { checkHealth } = require("./healthcheck");

const TIMEOUT = 10_000;

defaultLogger = (message, objectStatus) => {
  if (!process.env.STRESS_TEST) {
    console.log(message, objectStatus);
  }
};

async function run(uri) {
  if (!process.env.STRESS_TEST) {
    console.log("Using bridge:", uri);
  }
  const result = await checkHealth(TIMEOUT, defaultLogger, uri);
  if (result.alive) {
    return `${uri} is alive, check took, ${result.durationSeconds} seconds`;
  }
  if (result.error) {
    result.error.toString();
    const msg = result.error.message;
    return `⚠️ ⚠️ ${uri}: ${msg}⚠️ ⚠️ `;
  }
}

tasks = [];
for (let i = 0; i < 1; i++) {
  let uri;
  try {
    uri = process.argv.slice(2)[0];
  } catch {}

  if (uri != undefined) {
    tasks.push(run(uri));
  } else {
    const alpha = Array.from(Array(26)).map((e, i) => i + 97);
    alphabet = alpha.map(x => String.fromCharCode(x));
    alphabet.push(...["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    alphabet.push(
      ...[
        "uniswap",
        "ethermine",
        "enzyme",
        "pancakeswap",
        "smoothy",
        "fei",
        "polygon",
        "veefriends",
        "pooltogether",
        "opensea",
        "mirror",
        "paraswap",
        "aave",
        "synthetix",
        "etherscan",
        "zora",
        "zerion",
        "foundation",
        "asyncart",
        "dydx",
        "defisaver",
        "radicle",
        "rarible",
        "shiba",
      ],
    );

    alphabet.forEach(url => {
      tasks.push(run(`https://${url}.bridge.walletconnect.org`));
    });
    tasks.push(run(`https://bridge.walletconnect.org`));
  }
}

Promise.all(tasks).then(allResults => {
  console.log(allResults);
  process.exit(0);
});

const { checkHealth } = require("./healthcheck");

const TIMEOUT = 10000;

function calculateAverage(previousAverage, newValue, newTotal) {
  const newAverage = previousAverage * ((newTotal - 1) / newTotal) + newValue * (1 / newTotal);
  return Number(newAverage).toFixed(3);
}

const analysis = {
  total: 0,
  timeoutted: 0,
  average: 0,
};

function addToAnalysis(params) {
  analysis.total += 1;
  if (params.timeoutted) {
    analysis.timeoutted += 1;
  } else if (params.elapsed) {
    analysis.average = calculateAverage(
      analysis.average,
      params.elapsed,
      analysis.total - analysis.timeoutted,
    );
  }
}

function defaultLogger(message, objectStatus) {
  if (!process.env.STRESS_TEST) {
    console.log(message, objectStatus); // eslint-disable-line no-console
  }
}

async function run(uri) {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
  if (!process.env.STRESS_TEST) {
    console.log("Using bridge:", uri); // eslint-disable-line no-console
  }
  const result = await checkHealth(TIMEOUT, defaultLogger, uri);
  if (result.alive) {
    addToAnalysis({ elapsed: result.durationSeconds });
    return `${uri} is alive, check took, ${result.durationSeconds} seconds`;
  }
  if (result.error) {
    addToAnalysis({ timeoutted: true });
    result.error.toString();
    const msg = result.error.message;
    return `⚠️ ⚠️ ${uri}: ${msg} ⚠️ ⚠️`;
  }
}

const promises = [];
for (let i = 0; i < 1; i++) {
  let uri;
  try {
    uri = process.argv.slice(2)[0];
  } catch {
    // ignore error
  }

  if (uri != undefined) {
    promises.push(run(uri));
  } else {
    const alphabet = Array.from(Array(26)).map((e, i) => i + 97);
    const subdomains = alphabet.map(x => String.fromCharCode(x));
    subdomains.push(...["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    subdomains.push(
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

    subdomains.forEach(url => {
      promises.push(run(`https://${url}.bridge.walletconnect.org`));
    });
    promises.push(run(`https://bridge.walletconnect.org`));
  }
}

Promise.all(promises).then(results => {
  // eslint-disable-next-line no-console
  console.log(results);
  // eslint-disable-next-line no-console
  console.log(
    `Tested ${analysis.total} servers where ${analysis.timeoutted} timeoutted and ${analysis.total -
      analysis.timeoutted} succeeded with an average elapsed time of ${analysis.average} seconds`,
  );
  process.exit(0);
});

const { sleep } = require('./util');
const { CID } = require('multiformats/cid');
const IPFS = require('./ipfs-wrapper');

async function main() {
  const [peerMultiaddrStr, cidToGet] = process.argv.slice(2);

  // Create the node, connecting to the provided peer address
  const ipfsNode = await IPFS.create(peerMultiaddrStr);

  // Get the content and ask for 
  for await (const buf of ipfsNode.get(cidToGet)) {
    console.log('_processTasks:: Get Buffer', buf.toString());
  }

  const stop = async () => {
    await ipfsNode.stop();
    console.log("stopped");
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  await sleep(3000);
}

main();
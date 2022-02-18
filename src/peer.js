const { sleep } = require("./util");
const IPFS = require("ipfs-core");
const { Multiaddr } = require("multiaddr");

const IPFS_REPO = process.env.IPFS_REPO || `./tmp/peer-${Date.now()}`;

async function main() {
  const [peerMultiaddrStr, cidToGet] = process.argv.slice(2);

  // Create the node, connecting to the provided peer address
  const ipfsNode = await IPFS.create({
    repo: IPFS_REPO,
    config: {
      Addresses: {
        Swarm: [`/ip4/0.0.0.0/tcp/0`, `/ip4/127.0.0.1/tcp/0/ws`],
        API: `/ip4/127.0.0.1/tcp/0`,
        Gateway: `/ip4/127.0.0.1/tcp/0`,
        RPC: `/ip4/127.0.0.1/tcp/0`,
      },
      Bootstrap: [],
    },
  });

  // Setup exist
  const stop = async () => {
    await ipfsNode.stop();
    console.log("stopped");
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  // Connect immediately to our test node to get rid of other unknowns
  const ma = new Multiaddr(peerMultiaddrStr);
  ipfsNode.libp2p.ping(ma);

  // Get the content
  console.log("---- trying to load:", cidToGet, '----');
  let wasComplete = false;

  // Fake timeout / "access denied"
  setTimeout(() => {
    // The node will hang waiting, probably because the peer said "HAVE content", but doesn't send it.
    if (wasComplete) {
      return;
    }
    console.log("---- could not retrieve file, giving up... ----");
    stop();
    process.exit(0);
  }, 5000);

  // Dump the data.
  let isFirst = true;
  for await (const buf of ipfsNode.get(cidToGet)) {
    if (isFirst) {
      console.log('---- Here is the file! ---- ')
      isFirst = false;
    }
    console.log('>>>', buf.toString());
  }

  wasComplete = true;
  console.log("---- Load complete! ----");
  stop();
}

main();

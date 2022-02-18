const { createLibp2p } = require("./libp2p");
const { Multiaddr } = require('multiaddr');
const IPFS = require('ipfs-core');

global.MAGIC_HANDLER_FUNCTIONS = new Map();

/**
 * Creates an IPFS node
 * @param {multiaddr} peerMultiaddrStr the address to dial
 * @param {*} options IPFS create options
 * @returns an IPFS node
 */
async function create(peerMultiaddrStr, options = {}) {
  const libp2p = await createLibp2p();

  const libp2pFactory = () => {
    return Promise.resolve(libp2p);
  };

  libp2p.connectionManager.on("peer:disconnect", async (connection) => {
    console.log("Disconnected from %s", connection.remotePeer.toB58String());
  });

  libp2p.connectionManager.on("peer:connect", async (connection) => {
    console.log("Connected to %s", connection.remotePeer.toB58String()); // Log connected peer
  });

  await libp2p.start();
  console.log("libp2p has started");

  // ping peer if received peer multiaddr
  if (peerMultiaddrStr !== undefined) {
    const ma = new Multiaddr(peerMultiaddrStr);
    console.log(`pinging remote peer at ${peerMultiaddrStr}`);
    const latency = await libp2p.ping(ma);
    console.log(`pinged ${peerMultiaddrStr} in ${latency}ms`);
  } else {
    console.log("no remote peer address given, skipping ping");
  }

  // print out listening addresses
  console.log("listening on addresses:");
  libp2p.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${libp2p.peerId.toB58String()}`);
  });

  let ipfsNode = await IPFS.create({
    libp2p: libp2pFactory,
    repo: `./tmp/ipfs_node_repo_${Date.now()}`,
    ...options
  });
  ipfsNode.bitswap.register = (eventName, handler) => {
    console.log(`registering ${eventName} handler`);
    global.MAGIC_HANDLER_FUNCTIONS.set(eventName, handler);
  };

  return ipfsNode;
}

module.exports = {
  create
}
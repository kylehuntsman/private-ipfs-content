const { createLibp2p } = require("./libp2p");
const { sleep } = require('./util');

const { Multiaddr } = require('multiaddr');
const pipe = require('it-pipe');
const IPFS = require('ipfs-core')

async function main() {
  const args = process.argv.slice(2);

  const libp2p = await createLibp2p();
  const libp2pFactory = () => {
    return Promise.resolve(libp2p);
  };
  const [nodeNum, protocol, addr] = args;

  if(args.length >= 2) {
    console.log(`adding protocol ${protocol}`);

    libp2p.handle(`${protocol}`, ({ stream }) => {
      pipe(stream, (source) =>
        (async function () {
          for await (const msg of source) {
            console.log("message for protocol:", protocol, msg.toString());
          }
        })()
      );
    });
  } else {
    console.log("no custom protocol given, skipping.");
  }

  libp2p.on("peer:discovery", (peer) => {
    // console.log("Discovered %s", peer.id.toB58String()); // Log discovered peer
    // console.log(peer, peer.id);
  });

  libp2p.connectionManager.on("peer:connect", async (connection) => {
    console.log("Connected to %s", connection.remotePeer.toB58String()); // Log connected peer
    // console.log(connection);
    // console.log("protocol:", protocol);
    // console.log("remote addr:", connection.remoteAddr);
    // console.log("remote peer:", connection.remotePeer);

    if (addr === undefined) {
      console.log("no address given, skipping");
      return;
    }

    try {
      const { stream } = await libp2p.dialProtocol(
        connection.remotePeer,
        protocol
      );
      // const { stream } = await node.dialProtocol(connection.remoteAddr, protocol);
      await pipe(["helloworld from custom protocol", stream]);
      console.log(
        "nice, it worked",
        connection.remotePeer.toB58String(),
        "supports our protocol"
      );
    } catch (err) {
      if (err.code === "ERR_UNSUPPORTED_PROTOCOL") {
        console.error("OK not supported, close this connection");
        await connection.close();
      } else {
        console.error(err);
      }
    }
  });

  await libp2p.start();
  console.log("libp2p has started");

  // ping peer if received multiaddr
  if (args.length >= 3) {
    if (addr !== undefined) {
      const ma = new Multiaddr(addr);
      console.log(`pinging remote peer at ${addr}`);
      const latency = await libp2p.ping(ma);
      console.log(`pinged ${addr} in ${latency}ms`);
    }
  } else {
    console.log("no remote peer address given, skipping ping");
  }

  // print out listening addresses
  console.log("listening on addresses:");
  libp2p.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${libp2p.peerId.toB58String()}`);
  });

  const ipfsNode = await IPFS.create({
    libp2p: libp2pFactory,
    repo: `ipfs_node_${nodeNum}_repo`
  });

  // Lets log out the number of peers we have every 2 seconds
  setInterval(async () => {
    try {
      const peers = await ipfsNode.swarm.peers();
      console.log(`The node now has ${peers.length} peers.`);
      console.log(peers)
    } catch (err) {
      console.log("An error occurred trying to check our peers:", err);
    }
  }, 2000);

  // Log out the bandwidth stats every 4 seconds so we can see how our configuration is doing
  setInterval(async () => {
    try {
      const stats = await ipfsNode.stats.bw();
      console.log(`\nBandwidth Stats: ${JSON.stringify(stats, null, 2)}\n`);
    } catch (err) {
      console.log("An error occurred trying to check our stats:", err);
    }
  }, 4000);

  const stop = async () => {
    await ipfsNode.stop();
    await libp2p.stop();
    console.log("stopped");
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  await sleep(3000);
  console.log('Connections:', libp2p.connections);
}

main();
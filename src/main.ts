import Libp2p from "libp2p";
import TCP from "libp2p-tcp";
import { NOISE } from "libp2p-noise";
// import { default as MPlex, Mplex } from 'libp2p-mplex'
const MPLEX = require("libp2p-mplex");
import Bootstrap from "libp2p-bootstrap";
import { multiaddr } from "multiaddr";
import process from "process";

// Known peers addresses
const bootstrapMultiaddrs = [
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const node = await Libp2p.create({
    addresses: {
      // add a listen address (localhost) to accept TCP connections on a random port
      listen: ["/ip4/127.0.0.1/tcp/0"],
    },
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
      peerDiscovery: [Bootstrap],
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        [Bootstrap.tag]: {
          enabled: true,
          list: bootstrapMultiaddrs,
        },
      },
    },
  });

  await node.start();
  console.log("libp2p has started");

  // print out listening addresses
  console.log("listening on addresses:");
  node.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`);
  });

  // ping peer if received multiaddr
  if (process.argv.length >= 3) {
    const ma = multiaddr(process.argv[2]);
    console.log(`pinging remote peer at ${process.argv[2]}`);
    const latency = await node.ping(ma);
    console.log(`pinged ${process.argv[2]} in ${latency}ms`);
  } else {
    console.log("no remote peer address given, skipping ping");
  }

  node.on("peer:discovery", (peer) => {
    console.log("Discovered %s", peer.id.toB58String()); // Log discovered peer
  });

  node.connectionManager.on("peer:connect", (connection) => {
    console.log("Connected to %s", connection.remotePeer.toB58String()); // Log connected peer
  });

//   await sleep(100000);

//   // stop libp2p
//   await node.stop();
//   console.log("libp2p has stopped");

  const stop = async () => {
    // stop libp2p
    await node.stop();
    console.log("libp2p has stopped");
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
};

main();

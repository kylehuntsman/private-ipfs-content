import Libp2p from "libp2p";
import TCP from "libp2p-tcp";
import { NOISE } from "libp2p-noise";
// import { default as MPlex, Mplex } from 'libp2p-mplex'
const MPLEX = require("libp2p-mplex");
import Bootstrap from "libp2p-bootstrap";
import { multiaddr } from "multiaddr";
import process from "process";
import pipe from "it-pipe";
import { Connection } from "libp2p/src/connection-manager";
// import {map} from 'streaming-iterables';
// import {toBuffer} from 'it-buffer';
// import IPFS from "ipfs-core";
const IPFS = require('ipfs-core')

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

  const libp2pFactory = () => {
    return Promise.resolve(node);
  };

  const addr = process.argv[2] || "null";

  const protocol = process.argv[3] || "none";

  if (process.argv.length >= 4) {
    console.log(`adding protocol ${protocol}`);

    node.handle(`${protocol}`, ({ stream }) => {
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

  node.on("peer:discovery", (peer) => {
    // console.log("Discovered %s", peer.id.toB58String()); // Log discovered peer
    // console.log(peer, peer.id);
  });

  node.connectionManager.on("peer:connect", async (connection: Connection) => {
    console.log("Connected to %s", connection.remotePeer.toB58String()); // Log connected peer
    // console.log(connection);
    // console.log("protocol:", protocol);
    // console.log("remote addr:", connection.remoteAddr);
    // console.log("remote peer:", connection.remotePeer);

    if (addr === "null") {
      console.log("skip");
      return;
    }

    try {
      const { stream } = await node.dialProtocol(
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
      // @ts-ignore
      if (err.code === "ERR_UNSUPPORTED_PROTOCOL") {
        console.error("OK not supported, close this connection");
        await connection.close();
      } else {
        console.error(err);
      }
    }

    // connection.addStream(stream, {protocol})
    // const {stream} = await node.dialProtocol(connection.remotePeer, [protocol])
    // await pipe(
    //     ['another stream on protocol (b)'],
    //     stream3
    //   )

    //   connection.addStream(stream, {protocol})

    // Do one thing right now, allow a connection IFF you speak my protocol.
  });

  await node.start();
  console.log("libp2p has started");

  // ping peer if received multiaddr
  if (process.argv.length >= 3) {
    if (addr !== "null") {
      const ma = multiaddr(process.argv[2]);
      console.log(`pinging remote peer at ${process.argv[2]}`);
      const latency = await node.ping(ma);
      console.log(`pinged ${process.argv[2]} in ${latency}ms`);
    }
  } else {
    console.log("no remote peer address given, skipping ping");
  }

  // print out listening addresses
  console.log("listening on addresses:");
  node.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`);
  });


  //   await sleep(100000);

  //   // stop libp2p
  //   await node.stop();
  //   console.log("libp2p has stopped");

  const ipfsNode = await IPFS.create({
    libp2p: libp2pFactory,
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
    await node.stop();
    console.log("stopped");
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  await sleep(3000);
  console.log(node.connections);
};

main();

const Libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const { NOISE } = require("libp2p-noise");
const MPLEX = require("libp2p-mplex");
const Bootstrap = require("libp2p-bootstrap");

// Known peers addresses
const BOOTSTRAP_MULTIADDRS = [
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
];

const USE_BOOTSTRAP = process.env.USE_BOOTSTRAP === "true";

function createLibp2p() {
  return Libp2p.create({
    addresses: {
      // add a listen address (localhost) to accept TCP connections on a random port
      listen: ["/ip4/127.0.0.1/tcp/0"],
    },
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
      peerDiscovery: USE_BOOTSTRAP ? [Bootstrap] : [],
    },
    ...(USE_BOOTSTRAP
      ? {
          config: {
            peerDiscovery: {
              autoDial: true,
              [Bootstrap.tag]: {
                enabled: true,
                list: BOOTSTRAP_MULTIADDRS,
              },
            },
          },
        }
      : {}),
  });
}

module.exports = {
  createLibp2p,
};

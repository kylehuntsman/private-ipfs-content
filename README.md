# Private/Whitelisted Content on IPFS

## Running

Run the following command to run node 1, ensuring you copy the listening peer address it logs
```
$ npm run node1

adding protocol /custom-protocol
libp2p has started
no remote peer address given, skipping ping
listening on addresses:
/ip4/127.0.0.1/tcp/46659/p2p/QmUAwQjypBgXe9C16jN6na7ss6sp9Q7GVPoiHCUM6SSyzW <-- Copy this address
Swarm listening on /ip4/127.0.0.1/tcp/46659/p2p/12D3KooWBZR2WgrQdHUjU2tYGgpHUG3bpywxTkGTBEezeV4iaSqS
Swarm listening on /ip4/127.0.0.1/tcp/44829/p2p/12D3KooWBZR2WgrQdHUjU2tYGgpHUG3bpywxTkGTBEezeV4iaSqS
```

Then run the following command, using the copied peer address, to run node 2
```
$ npm run node2 <node-1-peer-address>

adding protocol /custom-protocol
libp2p has started
pinging remote peer at /ip4/127.0.0.1/tcp/39139/p2p/QmRxCYAzH31Z2GDp82MHwwqNeheM9oX9n3EvhjBUhYcbRh
Connected to QmRxCYAzH31Z2GDp82MHwwqNeheM9oX9n3EvhjBUhYcbRh
Connected to QmRxCYAzH31Z2GDp82MHwwqNeheM9oX9n3EvhjBUhYcbRh
nice, it worked QmRxCYAzH31Z2GDp82MHwwqNeheM9oX9n3EvhjBUhYcbRh supports our protocol
nice, it worked QmRxCYAzH31Z2GDp82MHwwqNeheM9oX9n3EvhjBUhYcbRh supports our protocol
pinged /ip4/127.0.0.1/tcp/39139/p2p/QmRxCYAzH31Z2GDp82MHwwqNeheM9oX9n3EvhjBUhYcbRh in 6ms
listening on addresses:
/ip4/127.0.0.1/tcp/33589/p2p/QmTGBAMm2UXeAAptisJmch1Sj2WZ3Fro29m6sP1xsW5vHN
Swarm listening on /ip4/127.0.0.1/tcp/33589/p2p/12D3KooWAeAufphmCmYcMFnpeEwiGjzvoFoUak5RAiyoQtCciijS
Swarm listening on /ip4/127.0.0.1/tcp/45043/p2p/12D3KooWAeAufphmCmYcMFnpeEwiGjzvoFoUak5RAiyoQtCciijS
```
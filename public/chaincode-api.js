const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

var gateway;

exports.connectFabricNetwork = async () => {
  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "Wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Create a new gateway for connecting to our peer node.
  gateway = new Gateway();
  const connectionProfilePath = path.resolve(
    __dirname,
    ".",
    "connection.json"
  );
  const connectionProfile = JSON.parse(
    fs.readFileSync(connectionProfilePath, "utf8")
  ); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const connectionOptions = {
    wallet,
    identity: "Org1 Admin",
    discovery: { enabled: true, asLocalhost: true },
  };
  await gateway.connect(connectionProfile, connectionOptions);

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("sse-chaincode");

  return contract;
};

exports.disconnectFabricNetwork = () => {
  // Disconnect from the gateway.
  gateway.disconnect();
};

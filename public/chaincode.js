const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

class Chaincode {
  constructor(options) {
    let { chaincodeName = "", channelName = "mychannel" } = options;

    this.gateway = new Gateway();
    this.network = null;
    this.contract = null;
    this.chaincodeName = chaincodeName;
    this.channelName = channelName;

    // Bind all class' functions to "this"
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods
      .filter((method) => method !== "constructor")
      .forEach((method) => {
        this[method] = this[method].bind(this);
      });
  }

  async connect() {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "Wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Connect gateway to our peer node.
    const connectionProfilePath = path.resolve(__dirname, "..", "connection.json");
    const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, "utf8"));

    // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    const connectionOptions = {
      wallet,
      identity: "Org1 Admin",
      discovery: { enabled: true, asLocalhost: true },
    };
    await this.gateway.connect(connectionProfile, connectionOptions);

    // Get the network (channel) our contract is deployed to.
    this.network = await this.gateway.getNetwork(this.channelName);

    // Get the contract from the network.
    this.contract = this.network.getContract(this.chaincodeName);

    console.log("[Chaincode] connected successfully");
  }

  async disconnect() {
    // Disconnect from the gateway.
    this.gateway.disconnect();
    console.log("[Chaincode] disconnected successfully");
  }
}

module.exports = new Chaincode({ chaincodeName: "sse-chaincode" });

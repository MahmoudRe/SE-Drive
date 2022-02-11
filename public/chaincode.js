const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const { getAppDataPath } = require('./main-utils')

class Chaincode {
  constructor(options) {
    let { chaincodeName = "sse-chaincode", channelName = "mychannel" } = options;

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

  async connect(options) {
    this.chaincodeName = options?.chaincodeName || this.chaincodeName;
    this.channelName = options?.channelName || this.channelName;

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(getAppDataPath());
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Connect gateway to our peer node.
    const connectionProfilePath = path.join(getAppDataPath(), "connection.json");
    const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, "utf8"));

    // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    const connectionOptions = {
      wallet,
      identity: "AdminIdentity",
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

module.exports = new Chaincode({});

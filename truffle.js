module.exports = {
  networks: {
    development: {
      gasPrice: 40000000000,
      gas: 4500000,
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gasPrice: 21000000000,
      network_id: "*" // Match any network id
    }
  }
};

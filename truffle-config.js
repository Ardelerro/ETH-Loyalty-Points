

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    // Add more network configurations as needed
  },

  compilers: {
    solc: {
      version: "0.8.0", // Specify the Solidity compiler version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
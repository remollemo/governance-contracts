import fs from 'fs';
import path from 'path';

import { HardhatUserConfig } from 'hardhat/config';
import {
  HardhatNetworkUserConfig,
  HttpNetworkUserConfig,
} from 'hardhat/types';

import { NetworkName } from './src/types';

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'solidity-coverage';

// Should be set when running hardhat compile or hardhat typechain.
const SKIP_LOAD = process.env.SKIP_LOAD === 'true';

// Testnet and mainnet configuration.
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const MNEMONIC = process.env.MNEMONIC || '';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const FORK_MAINNET = process.env.FORK_MAINNET === 'true';

// Load hardhat tasks.
if (!SKIP_LOAD) {
  console.log('Loading scripts...');
  const tasksDir = path.join(__dirname, 'tasks');
  const tasksDirs = fs.readdirSync(tasksDir);
  tasksDirs.forEach((dirName) => {
    const tasksDirPath = path.join(tasksDir, dirName);
    const tasksFiles = fs.readdirSync(tasksDirPath);
    tasksFiles.forEach((fileName) => {
      const tasksFilePath = path.join(tasksDirPath, fileName);
      /* eslint-disable-next-line global-require */
      require(tasksFilePath);
    });
  });
}

function getRemoteNetworkConfig(
  networkName: NetworkName,
  networkId: number,
): HttpNetworkUserConfig {
  return {
    url: `https://eth-${networkName}.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    chainId: networkId,
    accounts: {
      mnemonic: MNEMONIC,
      path: MNEMONIC_PATH,
      initialIndex: 0,
      count: 10,
    },
  };
}

function getHardhatConfig(): HardhatNetworkUserConfig {
  const config: HardhatNetworkUserConfig = {
    hardfork: 'berlin',
    blockGasLimit: 15000000,
    chainId: 31337,
    throwOnTransactionFailures: true,
    throwOnCallFailures: true,
  };

  if (FORK_MAINNET) {
    config.forking = {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    };
  }

  return config;
}

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.5',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: 'berlin',
        },
      },
    ],
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false,
  },
  mocha: {
    timeout: 0,
  },
  networks: {
    kovan: getRemoteNetworkConfig(NetworkName.kovan, 42),
    ropsten: getRemoteNetworkConfig(NetworkName.ropsten, 3),
    mainnet: getRemoteNetworkConfig(NetworkName.mainnet, 1),
    hardhat: getHardhatConfig(),
  },
};

export default hardhatConfig;

interface Chain {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
}

export const chains: { [chainId: number]: Chain } = {
    1: {
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/',
        explorerUrl: 'https://etherscan.io',
    },
    42161: {
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
    },
    10: {
        name: 'Optimism',
        chainId: 10,
        rpcUrl: 'https://mainnet.optimism.io',
        explorerUrl: 'https://optimistic.etherscan.io',
    },
    56: {
        name: 'BNB Smart Chain',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed1.binance.org',
        explorerUrl: 'https://bscscan.com',
    },
    5000: {
        name: 'Mantle',
        chainId: 5000,
        rpcUrl: 'https://rpc.mantle.xyz',
        explorerUrl: 'https://explorer.mantle.xyz',
    },
    8453: {
        name: 'Base',
        chainId: 8453,
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
    },
    84532: {
        name: 'HyperEVM',
        chainId: 84532,
        rpcUrl: 'https://hyperevm-rpc.com',
        explorerUrl: 'https://hyperevm-explorer.com',
    },
};

export const chainsArray: Chain[] = Object.values(chains);

export const getChainById = (chainId: number): Chain | undefined => {
    return chains[chainId];
};

export const getChainByName = (name: string): Chain | undefined => {
    return chainsArray.find(chain => chain.name.toLowerCase() === name.toLowerCase());
};

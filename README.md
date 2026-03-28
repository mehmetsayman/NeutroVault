# NeuroVault 🧠💼

NeuroVault is an autonomous, intent-based AI fund manager built on the Monad Testnet for the **Monad Blitz Hackathon**.

It uses AI agents to read crypto news, perform real-time sentiment analysis, and execute fully autonomous trades on-chain via smart contracts using high-performance constraints suited for Monad.

## Features
- **Observer Agent:** Fetches real-time crypto news metrics (using NewsAPI).
- **Analyst Agent (`gpt-4o`):** Ingests news context and mathematically scores sentiment (-100 to +100) using strict JSON parsing guarantees.
- **Executor Agent:** A secure Python-based key manager that triggers DEX trade executions securely onto a deployed Solidity vault exclusively when strict threshold signals are generated.
- **Smart Contract Vault:** Only authorized Python Agent addresses can signal the contract. The contract includes automated, intent-based logic.

## Architecture & Tech Stack

- **Backend / Orchestrator:** `Python 3.10+`
- **Smart Contract:** `Solidity ^0.8.20`
- **AI Integrations:** `OpenAI GPT-4o`
- **Web3 Ecosystem:** `Web3.py`, `Monad Testnet`
- **Data Integrations:** `NewsAPI`

## 🚀 Step-by-Step Deployment Guide

### 1. Smart Contract Deployment
You need to deploy the `contracts/NeuroVault.sol` contract to the Monad Testnet first.
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a file `NeuroVault.sol` and paste the contents of `contracts/NeuroVault.sol`.
3. Compile the contract using Solidity compiler version `0.8.20`.
4. Create an EVM wallet address to act as your **AI Agent** (do not use a mainnet wallet with real funds!). Save its Private Key.
5. In Remix, set your environment to `Injected Provider - MetaMask` (Make sure MetaMask is configured for Monad Testnet: RPC `https://testnet-rpc.monad.xyz/`, Chain ID `10143`).
6. Deploy `NeuroVault` by passing your **AI Agent's Wallet Address** as the constructor argument `_agent`.
7. Copy the Deployed Contract Address.

### 2. Backend Setup
1. Open up a terminal in this directory.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Fill in the `.env` file:
   - Provide your `OPENAI_API_KEY`.
   - Provide your `NEWS_API_KEY` (Get a free one at [newsapi.org](https://newsapi.org/)).
   - Add the `PRIVATE_KEY` of the AI Agent wallet you created in step 1.
   - Add the `CONTRACT_ADDRESS` of the deployed NeuroVault contract.

### 3. Run the AI Agent
Start the Python orchestrator. It will immediately begin observing news and making trading decisions.
```bash
python main.py
```
*(Note: If you do not configure your API keys or Private Key, the application will cleverly mock the API behaviors out-of-the-box so you can visually verify the console logs anyway.)*

You can monitor standard outputs. Once extreme fear or greed indicators are hit (above +80 or below -80), the agent will send an on-chain action to the smart contract using Monad's ultra-fast transaction settlement.

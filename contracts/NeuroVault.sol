// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NeuroVault
 * @dev An autonomous, AI-driven fund manager contract for the Monad Testnet.
 */
contract NeuroVault {
    address public owner;
    address public agent;
    
    event Deposit(address indexed sender, uint256 amount);
    event TradeExecuted(int256 sentimentScore, uint256 timestamp, string action);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "Not authorized agent");
        _;
    }

    constructor(address _agent) {
        owner = msg.sender;
        agent = _agent;
    }

    // Allow the vault to receive test Monad tokens
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // Fallback function for non-empty calldata
    fallback() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function setAgent(address _newAgent) external onlyOwner {
        agent = _newAgent;
    }

    /**
     * @dev Executes a trade based on the sentiment score derived from the off-chain AI.
     * Simulated token swap mechanism functionality.
     * @param sentimentScore A score from -100 (bearish) to 100 (bullish).
     */
    function executeTrade(int256 sentimentScore) external onlyAgent {
        string memory action = "HOLD";

        // Positive signal
        if (sentimentScore >= 80) {
            action = "BUY";
            // TODO (Integration): Connect to Monad DEX router (e.g. Uniswap V2 Fork)
            // router.swapExactETHForTokens{value: amountToBuy}(...);
        } else if (sentimentScore <= -80) {
            action = "SELL";
            // TODO (Integration): Approve token and swap back to native Monad
            // router.swapExactTokensForETH(...);
        }

        // Emit an event that the AI Agent successfully triggered a transaction
        emit TradeExecuted(sentimentScore, block.timestamp, action);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient funds");
        payable(owner).transfer(amount);
    }
}

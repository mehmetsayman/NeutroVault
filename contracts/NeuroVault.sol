// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NeuroVault
 * @dev An AI-driven DeFi signal platform for the Monad Testnet.
 * Users execute retail trades based on AI commands while paying a 1% protocol fee.
 */
contract NeuroVault {
    address public owner;
    address public agent;
    uint256 public constant COMMISSION_PERCENT = 5; // 5%
    
    event Deposit(address indexed sender, uint256 amount);
    event TradeExecuted(address indexed user, int256 sentimentScore, uint256 tradeAmount, uint256 feePaid, string action);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _agent) {
        owner = msg.sender;
        agent = _agent;
    }

    // Allow the vault to receive tokens natively
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function setAgent(address _newAgent) external onlyOwner {
        agent = _newAgent;
    }

    /**
     * @dev Called by RETAIL USERS to execute a trade based on current AI signals.
     * Takes a 1% management commission fee sent safely to the owner.
     * @param sentimentScore The verifiable AI score backing this trade decision
     */
    function executeRetailTrade(int256 sentimentScore) external payable {
        require(msg.value > 0, "Must send some MON to trade");

        // Calculate 1% fee
        uint256 fee = (msg.value * COMMISSION_PERCENT) / 100;
        uint256 tradeAmount = msg.value - fee;

        // Safely transfer fee to protocol owner (You)
        if (fee > 0) {
            payable(owner).transfer(fee);
        }

        string memory action = "HOLD";

        // Positive signal - Execute Buy logic (Mocked DEX router call)
        if (sentimentScore >= 60) {
            action = "BUY";
            // TODO (Integration): Connect to Monad DEX router
            // router.swapExactETHForTokens{value: tradeAmount}(...);
        } 
        // Negative signal - Execute Sell logic
        else if (sentimentScore <= -60) {
            action = "SELL";
            // TODO (Integration): Swap available tokens, the fee is taken in native MON here before tx execution
            // router.swapExactTokensForETH(...);
        }

        emit TradeExecuted(msg.sender, sentimentScore, tradeAmount, fee, action);
    }

    /**
     * @dev Emergency or fee withdrawal for the owner
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient funds");
        payable(owner).transfer(amount);
    }
}

import os
import requests
import json
import logging

class CryptoObserver:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def fetch_market_data(self):
        self.logger.info("Fetching market data...")
        return {"symbol": "ETH", "price": 3000, "volume": 1000000}
    
    def fetch_news(self):
        self.logger.info("Fetching crypto news...")
        return [
            "Ethereum upgrades network, reducing gas fees",
            "Major institutions start adopting ETH for DeFi"
        ]

    def get_state(self):
        return {
            "market_data": self.fetch_market_data(),
            "news": self.fetch_news()
        }

import os
import logging

class MockLLMAnalyst:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def analyze(self, state):
        self.logger.info("Analyzing data with AI...")
        news = state.get('news', [])
        
        if any("upgrades" in n.lower() or "adopting" in n.lower() for n in news):
            decision = "BUY"
            confidence = 0.85
            reason = "Positive news sentiment regarding network upgrades and institutional adoption."
        else:
            decision = "HOLD"
            confidence = 0.50
            reason = "No significant catalysts."
            
        return {
            "decision": decision,
            "confidence": confidence,
            "reason": reason
        }

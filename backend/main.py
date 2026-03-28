import os
import time
import logging
from dotenv import load_dotenv

from observer import CryptoObserver
from analyst import MockLLMAnalyst
from executor import Web3Executor

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("NeuroVault")

def main():
    load_dotenv()
    logger.info("Starting NeuroVault Autonomous Fund...")
    
    observer = CryptoObserver()
    analyst = MockLLMAnalyst()
    executor = Web3Executor()
    
    while True:
        try:
            logger.info("--- Starting new epoch ---")
            
            # 1. Observe
            state = observer.get_state()
            
            # 2. Analyze
            decision_data = analyst.analyze(state)
            logger.info(f"AI Decision: {decision_data['decision']} (Confidence: {decision_data['confidence']})")
            logger.info(f"Reason: {decision_data['reason']}")
            
            # 3. Execute
            if decision_data['decision'] in ['BUY', 'SELL']:
                success = executor.execute_transaction(decision_data)
                if success:
                    logger.info("Transaction executed successfully.")
                else:
                    logger.warning("Transaction failed.")
            else:
                logger.info("No action required. Holding.")
                
            logger.info("--- Epoch finished. ---")
            break # Run once for now
            
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            break

if __name__ == "__main__":
    main()

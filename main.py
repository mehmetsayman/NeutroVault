import os
import time
import json
import logging
import requests
from dotenv import load_dotenv
from openai import OpenAI
from web3 import Web3
from web3.exceptions import TimeExhausted, ContractLogicError

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Constants
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
MONAD_RPC_URL = os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz/")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Validate configs
if not PRIVATE_KEY or not CONTRACT_ADDRESS or "0x000" in PRIVATE_KEY:
    logging.warning("Please configure your .env file with actual keys (excluding placeholders).")

# Initialize Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
w3 = Web3(Web3.HTTPProvider(MONAD_RPC_URL))

# Ensure Web3 connection is successful
if w3.is_connected():
    logging.info("Connected to Monad Testnet!")
else:
    logging.error("Failed to connect to Monad Testnet RPC. Please check MONAD_RPC_URL.")

agent_address = None
if PRIVATE_KEY and len(PRIVATE_KEY) >= 64:
    try:
        account = w3.eth.account.from_key(PRIVATE_KEY)
        agent_address = account.address
        logging.info(f"Loaded Agent Wallet: {agent_address}")
    except Exception as e:
        logging.error(f"Invalid private key configured: {e}")

# Basic ERC20/NeuroVault Mock ABI (specifically executeTrade)
ABI = [
    {
        "inputs": [{"internalType": "int256", "name": "sentimentScore", "type": "int256"}],
        "name": "executeTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

contract = None
if CONTRACT_ADDRESS and CONTRACT_ADDRESS.startswith("0x"):
    contract = w3.eth.contract(address=w3.to_checksum_address(CONTRACT_ADDRESS), abi=ABI)

def fetch_crypto_news() -> str:
    """
    Module B: Data Scraper (Observer Agent)
    Fetches the latest 5 news articles related to Monad or Crypto using NewsAPI.
    """
    logging.info("Fetching latest news from NewsAPI...")
    if not NEWS_API_KEY or NEWS_API_KEY == "your-newsapi-key":
        logging.warning("No NewsAPI key found, returning mock news data.")
        return "Monad launches highly anticipated testnet. Crypto markets roar with approval as DeFi protocols lock in billions."

    url = f"https://newsapi.org/v2/everything?q=Monad OR Crypto&sortBy=publishedAt&pageSize=5&language=en&apiKey={NEWS_API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        articles = data.get("articles", [])
        if not articles:
            return "No recent news found."
        
        context_text = ""
        for i, article in enumerate(articles, 1):
            title = article.get("title", "")
            desc = article.get("description", "")
            context_text += f"Article {i}:\nTitle: {title}\nSummary: {desc}\n\n"
            
        logging.info("Successfully fetched and compiled news data.")
        return context_text
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching news: {e}")
        return ""

def analyze_sentiment(news_text: str) -> dict:
    """
    Module C: The Brain (Analyst Agent)
    Sends the gathered text to OpenAI GPT-4o with strict instructions to return JSON.
    """
    if not news_text or "No recent news" in news_text:
        return {"sentiment_score": 0, "reasoning": "No valid data to analyze."}

    logging.info("Analyzing sentiments via OpenAI GPT-4o...")
    
    if not OPENAI_API_KEY or OPENAI_API_KEY.startswith("sk-proj-your"):
        logging.warning("No OpenAI key found, returning mock sentiment (+85).")
        return {"sentiment_score": 85, "reasoning": "Mocking API response indicating extreme bullishness on Monad testnet release."}

    system_prompt = """
    You are an expert crypto quant developer and trader on the Monad network. 
    Analyze the provided news context and determine the overall market sentiment specifically for the crypto ecosystem.
    
    Return a strictly valid JSON exactly matching this format:
    {
      "sentiment_score": integer (between -100 and 100, where -100 is extreme bearish, and 100 is extreme bullish),
      "reasoning": string (a concise 1-2 sentence explanation of why this score was given)
    }
    """
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the latest news:\n{news_text}"}
            ],
            temperature=0.2, # Low temperature for more deterministic outputs
            max_tokens=150
        )
        
        result_content = response.choices[0].message.content
        return json.loads(result_content)
        
    except Exception as e:
        logging.error(f"Error calling OpenAI API: {e}")
        return {"sentiment_score": 0, "reasoning": f"API Error: {str(e)}"}

def execute_on_chain_trade(score: int):
    """
    Module D: The Executor (Web3 Trigger)
    Constructs, signs, and sends the transaction to the Monad Testnet smart contract.
    """
    logging.info(f"Preparing to trigger on-chain trade for score: {score}")

    if not contract or not agent_address:
        logging.warning("Smart contract or Agent address not configured. Skipping on-chain execution.")
        return

    try:
        # Get the latest nonce
        nonce = w3.eth.get_transaction_count(agent_address)
        
        # Build the transaction dict
        tx = contract.functions.executeTrade(score).build_transaction({
            'chainId': w3.eth.chain_id,
            'gas': 1000000, # Monad usually has fast execution; adequate gas limit
            'gasPrice': w3.eth.gas_price, # Use network recommended bounds
            'nonce': nonce,
        })
        
        # Sign the transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        
        logging.info("Broadcasting transaction to Monad Testnet...")
        # Send raw transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Wait for receipt
        logging.info(f"Transaction sent! Hash: {w3.to_hex(tx_hash)}")
        logging.info("Waiting for block confirmation...")
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        
        if receipt.status == 1:
            logging.info(f"Transaction Success! Included in block {receipt.blockNumber}")
        else:
            logging.error("Transaction failed during execution (reverted).")

    except ContractLogicError as cle:
        logging.error(f"Contract error (e.g., Not authorized): {cle}")
    except TimeExhausted:
        logging.error("Transaction confirmation timed out.")
    except Exception as e:
        logging.error(f"Unexpected Web3 Error: {e}")

def main_loop():
    """
    The orchestrator that runs continuously.
    """
    logging.info("Starting NeuroVault Autonomous Agent Loop.")
    
    while True:
        try:
            # 1. Fetch News (Module B)
            news_text = fetch_crypto_news()
            
            # 2. Analyze Sentiment (Module C)
            analysis_result = analyze_sentiment(news_text)
            score = analysis_result.get("sentiment_score", 0)
            reason = analysis_result.get("reasoning", "No valid reason.")
            
            logging.info(f"--- SENTIMENT SCORE: {score} ---")
            logging.info(f"Reason: {reason}")
            
            # 3. Execute Trade (Module D)
            # Rule: Score > +80 (BUY), Score < -80 (SELL)
            if score > 80 or score < -80:
                logging.info(f"Score threshold met ({score}). Taking action...")
                execute_on_chain_trade(score)
            else:
                logging.info("Score threshold NOT met (-80 to +80). Emitting HOLD action. Skipping on-chain tx.")
                
        except Exception as e:
            logging.error(f"Error in main loop: {e}")
            
        # Wait before next check (e.g., 5 minutes)
        logging.info("Sleeping for 5 minutes before the next observation cycle...")
        logging.info("="*50)
        time.sleep(300)

if __name__ == "__main__":
    main_loop()

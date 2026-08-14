import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';
import fs from 'fs';

async function main() {
    // 1. Load token configuration details
    const config = JSON.parse(fs.readFileSync('token-details.json', 'utf8'));
    console.log(`🚀 Preparing to deploy: ${config.name} (${config.symbol})`);

    // 2. Connect to Solana Devnet/Testnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // 3. Load your 20 tSOL private key from GitHub Secrets
    const secretKeyString = process.env.TSOL_PRIVATE_KEY;
    if (!secretKeyString) {
        throw new Error("❌ Error: TSOL_PRIVATE_KEY secret is not set in GitHub!");
    }
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const payer = Keypair.fromSecretKey(secretKey);
    
    console.log(`💳 Using Funding Address: ${payer.publicKey.toBase58()}`);

    // 4. Deploy the Memecoin
    console.log("⏳ Sending deployment transaction to Solana network...");
    const mint = await createMint(
        connection,
        payer,             // Payer of network fees (uses your tSOL)
        payer.publicKey,   // Mint Authority (who controls the coin)
        payer.publicKey,   // Freeze Authority 
        config.decimals    // Token decimals (usually 6 or 9)
    );

    console.log("=========================================");
    console.log("✅ SUCCESS! YOUR MEMECOIN IS ALIVE!");
    console.log(`🪙 Mint Address: ${mint.toBase58()}`);
    console.log(`🌐 View on Solscan: https://solscan.io/${mint.toBase58()}?cluster=devnet`);
    console.log("=========================================");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

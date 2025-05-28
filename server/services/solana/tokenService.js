const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} = require('@solana/spl-token');

const {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID
} = require('@metaplex-foundation/mpl-token-metadata');

const METADATA_PROGRAM_ID = PROGRAM_ID;

const config = require('../../config');

class SolanaTokenService {
  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, config.solana.commitment);
    this.platformWallet = this.loadPlatformWallet();
  }

  loadPlatformWallet() {
    // In production, load from secure environment variable
    // For development, generate a new keypair
    if (process.env.PLATFORM_PRIVATE_KEY) {
      const privateKeyArray = JSON.parse(process.env.PLATFORM_PRIVATE_KEY);
      return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    } else {
      console.warn('⚠️  No PLATFORM_PRIVATE_KEY found, generating temporary keypair');
      return Keypair.generate();
    }
  }

  /**
   * Create a new SPL token
   * @param {Object} tokenData - Token creation parameters
   * @param {string} tokenData.name - Token name
   * @param {string} tokenData.symbol - Token symbol
   * @param {string} tokenData.metadataUri - IPFS URI for metadata
   * @param {PublicKey} tokenData.creatorWallet - Creator's wallet public key
   * @param {number} tokenData.supply - Total token supply
   * @param {number} tokenData.decimals - Token decimals
   * @returns {Object} Token creation result
   */
  async createToken(tokenData) {
    try {
      console.log('🪙 Creating SPL token:', tokenData.name);

      // Create mint account
      const mintKeypair = Keypair.generate();
      console.log('📝 Generated mint address:', mintKeypair.publicKey.toString());

      // Create mint
      const mint = await createMint(
        this.connection,
        this.platformWallet, // Payer
        this.platformWallet.publicKey, // Mint authority
        this.platformWallet.publicKey, // Freeze authority
        tokenData.decimals,
        mintKeypair
      );

      console.log('✅ Mint created:', mint.toString());

      // Create metadata account
      const metadataAddress = await this.createTokenMetadata(
        mint,
        tokenData.name,
        tokenData.symbol,
        tokenData.metadataUri
      );

      console.log('📋 Metadata created:', metadataAddress.toString());

      // Create associated token account for creator
      const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.platformWallet,
        mint,
        tokenData.creatorWallet
      );

      console.log('💰 Creator token account:', creatorTokenAccount.address.toString());

      // Calculate token amounts
      const totalSupplyWithDecimals = tokenData.supply * Math.pow(10, tokenData.decimals);
      const creatorAmount = Math.floor(totalSupplyWithDecimals * config.tokenDefaults.creatorAllocation);
      const liquidityAmount = totalSupplyWithDecimals - creatorAmount;

      // Mint tokens to creator
      const mintToCreatorSignature = await mintTo(
        this.connection,
        this.platformWallet,
        mint,
        creatorTokenAccount.address,
        this.platformWallet.publicKey,
        creatorAmount
      );

      console.log('🎯 Minted to creator:', mintToCreatorSignature);

      // Create platform token account for liquidity
      const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.platformWallet,
        mint,
        this.platformWallet.publicKey
      );

      // Mint remaining tokens to platform for liquidity
      const mintToLiquiditySignature = await mintTo(
        this.connection,
        this.platformWallet,
        mint,
        platformTokenAccount.address,
        this.platformWallet.publicKey,
        liquidityAmount
      );

      console.log('💧 Minted for liquidity:', mintToLiquiditySignature);

      return {
        mintAddress: mint.toString(),
        metadataAddress: metadataAddress.toString(),
        creatorTokenAccount: creatorTokenAccount.address.toString(),
        platformTokenAccount: platformTokenAccount.address.toString(),
        creatorAmount,
        liquidityAmount,
        totalSupply: totalSupplyWithDecimals,
        mintSignature: mintToCreatorSignature,
        liquiditySignature: mintToLiquiditySignature
      };

    } catch (error) {
      console.error('❌ Token creation failed:', error);
      throw new Error(`Token creation failed: ${error.message}`);
    }
  }

  /**
   * Create token metadata using Metaplex
   * @param {PublicKey} mint - Token mint address
   * @param {string} name - Token name
   * @param {string} symbol - Token symbol
   * @param {string} uri - Metadata URI
   * @returns {PublicKey} Metadata account address
   */
  async createTokenMetadata(mint, name, symbol, uri) {
    try {
      // Derive metadata account address
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer()
        ],
        METADATA_PROGRAM_ID
      );

      // Create metadata instruction
      const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAddress,
          mint: mint,
          mintAuthority: this.platformWallet.publicKey,
          payer: this.platformWallet.publicKey,
          updateAuthority: this.platformWallet.publicKey
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: name,
              symbol: symbol,
              uri: uri,
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: this.platformWallet.publicKey,
                  verified: true,
                  share: 100
                }
              ],
              collection: null,
              uses: null
            },
            isMutable: true,
            collectionDetails: null
          }
        }
      );

      // Create and send transaction
      const transaction = new Transaction().add(createMetadataInstruction);
      
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.platformWallet],
        { commitment: config.solana.commitment }
      );

      await this.connection.confirmTransaction(signature, config.solana.commitment);

      return metadataAddress;

    } catch (error) {
      console.error('❌ Metadata creation failed:', error);
      throw new Error(`Metadata creation failed: ${error.message}`);
    }
  }

  /**
   * Validate wallet address
   * @param {string} walletAddress - Wallet address to validate
   * @returns {boolean} Is valid
   */
  isValidWalletAddress(walletAddress) {
    try {
      new PublicKey(walletAddress);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get token account balance
   * @param {string} tokenAccount - Token account address
   * @returns {number} Token balance
   */
  async getTokenBalance(tokenAccount) {
    try {
      const balance = await this.connection.getTokenAccountBalance(
        new PublicKey(tokenAccount)
      );
      return balance.value.uiAmount;
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      return 0;
    }
  }

  /**
   * Get SOL balance
   * @param {string} walletAddress - Wallet address
   * @returns {number} SOL balance
   */
  async getSolBalance(walletAddress) {
    try {
      const balance = await this.connection.getBalance(new PublicKey(walletAddress));
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('❌ Failed to get SOL balance:', error);
      return 0;
    }
  }

  /**
   * Verify transaction signature
   * @param {string} signature - Transaction signature
   * @returns {boolean} Is confirmed
   */
  async verifyTransaction(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value?.confirmationStatus === 'confirmed' || 
             status.value?.confirmationStatus === 'finalized';
    } catch (error) {
      console.error('❌ Failed to verify transaction:', error);
      return false;
    }
  }

  /**
   * Get platform wallet public key
   * @returns {string} Platform wallet address
   */
  getPlatformWalletAddress() {
    return this.platformWallet.publicKey.toString();
  }

  /**
   * Transfer SOL from platform wallet
   * @param {string} toAddress - Recipient address
   * @param {number} amount - Amount in SOL
   * @returns {string} Transaction signature
   */
  async transferSol(toAddress, amount) {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.platformWallet.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await this.connection.sendTransaction(
        transaction,
        [this.platformWallet],
        { commitment: config.solana.commitment }
      );

      await this.connection.confirmTransaction(signature, config.solana.commitment);
      return signature;

    } catch (error) {
      console.error('❌ SOL transfer failed:', error);
      throw new Error(`SOL transfer failed: ${error.message}`);
    }
  }
}

module.exports = SolanaTokenService; 
let autoGenerateInterval = null;
let totalWalletsGeneratedCounter = 0;
let walletsGeneratedCount = 0;
let generationSpeed = 20;
let lastAddress = "";
let generatedWallets = [];

function generateSingleWallet(vanityText) {
    const wallet = xrpl.Wallet.generate();
    const address = wallet.classicAddress;
    let isVanityMatch = false;
    const caseSensitive = document.getElementById('case-sensitive').checked;
    if (vanityText) {
        const addressPart = address.slice(1, vanityText.length + 1);
        if (caseSensitive) {
            isVanityMatch = addressPart === vanityText;
        } else {
            isVanityMatch = addressPart.toLowerCase() === vanityText.toLowerCase();
        }
    }
    return {
        address: address,
        seed: wallet.seed,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        isVanityMatch: isVanityMatch
    };
}

function generateVanityWallets() {
    const vanityInput = document.getElementById('vanity-input');
    const errorElement = document.getElementById('address-error-vanity');
    const vanityText = vanityInput?.value.trim() || '';
    if (vanityText && vanityText.length > 6) {
        errorElement.textContent = 'Vanity string must be 6 characters or fewer.';
        return;
    }
    const wallets = [];
    for (let i = 0; i < 10; i++) {
        const wallet = generateSingleWallet(vanityText);
        wallets.push(wallet);
    }
    displayVanityWallets(wallets);
    errorElement.textContent = '';
}

function displayVanityWallets(newWallets) {
    const walletContainer = document.getElementById('wallet-list-container');
    if (!walletContainer) return;
    generatedWallets = newWallets;
    let vanityMatchFound = false;
    for (let wallet of newWallets) {
        if (wallet.address !== lastAddress) {
            totalWalletsGeneratedCounter += 5;
            lastAddress = wallet.address;
        }
        if (wallet.isVanityMatch) {
            vanityMatchFound = true;
        }
    }
    walletsGeneratedCount += newWallets.length;
    document.getElementById('counter-display').textContent = `Millions of Xoges, scurry around searching for your request, please buy ${totalWalletsGeneratedCounter} Xoge`;
    document.getElementById('generation-counter').textContent = `Wallets Generated: ${walletsGeneratedCount}`;
    if (vanityMatchFound) {
        stopAutoGenerate();
        totalWalletsGeneratedCounter += 1000000000;
        document.getElementById('counter-display').textContent = `Millions of Xoges, scurry around searching for your request, please buy ${totalWalletsGeneratedCounter} Xoge`;
        log('Vanity address match found! Generation stopped.');
    }
    walletContainer.innerHTML = generatedWallets.map((wallet, index) => `
        <div class="wallet-item">
            <p><span class="address${wallet.isVanityMatch ? ' vanity-match' : ''}">#${index + 1} ${wallet.address}</span></p>
            <div class="button-group">
                <button class="green-btn" onclick="downloadUnencryptedVanityWallet(${index})">Download Unencrypted</button>
                <button class="red-black-btn" onclick="downloadEncryptedVanityWallet(${index})">Download Encrypted</button>
                <button class="green-btn" onclick="activateVanityWallet(${index})">Activate Wallet (2 XRP)</button>
            </div>
        </div>
    `).join('');
}

function startAutoGenerate() {
    const speedInput = document.getElementById('speed-input');
    const errorElement = document.getElementById('address-error-vanity');
    if (!speedInput) return;
    const speed = parseInt(speedInput.value) || generationSpeed;
    if (speed < 1 || speed > 5000) {
        errorElement.textContent = 'Speed must be between 1 and 5000 ms.';
        return;
    }
    if (!autoGenerateInterval) {
        autoGenerateInterval = setInterval(() => {
            generateVanityWallets();
        }, speed);
        log(`Auto-generation started with speed ${speed}ms.`);
        errorElement.textContent = '';
    }
}

function stopAutoGenerate() {
    if (autoGenerateInterval) {
        clearInterval(autoGenerateInterval);
        autoGenerateInterval = null;
        log('Auto-generation stopped.');
    }
}

async function downloadUnencryptedVanityWallet(index) {
    const wallet = generatedWallets[index];
    if (!wallet) {
        log('Error: Wallet not found.');
        return;
    }
    try {
        const walletData = {
            seed: wallet.seed,
            address: wallet.address
        };
        const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `unencrypted_wallet_${wallet.address}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        log(`Unencrypted wallet #${index + 1} downloaded successfully.`);
    } catch (error) {
        log(`Error downloading unencrypted wallet #${index + 1}: ${error.message}`);
    }
}

async function downloadEncryptedVanityWallet(index) {
    const wallet = generatedWallets[index];
    if (!wallet) {
        log('Error: Wallet not found.');
        return;
    }
    try {
        await g7(wallet.seed, wallet.address);
        log(`Encrypted wallet #${index + 1} downloaded successfully.`);
    } catch (error) {
        log(`Error downloading encrypted wallet #${index + 1}: ${error.message}`);
    }
}

async function activateVanityWallet(index) {
    const wallet = generatedWallets[index];
    const errorElement = document.getElementById('address-error-vanity');
    if (!wallet) {
        errorElement.textContent = 'Wallet not found.';
        return;
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        errorElement.textContent = 'No wallet loaded in The Surfer Report.';
        return;
    }
    const destinationAddress = wallet.address;
    if (!xrpl.isValidAddress(destinationAddress)) {
        errorElement.textContent = 'Invalid destination address.';
        return;
    }
    try {
        await ensureConnected();
        const amount = 2;
        const { availableBalanceXrp } = await calculateAvailableBalance(globalAddress);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        const totalRequiredXrp = amount + transactionFeeXrp;
        if (totalRequiredXrp > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for activation. Need ${formatBalance(totalRequiredXrp)} XRP, have ${formatBalance(availableBalanceXrp)}.`;
            return;
        }
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== globalAddress) {
            errorElement.textContent = 'Seed does not match loaded wallet address.';
            return;
        }
        const tx = {
            TransactionType: "Payment",
            Account: globalAddress,
            Destination: destinationAddress,
            Amount: xrpl.xrpToDrops(amount),
            Fee: TRANSACTION_FEE_DROPS,
            Memos: [
                {
                    Memo: {
                        MemoData: stringToHex("Wallet Activation - The Surfer Report"),
                        MemoType: stringToHex("Memo")
                    }
                }
            ]
        };
        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Activate wallet ${destinationAddress} with 2 XRP`,
            delayMs: 0,
            type: "payment",
            queueElementId: "transaction-queue-transactions"
        };
        transactionQueue.push(txEntry);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }
        errorElement.textContent = '';
        log(`Activation transaction queued for wallet #${index + 1}: ${destinationAddress}.`);
    } catch (error) {
        errorElement.textContent = `Error queuing activation transaction: ${error.message}`;
        log(`Error queuing activation transaction for wallet #${index + 1}: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const vanitySection = document.getElementById('vanity-wallet-generator');
    if (vanitySection) {
        const sectionHeader = vanitySection.querySelector('.section-header');
        if (sectionHeader) {
            sectionHeader.addEventListener('click', () => {
                if (!vanitySection.classList.contains('minimized')) {
                    displayVanityWallets([]);
                }
            });
        }
        displayVanityWallets([]);
    }
});

window.generateVanityWallets = generateVanityWallets;
window.startAutoGenerate = startAutoGenerate;
window.stopAutoGenerate = stopAutoGenerate;
window.downloadUnencryptedVanityWallet = downloadUnencryptedVanityWallet;
window.downloadEncryptedVanityWallet = downloadEncryptedVanityWallet;
window.activateVanityWallet = activateVanityWallet;
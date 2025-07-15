const AIRDROP_TX_DELAY_MS = 500
const TRUSTLINE_SETUP_DELAY_MS = 500
const ACCOUNT_STEP_DELAY_MS = 7000
const SHRED_TX_DELAY_MS = 2000
const ACCOUNT_SHRED_DELAY_MS = 3000
const SMALL_AIRDROP_TX_DELAY_MS = 8000
let filteredTrustlineListWithZeros = [];


let trustlineList = []
let originalTrustlineList = []
let trustlineListAssetB = []
let airdropResults = []
let airdropDetails = {
    totalSent: 0,
    totalFees: 0,
    successes: 0,
    failures: 0,
    startTime: null,
    endTime: null
}
let isAirdropRunning = false
let completedAddresses = new Set()

async function fetchTrustlines() {
    try {
        const trustlineAssetDisplay = document.getElementById('airdrop-trustline-asset-display');
        const trustlineAssetDisplay2 = document.getElementById('airdrop-trustline-asset-display-2');
        const recipientsTextarea = document.getElementById('airdrop-recipients');
        const errorElement = document.getElementById('address-error-build-trustlines');
        const progressElement = document.getElementById('airdrop-fetch-progress');
        const progressBarFill = document.getElementById('airdrop-progress-bar-fill');
        const downloadBtn = document.getElementById('download-trustline-csv-btn');
        const downloadWithZerosBtn = document.getElementById('download-trustline-csv-with-zeros-btn');
        const removeZeroBtn = document.getElementById('remove-zero-balance-btn');
        const trustlineCount = document.getElementById('trustline-count');
        if (!trustlineAssetDisplay || !trustlineAssetDisplay2 || !recipientsTextarea || !errorElement || !progressElement || !progressBarFill || !downloadBtn || !downloadWithZerosBtn || !removeZeroBtn || !trustlineCount) {
            log('Error: Trustline fetching elements not found.');
            errorElement.textContent = 'Error: Trustline fetching elements not found.';
            return;
        }
        if (!globalAddress || !xrpl.isValidAddress(globalAddress) || !client || !client.isConnected()) {
            errorElement.textContent = 'Please load a wallet and ensure connection before fetching trustlines.';
            return;
        }
        const selectedTrustlineAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent;
        const selectedTrustlineAssetName2 = trustlineAssetDisplay2.getAttribute('data-value') || trustlineAssetDisplay2.textContent;
        if (!selectedTrustlineAssetName || selectedTrustlineAssetName === 'Select Token') {
            errorElement.textContent = 'Please select a primary token to scan trustlines.';
            log('Error: No primary token selected for trustline scanning.');
            return;
        }
        const trustlineAsset = getAssetByName(selectedTrustlineAssetName);
        if (!trustlineAsset || trustlineAsset.name === 'XRP') {
            errorElement.textContent = 'Primary trustline asset must be a token with an issuer.';
            log('Error: Primary trustline asset must be a token with an issuer.');
            return;
        }
        const trustlineAsset2 = selectedTrustlineAssetName2 && selectedTrustlineAssetName2 !== 'XRP' ? getAssetByName(selectedTrustlineAssetName2) : null;
        if (trustlineAsset2 && trustlineAsset2.name === 'XRP') {
            errorElement.textContent = 'Secondary trustline asset must be a token with an issuer.';
            log('Error: Secondary trustline asset must be a token with an issuer.');
            return;
        }
        await ensureConnected();
        log(`Fetching trustlines for ${trustlineAsset.name} with hex: ${trustlineAsset.hex}${trustlineAsset2 ? ` and ${trustlineAsset2.name} with hex: ${trustlineAsset2.hex}` : ''}`);
        trustlineList = [];
        originalTrustlineList = [];
        filteredTrustlineListWithZeros = []; 
        trustlineListAssetB = [];
        let marker = undefined;
        let fetchedCount = 0;
        const trustlinesAsset1 = [];
        progressElement.textContent = 'Progress: Fetching trustlines for primary token...';
        progressBarFill.style.width = '0%';
        recipientsTextarea.value = 'Fetching trustlines, please wait...';
        downloadBtn.disabled = true;
        downloadWithZerosBtn.disabled = true;
        removeZeroBtn.disabled = true;
        trustlineCount.textContent = '0';
        do {
            const request = {
                command: "account_lines",
                account: trustlineAsset.issuer,
                ledger_index: "current",
                limit: 400
            };
            if (typeof marker === 'string') {
                request.marker = marker;
            }
            const response = await client.request(request);
            const lines = response.result.lines.filter(line => line.currency === trustlineAsset.hex);
            const newTrustlines = lines.map(line => {
                const rawBalance = parseFloat(line.balance);
                const absBalance = Math.abs(rawBalance);
                const roundedBalance = absBalance < 1e-6 ? 0 : absBalance;
                const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '');
                return {
                    address: line.account,
                    balance: roundedBalance,
                    balanceStr: formattedBalance
                };
            });
            trustlinesAsset1.push(...newTrustlines);
            fetchedCount += lines.length;
            progressElement.textContent = `Progress: Fetched ${fetchedCount} trustlines...`;
            progressBarFill.style.width = `${Math.min((fetchedCount / (fetchedCount || 1)) * 100, 100)}%`;
            await new Promise(resolve => setTimeout(resolve, 100));
            marker = response.result.marker;
            if (marker && typeof marker !== 'string') {
                log(`Warning: Invalid marker type received: ${typeof marker}`);
                marker = undefined;
                break;
            }
        } while (marker);
        let finalTrustlines = trustlinesAsset1;
        originalTrustlineList = trustlinesAsset1; 
        if (trustlineAsset2) {
            log(`Fetching trustlines for secondary token ${trustlineAsset2.name}...`);
            const trustlinesAsset2 = [];
            marker = undefined;
            fetchedCount = 0;
            progressElement.textContent = 'Progress: Fetching trustlines for secondary token...';
            progressBarFill.style.width = '0%';
            do {
                const request = {
                    command: "account_lines",
                    account: trustlineAsset2.issuer,
                    ledger_index: "current",
                    limit: 400
                };
                if (typeof marker === 'string') {
                    request.marker = marker;
                }
                const response = await client.request(request);
                const lines = response.result.lines.filter(line => line.currency === trustlineAsset2.hex);
                const newTrustlines = lines.map(line => {
                    const rawBalance = parseFloat(line.balance);
                    const absBalance = Math.abs(rawBalance);
                    const roundedBalance = absBalance < 1e-6 ? 0 : absBalance;
                    const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '');
                    return {
                        address: line.account,
                        balance: roundedBalance,
                        balanceStr: formattedBalance
                    };
                });
                trustlinesAsset2.push(...newTrustlines);
                fetchedCount += lines.length;
                progressElement.textContent = `Progress: Fetched ${fetchedCount} trustlines...`;
                progressBarFill.style.width = `${Math.min((fetchedCount / (fetchedCount || 1)) * 100, 100)}%`;
                await new Promise(resolve => setTimeout(resolve, 100));
                marker = response.result.marker;
                if (marker && typeof marker !== 'string') {
                    log(`Warning: Invalid marker type received: ${typeof marker}`);
                    marker = undefined;
                    break;
                }
            } while (marker);
            trustlineListAssetB = trustlinesAsset2;
            trustlineListAssetB.sort((a, b) => b.balance - a.balance);
            log(`Filtering for addresses with trustlines to both tokens...`);
            const addressesWithTrustline2 = new Set(trustlinesAsset2.map(t => t.address));
            finalTrustlines = trustlinesAsset1.filter(trustline => addressesWithTrustline2.has(trustline.address));
            log(`Found ${finalTrustlines.length} addresses with trustlines to both tokens.`);
        }
        trustlineList = finalTrustlines.filter(t => Math.abs(t.balance) > 1e-6);
        filteredTrustlineListWithZeros = finalTrustlines; 
        trustlineList.sort((a, b) => b.balance - a.balance);
        originalTrustlineList.sort((a, b) => b.balance - a.balance);
        progressElement.textContent = `Progress: Fetched ${trustlineList.length} trustlines${trustlineAsset2 ? ' with both tokens' : ''} (complete)`;
        progressBarFill.style.width = '100%';
        errorElement.textContent = trustlineList.length === 0 ? 'No trustlines found matching the criteria.' : '';
        downloadBtn.disabled = trustlineList.length === 0;
        downloadWithZerosBtn.disabled = filteredTrustlineListWithZeros.length === 0;
        removeZeroBtn.disabled = trustlineList.length === 0;
        trustlineCount.textContent = trustlineList.length;
        log(`Fetched ${trustlineList.length} trustlines${trustlineAsset2 ? ' with trustlines to both tokens' : ''} for ${selectedTrustlineAssetName}${trustlineAsset2 ? ` and ${selectedTrustlineAssetName2}` : ''}.`);
        recipientsTextarea.value = trustlineList.length > 0
            ? `${trustlineList.length} addresses found${trustlineAsset2 ? ` with trustlines to both ${selectedTrustlineAssetName} and ${selectedTrustlineAssetName2}` : ''}:\n` +
              trustlineList.map(t => `${t.address}, ${t.balanceStr}`).join('\n')
            : 'No trustlines found matching the criteria.';
        updateTrustlineStats();
        await updateAirdropAssetBalance();
    } catch (error) {
        log(`Error fetching trustlines: ${error.message}`);
        const errorElement = document.getElementById('address-error-build-trustlines');
        if (errorElement) {
            errorElement.textContent = `Error: ${error.message}`;
        }
        const progressBarFill = document.getElementById('airdrop-progress-bar-fill');
        if (progressBarFill) {
            progressBarFill.style.width = '0%';
        }
    }
}

async function loadTempAccountJSON(event, index) {
    const file = event.target.files[0]
    if (!file) {
        log('No file selected.')
        return
    }
    const fileNameDisplay = document.getElementById(`temp-account-json-name-${index}`)
    if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name
    } else {
        log(`Warning: File name display element (#temp-account-json-name-${index}) not found in DOM.`)
    }
    const errorElement = document.getElementById('address-error-execute-airdrop')
    const reader = new FileReader()
    reader.onload = async function(e) {
        try {
            const jsonContent = JSON.parse(e.target.result)
            if (!jsonContent.seed || !jsonContent.address) {
                throw new Error('Invalid JSON format. Expected { "seed": "...", "address": "..." }')
            }
            const wallet = xrpl.Wallet.fromSeed(jsonContent.seed)
            if (wallet.classicAddress !== jsonContent.address) {
                throw new Error('Seed and address do not match.')
            }
            await ensureConnected()
            await client.request({
                command: "account_info",
                account: jsonContent.address,
                ledger_index: "current"
            })
            document.getElementById(`temp-account-address-${index}`).textContent = jsonContent.address
            document.getElementById(`temp-account-seed-${index}`).textContent = jsonContent.seed
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Ready'
            document.getElementById(`temp-account-report-${index}`).textContent = 'Awaiting shredding...'
            const qrDiv = document.getElementById(`temp-account-qr-${index}`)
            qrDiv.innerHTML = ''
            new QRCode(qrDiv, {
                text: JSON.stringify({ address: jsonContent.address, seed: jsonContent.seed }),
                width: 128,
                height: 128,
                colorDark: "#ff4444",
                colorLight: "#2a2a2a"
            })
            log(`Successfully loaded temporary account ${index} (${jsonContent.address}) from JSON.`)
        } catch (error) {
            log(`Error loading JSON file for account ${index}: ${error.message}`)
            if (errorElement) {
                errorElement.textContent = `Error loading JSON file for account ${index}: ${error.message}`
            }
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Failed to load'
            document.getElementById(`temp-account-report-${index}`).textContent = `Error: ${error.message}`
        }
    }
    reader.onerror = function() {
        log('Error reading JSON file.')
        if (errorElement) {
            errorElement.textContent = 'Error reading JSON file.'
        }
    }
    reader.readAsText(file)
}

async function shredAccounts() {
    const errorElement = document.getElementById('address-error-execute-airdrop')
    if (!errorElement) {
        log('Error: Error display element not found.')
        return
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress) || !client || !client.isConnected()) {
        errorElement.textContent = 'Please load a wallet and ensure connection before shredding accounts.'
        log('Error: Wallet not loaded or not connected.')
        return
    }
    const airdropAssetDisplay = document.getElementById('airdrop-asset-display')
    if (!airdropAssetDisplay) {
        errorElement.textContent = 'Error: Airdrop asset display not found.'
        log('Error: Airdrop asset display not found.')
        return
    }
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent
    if (!selectedAssetName || selectedAssetName === 'Select Asset') {
        errorElement.textContent = 'Please select an asset before shredding accounts.'
        log('Error: No asset selected for shredding.')
        return
    }
    const airdropAsset = getAssetByName(selectedAssetName)
    if (!airdropAsset) {
        errorElement.textContent = 'Invalid airdrop asset.'
        log('Error: Invalid airdrop asset.')
        return
    }
    const tempAccounts = Array.from({ length: 5 }, (_, i) => {
        const index = i + 1
        const tempAddress = document.getElementById(`temp-account-address-${index}`).textContent
        const tempSeed = document.getElementById(`temp-account-seed-${index}`).textContent
        if (!tempAddress || !tempSeed || tempAddress === '-' || tempSeed === '-') return null
        try {
            const wallet = xrpl.Wallet.fromSeed(tempSeed)
            if (wallet.classicAddress !== tempAddress) {
                log(`Error: Seed does not match address for account ${index}.`)
                return null
            }
            return { index, wallet, address: tempAddress }
        } catch (error) {
            log(`Error validating wallet for account ${index}: ${error.message}`)
            return null
        }
    }).filter(account => account !== null)
    if (tempAccounts.length === 0) {
        errorElement.textContent = 'No temporary accounts found for shredding. Please load JSON files first.'
        log('No temporary accounts found for shredding.')
        return
    }
    await ensureConnected()
    if (airdropAsset.name !== 'XRP') {
        const masterAccountLines = await client.request({
            command: "account_lines",
            account: globalAddress,
            ledger_index: "current"
        })
        const hasTrustline = masterAccountLines.result.lines.some(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
        if (!hasTrustline) {
            errorElement.textContent = `Master wallet lacks a trustline for ${airdropAsset.name}. Please set one before shredding accounts.`
            log(`Error: Master wallet (${globalAddress}) lacks a trustline for ${airdropAsset.name}.`)
            return
        }
    }
    const confirmed = await showShredConfirmationModal()
    if (!confirmed) {
        log('Account shredding cancelled by user.')
        errorElement.textContent = 'Account shredding cancelled by user.'
        return
    }
    errorElement.textContent = `Starting cleanup of ${tempAccounts.length} temporary accounts...`
    log(`Initiating cleanup for ${tempAccounts.length} temporary accounts with asset ${airdropAsset.name}.`)
    const masterWalletBalanceBefore = await getMasterWalletBalance(globalAddress)
    for (const { index, wallet, address: tempAddress } of tempAccounts) {
        document.getElementById(`temp-account-progress-${index}`).textContent = 'Checking balances...'
        log(`Checking balances for temporary account ${index} (${tempAddress})...`)
        try {
            await ensureConnected()
            const { xrpBalance, tokenBalance } = await getAccountBalances(tempAddress, airdropAsset)
            log(`Account ${index} (${tempAddress}) - XRP Balance: ${formatBalance(xrpBalance)} XRP, Token Balance: ${formatBalance(tokenBalance)} ${airdropAsset.name}`)
            let recoveredTokens = 0
            if (airdropAsset.name !== 'XRP' && tokenBalance > 0) {
                document.getElementById(`temp-account-progress-${index}`).textContent = 'Resetting trustline limit...'
                const trustlineTx = {
                    TransactionType: "TrustSet",
                    Account: tempAddress,
                    LimitAmount: {
                        currency: airdropAsset.hex,
                        issuer: airdropAsset.issuer,
                        value: "1000000000000000"
                    },
                    Flags: xrpl.TrustSetFlags.tfSetNoRipple,
                    Fee: TRANSACTION_FEE_DROPS
                }
                const trustlineEntry = {
                    tx: trustlineTx,
                    wallet,
                    description: `Reset trustline limit to 1T for ${airdropAsset.name} on account ${index} (${tempAddress})`,
                    delayMs: SHRED_TX_DELAY_MS,
                    type: "trustset",
                    queueElementId: "shred-queue"
                }
                transactionQueue.push(trustlineEntry)
                await processShredTransactionQueue()
                log(`Reset trustline limit for account ${index} to ensure no freeze.`)
                await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
                document.getElementById(`temp-account-progress-${index}`).textContent = 'Returning remaining tokens...'
                const returnTx = {
                    TransactionType: "Payment",
                    Account: tempAddress,
                    Destination: globalAddress,
                    Amount: {
                        currency: airdropAsset.hex,
                        issuer: airdropAsset.issuer,
                        value: truncateAmount(tokenBalance)
                    },
                    Fee: TRANSACTION_FEE_DROPS
                }
                const returnEntry = {
                    tx: returnTx,
                    wallet,
                    description: `Return ${truncateAmount(tokenBalance)} ${airdropAsset.name} from account ${index} (${tempAddress}) to master wallet`,
                    delayMs: SHRED_TX_DELAY_MS,
                    type: "payment",
                    queueElementId: "shred-queue"
                }
                transactionQueue.push(returnEntry)
                await processShredTransactionQueue()
                recoveredTokens = tokenBalance
                const updatedBalances = await getAccountBalances(tempAddress, airdropAsset)
                if (updatedBalances.tokenBalance > 0) {
                    throw new Error(`Failed to clear token balance for account ${index}. Remaining: ${updatedBalances.tokenBalance} ${airdropAsset.name}`)
                }
                log(`Returned ${formatBalance(recoveredTokens)} ${airdropAsset.name} from account ${index}. Confirmed zero balance.`)
                await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
                document.getElementById(`temp-account-progress-${index}`).textContent = 'Closing trustline...'
                const closeTrustlineTx = {
                    TransactionType: "TrustSet",
                    Account: tempAddress,
                    LimitAmount: {
                        currency: airdropAsset.hex,
                        issuer: airdropAsset.issuer,
                        value: "0"
                    },
                    Flags: 0,
                    Fee: TRANSACTION_FEE_DROPS
                }
                const closeEntry = {
                    tx: closeTrustlineTx,
                    wallet,
                    description: `Close trustline for ${airdropAsset.name} on account ${index} (${tempAddress})`,
                    delayMs: SHRED_TX_DELAY_MS,
                    type: "trustset",
                    queueElementId: "shred-queue"
                }
                transactionQueue.push(closeEntry)
                await processShredTransactionQueue()
                const tempAccountLines = await client.request({
                    command: "account_lines",
                    account: tempAddress,
                    ledger_index: "current"
                })
                const trustline = tempAccountLines.result.lines.find(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
                if (trustline) {
                    throw new Error(`Trustline for ${airdropAsset.name} still exists on account ${index}.`)
                }
                log(`Confirmed trustline closed for account ${index}.`)
                await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
            } else if (airdropAsset.name === 'XRP') {
                log(`No token return or trustline closure needed for XRP airdrop on account ${index}.`)
            } else {
                log(`No tokens to return from account ${index} (balance: ${formatBalance(tokenBalance)}).`)
            }
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Checking for ledger objects...'
            const accountObjects = await client.request({
                command: "account_objects",
                account: tempAddress,
                ledger_index: "current"
            })
            if (accountObjects.result.account_objects.length > 0) {
                const objectTypes = accountObjects.result.account_objects.map(obj => obj.LedgerEntryType).join(', ')
                throw new Error(`Cannot delete account ${index} (${tempAddress}): Ledger objects exist (${objectTypes}).`)
            }
            log(`No ledger objects found for account ${index}. Safe to delete.`)
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Deleting account...'
            const deleteTx = {
                TransactionType: "AccountDelete",
                Account: tempAddress,
                Destination: globalAddress,
                Fee: xrpl.xrpToDrops(ACCOUNT_DELETE_FEE_XRP)
            }
            const deleteEntry = {
                tx: deleteTx,
                wallet,
                description: `Delete account ${index} (${tempAddress}) and return XRP to master wallet`,
                delayMs: SHRED_TX_DELAY_MS,
                type: "deletion",
                queueElementId: "shred-queue"
            }
            transactionQueue.push(deleteEntry)
            await processShredTransactionQueue()
            let recoveredXrp = 'Unknown'
            const deleteResult = deleteEntry.result
            if (deleteResult && deleteResult.result.meta.TransactionResult === "tesSUCCESS") {
                const deliveredAmount = deleteResult.result.meta.delivered_amount
                recoveredXrp = deliveredAmount ? xrpl.dropsToXrp(deliveredAmount) : 'Unknown'
                log(`Account ${index} (${tempAddress}) deleted successfully. Recovered XRP: ${recoveredXrp}`)
            } else {
                const errorMsg = deleteResult?.result.meta.TransactionResult || 'Unknown error'
                throw new Error(`Failed to delete account ${index}: ${errorMsg}`)
            }
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Completed'
            document.getElementById(`temp-account-report-${index}`).textContent = `Processed: ${recoveredTokens > 0 ? `Returned ${formatBalance(recoveredTokens)} ${airdropAsset.name}, ` : ''}Trustline closed, Account deleted, Recovered XRP: ${recoveredXrp}`
        } catch (error) {
            log(`Error during cleanup of account ${index} (${tempAddress}): ${error.message}`)
            errorElement.textContent = `Error cleaning up account ${index}: ${error.message}`
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Failed'
            document.getElementById(`temp-account-report-${index}`).textContent = `Error: ${error.message}`
        }
        await new Promise(resolve => setTimeout(resolve, ACCOUNT_SHRED_DELAY_MS))
    }
    const masterWalletBalanceAfter = await getMasterWalletBalance(globalAddress)
    log(`Master wallet balance before cleanup: ${formatBalance(masterWalletBalanceBefore.xrp)} XRP, ${formatBalance(masterWalletBalanceBefore.token)} ${airdropAsset.name}`)
    log(`Master wallet balance after cleanup: ${formatBalance(masterWalletBalanceAfter.xrp)} XRP, ${formatBalance(masterWalletBalanceAfter.token)} ${airdropAsset.name}`)
    const xrpDelta = masterWalletBalanceAfter.xrp - masterWalletBalanceBefore.xrp
    const tokenDelta = masterWalletBalanceAfter.token - masterWalletBalanceBefore.token
    log(`Funds returned: ${formatBalance(xrpDelta)} XRP, ${formatBalance(tokenDelta)} ${airdropAsset.name}`)
    errorElement.textContent = `Cleanup completed for ${tempAccounts.length} temporary accounts.`
    log(`Cleanup completed for ${tempAccounts.length} temporary accounts.`)
    await checkBalance()
}


async function ensureConnected() {
    if (client && client.isConnected()) return
    if (isConnecting) {
        log('Waiting for existing connection attempt to complete...')
        while (isConnecting) await new Promise(resolve => setTimeout(resolve, 100))
        if (client && client.isConnected()) return
    }
    log('Not connected. Attempting to reconnect...')
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await connectWebSocket()
            if (client && client.isConnected()) {
                log('Reconnected successfully.')
                return
            }
        } catch (error) {
            log(`Connection attempt ${attempt} failed: ${error.message}`)
            if (attempt < 3) {
                log(`Retrying in ${5 * attempt} seconds...`)
                await new Promise(resolve => setTimeout(resolve, 5000 * attempt))
            }
        }
    }
    throw new Error('Failed to connect to XRPL server after 3 attempts.')
}

async function processShredTransactionQueue() {
    if (transactionQueue.length === 0) {
        isProcessingQueue = false
        log('Queue is empty. Processing stopped.')
        updateTransactionQueueDisplay()
        return
    }
    isProcessingQueue = true
    const txEntry = transactionQueue[0]
    const { tx, wallet, description, delayMs, type, queueElementId } = txEntry
    try {
        if (delayMs > 0) {
            log(`Waiting ${delayMs / 1000} seconds before sending: ${description}`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
        await ensureConnected()
        const prepared = await client.autofill(tx)
        const ledgerInfo = await client.request({ command: "ledger_current" })
        prepared.LastLedgerSequence = ledgerInfo.result.ledger_current_index + 100
        const signed = wallet.sign(prepared)
        log(description)
        log(`Blob: ${signed.tx_blob}`, true)
        let result
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                result = await Promise.race([
                    client.submitAndWait(signed.tx_blob),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction submission timed out')), 15000))
                ])
                break
            } catch (error) {
                if (error.message.includes('rpcTooBusy') || error.message.includes('rate limit') || error.message.includes('timed out')) {
                    log(`Attempt ${attempt} failed: ${error.message}. Retrying after ${5 * attempt} seconds...`)
                    await new Promise(resolve => setTimeout(resolve, 5000 * attempt))
                } else {
                    throw error
                }
            }
        }
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            log(`Confirmation: ${result.result.hash}`)
            txEntry.result = result
            transactionQueue.shift()
            updateTransactionQueueDisplay()
        } else {
            throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`)
        }
    } catch (error) {
        log(`Queue processing error: ${error.message}`)
        transactionQueue.shift()
        updateTransactionQueueDisplay()
        throw error
    } finally {
        isProcessingQueue = false
        if (transactionQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
            await processShredTransactionQueue()
        }
    }
}

async function getAccountBalances(address, asset) {
    try {
        await ensureConnected()
        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        })
        const xrpBalance = parseFloat(xrpl.dropsToXrp(accountInfo.result.account_data.Balance))
        let tokenBalance = 0
        if (asset.name !== 'XRP' && asset.hex && asset.issuer) {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            })
            const trustline = accountLines.result.lines.find(line => line.currency === asset.hex && line.account === asset.issuer)
            tokenBalance = trustline ? parseFloat(trustline.balance) : 0
        }
        return { xrpBalance, tokenBalance }
    } catch (error) {
        log(`Error fetching balances for ${address}: ${error.message}`)
        throw error
    }
}

async function getMasterWalletBalance(address) {
    const airdropAssetDisplay = document.getElementById('airdrop-asset-display')
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent
    const asset = getAssetByName(selectedAssetName)
    const { xrpBalance, tokenBalance } = await getAccountBalances(address, asset)
    return { xrp: xrpBalance, token: tokenBalance }
}

async function showShredConfirmationModal() {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal')
        if (existingModal) existingModal.remove()
        const modal = document.createElement('div')
        modal.className = 'password-modal-overlay confirmation-modal'
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Account Shredding</h2>
                <p>This will clean up loaded temporary accounts by returning remaining tokens and XRP to the master wallet, closing trustlines, and deleting the accounts. Ensure all JSON files are loaded correctly.</p>
                <p><strong>WARNING:</strong> This action is IRREVERSIBLE. Verify account details before proceeding.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmShred">Proceed with Shredding</button>
                    <button class="red-black-btn" id="cancelShred">Cancel</button>
                </div>
            </div>
        `
        document.body.appendChild(modal)
        modal.style.display = 'flex'
        const confirmButton = document.getElementById('confirmShred')
        const cancelButton = document.getElementById('cancelShred')
        const resolveAndCleanup = (result) => {
            modal.remove()
            resolve(result)
        }
        confirmButton.onclick = () => resolveAndCleanup(true)
        cancelButton.onclick = () => resolveAndCleanup(false)
    })
}

async function updateAirdropAssetBalance() {
    const airdropAssetDisplay = document.getElementById('airdrop-asset-display')
    const balanceElement = document.getElementById('airdrop-asset-balance')
    const errorElement = document.getElementById('address-error-execute-airdrop')
    if (!airdropAssetDisplay || !balanceElement || !errorElement) {
        log('Error: Airdrop balance elements not found.')
        return
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress) || !client || !client.isConnected()) {
        balanceElement.textContent = 'Balance: Please load a wallet and ensure connection.'
        return
    }
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent
    if (!selectedAssetName || selectedAssetName === 'Select Asset') {
        balanceElement.textContent = 'Balance: -'
        return
    }
    const asset = getAssetByName(selectedAssetName)
    if (!asset) {
        balanceElement.textContent = 'Balance: -'
        return
    }
    try {
        await ensureConnected()
        if (asset.name === 'XRP') {
            const { availableBalanceXrp } = await calculateAvailableBalance(globalAddress)
            balanceElement.textContent = `Balance: ${formatBalance(availableBalanceXrp)} XRP`
        } else {
            const accountLines = await client.request({
                command: "account_lines",
                account: globalAddress,
                ledger_index: "current"
            })
            const line = accountLines.result.lines.find(l => l.currency === asset.hex && l.account === asset.issuer)
            balanceElement.textContent = `Balance: ${formatBalance(line?.balance || 0)} ${asset.name}`
        }
    } catch (error) {
        log(`Error updating balance: ${error.message}`)
        balanceElement.textContent = 'Balance: Unable to fetch'
    }
}

function removeZeroBalanceTrustlines() {
    const recipientsTextarea = document.getElementById('airdrop-recipients');
    const errorElement = document.getElementById('address-error-build-trustlines');
    const downloadBtn = document.getElementById('download-trustline-csv-btn');
    const trustlineCount = document.getElementById('trustline-count');
    if (!recipientsTextarea || !errorElement || !downloadBtn || !trustlineCount) {
        log('Error: UI elements not found for removing 0-balance trustlines.');
        return;
    }
    const originalCount = trustlineList.length;
    trustlineList = filteredTrustlineListWithZeros.filter(t => Math.abs(t.balance) > 1e-6); 
    const newCount = trustlineList.length;
    const removedCount = originalCount - newCount;
    const trustlineAssetDisplay = document.getElementById('airdrop-trustline-asset-display');
    const trustlineAssetDisplay2 = document.getElementById('airdrop-trustline-asset-display-2');
    const selectedTrustlineAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent;
    const selectedTrustlineAssetName2 = trustlineAssetDisplay2.getAttribute('data-value') || trustlineAssetDisplay2.textContent;
    const trustlineAsset2 = selectedTrustlineAssetName2 && selectedTrustlineAssetName2 !== 'XRP' ? getAssetByName(selectedTrustlineAssetName2) : null;
    recipientsTextarea.value = trustlineList.length > 0
        ? `${trustlineList.length} addresses found${trustlineAsset2 ? ` with trustlines to both ${selectedTrustlineAssetName} and ${selectedTrustlineAssetName2}` : ''}:\n` +
          trustlineList.map(t => `${t.address}, ${t.balanceStr}`).join('\n')
        : 'No non-zero balance trustlines found.';
    errorElement.textContent = trustlineList.length === 0 ? 'No non-zero balance trustlines found.' : `Removed 0-balance trustlines. Original total: ${originalCount}, New total: ${newCount}, Removed: ${removedCount}`;
    downloadBtn.disabled = trustlineList.length === 0;
    trustlineCount.textContent = trustlineList.length;
    log(`Filtered trustline list to ${trustlineList.length} non-zero balance entries. Removed ${removedCount} trustlines.`);
    updateTrustlineStats();
}

function downloadFullTrustlineCSV() {
    if (filteredTrustlineListWithZeros.length === 0) {
        log('Error: No trustlines to export (full list).');
        document.getElementById('address-error-build-trustlines').textContent = 'No trustlines to export (full list).';
        return;
    }
    const numFiles = 5;
    const trustlinesPerFile = Math.ceil(filteredTrustlineListWithZeros.length / numFiles);
    for (let i = 0; i < numFiles; i++) {
        const start = i * trustlinesPerFile;
        const end = Math.min(start + trustlinesPerFile, filteredTrustlineListWithZeros.length);
        const batch = filteredTrustlineListWithZeros.slice(start, end);
        const csvContent = batch.map(t => `${t.address},${t.balanceStr}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trustlines_full_part_${i + 1}_${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    log(`Filtered trustline list (with zeros) exported into ${numFiles} CSV files (without headers).`);
}

function downloadTrustlineCSV() {
    if (trustlineList.length === 0) {
        log('Error: No trustlines to export.');
        document.getElementById('address-error-build-trustlines').textContent = 'No trustlines to export.';
        return;
    }
    const numFiles = 5;
    const trustlinesPerFile = Math.ceil(trustlineList.length / numFiles);
    for (let i = 0; i < numFiles; i++) {
        const start = i * trustlinesPerFile;
        const end = Math.min(start + trustlinesPerFile, trustlineList.length);
        const batch = trustlineList.slice(start, end);
        const csvContent = batch.map(t => `${t.address},${t.balanceStr}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trustlines_part_${i + 1}_${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    log(`Trustline list exported into ${numFiles} CSV files (without headers).`);
}

async function loadAirdropCSV(event) {
    const file = event.target.files[0]
    if (!file) {
        log('No file selected.')
        return
    }
    const inputId = event.target.id
    const indexMatch = inputId.match(/airdrop-csv-file-(\d+)/)
    const index = indexMatch ? parseInt(indexMatch[1]) : null
    const fileNameDisplay = index ? document.getElementById(`airdrop-csv-file-name-${index}`) : document.getElementById('airdrop-csv-file-name')
    const recipientsTextarea = document.getElementById('airdrop-recipients')
    const errorElement = document.getElementById('address-error-execute-airdrop')
    const queueBtn = document.getElementById('queue-airdrop-btn')
    const downloadBtn = document.getElementById('download-trustline-csv-btn')
    const downloadWithZerosBtn = document.getElementById('download-trustline-csv-with-zeros-btn')
    const removeZeroBtn = document.getElementById('remove-zero-balance-btn')
    const trustlineCount = document.getElementById('trustline-count')
    if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name
    } else {
        log(`Warning: File name display element (#${index ? `airdrop-csv-file-name-${index}` : 'airdrop-csv-file-name'}) not found in DOM.`)
    }
    const reader = new FileReader()
    reader.onload = async function(e) {
        try {
            const csv = e.target.result
            const lines = csv.split('\n').filter(line => line.trim())
            if (lines.length === 0) {
                if (errorElement) errorElement.textContent = 'CSV file is empty.'
                log('Error: CSV file is empty.')
                return
            }
            trustlineList = []
            originalTrustlineList = []
            trustlineListAssetB = []
            const addresses = new Set()
            let invalidLines = 0
            for (const [index, line] of lines.entries()) {
                const parts = line.split(',').map(item => item.trim())
                if (parts.length !== 2) {
                    invalidLines++
                    log(`Warning: Skipping invalid CSV line ${index + 1}: ${line}`)
                    continue
                }
                const [address, balance] = parts
                if (!xrpl.isValidAddress(address)) {
                    invalidLines++
                    log(`Warning: Invalid address in CSV line ${index + 1}: ${address}`)
                    continue
                }
                if (isNaN(parseFloat(balance))) {
                    invalidLines++
                    log(`Warning: Invalid balance in CSV line ${index + 1}: ${balance}`)
                    continue
                }
                if (addresses.has(address)) {
                    invalidLines++
                    log(`Warning: Duplicate address in CSV line ${index + 1}: ${address}`)
                    continue
                }
                const parsedBalance = parseFloat(balance)
                const absBalance = Math.abs(parsedBalance)
                const roundedBalance = absBalance < 1e-6 ? 0 : absBalance
                const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '')
                const trustline = {
                    address,
                    balance: roundedBalance,
                    balanceStr: formattedBalance
                }
                trustlineList.push(trustline)
                originalTrustlineList.push(trustline)
                addresses.add(address)
            }
            trustlineList.sort((a, b) => b.balance - a.balance)
            originalTrustlineList.sort((a, b) => b.balance - a.balance)
            if (trustlineList.length === 0) {
                if (errorElement) errorElement.textContent = 'No valid addresses found in CSV.'
                log('Error: No valid addresses found in CSV.')
                return
            }
            if (recipientsTextarea) {
                recipientsTextarea.value = `${trustlineList.length} addresses loaded from CSV:\n` +
                    trustlineList.map(t => `${t.address}, ${t.balanceStr}`).join('\n')
            }
            if (queueBtn) queueBtn.disabled = false
            if (downloadBtn) downloadBtn.disabled = false
            if (downloadWithZerosBtn) downloadWithZerosBtn.disabled = false
            if (removeZeroBtn) removeZeroBtn.disabled = false
            if (trustlineCount) trustlineCount.textContent = trustlineList.length
            if (errorElement) {
                errorElement.textContent = `Loaded ${trustlineList.length} addresses from CSV. Skipped ${invalidLines} invalid lines.`
            }
            log(`Successfully loaded ${file.name} with ${trustlineList.length} addresses. Skipped ${invalidLines} invalid lines.`)
            updateTrustlineStats()
            await updateAirdropCost()
        } catch (error) {
            log(`Error loading CSV: ${error.message}`)
            if (errorElement) errorElement.textContent = `Error: ${error.message}`
        }
    }
    reader.onerror = function() {
        log('Error reading CSV file.')
        if (errorElement) errorElement.textContent = 'Error reading CSV file.'
    }
    reader.readAsText(file)
}

async function queueAirdropTransactions() {
    try {
        if (isAirdropRunning) {
            log('Error: Airdrop already in progress. Stop current airdrop to start a new one.')
            return
        }
        const requiredElements = {
            'address-error-execute-airdrop': 'Error display',
            'airdrop-asset-display': 'Asset display',
            'airdrop-amount': 'Amount input',
            'airdrop-memo': 'Memo input',
            'airdrop-destination-tag': 'Destination tag input',
            'airdrop-flat': 'Flat radio button',
            'stop-airdrop-btn': 'Stop airdrop button',
            'download-results-btn': 'Download results button',
            'download-details-btn': 'Download details button'
        }
        for (const [id, description] of Object.entries(requiredElements)) {
            if (!document.getElementById(id)) {
                log(`Error: ${description} element (#${id}) not found in DOM.`)
                const errorElement = document.getElementById('address-error-execute-airdrop')
                if (errorElement) {
                    errorElement.textContent = `Error: ${description} not found.`
                }
                throw new Error(`Error: ${description} not found.`)
            }
        }
        const address = globalAddress
        const errorElement = document.getElementById('address-error-execute-airdrop')
        const airdropAssetDisplay = document.getElementById('airdrop-asset-display')
        const amountInput = document.getElementById('airdrop-amount')
        const memoInput = document.getElementById('airdrop-memo')
        const destinationTagInput = document.getElementById('airdrop-destination-tag')
        const flatRadio = document.getElementById('airdrop-flat')
        const stopBtn = document.getElementById('stop-airdrop-btn')
        const resultsBtn = document.getElementById('download-results-btn')
        const detailsBtn = document.getElementById('download-details-btn')
        if (!contentCache || !displayTimer) {
            errorElement.textContent = 'No wallet loaded.'
            log('Error: No wallet loaded.')
            return
        }
        if (!address || !xrpl.isValidAddress(address)) {
            errorElement.textContent = 'Invalid address.'
            log('Error: Invalid address.')
            return
        }
        const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent
        if (!selectedAssetName || selectedAssetName === 'Select Asset') {
            errorElement.textContent = 'Please select an asset to airdrop.'
            log('Error: No asset selected for airdrop.')
            return
        }
        const csvFiles = Array.from({ length: 5 }, (_, i) => {
            const index = i + 1
            const fileInput = document.getElementById(`airdrop-csv-file-${index}`)
            const fileNameDisplay = document.getElementById(`airdrop-csv-file-name-${index}`)
            if (!fileInput || !fileNameDisplay) {
                log(`Error: CSV file input or name display for index ${index} not found.`)
                return null
            }
            return { index, file: fileInput.files[0], fileNameDisplay }
        })
        if (csvFiles.some(item => item === null)) {
            errorElement.textContent = 'Error: One or more CSV file inputs are missing in the UI.'
            log('Error: One or more CSV file inputs are missing in the UI.')
            return
        }
        if (csvFiles.some(({ file }) => !file)) {
            errorElement.textContent = 'Please load all 5 trustline CSV files.'
            log('Error: Missing CSV files.')
            return
        }
        const rawAmount = amountInput.value.trim()
        if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) {
            errorElement.textContent = 'Invalid amount or percentage.'
            log('Error: Invalid amount or percentage.')
            return
        }
        const isFlat = flatRadio.checked
        let amount = parseFloat(rawAmount)
        if (!isFlat) amount /= 100
        const memo = memoInput.value.trim()
        let destinationTag = null
        if (destinationTagInput.value.trim()) {
            destinationTag = parseInt(destinationTagInput.value)
            if (isNaN(destinationTag) || destinationTag < 0 || destinationTag > 4294967295) {
                errorElement.textContent = 'Invalid Destination Tag.'
                log('Error: Invalid Destination Tag.')
                return
            }
        }
        await ensureConnected()
        const airdropAsset = getAssetByName(selectedAssetName)
        if (!airdropAsset) {
            errorElement.textContent = 'Invalid airdrop asset.'
            log('Error: Invalid airdrop asset.')
            return
        }
        if (airdropAsset.name !== 'XRP') {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            })
            const hasTrustline = accountLines.result.lines.some(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
            if (!hasTrustline) {
                errorElement.textContent = `Master wallet lacks a trustline for ${airdropAsset.name}. Please set one before airdropping.`
                log(`Error: Master wallet (${address}) lacks a trustline for ${airdropAsset.name}.`)
                return
            }
        }
        const batches = await Promise.all(csvFiles.map(async ({ index, file }) => {
            const reader = new FileReader()
            return new Promise((resolve) => {
                reader.onload = function(e) {
                    const csv = e.target.result
                    const lines = csv.split('\n').filter(line => line.trim())
                    const batch = []
                    for (const line of lines) {
                        const [address, balance] = line.split(',').map(item => item.trim())
                        if (xrpl.isValidAddress(address) && !isNaN(parseFloat(balance))) {
                            const parsedBalance = parseFloat(balance)
                            const absBalance = Math.abs(parsedBalance)
                            const roundedBalance = absBalance < 1e-6 ? 0 : absBalance
                            const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '')
                            batch.push({
                                address,
                                balance: parseFloat(formattedBalance),
                                balanceStr: formattedBalance
                            })
                        }
                    }
                    resolve({ index, batch })
                }
                reader.onerror = function() {
                    log(`Error reading CSV file ${index}.`)
                    resolve({ index, batch: [] })
                }
                reader.readAsText(file)
            })
        }))
        if (batches.some(({ batch }) => batch.length === 0)) {
            errorElement.textContent = 'One or more CSV files failed to load or contain no valid addresses.'
            log('Error: Invalid CSV files.')
            return
        }
        const amounts = batches.map(({ index, batch }) => ({
            index,
            amounts: batch.map(trustline => {
                const addrAmount = isFlat ? amount : (Math.abs(trustline.balance) * amount)
                return addrAmount > 0 ? { address: trustline.address, amount: addrAmount } : null
            }).filter(item => item !== null)
        }))
        const totalTransactions = amounts.reduce((sum, { amounts }) => sum + amounts.length, 0)
        if (totalTransactions === 0) {
            errorElement.textContent = 'No valid amounts to airdrop.'
            log('Error: No valid amounts to airdrop.')
            return
        }
        let totalAmount = 0
        amounts.forEach(({ amounts }) => {
            totalAmount += amounts.reduce((sum, { amount }) => sum + amount, 0)
        })
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS))
        const totalFeeXrp = transactionFeeXrp * totalTransactions
        const tempAccountActivationCost = 1.25
        const totalXrpCost = totalFeeXrp + tempAccountActivationCost
        const { availableBalanceXrp } = await calculateAvailableBalance(address)
        if (availableBalanceXrp < 12) {
            errorElement.textContent = `Insufficient XRP balance. You need at least 12 XRP to proceed (10 XRP for temporary accounts, plus fees). Available: ${formatBalance(availableBalanceXrp)} XRP`
            log(`Error: Insufficient XRP balance. Need at least 12 XRP, available: ${availableBalanceXrp} XRP.`)
            return
        }
        if (totalXrpCost > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for fees and account activation. Need ${totalXrpCost.toFixed(6)} XRP.`
            log(`Error: Insufficient XRP for fees and account activation. Need ${totalXrpCost.toFixed(6)} XRP.`)
            return
        }
        let maxBalance
        if (airdropAsset.name === 'XRP') {
            maxBalance = availableBalanceXrp
        } else {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            })
            const senderLine = accountLines.result.lines.find(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
            maxBalance = senderLine ? parseFloat(senderLine.balance) : 0
        }
        if (totalAmount > maxBalance) {
            errorElement.textContent = `Insufficient ${airdropAsset.name} balance. Available: ${formatBalance(maxBalance)}`
            log(`Error: Insufficient ${airdropAsset.name} balance. Available: ${formatBalance(maxBalance)}`)
            return
        }
        const confirmed = await showAirdropConfirmationModal(amount, selectedAssetName, totalTransactions, totalAmount, totalXrpCost, memo, isFlat)
        if (!confirmed) {
            log('Airdrop cancelled by user.')
            return
        }
        if (!isFlat) {
            const trustlineAssetDisplay = document.getElementById('airdrop-trustline-asset-display')
            const primaryAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent
            log(`Note: Percentage-based airdrop (${amount * 100}%) is calculated using the balance of the primary token (${primaryAssetName}).`)
        }
        isAirdropRunning = true
        stopBtn.disabled = false
        resultsBtn.disabled = false
        detailsBtn.disabled = false
        airdropResults = []
        airdropDetails = {
            totalSent: 0,
            totalFees: 0,
            successes: 0,
            failures: 0,
            startTime: new Date().toISOString(),
            endTime: null
        }
        completedAddresses.clear()
        errorElement.textContent = `Preparing 5 temporary accounts for parallel airdrop...`
        const tempAccounts = []
        for (let i = 0; i < 5; i++) {
            let tempAccount
            do {
                tempAccount = xrpl.Wallet.generate()
            } while (tempAccount.classicAddress === globalAddress)
            tempAccounts.push({ index: i + 1, wallet: tempAccount, batch: amounts[i].amounts })
        }
        const masterSeed = await fetchRenderContent()
        const masterWallet = xrpl.Wallet.fromSeed(masterSeed)
        for (let i = 0; i < tempAccounts.length; i++) {
            if (!isAirdropRunning) throw new Error('Airdrop stopped by user.')
            const { index, wallet } = tempAccounts[i]
            const tempAddress = wallet.classicAddress
            const tempSeed = wallet.seed
            log(`Creating temporary account ${index}: ${tempAddress}`)
            document.getElementById(`temp-account-address-${index}`).textContent = tempAddress
            document.getElementById(`temp-account-seed-${index}`).textContent = tempSeed
            const qrDiv = document.getElementById(`temp-account-qr-${index}`)
            new QRCode(qrDiv, {
                text: JSON.stringify({ address: tempAddress, seed: tempSeed }),
                width: 128,
                height: 128,
                colorDark: "#ff4444",
                colorLight: "#2a2a2a"
            })
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Activating account...'
            log(`Downloading unencrypted wallet file for temporary account ${index} (${tempAddress})`)
            const walletData = { seed: tempSeed, address: tempAddress }
            const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `temp_airdrop_account_${index}_${tempAddress.slice(0, 5)}_unencrypted.json`
            a.click()
            URL.revokeObjectURL(url)
            log(`Unencrypted wallet file for temporary account ${index} (${tempAddress}) downloaded. WARNING: This file is not secure and should only be used for recovery if the airdrop fails. Store it securely and delete after use.`)
            log(`Activating temporary account ${index} (${tempAddress}) with 2 XRP...`)
            const activationTx = {
                TransactionType: "Payment",
                Account: address,
                Destination: tempAddress,
                Amount: xrpl.xrpToDrops("2")
            }
            const preparedActivation = await client.autofill(activationTx)
            const signedActivation = masterWallet.sign(preparedActivation)
            const activationResult = await client.submitAndWait(signedActivation.tx_blob)
            if (activationResult.result.meta.TransactionResult !== "tesSUCCESS") {
                throw new Error(`Failed to activate account ${tempAddress}: ${activationResult.result.meta.TransactionResult}`)
            }
            log(`Temporary account ${index} (${tempAddress}) activated successfully.`)
            await new Promise(resolve => setTimeout(resolve, ACCOUNT_STEP_DELAY_MS))
        }
        for (let i = 0; i < tempAccounts.length; i++) {
            if (!isAirdropRunning) throw new Error('Airdrop stopped by user.')
            const { index, wallet } = tempAccounts[i]
            const tempAddress = wallet.classicAddress
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Setting trustline...'
            log(`Setting trustline for temporary account ${index} (${tempAddress})...`)
            const trustlineTx = {
                TransactionType: "TrustSet",
                Account: tempAddress,
                LimitAmount: {
                    currency: airdropAsset.hex,
                    issuer: airdropAsset.issuer,
                    value: "1000000000000000"
                },
                Flags: xrpl.TrustSetFlags.tfSetNoRipple,
                Fee: TRANSACTION_FEE_DROPS
            }
            const preparedTrustline = await client.autofill(trustlineTx)
            const signedTrustline = wallet.sign(preparedTrustline)
            const trustlineResult = await client.submitAndWait(signedTrustline.tx_blob)
            if (trustlineResult.result.meta.TransactionResult !== "tesSUCCESS") {
                throw new Error(`Failed to set trustline for ${tempAddress}: ${trustlineResult.result.meta.TransactionResult}`)
            }
            log(`Trustline set for temporary account ${index} (${tempAddress}).`)
            await new Promise(resolve => setTimeout(resolve, TRUSTLINE_SETUP_DELAY_MS))
        }
        for (let i = 0; i < tempAccounts.length; i++) {
            if (!isAirdropRunning) throw new Error('Airdrop stopped by user.')
            const { index, wallet, batch } = tempAccounts[i]
            const tempAddress = wallet.classicAddress
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Transferring tokens...'
            const batchAmount = batch.reduce((sum, { amount }) => sum + amount, 0)
            log(`Transferring ${batchAmount} ${airdropAsset.name} to temporary account ${index} (${tempAddress})...`)
            const transferTx = {
                TransactionType: "Payment",
                Account: address,
                Destination: tempAddress,
                Amount: airdropAsset.name === 'XRP' ? xrpl.xrpToDrops(batchAmount.toString()) : {
                    currency: airdropAsset.hex,
                    issuer: airdropAsset.issuer,
                    value: batchAmount.toString()
                },
                Fee: TRANSACTION_FEE_DROPS
            }
            const preparedTransfer = await client.autofill(transferTx)
            const signedTransfer = masterWallet.sign(preparedTransfer)
            const transferResult = await client.submitAndWait(signedTransfer.tx_blob)
            if (transferResult.result.meta.TransactionResult !== "tesSUCCESS") {
                throw new Error(`Failed to transfer tokens to ${tempAddress}: ${transferResult.result.meta.TransactionResult}`)
            }
            log(`Transferred ${batchAmount} ${airdropAsset.name} to temporary account ${index} (${tempAddress}).`)
            await new Promise(resolve => setTimeout(resolve, ACCOUNT_STEP_DELAY_MS))
        }
        errorElement.textContent = `Running airdrop with 5 temporary accounts...`
        let processedCount = 0
        tempAccounts.forEach(({ index, wallet, batch }) => {
            const accountIndex = index
            const batchResults = []
            batch.forEach(({ address: destinationAddress, amount: addrAmount }) => {
                if (destinationAddress === globalAddress) {
                    log(`Warning: Skipping airdrop to main wallet address ${destinationAddress}.`)
                    return
                }
                const formattedAmountStr = truncateAmount(addrAmount)
                const tx = {
                    TransactionType: "Payment",
                    Account: wallet.classicAddress,
                    Destination: destinationAddress,
                    Amount: airdropAsset.name === 'XRP' ? xrpl.xrpToDrops(formattedAmountStr) : {
                        currency: airdropAsset.hex,
                        issuer: airdropAsset.issuer,
                        value: formattedAmountStr
                    },
                    Fee: TRANSACTION_FEE_DROPS
                }
                if (memo) {
                    tx.Memos = [{ Memo: { MemoData: stringToHex(memo), MemoType: stringToHex("Memo") } }]
                }
                if (destinationTag !== null) {
                    tx.DestinationTag = destinationTag
                }
                const description = `Account ${accountIndex}: Sent transaction`
                const initialDelay = (accountIndex - 1) * AIRDROP_TX_DELAY_MS
                const txEntry = {
                    tx: tx,
                    wallet: wallet,
                    description: description,
                    delayMs: initialDelay,
                    type: "payment",
                    queueElementId: `airdrop-queue-${index - 1}`
                }
                transactionQueue.push(txEntry)
                batchResults.push({ address: destinationAddress, amount: formattedAmountStr, memo, destinationTag, status: 'queued', hash: null, error: null })
            })
            airdropResults.push(...batchResults)
        })
        if (isAirdropRunning) {
            await Promise.all(tempAccounts.map(({ index }) => processAirdropTransactionQueue(`airdrop-queue-${index - 1}`)))
            processedCount = airdropResults.length
            errorElement.textContent = `Processing ${totalTransactions} transactions with 5 accounts... (${processedCount}/${totalTransactions} sent)`
            updateTransactionQueueDisplay()
            updateAirdropProgress()
        }
        for (let i = 0; i < tempAccounts.length; i++) {
            if (!isAirdropRunning) break
            const { index, wallet } = tempAccounts[i]
            const tempAddress = wallet.classicAddress
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Returning remaining tokens...'
            let recoveredTokens = 0
            if (airdropAsset.name !== 'XRP') {
                const accountLines = await client.request({
                    command: "account_lines",
                    account: tempAddress,
                    ledger_index: "current"
                })
                const trustline = accountLines.result.lines.find(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
                if (trustline && parseFloat(trustline.balance) > 0) {
                    const returnTx = {
                        TransactionType: "Payment",
                        Account: tempAddress,
                        Destination: address,
                        Amount: {
                            currency: airdropAsset.hex,
                            issuer: airdropAsset.issuer,
                            value: trustline.balance
                        },
                        Fee: TRANSACTION_FEE_DROPS
                    }
                    const preparedReturn = await client.autofill(returnTx)
                    const signedReturn = wallet.sign(preparedReturn)
                    const returnResult = await client.submitAndWait(signedReturn.tx_blob)
                    if (returnResult.result.meta.TransactionResult === "tesSUCCESS") {
                        recoveredTokens = parseFloat(trustline.balance)
                    } else {
                        log(`Failed to return tokens from ${tempAddress}: ${returnResult.result.meta.TransactionResult}`)
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, ACCOUNT_STEP_DELAY_MS))
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Closing trustline...'
            const closeTrustlineTx = {
                TransactionType: "TrustSet",
                Account: tempAddress,
                LimitAmount: {
                    currency: airdropAsset.hex,
                    issuer: airdropAsset.issuer,
                    value: "0"
                },
                Flags: 0,
                Fee: TRANSACTION_FEE_DROPS
            }
            const preparedCloseTrustline = await client.autofill(closeTrustlineTx)
            const signedCloseTrustline = wallet.sign(preparedCloseTrustline)
            const closeTrustlineResult = await client.submitAndWait(signedCloseTrustline.tx_blob)
            if (closeTrustlineResult.result.meta.TransactionResult !== "tesSUCCESS") {
                log(`Failed to close trustline for ${tempAddress}: ${closeTrustlineResult.result.meta.TransactionResult}`)
            }
            await new Promise(resolve => setTimeout(resolve, ACCOUNT_STEP_DELAY_MS))
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Deleting account...'
            const deleteTx = {
                TransactionType: "AccountDelete",
                Account: tempAddress,
                Destination: address,
                Fee: xrpl.xrpToDrops(ACCOUNT_DELETE_FEE_XRP)
            }
            const preparedDelete = await client.autofill(deleteTx)
            const signedDelete = wallet.sign(preparedDelete)
            const deleteResult = await client.submitAndWait(signedDelete.tx_blob)
            let recoveredXrp = 'Unknown'
            if (deleteResult.result.meta.TransactionResult === "tesSUCCESS") {
                const deliveredAmount = deleteResult.result.meta.delivered_amount
                recoveredXrp = deliveredAmount ? xrpl.dropsToXrp(deliveredAmount) : 'Unknown'
            } else {
                log(`Failed to delete account ${tempAddress}: ${deleteResult.result.meta.TransactionResult}`)
            }
            await new Promise(resolve => setTimeout(resolve, ACCOUNT_STEP_DELAY_MS))
            const successes = airdropResults.filter(r => r.status === 'success' && airdropResults.some(res => res.address === r.address && res.status === 'queued' && res.queueElementId === `airdrop-queue-${index - 1}`)).length
            const failures = airdropResults.filter(r => r.status === 'failed' && airdropResults.some(res => res.address === r.address && res.status === 'queued' && res.queueElementId === `airdrop-queue-${index - 1}`)).length
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Completed'
            document.getElementById(`temp-account-report-${index}`).textContent = `Processed: ${successes} successes, ${failures} failures, Recovered Tokens: ${formatBalance(recoveredTokens)} ${selectedAssetName}, Recovered XRP: ${recoveredXrp}`
        }
        airdropDetails.endTime = new Date().toISOString()
        errorElement.textContent = `Airdrop completed: ${processedCount} transactions processed.`
        updateTransactionQueueDisplay()
        updateAirdropProgress()
        downloadAirdropResults()
        downloadAirdropDetails()
        isAirdropRunning = false
        stopBtn.disabled = true
        await checkBalance()
    } catch (error) {
        log(`Airdrop queue error: ${error.message}`)
        errorElement.textContent = `Error: ${error.message}`
        isAirdropRunning = false
        stopBtn.disabled = true
        airdropDetails.endTime = new Date().toISOString()
        downloadAirdropResults()
        downloadAirdropDetails()
    }
}

async function processAirdropTransactionQueue(queueId) {
    const queue = transactionQueue.filter(tx => tx.queueElementId === queueId)
    if (queue.length === 0) {
        log(`No transactions in queue ${queueId}.`)
        return
    }
    let currentIndex = 0
    const cycleDelay = 5 * AIRDROP_TX_DELAY_MS
    const accountIndex = parseInt(queueId.split('-')[2]) + 1
    while (currentIndex < queue.length && isAirdropRunning) {
        const txEntry = queue[currentIndex]
        const { tx, wallet, description, delayMs, type, queueElementId } = txEntry
        try {
            if (completedAddresses.has(tx.Destination)) {
                log(`Skipping duplicate transaction to ${tx.Destination} in queue ${queueId}.`)
                transactionQueue.splice(transactionQueue.indexOf(txEntry), 1)
                currentIndex++
                continue
            }
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs))
            }
            await ensureConnected()
            const prepared = await client.autofill(tx)
            const ledgerInfo = await client.request({ command: "ledger_current" })
            prepared.LastLedgerSequence = ledgerInfo.result.ledger_current_index + 100
            const signed = wallet.sign(prepared)
            let result
            try {
                result = await client.submitAndWait(signed.tx_blob)
            } catch (error) {
                if (error.message.includes('rpcTooBusy') || error.message.includes('rate limit')) {
                    log(`Rate-limiting detected: ${error.message}. Pausing for 10 seconds...`)
                    await new Promise(resolve => setTimeout(resolve, 10000))
                    result = await client.submitAndWait(signed.tx_blob)
                } else {
                    throw error
                }
            }
            if (result.result.meta.TransactionResult === "tesSUCCESS") {
                log(`${description}: ${result.result.hash}`)
                if (queueElementId.startsWith('airdrop-queue')) {
                    const resultEntry = airdropResults.find(r => r.address === tx.Destination && r.status === 'queued')
                    if (resultEntry) {
                        resultEntry.status = 'success'
                        resultEntry.hash = result.result.hash
                        airdropDetails.totalSent += parseFloat(resultEntry.amount)
                        airdropDetails.totalFees += parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS))
                        airdropDetails.successes++
                        completedAddresses.add(resultEntry.address)
                    }
                }
                transactionQueue.splice(transactionQueue.indexOf(txEntry), 1)
                updateTransactionQueueDisplay()
                updateAirdropProgress()
            } else {
                throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`)
            }
        } catch (error) {
            const errorMessage = error.message.includes('tecPATH_DRY') ? `${error.message} (Recipient likely lacks a trustline for the airdrop asset)` : error.message
            log(`Account ${accountIndex}: Failed transaction to ${tx.Destination}: ${errorMessage}`)
            if (queueElementId.startsWith('airdrop-queue')) {
                const resultEntry = airdropResults.find(r => r.address === tx.Destination && r.status === 'queued')
                if (resultEntry) {
                    resultEntry.status = 'failed'
                    resultEntry.error = errorMessage
                    airdropDetails.failures++
                }
            }
            transactionQueue.splice(transactionQueue.indexOf(txEntry), 1)
            updateTransactionQueueDisplay()
            updateAirdropProgress()
        }
        currentIndex++
        if (currentIndex < queue.length) {
            await new Promise(resolve => setTimeout(resolve, cycleDelay))
        }
    }
    log(`Completed processing queue ${queueId}.`)
}

async function showCleanupConfirmationModal() {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal')
        if (existingModal) existingModal.remove()
        const modal = document.createElement('div')
        modal.className = 'password-modal-overlay confirmation-modal'
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Cleanup</h2>
                <p>Stopping the airdrop early. Do you want to clean up the temporary accounts? This will return remaining tokens, close trustlines, and delete the accounts, sending any remaining XRP back to the master wallet.</p>
                <p>This action is IRREVERSIBLE.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmCleanup">Proceed with Cleanup</button>
                    <button class="red-black-btn" id="cancelCleanup">Cancel</button>
                </div>
            </div>
        `
        document.body.appendChild(modal)
        modal.style.display = 'flex'
        const confirmButton = document.getElementById('confirmCleanup')
        const cancelButton = document.getElementById('cancelCleanup')
        const resolveAndCleanup = (result) => {
            modal.remove()
            resolve(result)
        }
        confirmButton.onclick = () => resolveAndCleanup(true)
        cancelButton.onclick = () => resolveAndCleanup(false)
    })
}

async function cleanupTemporaryAccounts(tempAccounts, airdropAsset, masterAddress) {
    const errorElement = document.getElementById('address-error-execute-airdrop')
    if (!errorElement) {
        log('Error: Error display element not found.')
        return
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress) || !client || !client.isConnected()) {
        errorElement.textContent = 'Please load a wallet and ensure connection before cleaning up accounts.'
        log('Error: Wallet not loaded or not connected.')
        return
    }
    for (let i = 0; i < tempAccounts.length; i++) {
        const { index, wallet } = tempAccounts[i]
        const tempAddress = wallet.classicAddress
        document.getElementById(`temp-account-progress-${index}`).textContent = 'Fetching balance...'
        let recoveredTokens = 0
        try {
            await ensureConnected()
            const { xrpBalance, tokenBalance } = await getAccountBalances(tempAddress, airdropAsset)
            log(`Account ${index} (${tempAddress}) - XRP Balance: ${formatBalance(xrpBalance)} XRP, Token Balance: ${formatBalance(tokenBalance)} ${airdropAsset.name}`)
            if (airdropAsset.name !== 'XRP') {
                const masterAccountLines = await client.request({
                    command: "account_lines",
                    account: masterAddress,
                    ledger_index: "current"
                })
                const hasTrustline = masterAccountLines.result.lines.some(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
                if (!hasTrustline) {
                    throw new Error(`Master wallet (${masterAddress}) lacks a trustline for ${airdropAsset.name}.`)
                }
                if (tokenBalance > 0) {
                    document.getElementById(`temp-account-progress-${index}`).textContent = 'Resetting trustline limit...'
                    const trustlineTx = {
                        TransactionType: "TrustSet",
                        Account: tempAddress,
                        LimitAmount: {
                            currency: airdropAsset.hex,
                            issuer: airdropAsset.issuer,
                            value: "1000000000000000"
                        },
                        Flags: xrpl.TrustSetFlags.tfSetNoRipple,
                        Fee: TRANSACTION_FEE_DROPS
                    }
                    const trustlineEntry = {
                        tx: trustlineTx,
                        wallet,
                        description: `Reset trustline limit to 1T for ${airdropAsset.name} on account ${index} (${tempAddress})`,
                        delayMs: SHRED_TX_DELAY_MS,
                        type: "trustset",
                        queueElementId: "cleanup-queue"
                    }
                    transactionQueue.push(trustlineEntry)
                    await processShredTransactionQueue()
                    log(`Reset trustline limit for account ${index} to ensure no freeze.`)
                    await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
                    document.getElementById(`temp-account-progress-${index}`).textContent = 'Returning remaining tokens...'
                    const returnTx = {
                        TransactionType: "Payment",
                        Account: tempAddress,
                        Destination: masterAddress,
                        Amount: {
                            currency: airdropAsset.hex,
                            issuer: airdropAsset.issuer,
                            value: truncateAmount(tokenBalance)
                        },
                        Fee: TRANSACTION_FEE_DROPS
                    }
                    const returnEntry = {
                        tx: returnTx,
                        wallet,
                        description: `Return ${truncateAmount(tokenBalance)} ${airdropAsset.name} from account ${index} (${tempAddress}) to master wallet`,
                        delayMs: SHRED_TX_DELAY_MS,
                        type: "payment",
                        queueElementId: "cleanup-queue"
                    }
                    transactionQueue.push(returnEntry)
                    await processShredTransactionQueue()
                    recoveredTokens = tokenBalance
                    const updatedBalances = await getAccountBalances(tempAddress, airdropAsset)
                    if (updatedBalances.tokenBalance > 0) {
                        throw new Error(`Failed to clear token balance for account ${index}. Remaining: ${updatedBalances.tokenBalance} ${airdropAsset.name}`)
                    }
                    log(`Returned ${formatBalance(recoveredTokens)} ${airdropAsset.name} from account ${index}. Confirmed zero balance.`)
                    await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
                }
                document.getElementById(`temp-account-progress-${index}`).textContent = 'Closing trustline...'
                const closeTrustlineTx = {
                    TransactionType: "TrustSet",
                    Account: tempAddress,
                    LimitAmount: {
                        currency: airdropAsset.hex,
                        issuer: airdropAsset.issuer,
                        value: "0"
                    },
                    Flags: 0,
                    Fee: TRANSACTION_FEE_DROPS
                }
                const closeEntry = {
                    tx: closeTrustlineTx,
                    wallet,
                    description: `Close trustline for ${airdropAsset.name} on account ${index} (${tempAddress})`,
                    delayMs: SHRED_TX_DELAY_MS,
                    type: "trustset",
                    queueElementId: "cleanup-queue"
                }
                transactionQueue.push(closeEntry)
                await processShredTransactionQueue()
                const tempAccountLines = await client.request({
                    command: "account_lines",
                    account: tempAddress,
                    ledger_index: "current"
                })
                const trustline = tempAccountLines.result.lines.find(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer)
                if (trustline) {
                    throw new Error(`Trustline for ${airdropAsset.name} still exists on account ${index}.`)
                }
                log(`Confirmed trustline closed for account ${index}.`)
                await new Promise(resolve => setTimeout(resolve, SHRED_TX_DELAY_MS))
            } else {
                log(`No token return or trustline closure needed for XRP airdrop on account ${index}.`)
            }
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Checking for ledger objects...'
            const accountObjects = await client.request({
                command: "account_objects",
                account: tempAddress,
                ledger_index: "current"
            })
            if (accountObjects.result.account_objects.length > 0) {
                const objectTypes = accountObjects.result.account_objects.map(obj => obj.LedgerEntryType).join(', ')
                throw new Error(`Cannot delete account ${index} (${tempAddress}): Ledger objects exist (${objectTypes}).`)
            }
            log(`No ledger objects found for account ${index}. Safe to delete.`)
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Deleting account...'
            const deleteTx = {
                TransactionType: "AccountDelete",
                Account: tempAddress,
                Destination: masterAddress,
                Fee: xrpl.xrpToDrops(ACCOUNT_DELETE_FEE_XRP)
            }
            const deleteEntry = {
                tx: deleteTx,
                wallet,
                description: `Delete account ${index} (${tempAddress}) and return XRP to master wallet`,
                delayMs: SHRED_TX_DELAY_MS,
                type: "deletion",
                queueElementId: "cleanup-queue"
            }
            transactionQueue.push(deleteEntry)
            await processShredTransactionQueue()
            let recoveredXrp = 'Unknown'
            const deleteResult = deleteEntry.result
            if (deleteResult && deleteResult.result.meta.TransactionResult === "tesSUCCESS") {
                const deliveredAmount = deleteResult.result.meta.delivered_amount
                recoveredXrp = deliveredAmount ? xrpl.dropsToXrp(deliveredAmount) : 'Unknown'
                log(`Successfully deleted account ${tempAddress} and returned ${recoveredXrp} XRP to master wallet.`)
            } else {
                const errorMsg = deleteResult?.result.meta.TransactionResult || 'Unknown error'
                throw new Error(`Failed to delete account ${index}: ${errorMsg}`)
            }
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Completed'
            document.getElementById(`temp-account-report-${index}`).textContent = `Processed: Cleanup complete, Recovered Tokens: ${formatBalance(recoveredTokens)} ${airdropAsset.name}, Recovered XRP: ${recoveredXrp}`
        } catch (error) {
            log(`Failed to clean up account ${index} (${tempAddress}): ${error.message}`)
            errorElement.textContent = `Failed to clean up account ${index}: ${error.message}`
            document.getElementById(`temp-account-progress-${index}`).textContent = 'Failed'
            document.getElementById(`temp-account-report-${index}`).textContent = `Error: ${error.message}`
        }
        await new Promise(resolve => setTimeout(resolve, ACCOUNT_SHRED_DELAY_MS))
    }
    log('Cleanup process completed for all temporary accounts.')
    errorElement.textContent = 'Cleanup completed for all temporary accounts.'
}

async function stopAirdrop() {
    if (!isAirdropRunning) {
        log('No airdrop in progress to stop.')
        return
    }
    const remainingTransactions = transactionQueue.filter(tx => tx.queueElementId.startsWith('airdrop-queue'))
    transactionQueue = transactionQueue.filter(tx => !tx.queueElementId.startsWith('airdrop-queue'))
    isAirdropRunning = false
    isProcessingQueue = false
    airdropDetails.endTime = new Date().toISOString()
    updateTransactionQueueDisplay()
    log(`Airdrop stopped. Cleared ${remainingTransactions.length} remaining transactions.`)
    downloadAirdropResults()
    downloadAirdropDetails()
    document.getElementById('stop-airdrop-btn').disabled = true
    const errorElement = document.getElementById('address-error-execute-airdrop')
    if (errorElement) {
        errorElement.textContent = `Airdrop stopped. ${remainingTransactions.length} transactions were not processed. Initiating cleanup...`
    }
    const tempAccounts = Array.from({ length: 5 }, (_, i) => {
        const index = i + 1
        const tempAddress = document.getElementById(`temp-account-address-${index}`).textContent
        const tempSeed = document.getElementById(`temp-account-seed-${index}`).textContent
        if (!tempAddress || !tempSeed || tempAddress === '-') return null
        return {
            index: index,
            wallet: xrpl.Wallet.fromSeed(tempSeed),
            batch: []
        }
    }).filter(account => account !== null)
    if (tempAccounts.length === 0) {
        log('No temporary accounts found for cleanup.')
        if (errorElement) errorElement.textContent = 'Airdrop stopped. No temporary accounts found for cleanup.'
        return
    }
    const confirmed = await showCleanupConfirmationModal()
    if (!confirmed) {
        log('Cleanup cancelled by user.')
        if (errorElement) errorElement.textContent = 'Airdrop stopped. Cleanup cancelled by user.'
        return
    }
    const airdropAsset = getAssetByName(document.getElementById('airdrop-asset-display').getAttribute('data-value') || document.getElementById('airdrop-asset-display').textContent)
    await cleanupTemporaryAccounts(tempAccounts, airdropAsset, globalAddress)
}

function updateAirdropProgress() {
    const queueElement = document.getElementById('airdrop-queue')
    if (!queueElement) return
    const queued = airdropResults.filter(r => r.status === 'queued').length
    const succeeded = airdropResults.filter(r => r.status === 'success').length
    const failed = airdropResults.filter(r => r.status === 'failed').length
    queueElement.innerHTML = `
        <p>Transaction Queue:</p>
        <p>Processed: ${succeeded + failed}/${airdropResults.length}</p>
        <p>Queued: ${queued}</p>
        <p>Succeeded: ${succeeded}</p>
        <p>Failed: ${failed}</p>
    `
}

function downloadAirdropResults() {
    if (airdropResults.length === 0) {
        log('Error: No airdrop results to export.')
        document.getElementById('address-error-execute-airdrop').textContent = 'No airdrop results to export.'
        return
    }
    const header = 'Address,Amount,Memo,DestinationTag,Status,TransactionHash,Error (Search this column for failure reasons, e.g., tecPATH_DRY indicates missing trustline)'
    const csvContent = [
        header,
        ...airdropResults.map(r => `${r.address},${r.amount},${r.memo || ''},${r.destinationTag || ''},${r.status},${r.hash || ''},${r.error || ''}`)
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `airdrop_results_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    log('Airdrop results CSV downloaded.')
}

function downloadAirdropDetails() {
    if (!airdropDetails.startTime) {
        log('Error: No airdrop details to export.')
        document.getElementById('address-error-execute-airdrop').textContent = 'No airdrop details to export.'
        return
    }
    const detailsContent = [
        `Airdrop Details`,
        `Start Time: ${airdropDetails.startTime}`,
        `End Time: ${airdropDetails.endTime || 'Not completed'}`,
        `Total Sent: ${airdropDetails.totalSent}`,
        `Total Fees: ${airdropDetails.totalFees} XRP`,
        `Successes: ${airdropDetails.successes}`,
        `Failures: ${airdropDetails.failures}`
    ].join('\n')
    const blob = new Blob([detailsContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `airdrop_details_${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    log('Airdrop details downloaded.')
}

async function showAirdropConfirmationModal(amount, currency, recipientCount, totalAmount, totalFee, memo, isFlat) {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal')
        if (existingModal) existingModal.remove()
        const modal = document.createElement('div')
        modal.className = 'password-modal-overlay confirmation-modal'
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Airdrop</h2>
                <p>You are about to airdrop ${isFlat ? amount : `${amount * 100}%`} ${currency} to ${recipientCount} trustline holders (Total: ${totalAmount} ${currency}, Fees: ${totalFee} XRP).${memo ? ` Memo: "${memo}"` : ''}</p>
                <p>Additional cost: ~1.25 XRP for creating/deleting 5 temporary accounts.</p>
                <p>This action is IRREVERSIBLE.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmAirdrop">Send Airdrop</button>
                    <button class="red-black-btn" id="cancelAirdrop">Cancel</button>
                </div>
            </div>
        `
        document.body.appendChild(modal)
        modal.style.display = 'flex'
        const confirmButton = document.getElementById('confirmAirdrop')
        const cancelButton = document.getElementById('cancelAirdrop')
        const resolveAndCleanup = (result) => {
            modal.remove()
            resolve(result)
        }
        confirmButton.onclick = () => resolveAndCleanup(true)
        cancelButton.onclick = () => resolveAndCleanup(false)
    })
}

async function updateAirdropCost() {
    const amountInput = document.getElementById('airdrop-amount')
    const flatRadio = document.getElementById('airdrop-flat')
    const costElement = document.getElementById('airdrop-cost')
    const errorElement = document.getElementById('address-error-execute-airdrop')
    const airdropAssetDisplay = document.getElementById('airdrop-asset-display')
    if (!amountInput || !flatRadio || !costElement || !errorElement || !airdropAssetDisplay) {
        log('Error: Airdrop cost elements not found (missing core elements).')
        return
    }
    const rawAmount = amountInput.value.trim()
    if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) {
        costElement.textContent = 'Total Cost: Enter a valid amount.'
        document.getElementById('queue-airdrop-btn').disabled = true
        return
    }
    const csvFiles = Array.from({ length: 5 }, (_, i) => {
        const index = i + 1
        const fileInput = document.getElementById(`airdrop-csv-file-${index}`)
        const fileNameDisplay = document.getElementById(`airdrop-csv-file-name-${index}`)
        if (!fileInput || !fileNameDisplay) {
            log(`Error: CSV file input or name display for index ${index} not found.`)
            return null
        }
        return {
            index,
            file: fileInput.files[0],
            fileNameDisplay
        }
    })
    if (csvFiles.some(item => item === null)) {
        costElement.textContent = 'Total Cost: One or more CSV file inputs are missing in the UI.'
        document.getElementById('queue-airdrop-btn').disabled = true
        return
    }
    if (csvFiles.some(({ file }) => !file)) {
        costElement.textContent = 'Total Cost: Load all 5 CSV files.'
        document.getElementById('queue-airdrop-btn').disabled = true
        return
    }
    const isFlat = flatRadio.checked
    let amount = parseFloat(rawAmount)
    if (!isFlat) amount /= 100
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent
    if (!selectedAssetName || selectedAssetName === 'Select Asset') {
        costElement.textContent = 'Total Cost: Select an asset to airdrop.'
        document.getElementById('queue-airdrop-btn').disabled = true
        return
    }
    const airdropAsset = getAssetByName(selectedAssetName)
    if (!airdropAsset) {
        costElement.textContent = 'Total Cost: Invalid airdrop asset.'
        document.getElementById('queue-airdrop-btn').disabled = true
        return
    }
    try {
        const batches = await Promise.all(csvFiles.map(async ({ index, file }) => {
            const reader = new FileReader()
            return new Promise((resolve) => {
                reader.onload = function(e) {
                    const csv = e.target.result
                    const lines = csv.split('\n').filter(line => line.trim())
                    const batch = []
                    for (const line of lines) {
                        const [address, balance] = line.split(',').map(item => item.trim())
                        if (xrpl.isValidAddress(address) && !isNaN(parseFloat(balance))) {
                            const parsedBalance = parseFloat(balance)
                            const absBalance = Math.abs(parsedBalance)
                            const roundedBalance = absBalance < 1e-6 ? 0 : absBalance
                            const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '')
                            batch.push({
                                address,
                                balance: parseFloat(formattedBalance),
                                balanceStr: formattedBalance
                            })
                        }
                    }
                    resolve({ index, batch })
                }
                reader.onerror = function() {
                    log(`Error reading CSV file ${index}.`)
                    resolve({ index, batch: [] })
                }
                reader.readAsText(file)
            })
        }))
        if (batches.some(({ batch }) => batch.length === 0)) {
            costElement.textContent = 'Total Cost: One or more CSV files failed to load or contain no valid addresses.'
            document.getElementById('queue-airdrop-btn').disabled = true
            return
        }
        const amounts = batches.map(({ index, batch }) => ({
            index,
            amounts: batch.map(trustline => {
                const addrAmount = isFlat ? amount : (Math.abs(trustline.balance) * amount)
                return addrAmount > 0 ? { address: trustline.address, amount: addrAmount } : null
            }).filter(item => item !== null)
        }))
        const totalTransactions = amounts.reduce((sum, { amounts }) => sum + amounts.length, 0)
        if (totalTransactions === 0) {
            costElement.textContent = 'Total Cost: No valid amounts to airdrop.'
            document.getElementById('queue-airdrop-btn').disabled = true
            return
        }
        let totalAmount = 0
        amounts.forEach(({ amounts }) => {
            totalAmount += amounts.reduce((sum, { amount }) => sum + amount, 0)
        })
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS))
        const totalFeeXrp = transactionFeeXrp * totalTransactions
        costElement.textContent = `Total Cost: ${formatBalance(totalAmount)} ${selectedAssetName}, ${totalFeeXrp} XRP for ${totalTransactions} trustlines`
        document.getElementById('queue-airdrop-btn').disabled = false
        errorElement.textContent = ''
    } catch (error) {
        log(`Error calculating cost: ${error.message}`)
        costElement.textContent = 'Total Cost: Error calculating cost.'
        document.getElementById('queue-airdrop-btn').disabled = true
    }
}

function updateTrustlineStats() {
    updateTopHoldersList()
    updateTopHoldersListSecondary()
    updateTopHoldersListMerged()
    drawAssetAPieChart()
    drawAssetBPieChart()
    drawMergedPieChart()
}

function updateTopHoldersList() {
    const topHoldersList = document.getElementById('top-holders-list')
    const top10Percentage = document.getElementById('top-10-percentage')
    if (!topHoldersList || !top10Percentage) return
    if (trustlineList.length === 0) {
        topHoldersList.innerHTML = '<li>No data available yet. Fetch trustlines to see the top holders.</li>'
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: -'
        return
    }
    const totalBalance = originalTrustlineList.reduce((sum, t) => sum + t.balance, 0)
    if (totalBalance <= 0) {
        topHoldersList.innerHTML = '<li>No non-zero balances available.</li>'
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: 0%'
        return
    }
    const top10 = trustlineList.slice(0, 10)
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0)
    const top10Percent = (top10Total / totalBalance) * 100
    topHoldersList.innerHTML = top10.map((trustline, index) => {
        return `<li>${index + 1}. ${trustline.address}: ${trustline.balanceStr}</li>`
    }).join('')
    top10Percentage.textContent = `Total % Held by Top 10 Holders: ${top10Percent.toFixed(2)}%`
}

function updateTopHoldersListSecondary() {
    const topHoldersList = document.getElementById('top-holders-list-secondary')
    const top10Percentage = document.getElementById('top-10-percentage-secondary')
    const topHoldersSection = document.getElementById('top-holders-secondary')
    if (!topHoldersList || !top10Percentage || !topHoldersSection) return
    if (trustlineListAssetB.length === 0) {
        topHoldersSection.style.display = 'none'
        topHoldersList.innerHTML = '<li>No secondary token selected.</li>'
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: -'
        return
    }
    topHoldersSection.style.display = 'block'
    const totalBalance = trustlineListAssetB.reduce((sum, t) => sum + t.balance, 0)
    if (totalBalance <= 0) {
        topHoldersList.innerHTML = '<li>No non-zero balances available.</li>'
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: 0%'
        return
    }
    const top10 = trustlineListAssetB.slice(0, 10)
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0)
    const top10Percent = (top10Total / totalBalance) * 100
    topHoldersList.innerHTML = top10.map((trustline, index) => {
        return `<li>${index + 1}. ${trustline.address}: ${trustline.balanceStr}</li>`
    }).join('')
    top10Percentage.textContent = `Total % Held by Top 10 Holders: ${top10Percent.toFixed(2)}%`
}

function updateTopHoldersListMerged() {
    const topHoldersList = document.getElementById('top-holders-list-merged')
    const top10Percentage = document.getElementById('top-10-percentage-merged')
    const topHoldersSection = document.getElementById('top-holders-merged')
    if (!topHoldersList || !top10Percentage || !topHoldersSection) return
    if (trustlineListAssetB.length === 0 || trustlineList.length === 0) {
        topHoldersSection.style.display = 'none'
        topHoldersList.innerHTML = '<li>No merged data available.</li>'
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: -'
        return
    }
    topHoldersSection.style.display = 'block'
    const totalBalance = originalTrustlineList.reduce((sum, t) => sum + t.balance, 0)
    if (totalBalance <= 0) {
        topHoldersList.innerHTML = '<li>No non-zero balances available.</li>'
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: 0%'
        return
    }
    const top10 = trustlineList.slice(0, 10)
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0)
    const top10Percent = (top10Total / totalBalance) * 100
    topHoldersList.innerHTML = top10.map((trustline, index) => {
        return `<li>${index + 1}. ${trustline.address}: ${trustline.balanceStr}</li>`
    }).join('')
    top10Percentage.textContent = `Total % Held by Top 10 Holders: ${top10Percent.toFixed(2)}%`
}

function drawAssetAPieChart() {
    const canvas = document.getElementById('trustline-distribution-chart')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (trustlineList.length === 0) {
        ctx.fillStyle = '#ccc'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2)
        return
    }
    const totalBalance = originalTrustlineList.reduce((sum, t) => sum + t.balance, 0)
    if (totalBalance === 0) {
        ctx.fillStyle = '#ccc'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('No non-zero balances', canvas.width / 2, canvas.height / 2)
        return
    }
    const top10 = trustlineList.slice(0, 10)
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0)
    const othersTotal = totalBalance - top10Total
    const data = top10.map((trustline, index) => ({
        label: `Holder ${index + 1}`,
        value: trustline.balance
    }))
    if (othersTotal > 0) {
        data.push({ label: 'Others', value: othersTotal })
    }
    const colors = [
        '#ff4444', '#00cc00', '#ff6666', '#33ff33', '#ff8888', '#66ff66',
        '#ffaaaa', '#99ff99', '#ffcccc', '#ccffcc', '#aaaaaa'
    ]
    let startAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10
    data.forEach((item, index) => {
        const sliceAngle = (item.value / totalBalance) * 2 * Math.PI
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = colors[index % colors.length]
        ctx.fill()
        ctx.strokeStyle = '#2a2a2a'
        ctx.lineWidth = 1
        ctx.stroke()
        const midAngle = startAngle + sliceAngle / 2
        const labelX = centerX + (radius / 1.5) * Math.cos(midAngle)
        const labelY = centerY + (radius / 1.5) * Math.sin(midAngle)
        const percentage = ((item.value / totalBalance) * 100).toFixed(1)
        if (percentage >= 5) {
            ctx.fillStyle = '#fff'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${percentage}%`, labelX, labelY)
        }
        startAngle += sliceAngle
    })
}

function drawAssetBPieChart() {
    const canvas = document.getElementById('trustline-distribution-chart-secondary')
    const chartSection = document.getElementById('distribution-chart-secondary')
    if (!canvas || !chartSection) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (trustlineListAssetB.length === 0) {
        chartSection.style.display = 'none'
        ctx.fillStyle = '#ccc'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('No secondary token selected', canvas.width / 2, canvas.height / 2)
        return
    }
    chartSection.style.display = 'block'
    const totalBalance = trustlineListAssetB.reduce((sum, t) => sum + t.balance, 0)
    if (totalBalance === 0) {
        ctx.fillStyle = '#ccc'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('No non-zero balances', canvas.width / 2, canvas.height / 2)
        return
    }
    const top10 = trustlineListAssetB.slice(0, 10)
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0)
    const othersTotal = totalBalance - top10Total
    const data = top10.map((trustline, index) => ({
        label: `Holder ${index + 1}`,
        value: trustline.balance
    }))
    if (othersTotal > 0) {
        data.push({ label: 'Others', value: othersTotal })
    }
    const colors = [
        '#ff4444', '#00cc00', '#ff6666', '#33ff33', '#ff8888', '#66ff66',
        '#ffaaaa', '#99ff99', '#ffcccc', '#ccffcc', '#aaaaaa'
    ]
    let startAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10
    data.forEach((item, index) => {
        const sliceAngle = (item.value / totalBalance) * 2 * Math.PI
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = colors[index % colors.length]
        ctx.fill()
        ctx.strokeStyle = '#2a2a2a'
        ctx.lineWidth = 1
        ctx.stroke()
        const midAngle = startAngle + sliceAngle / 2
        const labelX = centerX + (radius / 1.5) * Math.cos(midAngle)
        const labelY = centerY + (radius / 1.5) * Math.sin(midAngle)
        const percentage = ((item.value / totalBalance) * 100).toFixed(1)
        if (percentage >= 5) {
            ctx.fillStyle = '#fff'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${percentage}%`, labelX, labelY)
        }
        startAngle += sliceAngle
    })
}

function drawMergedPieChart() {
    const canvas = document.getElementById('trustline-distribution-chart-merged')
    const chartSection = document.getElementById('distribution-chart-merged')
    if (!canvas || !chartSection) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (trustlineListAssetB.length === 0 || trustlineList.length === 0) {
        chartSection.style.display = 'none'
        ctx.fillStyle = '#ccc'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('No merged data available', canvas.width / 2, canvas.height / 2)
        return
    }
    chartSection.style.display = 'block'
    const totalBalance = originalTrustlineList.reduce((sum, t) => sum + t.balance, 0)
    if (totalBalance === 0) {
        ctx.fillStyle = '#ccc'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('No non-zero balances', canvas.width / 2, canvas.height / 2)
        return
    }
    const top10 = trustlineList.slice(0, 10)
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0)
    const othersTotal = totalBalance - top10Total
    const data = top10.map((trustline, index) => ({
        label: `Holder ${index + 1}`,
        value: trustline.balance
    }))
    if (othersTotal > 0) {
        data.push({ label: 'Others', value: othersTotal })
    }
    const colors = [
        '#ff4444', '#00cc00', '#ff6666', '#33ff33', '#ff8888', '#66ff66',
        '#ffaaaa', '#99ff99', '#ffcccc', '#ccffcc', '#aaaaaa'
    ]
    let startAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10
    data.forEach((item, index) => {
        const sliceAngle = (item.value / totalBalance) * 2 * Math.PI
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = colors[index % colors.length]
        ctx.fill()
        ctx.strokeStyle = '#2a2a2a'
        ctx.lineWidth = 1
        ctx.stroke()
        const midAngle = startAngle + sliceAngle / 2
        const labelX = centerX + (radius / 1.5) * Math.cos(midAngle)
        const labelY = centerY + (radius / 1.5) * Math.sin(midAngle)
        const percentage = ((item.value / totalBalance) * 100).toFixed(1)
        if (percentage >= 5) {
            ctx.fillStyle = '#fff'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${percentage}%`, labelX, labelY)
        }
        startAngle += sliceAngle
    })
}

function selectAirdropTrustlineAsset() {
    const trustlineAssetDisplay = document.getElementById('airdrop-trustline-asset-display');
    const trustlineAssetDisplay2 = document.getElementById('airdrop-trustline-asset-display-2');
    if (!trustlineAssetDisplay || !trustlineAssetDisplay2) {
        log('Error: Airdrop trustline asset display not found.');
        return;
    }
    const recipientsTextarea = document.getElementById('airdrop-recipients');
    if (recipientsTextarea) {
        recipientsTextarea.value = '';

        
    }
}

function selectAirdropAsset() {
    const airdropAssetDisplay = document.getElementById('airdrop-asset-display');
    if (!airdropAssetDisplay) {
        log('Error: Airdrop asset display not found.');
        return;
    }
    updateAirdropAssetBalance();
    
}

document.addEventListener('DOMContentLoaded', () => {
    const airdropSection = document.getElementById('airdrop-transactions')
    if (airdropSection) {
        airdropSection.querySelector('.section-header').addEventListener('click', async function () {
            if (!airdropSection.classList.contains('minimized')) {
                if (typeof globalAddress !== 'undefined' && typeof xrpl !== 'undefined' && typeof client !== 'undefined' && client && client.isConnected()) {
                    if (globalAddress && xrpl.isValidAddress(globalAddress)) {
                        await checkBalance()
                        await populateAssetDropdowns()
                    } else {
                        const errorElement = document.getElementById('address-error-execute-airdrop')
                        if (errorElement) {
                            errorElement.textContent = 'Please load a valid wallet before expanding this section.'
                        }
                    }
                } else {
                    log('Error: Required variables (globalAddress, xrpl, client) are not defined or client is not connected.')
                    const errorElement = document.getElementById('address-error-execute-airdrop')
                    if (errorElement) {
                        errorElement.textContent = 'Please ensure all required variables are defined and the client is connected before expanding this section.'
                    }
                }
            }
        })
        const amountInput = document.getElementById('airdrop-amount')
        if (amountInput) {
            amountInput.addEventListener('input', updateAirdropCost)
        }
        const flatRadio = document.getElementById('airdrop-flat')
        const percentageRadio = document.getElementById('airdrop-percentage')
        if (flatRadio && percentageRadio) {
            flatRadio.addEventListener('change', updateAirdropCost)
            percentageRadio.addEventListener('change', updateAirdropCost)
        }
        Array.from({ length: 5 }, (_, i) => i + 1).forEach(index => {
            const fileInput = document.getElementById(`airdrop-csv-file-${index}`)
            if (fileInput) {
                fileInput.addEventListener('change', (event) => loadAirdropCSV(event))
            }
        })
    }
})
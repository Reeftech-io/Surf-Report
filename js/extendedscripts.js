let currentPoolData = null;
let isDeepDiveRunning = false;
let cancelDeepDive = false;

function formatIOUAmount(value) {
    if (typeof value !== 'string') value = value.toString().trim();
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) return "0";

    let exp = 0;
    if (/[eE]/.test(value)) {
        const [mant, e] = value.toUpperCase().split('E');
        value = mant;
        exp = parseInt(e, 10) || 0;
    }

    let [integer, decimal = ''] = value.split('.');
    integer = integer.replace(/^0+/, '') || '0';
    decimal = decimal.replace(/0+$/, '');
    let full = integer + decimal;

    exp -= decimal.length;

    let sigDigits = full.replace(/^0+/, '').length;
    if (sigDigits > 16) {
        let trimmed = full.slice(0, 16);
        let nextDigit = parseInt(full[16] || '0', 10);
        if (nextDigit >= 5) {
            trimmed = (parseInt(trimmed, 10) + 1).toString();
            if (trimmed.length > 16) {
                trimmed = '1' + '0'.repeat(15);
                exp += 1;
            }
        }
        full = trimmed;
    }

    let mantissa = full[0] + (full.length > 1 ? '.' + full.slice(1) : '');
    exp += full.length - 1;

    mantissa = mantissa.replace(/\.$/, '').replace(/\.?0+$/, '');
    return exp !== 0 ? mantissa + 'E' + exp : mantissa;
}

function openChartFromDropdown(dropdown) {
    const chartUrl = dropdown.value;
    if (!chartUrl) {
        return;
    }
    window.open(chartUrl, '_blank');
    dropdown.value = '';
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.toggle("minimized");
    const toggleBtn = section.querySelector(".toggle-btn");
    toggleBtn.textContent = section.classList.contains("minimized") ? "▶" : "▼";

    if (!section.classList.contains("sidebar-left") && !section.classList.contains("sidebar-right") && !section.classList.contains("minimized")) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    
    if (sectionId === 'send-transactions' && !section.classList.contains('minimized')) {
        console.log('Send Transactions section toggled open. Repopulating asset dropdowns.');
        populateAssetDropdowns();
    }
}

function expandSection(sectionId) {
    const sections = document.querySelectorAll('.section:not(.sidebar-left):not(.sidebar-right)');
    sections.forEach(sec => {
        if (sec.id !== sectionId) {
            sec.classList.add("minimized");
            const toggleBtn = sec.querySelector(".toggle-btn");
            toggleBtn.textContent = "▶";
        }
    });

    const section = document.getElementById(sectionId);
    section.classList.remove("minimized");
    const toggleBtn = section.querySelector(".toggle-btn");
    toggleBtn.textContent = "▼";

    section.scrollIntoView({ behavior: 'smooth', block: 'center' });

    
    if (sectionId === 'send-transactions') {
        console.log('Send Transactions section expanded via nav link. Repopulating asset dropdowns.');
        populateAssetDropdowns();
    }
}

async function queueOfferCreate() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-amm-swap');

        if (!encryptedSeedInMemory) {
            log('Error: No wallet loaded. Load a wallet in the Wallet Management section.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }
        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid address. Load a valid wallet in the Wallet Management section.');
            errorElement.textContent = 'Invalid address.';
            return;
        }

       
        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const sellAsset = "XRP"; 
        const buyAsset = document.getElementById('dex-buy-asset').value;
        let buyAmount = document.getElementById('dex-buy-amount').value.trim();
        let sellAmount = document.getElementById('dex-sell-amount').value.trim();

        if (!buyAsset || !buyAmount || !sellAmount) {
            log('Error: All fields are required.');
            errorElement.textContent = 'All fields are required.';
            return;
        }

        if (buyAsset === sellAsset) {
            log('Error: Buy and sell assets must be different.');
            errorElement.textContent = 'Buy and sell assets must be different.';
            return;
        }

        buyAmount = formatIOUAmount(buyAmount);
        sellAmount = formatIOUAmount(sellAmount);
        if (buyAmount === "0") {
            log('Error: Invalid buy amount.');
            errorElement.textContent = 'Invalid buy amount.';
            return;
        }
        if (sellAmount === "0") {
            log('Error: Invalid sell amount.');
            errorElement.textContent = 'Invalid sell amount.';
            return;
        }

        const seed = await decryptSeedInMemory();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        let takerGets, takerPays;
        const buyAssetData = prefabAssets.find(a => a.name === buyAsset);
        if (!buyAssetData) throw new Error(`Buy asset ${buyAsset} not found in prefabAssets`);
        takerGets = xrpl.xrpToDrops(sellAmount); 
        takerPays = { currency: buyAssetData.hex, issuer: buyAssetData.issuer, value: buyAmount };

        const { availableBalanceXrp } = await calculateAvailableBalance(address, 1);
        const transactionFeeXrp = xrpl.dropsToXrp(TRANSACTION_FEE_DROPS);
        const sellAssetAmount = parseFloat(sellAmount);
        if ((sellAssetAmount + transactionFeeXrp) > availableBalanceXrp) {
            log(`Error: Insufficient XRP balance. Available: ${formatBalance(availableBalanceXrp)} XRP`);
            errorElement.textContent = `Insufficient XRP balance. Available: ${formatBalance(availableBalanceXrp)} XRP`;
            return;
        }

        const tx = {
            TransactionType: "OfferCreate",
            Account: address,
            TakerGets: takerGets,
            TakerPays: takerPays,
            Fee: TRANSACTION_FEE_DROPS
        };

        const scheduleCheckbox = document.getElementById('schedule-tx-dex-offer');
        const delayInput = document.getElementById('schedule-delay-dex-offer');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling OfferCreate transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Create Offer: Sell ${sellAmount} XRP for ${buyAmount} ${buyAsset}`,
            delayMs: delayMs,
            type: "offercreate",
            queueElementId: "amm-swap-queue"
        };

        transactionQueue.push(txEntry);
        log(`OfferCreate transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`OfferCreate queue error: ${error.message}`);
    }
}

async function fetchNetworkStats() {
    try {
        await ensureConnected();
        log('🕵️‍♂️ Tapping into XRPL ledger pulse...');

        
        let ledgerIndex = "Unknown", closeTime = "Unknown", totalXrp = "0", txSpike = 0, baseFee = "N/A", peakFee = "N/A", txBreakdown = {};
        try {
            const ledgerResponse = await client.request({
                command: "ledger",
                ledger_index: "validated",
                transactions: true,
                expand: false
            });
            const ledger = ledgerResponse.result.ledger;
            ledgerIndex = ledger.ledger_index || "Unknown";
            closeTime = ledger.close_time 
                ? new Date((ledger.close_time + 946684800) * 1000).toLocaleTimeString() 
                : "Unknown";
            totalXrp = parseFloat(xrpl.dropsToXrp(ledger.total_coins || "0")).toLocaleString(undefined, { maximumFractionDigits: 0 });
            txSpike = ledger.transactions?.length || 0;
            ledger.transactions?.forEach(tx => {
                const type = typeof tx === "string" ? "Unknown" : tx.TransactionType || "Unknown";
                txBreakdown[type] = (txBreakdown[type] || 0) + 1;
            });

            const feeResponse = await client.request({ command: "fee" });
            baseFee = xrpl.dropsToXrp(feeResponse.result.drops.base_fee || "0");
            peakFee = feeResponse.result.drops.open_ledger_fee ? xrpl.dropsToXrp(feeResponse.result.drops.open_ledger_fee) : "N/A";

            log(`Ledger pulse captured: Index ${ledgerIndex}, ${txSpike} actions`);
        } catch (error) {
            log(`Ledger pulse lost: ${error.message}`);
        }

        
        const ledgerStatsDisplay = document.getElementById('ledger-index').parentElement;
        ledgerStatsDisplay.innerHTML = `
            <p><strong>Current Ledger:</strong> ${ledgerIndex}</p>
            <p><em>Last Sync:</em> ${closeTime} - Time of last network heartbeat</p>
            <p><strong>Total XRP:</strong> ${totalXrp} - Circulating lifeblood</p>
            <p><em>Activity Spike:</em> ${txSpike} actions in the last ledger</p>
            <p><strong>Base Fee:</strong> ${baseFee} XRP - Entry cost to the grid</p>
            <p><em>Peak Fee:</em> ${peakFee} XRP - Max toll during high traffic</p>
        `;

        log('🔒 Ledger intel delivered');
    } catch (error) {
        log(`🚨 Critical error in fetchNetworkStats: ${error.message}`);
    }
}

async function deepDiveAccount() {
    try {
        
        cancelDeepDive = false;
        isDeepDiveRunning = true;

        
        const deepDiveButton = document.querySelector('#deep-dive-results button[onclick="deepDiveAccount()"]');
        const stopButton = document.getElementById('stop-deep-dive');
        if (deepDiveButton) deepDiveButton.disabled = true;
        if (stopButton) stopButton.disabled = false;

        const address = document.getElementById('deep-dive-address').value.trim();
        if (!xrpl.isValidAddress(address)) {
            log(`🚨 Deep dive aborted: Invalid address "${address}"`);
            return;
        }
        log(`🕵️‍♂️ Initiating deep dive on ${address}...`);

        await ensureConnected();
        if (!client || !client.isConnected()) {
            log(`🚨 No active connection. Please connect to a server in Wallet Management.`);
            return;
        }
        log(`Using existing connection: ${client.connection.url}`);

        
        let sequence = "N/A", flags = ["N/A"], domain = "N/A";
        try {
            const accountInfo = await client.request({ command: "account_info", account: address, ledger_index: "validated" });
            sequence = accountInfo.result.account_data.Sequence || "N/A";
            flags = accountInfo.result.account_data.Flags 
                ? Object.entries(xrpl.AccountFlags).filter(([_, v]) => accountInfo.result.account_data.Flags & v).map(([k]) => k) 
                : ["None"];
            domain = accountInfo.result.account_data.Domain ? hexToDomain(accountInfo.result.account_data.Domain) : "None";
            log(`Core info fetched: Sequence: ${sequence}`);
        } catch (infoError) {
            log(`🚨 account_info failed: ${infoError.message}`);
        }

        
        let trustlines = [], totalIOUs = "0", closedTrustlines = [];
        const assetMap = new Map();
        try {
            const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "validated", limit: 200 });
            trustlines = accountLines.result.lines.map(line => {
                let currency = line.currency.toUpperCase();
                let decodedCurrency = /^[0-9A-F]{40}$/.test(currency) ? xrpl.convertHexToString(currency).replace(/\0/g, '') || `[HEX:${currency.slice(0, 8)}...]` : currency;
                if (decodedCurrency.startsWith('[HEX:')) {
                    log(`Failed to decode currency in account_lines: ${currency}`);
                }
                assetMap.set(currency, decodedCurrency);
                const formattedBalance = formatIOUAmount(line.balance);
                return { currency: decodedCurrency, issuer: line.account, balance: formattedBalance };
            });
            const Decimal = window.Decimal;
            totalIOUs = trustlines.reduce((sum, t) => sum.plus(new Decimal(t.balance)), new Decimal(0)).abs().toFixed(2);
            closedTrustlines = trustlines.filter(t => t.balance === "0");
            trustlines = trustlines.filter(t => t.balance !== "0");
        } catch (assetError) {
            log(`🚨 Assets fetch failed: ${assetError.message}`);
        }

        
        let txs = [], xrpFlow = { in: new Decimal(0), out: new Decimal(0), fees: new Decimal(0) }, assetFlow = new Map([["XRP", { in: new Decimal(0), out: new Decimal(0), issuer: null }]]), assetBalances = new Map([["XRP", new Decimal(0)]]);
        const recentTxs = [];
        try {
            let marker = null;
            let totalFetched = 0;
            const txLimit = 50;
            const targetTxs = 2450;
            const waitTime = 3000;

            
            const txBox = document.getElementById('deep-dive-tx');
            if (txBox && txBox.querySelector('.content')) {
                txBox.querySelector('.content').innerHTML = `
                    <p>Processing transactions... 0 of ${targetTxs}</p>
                `;
            }

            while (totalFetched < targetTxs) {
                if (cancelDeepDive) {
                    log(`🛑 Deep dive cancelled by user at ${totalFetched} transactions.`);
                    break;
                }

                const accountTx = await client.request({
                    command: "account_tx",
                    account: address,
                    ledger_index_min: -1,
                    ledger_index_max: -1,
                    limit: txLimit,
                    marker: marker || undefined
                });
                const pullNumber = Math.floor(totalFetched / txLimit) + 1;
                log(`Pull ${pullNumber} - Fetched ${accountTx.result.transactions?.length || 0} txs. Marker: ${JSON.stringify(accountTx.result.marker)}`);

                if (!accountTx.result.transactions || accountTx.result.transactions.length === 0) {
                    log(`Pull ${pullNumber}: No transactions returned. Stopping.`);
                    break;
                }

                accountTx.result.transactions.forEach((tx, index) => {
                    try {
                        if (!tx || !tx.tx || !tx.meta) {
                            log(`Skipping malformed transaction at index ${index}: ${JSON.stringify(tx)}`);
                            return;
                        }

                        const Decimal = window.Decimal;
                        const feeStr = xrpl.dropsToXrp(tx.tx.Fee || "0") || "0";
                        const fee = new Decimal(formatIOUAmount(feeStr));
                        xrpFlow.fees = xrpFlow.fees.plus(fee);

                        let isAmmSwap = false;

                        
                        if (tx.tx.SendMax && typeof tx.tx.SendMax !== "string" && tx.tx.SendMax.currency) {
                            let currency = tx.tx.SendMax.currency.toUpperCase();
                            if (!assetMap.has(currency)) {
                                let decodedCurrency = /^[0-9A-F]{40}$/.test(currency) ? xrpl.convertHexToString(currency).replace(/\0/g, '') || `[HEX:${currency.slice(0, 8)}...]` : currency;
                                if (decodedCurrency.startsWith('[HEX:')) {
                                    log(`Failed to decode SendMax currency: ${currency}`);
                                }
                                assetMap.set(currency, decodedCurrency);
                            }
                        }
                        if (tx.meta.delivered_amount && typeof tx.meta.delivered_amount !== "string" && tx.meta.delivered_amount.currency) {
                            let currency = tx.meta.delivered_amount.currency.toUpperCase();
                            if (!assetMap.has(currency)) {
                                let decodedCurrency = /^[0-9A-F]{40}$/.test(currency) ? xrpl.convertHexToString(currency).replace(/\0/g, '') || `[HEX:${currency.slice(0, 8)}...]` : currency;
                                if (decodedCurrency.startsWith('[HEX:')) {
                                    log(`Failed to decode delivered_amount currency: ${currency}`);
                                }
                                assetMap.set(currency, decodedCurrency);
                            }
                        }
                        if (tx.tx.TakerGets && typeof tx.tx.TakerGets !== "string" && tx.tx.TakerGets.currency) {
                            let currency = tx.tx.TakerGets.currency.toUpperCase();
                            if (!assetMap.has(currency)) {
                                let decodedCurrency = /^[0-9A-F]{40}$/.test(currency) ? xrpl.convertHexToString(currency).replace(/\0/g, '') || `[HEX:${currency.slice(0, 8)}...]` : currency;
                                if (decodedCurrency.startsWith('[HEX:')) {
                                    log(`Failed to decode TakerGets currency: ${currency}`);
                                }
                                assetMap.set(currency, decodedCurrency);
                            }
                        }
                        if (tx.tx.TakerPays && typeof tx.tx.TakerPays !== "string" && tx.tx.TakerPays.currency) {
                            let currency = tx.tx.TakerPays.currency.toUpperCase();
                            if (!assetMap.has(currency)) {
                                let decodedCurrency = /^[0-9A-F]{40}$/.test(currency) ? xrpl.convertHexToString(currency).replace(/\0/g, '') || `[HEX:${currency.slice(0, 8)}...]` : currency;
                                if (decodedCurrency.startsWith('[HEX:')) {
                                    log(`Failed to decode TakerPays currency: ${currency}`);
                                }
                                assetMap.set(currency, decodedCurrency);
                            }
                        }

                        if (tx.tx.TransactionType === "TrustSet") {
                            
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: "0", 
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "Payment" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            const isXrp = typeof tx.meta.delivered_amount === "string";
                            let deliveredValueStr = "0", deliveredCurrency = "XRP", deliveredIssuer = null;

                            if (isXrp) {
                                deliveredValueStr = xrpl.dropsToXrp(tx.meta.delivered_amount) || "0";
                            } else if (tx.meta.delivered_amount && tx.meta.delivered_amount.value) {
                                deliveredValueStr = tx.meta.delivered_amount.value || "0";
                                deliveredCurrency = assetMap.get(tx.meta.delivered_amount.currency?.toUpperCase()) || `[HEX:${tx.meta.delivered_amount.currency?.slice(0, 8) || 'unknown'}...]`;
                                deliveredIssuer = tx.meta.delivered_amount.issuer || null;
                            } else {
                                log(`Payment tx ${tx.tx.hash} missing valid delivered_amount: ${JSON.stringify(tx.meta.delivered_amount)}`);
                            }

                            const deliveredValue = new Decimal(formatIOUAmount(deliveredValueStr));
                            const key = deliveredCurrency;
                            if (!assetFlow.has(key)) assetFlow.set(key, { in: new Decimal(0), out: new Decimal(0), issuer: deliveredIssuer });
                            if (!assetBalances.has(key)) assetBalances.set(key, new Decimal(0));

                            if (tx.tx.Account === address && tx.tx.Destination !== address) {
                                
                                if (isXrp) {
                                    xrpFlow.out = xrpFlow.out.plus(deliveredValue);
                                    let currentXrpBalance = assetBalances.get("XRP");
                                    currentXrpBalance = currentXrpBalance.minus(deliveredValue);
                                    assetBalances.set("XRP", currentXrpBalance);
                                    if (currentXrpBalance.lt(0)) {
                                        log(`XRP balance went negative for tx ${tx.tx.hash}: ${currentXrpBalance}`);
                                    }
                                } else {
                                    
                                    let currentBalance = assetBalances.get(key);
                                    if (currentBalance.gte(deliveredValue)) {
                                        assetFlow.get(key).out = assetFlow.get(key).out.plus(deliveredValue);
                                        currentBalance = currentBalance.minus(deliveredValue);
                                        assetBalances.set(key, currentBalance);
                                    } else {
                                        log(`Insufficient balance for ${key} to send ${deliveredValue} in tx ${tx.tx.hash}. Current balance: ${currentBalance}`);
                                    }
                                }
                            } else if (tx.tx.Destination === address && tx.tx.Account !== address) {
                                
                                if (isXrp) {
                                    xrpFlow.in = xrpFlow.in.plus(deliveredValue);
                                    let currentXrpBalance = assetBalances.get("XRP");
                                    currentXrpBalance = currentXrpBalance.plus(deliveredValue);
                                    assetBalances.set("XRP", currentXrpBalance);
                                } else {
                                    assetFlow.get(key).in = assetFlow.get(key).in.plus(deliveredValue);
                                    let currentBalance = assetBalances.get(key);
                                    currentBalance = currentBalance.plus(deliveredValue);
                                    assetBalances.set(key, currentBalance);
                                }
                            } else if (tx.tx.Account === address && tx.tx.Destination === address && tx.tx.SendMax) {
                                
                                isAmmSwap = true;
                                const sendIsXrp = typeof tx.tx.SendMax === "string";
                                const sendValueStr = sendIsXrp ? xrpl.dropsToXrp(tx.tx.SendMax) || "0" : tx.tx.SendMax?.value || "0";
                                const sendValue = new Decimal(formatIOUAmount(sendValueStr));
                                const sendCurrency = sendIsXrp ? "XRP" : (assetMap.get(tx.tx.SendMax?.currency?.toUpperCase()) || `[HEX:${tx.tx.SendMax?.currency?.slice(0, 8) || 'unknown'}...]`);
                                const sendIssuer = sendIsXrp ? null : tx.tx.SendMax?.issuer || null;
                                const sendKey = sendCurrency;

                                if (!assetFlow.has(sendKey)) assetFlow.set(sendKey, { in: new Decimal(0), out: new Decimal(0), issuer: sendIssuer });
                                if (!assetBalances.has(sendKey)) assetBalances.set(sendKey, new Decimal(0));

                                
                                if (sendIsXrp) {
                                    let currentXrpBalance = assetBalances.get("XRP");
                                    if (currentXrpBalance.gte(sendValue)) {
                                        xrpFlow.out = xrpFlow.out.plus(sendValue);
                                        currentXrpBalance = currentXrpBalance.minus(sendValue);
                                        assetBalances.set("XRP", currentXrpBalance);
                                    } else {
                                        log(`Insufficient XRP balance to send ${sendValue} in tx ${tx.tx.hash}. Current balance: ${currentXrpBalance}`);
                                    }
                                } else {
                                    let currentBalance = assetBalances.get(sendKey);
                                    if (currentBalance.gte(sendValue)) {
                                        assetFlow.get(sendKey).out = assetFlow.get(sendKey).out.plus(sendValue);
                                        currentBalance = currentBalance.minus(sendValue);
                                        assetBalances.set(sendKey, currentBalance);
                                    } else {
                                        log(`Insufficient balance for ${sendKey} to send ${sendValue} in tx ${tx.tx.hash}. Current balance: ${currentBalance}`);
                                    }
                                }

                                
                                if (isXrp) {
                                    xrpFlow.in = xrpFlow.in.plus(deliveredValue);
                                    let currentXrpBalance = assetBalances.get("XRP");
                                    currentXrpBalance = currentXrpBalance.plus(deliveredValue);
                                    assetBalances.set("XRP", currentXrpBalance);
                                } else {
                                    assetFlow.get(key).in = assetFlow.get(key).in.plus(deliveredValue);
                                    let currentBalance = assetBalances.get(key);
                                    currentBalance = currentBalance.plus(deliveredValue);
                                    assetBalances.set(key, currentBalance);
                                }
                            }

                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.meta.delivered_amount ? (typeof tx.meta.delivered_amount === "string" ? xrpl.dropsToXrp(tx.meta.delivered_amount) : `${new Decimal(tx.meta.delivered_amount.value || 0).toFixed(6)} ${assetMap.get(tx.meta.delivered_amount.currency?.toUpperCase()) || tx.meta.delivered_amount.currency || 'unknown'}`) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: tx.tx.SendMax ? (typeof tx.tx.SendMax === "string" ? xrpl.dropsToXrp(tx.tx.SendMax) : `${new Decimal(tx.tx.SendMax.value || 0).toFixed(6)} ${assetMap.get(tx.tx.SendMax.currency?.toUpperCase()) || tx.tx.SendMax.currency || 'unknown'}`) : null,
                                fee: fee.toFixed(6),
                                takerGets: tx.tx.TakerGets ? (typeof tx.tx.TakerGets === "string" ? xrpl.dropsToXrp(tx.tx.TakerGets) : `${new Decimal(tx.tx.TakerGets.value || 0).toFixed(6)} ${assetMap.get(tx.tx.TakerGets.currency?.toUpperCase()) || tx.tx.TakerGets.currency || 'unknown'}`) : null,
                                takerPays: tx.tx.TakerPays ? (typeof tx.tx.TakerPays === "string" ? xrpl.dropsToXrp(tx.tx.TakerPays) : `${new Decimal(tx.tx.TakerPays.value || 0).toFixed(6)} ${assetMap.get(tx.tx.TakerPays.currency?.toUpperCase()) || tx.tx.TakerPays.currency || 'unknown'}`) : null,
                                takerGetsIssuer: tx.tx.TakerGets && typeof tx.tx.TakerGets !== "string" ? tx.tx.TakerGets.issuer || null : null,
                                takerPaysIssuer: tx.tx.TakerPays && typeof tx.tx.TakerPays !== "string" ? tx.tx.TakerPays.issuer || null : null,
                                isAmmSwap: isAmmSwap
                            });
                        } else if (tx.tx.TransactionType === "OfferCreate" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            let getsCurrency = "XRP", getsIssuer = null, getsValueStr = "0";
                            let paysCurrency = "XRP", paysIssuer = null, paysValueStr = "0";

                            
                            if (typeof tx.tx.TakerGets === "string") {
                                getsValueStr = xrpl.dropsToXrp(tx.tx.TakerGets) || "0";
                            } else if (tx.tx.TakerGets && tx.tx.TakerGets.value) {
                                getsValueStr = tx.tx.TakerGets.value || "0";
                                getsCurrency = assetMap.get(tx.tx.TakerGets.currency?.toUpperCase()) || `[HEX:${tx.tx.TakerGets.currency?.slice(0, 8) || 'unknown'}...]`;
                                getsIssuer = tx.tx.TakerGets.issuer || null;
                            } else {
                                log(`OfferCreate tx ${tx.tx.hash} missing valid TakerGets: ${JSON.stringify(tx.tx.TakerGets)}`);
                                return;
                            }

                            if (typeof tx.tx.TakerPays === "string") {
                                paysValueStr = xrpl.dropsToXrp(tx.tx.TakerPays) || "0";
                            } else if (tx.tx.TakerPays && tx.tx.TakerPays.value) {
                                paysValueStr = tx.tx.TakerPays.value || "0";
                                paysCurrency = assetMap.get(tx.tx.TakerPays.currency?.toUpperCase()) || `[HEX:${tx.tx.TakerPays.currency?.slice(0, 8) || 'unknown'}...]`;
                                paysIssuer = tx.tx.TakerPays.issuer || null;
                            } else {
                                log(`OfferCreate tx ${tx.tx.hash} missing valid TakerPays: ${JSON.stringify(tx.tx.TakerPays)}`);
                                return;
                            }

                            
                            let actualGetsValueStr = getsValueStr, actualPaysValueStr = paysValueStr;
                            if (tx.meta.delivered_amount) {
                                if (typeof tx.meta.delivered_amount === "string") {
                                    actualPaysValueStr = xrpl.dropsToXrp(tx.meta.delivered_amount) || "0";
                                    paysCurrency = "XRP";
                                    paysIssuer = null;
                                } else if (tx.meta.delivered_amount.value) {
                                    actualPaysValueStr = tx.meta.delivered_amount.value || "0";
                                    paysCurrency = assetMap.get(tx.meta.delivered_amount.currency?.toUpperCase()) || `[HEX:${tx.meta.delivered_amount.currency?.slice(0, 8) || 'unknown'}...]`;
                                    paysIssuer = tx.meta.delivered_amount.issuer || null;
                                }

                                if (new Decimal(paysValueStr).gt(0)) {
                                    const ratio = new Decimal(actualPaysValueStr).div(new Decimal(paysValueStr));
                                    actualGetsValueStr = new Decimal(getsValueStr).times(ratio).toFixed(6);
                                }
                            }

                            const getsValue = new Decimal(formatIOUAmount(getsValueStr));
                            const paysValue = new Decimal(formatIOUAmount(paysValueStr));
                            const actualGetsValue = new Decimal(formatIOUAmount(actualGetsValueStr));
                            const actualPaysValue = new Decimal(formatIOUAmount(actualPaysValueStr));

                            const getsKey = getsCurrency;
                            const paysKey = paysCurrency;

                            if (!assetFlow.has(getsKey)) assetFlow.set(getsKey, { in: new Decimal(0), out: new Decimal(0), issuer: getsIssuer });
                            if (!assetFlow.has(paysKey)) assetFlow.set(paysKey, { in: new Decimal(0), out: new Decimal(0), issuer: paysIssuer });
                            if (!assetBalances.has(getsKey)) assetBalances.set(getsKey, new Decimal(0));
                            if (!assetBalances.has(paysKey)) assetBalances.set(paysKey, new Decimal(0));

                            if (tx.tx.Account === address) {
                                
                                let getsBalance = assetBalances.get(getsKey);
                                if (getsBalance.gte(actualGetsValue)) {
                                    assetFlow.get(getsKey).out = assetFlow.get(getsKey).out.plus(actualGetsValue);
                                    getsBalance = getsBalance.minus(actualGetsValue);
                                    assetBalances.set(getsKey, getsBalance);
                                } else {
                                    log(`Insufficient balance for ${getsKey} to sell ${actualGetsValue} in tx ${tx.tx.hash}. Current balance: ${getsBalance}`);
                                }

                                let paysBalance = assetBalances.get(paysKey);
                                assetFlow.get(paysKey).in = assetFlow.get(paysKey).in.plus(actualPaysValue);
                                paysBalance = paysBalance.plus(actualPaysValue);
                                assetBalances.set(paysKey, paysBalance);
                            }

                            
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.meta.delivered_amount ? (typeof tx.meta.delivered_amount === "string" ? xrpl.dropsToXrp(tx.meta.delivered_amount) : `${new Decimal(tx.meta.delivered_amount.value || 0).toFixed(6)} ${assetMap.get(tx.meta.delivered_amount.currency?.toUpperCase()) || tx.meta.delivered_amount.currency || 'unknown'}`) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: tx.tx.SendMax ? (typeof tx.tx.SendMax === "string" ? xrpl.dropsToXrp(tx.tx.SendMax) : `${new Decimal(tx.tx.SendMax.value || 0).toFixed(6)} ${assetMap.get(tx.tx.SendMax.currency?.toUpperCase()) || tx.tx.SendMax.currency || 'unknown'}`) : null,
                                fee: fee.toFixed(6),
                                takerGets: tx.tx.TakerGets ? (typeof tx.tx.TakerGets === "string" ? actualGetsValue.toFixed(6) : `${actualGetsValue.toFixed(6)} ${assetMap.get(tx.tx.TakerGets.currency?.toUpperCase()) || tx.tx.TakerGets.currency || 'unknown'}`) : null,
                                takerPays: tx.tx.TakerPays ? (typeof tx.tx.TakerPays === "string" ? actualPaysValue.toFixed(6) : `${actualPaysValue.toFixed(6)} ${assetMap.get(tx.tx.TakerPays.currency?.toUpperCase()) || tx.tx.TakerPays.currency || 'unknown'}`) : null,
                                takerGetsIssuer: tx.tx.TakerGets && typeof tx.tx.TakerGets !== "string" ? tx.tx.TakerGets.issuer || null : null,
                                takerPaysIssuer: tx.tx.TakerPays && typeof tx.tx.TakerPays !== "string" ? tx.tx.TakerPays.issuer || null : null,
                                isAmmSwap: isAmmSwap
                            });
                        } else if (tx.tx.TransactionType === "OfferCancel" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "AccountSet" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "PaymentChannelCreate" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            if (tx.tx.Account === address && tx.tx.Amount) {
                                const amountStr = xrpl.dropsToXrp(tx.tx.Amount) || "0";
                                const amount = new Decimal(formatIOUAmount(amountStr));
                                let currentXrpBalance = assetBalances.get("XRP");
                                if (currentXrpBalance.gte(amount)) {
                                    xrpFlow.out = xrpFlow.out.plus(amount);
                                    currentXrpBalance = currentXrpBalance.minus(amount);
                                    assetBalances.set("XRP", currentXrpBalance);
                                } else {
                                    log(`Insufficient XRP balance to create payment channel with ${amount} in tx ${tx.tx.hash}. Current balance: ${currentXrpBalance}`);
                                }
                            }
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.tx.Amount ? xrpl.dropsToXrp(tx.tx.Amount) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "PaymentChannelClaim" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            if (tx.tx.Account === address && tx.tx.Amount) {
                                const amountStr = xrpl.dropsToXrp(tx.tx.Amount) || "0";
                                const amount = new Decimal(formatIOUAmount(amountStr));
                                let currentXrpBalance = assetBalances.get("XRP");
                                if (currentXrpBalance.gte(amount)) {
                                    xrpFlow.out = xrpFlow.out.plus(amount);
                                    currentXrpBalance = currentXrpBalance.minus(amount);
                                    assetBalances.set("XRP", currentXrpBalance);
                                } else {
                                    log(`Insufficient XRP balance to claim payment channel with ${amount} in tx ${tx.tx.hash}. Current balance: ${currentXrpBalance}`);
                                }
                            } else if (tx.tx.Destination === address && tx.tx.Amount) {
                                const amountStr = xrpl.dropsToXrp(tx.tx.Amount) || "0";
                                const amount = new Decimal(formatIOUAmount(amountStr));
                                xrpFlow.in = xrpFlow.in.plus(amount);
                                let currentXrpBalance = assetBalances.get("XRP");
                                currentXrpBalance = currentXrpBalance.plus(amount);
                                assetBalances.set("XRP", currentXrpBalance);
                            }
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.tx.Amount ? xrpl.dropsToXrp(tx.tx.Amount) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "EscrowCreate" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            if (tx.tx.Account === address && tx.tx.Amount) {
                                const amountStr = xrpl.dropsToXrp(tx.tx.Amount) || "0";
                                const amount = new Decimal(formatIOUAmount(amountStr));
                                let currentXrpBalance = assetBalances.get("XRP");
                                if (currentXrpBalance.gte(amount)) {
                                    xrpFlow.out = xrpFlow.out.plus(amount);
                                    currentXrpBalance = currentXrpBalance.minus(amount);
                                    assetBalances.set("XRP", currentXrpBalance);
                                } else {
                                    log(`Insufficient XRP balance to create escrow with ${amount} in tx ${tx.tx.hash}. Current balance: ${currentXrpBalance}`);
                                }
                            }
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.tx.Amount ? xrpl.dropsToXrp(tx.tx.Amount) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "EscrowFinish" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            if (tx.tx.Destination === address && tx.meta.delivered_amount) {
                                const amountStr = xrpl.dropsToXrp(tx.meta.delivered_amount) || "0";
                                const amount = new Decimal(formatIOUAmount(amountStr));
                                xrpFlow.in = xrpFlow.in.plus(amount);
                                let currentXrpBalance = assetBalances.get("XRP");
                                currentXrpBalance = currentXrpBalance.plus(amount);
                                assetBalances.set("XRP", currentXrpBalance);
                            }
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.meta.delivered_amount ? xrpl.dropsToXrp(tx.meta.delivered_amount) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        } else if (tx.tx.TransactionType === "EscrowCancel" && tx.meta?.TransactionResult === "tesSUCCESS") {
                            if (tx.tx.Account === address && tx.meta.delivered_amount) {
                                const amountStr = xrpl.dropsToXrp(tx.meta.delivered_amount) || "0";
                                const amount = new Decimal(formatIOUAmount(amountStr));
                                xrpFlow.in = xrpFlow.in.plus(amount);
                                let currentXrpBalance = assetBalances.get("XRP");
                                currentXrpBalance = currentXrpBalance.plus(amount);
                                assetBalances.set("XRP", currentXrpBalance);
                            }
                            recentTxs.push({
                                hash: tx.tx.hash || "unknown",
                                type: tx.tx.TransactionType || "Unknown",
                                from: tx.tx.Account || "unknown",
                                to: tx.tx.Destination || "unknown",
                                amount: tx.meta.delivered_amount ? xrpl.dropsToXrp(tx.meta.delivered_amount) : "0",
                                memo: tx.tx.Memos && tx.tx.Memos[0]?.Memo?.MemoData ? hexToDomain(tx.tx.Memos[0].Memo.MemoData) : "None",
                                date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : "Unknown",
                                sendMax: null,
                                fee: fee.toFixed(6),
                                takerGets: null,
                                takerPays: null,
                                takerGetsIssuer: null,
                                takerPaysIssuer: null,
                                isAmmSwap: false
                            });
                        }
                    } catch (txError) {
                        log(`Error processing transaction at index ${index}: ${txError.message}, Data: ${JSON.stringify(tx)}`);
                    }
                });

                txs = txs.concat(accountTx.result.transactions);
                totalFetched += accountTx.result.transactions.length;
                try {
                    if (txBox && txBox.querySelector('.content')) {
                        txBox.querySelector('.content').innerHTML = `
                            <p>Processing transactions... ${totalFetched} of ${targetTxs}</p>
                        `;
                    }
                    updateTransactionUI(txs, xrpFlow, assetFlow, recentTxs);
                    log(`Incremental update: ${totalFetched} txs fetched so far`);
                } catch (uiError) {
                    log(`UI update failed after pull ${pullNumber}: ${uiError.message}`);
                }

                marker = accountTx.result.marker;
                if (!marker || totalFetched >= targetTxs) break;

                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        } catch (txError) {
            log(`🚨 Transactions fetch failed: ${txError.message}`);
        } finally {
            
            isDeepDiveRunning = false;
            cancelDeepDive = false;
            if (deepDiveButton) deepDiveButton.disabled = false;
            if (stopButton) stopButton.disabled = true;
        }

        
        const coreBox = document.getElementById('deep-dive-core');
        const assetsBox = document.getElementById('deep-dive-assets');
        const txBox = document.getElementById('deep-dive-tx');

        if (coreBox) {
            coreBox.innerHTML = `
                <h4>Core Profile</h4>
                <p><strong>Address:</strong> <a href="https://xrpscan.com/account/${address}" class="address-link" target="_blank">${address}</a></p>
                <p><strong>Sequence:</strong> ${sequence}</p>
                <p><strong>Flags:</strong> ${flags.join(", ")}</p>
                <p><strong>Domain:</strong> ${domain}</p>
            `;
        } else {
            log(`Error: Could not find #deep-dive-core element`);
        }

        if (assetsBox && assetsBox.querySelector('.content')) {
            assetsBox.querySelector('.content').innerHTML = `
                <p><strong>Total IOUs Held:</strong> ${totalIOUs}</p>
                <p><strong>Active Trustlines:</strong> ${trustlines.length}</p>
                <ul>${trustlines.map(t => `<li>${t.currency}: ${new Decimal(t.balance).toFixed(6)} (Issuer: <a href="https://xrpscan.com/account/${t.issuer}" class="address-link" target="_blank">${t.issuer.slice(0, 10)}...</a>)</li>`).join('')}</ul>
                <p><strong>Closed Trustlines:</strong> ${closedTrustlines.length}</p>
                <ul>${closedTrustlines.map(t => `<li>${t.currency} (Issuer: <a href="https://xrpscan.com/account/${t.issuer}" class="address-link" target="_blank">${t.issuer.slice(0, 10)}...</a>)</li>`).join('')}</ul>
            `;
        } else {
            log(`Error: Could not find #deep-dive-assets or its .content element`);
        }

        if (txBox && txBox.querySelector('.content')) {
            updateTransactionUI(txs, xrpFlow, assetFlow, recentTxs);
        } else {
            log(`Error: Could not find #deep-dive-tx or its .content element`);
        }

        log(`🔍 Deep dive complete on ${address}`);
    } catch (error) {
        log(`🚨 Deep dive crashed: ${error.message}`);
    }
}




function updateTransactionUI(txs, xrpFlow, assetFlow, recentTxs) {
    const txBox = document.getElementById('deep-dive-tx');
    if (!txBox || !txBox.querySelector('.content')) {
        log(`Error: Could not find #deep-dive-tx or its .content element for update`);
        return;
    }

    if (!Array.isArray(txs)) txs = [];
    if (!Array.isArray(recentTxs)) {
        log('Error: recentTxs is not an array, resetting to empty array');
        recentTxs = [];
    }
    recentTxs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const xrpNet = xrpFlow.in.minus(xrpFlow.out).minus(xrpFlow.fees);
    const html = `
        <p><strong>Transaction Count:</strong> ${txs.length}</p>
        <p><strong>XRP Flow:</strong><br>
            Incoming: ${xrpFlow.in.toFixed(6)} XRP<br>
            Outgoing: ${xrpFlow.out.toFixed(6)} XRP<br>
            Fees: ${xrpFlow.fees.toFixed(6)} XRP<br>
            Net: ${xrpNet.toFixed(6)} XRP</p>
        <p><strong>Asset Flows:</strong></p>
        <ul>${Array.from(assetFlow.entries())
            .sort((a, b) => (b[1].in.plus(b[1].out)).minus((a[1].in.plus(a[1].out))))
            .map(([currency, flow]) => {
                const net = flow.in.minus(flow.out);
                return `<li>${currency}${flow.issuer ? ` (Issuer: <a href="https://xrpscan.com/account/${flow.issuer}" class="address-link" target="_blank">${flow.issuer.slice(0, 10)}...</a>)` : ''}: In: ${flow.in.toFixed(6)}, Out: ${flow.out.toFixed(6)}, Net: ${net.toFixed(6)}</li>`;
            }).join('')}</ul>
        <p><strong>Recent Transactions (Last 10):</strong></p>
        <ul>${recentTxs.slice(0, 10).map(t => `<li class="${t.type.toLowerCase().replace(/[^a-z]/g, '-') || 'unknown'}">${t.date} - ${t.type}${t.isAmmSwap ? ' (AMM Swap)' : ''}: ${t.amount} from <a href="https://xrpscan.com/account/${t.from}" class="address-link" target="_blank">${t.from.slice(0, 10)}...</a> to <a href="https://xrpscan.com/account/${t.to}" class="address-link" target="_blank">${t.to.slice(0, 10)}...</a> ${t.takerGets ? `(Gets: ${t.takerGets}${t.takerGetsIssuer ? ` (Issuer: <a href="https://xrpscan.com/account/${t.takerGetsIssuer}" class="address-link" target="_blank">${t.takerGetsIssuer.slice(0, 10)}...</a>)` : ''}, Pays: ${t.takerPays}${t.takerPaysIssuer ? ` (Issuer: <a href="https://xrpscan.com/account/${t.takerPaysIssuer}" class="address-link" target="_blank">${t.takerPaysIssuer.slice(0, 10)}...</a>)` : ''}) ` : t.sendMax ? `(Sent: ${t.sendMax}) ` : ''}(<a href="https://xrpscan.com/tx/${t.hash}" class="hash-link" target="_blank">Tx</a>) - Memo: ${t.memo}</li>`).join('')}</ul>
    `;
    txBox.querySelector('.content').innerHTML = html;
}

function stopDeepDive() {
    if (isDeepDiveRunning) {
        cancelDeepDive = true;
        log(`🛑 Deep dive cancellation requested...`);
    }
}

async function queueSetRegularKey() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-regular-key');

        if (!encryptedSeedInMemory) {
            log('Error: No wallet loaded. Load a wallet in the Wallet Management section.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }
        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid address. Load a valid wallet in the Wallet Management section.');
            errorElement.textContent = 'Invalid address.';
            return;
        }

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const regularKeyAddress = document.getElementById('regular-key-address').value.trim();

        if (regularKeyAddress && !xrpl.isValidAddress(regularKeyAddress)) {
            log('Error: Invalid regular key address.');
            errorElement.textContent = 'Invalid regular key address.';
            return;
        }

        const seed = await decryptSeedInMemory();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const tx = {
            TransactionType: "SetRegularKey",
            Account: address,
            Fee: TRANSACTION_FEE_DROPS
        };

        if (regularKeyAddress) {
            tx.RegularKey = regularKeyAddress;
        }

        const scheduleCheckbox = document.getElementById('schedule-tx-regular-key');
        const delayInput = document.getElementById('schedule-delay-regular-key');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling SetRegularKey transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: regularKeyAddress ? `Set Regular Key to ${regularKeyAddress}` : `Remove Regular Key`,
            delayMs: delayMs,
            type: "regularkey",
            queueElementId: "regular-key-queue"
        };

        transactionQueue.push(txEntry);
        log(`SetRegularKey transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`SetRegularKey queue error: ${error.message}`);
    }
}

async function fetchRegularKey() {
    try {
        await ensureConnected();
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-regular-key');

        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid XRPL address.');
            if (errorElement) errorElement.textContent = 'Invalid XRPL address.';
            return;
        }

        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        });

        const regularKey = accountInfo.result.account_data.RegularKey || "None";
        const currentRegularKeyDisplay = document.getElementById('current-regular-key');
        currentRegularKeyDisplay.textContent = `Current Regular Key: ${regularKey}`;
        log(`Current Regular Key for ${address}: ${regularKey}`);
    } catch (error) {
        log(`Error fetching Regular Key: ${error.message}`);
    }
}

async function queueSetSignerList() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-multisign');

        if (!encryptedSeedInMemory) {
            log('Error: No wallet loaded. Load a wallet in the Wallet Management section.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }
        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid address. Load a valid wallet in the Wallet Management section.');
            errorElement.textContent = 'Invalid address.';
            return;
        }

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const signerEntriesInput = document.getElementById('signer-entries').value.trim();
        const quorumInput = document.getElementById('quorum').value.trim();

        if (!signerEntriesInput || !quorumInput) {
            log('Error: Signer entries and quorum are required.');
            errorElement.textContent = 'Signer entries and quorum are required.';
            return;
        }

        const signerEntries = signerEntriesInput.split(',').map(entry => {
            const [signerAddress, weight] = entry.split(':');
            if (!xrpl.isValidAddress(signerAddress)) {
                throw new Error(`Invalid signer address: ${signerAddress}`);
            }
            const parsedWeight = parseInt(weight);
            if (isNaN(parsedWeight) || parsedWeight <= 0) {
                throw new Error(`Invalid weight for signer ${signerAddress}: ${weight}`);
            }
            return {
                SignerEntry: {
                    Account: signerAddress,
                    SignerWeight: parsedWeight
                }
            };
        });

        const quorum = parseInt(quorumInput);
        if (isNaN(quorum) || quorum <= 0) {
            log('Error: Invalid quorum value.');
            errorElement.textContent = 'Invalid quorum value.';
            return;
        }

        const totalWeight = signerEntries.reduce((sum, entry) => sum + entry.SignerEntry.SignerWeight, 0);
        if (quorum > totalWeight) {
            log('Error: Quorum exceeds total weight of signers.');
            errorElement.textContent = 'Quorum exceeds total weight of signers.';
            return;
        }

        const seed = await decryptSeedInMemory();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const { availableBalanceXrp } = await calculateAvailableBalance(address, 1);
        const transactionFeeXrp = xrpl.dropsToXrp(TRANSACTION_FEE_DROPS);
        const totalRequiredXrp = transactionFeeXrp;

        if (totalRequiredXrp > availableBalanceXrp) {
            log(`Error: Insufficient available balance to set SignerList. Available: ${formatBalance(availableBalanceXrp)} XRP, Required: ${formatBalance(totalRequiredXrp)} XRP (Fee: ${transactionFeeXrp} XRP).`);
            errorElement.textContent = `Insufficient available balance. Available: ${formatBalance(availableBalanceXrp)} XRP.`;
            return;
        }

        const tx = {
            TransactionType: "SignerListSet",
            Account: address,
            SignerQuorum: quorum,
            SignerEntries: signerEntries,
            Fee: TRANSACTION_FEE_DROPS
        };

        const scheduleCheckbox = document.getElementById('schedule-tx-multisign-set');
        const delayInput = document.getElementById('schedule-delay-multisign-set');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling SignerListSet transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Set SignerList with quorum ${quorum} and ${signerEntries.length} signers`,
            delayMs: delayMs,
            type: "signerlist",
            queueElementId: "multisign-queue"
        };

        transactionQueue.push(txEntry);
        log(`SignerListSet transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`SignerListSet queue error: ${error.message}`);
    }
}

async function fetchSignerList() {
    try {
        await ensureConnected();
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-multisign');

        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid XRPL address.');
            if (errorElement) errorElement.textContent = 'Invalid XRPL address.';
            return;
        }

        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        });

        const signerList = accountInfo.result.account_data.SignerList || [];
        const signerQuorum = accountInfo.result.account_data.SignerQuorum || 0;
        const currentSignerListDisplay = document.getElementById('current-signer-list');

        if (signerList && signerList.length > 0) {
            let signerDetails = signerList.map(entry => `Account: ${entry.SignerEntry.Account}, Weight: ${entry.SignerEntry.SignerWeight}`).join('<br>');
            currentSignerListDisplay.innerHTML = `Current Signer List (Quorum: ${signerQuorum}):<br>${signerDetails}`;
            log(`Current SignerList for ${address}: Quorum: ${signerQuorum}, Signers: ${signerList.length}`);
        } else {
            currentSignerListDisplay.textContent = 'Current Signer List: None';
            log(`No SignerList set for ${address}.`);
        }
    } catch (error) {
        log(`Error fetching SignerList: ${error.message}`);
    }
}

async function deriveEncryptionKey(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    return { key, salt };
}

async function encryptFileData(data, password) {
    if (!password) {
        return { data: JSON.stringify(data), isEncrypted: false };
    }
    const { key, salt } = await deriveEncryptionKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(JSON.stringify(data))
    );
    return {
        data: arrayBufferToBase64(encrypted),
        isEncrypted: true,
        iv: arrayBufferToBase64(iv),
        salt: arrayBufferToBase64(salt)
    };
}

async function decryptFileData(encryptedData, password) {
    if (!encryptedData.isEncrypted) {
        return JSON.parse(encryptedData.data);
    }
    if (!password) {
        throw new Error("Decryption password is required.");
    }
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: base64ToArrayBuffer(encryptedData.salt), iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    const decoder = new TextDecoder();
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToArrayBuffer(encryptedData.iv) },
        key,
        base64ToArrayBuffer(encryptedData.data)
    );
    return JSON.parse(decoder.decode(decrypted));
}

function arrayBufferToBase64(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    return btoa(String.fromCharCode(...uint8Array));
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

async function exportMultiSignTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-multisign');

        if (!encryptedSeedInMemory) {
            log('Error: No wallet loaded. Load a wallet in the Wallet Management section.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }
        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid address. Load a valid wallet in the Wallet Management section.');
            errorElement.textContent = 'Invalid address.';
            return;
        }

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const destination = document.getElementById('multisign-destination').value.trim();
        let amount = document.getElementById('multisign-amount').value.trim();
        const encryptPassword = document.getElementById('multisign-encrypt-password').value;

        if (!destination || !amount) {
            log('Error: Destination and amount are required.');
            errorElement.textContent = 'Destination and amount are required.';
            return;
        }

        if (!xrpl.isValidAddress(destination)) {
            log('Error: Invalid destination address.');
            errorElement.textContent = 'Invalid destination address.';
            return;
        }
        amount = formatIOUAmount(amount);
        if (amount === "0") {
            log('Error: Invalid amount.');
            errorElement.textContent = 'Invalid amount.';
            return;
        }

        await ensureConnected();
        const tx = {
            TransactionType: "Payment",
            Account: address,
            Destination: destination,
            Amount: xrpl.xrpToDrops(amount),
            Fee: TRANSACTION_FEE_DROPS,
            Signers: []
        };

        const prepared = await client.autofill(tx);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 300;

        const fileData = await encryptFileData(prepared, encryptPassword);
        const blob = new Blob([JSON.stringify(fileData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tx_multisign_${address.slice(0, 5)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        log('Transaction file exported successfully. Share this file with the signers.');

        const postEther = spawnEtherNoise(5);
        window.etherPostFlux = postEther;

        await resecureCache();
    } catch (error) {
        log(`Error exporting multi-sign transaction: ${error.message}`);
    }
}

function loadTransactionForSigning(type) {
    const fileInput = document.getElementById(`${type}-tx-file`);
    const fileNameDisplay = document.getElementById(`${type}-tx-file-name`);
    const file = fileInput.files[0];

    if (!file) {
        log('No transaction file selected.');
        fileNameDisplay.textContent = 'No file chosen';
        return;
    }

    fileNameDisplay.textContent = file.name;
    log(`Loaded transaction file: ${file.name}`);
}

async function signAndExportSignature(type) {
    try {
        const fileInput = document.getElementById(`${type}-tx-file`);
        const decryptPassword = document.getElementById(`${type}-decrypt-password`).value;
        const signerSeed = document.getElementById(`${type}-signer-seed`).value.trim();
        const errorElement = document.getElementById('address-error-multisign');

        if (!fileInput.files[0]) {
            log('Error: No transaction file loaded.');
            errorElement.textContent = 'No transaction file loaded.';
            return;
        }
        if (!signerSeed) {
            log('Error: Signer seed is required.');
            errorElement.textContent = 'Signer seed is required.';
            return;
        }

        const signerWallet = xrpl.Wallet.fromSeed(signerSeed);
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const fileData = JSON.parse(e.target.result);
                const tx = await decryptFileData(fileData, decryptPassword);

                if (tx.TransactionType !== "Payment" || !tx.Account || !tx.Destination || !tx.Amount) {
                    log('Error: Invalid transaction format.');
                    errorElement.textContent = 'Invalid transaction format.';
                    return;
                }

                const signature = signerWallet.sign(tx).txnSignature;
                const signerEntry = {
                    Signer: {
                        Account: signerWallet.classicAddress,
                        TxnSignature: signature,
                        SigningPubKey: signerWallet.publicKey
                    }
                };

                const blob = new Blob([JSON.stringify(signerEntry)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `signature_${signerWallet.classicAddress.slice(0, 5)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                log('Signature exported successfully. Send this file back to the transaction initiator.');
            } catch (error) {
                log(`Error signing transaction: ${error.message}`);
                errorElement.textContent = error.message;
            }
        };
        reader.onerror = function() {
            log('Error reading transaction file.');
            errorElement.textContent = 'Error reading transaction file.';
        };
        reader.readAsText(fileInput.files[0]);
    } catch (error) {
        log(`Error signing transaction: ${error.message}`);
    }
}

function loadTransactionForCombining(type) {
    const fileInput = document.getElementById(`${type}-tx-file-combine`);
    const fileNameDisplay = document.getElementById(`${type}-tx-file-combine-name`);
    const file = fileInput.files[0];

    if (!file) {
        log('No transaction file selected for combining.');
        fileNameDisplay.textContent = 'No file chosen';
        return;
    }

    fileNameDisplay.textContent = file.name;
    log(`Loaded transaction file for combining: ${file.name}`);
}

function loadSignatures(type) {
    const fileInput = document.getElementById(`${type}-signatures${type === 'multisign' ? 's' : ''}-file`);
    const fileNameDisplay = document.getElementById(`${type}-signatures${type === 'multisign' ? 's' : ''}-file-name`);
    const files = fileInput.files;

    if (files.length === 0) {
        log('No signature files selected.');
        fileNameDisplay.textContent = 'No files chosen';
        return;
    }

    const fileNames = Array.from(files).map(file => file.name).join(', ');
    fileNameDisplay.textContent = fileNames;
    log(`Loaded signature files: ${fileNames}`);
}

async function combineAndSubmitMultiSignTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-multisign');

        if (!encryptedSeedInMemory) {
            log('Error: No wallet loaded. Load a wallet in the Wallet Management section.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }
        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid address. Load a valid wallet in the Wallet Management section.');
            errorElement.textContent = 'Invalid address.';
            return;
        }

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const txFileInput = document.getElementById('multisign-tx-file-combine');
        const signaturesFileInput = document.getElementById('multisign-signatures-file');
        const decryptPassword = document.getElementById('multisign-decrypt-password-combine').value;

        if (!txFileInput.files[0] || signaturesFileInput.files.length === 0) {
            log('Error: Transaction file and at least one signature file are required.');
            errorElement.textContent = 'Transaction file and at least one signature file are required.';
            return;
        }

        const txReader = new FileReader();
        const txPromise = new Promise((resolve, reject) => {
            txReader.onload = async function(e) {
                try {
                    const fileData = JSON.parse(e.target.result);
                    const tx = await decryptFileData(fileData, decryptPassword);
                    resolve(tx);
                } catch (error) {
                    reject(error);
                }
            };
            txReader.onerror = function() {
                reject(new Error('Error reading transaction file.'));
            };
            txReader.readAsText(txFileInput.files[0]);
        });

        const tx = await txPromise;

        if (tx.TransactionType !== "Payment" || !tx.Account || !tx.Destination || !tx.Amount) {
            log('Error: Invalid transaction format.');
            errorElement.textContent = 'Invalid transaction format.';
            return;
        }
        if (tx.Account !== address) {
            log('Error: Transaction account does not match the loaded wallet.');
            errorElement.textContent = 'Transaction account does not match the loaded wallet.';
            return;
        }

        await ensureConnected();
        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        });

        const signerList = accountInfo.result.account_data.SignerList || [];
        const signerQuorum = accountInfo.result.account_data.SignerQuorum || 0;

        if (signerList.length === 0) {
            log('Error: No SignerList set for this account.');
            errorElement.textContent = 'No SignerList set for this account.';
            return;
        }

        const signatureReaders = Array.from(signaturesFileInput.files).map(file => {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onload = function(e) {
                    try {
                        const signature = JSON.parse(e.target.result);
                        resolve(signature);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = function() {
                    reject(new Error(`Error reading signature file: ${file.name}`));
                };
                reader.readAsText(file);
            });
        });

        const signatures = await Promise.all(signatureReaders);

        let totalWeight = 0;
        const signerEntries = signatures.map(signature => {
            if (!signature.Signer || !signature.Signer.Account || !signature.Signer.TxnSignature || !signature.Signer.SigningPubKey) {
                throw new Error(`Invalid signature format in file: ${signature.Signer?.Account || 'unknown'}`);
            }
            const signerEntry = signerList.find(entry => entry.SignerEntry.Account === signature.Signer.Account);
            if (!signerEntry) {
                throw new Error(`Signer ${signature.Signer.Account} is not in the SignerList.`);
            }
            totalWeight += signerEntry.SignerEntry.SignerWeight;
            return signature;
        });

        if (totalWeight < signerQuorum) {
            log(`Error: Total weight (${totalWeight}) of provided signers does not meet the quorum (${signerQuorum}).`);
            errorElement.textContent = `Total weight (${totalWeight}) does not meet quorum (${signerQuorum}).`;
            return;
        }

        tx.Signers = signerEntries;

        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        const transactionFeeXrp = xrpl.dropsToXrp(TRANSACTION_FEE_DROPS);
        if (transactionFeeXrp > availableBalanceXrp) {
            log(`Error: Insufficient available balance to submit multi-sign transaction. Available: ${formatBalance(availableBalanceXrp)} XRP, Required: ${formatBalance(transactionFeeXrp)} XRP (Fee).`);
            errorElement.textContent = `Insufficient available balance. Available: ${formatBalance(availableBalanceXrp)} XRP.`;
            return;
        }

        const scheduleCheckbox = document.getElementById('schedule-tx-multisign-tx');
        const delayInput = document.getElementById('schedule-delay-multisign-tx');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling multi-sign transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: null,
            description: `Multi-sign Payment of ${xrpl.dropsToXrp(tx.Amount)} XRP to ${tx.Destination} with ${signerEntries.length} signers`,
            delayMs: delayMs,
            type: "multisign",
            queueElementId: "multisign-queue"
        };

        transactionQueue.push(txEntry);
        log(`Multi-sign transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Error combining and submitting multi-sign transaction: ${error.message}`);
    }
}

async function processSignerListSet(txEntry) {
    try {
        await ensureConnected();
        const { tx, wallet } = txEntry;

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const prepared = await client.autofill(tx);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 50;
        const signed = wallet.sign(prepared);
        log(`Submitting SignerListSet transaction...`);
        const result = await client.submitAndWait(signed.tx_blob);
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            log(`SignerListSet transaction succeeded: ${txEntry.description}`);
            await fetchSignerList();

            const postEther = spawnEtherNoise(5);
            window.etherPostFlux = postEther;

            await resecureCache();
        } else {
            log(`SignerListSet transaction failed: ${result.result.meta.TransactionResult}`);
            throw new Error(`SignerListSet failed: ${result.result.meta.TransactionResult}`);
        }
    } catch (error) {
        log(`SignerListSet error: ${error.message}`);
        throw error;
    }
}

async function processMultiSignTransaction(txEntry) {
    try {
        await ensureConnected();
        const { tx } = txEntry;

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const prepared = await client.autofill(tx);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 50;

        const txBlob = xrpl.encode(prepared);
        log(`Submitting transaction...`);
        const result = await client.submitAndWait(txBlob);
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            log(`Transaction succeeded: ${txEntry.description}`);
            log(`Transaction Hash: ${result.result.hash}`);

            const postEther = spawnEtherNoise(5);
            window.etherPostFlux = postEther;

            await resecureCache();
        } else {
            log(`Transaction failed: ${result.result.meta.TransactionResult}`);
            throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
        }
    } catch (error) {
        log(`Transaction error: ${error.message}`);
        throw error;
    }
}

function showMultiSignHelp() {
    const modal = document.getElementById('multiSignHelpModal');
    const helpContent = document.getElementById('multisign-help-content');
    const preconfigureResult = document.getElementById('preconfigure-result');
    const helpAddresses = document.getElementById('help-addresses');

    helpAddresses.value = '';
    preconfigureResult.textContent = '';

    helpContent.innerHTML = `
        <p><strong>Rippledeeznutz -Le Coupon?</strong></p>
    `;

    modal.style.display = 'flex';
}

function closeMultiSignHelp() {
    const modal = document.getElementById('multiSignHelpModal');
    const helpAddresses = document.getElementById('help-addresses');
    const preconfigureResult = document.getElementById('preconfigure-result');
    modal.style.display = 'none';
    helpAddresses.value = '';
    preconfigureResult.textContent = '';
}

function preconfigureSignerEntries() {
    const helpAddresses = document.getElementById('help-addresses').value.trim();
    const preconfigureResult = document.getElementById('preconfigure-result');

    if (!helpAddresses) {
        preconfigureResult.textContent = 'Please enter at least one address.';
        return;
    }

    const addresses = helpAddresses.split('\n').map(addr => addr.trim()).filter(addr => addr);

    const validAddresses = [];
    for (const addr of addresses) {
        if (xrpl.isValidAddress(addr)) {
            validAddresses.push(addr);
        } else {
            preconfigureResult.textContent = `Invalid address: ${addr}. All addresses must start with "r" and be valid XRPL addresses.`;
            return;
        }
    }

    if (validAddresses.length === 0) {
        preconfigureResult.textContent = 'No valid addresses provided.';
        return;
    }

    const weight = 1;
    const signerEntriesString = validAddresses.map(addr => `${addr}:${weight}`).join(',');

    const totalWeight = validAddresses.length * weight;
    const suggestedQuorum = Math.ceil(totalWeight / 2) + 1; 

    preconfigureResult.innerHTML = `
        <strong>Generated Signer Entries:</strong> <code>${signerEntriesString}</code><br>
        <strong>Suggested Quorum:</strong> ${suggestedQuorum}<br>
        <p>Copy the Signer Entries into the "Signer Entries" box above. This setup gives each person 1 vote, so the total votes are ${totalWeight}. The quorum of ${suggestedQuorum} means you need ${suggestedQuorum} votes to approve a transaction. For example, if you have 3 people, you need at least 2 to agree.</p>
    `;
}

async function loadUnencryptedWalletFile(event) {
    log('loadUnencryptedWalletFile: Starting');
    const file = event.target.files[0];
    if (!file) {
        log('No file selected.');
        return;
    }
    const fileNameDisplay = document.getElementById('unencryptedFileName');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
    }
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            log('Parsing unencrypted wallet file...');
            const data = JSON.parse(e.target.result);
            if (!data.seed || !data.address) {
                log('Error: Invalid unencrypted wallet file format. Expected seed and address.');
                return;
            }
            log(`Loaded wallet - Address: ${data.address}, Seed: ${data.seed.slice(0, 6)}...`);

            const seedBox = document.getElementById('seed');
            const addrBox = document.getElementById('address');
            seedBox.type = 'text';
            addrBox.type = 'password';
            seedBox.value = 'Seed Loaded (Not Displayed)';
            addrBox.value = data.address;
            globalAddress = data.address;

            log(`Pre-updateDisplayData: contentCache=${!!contentCache}, displayTimer=${!!displayTimer}`);
            try {
                await updateDisplayData(data.seed);
                log(`Post-updateDisplayData: contentCache=${!!contentCache}, displayTimer=${!!displayTimer}`);
            } catch (error) {
                log(`Error in updateDisplayData: ${error.message}`);
                return;
            }

            isWalletFreshlyCreated = false;
            log('Wallet loaded from unencrypted file');

            const alertPanel = document.getElementById('wallet-warning');
            if (alertPanel) {
                alertPanel.innerHTML = `
                    <h3>Wallet Loaded (Unencrypted)</h3>
                    <p>Your wallet has been loaded from an unencrypted file. The address is displayed above.</p>
                    <p>Click below to view the address QR code (safe to share for funding):</p>
                    <div class="qr-buttons">
                        <button class="green-btn" onclick="showQRCode('address', '${data.address}')">Show Address QR Code</button>
                    </div>
                    <p>Save it encrypted for security:</p>
                    <button class="red-black-btn" onclick="saveWalletFile()">Save Wallet</button>
                    <p>Connecting to the server and checking balance...</p>
                `;
                alertPanel.style.display = 'block';
            }

            await connectWebSocket();
            await checkBalance();

            
            data.seed = crypto.getRandomValues(new Uint8Array(32));
            data.seed = crypto.getRandomValues(new Uint8Array(32));
            data.seed = crypto.getRandomValues(new Uint8Array(32));
            data = null;
        } catch (error) {
            log(`Error loading unencrypted wallet: ${error.message}`);
        }
    };
    reader.onerror = function() {
        log('Error reading unencrypted wallet file.');
    };
    reader.readAsText(file);
}
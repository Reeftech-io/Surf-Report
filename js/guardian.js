let watchedAssets = [];
let isMonitoringPrices = false;
let guardianPoolState = {
    currentPrice: null,
    startingPrice: null,
    lastPriceCheckTimestamp: null,
    asset1: null,
    asset2: null,
    asset1Hex: null,
    asset2Hex: null,
    asset1Issuer: null,
    asset2Issuer: null
};

async function validateBalancesForTransaction(address, asset, amount, isToken, transactionCount = 1) {
    const { availableBalanceXrp } = await calculateAvailableBalance(address);
    const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
    const totalFeeXrp = transactionFeeXrp * transactionCount;

    if (totalFeeXrp > availableBalanceXrp) {
        throw new Error(`Insufficient XRP for fees. Required: ${formatBalance(totalFeeXrp)} XRP. Available: ${formatBalance(availableBalanceXrp)} XRP.`);
    }

    if (isToken) {
        const accountLines = await client.request({
            command: "account_lines",
            account: address,
            ledger_index: "current"
        });
        const senderLine = accountLines.result.lines.find(line => line.currency === asset.hex && line.account === asset.issuer);
        if (!senderLine || parseFloat(senderLine.balance) < amount) {
            throw new Error(`Insufficient ${asset.name} balance. Required: ${amount}. Available: ${senderLine ? senderLine.balance : 0}.`);
        }
    } else {
        if (amount * transactionCount + totalFeeXrp > availableBalanceXrp) {
            throw new Error(`Insufficient XRP balance. Required: ${formatBalance(amount * transactionCount + totalFeeXrp)} XRP. Available: ${formatBalance(availableBalanceXrp)} XRP.`);
        }
    }
}

function logGuardian(message) {
    log(`[Guardian] ${message}`);
}

function logGuardianOutput(message) {
    const output = document.getElementById('guardian-output');
    if (output) {
        const timestamp = new Date().toLocaleString();
        const logMessage = `[${timestamp}] ${message}`;
        const p = document.createElement('p');
        p.textContent = logMessage;
        output.appendChild(p);
        output.scrollTop = output.scrollHeight;
    }
}

async function guardianCheckPoolPrice() {
    const address = globalAddress;
    const errorElement = document.getElementById('guardian-error');
    const poolInfo = document.getElementById('guardian-pool-info');
    const asset1Display = document.getElementById('guardian-asset1-display');
    const asset2Display = document.getElementById('guardian-asset2-display');

    if (!asset1Display || !asset2Display || !poolInfo || !errorElement) {
        logGuardianOutput('Critical error: Guardian UI elements not found.');
        errorElement.textContent = 'Guardian elements missing.';
        return;
    }

    const asset1 = asset1Display.getAttribute('data-value');
    const asset2 = asset2Display.getAttribute('data-value');
    const asset1Hex = asset1Display.getAttribute('data-hex');
    const asset2Hex = asset2Display.getAttribute('data-hex');
    const asset1Issuer = asset1Display.getAttribute('data-issuer');
    const asset2Issuer = asset2Display.getAttribute('data-issuer');

    if (!asset1 || !asset2 || !asset1Hex || !asset2Hex) {
        logGuardianOutput('Error: Asset pair not selected.');
        errorElement.textContent = 'Select both assets.';
        return;
    }

    if (!contentCache || !displayTimer) {
        logGuardianOutput('Error: No wallet loaded.');
        errorElement.textContent = 'No wallet loaded.';
        return;
    }

    if (!xrpl.isValidAddress(address)) {
        logGuardianOutput('Error: Invalid wallet address.');
        errorElement.textContent = 'Invalid address.';
        return;
    }

    try {
        await ensureConnected();
        const asset1Data = asset1 === "XRP" ? { currency: "XRP" } : { currency: asset1Hex, issuer: asset1Issuer };
        const asset2Data = asset2 === "XRP" ? { currency: "XRP" } : { currency: asset2Hex, issuer: asset2Issuer };

        const ammInfo = await throttleRequest(() =>
            client.request({
                command: "amm_info",
                asset: asset1Data,
                asset2: asset2Data,
                ledger_index: "current"
            })
        );

        if (!ammInfo.result.amm) {
            logGuardianOutput(`No AMM pool found for pair ${asset1}/${asset2}.`);
            errorElement.textContent = 'No AMM pool found for this pair.';
            poolInfo.innerHTML = '<p>Current Price: -</p><p>Starting Price: -</p>';
            guardianPoolState = {
                currentPrice: null,
                startingPrice: null,
                lastPriceCheckTimestamp: null,
                asset1: null,
                asset2: null,
                asset1Hex: null,
                asset2Hex: null,
                asset1Issuer: null,
                asset2Issuer: null
            };
            return;
        }

        const amount1 = ammInfo.result.amm.amount;
        const amount2 = ammInfo.result.amm.amount2;
        let poolAsset1 = parseFloat(asset1 === "XRP" ? xrpl.dropsToXrp(amount1) : amount1.value);
        let poolAsset2 = parseFloat(asset2 === "XRP" ? xrpl.dropsToXrp(amount2) : amount2.value);

        let integerDigits = Math.floor(poolAsset1).toString().replace(/^0+/, '') || '0';
        let maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        poolAsset1 = Number(poolAsset1.toFixed(maxDecimalPlaces));

        integerDigits = Math.floor(poolAsset2).toString().replace(/^0+/, '') || '0';
        maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        poolAsset2 = Number(poolAsset2.toFixed(maxDecimalPlaces));

        const currentPrice = poolAsset2 / poolAsset1;

        integerDigits = Math.floor(currentPrice).toString().replace(/^0+/, '') || '0';
        maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        const truncatedCurrentPrice = Number(currentPrice.toFixed(maxDecimalPlaces));

        guardianPoolState = {
            currentPrice: truncatedCurrentPrice,
            startingPrice: guardianPoolState.startingPrice || null,
            lastPriceCheckTimestamp: Date.now(),
            asset1,
            asset2,
            asset1Hex,
            asset2Hex,
            asset1Issuer,
            asset2Issuer
        };

        poolInfo.innerHTML = `
            <p>Current Price: 1 ${asset1} = ${truncatedCurrentPrice.toFixed(6)} ${asset2}</p>
            <p>Starting Price: ${guardianPoolState.startingPrice ? guardianPoolState.startingPrice.toFixed(6) : '-'}</p>
        `;
        errorElement.textContent = '';
        logGuardianOutput(`Pool price checked for ${asset1}/${asset2}: 1 ${asset1} = ${truncatedCurrentPrice.toFixed(6)} ${asset2}`);

        if (!guardianPoolState.startingPrice) {
            guardianPoolState.startingPrice = truncatedCurrentPrice;
            poolInfo.innerHTML = `
                <p>Current Price: 1 ${asset1} = ${truncatedCurrentPrice.toFixed(6)} ${asset2}</p>
                <p>Starting Price: ${guardianPoolState.startingPrice.toFixed(6)}</p>
            `;
            logGuardianOutput(`Starting price set for ${asset1}/${asset2}: ${guardianPoolState.startingPrice.toFixed(6)} ${asset2} per ${asset1}`);
        }
    } catch (error) {
        logGuardianOutput(`Error checking pool price for ${asset1}/${asset2}: ${error.message}`);
        errorElement.textContent = error.message.includes("ammNotFound") ? "No AMM pool found." : `Error: ${error.message}`;
        poolInfo.innerHTML = '<p>Current Price: -</p><p>Starting Price: -</p>';
        guardianPoolState = {
            currentPrice: null,
            startingPrice: null,
            lastPriceCheckTimestamp: null,
            asset1: null,
            asset2: null,
            asset1Hex: null,
            asset2Hex: null,
            asset1Issuer: null,
            asset2Issuer: null
        };
    }
}

function updateGuardianPriceDisplay() {
    const slider = document.getElementById('guardian-price-slider');
    const display = document.getElementById('guardian-price-percentage');
    if (slider && display) {
        const value = parseFloat(slider.value);
        const truncatedValue = Number(value.toFixed(2));
        display.textContent = `${truncatedValue.toFixed(2)}%`;
    } else {
        logGuardianOutput('Error: Price slider or display element not found.');
    }
}

function updateGuardianBalanceDisplay() {
    const slider = document.getElementById('guardian-balance-slider');
    const display = document.getElementById('guardian-balance-percentage');
    if (slider && display) {
        const value = parseFloat(slider.value);
        const truncatedValue = Number(value.toFixed(2));
        display.textContent = `${truncatedValue.toFixed(2)}%`;
    } else {
        logGuardianOutput('Error: Balance slider or display element not found.');
    }
}

function updateGuardianSlippageDisplay() {
    const slider = document.getElementById('guardian-slippage-slider');
    const display = document.getElementById('guardian-slippage-percentage');
    if (slider && display) {
        const value = parseFloat(slider.value);
        const truncatedValue = Number(value.toFixed(2));
        display.textContent = `${truncatedValue.toFixed(2)}%`;
    } else {
        logGuardianOutput('Error: Slippage slider or display element not found.');
    }
}

async function addGuardianRule() {
    const errorElement = document.getElementById('guardian-error');
    const asset1Display = document.getElementById('guardian-asset1-display');
    const asset2Display = document.getElementById('guardian-asset2-display');
    const priceSlider = document.getElementById('guardian-price-slider');
    const balanceSlider = document.getElementById('guardian-balance-slider');
    const slippageSlider = document.getElementById('guardian-slippage-slider');

    if (!asset1Display || !asset2Display || !priceSlider || !balanceSlider || !slippageSlider || !errorElement) {
        logGuardianOutput('Critical error: Guardian input elements not found.');
        errorElement.textContent = 'Guardian elements missing.';
        return;
    }

    let asset1 = asset1Display.getAttribute('data-value');
    let asset2 = asset2Display.getAttribute('data-value');
    let asset1Hex = asset1Display.getAttribute('data-hex');
    let asset2Hex = asset2Display.getAttribute('data-hex');
    let asset1Issuer = asset1Display.getAttribute('data-issuer');
    let asset2Issuer = asset2Display.getAttribute('data-issuer');
    const priceChangePercent = parseFloat(priceSlider.value);
    const balancePercent = parseFloat(balanceSlider.value);
    const slippagePercent = parseFloat(slippageSlider.value);

    if (!asset1 || !asset2 || !asset1Hex || !asset2Hex) {
        logGuardianOutput('Error: Asset pair not selected.');
        errorElement.textContent = 'Select both assets.';
        return;
    }

    if (!guardianPoolState.startingPrice) {
        logGuardianOutput('Error: Starting price not set. Check pool price first.');
        errorElement.textContent = 'Please get current price first.';
        return;
    }

    if (isNaN(priceChangePercent) || priceChangePercent < -10 || priceChangePercent > 10) {
        logGuardianOutput('Error: Invalid price change percentage (must be -10% to 10%).');
        errorElement.textContent = 'Price change must be between -10% and 10%.';
        return;
    }

    if (isNaN(balancePercent) || balancePercent <= 0 || balancePercent > 100) {
        logGuardianOutput('Error: Invalid balance percentage (must be 0% to 100%).');
        errorElement.textContent = 'Balance percentage must be between 0% and 100%.';
        return;
    }

    if (isNaN(slippagePercent) || slippagePercent < 0.1 || slippagePercent > 5) {
        logGuardianOutput('Error: Invalid slippage tolerance (must be 0.1% to 5%).');
        errorElement.textContent = 'Slippage tolerance must be between 0.1% and 5%.';
        return;
    }

    const address = globalAddress;
    if (!contentCache || !displayTimer || !xrpl.isValidAddress(address)) {
        logGuardianOutput('Error: No wallet loaded or invalid address.');
        errorElement.textContent = 'No wallet loaded or invalid address.';
        return;
    }

    try {
        await ensureConnected();
        let inputAsset, inputHex, inputIssuer, outputAsset, outputHex, outputIssuer, direction;
        let inputBalance;

        inputAsset = asset1;
        inputHex = asset1Hex;
        inputIssuer = asset1Issuer;
        outputAsset = asset2;
        outputHex = asset2Hex;
        outputIssuer = asset2Issuer;
        direction = `${asset1}-to-${asset2}`;

        if (inputAsset === "XRP") {
            const { availableBalanceXrp } = await calculateAvailableBalance(address);
            let integerDigits = Math.floor(availableBalanceXrp - 1).toString().replace(/^0+/, '') || '0';
            let maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
            inputBalance = Math.max(0, Number((availableBalanceXrp - 1).toFixed(maxDecimalPlaces)));
        } else {
            const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
            const trustline = accountLines.result.lines.find(line => line.currency === inputHex && line.account === inputIssuer);
            inputBalance = trustline ? parseFloat(Number(trustline.balance).toFixed(6)) : 0;
        }

        if (inputBalance <= 0) {
            logGuardianOutput(`Error: No available balance for ${inputAsset}.`);
            errorElement.textContent = `No balance available for ${inputAsset}.`;
            return;
        }

        const rule = {
            id: Date.now(),
            asset1,
            asset2,
            asset1Hex,
            asset2Hex,
            asset1Issuer,
            asset2Issuer,
            priceChangePercent,
            balancePercent,
            slippagePercent,
            startingPrice: guardianPoolState.startingPrice,
            inputAsset,
            inputHex,
            inputIssuer,
            outputAsset,
            outputHex,
            outputIssuer,
            inputBalance,
            direction
        };

        watchedAssets.push(rule);
        const actionType = priceChangePercent < 0 ? 'Stop Loss' : 'Take Profit';
        logGuardianOutput(`${actionType} rule added: Sell ${balancePercent}% of ${inputAsset} for ${outputAsset} on ${priceChangePercent.toFixed(2)}% price change in ${asset1}/${asset2} (Slippage: ${slippagePercent}%).`);
        updateWatchedAssetsDisplay();
        errorElement.textContent = '';

        priceSlider.value = 0;
        balanceSlider.value = 0;
        slippageSlider.value = 1;
        document.getElementById('guardian-price-percentage').textContent = '0.00%';
        document.getElementById('guardian-balance-percentage').textContent = '0%';
        document.getElementById('guardian-slippage-percentage').textContent = '1.00%';

        if (!isMonitoringPrices) {
            startPriceMonitoring();
        }
    } catch (error) {
        logGuardianOutput(`Error adding rule: ${error.message}`);
        errorElement.textContent = `Error: ${error.message}`;
    }
}

function updateWatchedAssetsDisplay() {
    const queueElement = document.getElementById('guardian-queue');
    if (!queueElement) return;

    queueElement.innerHTML = '<p>Watched Assets:</p>';
    if (watchedAssets.length === 0) {
        queueElement.innerHTML += '<p>No assets being watched.</p>';
    } else {
        watchedAssets.forEach((rule, index) => {
            const actionType = rule.priceChangePercent < 0 ? 'Stop Loss' : 'Take Profit';
            const description = `${index + 1}. ${actionType}: Sell ${rule.balancePercent}% of ${rule.inputAsset} for ${rule.outputAsset} on ${rule.priceChangePercent.toFixed(2)}% change in ${rule.asset1}/${rule.asset2} (Slippage: ${rule.slippagePercent}%, Starting Price: ${rule.startingPrice.toFixed(6)} ${rule.asset2} per ${rule.asset1})`;
            queueElement.innerHTML += `
                <p>
                    ${description}
                    <button class="red-black-btn" onclick="cancelGuardianRule(${rule.id})" style="margin-left: 10px; padding: 4px 8px; font-size: 0.7rem;">Cancel</button>
                </p>`;
        });
    }
}

function cancelGuardianRule(ruleId) {
    const rule = watchedAssets.find(r => r.id === ruleId);
    if (rule) {
        watchedAssets = watchedAssets.filter(r => r.id !== ruleId);
        const actionType = rule.priceChangePercent < 0 ? 'Stop Loss' : 'Take Profit';
        logGuardianOutput(`${actionType} rule cancelled: Sell ${rule.balancePercent}% of ${rule.inputAsset} for ${rule.outputAsset} on ${rule.priceChangePercent.toFixed(2)}% change in ${rule.asset1}/${rule.asset2}.`);
        updateWatchedAssetsDisplay();
    }
}

async function monitorPoolPrices() {
    if (isMonitoringPrices) return;
    isMonitoringPrices = true;

    try {
        while (watchedAssets.length > 0) {
            for (const rule of watchedAssets) {
                try {
                    const { asset1, asset2, asset1Hex, asset2Hex, asset1Issuer, asset2Issuer, direction } = rule;
                    const asset1Data = asset1 === "XRP" ? { currency: "XRP" } : { currency: asset1Hex, issuer: asset1Issuer };
                    const asset2Data = asset2 === "XRP" ? { currency: "XRP" } : { currency: asset2Hex, issuer: asset2Issuer };

                    const ammInfo = await throttleRequest(() =>
                        client.request({
                            command: "amm_info",
                            asset: asset1Data,
                            asset2: asset2Data,
                            ledger_index: "current"
                        })
                    );

                    if (!ammInfo.result.amm) {
                        logGuardianOutput(`No AMM pool found for ${asset1}/${asset2} during monitoring.`);
                        continue;
                    }

                    const amount1 = ammInfo.result.amm.amount;
                    const amount2 = ammInfo.result.amm.amount2;
                    let poolAsset1 = parseFloat(asset1 === "XRP" ? xrpl.dropsToXrp(amount1) : amount1.value);
                    let poolAsset2 = parseFloat(asset2 === "XRP" ? xrpl.dropsToXrp(amount2) : amount2.value);

                    let integerDigits = Math.floor(poolAsset1).toString().replace(/^0+/, '') || '0';
                    let maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
                    poolAsset1 = Number(poolAsset1.toFixed(maxDecimalPlaces));

                    integerDigits = Math.floor(poolAsset2).toString().replace(/^0+/, '') || '0';
                    maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
                    poolAsset2 = Number(poolAsset2.toFixed(maxDecimalPlaces));

                    const currentPrice = poolAsset2 / poolAsset1;

                    integerDigits = Math.floor(currentPrice).toString().replace(/^0+/, '') || '0';
                    maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
                    const truncatedCurrentPrice = Number(currentPrice.toFixed(maxDecimalPlaces));

                    const priceChange = ((truncatedCurrentPrice - rule.startingPrice) / rule.startingPrice) * 100;
                    logGuardianOutput(`Monitoring ${asset1}/${asset2}: Current: 1 ${asset1} = ${truncatedCurrentPrice.toFixed(6)} ${asset2}, Change: ${priceChange.toFixed(2)}% from starting ${rule.startingPrice.toFixed(6)}.`);

                    const priceChangePercent = rule.priceChangePercent;
                    if ((priceChangePercent < 0 && priceChange <= priceChangePercent) || (priceChangePercent > 0 && priceChange >= priceChangePercent)) {
                        const actionType = priceChangePercent < 0 ? 'Stop Loss' : 'Take Profit';
                        logGuardianOutput(`${actionType} triggered for ${asset1}/${asset2} at ${priceChange.toFixed(2)}%. Queuing swap...`);
                        await queueGuardianSwap(rule, truncatedCurrentPrice);
                        break;
                    }
                } catch (error) {
                    logGuardianOutput(`Error monitoring price for ${rule.asset1}/${rule.asset2}: ${error.message}`);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    } catch (error) {
        logGuardianOutput(`Critical error in price monitoring: ${error.message}`);
    } finally {
        isMonitoringPrices = false;
        logGuardianOutput('Price monitoring stopped.');
    }
}

async function queueGuardianSwap(rule, currentPrice) {
    try {
        const address = globalAddress;
        if (!contentCache || !displayTimer || !xrpl.isValidAddress(address)) {
            logGuardianOutput(`Swap failed for ${rule.asset1}/${rule.asset2}: No wallet loaded or invalid address.`);
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);

        const { inputAsset, inputHex, inputIssuer, outputAsset, outputHex, outputIssuer, balancePercent, slippagePercent, inputBalance } = rule;
        let amount = (balancePercent / 100) * inputBalance;
        if (amount <= 0) {
            logGuardianOutput(`Swap failed for ${rule.asset1}/${rule.asset2}: Invalid swap amount for ${inputAsset}.`);
            return;
        }

        let integerDigits = Math.floor(amount).toString().replace(/^0+/, '') || '0';
        let maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        const roundedAmount = Number(amount.toFixed(maxDecimalPlaces));

        const expectedOutput = roundedAmount * currentPrice;

        integerDigits = Math.floor(expectedOutput).toString().replace(/^0+/, '') || '0';
        maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        const roundedOutput = Number(expectedOutput.toFixed(maxDecimalPlaces));

        await validateBalancesForTransaction(address, { hex: inputHex, issuer: inputIssuer, name: inputAsset }, roundedAmount, inputAsset !== "XRP");

        const slippageMultiplier = 1 - (slippagePercent / 100);

        let minDeliveredAmountValue = roundedOutput * slippageMultiplier;
        integerDigits = Math.floor(minDeliveredAmountValue).toString().replace(/^0+/, '') || '0';
        maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        minDeliveredAmountValue = Number(minDeliveredAmountValue.toFixed(maxDecimalPlaces));

        const minDeliveredAmount = outputAsset === "XRP" ?
            xrpl.xrpToDrops(minDeliveredAmountValue) :
            { currency: outputHex, issuer: outputIssuer, value: minDeliveredAmountValue.toString() };

        let sendMaxValue = roundedAmount * (1 + (slippagePercent / 100));
        integerDigits = Math.floor(sendMaxValue).toString().replace(/^0+/, '') || '0';
        maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
        sendMaxValue = Number(sendMaxValue.toFixed(maxDecimalPlaces));

        const sendMax = inputAsset === "XRP" ?
            xrpl.xrpToDrops(sendMaxValue) :
            { currency: inputHex, issuer: inputIssuer, value: sendMaxValue.toString() };

        const tx = {
            TransactionType: "Payment",
            Account: address,
            Amount: minDeliveredAmount,
            Destination: address,
            SendMax: sendMax,
            Fee: TRANSACTION_FEE_DROPS,
            Flags: 0x80000000
        };

        const actionType = rule.priceChangePercent < 0 ? 'Stop Loss' : 'Take Profit';
        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `${actionType} Swap: Sell ${roundedAmount} ${inputAsset} for min ${minDeliveredAmountValue} ${outputAsset} (Slippage: ${slippagePercent}%)`,
            delayMs: 0,
            type: "guardian",
            queueElementId: "guardian-queue"
        };

        transactionQueue.push(txEntry);
        logGuardianOutput(`${actionType} swap queued: ${txEntry.description}`);
        watchedAssets = watchedAssets.filter(r => r.id !== rule.id);
        logGuardianOutput(`${actionType} rule fulfilled and removed: Sell ${rule.balancePercent}% of ${rule.inputAsset} for ${rule.outputAsset} on ${rule.priceChangePercent.toFixed(2)}% change in ${rule.asset1}/${rule.asset2}.`);
        updateWatchedAssetsDisplay();
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) {
            processTransactionQueue();
        }
    } catch (error) {
        logGuardianOutput(`Error queuing swap for ${rule.asset1}/${rule.asset2}: ${error.message}`);
    }
}

function startPriceMonitoring() {
    if (watchedAssets.length > 0 && !isMonitoringPrices) {
        logGuardianOutput('Starting price monitoring for watched assets.');
        monitorPoolPrices();
    }
}

function initializeGuardianDropdowns(attempt = 1) {
    const maxAttempts = 5;
    const guardianSection = document.getElementById('guardian-tools');
    if (!guardianSection || guardianSection.classList.contains('minimized')) {
        return;
    }

    if (!Array.isArray(prefabAssets) || !Array.isArray(dynamicAssets)) {
        if (attempt <= maxAttempts) {
            setTimeout(() => initializeGuardianDropdowns(attempt + 1), 500);
            return;
        } else {
            logGuardianOutput('Error: Failed to load assets after retries.');
            const errorElement = document.getElementById('guardian-error');
            if (errorElement) errorElement.textContent = 'Failed to load assets.';
            return;
        }
    }

    const prefabAssetsSafe = prefabAssets.filter(a => a.name && (a.hex || a.issuer) && !a.isLP);
    const dynamicAssetsSafe = dynamicAssets.filter(a => a.name && (a.hex || a.issuer) && !a.isLP);
    const assets = [
        { name: 'XRP', hex: 'XRP', issuer: '', isLP: false },
        ...prefabAssetsSafe,
        ...dynamicAssetsSafe
    ].sort((a, b) => a.name.localeCompare(b.name));

    if (assets.length === 0) {
        logGuardianOutput('Error: No assets available for selection.');
        const errorElement = document.getElementById('guardian-error');
        if (errorElement) errorElement.textContent = 'No assets available.';
        return;
    }

    const dropdowns = [
        {
            id: 'guardian-asset1-dropdown',
            gridId: 'guardian-asset1-grid',
            displayId: 'guardian-asset1-display',
            defaultValue: 'XRP'
        },
        {
            id: 'guardian-asset2-dropdown',
            gridId: 'guardian-asset2-grid',
            displayId: 'guardian-asset2-display',
            defaultValue: '$Xoge'
        }
    ];

    dropdowns.forEach(({ id, gridId, displayId, defaultValue }) => {
        const grid = document.getElementById(gridId);
        const display = document.getElementById(displayId);
        if (!grid || !display) {
            logGuardianOutput(`Error: Dropdown elements missing for ${gridId}/${displayId}.`);
            return;
        }

        grid.innerHTML = '';
        const gridContainer = document.createElement('div');
        gridContainer.className = 'asset-grid-container';

        const numColumns = 5;
        const assetsPerColumn = Math.ceil(assets.length / numColumns);
        const columns = [];
        for (let i = 0; i < assets.length; i += assetsPerColumn) {
            columns.push(assets.slice(i, i + assetsPerColumn));
        }

        if (!columns[0].some(asset => asset.name === 'XRP')) {
            columns[0] = [{ name: 'XRP', hex: 'XRP', issuer: '', isLP: false }, ...columns[0]];
        }

        columns.forEach(column => {
            const columnUl = document.createElement('ul');
            columnUl.className = 'asset-column';
            column.forEach(asset => {
                const li = document.createElement('li');
                li.className = 'asset-option';
                const ticker = asset.name.startsWith('$') ? asset.name : `$${asset.name}`;
                const iconSrc = asset.name === 'XRP' ? './icons/XRP.png' : `./icons/${ticker}-${asset.issuer}.png`;
                const img = document.createElement('img');
                img.src = iconSrc;
                img.alt = asset.name;
                img.className = 'asset-icon';
                img.onerror = () => {
                    img.src = './icons/XRP.png';
                };
                li.appendChild(img);
                li.appendChild(document.createTextNode(` ${asset.name}`));
                li.dataset.value = asset.name;
                li.dataset.hex = asset.hex || 'XRP';
                li.dataset.issuer = asset.issuer || '';
                li.dataset.isLp = asset.isLP || false;
                li.onclick = () => {
                    display.innerHTML = '';
                    const selectedImg = document.createElement('img');
                    selectedImg.src = iconSrc;
                    selectedImg.alt = asset.name;
                    selectedImg.className = 'asset-icon';
                    selectedImg.onerror = () => (selectedImg.src = './icons/XRP.png');
                    display.appendChild(selectedImg);
                    display.appendChild(document.createTextNode(` ${asset.name}`));
                    display.setAttribute('data-value', asset.name);
                    display.setAttribute('data-hex', asset.hex || 'XRP');
                    display.setAttribute('data-issuer', asset.issuer || '');
                    display.setAttribute('data-is-lp', asset.isLP || false);
                    const panel = document.getElementById(`${id}-panel`);
                    if (panel) panel.style.display = 'none';
                    updateGuardianAssetPair();
                    closeAllDropdowns();
                };
                columnUl.appendChild(li);
            });
            gridContainer.appendChild(columnUl);
        });
        grid.appendChild(gridContainer);

        const selectedAsset = assets.find(a => a.name === defaultValue) ||
                             (defaultValue === 'XRP' ? { name: 'XRP', hex: 'XRP', issuer: '', isLP: false } :
                             assets.find(a => a.name === '$Xoge') || { name: '$Xoge', hex: '586F676500000000000000000000000000000000', issuer: 'rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1', isLP: false });
        display.innerHTML = '';
        const ticker = selectedAsset.name.startsWith('$') ? selectedAsset.name : `$${selectedAsset.name}`;
        const iconSrc = selectedAsset.name === 'XRP' ? './icons/XRP.png' : `./icons/${ticker}-${selectedAsset.issuer}.png`;
        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = selectedAsset.name;
        img.className = 'asset-icon';
        img.onerror = () => (img.src = './icons/XRP.png');
        display.appendChild(img);
        display.appendChild(document.createTextNode(` ${selectedAsset.name}`));
        display.setAttribute('data-value', selectedAsset.name);
        display.setAttribute('data-hex', selectedAsset.hex || 'XRP');
        display.setAttribute('data-issuer', selectedAsset.issuer || '');
        display.setAttribute('data-is-lp', selectedAsset.isLP || false);
    });
}

function closeAllDropdowns() {
    const panels = document.querySelectorAll('.dropdown-panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });
}

function updateGuardianAssetPair() {
    const asset1Display = document.getElementById('guardian-asset1-display');
    const asset2Display = document.getElementById('guardian-asset2-display');
    const poolInfo = document.getElementById('guardian-pool-info');
    const errorElement = document.getElementById('guardian-error');

    if (!asset1Display || !asset2Display || !poolInfo || !errorElement) {
        logGuardianOutput('Error: Guardian asset display elements not found.');
        return;
    }

    const asset1 = asset1Display.getAttribute('data-value');
    const asset2 = asset2Display.getAttribute('data-value');

    if (asset1 && asset2 && asset1 === asset2) {
        const prefabAssetsSafe = Array.isArray(prefabAssets) ? prefabAssets.filter(a => a.name && (a.hex || a.issuer) && !a.isLP) : [];
        const dynamicAssetsSafe = Array.isArray(dynamicAssets) ? dynamicAssets.filter(a => a.name && (a.hex || a.issuer) && !a.isLP) : [];
        const assets = [
            { name: 'XRP', hex: 'XRP', issuer: '', isLP: false },
            ...prefabAssetsSafe,
            ...dynamicAssetsSafe
        ].sort((a, b) => a.name.localeCompare(b.name));

        const otherAsset = assets.find(a => a.name !== asset1 && a.name !== 'XRP') || { name: '$Xoge', hex: '586F676500000000000000000000000000000000', issuer: 'rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1', isLP: false };
        const ticker = otherAsset.name.startsWith('$') ? otherAsset.name : `$${otherAsset.name}`;
        const iconSrc = otherAsset.name === 'XRP' ? './icons/XRP.png' : `./icons/${ticker}-${otherAsset.issuer}.png`;
        asset2Display.innerHTML = '';
        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = otherAsset.name;
        img.className = 'asset-icon';
        img.onerror = () => (img.src = './icons/XRP.png');
        asset2Display.appendChild(img);
        asset2Display.appendChild(document.createTextNode(` ${otherAsset.name}`));
        asset2Display.setAttribute('data-value', otherAsset.name);
        asset2Display.setAttribute('data-hex', otherAsset.hex || '586F676500000000000000000000000000000000');
        asset2Display.setAttribute('data-issuer', otherAsset.issuer || 'rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1');
        asset2Display.setAttribute('data-is-lp', otherAsset.isLP || false);
    }

    poolInfo.innerHTML = `
        <p>Current Price: -</p>
        <p>Starting Price: -</p>
    `;
    errorElement.textContent = '';
    guardianPoolState = {
        currentPrice: null,
        startingPrice: null,
        lastPriceCheckTimestamp: null,
        asset1: null,
        asset2: null,
        asset1Hex: null,
        asset2Hex: null,
        asset1Issuer: null,
        asset2Issuer: null
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const guardianSection = document.getElementById('guardian-tools');
    if (guardianSection) {
        const header = guardianSection.querySelector('.section-header');
        if (header) {
            header.addEventListener('click', function() {
                if (!guardianSection.classList.contains('minimized')) {
                    setTimeout(() => {
                        initializeGuardianDropdowns();
                    }, 100);
                }
            });
        } else {
            logGuardianOutput('Warning: No section header found in guardian-tools.');
        }

        const navLink = document.querySelector('a[href="#guardian-tools"]');
        if (navLink) {
            navLink.addEventListener('click', function() {
                setTimeout(() => {
                    initializeGuardianDropdowns();
                }, 100);
            });
        } else {
            logGuardianOutput('Warning: No navigation link found for guardian-tools.');
        }

        if (!guardianSection.classList.contains('minimized')) {
            setTimeout(() => {
                initializeGuardianDropdowns();
            }, 500);
        }

        const priceSlider = document.getElementById('guardian-price-slider');
        const balanceSlider = document.getElementById('guardian-balance-slider');
        const slippageSlider = document.getElementById('guardian-slippage-slider');

        if (priceSlider) {
            priceSlider.addEventListener('input', updateGuardianPriceDisplay);
        } else {
            logGuardianOutput('Error: guardian-price-slider not found.');
        }

        if (balanceSlider) {
            balanceSlider.addEventListener('input', updateGuardianBalanceDisplay);
        } else {
            logGuardianOutput('Error: guardian-balance-slider not found.');
        }

        if (slippageSlider) {
            slippageSlider.addEventListener('input', updateGuardianSlippageDisplay);
        } else {
            logGuardianOutput('Error: guardian-slippage-slider not found.');
        }
    } else {
        logGuardianOutput('Error: Guardian section not found in DOM.');
    }
});
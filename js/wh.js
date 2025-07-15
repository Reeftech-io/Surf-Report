let transactionCount = 0;
const MAX_ENTRIES = 1000;

function loadMyAddress() {
    const addressInput = document.getElementById('history-address');
    const errorElement = document.getElementById('address-error-history');
    if (addressInput && globalAddress) {
        addressInput.value = globalAddress;
        errorElement.textContent = '';
        log('Loaded current wallet address.');
    } else {
        errorElement.textContent = 'No wallet address available.';
        log('Error: No globalAddress found.');
    }
}

async function fetchTransactionHistory() {
    const addressInput = document.getElementById('history-address');
    const errorElement = document.getElementById('address-error-history');
    const historyBox = document.getElementById('transaction-history');
    const feesSummary = document.getElementById('service-fees-summary');
    const totalBox = document.getElementById('transaction-total');
    const summaryBox = document.getElementById('account-summary');

    if (!addressInput || !errorElement || !historyBox || !feesSummary || !totalBox || !summaryBox) {
        log('Error: Wallet history elements not found.');
        return;
    }

    const address = addressInput.value.trim() || globalAddress;
    if (!xrpl.isValidAddress(address)) {
        errorElement.textContent = 'Invalid XRPL address.';
        log(`Invalid address: ${address}`);
        return;
    }

    errorElement.textContent = '';
    historyBox.innerHTML = '<p>Loading...</p>';
    transactionCount = 0; 

    try {
        await ensureConnected();
        const accountInfo = await client.request({
            command: "account_info",
            account: "ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt",
            ledger_index: "validated"
        });
        const currentBalance = xrpl.dropsToXrp(accountInfo.result.account_data.Balance);

        const response = await client.request({
            command: "account_tx",
            account: address,
            ledger_index_min: -1,
            ledger_index_max: -1,
            limit: MAX_ENTRIES,
            forward: false
        });

        const transactions = response.result.transactions || [];
        transactionCount = transactions.length;

        let totalFeesXrp = 0;
        let xamanFeesPaidXrp = 0;
        let ledgerFeesPaidXrp = 0;
        let totalToTargetXrp = 0;
        let totalToTargetAssets = {};
        let historyHtml = '';

        if (transactions.length === 0) {
            historyBox.innerHTML = '<p>No transactions found.</p>';
            feesSummary.innerHTML = '<p>Total Fees: 0 XRP (as of 10:49 PM PDT, 07/13/2025)</p>';
            totalBox.innerHTML = '<p>Total to ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt: 0 XRP</p>';
            summaryBox.innerHTML = `
                <h3>Account Summary</h3>
                <p><strong>Xaman Fees Paid:</strong> 0.0 XRP</p>
                <p><strong>Ledger Fees Paid:</strong> 0.001168 XRP</p>
                <p><strong>Current Balance of Service Fees Account:</strong> <a href="https://xrpscan.com/account/ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt" target="_blank" class="wallet-history-address-link">${formatBalance(currentBalance)} XRP</a></p>
            `;
            log(`No transactions for: ${address}`);
            return;
        }

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const transaction = tx.tx;
            const txType = transaction.TransactionType;
            let colorClass = 'tx-unclassified';
            let amountStr = 'N/A';
            let sender = transaction.Account || 'Unknown';
            let receiver = '';
            let shortSender = sender.slice(0, 8) + '...' + sender.slice(-8);
            let shortReceiver = '';
            let direction = '';
            let changeStr = '';
            let feeType = 'Ledger';
            let directionClass = '';
            let hasMemo = transaction.Memos?.[0]?.Memo?.MemoData;
            let memoStr = hasMemo ? `Memo: ${hexToString(transaction.Memos[0].Memo.MemoData)}.` : '';
            let mainSentence = '';
            let detailsHtml = hasMemo ? `<p class="wallet-history-details">${memoStr}</p>` : '';

            if (txType === 'Payment') {
                receiver = transaction.Destination || 'Unknown';
                shortReceiver = receiver.slice(0, 8) + '...' + receiver.slice(-8);
                if (typeof transaction.Amount === 'string') {
                    colorClass = 'tx-xrp';
                    amountStr = `${xrpl.dropsToXrp(transaction.Amount)} XRP`;
                } else {
                    colorClass = 'tx-asset';
                    const currency = xrpl.convertHexToString(transaction.Amount.currency).replace(/\0/g, '') || transaction.Amount.currency;
                    amountStr = `${transaction.Amount.value} ${currency}`;
                }
                direction = transaction.Destination === address ? 'IN' : 'OUT';
                directionClass = transaction.Destination === address ? 'wallet-history-direction-in' : 'wallet-history-direction-out';
                changeStr = transaction.Destination === address ? `+${amountStr}` : `-${amountStr}`;
                if (transaction.Destination === 'ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt') {
                    const amountValue = typeof transaction.Amount === 'string' ? parseFloat(xrpl.dropsToXrp(transaction.Amount)) : parseFloat(transaction.Amount.value);
                    if (typeof transaction.Amount === 'string') {
                        totalToTargetXrp += amountValue;
                    } else {
                        const currency = xrpl.convertHexToString(transaction.Amount.currency).replace(/\0/g, '') || transaction.Amount.currency;
                        totalToTargetAssets[currency] = (totalToTargetAssets[currency] || 0) + amountValue;
                    }
                    if (hasMemo && memoStr.includes('Xaman Service Fee')) {
                        xamanFeesPaidXrp += amountValue;
                        feeType = 'Xaman';
                    }
                }
                mainSentence = `<span class="wallet-history-entry-number">${transactions.length - i}.</span> <span class="${directionClass}">${direction}</span> ${changeStr} (<a href="https://xrpscan.com/tx/${transaction.hash}" target="_blank" class="wallet-history-hash-link">HASH</a>) FROM <a href="https://xrpscan.com/account/${sender}" target="_blank" class="wallet-history-address-link">${shortSender}</a> TO <a href="https://xrpscan.com/account/${receiver}" target="_blank" class="wallet-history-address-link">${shortReceiver}</a>.`;
            } else if (txType === 'TrustSet') {
                colorClass = 'tx-trustline';
                receiver = transaction.LimitAmount.issuer || 'Unknown';
                shortReceiver = receiver.slice(0, 8) + '...' + receiver.slice(-8);
                const currency = xrpl.convertHexToString(transaction.LimitAmount.currency).replace(/\0/g, '') || transaction.LimitAmount.currency;
                const limitValue = parseFloat(transaction.LimitAmount.value);
                const isClosing = limitValue === 0 && tx.meta.AffectedNodes.some(node => node.DeletedNode?.LedgerEntryType === 'RippleState');
                amountStr = isClosing ? 'closed trustline' : `set trustline to ${limitValue} ${currency}`;
                direction = 'OUT';
                directionClass = 'wallet-history-direction-out';
                mainSentence = `<span class="wallet-history-entry-number">${transactions.length - i}.</span> <span class="${directionClass}">${direction}</span> ${amountStr} (<a href="https://xrpscan.com/tx/${transaction.hash}" target="_blank" class="wallet-history-hash-link">HASH</a>) FROM <a href="https://xrpscan.com/account/${sender}" target="_blank" class="wallet-history-address-link">${shortSender}</a> TO <a href="https://xrpscan.com/account/${receiver}" target="_blank" class="wallet-history-address-link">${shortReceiver}</a>.`;
            } else if (txType === 'EscrowCreate' || txType === 'EscrowFinish') {
                colorClass = 'tx-escrow';
                receiver = transaction.Destination || 'Unknown';
                shortReceiver = receiver.slice(0, 8) + '...' + receiver.slice(-8);
                amountStr = `${xrpl.dropsToXrp(transaction.Amount)} XRP`;
                direction = transaction.Destination === address ? 'IN' : 'OUT';
                directionClass = transaction.Destination === address ? 'wallet-history-direction-in' : 'wallet-history-direction-out';
                changeStr = transaction.Destination === address ? `+${amountStr}` : `-${amountStr}`;
                if (transaction.Destination === 'ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt') {
                    totalToTargetXrp += parseFloat(xrpl.dropsToXrp(transaction.Amount));
                    if (hasMemo && memoStr.includes('Xaman Service Fee')) {
                        xamanFeesPaidXrp += parseFloat(xrpl.dropsToXrp(transaction.Amount));
                        feeType = 'Xaman';
                    }
                }
                mainSentence = `<span class="wallet-history-entry-number">${transactions.length - i}.</span> <span class="${directionClass}">${direction}</span> escrow ${changeStr} (<a href="https://xrpscan.com/tx/${transaction.hash}" target="_blank" class="wallet-history-hash-link">HASH</a>) FROM <a href="https://xrpscan.com/account/${sender}" target="_blank" class="wallet-history-address-link">${shortSender}</a> TO <a href="https://xrpscan.com/account/${receiver}" target="_blank" class="wallet-history-address-link">${shortReceiver}</a>.`;
            } else if (txType === 'AMMVote' || txType === 'AMMDeposit') {
                colorClass = 'tx-amm';
                if (txType === 'AMMVote') {
                    direction = 'IN';
                    directionClass = 'wallet-history-direction-in';
                    amountStr = 'AMM vote';
                    mainSentence = `<span class="wallet-history-entry-number">${transactions.length - i}.</span> <span class="${directionClass}">${direction}</span> ${amountStr} (<a href="https://xrpscan.com/tx/${transaction.hash}" target="_blank" class="wallet-history-hash-link">HASH</a>) FROM <a href="https://xrpscan.com/account/${sender}" target="_blank" class="wallet-history-address-link">${shortSender}</a>.`;
                } else { 
                    direction = 'OUT';
                    directionClass = 'wallet-history-direction-out';
                    const amount1 = transaction.Amount ? (typeof transaction.Amount === 'string' ? `${xrpl.dropsToXrp(transaction.Amount)} XRP` : `${transaction.Amount.value} ${xrpl.convertHexToString(transaction.Amount.currency).replace(/\0/g, '') || transaction.Amount.currency}`) : 'N/A';
                    const amount2 = transaction.Amount2 ? (typeof transaction.Amount2 === 'string' ? `${xrpl.dropsToXrp(transaction.Amount2)} XRP` : `${transaction.Amount2.value} ${xrpl.convertHexToString(transaction.Amount2.currency).replace(/\0/g, '') || transaction.Amount2.currency}`) : 'N/A';
                    amountStr = amount1 !== 'N/A' && amount2 !== 'N/A' ? `${amount1} and ${amount2}` : (amount1 !== 'N/A' ? amount1 : amount2);
                    const asset1 = transaction.Asset?.currency || 'XRP';
                    const asset2 = transaction.Asset2 ? (xrpl.convertHexToString(transaction.Asset2.currency).replace(/\0/g, '') || transaction.Asset2.currency) : 'Unknown';
                    receiver = `${asset1}/${asset2} pool`;
                    shortReceiver = receiver; 
                    mainSentence = `<span class="wallet-history-entry-number">${transactions.length - i}.</span> <span class="${directionClass}">${direction}</span> deposited ${amountStr} (<a href="https://xrpscan.com/tx/${transaction.hash}" target="_blank" class="wallet-history-hash-link">HASH</a>) FROM <a href="https://xrpscan.com/account/${sender}" target="_blank" class="wallet-history-address-link">${shortSender}</a> TO ${shortReceiver}.`;
                }
            } else if (txType === 'OfferCreate') {
                colorClass = 'tx-amm';
                const gets = typeof transaction.TakerGets === 'string' ? `${xrpl.dropsToXrp(transaction.TakerGets)} XRP` : `${transaction.TakerGets.value} ${xrpl.convertHexToString(transaction.TakerGets.currency).replace(/\0/g, '') || transaction.TakerGets.currency}`;
                const pays = typeof transaction.TakerPays === 'string' ? `${xrpl.dropsToXrp(transaction.TakerPays)} XRP` : `${transaction.TakerPays.value} ${xrpl.convertHexToString(transaction.TakerPays.currency).replace(/\0/g, '') || transaction.TakerPays.currency}`;
                amountStr = `${gets} for ${pays}`;
                const affectedNodes = tx.meta.AffectedNodes || [];
                const isAMM = affectedNodes.some(node => 
                    (node.ModifiedNode?.LedgerEntryType === 'AMM') || 
                    (node.ModifiedNode?.LedgerEntryType === 'RippleState' && 
                     (node.ModifiedNode.FinalFields?.Balance?.currency === transaction.TakerGets?.currency || 
                      node.ModifiedNode.FinalFields?.Balance?.currency === transaction.TakerPays?.currency))
                );
                if (isAMM) {
                    direction = 'OUT';
                    directionClass = 'wallet-history-direction-out';
                    changeStr = `swapped ${amountStr}`;
                } else {
                    colorClass = 'tx-unclassified';
                    direction = transaction.Account === address ? 'OUT' : 'IN';
                    directionClass = transaction.Account === address ? 'wallet-history-direction-out' : 'wallet-history-direction-in';
                    changeStr = transaction.Account === address ? `offered ${amountStr}` : `received ${amountStr}`;
                }
                mainSentence = `<span class="wallet-history-entry-number">${transactions.length - i}.</span> <span class="${directionClass}">${direction}</span> ${changeStr} (<a href="https://xrpscan.com/tx/${transaction.hash}" target="_blank" class="wallet-history-hash-link">HASH</a>) FROM <a href="https://xrpscan.com/account/${sender}" target="_blank" class="wallet-history-address-link">${shortSender}</a>.`;
            }

            const feeXrp = transaction.Fee ? parseFloat(xrpl.dropsToXrp(transaction.Fee)) : 0;
            totalFeesXrp += feeXrp;
            if (feeType !== 'Xaman') {
                ledgerFeesPaidXrp += feeXrp;
            }

            historyHtml += `
                <div class="wallet-history-item ${colorClass}">
                    <p>${mainSentence}</p>
                    ${detailsHtml}
                </div>
            `;
        }

        let totalToTargetStr = `Total to ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt: ${formatBalance(totalToTargetXrp)} XRP`;
        for (const [currency, amount] of Object.entries(totalToTargetAssets)) {
            totalToTargetStr += `, ${formatBalance(amount)} ${currency}`;
        }
        totalBox.innerHTML = `<p>${totalToTargetStr}</p>`;
        historyBox.innerHTML = historyHtml;
        feesSummary.innerHTML = `<p>Total Fees: ${formatBalance(totalFeesXrp + xamanFeesPaidXrp)} XRP (as of 10:49 PM PDT, 07/13/2025)</p>`;
        summaryBox.innerHTML = `
            <h3>Account Summary</h3>
            <p><strong>Xaman Fees Paid:</strong> ${formatBalance(xamanFeesPaidXrp)} XRP</p>
            <p><strong>Ledger Fees Paid:</strong> ${formatBalance(ledgerFeesPaidXrp)} XRP</p>
            <p><strong>Current Balance of Service Fees Account:</strong> <a href="https://xrpscan.com/account/ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt" target="_blank" class="wallet-history-address-link">${formatBalance(currentBalance)} XRP</a></p>
        `;
        addressInput.value = address;
        log(`Fetched ${transactions.length} transactions for: ${address}`);
    } catch (error) {
        errorElement.textContent = `Error: ${error.message}`;
        if (error.data && error.data.error === 'invalidMarker') {
            errorElement.textContent = 'Error: Invalid marker detected. Switching server...';
            log('Invalid marker error, attempting server switch.');
            if (typeof randomizeServerSelection === 'function') {
                randomizeServerSelection(); 
                setTimeout(fetchTransactionHistory, 1000); 
            } else {
                errorElement.textContent += ' Server switch failed (randomizeServerSelection not found).';
            }
            return;
        }
        historyBox.innerHTML = '<p>Failed to load history.</p>';
        feesSummary.innerHTML = '<p>Total Fees: 0 XRP (as of 10:49 PM PDT, 07/13/2025)</p>';
        totalBox.innerHTML = '<p>Total to ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt: 0 XRP</p>';
        summaryBox.innerHTML = `
            <h3>Account Summary</h3>
            <p><strong>Xaman Fees Paid:</strong> 0.0 XRP</p>
            <p><strong>Ledger Fees Paid:</strong> 0.001168 XRP</p>
            <p><strong>Current Balance of Service Fees Account:</strong> <a href="https://xrpscan.com/account/ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt" target="_blank" class="wallet-history-address-link">2,582.017173 XRP</a></p>
        `;
        log(`Error fetching history: ${error.message}`);
    }
}

function clearTransactionHistory() {
    const historyBox = document.getElementById('transaction-history');
    const feesSummary = document.getElementById('service-fees-summary');
    const totalBox = document.getElementById('transaction-total');
    const summaryBox = document.getElementById('account-summary');
    const errorElement = document.getElementById('address-error-history');
    if (historyBox && feesSummary && totalBox && summaryBox && errorElement) {
        historyBox.innerHTML = '<p>No history loaded.</p>';
        feesSummary.innerHTML = '<p>Total Fees: 0 XRP (as of 10:49 PM PDT, 07/13/2025)</p>';
        totalBox.innerHTML = '<p>Total to ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt: 0 XRP</p>';
        summaryBox.innerHTML = `
            <h3>Account Summary</h3>
            <p><strong>Xaman Fees Paid:</strong> 0.0 XRP</p>
            <p><strong>Ledger Fees Paid:</strong> 0.001168 XRP</p>
            <p><strong>Current Balance of Service Fees Account:</strong> <a href="https://xrpscan.com/account/ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt" target="_blank" class="wallet-history-address-link">2,582.017173 XRP</a></p>
        `;
        errorElement.textContent = '';
        log('History cleared.');
        transactionCount = 0;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const addressInput = document.getElementById('history-address');
    if (addressInput && !addressInput.value && globalAddress) {
        addressInput.value = globalAddress; 
    }
});
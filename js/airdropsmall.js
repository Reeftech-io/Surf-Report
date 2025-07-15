const SMALL_AIRDROP_CONSTANTS = {
    TX_DELAY_MS: 4000,
    BATCH_SIZE: 100
};

let smallTrustlineList = [];
let smallOriginalTrustlineList = [];
let smallFilteredTrustlineListWithZeros = [];
let smallTrustlineListAssetB = [];
let smallAirdropResults = [];
let smallAirdropDetails = {
    totalSent: 0,
    totalFees: 0,
    successes: 0,
    failures: 0,
    startTime: null,
    endTime: null
};
let isSmallAirdropRunning = false;
let smallCompletedAddresses = new Set();
let smallAirdropQueue = [];

let isFetchingTrustlines = false;
let isDownloadingTrustlineCSV = false;
let isDownloadingFullTrustlineCSV = false;
let isDownloadingAirdropResults = false;
let isDownloadingAirdropDetails = false;

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function fetchSmallAirdropTrustlines() {
    if (isFetchingTrustlines) {
        log('Fetch trustlines already in progress, please wait.');
        const errorElement = document.getElementById('small-address-error-build-trustlines');
        if (errorElement) {
            errorElement.textContent = 'Fetch trustlines already in progress, please wait.';
        }
        return;
    }
    isFetchingTrustlines = true;
    try {
        const trustlineAssetDisplay = document.getElementById('small-airdrop-trustline-asset-display');
        const trustlineAssetDisplay2 = document.getElementById('small-airdrop-trustline-asset-display-2');
        const recipientsTextarea = document.getElementById('small-airdrop-recipients');
        const errorElement = document.getElementById('small-address-error-build-trustlines');
        const progressElement = document.getElementById('small-airdrop-fetch-progress');
        const progressBarFill = document.getElementById('small-airdrop-progress-bar-fill');
        const downloadBtn = document.getElementById('small-download-trustline-csv-btn');
        const downloadWithZerosBtn = document.getElementById('small-download-trustline-csv-with-zeros-btn');
        const removeZeroBtn = document.getElementById('small-remove-zero-balance-btn');
        const trustlineCount = document.getElementById('small-trustline-count');
        if (!trustlineAssetDisplay || !trustlineAssetDisplay2 || !recipientsTextarea || !errorElement || !progressElement || !progressBarFill || !downloadBtn || !downloadWithZerosBtn || !removeZeroBtn || !trustlineCount) {
            log('Error: Small airdrop trustline fetching elements not found.');
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
        smallTrustlineList = [];
        smallOriginalTrustlineList = [];
        smallFilteredTrustlineListWithZeros = [];
        smallTrustlineListAssetB = [];
        let marker = undefined;
        let fetchedCount = 0;
        const trustlinesAsset1 = [];
        progressElement.textContent = 'Progress: Fetched 0 trustlines...';
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
        smallOriginalTrustlineList = trustlinesAsset1;
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
            smallTrustlineListAssetB = trustlinesAsset2;
            smallTrustlineListAssetB.sort((a, b) => b.balance - a.balance);
            log(`Filtering for addresses with trustlines to both tokens...`);
            const addressesWithTrustline2 = new Set(trustlinesAsset2.map(t => t.address));
            finalTrustlines = trustlinesAsset1.filter(trustline => addressesWithTrustline2.has(trustline.address));
            log(`Found ${finalTrustlines.length} addresses with trustlines to both tokens.`);
        }
        smallTrustlineList = finalTrustlines.filter(t => Math.abs(t.balance) > 1e-6);
        smallFilteredTrustlineListWithZeros = finalTrustlines;
        smallTrustlineList.sort((a, b) => b.balance - a.balance);
        smallOriginalTrustlineList.sort((a, b) => b.balance - a.balance);
        progressElement.textContent = `Progress: Fetched ${smallTrustlineList.length} trustlines${trustlineAsset2 ? ' with both tokens' : ''} (complete)`;
        progressBarFill.style.width = '100%';
        errorElement.textContent = smallTrustlineList.length === 0 ? 'No trustlines found matching the criteria.' : '';
        downloadBtn.disabled = smallTrustlineList.length === 0;
        downloadWithZerosBtn.disabled = smallFilteredTrustlineListWithZeros.length === 0;
        removeZeroBtn.disabled = smallTrustlineList.length === 0;
        trustlineCount.textContent = smallTrustlineList.length;
        log(`Fetched ${smallTrustlineList.length} trustlines${trustlineAsset2 ? ' with trustlines to both tokens' : ''} for ${selectedTrustlineAssetName}${trustlineAsset2 ? ` and ${selectedTrustlineAssetName2}` : ''}.`);
        recipientsTextarea.value = smallTrustlineList.length > 0
            ? `${smallTrustlineList.length} addresses found${trustlineAsset2 ? ` with trustlines to both ${selectedTrustlineAssetName} and ${selectedTrustlineAssetName2}` : ''}:\n` +
              smallTrustlineList.map(t => `${t.address}, ${t.balanceStr}`).join('\n')
            : 'No trustlines found matching the criteria.';
        updateSmallTrustlineStats();
        await updateSmallAirdropAssetBalance();
    } catch (error) {
        log(`Error fetching small airdrop trustlines: ${error.message}`);
        const errorElement = document.getElementById('small-address-error-build-trustlines');
        if (errorElement) {
            errorElement.textContent = `Error: ${error.message}`;
        }
        const progressBarFill = document.getElementById('small-airdrop-progress-bar-fill');
        if (progressBarFill) {
            progressBarFill.style.width = '0%';
        }
    } finally {
        isFetchingTrustlines = false;
    }
}

function removeSmallZeroBalanceTrustlines() {
    console.trace('removeSmallZeroBalanceTrustlines called');
    const recipientsTextarea = document.getElementById('small-airdrop-recipients');
    const errorElement = document.getElementById('small-address-error-build-trustlines');
    const downloadBtn = document.getElementById('small-download-trustline-csv-btn');
    const trustlineCount = document.getElementById('small-trustline-count');
    if (!recipientsTextarea || !errorElement || !downloadBtn || !trustlineCount) {
        log('Error: UI elements not found for removing 0-balance trustlines.');
        return;
    }
    const originalCount = smallTrustlineList.length;
    smallTrustlineList = smallFilteredTrustlineListWithZeros.filter(t => Math.abs(t.balance) > 1e-6);
    const newCount = smallTrustlineList.length;
    const removedCount = originalCount - newCount;
    const trustlineAssetDisplay = document.getElementById('small-airdrop-trustline-asset-display');
    const trustlineAssetDisplay2 = document.getElementById('small-airdrop-trustline-asset-display-2');
    const selectedTrustlineAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent;
    const selectedTrustlineAssetName2 = trustlineAssetDisplay2.getAttribute('data-value') || trustlineAssetDisplay2.textContent;
    const trustlineAsset2 = selectedTrustlineAssetName2 && selectedTrustlineAssetName2 !== 'XRP' ? getAssetByName(selectedTrustlineAssetName2) : null;
    recipientsTextarea.value = smallTrustlineList.length > 0
        ? `${smallTrustlineList.length} addresses found${trustlineAsset2 ? ` with trustlines to both ${selectedTrustlineAssetName} and ${selectedTrustlineAssetName2}` : ''}:\n` +
          smallTrustlineList.map(t => `${t.address}, ${t.balanceStr}`).join('\n')
        : 'No non-zero balance trustlines found.';
    errorElement.textContent = smallTrustlineList.length === 0 ? 'No non-zero balance trustlines found.' : `Removed 0-balance trustlines. Original total: ${originalCount}, New total: ${newCount}, Removed: ${removedCount}`;
    downloadBtn.disabled = smallTrustlineList.length === 0;
    trustlineCount.textContent = smallTrustlineList.length;
    log(`Filtered small trustline list to ${smallTrustlineList.length} non-zero balance entries. Removed ${removedCount} trustlines.`);
    updateSmallTrustlineStats();
}

const debouncedDownloadSmallTrustlineCSV = debounce(function () {
    console.trace('downloadSmallTrustlineCSV called');
    if (isDownloadingTrustlineCSV) {
        log('Download trustline CSV already in progress, please wait.');
        const errorElement = document.getElementById('small-address-error-build-trustlines');
        if (errorElement) {
            errorElement.textContent = 'Download trustline CSV already in progress, please wait.';
        }
        return;
    }
    isDownloadingTrustlineCSV = true;
    try {
        if (smallTrustlineList.length === 0) {
            log('Error: No trustlines to export for small airdrop.');
            document.getElementById('small-address-error-build-trustlines').textContent = 'No trustlines to export.';
            return;
        }
        const csvContent = smallTrustlineList.map(t => `${t.address},${t.balanceStr}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `small_trustlines_${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        log('Small trustline list exported into a single CSV file (without headers).');
    } finally {
        isDownloadingTrustlineCSV = false;
    }
}, 300);

const debouncedDownloadSmallFullTrustlineCSV = debounce(function () {
    console.trace('downloadSmallFullTrustlineCSV called');
    if (isDownloadingFullTrustlineCSV) {
        log('Download full trustline CSV already in progress, please wait.');
        const errorElement = document.getElementById('small-address-error-build-trustlines');
        if (errorElement) {
            errorElement.textContent = 'Download full trustline CSV already in progress, please wait.';
        }
        return;
    }
    isDownloadingFullTrustlineCSV = true;
    try {
        if (smallFilteredTrustlineListWithZeros.length === 0) {
            log('Error: No trustlines to export (full list) for small airdrop.');
            document.getElementById('small-address-error-build-trustlines').textContent = 'No trustlines to export (full list).';
            return;
        }
        const csvContent = smallFilteredTrustlineListWithZeros.map(t => `${t.address},${t.balanceStr}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `small_trustlines_full_${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        log('Small trustline list (with zeros) exported into a single CSV file (without headers).');
    } finally {
        isDownloadingFullTrustlineCSV = false;
    }
}, 300);

async function loadSmallAirdropCSV(event) {
    console.trace('loadSmallAirdropCSV called');
    const file = event.target.files[0];
    if (!file) {
        log('No file selected for small airdrop.');
        return;
    }
    const fileNameDisplay = document.getElementById('small-airdrop-csv-file-name');
    const recipientsTextarea = document.getElementById('small-airdrop-recipients');
    const errorElement = document.getElementById('small-address-error-execute-airdrop');
    const queueBtn = document.getElementById('small-queue-airdrop-btn');
    const downloadBtn = document.getElementById('small-download-trustline-csv-btn');
    const downloadWithZerosBtn = document.getElementById('small-download-trustline-csv-with-zeros-btn');
    const removeZeroBtn = document.getElementById('small-remove-zero-balance-btn');
    const trustlineCount = document.getElementById('small-trustline-count');
    if (!fileNameDisplay || !recipientsTextarea || !errorElement || !queueBtn || !downloadBtn || !downloadWithZerosBtn || !removeZeroBtn || !trustlineCount) {
        log('Error: Small airdrop CSV loading elements not found.');
        return;
    }
    fileNameDisplay.textContent = file.name;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());
            if (lines.length === 0) {
                errorElement.textContent = 'CSV file is empty.';
                log('Error: CSV file is empty.');
                return;
            }
            smallTrustlineList = [];
            smallOriginalTrustlineList = [];
            smallFilteredTrustlineListWithZeros = [];
            smallTrustlineListAssetB = [];
            const addresses = new Set();
            let invalidLines = 0;
            for (const [index, line] of lines.entries()) {
                const parts = line.split(',').map(item => item.trim());
                if (parts.length !== 2) {
                    invalidLines++;
                    log(`Warning: Skipping invalid CSV line ${index + 1}: ${line}`);
                    continue;
                }
                const [address, balance] = parts;
                if (!xrpl.isValidAddress(address)) {
                    invalidLines++;
                    log(`Warning: Invalid address in CSV line ${index + 1}: ${address}`);
                    continue;
                }
                if (isNaN(parseFloat(balance))) {
                    invalidLines++;
                    log(`Warning: Invalid balance in CSV line ${index + 1}: ${balance}`);
                    continue;
                }
                if (addresses.has(address)) {
                    invalidLines++;
                    log(`Warning: Duplicate address in CSV line ${index + 1}: ${address}`);
                    continue;
                }
                const parsedBalance = parseFloat(balance);
                const absBalance = Math.abs(parsedBalance);
                const roundedBalance = absBalance < 1e-6 ? 0 : absBalance;
                const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '');
                const trustline = {
                    address,
                    balance: roundedBalance,
                    balanceStr: formattedBalance
                };
                smallTrustlineList.push(trustline);
                smallOriginalTrustlineList.push(trustline);
                smallFilteredTrustlineListWithZeros.push(trustline);
                addresses.add(address);
            }
            smallTrustlineList.sort((a, b) => b.balance - a.balance);
            smallOriginalTrustlineList.sort((a, b) => b.balance - a.balance);
            smallFilteredTrustlineListWithZeros.sort((a, b) => b.balance - a.balance);
            if (smallTrustlineList.length === 0) {
                errorElement.textContent = 'No valid addresses found in CSV.';
                log('Error: No valid addresses found in CSV.');
                return;
            }
            if (smallTrustlineList.length > 3000) {
                errorElement.textContent = 'Too many trustlines for small airdrop. Use Advanced Airdrop for over 3,000 trustlines.';
                log('Error: Too many trustlines for small airdrop.');
                return;
            }
            recipientsTextarea.value = `${smallTrustlineList.length} addresses loaded from CSV:\n` +
                smallTrustlineList.map(t => `${t.address}, ${t.balanceStr}`).join('\n');
            queueBtn.disabled = false;
            downloadBtn.disabled = false;
            downloadWithZerosBtn.disabled = false;
            removeZeroBtn.disabled = false;
            trustlineCount.textContent = smallTrustlineList.length;
            errorElement.textContent = `Loaded ${smallTrustlineList.length} addresses from CSV. Skipped ${invalidLines} invalid lines.`;
            log(`Successfully loaded ${file.name} with ${smallTrustlineList.length} addresses. Skipped ${invalidLines} invalid lines.`);
            updateSmallTrustlineStats();
            await updateSmallAirdropCost();
        } catch (error) {
            log(`Error loading small airdrop CSV: ${error.message}`);
            errorElement.textContent = `Error: ${error.message}`;
        }
    };
    reader.onerror = function() {
        log('Error reading small airdrop CSV file.');
        errorElement.textContent = 'Error reading CSV file.';
    };
    reader.readAsText(file);
}

async function queueSmallAirdropTransactions() {
    console.trace('queueSmallAirdropTransactions called');
    const errorElement = document.getElementById('small-address-error-execute-airdrop');
    try {
        if (isSmallAirdropRunning) {
            throw new Error('Small airdrop already in progress. Stop current airdrop to start a new one.');
        }
        const requiredElements = {
            'small-address-error-execute-airdrop': 'Error display',
            'small-airdrop-asset-display': 'Asset display',
            'small-airdrop-amount': 'Amount input',
            'small-airdrop-memo': 'Memo input',
            'small-airdrop-destination-tag': 'Destination tag input',
            'small-airdrop-flat': 'Flat radio button',
            'small-stop-airdrop-btn': 'Stop airdrop button',
            'small-download-results-btn': 'Download results button',
            'small-download-details-btn': 'Download details button'
        };
        for (const [id, description] of Object.entries(requiredElements)) {
            if (!document.getElementById(id)) {
                throw new Error(`Error: ${description} element (#${id}) not found in DOM.`);
            }
        }
        const address = globalAddress;
        const airdropAssetDisplay = document.getElementById('small-airdrop-asset-display');
        const amountInput = document.getElementById('small-airdrop-amount');
        const memoInput = document.getElementById('small-airdrop-memo');
        const destinationTagInput = document.getElementById('small-airdrop-destination-tag');
        const flatRadio = document.getElementById('small-airdrop-flat');
        const stopBtn = document.getElementById('small-stop-airdrop-btn');
        const resultsBtn = document.getElementById('small-download-results-btn');
        const detailsBtn = document.getElementById('small-download-details-btn');
        if (!contentCache || !displayTimer) {
            throw new Error('No wallet loaded.');
        }
        if (!address || !xrpl.isValidAddress(address)) {
            throw new Error('Invalid address.');
        }
        if (!client || !client.isConnected()) {
            throw new Error('XRPL client not connected.');
        }
        const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent;
        if (!selectedAssetName || selectedAssetName === 'Select Asset') {
            throw new Error('Please select an asset to airdrop.');
        }
        const csvFileInput = document.getElementById('small-airdrop-csv-file');
        const fileNameDisplay = document.getElementById('small-airdrop-csv-file-name');
        if (!csvFileInput || !fileNameDisplay) {
            throw new Error('CSV file input or name display not found.');
        }
        if (!csvFileInput.files[0]) {
            throw new Error('Please load a trustline CSV file.');
        }
        const rawAmount = amountInput.value.trim();
        if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) {
            throw new Error('Invalid amount or percentage.');
        }
        const isFlat = flatRadio.checked;
        let amount = parseFloat(rawAmount);
        if (!isFlat) amount /= 100;
        const memo = memoInput.value.trim();
        let destinationTag = null;
        if (destinationTagInput.value.trim()) {
            destinationTag = parseInt(destinationTagInput.value);
            if (isNaN(destinationTag) || destinationTag < 0 || destinationTag > 4294967295) {
                throw new Error('Invalid Destination Tag.');
            }
        }
        await ensureConnected();
        const airdropAsset = getAssetByName(selectedAssetName);
        if (!airdropAsset) {
            throw new Error('Invalid airdrop asset.');
        }
        if (airdropAsset.name !== 'XRP') {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            });
            const hasTrustline = accountLines.result.lines.some(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer);
            if (!hasTrustline) {
                throw new Error(`Master wallet lacks a trustline for ${airdropAsset.name}. Please set one before airdropping.`);
            }
            log(`Warning: Recipients must have trustlines for ${airdropAsset.name} to receive tokens. Transactions to addresses without trustlines will fail with tecPATH_DRY.`);
        }
        const reader = new FileReader();
        const csvData = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error reading CSV file.'));
            reader.readAsText(csvFileInput.files[0]);
        });
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('CSV file is empty.');
        }
        const batch = [];
        const seenAddresses = new Set();
        for (const line of lines) {
            const [destAddress, balance] = line.split(',').map(item => item.trim());
            if (xrpl.isValidAddress(destAddress) && !isNaN(parseFloat(balance))) {
                if (seenAddresses.has(destAddress)) {
                    log(`Warning: Skipping duplicate address in CSV: ${destAddress}`);
                    continue;
                }
                seenAddresses.add(destAddress);
                const parsedBalance = parseFloat(balance);
                const absBalance = Math.abs(parsedBalance);
                const roundedBalance = absBalance < 1e-6 ? 0 : absBalance;
                const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '');
                batch.push({
                    address: destAddress,
                    balance: parseFloat(formattedBalance),
                    balanceStr: formattedBalance
                });
            }
        }
        if (batch.length === 0) {
            throw new Error('No valid addresses found in CSV.');
        }
        if (batch.length > 3000) {
            throw new Error('Too many trustlines for small airdrop. Use Advanced Airdrop for over 3,000 trustlines.');
        }
        const amounts = batch.map(trustline => {
            const addrAmount = isFlat ? amount : (Math.abs(trustline.balance) * amount);
            return addrAmount > 0 ? { address: trustline.address, amount: addrAmount } : null;
        }).filter(item => item !== null);
        const totalTransactions = amounts.length;
        if (totalTransactions === 0) {
            throw new Error('No valid amounts to airdrop.');
        }
        let totalAmount = amounts.reduce((sum, { amount }) => sum + amount, 0);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        const totalFeeXrp = transactionFeeXrp * totalTransactions;
        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        if (totalFeeXrp > availableBalanceXrp) {
            throw new Error(`Insufficient XRP for fees. Need ${totalFeeXrp.toFixed(6)} XRP.`);
        }
        let maxBalance;
        if (airdropAsset.name === 'XRP') {
            maxBalance = availableBalanceXrp;
        } else {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            });
            const senderLine = accountLines.result.lines.find(line => line.currency === airdropAsset.hex && line.account === airdropAsset.issuer);
            maxBalance = senderLine ? parseFloat(senderLine.balance) : 0;
        }
        if (totalAmount > maxBalance) {
            throw new Error(`Insufficient ${airdropAsset.name} balance. Available: ${formatBalance(maxBalance)}`);
        }
        const confirmed = await showSmallAirdropConfirmationModal(amount, selectedAssetName, totalTransactions, totalAmount, totalFeeXrp, memo, isFlat);
        if (!confirmed) {
            log('Small airdrop cancelled by user.');
            return;
        }
        if (!isFlat) {
            const trustlineAssetDisplay = document.getElementById('small-airdrop-trustline-asset-display');
            const primaryAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent;
            log(`Note: Percentage-based airdrop (${amount * 100}%) is calculated using the balance of the primary token (${primaryAssetName}).`);
        }
        isSmallAirdropRunning = true;
        stopBtn.disabled = false;
        resultsBtn.disabled = false;
        detailsBtn.disabled = false;
        smallAirdropResults = [];
        smallAirdropDetails = {
            totalSent: 0,
            totalFees: 0,
            successes: 0,
            failures: 0,
            startTime: new Date().toISOString(),
            endTime: null
        };
        smallCompletedAddresses.clear();
        smallAirdropQueue = [];
        errorElement.textContent = `Starting small airdrop with ${totalTransactions} transactions from master wallet...`;
        let masterSeed = await fetchRenderContent();
        let masterWallet = xrpl.Wallet.fromSeed(masterSeed);
        let currentSequence = (await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        })).result.account_data.Sequence;
        const batches = [];
        for (let i = 0; i < amounts.length; i += SMALL_AIRDROP_CONSTANTS.BATCH_SIZE) {
            batches.push(amounts.slice(i, i + SMALL_AIRDROP_CONSTANTS.BATCH_SIZE));
        }
        let processedCount = 0;
        for (const batch of batches) {
            if (!isSmallAirdropRunning) {
                throw new Error('Small airdrop stopped by user.');
            }
            errorElement.textContent = `Preparing batch of ${batch.length} transactions (${processedCount}/${totalTransactions} sent)...`;
            const batchTransactions = [];
            for (const { address: destinationAddress, amount: addrAmount } of batch) {
                if (destinationAddress === globalAddress) {
                    log(`Warning: Skipping airdrop to main wallet address ${destinationAddress}.`);
                    continue;
                }
                const formattedAmountStr = truncateAmount(addrAmount);
                const tx = {
                    TransactionType: "Payment",
                    Account: globalAddress,
                    Destination: destinationAddress,
                    Amount: airdropAsset.name === 'XRP' ? xrpl.xrpToDrops(formattedAmountStr) : {
                        currency: airdropAsset.hex,
                        issuer: airdropAsset.issuer,
                        value: formattedAmountStr
                    },
                    Fee: TRANSACTION_FEE_DROPS,
                    Sequence: currentSequence++
                };
                if (memo) {
                    tx.Memos = [{ Memo: { MemoData: stringToHex(memo), MemoType: stringToHex("Memo") } }];
                }
                if (destinationTag !== null) {
                    tx.DestinationTag = destinationTag;
                }
                const prepared = await client.autofill(tx);
                const ledgerInfo = await client.request({ command: "ledger_current" });
                prepared.LastLedgerSequence = ledgerInfo.result.ledger_current_index + 300;
                const signed = masterWallet.sign(prepared);
                batchTransactions.push({
                    signedBlob: signed.tx_blob,
                    description: `Small airdrop to ${destinationAddress}: ${formattedAmountStr} ${airdropAsset.name}`,
                    destination: destinationAddress,
                    amount: formattedAmountStr,
                    memo,
                    destinationTag,
                    hash: signed.hash
                });
                smallAirdropResults.push({
                    address: destinationAddress,
                    amount: formattedAmountStr,
                    memo,
                    destinationTag,
                    status: 'queued',
                    hash: null,
                    error: null
                });
            }
            smallAirdropQueue.push(...batchTransactions);
            await processSmallAirdropQueue();
            processedCount += batch.length;
            updateSmallAirdropProgress();
            batchTransactions.length = 0;
            if (processedCount < totalTransactions) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        smallAirdropDetails.endTime = new Date().toISOString();
        errorElement.textContent = `Small airdrop completed: ${processedCount} transactions processed.`;
        updateSmallAirdropProgress();
        debouncedDownloadSmallAirdropResults();
        debouncedDownloadSmallAirdropDetails();
    } catch (error) {
        log(`Small airdrop queue error: ${error.message}`);
        if (errorElement) errorElement.textContent = `Error: ${error.message}`;
        smallAirdropDetails.endTime = new Date().toISOString();
        debouncedDownloadSmallAirdropResults();
        debouncedDownloadSmallAirdropDetails();
    } finally {
        isSmallAirdropRunning = false;
        stopBtn.disabled = true;
        masterSeed = null;
        masterWallet = null;
        await resecureCache();
        await checkBalance();
    }
}

async function processSmallAirdropQueue() {
    console.trace('processSmallAirdropQueue called');
    if (smallAirdropQueue.length === 0) {
        log('No transactions in small airdrop queue.');
        return;
    }
    const errorMap = {
        'tecPATH_DRY': 'Recipient lacks trustline for asset',
        'tecNO_DST': 'Destination account does not exist',
        'tecINSUF_FEE': 'Insufficient XRP for transaction fee',
        'tecNO_ISSUER': 'Issuer account does not exist',
        'tecDST_TAG_NEEDED': 'Destination tag required by recipient'
    };
    while (smallAirdropQueue.length > 0 && isSmallAirdropRunning) {
        const txEntry = smallAirdropQueue[0];
        const { signedBlob, description, destination, amount, memo, destinationTag, hash } = txEntry;
        try {
            if (smallCompletedAddresses.has(destination)) {
                log(`Skipping duplicate transaction to ${destination} in small airdrop queue.`);
                smallAirdropQueue.shift();
                continue;
            }
            await ensureConnected();
            const startTime = Date.now();
            const submitResult = await client.submit(signedBlob);
            const endTime = Date.now();
            log(`Transaction submission took ${(endTime - startTime) / 1000} seconds`);
            if (submitResult.result.engine_result !== 'tesSUCCESS' && !submitResult.result.engine_result.startsWith('ter')) {
                const errorMessage = errorMap[submitResult.result.engine_result] || submitResult.result.engine_result_message || submitResult.result.engine_result;
                throw new Error(errorMessage);
            }
            log(`${description}: ${hash}`);
            const resultEntry = smallAirdropResults.find(r => r.address === destination && r.status === 'queued');
            if (resultEntry) {
                resultEntry.status = 'submitted';
                resultEntry.hash = hash;
                smallAirdropDetails.totalSent += parseFloat(amount);
                smallAirdropDetails.totalFees += parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
                smallCompletedAddresses.add(destination);
            }
            checkFinalTransactionStatus(hash, destination, resultEntry, errorMap);
            smallAirdropQueue.shift();
            updateSmallAirdropProgress();
        } catch (error) {
            log(`Small airdrop failed submission to ${destination}: ${error.message}`);
            const resultEntry = smallAirdropResults.find(r => r.address === destination && r.status === 'queued');
            if (resultEntry) {
                resultEntry.status = 'failed';
                resultEntry.error = errorMap[error.message] || error.message;
                resultEntry.hash = hash;
                smallAirdropDetails.failures++;
                smallCompletedAddresses.add(destination);
            }
            smallAirdropQueue.shift();
            updateSmallAirdropProgress();
        }
        if (smallAirdropQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, SMALL_AIRDROP_CONSTANTS.TX_DELAY_MS));
        }
    }
    log('Completed processing small airdrop queue.');
}

async function checkFinalTransactionStatus(txHash, destination, resultEntry, errorMap) {
    try {
        await new Promise(resolve => setTimeout(resolve, 8000));
        await ensureConnected();
        const result = await client.request({
            command: "tx",
            transaction: txHash
        });
        if (result.result.meta.TransactionResult === 'tesSUCCESS') {
            if (resultEntry) {
                resultEntry.status = 'success';
                smallAirdropDetails.successes++;
                smallAirdropDetails.failures = Math.max(0, smallAirdropDetails.failures - 1);
            }
        } else {
            const errorMessage = errorMap[result.result.meta.TransactionResult] || result.result.meta.TransactionResult;
            log(`Transaction to ${destination} failed: ${errorMessage}`);
            if (resultEntry) {
                resultEntry.status = 'failed';
                resultEntry.error = errorMessage;
                smallAirdropDetails.failures++;
                smallAirdropDetails.successes = Math.max(0, smallAirdropDetails.successes - 1);
            }
        }
        updateSmallAirdropProgress();
    } catch (error) {
        log(`Error checking transaction ${txHash} for ${destination}: ${error.message}`);
        if (resultEntry) {
            resultEntry.status = 'failed';
            resultEntry.error = errorMap[error.message] || error.message;
            smallAirdropDetails.failures++;
            smallAirdropDetails.successes = Math.max(0, smallAirdropDetails.successes - 1);
        }
        updateSmallAirdropProgress();
    }
}

async function stopSmallAirdrop() {
    console.trace('stopSmallAirdrop called');
    if (!isSmallAirdropRunning) {
        log('No small airdrop in progress to stop.');
        return;
    }
    isSmallAirdropRunning = false;
    smallAirdropQueue = [];
    smallAirdropDetails.endTime = new Date().toISOString();
    updateSmallAirdropProgress();
    log('Small airdrop stopped.');
    debouncedDownloadSmallAirdropResults();
    debouncedDownloadSmallAirdropDetails();
    document.getElementById('small-stop-airdrop-btn').disabled = true;
    const errorElement = document.getElementById('small-address-error-execute-airdrop');
    if (errorElement) {
        errorElement.textContent = 'Small airdrop stopped.';
    }
}

async function updateSmallAirdropAssetBalance() {
    console.trace('updateSmallAirdropAssetBalance called');
    const airdropAssetDisplay = document.getElementById('small-airdrop-asset-display');
    const balanceElement = document.getElementById('small-airdrop-asset-balance');
    const errorElement = document.getElementById('small-address-error-execute-airdrop');
    if (!airdropAssetDisplay || !balanceElement || !errorElement) {
        log('Error: Small airdrop balance elements not found.');
        return;
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress) || !client || !client.isConnected()) {
        balanceElement.textContent = 'Balance: Please load a wallet and ensure connection.';
        return;
    }
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent;
    if (!selectedAssetName || selectedAssetName === 'Select Asset') {
        balanceElement.textContent = 'Balance: -';
        return;
    }
    const asset = getAssetByName(selectedAssetName);
    if (!asset) {
        balanceElement.textContent = 'Balance: -';
        return;
    }
    try {
        await ensureConnected();
        if (asset.name === 'XRP') {
            const { availableBalanceXrp } = await calculateAvailableBalance(globalAddress);
            balanceElement.textContent = `Balance: ${formatBalance(availableBalanceXrp)} XRP`;
        } else {
            const accountLines = await client.request({
                command: "account_lines",
                account: globalAddress,
                ledger_index: "current"
            });
            const line = accountLines.result.lines.find(l => l.currency === asset.hex && l.account === asset.issuer);
            balanceElement.textContent = `Balance: ${formatBalance(line?.balance || 0)} ${asset.name}`;
        }
    } catch (error) {
        log(`Error updating small airdrop balance: ${error.message}`);
        balanceElement.textContent = 'Balance: Unable to fetch';
    }
}

async function updateSmallAirdropCost() {
    console.trace('updateSmallAirdropCost called');
    const amountInput = document.getElementById('small-airdrop-amount');
    const flatRadio = document.getElementById('small-airdrop-flat');
    const costElement = document.getElementById('small-airdrop-cost');
    const errorElement = document.getElementById('small-address-error-execute-airdrop');
    const airdropAssetDisplay = document.getElementById('small-airdrop-asset-display');
    if (!amountInput || !flatRadio || !costElement || !errorElement || !airdropAssetDisplay) {
        log('Error: Small airdrop cost elements not found.');
        return;
    }
    const rawAmount = amountInput.value.trim();
    if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) {
        costElement.textContent = 'Total Cost: Enter a valid amount.';
        document.getElementById('small-queue-airdrop-btn').disabled = true;
        return;
    }
    const csvFileInput = document.getElementById('small-airdrop-csv-file');
    if (!csvFileInput || !csvFileInput.files[0]) {
        costElement.textContent = 'Total Cost: Load a CSV file.';
        document.getElementById('small-queue-airdrop-btn').disabled = true;
        return;
    }
    const isFlat = flatRadio.checked;
    let amount = parseFloat(rawAmount);
    if (!isFlat) amount /= 100;
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent;
    if (!selectedAssetName || selectedAssetName === 'Select Asset') {
        costElement.textContent = 'Total Cost: Select an asset to airdrop.';
        document.getElementById('small-queue-airdrop-btn').disabled = true;
        return;
    }
    const airdropAsset = getAssetByName(selectedAssetName);
    if (!airdropAsset) {
        costElement.textContent = 'Total Cost: Invalid airdrop asset.';
        document.getElementById('small-queue-airdrop-btn').disabled = true;
        return;
    }
    try {
        const reader = new FileReader();
        const csvData = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error reading CSV file.'));
            reader.readAsText(csvFileInput.files[0]);
        });
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            costElement.textContent = 'Total Cost: CSV file is empty.';
            document.getElementById('small-queue-airdrop-btn').disabled = true;
            return;
        }
        const batch = [];
        for (const line of lines) {
            const [address, balance] = line.split(',').map(item => item.trim());
            if (xrpl.isValidAddress(address) && !isNaN(parseFloat(balance))) {
                const parsedBalance = parseFloat(balance);
                const absBalance = Math.abs(parsedBalance);
                const roundedBalance = absBalance < 1e-6 ? 0 : absBalance;
                const formattedBalance = roundedBalance.toFixed(6).replace(/\.?0+$/, '');
                batch.push({
                    address,
                    balance: parseFloat(formattedBalance),
                    balanceStr: formattedBalance
                });
            }
        }
        if (batch.length === 0) {
            costElement.textContent = 'Total Cost: No valid addresses found in CSV.';
            document.getElementById('small-queue-airdrop-btn').disabled = true;
            return;
        }
        const amounts = batch.map(trustline => {
            const addrAmount = isFlat ? amount : (Math.abs(trustline.balance) * amount);
            return addrAmount > 0 ? { address: trustline.address, amount: addrAmount } : null;
        }).filter(item => item !== null);
        const totalTransactions = amounts.length;
        if (totalTransactions === 0) {
            costElement.textContent = 'Total Cost: No valid amounts to airdrop.';
            document.getElementById('small-queue-airdrop-btn').disabled = true;
            return;
        }
        let totalAmount = amounts.reduce((sum, { amount }) => sum + amount, 0);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        const totalFeeXrp = transactionFeeXrp * totalTransactions;
        costElement.textContent = `Total Cost: ${formatBalance(totalAmount)} ${selectedAssetName}, ${totalFeeXrp} XRP for ${totalTransactions} trustlines`;
        document.getElementById('small-queue-airdrop-btn').disabled = false;
        errorElement.textContent = '';
    } catch (error) {
        log(`Error calculating small airdrop cost: ${error.message}`);
        costElement.textContent = 'Total Cost: Error calculating cost.';
        document.getElementById('small-queue-airdrop-btn').disabled = true;
    }
}

function updateSmallTrustlineStats() {
    console.trace('updateSmallTrustlineStats called');
    updateSmallTopHoldersList();
    updateSmallTopHoldersListSecondary();
    updateSmallTopHoldersListMerged();
    drawSmallAssetAPieChart();
    drawSmallAssetBPieChart();
    drawSmallMergedPieChart();
}

function updateSmallTopHoldersList() {
    console.trace('updateSmallTopHoldersList called');
    const topHoldersList = document.getElementById('small-top-holders-list');
    const top10Percentage = document.getElementById('small-top-10-percentage');
    if (!topHoldersList || !top10Percentage) return;
    if (smallTrustlineList.length === 0) {
        topHoldersList.innerHTML = '<li>No data available yet. Fetch trustlines to see the top holders.</li>';
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: -';
        return;
    }
    const totalBalance = smallOriginalTrustlineList.reduce((sum, t) => sum + t.balance, 0);
    if (totalBalance <= 0) {
        topHoldersList.innerHTML = '<li>No non-zero balances available.</li>';
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: 0%';
        return;
    }
    const top10 = smallTrustlineList.slice(0, 10);
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0);
    const top10Percent = (top10Total / totalBalance) * 100;
    topHoldersList.innerHTML = top10.map((trustline, index) => {
        return `<li>${index + 1}. ${trustline.address}: ${trustline.balanceStr}</li>`;
    }).join('');
    top10Percentage.textContent = `Total % Held by Top 10 Holders: ${top10Percent.toFixed(2)}%`;
}

function updateSmallTopHoldersListSecondary() {
    console.trace('updateSmallTopHoldersListSecondary called');
    const topHoldersList = document.getElementById('small-top-holders-list-secondary');
    const top10Percentage = document.getElementById('small-top-10-percentage-secondary');
    const topHoldersSection = document.getElementById('small-top-holders-secondary');
    if (!topHoldersList || !top10Percentage || !topHoldersSection) return;
    if (smallTrustlineListAssetB.length === 0) {
        topHoldersSection.style.display = 'none';
        topHoldersList.innerHTML = '<li>No secondary token selected.</li>';
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: -';
        return;
    }
    topHoldersSection.style.display = 'block';
    const totalBalance = smallTrustlineListAssetB.reduce((sum, t) => sum + t.balance, 0);
    if (totalBalance <= 0) {
        topHoldersList.innerHTML = '<li>No non-zero balances available.</li>';
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: 0%';
        return;
    }
    const top10 = smallTrustlineListAssetB.slice(0, 10);
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0);
    const top10Percent = (top10Total / totalBalance) * 100;
    topHoldersList.innerHTML = top10.map((trustline, index) => {
        return `<li>${index + 1}. ${trustline.address}: ${trustline.balanceStr}</li>`;
    }).join('');
    top10Percentage.textContent = `Total % Held by Top 10 Holders: ${top10Percent.toFixed(2)}%`;
}

function updateSmallTopHoldersListMerged() {
    console.trace('updateSmallTopHoldersListMerged called');
    const topHoldersList = document.getElementById('small-top-holders-list-merged');
    const top10Percentage = document.getElementById('small-top-10-percentage-merged');
    const topHoldersSection = document.getElementById('small-top-holders-merged');
    if (!topHoldersList || !top10Percentage || !topHoldersSection) return;
    if (smallTrustlineListAssetB.length === 0 || smallTrustlineList.length === 0) {
        topHoldersSection.style.display = 'none';
        topHoldersList.innerHTML = '<li>No merged data available.</li>';
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: -';
        return;
    }
    topHoldersSection.style.display = 'block';
    const totalBalance = smallOriginalTrustlineList.reduce((sum, t) => sum + t.balance, 0);
    if (totalBalance <= 0) {
        topHoldersList.innerHTML = '<li>No non-zero balances available.</li>';
        top10Percentage.textContent = 'Total % Held by Top 10 Holders: 0%';
        return;
    }
    const top10 = smallTrustlineList.slice(0, 10);
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0);
    const top10Percent = (top10Total / totalBalance) * 100;
    topHoldersList.innerHTML = top10.map((trustline, index) => {
        return `<li>${index + 1}. ${trustline.address}: ${trustline.balanceStr}</li>`;
    }).join('');
    top10Percentage.textContent = `Total % Held by Top 10 Holders: ${top10Percent.toFixed(2)}%`;
}

function drawSmallAssetAPieChart() {
    console.trace('drawSmallAssetAPieChart called');
    const canvas = document.getElementById('small-trustline-distribution-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (smallTrustlineList.length === 0) {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    const totalBalance = smallOriginalTrustlineList.reduce((sum, t) => sum + t.balance, 0);
    if (totalBalance === 0) {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No non-zero balances', canvas.width / 2, canvas.height / 2);
        return;
    }
    const top10 = smallTrustlineList.slice(0, 10);
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0);
    const othersTotal = totalBalance - top10Total;
    const data = top10.map((trustline, index) => ({
        label: `Holder ${index + 1}`,
        value: trustline.balance
    }));
    if (othersTotal > 0) {
        data.push({ label: 'Others', value: othersTotal });
    }
    const colors = [
        '#ff4444', '#00cc00', '#ff6666', '#33ff33', '#ff8888', '#66ff66',
        '#ffaaaa', '#99ff99', '#ffcccc', '#ccffcc', '#aaaaaa'
    ];
    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
    data.forEach((item, index) => {
        const sliceAngle = (item.value / totalBalance) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.stroke();
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius / 1.5) * Math.cos(midAngle);
        const labelY = centerY + (radius / 1.5) * Math.sin(midAngle);
        const percentage = ((item.value / totalBalance) * 100).toFixed(1);
        if (percentage >= 5) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, labelX, labelY);
        }
        startAngle += sliceAngle;
    });
}

function drawSmallAssetBPieChart() {
    console.trace('drawSmallAssetBPieChart called');
    const canvas = document.getElementById('small-trustline-distribution-chart-secondary');
    const chartSection = document.getElementById('small-distribution-chart-secondary');
    if (!canvas || !chartSection) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (smallTrustlineListAssetB.length === 0) {
        chartSection.style.display = 'none';
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No secondary token selected', canvas.width / 2, canvas.height / 2);
        return;
    }
    chartSection.style.display = 'block';
    const totalBalance = smallTrustlineListAssetB.reduce((sum, t) => sum + t.balance, 0);
    if (totalBalance === 0) {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No non-zero balances', canvas.width / 2, canvas.height / 2);
        return;
    }
    const top10 = smallTrustlineListAssetB.slice(0, 10);
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0);
    const othersTotal = totalBalance - top10Total;
    const data = top10.map((trustline, index) => ({
        label: `Holder ${index + 1}`,
        value: trustline.balance
    }));
    if (othersTotal > 0) {
        data.push({ label: 'Others', value: othersTotal });
    }
    const colors = [
        '#ff4444', '#00cc00', '#ff6666', '#33ff33', '#ff8888', '#66ff66',
        '#ffaaaa', '#99ff99', '#ffcccc', '#ccffcc', '#aaaaaa'
    ];
    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
    data.forEach((item, index) => {
        const sliceAngle = (item.value / totalBalance) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.stroke();
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius / 1.5) * Math.cos(midAngle);
        const labelY = centerY + (radius / 1.5) * Math.sin(midAngle);
        const percentage = ((item.value / totalBalance) * 100).toFixed(1);
        if (percentage >= 5) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, labelX, labelY);
        }
        startAngle += sliceAngle;
    });
}

function drawSmallMergedPieChart() {
    console.trace('drawSmallMergedPieChart called');
    const canvas = document.getElementById('small-trustline-distribution-chart-merged');
    const chartSection = document.getElementById('small-distribution-chart-merged');
    if (!canvas || !chartSection) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (smallTrustlineListAssetB.length === 0 || smallTrustlineList.length === 0) {
        chartSection.style.display = 'none';
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No merged data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    chartSection.style.display = 'block';
    const totalBalance = smallOriginalTrustlineList.reduce((sum, t) => sum + t.balance, 0);
    if (totalBalance === 0) {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No non-zero balances', canvas.width / 2, canvas.height / 2);
        return;
    }
    const top10 = smallTrustlineList.slice(0, 10);
    const top10Total = top10.reduce((sum, t) => sum + t.balance, 0);
    const othersTotal = totalBalance - top10Total;
    const data = top10.map((trustline, index) => ({
        label: `Holder ${index + 1}`,
        value: trustline.balance
    }));
    if (othersTotal > 0) {
        data.push({ label: 'Others', value: othersTotal });
    }
    const colors = [
        '#ff4444', '#00cc00', '#ff6666', '#33ff33', '#ff8888', '#66ff66',
        '#ffaaaa', '#99ff99', '#ffcccc', '#ccffcc', '#aaaaaa'
    ];
    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
    data.forEach((item, index) => {
        const sliceAngle = (item.value / totalBalance) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.stroke();
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius / 1.5) * Math.cos(midAngle);
        const labelY = centerY + (radius / 1.5) * Math.sin(midAngle);
        const percentage = ((item.value / totalBalance) * 100).toFixed(1);
        if (percentage >= 5) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, labelX, labelY);
        }
        startAngle += sliceAngle;
    });
}

function selectSmallAirdropTrustlineAsset() {
    console.trace('selectSmallAirdropTrustlineAsset called');
    const trustlineAssetDisplay = document.getElementById('small-airdrop-trustline-asset-display');
    const trustlineAssetDisplay2 = document.getElementById('small-airdrop-trustline-asset-display-2');
    const errorElement = document.getElementById('small-address-error-build-trustlines');
    if (!trustlineAssetDisplay || !trustlineAssetDisplay2 || !errorElement) {
        log('Error: Small airdrop trustline asset display not found.');
        errorElement.textContent = 'Error: Trustline asset display not found.';
        return;
    }
    const selectedTrustlineAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent;
    const selectedTrustlineAssetName2 = trustlineAssetDisplay2.getAttribute('data-value') || trustlineAssetDisplay2.textContent;
    const recipientsTextarea = document.getElementById('small-airdrop-recipients');
    const downloadBtn = document.getElementById('small-download-trustline-csv-btn');
    const downloadWithZerosBtn = document.getElementById('small-download-trustline-csv-with-zeros-btn');
    const removeZeroBtn = document.getElementById('small-remove-zero-balance-btn');
    const trustlineCount = document.getElementById('small-trustline-count');
    const queueBtn = document.getElementById('small-queue-airdrop-btn');
    if (recipientsTextarea && downloadBtn && downloadWithZerosBtn && removeZeroBtn && trustlineCount && queueBtn) {
        recipientsTextarea.value = '';
        smallTrustlineList = [];
        smallOriginalTrustlineList = [];
        smallFilteredTrustlineListWithZeros = [];
        smallTrustlineListAssetB = [];
        downloadBtn.disabled = true;
        downloadWithZerosBtn.disabled = true;
        removeZeroBtn.disabled = true;
        queueBtn.disabled = true;
        trustlineCount.textContent = '0';
        updateSmallTrustlineStats();
        errorElement.textContent = '';
    }
}

function selectSmallAirdropAsset() {
    console.trace('selectSmallAirdropAsset called');
    const airdropAssetDisplay = document.getElementById('small-airdrop-asset-display');
    const errorElement = document.getElementById('small-address-error-execute-airdrop');
    if (!airdropAssetDisplay || !errorElement) {
        errorElement.textContent = 'Error: Airdrop asset display not found.';
        return;
    }
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent;
    updateSmallAirdropAssetBalance();
    updateSmallAirdropCost();
    errorElement.textContent = '';
}

function updateSmallAirdropProgress() {
    console.trace('updateSmallAirdropProgress called');
    const queueElement = document.getElementById('small-airdrop-queue');
    if (!queueElement) return;
    const queued = smallAirdropResults.filter(r => r.status === 'queued').length;
    const submitted = smallAirdropResults.filter(r => r.status === 'submitted').length;
    const succeeded = smallAirdropResults.filter(r => r.status === 'success').length;
    const failed = smallAirdropResults.filter(r => r.status === 'failed').length;
    queueElement.innerHTML = `
        <p>Transaction Queue:</p>
        <p>Processed: ${succeeded + failed}/${smallAirdropResults.length}</p>
        <p>Queued: ${queued}</p>
        <p>Submitted: ${submitted}</p>
        <p>Succeeded: ${succeeded}</p>
        <p>Failed: ${failed}</p>
    `;
}

const debouncedDownloadSmallAirdropResults = debounce(function () {
    console.trace('downloadSmallAirdropResults called');
    if (isDownloadingAirdropResults) {
        log('Download airdrop results already in progress, please wait.');
        document.getElementById('small-address-error-execute-airdrop').textContent = 'Download airdrop results already in progress, please wait.';
        return;
    }
    isDownloadingAirdropResults = true;
    try {
        if (smallAirdropResults.length === 0) {
            log('Error: No small airdrop results to export.');
            document.getElementById('small-address-error-execute-airdrop').textContent = 'No airdrop results to export.';
            return;
        }
        const header = 'Address,Amount,Memo,DestinationTag,Status,TransactionHash,Error';
        const csvContent = [
            header,
            ...smallAirdropResults.map(r => `${r.address},${r.amount},${r.memo || ''},${r.destinationTag || ''},${r.status},${r.hash || ''},${r.error || ''}`)
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `small_airdrop_results_${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        log('Small airdrop results CSV downloaded.');
    } finally {
        isDownloadingAirdropResults = false;
    }
}, 300);

const debouncedDownloadSmallAirdropDetails = debounce(function () {
    console.trace('downloadSmallAirdropDetails called');
    if (isDownloadingAirdropDetails) {
        log('Download airdrop details already in progress, please wait.');
        document.getElementById('small-address-error-execute-airdrop').textContent = 'Download airdrop details already in progress, please wait.';
        return;
    }
    isDownloadingAirdropDetails = true;
    try {
        if (!smallAirdropDetails.startTime) {
            log('Error: No small airdrop details to export.');
            document.getElementById('small-address-error-execute-airdrop').textContent = 'No airdrop details to export.';
            return;
        }
        const detailsText = [
            `Small Airdrop Details`,
            `Start Time: ${smallAirdropDetails.startTime}`,
            `End Time: ${smallAirdropDetails.endTime || 'Not completed'}`,
            `Total Sent: ${formatBalance(smallAirdropDetails.totalSent)}`,
            `Total Fees: ${formatBalance(smallAirdropDetails.totalFees)} XRP`,
            `Successful Transactions: ${smallAirdropDetails.successes}`,
            `Failed Transactions: ${smallAirdropDetails.failures}`
        ].join('\n');
        const blob = new Blob([detailsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `small_airdrop_details_${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        log('Small airdrop details downloaded as text file.');
    } finally {
        isDownloadingAirdropDetails = false;
    }
}, 300);

async function showSmallAirdropConfirmationModal(amount, assetName, totalTransactions, totalAmount, totalFeeXrp, memo, isFlat) {
    console.trace('showSmallAirdropConfirmationModal called');
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();
        const modal = document.createElement('div');
        modal.className = 'password-modal-overlay confirmation-modal';
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Small Airdrop</h2>
                <p>You are about to airdrop ${isFlat ? formatBalance(amount) : (amount * 100) + '%'} ${assetName} to ${totalTransactions} trustline holders (Total: ${formatBalance(totalAmount)} ${assetName}, Fees: ${totalFeeXrp.toFixed(6)} XRP).${memo ? ` Memo: "${memo}"` : ''}</p>
                <p>This action is IRREVERSIBLE.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmSmallAirdrop">Send Airdrop</button>
                    <button class="red-black-btn" id="cancelSmallAirdrop">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        const confirmButton = document.getElementById('confirmSmallAirdrop');
        const cancelButton = document.getElementById('cancelSmallAirdrop');
        const resolveAndCleanup = (result) => {
            modal.remove();
            resolve(result);
        };
        confirmButton.onclick = () => resolveAndCleanup(true);
        cancelButton.onclick = () => resolveAndCleanup(false);
    });
}

let isInitialized = false;

function initializeAirdropSection() {
    const smallAirdropSection = document.getElementById('small-airdrop-transactions');
    if (smallAirdropSection) {
        smallAirdropSection.querySelector('.section-header').addEventListener('click', async function (event) {
            console.trace('Section header clicked');
            if (!smallAirdropSection.classList.contains('minimized')) {
                if (typeof globalAddress !== 'undefined' && globalAddress && typeof xrpl !== 'undefined' && typeof client !== 'undefined' && client && client.isConnected()) {
                    if (xrpl.isValidAddress(globalAddress)) {
                        try {
                            await checkBalance();
                            await populateAssetDropdowns();
                            selectSmallAirdropTrustlineAsset();
                            selectSmallAirdropAsset();
                        } catch (error) {
                            log(`Error initializing airdrop section: ${error.message}`);
                            const errorElement = document.getElementById('small-address-error-execute-airdrop');
                            if (errorElement) {
                                errorElement.textContent = `Error: ${error.message}`;
                            }
                        }
                    } else {
                        const errorElement = document.getElementById('small-address-error-execute-airdrop');
                        if (errorElement) {
                            errorElement.textContent = 'Please load a valid wallet before expanding this section.';
                        }
                    }
                } else {
                    log('Error: Wallet not loaded or XRPL client not connected. Please load a wallet and connect to the server.');
                    const errorElement = document.getElementById('small-address-error-execute-airdrop');
                    if (errorElement) {
                        errorElement.textContent = 'Please load a wallet and connect to the server before expanding this section.';
                    }
                }
            }
        });
        const buttons = [
            { id: 'small-fetch-trustlines-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                fetchSmallAirdropTrustlines();
            }},
            { id: 'small-remove-zero-balance-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                removeSmallZeroBalanceTrustlines();
            }},
            { id: 'small-download-trustline-csv-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                debouncedDownloadSmallTrustlineCSV();
            }},
            { id: 'small-download-trustline-csv-with-zeros-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                debouncedDownloadSmallFullTrustlineCSV();
            }},
            { id: 'small-queue-airdrop-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                queueSmallAirdropTransactions();
            }},
            { id: 'small-stop-airdrop-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                stopSmallAirdrop();
            }},
            { id: 'small-download-results-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                debouncedDownloadSmallAirdropResults();
            }},
            { id: 'small-download-details-btn', handler: (event) => {
                console.trace(`Button clicked: ${event.target.id}`);
                debouncedDownloadSmallAirdropDetails();
            }}
        ];
        buttons.forEach(({ id, handler }) => {
            const btn = document.getElementById(id);
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.removeEventListener('click', handler);
                newBtn.addEventListener('click', handler);
            }
        });
        const amountInput = document.getElementById('small-airdrop-amount');
        if (amountInput) {
            amountInput.removeEventListener('input', updateSmallAirdropCost);
            amountInput.addEventListener('input', updateSmallAirdropCost);
        }
        const flatRadio = document.getElementById('small-airdrop-flat');
        const percentageRadio = document.getElementById('small-airdrop-percentage');
        if (flatRadio && percentageRadio) {
            flatRadio.removeEventListener('change', updateSmallAirdropCost);
            percentageRadio.removeEventListener('change', updateSmallAirdropCost);
            flatRadio.addEventListener('change', updateSmallAirdropCost);
            percentageRadio.addEventListener('change', updateSmallAirdropCost);
        }
        const fileInput = document.getElementById('small-airdrop-csv-file');
        if (fileInput) {
            fileInput.removeEventListener('change', loadSmallAirdropCSV);
            fileInput.addEventListener('change', loadSmallAirdropCSV);
        }
        const trustlineDropdown = document.getElementById('small-airdrop-trustline-asset-dropdown');
        const trustlineDropdown2 = document.getElementById('small-airdrop-trustline-asset-dropdown-2');
        const assetDropdown = document.getElementById('small-airdrop-asset-dropdown');
        if (trustlineDropdown) {
            trustlineDropdown.removeEventListener('change', selectSmallAirdropTrustlineAsset);
            trustlineDropdown.addEventListener('change', selectSmallAirdropTrustlineAsset);
        }
        if (trustlineDropdown2) {
            trustlineDropdown2.removeEventListener('change', selectSmallAirdropTrustlineAsset);
            trustlineDropdown2.addEventListener('change', selectSmallAirdropTrustlineAsset);
        }
        if (assetDropdown) {
            assetDropdown.removeEventListener('change', selectSmallAirdropAsset);
            assetDropdown.addEventListener('change', selectSmallAirdropAsset);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;
    const checkWalletLoaded = async () => {
        if (typeof globalAddress !== 'undefined' && globalAddress && typeof xrpl !== 'undefined' && typeof client !== 'undefined' && client && client.isConnected()) {
            initializeAirdropSection();
        } else {
            setTimeout(checkWalletLoaded, 1000);
        }
    };
    checkWalletLoaded();
});
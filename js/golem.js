let golemTrackingInterval = null;
let priceHistory = {};
let golemCharts = {};
let xrpUsdPrice = 1.0;
const POLL_INTERVAL = 30000;
let shouldStartTracking = false;
let isGolemInitialized = false;

function logGolemAlert(message, alertData = {}, isError = false) {
    const golemLog = document.getElementById('golem-log');
    if (golemLog) {
        const logEntry = document.createElement('div');
        logEntry.className = `golem-alert${isError ? ' error' : ''}${alertData.changeLast ? (alertData.changeLast > 0 ? ' price-up' : ' price-down') : ''}`;
        const timestamp = new Date().toLocaleString();
        let alertHtml = `<strong>[${timestamp}]</strong> ${message}<br>`;
        if (alertData.pairKey) {
            alertHtml += `<span>Pair: ${alertData.pairKey}</span><br>`;
            alertHtml += `<span>Price: ${formatBalance(alertData.price)} ${alertData.quoteAsset}</span><br>`;
            alertHtml += `<span>Change (Initial): ${Number(alertData.changeInitial?.toFixed(6))}%</span><br>`;
            alertHtml += `<span>Change (Last Alert): ${Number(alertData.changeLast?.toFixed(6))}%</span><br>`;
            alertHtml += `<span>TVL: $${formatBalance(alertData.tvlUsd)}</span><br>`;
            alertHtml += `<span>Reserves: ${formatBalance(alertData.poolXrp)} XRP, ${formatBalance(alertData.poolToken)} ${alertData.quoteAsset}</span><br>`;
            alertHtml += `<span>Trend: ${alertData.trend}</span>`;
        }
        logEntry.innerHTML = alertHtml;
        golemLog.appendChild(logEntry);
        golemLog.scrollTop = golemLog.scrollHeight;
    }
}

function clearGolemAlerts() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to clear alerts.', {}, true);
        return;
    }
    const golemLog = document.getElementById('golem-log');
    if (golemLog) {
        golemLog.innerHTML = '';
        logGolemAlert('Golem alerts cleared.');
    }
}

function initializeGolemDropdowns() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        return;
    }
    const dropdowns = [
        {
            id: 'golem-base-asset-dropdown',
            gridId: 'golem-base-asset-grid',
            displayId: 'golem-base-asset-display',
            defaultValue: 'XRP'
        },
        {
            id: 'golem-quote-asset-dropdown',
            gridId: 'golem-quote-asset-grid',
            displayId: 'golem-quote-asset-display',
            defaultValue: '$Xoge'
        }
    ];
    const prefabAssetsSafe = Array.isArray(prefabAssets) ? prefabAssets.filter(a => a.name && (a.hex || a.issuer) && !a.isLP) : [];
    const dynamicAssetsSafe = Array.isArray(dynamicAssets) ? dynamicAssets.filter(a => a.name && (a.hex || a.issuer) && !a.isLP) : [];
    const assets = [
        { name: 'XRP', hex: 'XRP', issuer: '', isLP: false },
        ...prefabAssetsSafe,
        ...dynamicAssetsSafe
    ].sort((a, b) => a.name.localeCompare(b.name));
    if (assets.length === 1) {
        logGolemAlert('Warning: Only XRP available for dropdowns. Other assets missing.', {}, true);
    }
    dropdowns.forEach(({ id, gridId, displayId, defaultValue }) => {
        const grid = document.getElementById(gridId);
        const display = document.getElementById(displayId);
        if (!grid || !display) {
            logGolemAlert(`Error: Dropdown elements missing: grid=${gridId}, display=${displayId}`, {}, true);
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
                    updateGolemDropdowns();
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

function updateGolemDropdowns() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        return;
    }
    const baseDisplay = document.getElementById('golem-base-asset-display');
    const quoteDisplay = document.getElementById('golem-quote-asset-display');
    if (!baseDisplay || !quoteDisplay) {
        return;
    }
    const baseAsset = baseDisplay.getAttribute('data-value');
    const quoteAsset = quoteDisplay.getAttribute('data-value');
    if (baseAsset === quoteAsset) {
        const availableAssets = ['XRP', ...prefabAssets.map(a => a.name), ...dynamicAssets.map(a => a.name)];
        const otherAsset = availableAssets.find(a => a !== baseAsset && a !== 'XRP') || '$Xoge';
        const otherAssetData = prefabAssets.find(a => a.name === otherAsset) || dynamicAssets.find(a => a.name === otherAsset) || 
                             { name: '$Xoge', hex: '586F676500000000000000000000000000000000', issuer: 'rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1', isLP: false };
        quoteDisplay.innerHTML = '';
        const img = document.createElement('img');
        const ticker = otherAsset.startsWith('$') ? otherAsset : `$${otherAsset}`;
        img.src = `./icons/${ticker}-${otherAssetData.issuer}.png`;
        img.alt = otherAsset;
        img.className = 'asset-icon';
        img.onerror = () => (img.src = './icons/XRP.png');
        quoteDisplay.appendChild(img);
        quoteDisplay.appendChild(document.createTextNode(` ${otherAsset}`));
        quoteDisplay.setAttribute('data-value', otherAsset);
        quoteDisplay.setAttribute('data-hex', otherAssetData.hex || 'XRP');
        quoteDisplay.setAttribute('data-issuer', otherAssetData.issuer || '');
        quoteDisplay.setAttribute('data-is-lp', otherAssetData.isLP || false);
    }
}

function closeAllDropdowns() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        return;
    }
    const panels = document.querySelectorAll('.dropdown-panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });
}

async function addGolemPair(baseAsset, quoteAsset, baseHex, baseIssuer, quoteHex, quoteIssuer, isDefaultPair = false) {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to add pairs.', {}, true);
        return;
    }
    const errorElement = document.getElementById('golem-error');
    const pairsContainer = document.getElementById('golem-pairs-container');
    if (!errorElement || !pairsContainer) {
        return;
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        errorElement.textContent = 'No account loaded. Please load an account first.';
        logGolemAlert('Error: No account loaded for adding pair.', {}, true);
        return;
    }
    if (!baseAsset || !quoteAsset || baseAsset === quoteAsset) {
        errorElement.textContent = 'Invalid base or quote asset selection.';
        return;
    }
    const isValidHex = (hex) => /^[0-9A-Z]{1,3}$/.test(hex) || /^[0-9A-Fa-f]{40}$/.test(hex);
    const isValidIssuer = (issuer) => issuer === '' || /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(issuer);
    if (baseAsset !== 'XRP' && (!baseHex || !isValidHex(baseHex) || !baseIssuer || !isValidIssuer(baseIssuer))) {
        errorElement.textContent = `Invalid base asset data: hex=${baseHex}, issuer=${baseIssuer}`;
        logGolemAlert(`Error: Invalid base asset data for ${baseAsset}: hex=${baseHex}, issuer=${baseIssuer}`, {}, true);
        return;
    }
    if (quoteAsset !== 'XRP' && (!quoteHex || !isValidHex(quoteHex) || !quoteIssuer || !isValidIssuer(quoteIssuer))) {
        errorElement.textContent = `Invalid quote asset data: hex=${quoteHex}, issuer=${quoteIssuer}`;
        logGolemAlert(`Error: Invalid quote asset data for ${quoteAsset}: hex=${quoteHex}, issuer=${quoteIssuer}`, {}, true);
        return;
    }
    const pairKey = `${baseAsset}-${quoteAsset}`;
    if (pairKey === 'XRP-$RLUSD' && !isDefaultPair) {
        errorElement.textContent = 'XRP/$RLUSD is automatically tracked at the top.';
        return;
    }
    const trackedPairs = Object.keys(priceHistory).filter(key => key !== 'XRP-$RLUSD');
    if (!isDefaultPair && trackedPairs.length >= 10 && !priceHistory[pairKey]) {
        errorElement.textContent = 'Maximum 10 pairs can be tracked (excluding XRP/$RLUSD).';
        return;
    }
    if (priceHistory[pairKey]) {
        errorElement.textContent = 'This pair is already being tracked.';
        return;
    }
    try {
        await ensureConnected();
        const baseAssetData = baseAsset === 'XRP' ? { currency: 'XRP' } : { currency: baseHex, issuer: baseIssuer };
        const quoteAssetData = quoteAsset === 'XRP' ? { currency: 'XRP' } : { currency: quoteHex, issuer: quoteIssuer };
        let ammInfo;
        try {
            ammInfo = await throttleRequest(() =>
                client.request({
                    command: 'amm_info',
                    asset: baseAssetData,
                    asset2: quoteAssetData,
                    ledger_index: 'current'
                })
            );
        } catch (error) {
            throw new Error(`Primary AMM request failed: ${error.message}`);
        }
        if (!ammInfo.result.amm) {
            try {
                ammInfo = await throttleRequest(() =>
                    client.request({
                        command: 'amm_info',
                        asset: quoteAssetData,
                        asset2: baseAssetData,
                        ledger_index: 'current'
                    })
                );
            } catch (error) {
                throw new Error(`Secondary AMM request failed: ${error.message}`);
            }
            if (!ammInfo.result.amm) {
                errorElement.textContent = `No AMM pool found for ${baseAsset}/${quoteAsset}.`;
                logGolemAlert(`No AMM pool found for ${pairKey}`, {}, true);
                return;
            }
        }
        priceHistory[pairKey] = { prices: [], tvls: [], timestamps: [], initialPrice: null, lastPrice: null, lastAlertedPrice: null, volume: [], fees: [] };
        const escapedPairKey = pairKey.replace('$', '--');
        const baseTicker = baseAsset.startsWith('$') ? baseAsset : `$${baseAsset}`;
        const quoteTicker = quoteAsset.startsWith('$') ? quoteAsset : `$${quoteAsset}`;
        const baseIconSrc = baseAsset === 'XRP' ? './icons/XRP.png' : `./icons/${baseTicker}-${baseIssuer}.png`;
        const quoteIconSrc = quoteAsset === 'XRP' ? './icons/XRP.png' : `./icons/${quoteTicker}-${quoteIssuer}.png`;
        const pairBlock = document.createElement('div');
        pairBlock.className = 'pair-block';
        pairBlock.id = `golem-pair-${escapedPairKey}`;
        pairBlock.innerHTML = `
            <div class="pair-data">
                <div class="pair-name">
                    ${baseAsset}/${quoteAsset}
                    <div class="asset-icons">
                        <img src="${baseIconSrc}" alt="${baseAsset}" onerror="this.src='./icons/XRP.png'">
                        <img src="${quoteIconSrc}" alt="${quoteAsset}" onerror="this.src='./icons/XRP.png'">
                    </div>
                </div>
                <div id="golem-price-${escapedPairKey}">-</div>
                <div id="golem-change-initial-${escapedPairKey}">-</div>
                <div id="golem-change-last-${escapedPairKey}">-</div>
                <div id="golem-tvl-${escapedPairKey}">-</div>
                <div id="golem-reserves-${escapedPairKey}">-</div>
                <div>${isDefaultPair ? '-' : `<button class="red-black-btn" onclick="removeGolemPair('${pairKey}')">Remove</button>`}</div>
            </div>
            <div class="pair-charts">
                <canvas id="golem-price-chart-${escapedPairKey}" width="500" height="125"></canvas>
                <canvas id="golem-tvl-chart-${escapedPairKey}" width="500" height="125"></canvas>
            </div>
        `;
        pairsContainer.insertBefore(pairBlock, pairsContainer.firstChild);
        initializeGolemChart(pairKey, 'price');
        initializeGolemChart(pairKey, 'tvl');
        errorElement.textContent = '';
        logGolemAlert(`Added pair ${baseAsset}/${quoteAsset} for tracking${isDefaultPair ? ' (default pair)' : ''}.`);
        if (golemTrackingInterval) fetchGolemPrices();
    } catch (error) {
        errorElement.textContent = `Error adding pair: ${error.message}`;
        logGolemAlert(`Error adding pair ${baseAsset}/${quoteAsset}: ${error.message}`, {}, true);
    }
}

function handleAddGolemPair() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to add pairs.', {}, true);
        return;
    }
    const baseDisplay = document.getElementById('golem-base-asset-display');
    const quoteDisplay = document.getElementById('golem-quote-asset-display');
    if (!baseDisplay || !quoteDisplay) {
        return;
    }
    const baseAsset = baseDisplay.getAttribute('data-value');
    const quoteAsset = quoteDisplay.getAttribute('data-value');
    const baseHex = baseDisplay.getAttribute('data-hex');
    const quoteHex = quoteDisplay.getAttribute('data-hex');
    const baseIssuer = baseDisplay.getAttribute('data-issuer');
    const quoteIssuer = quoteDisplay.getAttribute('data-issuer');
    addGolemPair(baseAsset, quoteAsset, baseHex, baseIssuer, quoteHex, quoteIssuer);
}

function removeGolemPair(pairKey) {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to remove pairs.', {}, true);
        return;
    }
    if (pairKey === 'XRP-$RLUSD') return;
    const pairBlock = document.getElementById(`golem-pair-${pairKey.replace('$', '--')}`);
    if (pairBlock) pairBlock.remove();
    delete priceHistory[pairKey];
    if (golemCharts[pairKey]) {
        golemCharts[pairKey].price?.destroy();
        golemCharts[pairKey].tvl?.destroy();
        delete golemCharts[pairKey];
    }
    logGolemAlert(`Removed pair ${pairKey} from tracking.`);
}

function initializeGolemChart(pairKey, type) {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        return;
    }
    const canvasId = `golem-${type}-chart-${pairKey.replace('$', '--')}`;
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        return;
    }
    if (!golemCharts[pairKey]) golemCharts[pairKey] = {};
    if (golemCharts[pairKey][type]) golemCharts[pairKey][type].destroy();
    golemCharts[pairKey][type] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: type === 'price' ? 'Price' : 'TVL (USD)',
                data: [],
                borderColor: type === 'price' ? '#00cc00' : '#ff4444',
                backgroundColor: type === 'price' ? 'rgba(0, 204, 0, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                x: { display: false },
                y: {
                    display: true,
                    ticks: { color: '#ccc', font: { size: 12 } },
                    grid: { color: '#444' }
                }
            },
            plugins: { legend: { display: false } },
            maintainAspectRatio: false,
            responsive: true
        }
    });
}

async function addAccountAssetsToGolem() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to add account assets.', {}, true);
        return;
    }
    const errorElement = document.getElementById('golem-error');
    if (!errorElement) {
        logGolemAlert('Error: Golem error element not found.', {}, true);
        return;
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        errorElement.textContent = 'No account loaded. Please load an account first.';
        logGolemAlert('Error: No account loaded for adding account assets.', {}, true);
        return;
    }

    
    let accountLines;
    try {
        await ensureConnected();
        accountLines = await client.request({
            command: 'account_lines',
            account: globalAddress,
            ledger_index: 'current'
        });
    } catch (error) {
        errorElement.textContent = 'Failed to fetch account trustlines.';
        logGolemAlert(`Error fetching account trustlines: ${error.message}`, {}, true);
        return;
    }

    
    const assets = [];
    const lpHexPattern = /^[0-9A-Fa-f]{40}$/;
    const assetHexPattern = /^[0-9A-Fa-f]{6,8}0{32,34}$/;
    for (const line of accountLines.result.lines) {
        const currency = line.currency;
        const issuer = line.account;
        const balance = parseFloat(line.balance);
        const decodedString = xrpl.convertHexToString(currency).replace(/\0/g, '');
        const isHumanReadable = decodedString.length > 0 && /^[A-Za-z0-9]+$/.test(decodedString);
        
        const isLP = globalLPTokens.some(lp => lp.currency === currency && lp.issuer === issuer);
        if (isLP) {
            continue; 
        }
        const assetName = isHumanReadable ? decodedString : `[HEX:${currency.slice(0, 8)}]`;
        const assetData = prefabAssets.find(a => a.hex === currency && a.issuer === issuer && !a.isLP) ||
                         dynamicAssets.find(a => a.hex === currency && a.issuer === issuer && !a.isLP) ||
                         { name: assetName, hex: currency, issuer, isLP: false };
        if (balance > 0) {
            assets.push({
                name: assetData.name,
                hex: currency,
                issuer,
                balance,
                isLP: false
            });
        }
    }

    if (assets.length === 0) {
        errorElement.textContent = 'No non-LP assets with non-zero balance found.';
        logGolemAlert('Error: No non-LP assets with non-zero balance found.', {}, true);
        return;
    }

    const trackedPairs = Object.keys(priceHistory).filter(key => key !== 'XRP-$RLUSD');
    const availableSlots = 10 - trackedPairs.length;
    if (availableSlots <= 0) {
        errorElement.textContent = 'Maximum 10 pairs already tracked (excluding XRP/$RLUSD).';
        logGolemAlert('Error: Maximum 10 pairs already tracked.', {}, true);
        return;
    }

    const baseAsset = 'XRP';
    const baseHex = 'XRP';
    const baseIssuer = '';
    let addedCount = 0;

    for (const asset of assets) {
        if (trackedPairs.length + addedCount >= 10) {
            logGolemAlert('Stopped adding pairs: Reached maximum of 10 pairs.', {}, true);
            break;
        }
        const quoteAsset = asset.name;
        const quoteHex = asset.hex;
        const quoteIssuer = asset.issuer;
        const pairKey = `${baseAsset}-${quoteAsset}`;
        if (quoteAsset === '$RLUSD' && baseAsset === 'XRP') {
            continue; 
        }
        if (priceHistory[pairKey]) {
            continue; 
        }
        try {
            const assetData = getAssetByName(quoteAsset) || { name: quoteAsset, hex: quoteHex, issuer: quoteIssuer, isLP: false };
            if (!assetData || (quoteAsset !== 'XRP' && (!assetData.hex || !assetData.issuer)) || assetData.isLP) {
                logGolemAlert(`Invalid asset data for ${quoteAsset}: hex=${quoteHex}, issuer=${quoteIssuer}, isLP=${assetData.isLP}`, {}, true);
                continue;
            }
            await addGolemPair(baseAsset, quoteAsset, baseHex, baseIssuer, quoteHex, quoteIssuer);
            addedCount++;
        } catch (error) {
            logGolemAlert(`Failed to add pair ${pairKey}: ${error.message}`, {}, true);
        }
    }

    if (addedCount === 0) {
        errorElement.textContent = 'No new pairs added. All assets already tracked or invalid.';
        logGolemAlert('No new pairs added. All assets already tracked or invalid.', {}, true);
    } else {
        errorElement.textContent = '';
    }
}


async function calculateAccountValue() {
    const golemAccountValue = document.getElementById('golem-account-value');
    const golemAccountAssets = document.getElementById('golem-account-assets');
    if (!golemAccountValue || !golemAccountAssets) return;
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        golemAccountValue.textContent = 'Current Account Value: No account loaded';
        golemAccountAssets.textContent = '';
        return;
    }
    if (!priceHistory['XRP-$RLUSD'] || !priceHistory['XRP-$RLUSD'].lastPrice) {
        golemAccountValue.textContent = 'Current Account Value: Waiting for XRP/$RLUSD price';
        golemAccountAssets.textContent = '';
        return;
    }
    try {
        await ensureConnected();
        const accountInfo = await client.request({
            command: 'account_info',
            account: globalAddress,
            ledger_index: 'current'
        });
        const accountLines = await client.request({
            command: 'account_lines',
            account: globalAddress,
            ledger_index: 'current'
        });

        let totalXrp = parseFloat(xrpl.dropsToXrp(accountInfo.result.account_data.Balance));
        let totalUsd = totalXrp * xrpUsdPrice;
        let assetBreakdown = `<ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">`;
        assetBreakdown += `<li>XRP: ${formatBalance(totalXrp)} XRP / $${formatBalance(totalXrp * xrpUsdPrice)} USD</li>`;

        
        const poolCache = new Map();
        const lpHexPattern = /^[0-9A-Fa-f]{40}$/;
        const assetHexPattern = /^[0-9A-Fa-f]{6,8}0{32,34}$/;
        for (const line of accountLines.result.lines) {
            const currency = line.currency;
            const issuer = line.account;
            const balance = parseFloat(line.balance);
            const decodedString = xrpl.convertHexToString(currency).replace(/\0/g, '');
            const isHumanReadable = decodedString.length > 0 && /^[A-Za-z0-9]+$/.test(decodedString);
            const isLP = globalLPTokens.some(lp => lp.currency === currency && lp.issuer === issuer);
            if (isLP) continue;
            const assetName = isHumanReadable ? decodedString : `[HEX:${currency.slice(0, 8)}]`;
            let priceInXrp = 0;
            const pairKeyBase = `XRP-${assetName}`;
            const pairKeyQuote = `${assetName}-XRP`;
            if (priceHistory[pairKeyBase] && priceHistory[pairKeyBase].lastPrice) {
                priceInXrp = priceHistory[pairKeyBase].lastPrice;
                poolCache.set(`${currency}:${issuer}`, {
                    poolXrp: priceHistory[pairKeyBase].poolXrp || 0,
                    poolToken: priceHistory[pairKeyBase].poolToken || 0,
                    priceInXrp
                });
            } else if (priceHistory[pairKeyQuote] && priceHistory[pairKeyQuote].lastPrice) {
                priceInXrp = 1 / priceHistory[pairKeyQuote].lastPrice;
                poolCache.set(`${currency}:${issuer}`, {
                    poolXrp: priceHistory[pairKeyQuote].poolXrp || 0,
                    poolToken: priceHistory[pairKeyQuote].poolToken || 0,
                    priceInXrp
                });
            } else {
                try {
                    const ammInfo = await throttleRequest(() =>
                        client.request({
                            command: 'amm_info',
                            asset: { currency: 'XRP' },
                            asset2: { currency, issuer },
                            ledger_index: 'current'
                        })
                    );
                    if (ammInfo.result.amm && ammInfo.result.amm.amount && ammInfo.result.amm.amount2) {
                        const amount1 = ammInfo.result.amm.amount;
                        const amount2 = ammInfo.result.amm.amount2;
                        const poolXrp = typeof amount1 === 'string' ? parseFloat(xrpl.dropsToXrp(amount1)) : parseFloat(xrpl.dropsToXrp(amount2));
                        const poolToken = typeof amount1 === 'string' ? parseFloat(amount2.value) : parseFloat(amount1.value);
                        if (!isNaN(poolXrp) && !isNaN(poolToken) && poolToken !== 0) {
                            priceInXrp = poolXrp / poolToken;
                            poolCache.set(`${currency}:${issuer}`, { poolXrp, poolToken, priceInXrp });
                        } else {
                            logGolemAlert(`Invalid AMM data for ${assetName}: poolXrp=${poolXrp}, poolToken=${poolToken}`, {}, true);
                        }
                    } else {
                        logGolemAlert(`No AMM pool found for ${assetName}`, {}, true);
                    }
                } catch (error) {
                    logGolemAlert(`Error fetching AMM for ${assetName}: ${error.message}`, {}, true);
                }
            }
            const assetXrpValue = priceInXrp > 0 ? balance * priceInXrp : 0;
            const assetUsdValue = priceInXrp > 0 ? assetXrpValue * xrpUsdPrice : 0;
            assetBreakdown += `<li>${assetName}: ${formatBalance(balance)} ${assetName} / ${priceInXrp > 0 ? `${formatBalance(assetXrpValue)} XRP / $${formatBalance(assetUsdValue)} USD` : 'Price unavailable'}</li>`;
            if (priceInXrp > 0) {
                totalXrp += assetXrpValue;
                totalUsd += assetUsdValue;
            }
        }

        
        for (const lpToken of globalLPTokens) {
            const { lpName, currency, issuer, balance } = lpToken;
            let lpXrpValue = 0;
            let lpUsdValue = 0;
            try {
                const decodedLPName = await decodeLPToken(currency, issuer);
                if (!decodedLPName || decodedLPName !== lpName) {
                    throw new Error(`Invalid LP token: ${lpName}, decoded: ${decodedLPName}`);
                }
                let lpTokenSupply;
                let asset1Data, asset2Data;
                try {
                    const ammObjects = await throttleRequest(() =>
                        client.request({
                            command: 'account_objects',
                            account: issuer,
                            type: 'amm',
                            ledger_index: 'current'
                        })
                    );
                    const ammObj = ammObjects.result.account_objects.find(obj => {
                        if (obj.LedgerEntryType !== 'AMM') return false;
                        return obj.LPTokenBalance?.currency === currency && obj.LPTokenBalance?.issuer === issuer;
                    });
                    if (!ammObj) {
                        throw new Error(`No AMM object found for LP token with currency ${currency} and issuer ${issuer}`);
                    }
                    lpTokenSupply = typeof ammObj.LPTokenBalance === 'object' && ammObj.LPTokenBalance.value ?
                        parseFloat(ammObj.LPTokenBalance.value.replace(/e-(\d+)/, (match, digits) => `e-${parseInt(digits)}`)) :
                        parseFloat(ammObj.LPTokenBalance);
                    asset1Data = ammObj.Asset?.currency === 'XRP' ?
                        { currency: 'XRP', issuer: '', name: 'XRP' } :
                        { currency: ammObj.Asset.currency, issuer: ammObj.Asset.issuer, name: xrpl.convertHexToString(ammObj.Asset.currency).replace(/\0/g, '') || 'Unknown' };
                    asset2Data = ammObj.Asset2?.currency === 'XRP' ?
                        { currency: 'XRP', issuer: '', name: 'XRP' } :
                        { currency: ammObj.Asset2.currency, issuer: ammObj.Asset2.issuer, name: xrpl.convertHexToString(ammObj.Asset2.currency).replace(/\0/g, '') || 'Unknown' };
                } catch (error) {
                    logGolemAlert(`Error fetching AMM object for ${lpName}: ${error.message}`, {}, true);
                    throw error;
                }
                if (!lpTokenSupply || lpTokenSupply <= 0) {
                    throw new Error(`Invalid LP token supply: ${lpTokenSupply}`);
                }
                let poolXrp = 0, poolToken = 0, tokenPriceInXrp = 0;
                const pairKey = `XRP-${asset2Data.name}`;
                const pairKeyReverse = `${asset2Data.name}-XRP`;
                if (priceHistory[pairKey] && priceHistory[pairKey].lastPrice && priceHistory[pairKey].poolXrp && priceHistory[pairKey].poolToken) {
                    poolXrp = priceHistory[pairKey].poolXrp;
                    poolToken = priceHistory[pairKey].poolToken;
                    tokenPriceInXrp = priceHistory[pairKey].lastPrice;
                } else if (priceHistory[pairKeyReverse] && priceHistory[pairKeyReverse].lastPrice && priceHistory[pairKeyReverse].poolXrp && priceHistory[pairKeyReverse].poolToken) {
                    poolXrp = priceHistory[pairKeyReverse].poolXrp;
                    poolToken = priceHistory[pairKeyReverse].poolToken;
                    tokenPriceInXrp = 1 / priceHistory[pairKeyReverse].lastPrice;
                } else {
                    try {
                        let ammInfo = await throttleRequest(() =>
                            client.request({
                                command: 'amm_info',
                                asset: asset1Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset1Data.currency, issuer: asset1Data.issuer },
                                asset2: asset2Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset2Data.currency, issuer: asset2Data.issuer },
                                ledger_index: 'current'
                            })
                        );
                        if (!ammInfo.result.amm) {
                            ammInfo = await throttleRequest(() =>
                                client.request({
                                    command: 'amm_info',
                                    asset: asset2Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset2Data.currency, issuer: asset2Data.issuer },
                                    asset2: asset1Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset1Data.currency, issuer: asset1Data.issuer },
                                    ledger_index: 'current'
                                })
                            );
                        }
                        if (ammInfo.result.amm && ammInfo.result.amm.amount && ammInfo.result.amm.amount2) {
                            const amount1 = ammInfo.result.amm.amount;
                            const amount2 = ammInfo.result.amm.amount2;
                            poolXrp = typeof amount1 === 'string' ? parseFloat(xrpl.dropsToXrp(amount1)) : parseFloat(xrpl.dropsToXrp(amount2));
                            poolToken = typeof amount1 === 'string' ? parseFloat(amount2.value) : parseFloat(amount1.value);
                            if (!isNaN(poolXrp) && !isNaN(poolToken) && poolToken !== 0) {
                                tokenPriceInXrp = poolXrp / poolToken;
                            } else {
                                throw new Error(`Invalid AMM pool data: poolXrp=${poolXrp}, poolToken=${poolToken}`);
                            }
                        } else {
                            throw new Error('No valid AMM pool found');
                        }
                    } catch (error) {
                        logGolemAlert(`Error fetching AMM for ${lpName}: ${error.message}`, {}, true);
                        throw error;
                    }
                }
                const lpShare = balance / lpTokenSupply;
                if (lpShare < 0 || lpShare > 1) {
                    throw new Error(`Invalid LP share: ${lpShare} (balance=${balance}, lpTokenSupply=${lpTokenSupply})`);
                }
                const totalPoolValueUsd = 2 * poolXrp * xrpUsdPrice;
                const totalPoolValueXrp = 2 * poolXrp;
                lpXrpValue = totalPoolValueXrp * lpShare;
                lpUsdValue = totalPoolValueUsd * lpShare;
                const lpSharePercent = (lpShare * 100).toFixed(4);
                assetBreakdown += `<li>${lpName}: ${formatBalance(balance)} ${lpName} / ${formatBalance(lpXrpValue)} XRP / $${formatBalance(lpUsdValue)} USD (${lpSharePercent}%)</li>`;
                
                totalXrp += lpXrpValue;
                totalUsd += lpUsdValue;
            } catch (error) {
                logGolemAlert(`Error processing LP token ${lpName}: ${error.message}`, {}, true);
                assetBreakdown += `<li>${lpName}: ${formatBalance(balance)} ${lpName} / Price unavailable</li>`;
            }
        }

        assetBreakdown += `</ul>`;
        golemAccountValue.textContent = `Current Account Value: ${formatBalance(totalXrp)} XRP / $${formatBalance(totalUsd)} USD`;
        golemAccountAssets.innerHTML = assetBreakdown;
    } catch (error) {
        logGolemAlert(`Error calculating account value: ${error.message}`, {}, true);
        golemAccountValue.textContent = 'Current Account Value: Error fetching data';
        golemAccountAssets.textContent = '';
    }
}

async function fetchGolemPrices() {
    const golemSection = document.getElementById('golem');
    const isMinimized = golemSection && golemSection.classList.contains('minimized');
    const errorElement = document.getElementById('golem-error');
    const thresholdInput = document.getElementById('alert-threshold');
    let alertThreshold = 0.05;
    if (thresholdInput) {
        const newThreshold = parseFloat(thresholdInput.value);
        if (!isNaN(newThreshold) && newThreshold >= 0.001 && newThreshold <= 10) {
            alertThreshold = newThreshold;
        }
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        if (errorElement && !isMinimized) errorElement.textContent = 'No account loaded. Please load an account first.';
        logGolemAlert('Error: No account loaded for fetching prices.', {}, true);
        return;
    }
    try {
        await ensureConnected();
        const now = Date.now();
        let xrpUsdPriceUpdated = false;
        let rlusdInPool = 0;
        let xrpToRlusdPrice = 0;
        const xrpRlusdKey = 'XRP-$RLUSD';
        const pairKeys = Object.keys(priceHistory);
        if (pairKeys.length === 0) {
            return;
        }
        const sortedPairKeys = pairKeys.includes(xrpRlusdKey)
            ? [xrpRlusdKey, ...pairKeys.filter(key => key !== xrpRlusdKey)]
            : pairKeys;
        for (const pairKey of sortedPairKeys) {
            const [baseAsset, quoteAsset] = pairKey.split('-');
            const baseAssetData = getAssetByName(baseAsset);
            const quoteAssetData = getAssetByName(quoteAsset);
            if (!baseAssetData || (baseAsset !== 'XRP' && (!baseAssetData.hex || !baseAssetData.issuer))) {
                logGolemAlert(`Invalid base asset data for ${baseAsset} in pair ${pairKey}`, {}, true);
                continue;
            }
            if (!quoteAssetData || (quoteAsset !== 'XRP' && (!quoteAssetData.hex || !quoteAssetData.issuer))) {
                logGolemAlert(`Invalid quote asset data for ${quoteAsset} in pair ${pairKey}`, {}, true);
                continue;
            }
            let ammInfo;
            try {
                ammInfo = await throttleRequest(() =>
                    client.request({
                        command: 'amm_info',
                        asset: baseAsset === 'XRP' ? { currency: 'XRP' } : { currency: baseAssetData.hex, issuer: baseAssetData.issuer },
                        asset2: quoteAsset === 'XRP' ? { currency: 'XRP' } : { currency: quoteAssetData.hex, issuer: quoteAssetData.issuer },
                        ledger_index: 'current'
                    })
                );
            } catch (error) {
                logGolemAlert(`Failed to fetch AMM info for ${pairKey} (primary): ${error.message}`, {}, true);
                continue;
            }
            let direction = baseAsset === 'XRP' ? 'XRP-to-Token' : 'Token-to-XRP';
            if (!ammInfo.result.amm) {
                try {
                    ammInfo = await throttleRequest(() =>
                        client.request({
                            command: 'amm_info',
                            asset: quoteAsset === 'XRP' ? { currency: 'XRP' } : { currency: quoteAssetData.hex, issuer: quoteAssetData.issuer },
                            asset2: baseAsset === 'XRP' ? { currency: 'XRP' } : { currency: baseAssetData.hex, issuer: baseAssetData.issuer },
                            ledger_index: 'current'
                        })
                    );
                    direction = baseAsset === 'XRP' ? 'Token-to-XRP' : 'XRP-to-Token';
                } catch (error) {
                    logGolemAlert(`Failed to fetch AMM info for ${pairKey} (secondary): ${error.message}`, {}, true);
                    continue;
                }
                if (!ammInfo.result.amm) {
                    logGolemAlert(`No AMM pool found for ${pairKey}`, {}, true);
                    continue;
                }
            }
            const amount1 = ammInfo.result.amm.amount;
            const amount2 = ammInfo.result.amm.amount2;
            const tradingFeeBasisPoints = ammInfo.result.amm.trading_fee || 0;
            const tradingFeePercent = (tradingFeeBasisPoints / 10000).toFixed(3);
            let baseAmount, quoteAmount;
            if (direction === 'XRP-to-Token') {
                baseAmount = parseFloat(xrpl.dropsToXrp(baseAsset === 'XRP' ? amount1 : amount2));
                quoteAmount = parseFloat(baseAsset === 'XRP' ? amount2.value : amount1.value);
            } else {
                baseAmount = parseFloat(baseAsset === 'XRP' ? amount2.value : amount1.value);
                quoteAmount = parseFloat(xrpl.dropsToXrp(baseAsset === 'XRP' ? amount1 : amount2));
            }
            let integerDigits = Math.floor(baseAmount).toString().replace(/^0+/, '') || '0';
            let maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 8;
            baseAmount = Number(baseAmount.toFixed(baseAsset === 'XRP' ? 6 : 2));
            integerDigits = Math.floor(quoteAmount).toString().replace(/^0+/, '') || '0';
            maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 8;
            quoteAmount = Number(quoteAmount.toFixed(quoteAsset === 'XRP' ? 6 : 2));
            let price = quoteAmount / baseAmount;
            if (pairKey === 'XRP-$RLUSD') {
                if (direction === 'Token-to-XRP') {
                    price = 1 / price;
                }
                if (price > 1) {
                    const newPrice = 1 / price;
                    price = newPrice;
                }
            }
            const truncatedPrice = Number(price.toFixed(8));
            const poolXrp = baseAsset === 'XRP' ? baseAmount : quoteAmount;
            const poolToken = baseAsset === 'XRP' ? quoteAmount : baseAmount;
            let tvlUsd = 0;
            let volume24h = 0;
            if (pairKey === 'XRP-$RLUSD') {
                rlusdInPool = poolToken;
                xrpUsdPrice = 1 / truncatedPrice;
                xrpToRlusdPrice = truncatedPrice;
                tvlUsd = 2 * rlusdInPool;
                xrpUsdPriceUpdated = true;
            } else if (xrpUsdPriceUpdated) {
                const tokenUsdPrice = xrpUsdPrice / truncatedPrice;
                const tokenUsdValue = poolToken * tokenUsdPrice;
                tvlUsd = 2 * tokenUsdValue;
            }
            if (!priceHistory[pairKey].initialPrice) priceHistory[pairKey].initialPrice = truncatedPrice;
            const lastPrice = priceHistory[pairKey].lastPrice || truncatedPrice;
            const lastAlertedPrice = priceHistory[pairKey].lastAlertedPrice !== null ? priceHistory[pairKey].lastAlertedPrice : lastPrice;
            priceHistory[pairKey].lastPrice = truncatedPrice;
            let changeInitial = priceHistory[pairKey].initialPrice ? ((truncatedPrice - priceHistory[pairKey].initialPrice) / priceHistory[pairKey].initialPrice) * 100 : 0;
            let changeLast = lastAlertedPrice ? ((truncatedPrice - lastAlertedPrice) / lastAlertedPrice) * 100 : 0;
            const isXrpRlusd = pairKey === 'XRP-$RLUSD';
            if (isXrpRlusd) {
                changeInitial = -changeInitial;
                changeLast = -changeLast;
            }
            const trend = calculateTrend(priceHistory[pairKey].prices);
            priceHistory[pairKey].prices.push(truncatedPrice);
            priceHistory[pairKey].tvls.push(tvlUsd);
            priceHistory[pairKey].volume.push(volume24h);
            priceHistory[pairKey].fees.push(tradingFeePercent);
            priceHistory[pairKey].timestamps.push(new Date().toLocaleString());
            if (priceHistory[pairKey].prices.length > 2880) {
                priceHistory[pairKey].prices.shift();
                priceHistory[pairKey].tvls.shift();
                priceHistory[pairKey].volume.shift();
                priceHistory[pairKey].fees.shift();
                priceHistory[pairKey].timestamps.shift();
            }
            if (!isMinimized) {
                const escapedPairKey = pairKey.replace('$', '--');
                const priceElement = document.getElementById(`golem-price-${escapedPairKey}`);
                const changeInitialElement = document.getElementById(`golem-change-initial-${escapedPairKey}`);
                const changeLastElement = document.getElementById(`golem-change-last-${escapedPairKey}`);
                const tvlElement = document.getElementById(`golem-tvl-${escapedPairKey}`);
                const reservesElement = document.getElementById(`golem-reserves-${escapedPairKey}`);
                if (priceElement) {
                    const priceInQuotePerBase = truncatedPrice;
                    const priceInBasePerQuote = 1 / priceInQuotePerBase;
                    let priceInUsd, priceInCents, displayPrice;
                    if (isXrpRlusd) {
                        displayPrice = `1 XRP = $${formatBalance(1 / priceInQuotePerBase)}`;
                    } else if (baseAsset === 'XRP') {
                        priceInUsd = xrpUsdPrice / priceInQuotePerBase;
                        priceInCents = priceInUsd * 100;
                        displayPrice = `1 XRP = ${formatBalance(priceInQuotePerBase)} ${quoteAsset}<br>1 ${quoteAsset} = $${priceInUsd.toFixed(10)}<br>1 ${quoteAsset} = ${priceInCents.toFixed(10)}¢`;
                    } else {
                        priceInUsd = priceInBasePerQuote * xrpUsdPrice;
                        priceInCents = priceInUsd * 100;
                        displayPrice = `1 ${baseAsset} = ${formatBalance(priceInBasePerQuote)} XRP<br>1 ${baseAsset} = $${priceInUsd.toFixed(10)}<br>1 ${baseAsset} = ${priceInCents.toFixed(10)}¢`;
                    }
                    priceElement.innerHTML = displayPrice;
                    priceElement.className = changeLast > 0 ? 'price-up' : changeLast < 0 ? 'price-down' : '';
                }
                if (changeInitialElement) {
                    changeInitialElement.textContent = `${Number(changeInitial.toFixed(6))}%`;
                }
                if (changeLastElement) {
                    changeLastElement.textContent = `${Number(changeLast.toFixed(6))}%`;
                    changeLastElement.className = changeLast > 0 ? 'price-up' : changeLast < 0 ? 'price-down' : '';
                }
                if (tvlElement) {
                    tvlElement.textContent = `$${formatBalance(tvlUsd)}`;
                }
                if (reservesElement) {
                    reservesElement.textContent = `${formatBalance(poolXrp)} XRP, ${formatBalance(poolToken)} ${quoteAsset}`;
                }
                updateGolemChart(pairKey, 'price');
                updateGolemChart(pairKey, 'tvl');
            }
            if (Math.abs(changeInitial) >= alertThreshold) {
                const alertMessage = `ALERT: ${pairKey} price changed by ${Number(changeInitial.toFixed(6))}% from initial price`;
                const alertData = {
                    pairKey,
                    price: truncatedPrice,
                    changeInitial,
                    changeLast,
                    tvlUsd,
                    poolXrp,
                    poolToken,
                    quoteAsset,
                    trend
                };
                logGolemAlert(alertMessage, alertData);
                priceHistory[pairKey].lastAlertedPrice = truncatedPrice;
                const audio = new Audio('sounds/3.mp3');
                audio.play().catch(error => logGolemAlert(`Error playing alert sound: ${error.message}`, {}, true));
            }
        }
        if (!xrpUsdPriceUpdated && Object.keys(priceHistory).includes('XRP-$RLUSD')) {
            logGolemAlert('XRP/$RLUSD price not updated. Using last known value.', {}, true);
        }
        if (errorElement && !isMinimized) errorElement.textContent = '';
        if (!isMinimized) await calculateAccountValue();
    } catch (error) {
        if (errorElement && !isMinimized) errorElement.textContent = `Error fetching prices: ${error.message}`;
        logGolemAlert(`Error fetching Golem prices: ${error.message}`, {}, true);
        if (!isMinimized) await calculateAccountValue();
    }
}

function updateGolemChart(pairKey, type) {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        return;
    }
    if (!golemCharts[pairKey]?.[type]) {
        return;
    }
    const chart = golemCharts[pairKey][type];
    const data = type === 'price' ? priceHistory[pairKey].prices : priceHistory[pairKey].tvls;
    const isXrpRlusd = pairKey === 'XRP-$RLUSD';
    if (isXrpRlusd && type === 'price') {
        chart.data.datasets[0].data = data.map(price => 1 / price);
    } else {
        chart.data.datasets[0].data = data;
    }
    chart.data.labels = priceHistory[pairKey].timestamps;
    chart.update();
}

function calculateTrend(prices) {
    if (prices.length < 5) return 'Neutral';
    const recent = prices.slice(-10);
    const avgChange = recent.reduce((sum, price, i) => i > 0 ? sum + (price - recent[i-1]) : sum, 0) / (recent.length - 1);
    return avgChange > 0.001 ? 'Upward' : avgChange < -0.001 ? 'Downward' : 'Stable';
}

function startGolemTracking() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        shouldStartTracking = true;
        return;
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        logGolemAlert('Error: No account loaded. Please load an account first.', {}, true);
        return;
    }
    if (golemTrackingInterval) {
        return;
    }
    golemTrackingInterval = setInterval(fetchGolemPrices, POLL_INTERVAL);
    fetchGolemPrices();
}

function stopGolemTracking() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to stop tracking.', {}, true);
        return;
    }
    if (golemTrackingInterval) {
        clearInterval(golemTrackingInterval);
        golemTrackingInterval = null;
        shouldStartTracking = false;
        logGolemAlert('Golem tracking stopped.');
    }
}

function clearGolemHistory() {
    const golemSection = document.getElementById('golem');
    if (!golemSection || golemSection.classList.contains('minimized')) {
        logGolemAlert('Error: Golem section is minimized. Expand to clear history.', {}, true);
        return;
    }
    const pairsContainer = document.getElementById('golem-pairs-container');
    if (!pairsContainer) return;
    for (const pairKey of Object.keys(priceHistory)) {
        if (pairKey === 'XRP-$RLUSD') continue;
        const pairBlock = document.getElementById(`golem-pair-${pairKey.replace('$', '--')}`);
        if (pairBlock) pairBlock.remove();
        delete priceHistory[pairKey];
        if (golemCharts[pairKey]) {
            golemCharts[pairKey].price?.destroy();
            golemCharts[pairKey].tvl?.destroy();
            delete golemCharts[pairKey];
        }
    }
    logGolemAlert('Golem history cleared (preserving XRP/$RLUSD).');
}

document.addEventListener('DOMContentLoaded', () => {
    const golemSection = document.getElementById('golem');
    if (golemSection) {
        golemSection.querySelector('.section-header').addEventListener('click', async () => {
            if (!golemSection.classList.contains('minimized') && !isGolemInitialized) {
                if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
                    logGolemAlert('Error: No account loaded. Please load an account first.', {}, true);
                    return;
                }
                await checkBalance();
                initializeGolemDropdowns();
                if (!priceHistory['XRP-$RLUSD']) {
                    await addGolemPair(
                        'XRP', '$RLUSD',
                        'XRP', '',
                        '524C555344000000000000000000000000000000', 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
                        true
                    );
                }
                if (shouldStartTracking && !golemTrackingInterval) {
                    golemTrackingInterval = setInterval(fetchGolemPrices, POLL_INTERVAL);
                    fetchGolemPrices();
                    shouldStartTracking = false;
                }
                isGolemInitialized = true;
            }
        });
    }
});
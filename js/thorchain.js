function thorchain_log(message) {
    var outputBox = document.getElementById('output');
    if (outputBox && typeof log === 'function') {
        log('[THORChain ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + '] ' + message);
    } else {
        console.log('[THORChain ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + '] ' + message);
    }
}

// Hello Slim lizards! I am leaving this message because someone will see it.
// Hi, that is all I wanted to say. LOL, ok... Hope you are doing well.
// This is The Surfer Report's custom SDK, :D It can handle POST and GET, however! It will not support for API key demands, I had it in here but removed it because I did not get a 0 fees api key from swapkit for my side of fees.
// In a later version I may add and update for that, or you can add it if you need to use this and upgrade for that swap. I think I have the best rates coded in as far as providers go! so, it is what it is.

function thorchain_checkInbound(callback) {
    thorchain_log('Checking THORChain inbound addresses');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://thornode.ninerealms.com/thorchain/inbound_addresses', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var xrpInbound = data.find(addr => addr.chain === 'XRP');
                    if (xrpInbound) {
                        var halted = xrpInbound.halted;
                        var gasRate = xrpInbound.gas_rate;
                        thorchain_log('XRP chain status: ' + (halted ? 'halted' : 'active') + ', gas_rate: ' + gasRate);
                        callback(!halted, gasRate, data);
                    } else {
                        thorchain_log('No XRP inbound data found');
                        callback(false, null, null);
                    }
                } catch (error) {
                    thorchain_log('Inbound addresses parse failed: ' + error.message);
                    callback(false, null, null);
                }
            } else {
                thorchain_log('Inbound addresses check failed: HTTP ' + xhr.status);
                callback(false, null, null);
            }
        }
    };
    xhr.onerror = function (error) {
        thorchain_log('Inbound addresses check failed: ' + error.message);
        callback(false, null, null);
    };
    xhr.send();
}


function thorchain_loadMyAddress() {
    thorchain_log('Attempting to load wallet address');
    var sourceAddressInput = document.getElementById('thorchain_source_address');
    var errorDisplay = document.getElementById('thorchain_error');
    if (!sourceAddressInput || !errorDisplay) {
        thorchain_log('Error: Missing DOM elements (source_address or error)');
        return;
    }

    
    var attempts = 0;
    var maxAttempts = 1;
    function tryLoadAddress() {
        if (typeof globalAddress === 'string' && xrpl.isValidAddress(globalAddress)) {
            sourceAddressInput.value = globalAddress;
            errorDisplay.textContent = '';
            thorchain_log('Loaded wallet address: ' + globalAddress);
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                thorchain_log('Retry ' + attempts + '/' + maxAttempts + ': No valid wallet address found');
                setTimeout(tryLoadAddress, 500);
            } else {
                errorDisplay.textContent = 'No wallet address available. Please load a wallet in Wallet Management.';
                thorchain_log('Error: No valid wallet address found after retries');
            }
        }
    }
    tryLoadAddress();
}


function thorchain_displayQuotes(quotes, buyAsset, quoteResult, errorDisplay) {
    quoteResult.innerHTML = '<h3>Available Quotes</h3>';
    quotes.forEach((q, index) => {
        quoteResult.innerHTML += '<div class="quote-item">' +
            '<p><strong>Provider:</strong> ' + q.provider + '</p>' +
            '<p><strong>Expected Amount:</strong> ' + q.expected_amount_out + ' ' + buyAsset.split('.')[1] + '</p>' +
            '<p><strong>Fee (total cost including slippage):</strong> ' + (q.fees ? q.fees.total : 'N/A') + ' XRP</p>' +
            '<p><strong>Slippage:</strong> ' + q.slippage + '%</p>' +
            '<p><strong>Inbound Address:</strong> <a class="address-link" href="https://xrpscan.com/account/' + q.inbound_address + '" target="_blank">' + q.inbound_address + '</a></p>' +
            '<p><strong>Memo:</strong> ' + (q.memo || 'N/A') + '</p>' +
            '<button class="green-btn" onclick="selectThorchainQuote(' + index + ')">Select this Quote</button>' +
            '</div>';
    });
    document.getElementById('thorchain_execute_btn').disabled = true;
    window.thorchain_quotes = quotes;
}


window.selectThorchainQuote = function(index) {
    window.thorchain_quote = window.thorchain_quotes[index];
    document.getElementById('thorchain_execute_btn').disabled = false;
    thorchain_log('Selected quote from ' + window.thorchain_quotes[index].provider);
}


function normalizeQuote(rawData, provider) {
    let normalized = {};
    let totalFee = 0;
    let slippage = '0';
    if (provider === 'dkit') {
        if (rawData.routes) rawData = rawData.routes[0];
        normalized.expected_amount_out = rawData.expectedBuyAmount || rawData.expected_amount_out || '0';
        normalized.inbound_address = rawData.inboundAddress || rawData.inbound_address;
        normalized.memo = rawData.memo;
        if (rawData.fees) {
            rawData.fees.forEach(f => {
                if (f.asset === 'XRP.XRP') {
                    totalFee += parseFloat(f.amount);
                }
            });
        }
        normalized.fees = { total: totalFee.toString() };
        if (rawData.meta && rawData.meta.totalSlippageBps) {
            slippage = (rawData.meta.totalSlippageBps / 100).toFixed(2);
        } else {
            slippage = '0';
        }
    } else if (provider === 'THORChain') {
        normalized.expected_amount_out = (parseFloat(rawData.expected_amount_out) / 1e8).toFixed(8);
        normalized.inbound_address = rawData.inbound_address;
        normalized.memo = rawData.memo;
        totalFee = parseFloat(rawData.fees.total) / 1e8;
        normalized.fees = { total: totalFee.toFixed(8) };
        if (rawData.slip) {
            slippage = parseFloat(rawData.slip).toFixed(2);
        }
    }
    normalized.slippage = slippage;
    return normalized;
}


function thorchain_fetchQuote() {
    thorchain_log('Starting fetch quote');
    var sourceAddress = document.getElementById('thorchain_source_address').value;
    var destinationAddress = document.getElementById('thorchain_destination_address').value;
    var buyAsset = document.getElementById('thorchain_buy_asset').value;
    var sellAmount = document.getElementById('thorchain_sell_amount').value;
    var includeTx = document.getElementById('thorchain_include_tx').checked;
    var errorDisplay = document.getElementById('thorchain_error');
    var quoteResult = document.getElementById('thorchain_quote_result');

    if (!sourceAddress || !errorDisplay || !quoteResult) {
        thorchain_log('Error: Missing DOM elements for fetch quote');
        return;
    }

    if (!sourceAddress || !xrpl.isValidAddress(sourceAddress)) {
        errorDisplay.textContent = 'Invalid XRP source address.';
        thorchain_log('Invalid XRP source address');
        return;
    }
    if (!destinationAddress) {
        errorDisplay.textContent = 'Destination address is required.';
        thorchain_log('Destination address is required');
        return;
    }
    if (!buyAsset) {
        errorDisplay.textContent = 'Please select a buy asset.';
        thorchain_log('No buy asset selected');
        return;
    }
    if (!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) < 1) {
        errorDisplay.textContent = 'Invalid sell amount (must be at least 1 XRP).';
        thorchain_log('Invalid sell amount');
        return;
    }

    errorDisplay.textContent = '';
    quoteResult.innerHTML = '<p>Fetching quote...</p>';
    thorchain_log('Sending quote request: ' + sellAmount + ' XRP to ' + buyAsset);

    var basePayload = {
        destinationAddress: destinationAddress,
        buyAsset: buyAsset,
        sellAmount: sellAmount,
        sellAsset: 'XRP.XRP',
        sourceAddress: sourceAddress,
        includeTx: includeTx
    };

    thorchain_checkInbound(function (networkActive, gasRate, inboundData) {
        if (!networkActive) {
            errorDisplay.textContent = 'THORChain network halted for XRP. Try again later.';
            thorchain_log('Network halted for XRP');
            return;
        }

        
        const providers = [
            { name: 'dkit', url: 'https://crunchy.dorito.club/api/quote', method: 'POST' },
            { name: 'THORChain', url: 'https://thornode.ninerealms.com/thorchain/quote/swap', method: 'GET' }
        ];

        let quotes = [];
        let completed = 0;
        let errors = 0;

        providers.forEach(provider => {
            let payload = { ...basePayload };
            if (provider.method === 'GET') {
                payload = {
                    from_asset: 'XRP.XRP',
                    to_asset: buyAsset,
                    amount: (parseFloat(sellAmount) * 1e8).toFixed(0),
                    destination: destinationAddress
                };
            }
            thorchain_sendQuoteRequest(provider.url, payload, buyAsset, provider.method, provider.name, (data, err) => {
                completed++;
                if (err) {
                    errors++;
                    thorchain_log('Error from ' + provider.name + ': ' + err);
                } else {
                    thorchain_log('Quote from ' + provider.name + ': ' + data.expected_amount_out);
                    data.provider = provider.name;
                    quotes.push(data);
                }
                if (completed === providers.length) {
                    if (quotes.length > 0) {
                        
                        quotes.sort((a, b) => parseFloat(b.expected_amount_out) - parseFloat(a.expected_amount_out));
                        thorchain_displayQuotes(quotes, buyAsset, quoteResult, errorDisplay);
                    } else {
                        thorchain_log('All providers failed');
                        errorDisplay.textContent = 'Failed to fetch quotes from all providers.';
                    }
                }
            });
        });
    });
}


function thorchain_sendQuoteRequest(endpoint, payload, buyAsset, method, provider, callback) {
    let options = {
        method: method,
        headers: {
            'Accept': 'application/json'
        },
        mode: 'cors'
    };

    let url = endpoint;

    if (method === 'GET') {
        const params = new URLSearchParams(payload);
        url += '?' + params.toString();
    } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(payload);
    }

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('HTTP ' + response.status);
            }
        })
        .then(rawData => {
            var data = normalizeQuote(rawData, provider);
            if (!data.inbound_address || !data.expected_amount_out) {
                throw new Error('Invalid quote response: missing required fields after normalization.');
            }
            callback(data, null);
        })
        .catch(error => {
            thorchain_log('Error from ' + provider + ': ' + error.message);
            callback(null, error.message);
        });
}


async function thorchain_executeSwap() {
    thorchain_log('Starting transaction execution');
    var errorDisplay = document.getElementById('thorchain_error');
    var queueDisplay = document.getElementById('thorchain_queue');
    var quote = window.thorchain_quote;
    var sourceAddress = document.getElementById('thorchain_source_address').value;
    var sellAmount = document.getElementById('thorchain_sell_amount').value;

    if (!quote) {
        errorDisplay.textContent = 'No valid quote available. Please fetch a quote first.';
        thorchain_log('No valid quote available');
        return;
    }
    if (!sourceAddress || !xrpl.isValidAddress(sourceAddress)) {
        errorDisplay.textContent = 'Invalid XRP source address.';
        thorchain_log('Invalid XRP source address');
        return;
    }
    if (!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) < 1) {
        errorDisplay.textContent = 'Invalid sell amount (must be at least 1 XRP).';
        thorchain_log('Invalid sell amount');
        return;
    }
    if (!contentCache || !displayTimer) {
        errorDisplay.textContent = 'No wallet loaded for signing transaction.';
        thorchain_log('No wallet loaded');
        return;
    }

    errorDisplay.textContent = '';
    queueDisplay.innerHTML = '<p>Preparing transaction...</p>';
    thorchain_log('Preparing transaction for ' + sellAmount + ' XRP to ' + quote.inbound_address);

    thorchain_checkInbound(async function (networkActive, gasRate, inboundData) {
        if (!networkActive) {
            errorDisplay.textContent = 'THORChain network halted for XRP. Cannot execute transaction.';
            thorchain_log('Network halted for XRP');
            queueDisplay.innerHTML = '<p>Transaction Queue: No transactions in queue.</p>';
            return;
        }

        var amountDrops = Math.floor(parseFloat(sellAmount) * 1000000).toString();
        var memo = quote.memo;
        if (memo.length > 80) {
            memo = memo.substring(0, 79) + '^';
        }
        var tx = {
            TransactionType: 'Payment',
            Account: sourceAddress,
            Amount: amountDrops,
            Destination: quote.inbound_address,
            Fee: gasRate,
            Memos: memo ? [{
                Memo: {
                    MemoData: new TextEncoder().encode(memo).reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '').toUpperCase(),
                    MemoType: new TextEncoder().encode('Memo').reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '').toUpperCase()
                }
            }] : []
        };

        var description = `THORChain Swap: Send ${sellAmount} XRP to ${quote.inbound_address}${memo ? ` with memo "${memo}"` : ''}`;

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);

        var txEntry = {
            tx: tx,
            wallet: wallet,
            description: description,
            delayMs: 0,
            type: "payment",
            queueElementId: "transaction-queue-transactions"
        };

        transactionQueue.push(txEntry);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }

        queueDisplay.innerHTML = '<p>Transaction queued.</p>';
        thorchain_log('Transaction queued for processing');
        window.thorchain_quote = null;
        document.getElementById('thorchain_execute_btn').disabled = true;
    });
}


function thorchain_init() {
    thorchain_log('Initializing THORChain module');
    var requiredElements = [
        'thorchain_source_address',
        'thorchain_buy_asset',
        'thorchain_error',
        'thorchain_quote_result',
        'output'
    ];
    var missingElements = requiredElements.filter(function (id) { return !document.getElementById(id); });
    if (missingElements.length > 0) {
        thorchain_log('Error: Missing DOM elements: ' + missingElements.join(', '));
    } else {
        thorchain_log('All required DOM elements found');
        
        var sourceAddressInput = document.getElementById('thorchain_source_address');
        if (sourceAddressInput && !sourceAddressInput.value && typeof globalAddress === 'string' && xrpl.isValidAddress(globalAddress)) {
            sourceAddressInput.value = globalAddress;
            thorchain_log('Auto-loaded wallet address: ' + globalAddress);
        }
    }
}
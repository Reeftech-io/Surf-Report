const ASF_DEFAULT_RIPPLE = 8;
const ASF_REQUIRE_AUTH = 2;
const ASF_DISALLOW_XRP = 3;
const ASF_DISABLE_MASTER = 4;
const ASF_NO_FREEZE = 6;
const ASF_GLOBAL_FREEZE = 7;
const ASF_DEPOSIT_AUTH = 9;
const ASF_ALLOW_TRUSTLINE_CLAWBACK = 16;
const ACCOUNT_LSF_DEFAULT_RIPPLE = 0x00800000;
const ACCOUNT_LSF_GLOBAL_FREEZE = 0x00400000;
const ACCOUNT_LSF_CLAWBACK = 0x80000000;
const ACCOUNT_LSF_NO_FREEZE = 0x00200000;
const ACCOUNT_LSF_REQUIRE_AUTH = 0x00040000;
const ACCOUNT_LSF_DISALLOW_XRP = 0x00080000;
const ACCOUNT_LSF_DISABLE_MASTER = 0x00100000;
const ACCOUNT_LSF_DEPOSIT_AUTH = 0x01000000;
const ACCOUNT_LSF_REQUIRE_DEST_TAG = 0x00010000;
const TRUSTLINE_LSF_LOW_RESERVE = 0x00010000;
const TRUSTLINE_LSF_HIGH_RESERVE = 0x00020000;
const TRUSTLINE_LSF_LOW_AUTH = 0x00040000;
const TRUSTLINE_LSF_HIGH_AUTH = 0x00080000;
const TRUSTLINE_LSF_LOW_NO_RIPPLE = 0x00100000;
const TRUSTLINE_LSF_HIGH_NO_RIPPLE = 0x00200000;
const TRUSTLINE_LSF_PEER_AUTHORIZED = 0x00400000;
const TRUSTLINE_LSF_LOW_FREEZE = 0x00800000;
const TRUSTLINE_LSF_HIGH_FREEZE = 0x01000000;
const TRUSTLINE_LSF_LOW_QUALITY_IN = 0x02000000;
const TRUSTLINE_LSF_HIGH_QUALITY_IN = 0x04000000;
const TRUSTLINE_LSF_LOW_QUALITY_OUT = 0x08000000;
const TRUSTLINE_LSF_HIGH_QUALITY_OUT = 0x10000000;
const TF_SET_FREEZE = 0x00100000;
const TF_CLEAR_FREEZE = 0x00200000;
const TF_SETF_AUTH = 0x00010000;
const TF_SET_NO_RIPPLE = 0x00020000;
const TF_CLEAR_NO_RIPPLE = 0x00040000;

let client = null;
let transactionQueue = [];
let isProcessingQueue = false;
let isConnecting = false;
const TRANSACTION_FEE_DROPS = "12";
let globalAddress = "";
let passwordResolve = null;
const BASE_RESERVE_XRP = 1;
const TRUSTLINE_RESERVE_XRP = 0.2;
const ACCOUNT_DELETE_FEE_XRP = 0.2;
let contentCache = null;
let displayTimer = null;
let encryptedPasswords = null;
let passwordSessionKey = null;
let isWalletFreshlyCreated = false;
const ammState = {
    lastPoolPrice: null,
    lastPriceCheckTimestamp: null
};
let cachedBalance = { totalBalanceXrp: 0, totalReserveXrp: 0, availableBalanceXrp: 0, timestamp: 0 };
const poolLogPrefixXrplAssetsBasePair = "XrplAssetsBasePair_X7k9PqWvT2mY8nL5jR3";
let dynamicAssets = [];

function convertCurrencyCode(code) {
    if (!code) return null;
    const upperCode = code.toUpperCase();
    return upperCode.length <= 3 ? upperCode : xrpl.convertStringToHex(upperCode).padEnd(40, '0');
}

function copyAccountAddress() {
    const addressElement = document.getElementById('account-address');
    const addressText = addressElement.textContent || addressElement.innerText;
    const addressMatch = addressText.match(/Address:\s*(r[a-zA-Z0-9]+)/);
    if (!addressMatch || !addressMatch[1]) {
        alert('No account address found to copy.');
        return;
    }
    
    const address = addressMatch[1];
    navigator.clipboard.writeText(address).then(() => {
        alert('Address copied to clipboard: ' + address);
    }).catch(err => {
        console.error('Failed to copy address: ', err);
        alert('Failed to copy address. Please copy it manually.');
    });
}


function randomizeServerSelection() {
    const serverSelect = document.getElementById('wss-server');
    if (!serverSelect) {
        log('Error: #wss-server dropdown not found on page load.');
        return;
    }

    const options = serverSelect.options;
    if (options.length === 0) {
        log('Error: No server options available in #wss-server.');
        return;
    }

    const selectedIndex = options.length === 1 ? 0 : Math.floor(Math.random() * options.length);
    serverSelect.selectedIndex = selectedIndex;
    log(`Random server = ${options[selectedIndex].text}`);
}

function getDexscreenerChartUrl(assetName, hex, issuer) {
    if (assetName === "XRP" || !hex || !issuer) {
        return null;
    }
 
    const formattedHex = hex.toLowerCase();
    const formattedIssuer = issuer.toLowerCase();
 
    const embedParams = "embed=1&loadChartSettings=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15";
    return `https://dexscreener.com/xrpl/${formattedHex}.${formattedIssuer}_xrp?${embedParams}`;
}


function validateFamilyWalletInputs() {
    const seedInput = document.getElementById('family-seed-input');
    const addressInput = document.getElementById('family-address-input');
    const unencryptedButton = document.getElementById('download-unencrypted-family-wallet');
    const encryptedButton = document.getElementById('download-encrypted-family-wallet');

    if (!seedInput || !addressInput || !unencryptedButton || !encryptedButton) {
        log('Error: Family wallet input elements not found.');
        return;
    }

    const seed = seedInput.value.trim();
    const address = addressInput.value.trim();

    
    const isSeedValid = seed.match(/^s[0-9a-zA-Z]{27,}$/);
    
    const isAddressValid = xrpl.isValidAddress(address);

    
    const areInputsValid = isSeedValid && isAddressValid;
    unencryptedButton.disabled = !areInputsValid;
    encryptedButton.disabled = !areInputsValid;

    
    if (areInputsValid) {
        try {
            const wallet = xrpl.Wallet.fromSeed(seed);
            if (wallet.classicAddress !== address) {
                log('Error: The provided seed does not match the address.');
                unencryptedButton.disabled = true;
                encryptedButton.disabled = true;
            }
        } catch (error) {
            log(`Error validating seed: ${error.message}`);
            unencryptedButton.disabled = true;
            encryptedButton.disabled = true;
        }
    }
}


async function downloadUnencryptedFamilyWallet() {
    const seedInput = document.getElementById('family-seed-input');
    const addressInput = document.getElementById('family-address-input');
    const errorElement = document.getElementById('address-error');

    if (!seedInput || !addressInput || !errorElement) {
        log('Error: Family wallet input elements not found.');
        return;
    }

    const seed = seedInput.value.trim();
    const address = addressInput.value.trim();

    try {

        if (!seed.match(/^s[0-9a-zA-Z]{27,}$/) || !xrpl.isValidAddress(address)) {
            log('Error: Invalid seed or address.');
            errorElement.textContent = 'Invalid seed or address.';
            return;
        }

        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: The provided seed does not match the address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }


        await downloadUnencryptedWallet(seed, address);
        log('Unencrypted family wallet downloaded successfully.');
    } catch (error) {
        log(`Error downloading unencrypted family wallet: ${error.message}`);
        errorElement.textContent = `Error: ${error.message}`;
    }
}


async function downloadEncryptedFamilyWallet() {
    const seedInput = document.getElementById('family-seed-input');
    const addressInput = document.getElementById('family-address-input');
    const errorElement = document.getElementById('address-error');

    if (!seedInput || !addressInput || !errorElement) {
        log('Error: Family wallet input elements not found.');
        return;
    }

    const seed = seedInput.value.trim();
    const address = addressInput.value.trim();

    try {

        if (!seed.match(/^s[0-9a-zA-Z]{27,}$/) || !xrpl.isValidAddress(address)) {
            log('Error: Invalid seed or address.');
            errorElement.textContent = 'Invalid seed or address.';
            return;
        }

        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: The provided seed does not match the address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }


        await g7(seed, address);
        log('Encrypted family wallet downloaded successfully.');
    } catch (error) {
        log(`Error downloading encrypted family wallet: ${error.message}`);
        errorElement.textContent = `Error: ${error.message}`;
    }
}

const walletManagementSection = document.getElementById('wallet-management');
if (walletManagementSection) {
    const seedInput = document.getElementById('family-seed-input');
    const addressInput = document.getElementById('family-address-input');
    if (seedInput && addressInput) {
        seedInput.addEventListener('input', validateFamilyWalletInputs);
        addressInput.addEventListener('input', validateFamilyWalletInputs);
    }
}

function hexToString(hex) {
    return hex.match(/.{1,2}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
}

async function updateAssetChart() {
    const inputAssetDisplay = document.getElementById('swap-input-asset-display');
    const outputAssetDisplay = document.getElementById('swap-output-asset-display');
    const chartContainer = document.getElementById('asset-chart-container');
    const chartIframe = document.getElementById('asset-chart');
    const chartError = document.getElementById('chart-error');
    const chartLoading = document.getElementById('chart-loading');

    if (!inputAssetDisplay || !outputAssetDisplay || !chartContainer || !chartIframe || !chartError || !chartLoading) {
        log('Error: Chart or asset display elements not found.');
        return;
    }

    const inputAsset = inputAssetDisplay.getAttribute('data-value');
    const outputAsset = outputAssetDisplay.getAttribute('data-value');

    
    let chartAssetName, chartHex, chartIssuer;
    if (inputAsset !== "XRP") {
        chartAssetName = inputAsset;
        chartHex = inputAssetDisplay.getAttribute('data-hex');
        chartIssuer = inputAssetDisplay.getAttribute('data-issuer');
    } else if (outputAsset !== "XRP") {
        chartAssetName = outputAsset;
        chartHex = outputAssetDisplay.getAttribute('data-hex');
        chartIssuer = outputAssetDisplay.getAttribute('data-issuer');
    } else {
        
        chartContainer.style.display = 'none';
        chartError.textContent = '';
        chartLoading.style.display = 'none';
        return;
    }

    const chartUrl = getDexscreenerChartUrl(chartAssetName, chartHex, chartIssuer);
    if (!chartUrl) {
        chartContainer.style.display = 'none';
        chartError.textContent = 'No chart available for XRP.';
        chartLoading.style.display = 'none';
        return;
    }

    
    chartIframe.onload = null;
    chartIframe.onerror = null;

    
    chartContainer.style.display = 'block';
    chartLoading.style.display = 'block';
    chartError.textContent = '';

    
    chartIframe.onload = () => {
        chartContainer.style.display = 'block';
        chartLoading.style.display = 'none';
        chartError.textContent = '';
        
    };

    chartIframe.onerror = () => {
        chartContainer.style.display = 'none';
        chartLoading.style.display = 'none';
        chartError.textContent = `Error loading chart for ${chartAssetName}.`;
        log(`Error loading chart for ${chartAssetName}: Failed to load iframe`);
    };

    
    chartIframe.src = chartUrl;
}

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
    return await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 500000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function deriveOuterKey(salt) {
    try {
        const hash = await argon2.hash({
            pass: poolLogPrefixXrplAssetsBasePair,
            salt: salt,
            time: 3,
            mem: 64 * 1024,
            parallelism: 4,
            hashLen: 32,
            type: argon2.Argon2id
        });
        return await crypto.subtle.importKey(
            "raw",
            hash.hash,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    } catch (error) {
        throw new Error(`Outer key derivation failed: ${error.message}`);
    }
}

function a1(length = 32) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_!@#$%^&*";
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => chars[b % chars.length]).join("");
}


function truncateAmount(amount) {
    if (isNaN(amount) || amount <= 0) return "0";
    
    const num = parseFloat(amount);
    const numStr = num.toFixed(20).replace(/\.?0+$/, '');
    const [integerPart, decimalPart = ""] = numStr.split(".");
    const integerDigits = integerPart.replace(/^0+/, '') || '0';
    
    
    if (!decimalPart || decimalPart === "0") {
        return integerDigits;
    }
    
    
    let maxDecimalPlaces = 6;
    if (integerDigits.length >= 9) {
        maxDecimalPlaces = Math.max(0, 15 - integerDigits.length);
    }
    
    const formatted = num.toFixed(maxDecimalPlaces).replace(/\.?0+$/, '');
    return formatted;
}

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

async function validateBalancesForTransaction(address, amount, asset) {
    try {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { isValid: false, message: 'Invalid amount.' };
        }

        await ensureConnected();
        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        });
        const xrpBalance = parseFloat(xrpl.dropsToXrp(accountInfo.result.account_data.Balance));
        const transactionFeeXrp = xrpl.dropsToXrp(TRANSACTION_FEE_DROPS);

        if (!asset) {

            const reserve = await getReserveAmount();
            const availableBalanceXrp = xrpBalance - reserve;
            if ((parsedAmount + transactionFeeXrp) > availableBalanceXrp) {
                return {
                    isValid: false,
                    message: `Insufficient XRP balance. Available: ${formatBalance(availableBalanceXrp)} XRP`
                };
            }
            return { isValid: true, availableBalanceXrp };
        }


        let balance = 0;
        if (asset.hex && asset.issuer) {

            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            });
            const line = accountLines.result.lines.find(l => l.currency === asset.hex && l.account === asset.issuer);
            balance = parseFloat(line?.balance) || 0;
        } else {

            const lpToken = globalLPTokens.find(token => token.lpName === document.getElementById('send-asset-display').getAttribute('data-value'));
            if (!lpToken) {
                return { isValid: false, message: `LP token not found in wallet.` };
            }
            balance = parseFloat(lpToken.balance) || 0;
        }

        if (parsedAmount > balance) {
            return {
                isValid: false,
                message: `Insufficient balance for ${asset?.hex || 'LP token'}. Available: ${formatBalance(balance)}`
            };
        }


        const availableBalanceXrp = xrpBalance - await getReserveAmount();
        if (transactionFeeXrp > availableBalanceXrp) {
            return {
                isValid: false,
                message: `Insufficient XRP for fees. Available: ${formatBalance(availableBalanceXrp)} XRP`
            };
        }

        return { isValid: true, availableBalanceXrp };
    } catch (error) {
        log(`Balance validation error: ${error.message}`);
        return { isValid: false, message: `Error validating balance: ${error.message}` };
    }
}

async function b2(salt, x) {
    try {
        const hash = await argon2.hash({
            pass: x,
            salt: salt,
            time: 10,
            mem: 256 * 1024,
            parallelism: 4,
            hashLen: 32,
            type: argon2.Argon2id
        });
        return await crypto.subtle.importKey(
            "raw",
            hash.hash,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    } catch (error) {
        throw new Error(`Argon2 key derivation failed: ${error.message}`);
    }
}
function stringToHex(str) {
    return str.split('')
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
}

function arrayBufferToBase64(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const binary = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
    try {
        return btoa(binary);
    } catch (error) {
        log(`Base64 encoding error: ${error.message}`);
        console.error("Failed to encode:", uint8Array, error);
        throw error;
    }
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

async function initializePasswordSessionKey() {
    const randomPassword = a1(32);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await argon2.hash({
        pass: randomPassword,
        salt: salt,
        time: 3,
        mem: 64 * 1024,
        parallelism: 4,
        hashLen: 32,
        type: argon2.Argon2id
    });
    passwordSessionKey = await crypto.subtle.importKey(
        "raw",
        hash.hash,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
    return { salt, randomPassword };
}

async function updateDisplayData(dataItem) {
    if (!dataItem || typeof dataItem !== 'string') {
        throw new Error("Data item must be a non-empty string.");
    }

    const textProcessor = new TextEncoder();
    const styleOffset = crypto.getRandomValues(new Uint8Array(16));
    const renderKey = crypto.getRandomValues(new Uint8Array(32));
    let layoutHash;
    try {
        const renderKeyHex = Array.from(renderKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
        layoutHash = await argon2.hash({
            pass: renderKeyHex,
            salt: styleOffset,
            time: 10,
            mem: 64 * 1024,
            parallelism: 4,
            hashLen: 32,
            type: argon2.ArgonType.Argon2id
        });
        if (!(layoutHash.hash instanceof Uint8Array) || layoutHash.hash.byteLength !== 32) {
            throw new Error("hash failed to produce valid output.");
        }
    } catch (hashError) {
        throw hashError;
    }

    let formattedText;
    let seedIv;
    try {
        seedIv = crypto.getRandomValues(new Uint8Array(12));
        const aesKey = await crypto.subtle.importKey(
            "raw",
            layoutHash.hash,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
        formattedText = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: seedIv },
            aesKey,
            textProcessor.encode(dataItem)
        );
        if (!(formattedText instanceof ArrayBuffer) || formattedText.byteLength === 0) {
            throw new Error("Invalid encrypted seed data.");
        }
    } catch (encryptError) {
        throw encryptError;
    }

    let tickGenerator;
    try {
        tickGenerator = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        if (!(tickGenerator instanceof CryptoKey)) {
            throw new Error("Key generation failed to produce a valid CryptoKey.");
        }
    } catch (keyGenError) {
        throw keyGenError;
    }

    let lockedKey;
    const frameShift = crypto.getRandomValues(new Uint8Array(12));
    try {
        lockedKey = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: frameShift },
            tickGenerator,
            renderKey
        );
        if (!(lockedKey instanceof ArrayBuffer) || lockedKey.byteLength === 0) {
            throw new Error("Invalid locked key data.");
        }
    } catch (lockError) {
        throw lockError;
    }

    try {
        contentCache = {
            textBlock: arrayBufferToBase64(formattedText),
            offset: arrayBufferToBase64(styleOffset),
            spacing: arrayBufferToBase64(seedIv),
            keyFrame: arrayBufferToBase64(lockedKey),
            shift: arrayBufferToBase64(frameShift)
        };
        if (!contentCache.spacing || contentCache.spacing.length === 0) {
            throw new Error("Invalid Base64 encoding of seed IV.");
        }
        displayTimer = tickGenerator;
    } catch (cacheError) {
        throw cacheError;
    }

    dataItem = null;
}

async function fetchRenderContent() {
    if (!contentCache || !displayTimer) {
        throw new Error("No display cache available.");
    }

    const textDecoder = new TextDecoder();

    let activeKey;
    try {
        const iv = base64ToArrayBuffer(contentCache.shift);
        const ciphertext = base64ToArrayBuffer(contentCache.keyFrame);
        activeKey = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            displayTimer,
            ciphertext
        );
        if (!(activeKey instanceof ArrayBuffer) || activeKey.byteLength === 0) {
            throw new Error("Decryption failed to produce valid key data.");
        }
        const activeKeyArray = new Uint8Array(activeKey);
    } catch (decryptError) {
        throw new Error(`Key decryption failed: ${decryptError.message}`);
    }

    let styleHash;
    try {
        const realSaltArrayBuffer = base64ToArrayBuffer(contentCache.offset);
        const realSalt = new Uint8Array(realSaltArrayBuffer);
        const fullPassString = Array.from(new Uint8Array(activeKey)).map(byte => byte.toString(16).padStart(2, '0')).join('');
        const testHash = await argon2.hash({
            pass: "testpassword123",
            salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
            time: 1,
            mem: 1024,
            hashLen: 32,
            type: argon2.ArgonType.Argon2id
        });
        styleHash = await argon2.hash({
            pass: fullPassString,
            salt: realSalt,
            time: 10,
            mem: 64 * 1024,
            parallelism: 4,
            hashLen: 32,
            type: argon2.ArgonType.Argon2id
        });
    } catch (hashError) {
        throw new Error(`Argon2 hashing failed: ${hashError.message}`);
    }

    let tempOutput;
    try {
        const seedIv = base64ToArrayBuffer(contentCache.spacing);
        const aesKey = await crypto.subtle.importKey(
            "raw",
            styleHash.hash,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
        tempOutput = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: seedIv },
            aesKey,
            base64ToArrayBuffer(contentCache.textBlock)
        );
    } catch (finalDecryptError) {
        throw new Error(`Seed decryption failed: ${finalDecryptError.message}`);
    }

    const output = textDecoder.decode(tempOutput);

    tempOutput = crypto.getRandomValues(new Uint8Array(tempOutput.byteLength));
    tempOutput = crypto.getRandomValues(new Uint8Array(tempOutput.byteLength));
    tempOutput = crypto.getRandomValues(new Uint8Array(tempOutput.byteLength));
    tempOutput = null;

    if (!output || typeof output !== 'string' || !output.match(/^s[0-9a-zA-Z]{27,}$/)) {
        throw new Error("Invalid seed format after decryption.");
    }

    return output;
}

async function encryptPasswordsInMemory(password1, password2) {
    const { salt } = await initializePasswordSessionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = JSON.stringify({ password1, password2 });
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        passwordSessionKey,
        encoder.encode(data)
    );
    encryptedPasswords = {
        data: arrayBufferToBase64(encrypted),
        iv: arrayBufferToBase64(iv),
        salt: arrayBufferToBase64(salt)
    };
}

async function decryptPasswordsInMemory() {
    if (!encryptedPasswords || !passwordSessionKey) {
        throw new Error("No wallet in memory.");
    }
    const decoder = new TextDecoder();
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(base64ToArrayBuffer(encryptedPasswords.iv)) },
        passwordSessionKey,
        base64ToArrayBuffer(encryptedPasswords.data)
    );
    return JSON.parse(decoder.decode(decrypted));
}

function spawnEtherNoise(count) {
    const etherBits = [];
    for (let i = 0; i < count; i++) {
        const flux = xrpl.Wallet.generate();
        etherBits.push({
            locus: flux.classicAddress,
            spark: flux.seed,
            tag: `Ether Shard ${i + 1}`
        });

    }
    return etherBits;
}

async function checkBalance() {
    const errorElement = document.getElementById('address-error');
    try {
        await ensureConnected();
        const address = globalAddress;
        const accountAddress = document.getElementById('account-address');
        const assetGrid = document.getElementById('asset-grid');
        if (!xrpl.isValidAddress(address)) {
            if (errorElement) errorElement.textContent = 'Invalid XRPL address.';
            log('Error: Invalid XRPL address.');
            return;
        }
        if (errorElement) errorElement.textContent = '';    const { totalBalanceXrp, totalReserveXrp, availableBalanceXrp } = await calculateAvailableBalance(address);

    const accountLines = await client.request({
        command: "account_lines",
        account: address,
        ledger_index: "current"
    });

    dynamicAssets = [];
    globalLPTokens = [];
    const issuedAssets = new Map(); 
    const validTrustlines = []; 
    const assetNameCounts = new Map(); 

    for (const line of accountLines.result.lines) {
        const currencyHex = line.currency;
        const limit = parseFloat(line.limit);
        const limitPeer = parseFloat(line.limit_peer);

        if (limit === 0 && limitPeer > 0) {
            continue;
        }

        const assetName = xrpl.convertHexToString(currencyHex).replace(/\0/g, '') || `[HEX:${currencyHex.slice(0, 8)}]`;
        assetNameCounts.set(assetName, (assetNameCounts.get(assetName) || 0) + 1);

        if (assetNameCounts.get(assetName) >= 2) {
            if (!issuedAssets.has(assetName)) {
                issuedAssets.set(assetName, currencyHex);
            }
        }
    }

    for (const line of accountLines.result.lines) {
        const currencyHex = line.currency;
        const limit = parseFloat(line.limit);
        const limitPeer = parseFloat(line.limit_peer);

        if (limit === 0 && limitPeer > 0) {
            continue;
        }

        const assetName = xrpl.convertHexToString(currencyHex).replace(/\0/g, '') || `[HEX:${currencyHex.slice(0, 8)}]`;

        if (issuedAssets.has(assetName)) {
            continue;
        }

        validTrustlines.push(line);
    }

    for (const line of validTrustlines) {
        const currencyHex = line.currency;
        const issuer = line.account;
        const lpName = await decodeLPToken(currencyHex, issuer);
        if (lpName) {
            globalLPTokens.push({
                lpName: lpName,
                currency: currencyHex,
                issuer: issuer,
                balance: parseFloat(truncateAmount(line.balance))
            });
        } else {
            const currencyName = xrpl.convertHexToString(currencyHex).replace(/\0/g, '') || `[HEX:${currencyHex.slice(0, 8)}]`;
            if (!prefabAssets.some(a => a.hex === currencyHex)) {
                dynamicAssets.push({ name: currencyName, issuer: issuer, hex: currencyHex, isLP: false });
            }
        }
    }

    if (accountAddress && assetGrid) {
        accountAddress.innerHTML = `Address: <a href="https://xrpscan.com/account/${address}" class="address-link" target="_blank">${address}</a>`;
        assetGrid.innerHTML = `
			<div class="asset-item">
				<span class="asset-name"><img src="icons/XRP.png" alt="XRP" class="asset-icon"> XRP</span>
				<div class="asset-balance">
					Total: ${formatBalance(totalBalanceXrp)} XRP<br>
					Reserve: ${formatBalance(totalReserveXrp)} XRP<br>
					Available: ${formatBalance(availableBalanceXrp)} XRP
				</div>
			</div>
		`;

        if (issuedAssets.size > 0) {
            log(`Displaying ${issuedAssets.size} issued assets = Hiding ${issuedAssets.size} issued asset: Warning you should not be trading on an issuer account, use another account for asset swaps and this account to control the asset, this is no longer a normal account and should be used sparingly and for asset management only.`);
            for (const [assetName, currencyHex] of issuedAssets) {
                assetGrid.innerHTML += `
                    <div class="asset-item">
                        <span class="asset-name"><img src="icons/XRP.png" alt="${assetName}" class="asset-icon"> Issued Asset: ${assetName}</span>
                        <div class="asset-balance">Managed by this account</div>
                    </div>
                `;
            }
        }

        for (const line of validTrustlines) {
            const currencyHex = line.currency;
            let assetName = xrpl.convertHexToString(currencyHex).replace(/\0/g, '') || `[HEX:${currencyHex.slice(0, 8)}]`;
            const issuer = line.account;
            const lpName = await decodeLPToken(currencyHex, issuer);
            const isLP = !!lpName;
            if (lpName) {
                assetName = lpName;
            }

            const iconSrc = isLP ? 'icons/XRP.png' : `icons/$${assetName}-${issuer}.png`;
            const issuerLink = `<a href="https://xrpscan.com/account/${issuer}" class="address-link" target="_blank"><span class="asset-name"><img src="${iconSrc}" alt="${assetName}" class="asset-icon" onerror="this.src='icons/XRP.png'"> ${assetName}</span></a>`;
            let buttonsHtml = '';
            if (!isLP && !issuedAssets.has(assetName)) {
                buttonsHtml = `
                    <div class="asset-buttons">
                        <button class="buy-btn" onclick="buyAsset({name: '${assetName}', hex: '${currencyHex}', issuer: '${issuer}'})">Buy</button>
                        <button class="sell-btn" onclick="sellAsset({name: '${assetName}', hex: '${currencyHex}', issuer: '${issuer}'})">Sell</button>
                    </div>
                `;
            }
            assetGrid.innerHTML += `
                <div class="asset-item">
                    ${issuerLink}
                    <div class="asset-balance">${formatBalance(line.balance)}</div>
                    ${buttonsHtml}
                </div>
            `;
        }
    } else {
        log('Error: UI elements (account-address or asset-grid) not found.');
    }

    updateBalances();
    selectTrustAsset();
    await new Promise(resolve => setTimeout(resolve, 100));
    populateAssetDropdowns();
} catch (error) {
    log(`Error checking balance: ${error.message}`);
    if (errorElement) errorElement.textContent = 'Failed to check balance';
    throw error;
}}

function buyAsset(asset) {
    const ammSection = document.getElementById('amm-swap');
    if (ammSection) {
        if (ammSection.classList.contains('minimized')) {
            toggleSection('amm-swap');
        }
        ammSection.scrollIntoView({ behavior: 'smooth' });
    }
    const inputDisplay = document.getElementById('swap-input-asset-display');
    const outputDisplay = document.getElementById('swap-output-asset-display');

    if (inputDisplay && outputDisplay) {
        inputDisplay.setAttribute('data-value', 'XRP');
        inputDisplay.setAttribute('data-hex', 'XRP');
        inputDisplay.setAttribute('data-issuer', '');
        inputDisplay.innerHTML = '<img src="icons/XRP.png" alt="XRP" class="asset-icon"> XRP';

        outputDisplay.setAttribute('data-value', asset.name);
        outputDisplay.setAttribute('data-hex', asset.hex);
        outputDisplay.setAttribute('data-issuer', asset.issuer);
        outputDisplay.innerHTML = `<img src="icons/$${asset.name}-${asset.issuer}.png" alt="${asset.name}" class="asset-icon" onerror="this.src='icons/XRP.png'"> ${asset.name}`;

        updateSwapDirection();
        checkPoolPrice();
    } else {
        log('Error: Swap display elements not found.');
    }
}

function sellAsset(asset) {
    const ammSection = document.getElementById('amm-swap');
    if (ammSection) {
        if (ammSection.classList.contains('minimized')) {
            toggleSection('amm-swap');
        }
        ammSection.scrollIntoView({ behavior: 'smooth' });
    }
    const inputDisplay = document.getElementById('swap-input-asset-display');
    const outputDisplay = document.getElementById('swap-output-asset-display');

    if (inputDisplay && outputDisplay) {
        inputDisplay.setAttribute('data-value', asset.name);
        inputDisplay.setAttribute('data-hex', asset.hex);
        inputDisplay.setAttribute('data-issuer', asset.issuer);
        inputDisplay.innerHTML = `<img src="icons/$${asset.name}-${asset.issuer}.png" alt="${asset.name}" class="asset-icon" onerror="this.src='icons/XRP.png'"> ${asset.name}`;

        outputDisplay.setAttribute('data-value', 'XRP');
        outputDisplay.setAttribute('data-hex', 'XRP');
        outputDisplay.setAttribute('data-issuer', '');
        outputDisplay.innerHTML = '<img src="icons/XRP.png" alt="XRP" class="asset-icon"> XRP';

        updateSwapDirection();
        checkPoolPrice();
    } else {
        log('Error: Swap display elements not found.');
    }
}

async function calculateAvailableBalance(address, trustlineAdjustment = 0) {
    try {
        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "current"
        });
        const accountObjects = await client.request({
            command: "account_objects",
            account: address,
            ledger_index: "current"
        });
        const serverInfo = await client.request({
            command: "server_info"
        });

        const totalBalanceXrp = parseFloat(xrpl.dropsToXrp(accountInfo.result.account_data.Balance));
        const reserveBaseXrp = parseFloat(serverInfo.result.info.validated_ledger.reserve_base_xrp);
        const reserveIncXrp = parseFloat(serverInfo.result.info.validated_ledger.reserve_inc_xrp);

        const ownerCount = parseInt(accountInfo.result.account_data.OwnerCount);
        const adjustedOwnerCount = ownerCount + trustlineAdjustment;
        const totalReserveXrp = reserveBaseXrp + (adjustedOwnerCount * reserveIncXrp);

        let lockedBalanceXrp = 0;
        for (const obj of accountObjects.result.account_objects) {
            if (obj.LedgerEntryType === "Escrow") {
                lockedBalanceXrp += parseFloat(xrpl.dropsToXrp(obj.Amount));
            } else if (obj.LedgerEntryType === "Offer" && obj.TakerGets && typeof obj.TakerGets === "string") {
                lockedBalanceXrp += parseFloat(xrpl.dropsToXrp(obj.TakerGets));
            } else if (obj.LedgerEntryType === "PayChannel") {
                lockedBalanceXrp += parseFloat(xrpl.dropsToXrp(obj.Amount));
            }
        }

        const availableBalanceXrp = totalBalanceXrp - totalReserveXrp - lockedBalanceXrp;

        return { totalBalanceXrp, totalReserveXrp, availableBalanceXrp };
    } catch (error) {
        log(`Error calculating available balance: ${error.message}`);
        throw error;
    }
}

async function resecureCache() {
    if (!contentCache || !displayTimer) {

        return;
    }


    const newDisplayTimer = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    const oldIv = base64ToArrayBuffer(contentCache.shift);
    const oldCiphertext = base64ToArrayBuffer(contentCache.keyFrame);
    const renderKey = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: oldIv },
        displayTimer,
        oldCiphertext
    );

    const newIv = crypto.getRandomValues(new Uint8Array(12));
    const newCiphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: newIv },
        newDisplayTimer,
        renderKey
    );

    contentCache = {
        textBlock: contentCache.textBlock,
        offset: contentCache.offset,
        spacing: contentCache.spacing,
        keyFrame: arrayBufferToBase64(newCiphertext),
        shift: arrayBufferToBase64(newIv)
    };
    displayTimer = newDisplayTimer;


}
function clearSensitiveData() {
    contentCache = null;
    displayTimer = null;
    encryptedPasswords = null;
    passwordSessionKey = null;
    globalAddress = "";
    isWalletFreshlyCreated = false;

}


function log(message, isBlob = false) {
    const output = document.getElementById('output');
    if (output) {
        const addressRegex = /(r[0-9a-zA-Z]{25,35})/g;
        const hashRegex = /(?:Confirmation(?: \d\/5)?: |Transaction Hash: )([0-9A-Fa-f]{64})/g;

        let linkedMessage = message;
        linkedMessage = linkedMessage.replace(addressRegex, match => `<a href="https://xrpscan.com/account/${match}" class="address-link" target="_blank">${match}</a>`);
        linkedMessage = linkedMessage.replace(hashRegex, (fullMatch, hash) => `<a href="https://xrpscan.com/tx/${hash}" class="hash-link" target="_blank">${hash}</a>`);

        const className = isBlob ? 'green-blob' : '';
        output.insertAdjacentHTML('beforeend', `<span class="${className}">${linkedMessage}</span><br>`);
        output.scrollTop = output.scrollHeight;
    }
}

function showPasswordModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('passwordModal');
        const password1Input = document.getElementById('password1');
        const password2Input = document.getElementById('password2');
        const submitButton = document.getElementById('submitPasswords');

        password1Input.value = '';
        password2Input.value = '';
        password1Input.type = 'password';
        password2Input.type = 'password';
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(btn => btn.textContent = 'Show');

        modal.style.display = 'flex';
        passwordResolve = resolve;

        submitButton.onclick = () => {
            const password1 = password1Input.value;
            const password2 = password2Input.value;
            if (!password1 || !password2) {
                log('Error: Both passwords are required.');
                return;
            }
            modal.style.display = 'none';
            password1Input.value = '';
            password2Input.value = '';
            resolve({ password1, password2 });
        };
    });
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    const password1Input = document.getElementById('password1');
    const password2Input = document.getElementById('password2');
    modal.style.display = 'none';
    password1Input.value = '';
    password2Input.value = '';
    setTimeout(() => {
        reapplyCursorStyle();
    }, 100);
    if (passwordResolve) {
        passwordResolve(null);
    }
}

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
    } else {
        input.type = 'password';
        button.textContent = 'Show';
    }
}


async function decodeLPToken(currency, issuer) {
    try {
        const hexCurrency = currency.toLowerCase();
        const prefix = hexCurrency.substring(0, 2);
        if (prefix !== '03') {
            return null;
        }

        await ensureConnected();
        const accountObjects = await client.request({
            command: "account_objects",
            account: issuer,
            ledger_index: "current",
            type: "amm"
        });

        let asset1, asset2;
        for (const obj of accountObjects.result.account_objects) {
            if (obj.LedgerEntryType === "AMM") {
                asset1 = obj.Asset;
                asset2 = obj.Asset2;
                break;
            }
        }

        if (!asset1 || !asset2) {
            log(`No AMM object found for issuer ${issuer}`);
            return `Unknown LP (Issuer: ${issuer.slice(0, 10)}...)`;
        }

        const asset1Name = asset1.currency === "XRP" ? "XRP" : prefabAssets.find(a => a.hex === asset1.currency)?.name || xrpl.convertHexToString(asset1.currency).replace(/\0/g, '') || `[HEX:${asset1.currency.slice(0, 8)}]`;
        const asset2Name = asset2.currency === "XRP" ? "XRP" : prefabAssets.find(a => a.hex === asset2.currency)?.name || xrpl.convertHexToString(asset2.currency).replace(/\0/g, '') || `[HEX:${asset2.currency.slice(0, 8)}]`;
        const lpName = `${asset1Name}/${asset2Name} LP`;

        return lpName;
    } catch (error) {
        log(`Error decoding LP token for issuer ${issuer}: ${error.message}`);
        return `Unknown LP (Issuer: ${issuer.slice(0, 10)}...)`;
    }
}



async function throttleRequest(requestFn) {
    return new Promise((resolve, reject) => {
        requestQueue.push({ fn: requestFn, resolve, reject });
        processRequestQueue();
    });
}

async function processRequestQueue() {
    if (isProcessingRequests || requestQueue.length === 0) return;
    isProcessingRequests = true;

    while (requestQueue.length > 0) {
        const { fn, resolve, reject } = requestQueue.shift();
        try {
            const result = await fn();
            resolve(result);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            reject(error);
        }
    }

    isProcessingRequests = false;
}

async function i9(event) {
    const file = event.target.files[0];
    if (!file) {
        log('No file selected.');
        return;
    }
    const fileNameDisplay = document.getElementById('fileName');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
    }
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.z || !data.v1 || !data.s1 || !data.v2 || !data.s2 || !data.v3 || !data.s3) {
                log('Error: Invalid wallet file format. Expected triple-layer encryption fields.');
                return;
            }
            const passwords = await showPasswordModal();
            if (!passwords) {
                log('Error: Password entry cancelled.');
                return;
            }
            const { password1, password2 } = passwords;
            let parsedData = await f6(
                data.z,
                data.v1,
                data.s1,
                data.v2,
                data.s2,
                data.v3,
                data.s3,
                password1,
                password2
            );
            const seedBox = document.getElementById('seed');
            const addrBox = document.getElementById('address');
            seedBox.type = 'text';
            addrBox.type = 'password';
            seedBox.value = 'Seed Loaded (Not Displayed)';
            addrBox.value = parsedData.address;
            globalAddress = parsedData.address;
            await updateDisplayData(parsedData.seed);
            await encryptPasswordsInMemory(password1, password2);
            isWalletFreshlyCreated = false;
            log('Wallet loaded from the ether');
            log('Welcome to The Surfer Report');
            log('You are the chief scientist');

            const alertPanel = document.getElementById('wallet-warning');
            if (alertPanel) {
                alertPanel.innerHTML = `
                    <h3>Wallet Loaded</h3>
                    <p>Your wallet has been loaded. The address is displayed above and can be viewed via QR code below.</p>
                    <p>Click the button below to view the address QR code (safe to share for funding):</p>
                    <div class="qr-buttons">
                        <button class="green-btn" onclick="showQRCode('address', '${parsedData.address}')">Show Address QR Code</button>
                    </div>
                    <p>The seed is not displayed during loading for security reasons. To create an unencrypted backup, verify your passwords:</p>
                    <button class="red-black-btn" onclick="downloadUnencryptedWallet(null, null)">Download Unencrypted Wallet</button>
                    
                `;
                alertPanel.style.display = 'block';
            }

            await connectWebSocket();
            await checkBalance();
            parsedData.seed = crypto.getRandomValues(new Uint8Array(32));
            parsedData.seed = crypto.getRandomValues(new Uint8Array(32));
            parsedData.seed = crypto.getRandomValues(new Uint8Array(32));
            parsedData = null;
        } catch (error) {
            log(`Error: Failed to load wallet file: ${error.message}`);
        }
    };
    reader.onerror = function() {
        log('Error reading wallet file.');
    };
    reader.readAsText(file);
}
async function createWallet() {
    const seedInput = document.getElementById('seed');
    const addressInput = document.getElementById('address');

    if (globalAddress || contentCache) {
        const confirmed = await showWalletOverwriteConfirmation();
        if (!confirmed) {
            log('Wallet creation cancelled by user.');
            return;
        }

        clearWalletData();
    }

    seedInput.value = '';
    addressInput.value = '';

    let inputText = seedInput.value.trim();
    let wallet;

    if (inputText && inputText.length > 0) {
        if (!inputText.match(/^s[0-9a-zA-Z]{27,}$/)) {
            log('Error: Invalid seed format. Seeds typically start with "s" and are 28+ characters.');
            document.getElementById('address-error').textContent = 'Invalid seed format.';
            return;
        }
        try {
            wallet = xrpl.Wallet.fromSeed(inputText);
        } catch (error) {
            log(`Error: Invalid seed - ${error.message}`);
            document.getElementById('address-error').textContent = 'Invalid seed.';
            return;
        }
    } else {
        wallet = xrpl.Wallet.generate();
        inputText = wallet.seed;
    }

    const locationTag = wallet.classicAddress;
    seedInput.type = 'text';
    addressInput.type = 'password';
    seedInput.value = 'Seed Loaded (View via QR Code Below)';
    addressInput.value = locationTag;
    globalAddress = locationTag;
    await updateDisplayData(inputText);
    isWalletFreshlyCreated = true;
    log('Wallet created or loaded from seed');

    const alertPanel = document.getElementById('wallet-warning');
    if (alertPanel) {
        const isCustomInput = inputText && inputText.length > 0 && document.getElementById('seed').value.trim() !== 'Seed Loaded (View via QR Code Below)';
        alertPanel.innerHTML = `
            <h3>⚠️ IMPORTANT WARNING ⚠️</h3>
            <p style="color: #ff4444; font-weight: bold;">
                ${isCustomInput ? 'You entered a seed manually. Ensure you save it securely!' : 'This is the ONLY time you will see your wallet seed unencrypted.'}
                You MUST save this information securely by downloading the files below. If you lose it, you will lose access to your wallet permanently. Do NOT share your seed with anyone!
            </p>
            <p style="color: #ffaa00; font-weight: bold;">
                Critical Note: ${isCustomInput ? 'This seed is your responsibility to secure.' : 'You will never see this seed again after this moment.'} No one, including The Surfer Report, can recover it for you. Ensure you save it securely offline on another device or in written form (e.g., on paper stored in a safe place).
            </p>
            <p>Click the buttons below to view QR codes for funding your wallet or viewing your seed:</p>
            <div class="qr-buttons">
                <button class="green-btn" onclick="showQRCode('address', '${locationTag}')">Address QR Code</button>
                <button class="red-black-btn" onclick="showQRCode('seed', '${inputText}')">Seed QR Code</button>
            </div>
            <p>Download the unencrypted version of your wallet data for offline storage (e.g., USB or paper). Keep this file secure and never store it online:</p>
            <button class="red-black-btn" onclick="downloadUnencryptedWallet('${inputText}', '${locationTag}')">Download Unencrypted Wallet</button>
            <p>Download the encrypted version below for safe storage (requires your passwords to decrypt):</p>
            <button class="red-black-btn" onclick="g7('${inputText}', '${locationTag}')">Download Encrypted Wallet</button>
            <p>Once you have saved your wallet data, click the button below to clear it from the display and memory:</p>
            <button class="clear-dom-btn" onclick="clearWalletData()">Clear Wallet Data from Display</button>
        `;
        alertPanel.style.display = 'block';
    }

    inputText = crypto.getRandomValues(new Uint8Array(32));
    inputText = crypto.getRandomValues(new Uint8Array(32));
    inputText = crypto.getRandomValues(new Uint8Array(32));
    inputText = null;
}

function showWalletOverwriteConfirmation() {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'password-modal-overlay confirmation-modal';
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Wallet Creation</h2>
                <p>You currently have a wallet loaded. Do you wish to log out and create a new wallet?</p>
                <p>This action will clear your current wallet data from memory.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmOverwrite">Yes, Create New Wallet</button>
                    <button class="red-black-btn" id="cancelOverwrite">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const confirmButton = document.getElementById('confirmOverwrite');
        const cancelButton = document.getElementById('cancelOverwrite');

        const resolveAndCleanup = (result) => {
            modal.remove();
            resolve(result);
        };

        confirmButton.onclick = () => resolveAndCleanup(true);
        cancelButton.onclick = () => resolveAndCleanup(false);
    });
}

function showQRCode(type, data) {

    const existingModals = document.querySelectorAll('.qr-modal');
    existingModals.forEach(modal => modal.remove());


    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <h2>${type === 'address' ? 'Address QR Code' : type === 'seed' ? 'Seed QR Code' : 'Funding Payload QR Code'}</h2>
            <p>You may use this QR via a camera and copy or any app with even basic capability ${type === 'address' ? 'view your wallet address' : type === 'seed' ? 'import your wallet into another app' : 'retrieve the funding payload URL'}. Or copy the data to your clipboard below.</p>
            <div class="qr-container">
                <div id="qr-${type}"></div>
                <div id="qr-overlay-${type}" class="qr-overlay">
                    <img src="assets/reeftech-logo.webp" alt="The Surfer Report Logo" class="qr-logo">
                </div>
            </div>
            <button class="green-btn qr-copy-btn" onclick="copyToClipboard('${data}')">Copy to Clipboard</button>
            <button class="red-black-btn qr-close-btn" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);

    
    new QRCode(document.getElementById(`qr-${type}`), {
        text: data,
        width: 200,
        height: 200,
        colorDark: "#00cc00",
        colorLight: "#2a2a2a",
        correctLevel: QRCode.CorrectLevel.H
    });


    const img = document.querySelector(`#qr-overlay-${type} .qr-logo`);
    img.onerror = () => {
        img.style.display = 'none';
        log(`Failed to load logo.png for QR code overlay`);
    };

    log(`QR Code generated: ${type} - ${data}`);
}

function copyToClipboard(data) {
    navigator.clipboard.writeText(data).then(() => {
        
        const copyBtn = document.querySelector('.qr-copy-btn');
        if (copyBtn) {
            copyBtn.textContent = 'Copied!';
            copyBtn.disabled = true;
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.disabled = false;
            }, 2000);
        }
    }).catch(err => {
        
        alert('Failed to copy to clipboard. Please copy manually: ' + data);
    });
}

async function g7(seed, address) {
    const passwords = await showPasswordModal();
    if (!passwords) {
        log('Error: Password entry cancelled.');
        return;
    }
    const { password1, password2 } = passwords;
    try {
        const walletData = { seed, address };
        const { z, v1, s1, v2, s2, v3, s3 } = await e5(walletData, password1, password2);
        const encryptedFile = { z, v1, s1, v2, s2, v3, s3 };
        const blob = new Blob([JSON.stringify(encryptedFile)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ML_${address.slice(0, 5)}_encrypted.json`;
        a.click();
        URL.revokeObjectURL(url);
        log('Encrypted wallet file downloaded successfully.');
    } catch (error) {
        log(`Error saving encrypted wallet file: ${error.message}`);
    }
}
async function downloadUnencryptedWallet(inputText, locationTag) {
    log('Attempting to download unencrypted wallet file...');

    if (isWalletFreshlyCreated && inputText && locationTag) {
        try {
            const dataBlock = { seed: inputText, address: locationTag };
            const blob = new Blob([JSON.stringify(dataBlock, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ML_${locationTag.slice(0, 5)}_unencrypted.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            log('Unencrypted wallet file downloaded successfully. Store this file securely offline.');
            return;
        } catch (error) {
            log(`Error saving unencrypted wallet file: ${error.message}`);
            return;
        }
    }

    if (contentCache && displayTimer) {
        const passwords = await showPasswordModal();
        if (!passwords) {
            log('Error: Password entry cancelled. Cannot download unencrypted wallet.');
            return;
        }
        const { password1, password2 } = passwords;

        try {
            const cachedCredentials = await decryptPasswordsInMemory();
            if (password1 !== cachedCredentials.password1 || password2 !== cachedCredentials.password2) {
                log('Error: Incorrect passwords. Cannot download unencrypted wallet.');
                return;
            }

            let parsedText = await fetchRenderContent();
            const dataBlock = { seed: parsedText, address: globalAddress };
            const blob = new Blob([JSON.stringify(dataBlock, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ML_${globalAddress.slice(0, 5)}_unencrypted.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            log('Unencrypted wallet file downloaded successfully after password verification. Store this file securely offline.');

            parsedText = crypto.getRandomValues(new Uint8Array(32));
            parsedText = crypto.getRandomValues(new Uint8Array(32));
            parsedText = crypto.getRandomValues(new Uint8Array(32));
            parsedText = null;
        } catch (error) {
            log(`Error during unencrypted wallet download: ${error.message}`);
        }
    } else {
        log('Error: Cannot download unencrypted wallet. Either create a new wallet or load an encrypted wallet first.');
    }
}

async function saveWalletFile() {
    log(`saveWalletFile: Starting - contentCache=${!!contentCache}, displayTimer=${!!displayTimer}, globalAddress=${globalAddress}`);

    if (!contentCache || !displayTimer || !globalAddress) {
        log('Error: No wallet loaded. Please create or load a wallet first.');
        return;
    }

    let seed;
    try {
        log('Fetching seed from secure cache...');
        seed = await fetchRenderContent();
        log(`Seed fetched successfully: ${seed ? 'Present' : 'Missing'}`);
    } catch (error) {
        log(`Error fetching seed: ${error.message}`);
        return;
    }

    const address = globalAddress;
    if (!seed || !address) {
        log(`Error: Seed and address are required to save the wallet. Seed=${!!seed}, Address=${address}`);
        return;
    }

    log('Showing password modal...');
    const passwords = await showPasswordModal();
    if (!passwords) {
        log('Error: Password entry cancelled.');
        return;
    }
    const { password1, password2 } = passwords;
    log('Passwords entered successfully.');

    try {
        const walletData = { seed, address };
        log('Encrypting wallet data with Argon2 shell...');
        const { z, v1, s1, v2, s2, v3, s3 } = await e5(walletData, password1, password2);
        const encryptedFile = { z, v1, s1, v2, s2, v3, s3 };
        const blob = new Blob([JSON.stringify(encryptedFile)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ML_${address.slice(0, 5)}.json`;
        log('Initiating file download...');
        a.click();
        URL.revokeObjectURL(url);
        log('Wallet file saved successfully (triple-encrypted with Argon2 shell).');
    } catch (error) {
        log(`Error saving wallet file: ${error.message}`);
    }
}


function clearWalletData() {
    const seedInput = document.getElementById('seed');
    const addressInput = document.getElementById('address');
    const warningContainer = document.getElementById('wallet-warning');

    if (seedInput) seedInput.value = '';
    if (addressInput) addressInput.value = '';
    if (warningContainer) {
        warningContainer.innerHTML = `
            <h3>Wallet Data Cleared from Display</h3>
            <p>The wallet data has been cleared from the display. Memory remains intact for further actions (e.g., saving or transactions).</p>
        `;
    }
    log(`clearWalletData: UI cleared - contentCache=${!!contentCache}, displayTimer=${!!displayTimer}, globalAddress=${globalAddress}`);
}
function resetAllWalletData() {
    clearSensitiveData();
    const accountAddress = document.getElementById('account-address');
    const assetGrid = document.getElementById('asset-grid');
    if (accountAddress) {
        accountAddress.textContent = 'Address: -';
    } else {
        log('Warning: #account-address element not found during reset.');
    }

    if (assetGrid) {
        assetGrid.innerHTML = '';
    } else {
        log('Warning: #asset-grid element not found during reset.');
    }
    log('The lab is clean chief scientist!');
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
            
        }
    };
    reader.onerror = function() {
        
    };
    reader.readAsText(file);
}

async function e5(data, p1, p2) {
    const encoder = new TextEncoder();
    try {
        const s1 = crypto.getRandomValues(new Uint8Array(16));
        const v1 = crypto.getRandomValues(new Uint8Array(12));
        const k1 = await deriveKey(p1, s1);
        const l1 = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: v1 },
            k1,
            encoder.encode(JSON.stringify(data))
        );

        const s2 = crypto.getRandomValues(new Uint8Array(16));
        const v2 = crypto.getRandomValues(new Uint8Array(12));
        const k2 = await deriveKey(p2, s2);
        const l2 = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: v2 },
            k2,
            l1
        );

        const s3 = crypto.getRandomValues(new Uint8Array(16));
        const v3 = crypto.getRandomValues(new Uint8Array(12));
        const combinedPassword = p1 + p2;
        const k3 = await b2(s3, combinedPassword);
        const l3 = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: v3 },
            k3,
            l2
        );

        log('Wallet encrypted with Argon2 shell and dual-password layers');
        return {
            z: arrayBufferToBase64(l3),
            v1: arrayBufferToBase64(v1),
            s1: arrayBufferToBase64(s1),
            v2: arrayBufferToBase64(v2),
            s2: arrayBufferToBase64(s2),
            v3: arrayBufferToBase64(v3),
            s3: arrayBufferToBase64(s3)
        };
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}


async function f6(z, v1, s1, v2, s2, v3, s3, p1, p2) {
    const decoder = new TextDecoder();
    try {

        const combinedPassword = p1 + p2;
        const k3 = await b2(new Uint8Array(base64ToArrayBuffer(s3)), combinedPassword);
        const l3 = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(base64ToArrayBuffer(v3)) },
            k3,
            base64ToArrayBuffer(z)
        );


        const k2 = await deriveKey(p2, new Uint8Array(base64ToArrayBuffer(s2)));
        const l2 = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(base64ToArrayBuffer(v2)) },
            k2,
            l3
        );


        const k1 = await deriveKey(p1, new Uint8Array(base64ToArrayBuffer(s1)));
        const l1 = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(base64ToArrayBuffer(v1)) },
            k1,
            l2
        );

        return JSON.parse(decoder.decode(l1));
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

async function calculateTotalObjects(address) {
    try {
        const accountObjects = await client.request({ command: "account_objects", account: address, ledger_index: "current" });
        return accountObjects.result.account_objects.length;
    } catch (error) {
        log(`Error calculating total objects: ${error.message}`);
        throw error;
    }
}

async function calculateTotalReserve(address, additionalObjects = 0) {
    try {
        const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
        const trustlineCount = accountLines.result.lines.length;

        const totalObjects = await calculateTotalObjects(address) + additionalObjects;

        let ownerReserveXrp = 0;
        if (totalObjects > 2) {
            ownerReserveXrp = totalObjects * TRUSTLINE_RESERVE_XRP;
        }

        const totalReserveXrp = BASE_RESERVE_XRP + ownerReserveXrp;
        return totalReserveXrp;
    } catch (error) {
        log(`Error calculating total reserve: ${error.message}`);
        throw error;
    }
}

async function checkDepositAuth(issuerAddress) {
    try {
        await ensureConnected();
        const response = await client.request({
            command: "account_info",
            account: issuerAddress,
            ledger_index: "current"
        });
        const flags = response.result.account_data.Flags || 0;
        
        const hasDepositAuth = (flags & 0x1000000) !== 0;
        return hasDepositAuth;
    } catch (error) {
        console.error(`Error checking deposit auth for ${issuerAddress}: ${error.message}`);
        return false;
    }
}

async function queueTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-transactions');
        if (!errorElement) {
            return;
        }

        if (!contentCache || !displayTimer) {
            errorElement.textContent = 'No wallet loaded.';
            return;
        }

        if (!address || !xrpl.isValidAddress(address)) {
            errorElement.textContent = 'Invalid address.';
            return;
        }

        const destinationAddress = document.getElementById('send-destination')?.value?.trim();
        if (!destinationAddress || !xrpl.isValidAddress(destinationAddress)) {
            errorElement.textContent = 'Invalid destination address.';
            return;
        }

        const sendAssetDisplay = document.getElementById('send-asset-display');
        if (!sendAssetDisplay) {
            errorElement.textContent = 'Send Transactions section not loaded.';
            return;
        }

        const selectedAssetName = sendAssetDisplay.getAttribute('data-value') || sendAssetDisplay.textContent;
        if (!selectedAssetName || selectedAssetName === 'Select Asset') {
            errorElement.textContent = 'Please select an asset.';
            return;
        }

        const amountInput = document.getElementById('send-amount');
        const rawAmount = amountInput?.value?.trim();
        if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) {
            errorElement.textContent = 'Invalid amount.';
            return;
        }

        let amount = parseFloat(rawAmount);
        const formattedAmountStr = truncateAmount(amount);
        amount = parseFloat(formattedAmountStr);
        if (isNaN(amount)) {
            errorElement.textContent = 'Amount formatting failed.';
            return;
        }
        const roundedAmount = amount;

        const destinationTagInput = document.getElementById('send-destination-tag')?.value?.trim();
        let destinationTag = null;
        if (destinationTagInput) {
            destinationTag = parseInt(destinationTagInput);
            if (isNaN(destinationTag) || destinationTag < 0 || destinationTag > 4294967295) {
                errorElement.textContent = 'Invalid Destination Tag.';
                return;
            }
        }

        const memo = document.getElementById('send-memo')?.value?.trim();
        const scheduleCheckbox = document.getElementById('schedule-tx-transactions');
        const delayInput = document.getElementById('schedule-delay-transactions');
        let delayMs = 0;
        if (scheduleCheckbox?.checked && delayInput?.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const sendAssetGrid = document.getElementById('send-asset-grid');
        const selectedOption = sendAssetGrid.querySelector(`.asset-option[data-value="${selectedAssetName}"]`);
        const isLPToken = selectedOption?.getAttribute('data-is-lp') === 'true';
        const currencyHex = selectedOption?.getAttribute('data-hex');
        const issuer = selectedOption?.getAttribute('data-issuer');

        let asset = selectedAssetName === "XRP" ? null : getAssetByName(selectedAssetName);
        if (isLPToken) {
            if (!currencyHex || !issuer) {
                errorElement.textContent = 'Invalid LP token data.';
                return;
            }
            asset = { hex: currencyHex, issuer: issuer, name: selectedAssetName };
        } else if (asset && !asset.hex && !asset.issuer && selectedAssetName !== "XRP") {
            errorElement.textContent = 'Invalid asset data.';
            return;
        }

        let maxBalance;
        if (asset) {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            });
            const senderLine = accountLines.result.lines.find(line => line.currency === asset.hex && line.account === asset.issuer);
            maxBalance = senderLine ? parseFloat(senderLine.balance) : 0;
            if (maxBalance < roundedAmount) {
                errorElement.textContent = `Insufficient ${asset.name} balance. Available: ${maxBalance}`;
                return;
            }
        } else {
            const { availableBalanceXrp } = await calculateAvailableBalance(address);
            maxBalance = availableBalanceXrp;
            if (roundedAmount > maxBalance) {
                errorElement.textContent = `Insufficient XRP balance. Available: ${maxBalance} XRP`;
                return;
            }
        }

        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        if (transactionFeeXrp > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for fees. Need ${transactionFeeXrp} XRP.`;
            return;
        }

        const tx = {
            TransactionType: "Payment",
            Account: address,
            Destination: destinationAddress,
            Amount: asset ? {
                currency: asset.hex,
                issuer: asset.issuer,
                value: formattedAmountStr
            } : xrpl.xrpToDrops(roundedAmount),
            Fee: TRANSACTION_FEE_DROPS
        };
        if (memo) {
            tx.Memos = [{ Memo: { MemoData: stringToHex(memo), MemoType: stringToHex("Memo") } }];
        }
        if (destinationTag !== null) {
            tx.DestinationTag = destinationTag;
        }

        const description = `Send ${roundedAmount} ${selectedAssetName} to ${destinationAddress}${memo ? ` with memo "${memo}"` : ''}`;
        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: description,
            delayMs: delayMs,
            type: "payment",
            queueElementId: "transaction-queue-transactions"
        };

        transactionQueue.push(txEntry);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }
    } catch (error) {
        const errorElement = document.getElementById('address-error-transactions');
        if (errorElement) errorElement.textContent = `Error: ${error.message}`;
    }
}


async function enableLPReceiving() {
    try {
        const sendAssetDisplay = document.getElementById('send-asset-display');
        const errorElement = document.getElementById('address-error-transactions');
        if (!sendAssetDisplay || !errorElement) {
            errorElement.textContent = 'Send transaction elements not found.';
            log('Error: Send transaction elements not found.');
            return;
        }

        const selectedAssetName = sendAssetDisplay.getAttribute('data-value') || sendAssetDisplay.textContent;
        if (!selectedAssetName || selectedAssetName === 'Select Asset' || selectedAssetName === 'XRP') {
            errorElement.textContent = 'Please select a token asset (not XRP or LP).';
            log('Error: Please select a token asset (not XRP or LP).');
            return;
        }

        const asset = getAssetByName(selectedAssetName);
        if (!asset || asset.isLP) {
            errorElement.textContent = 'Invalid token asset selected.';
            log('Error: Invalid token asset selected.');
            return;
        }

        const address = globalAddress;
        if (!contentCache || !displayTimer) {
            errorElement.textContent = 'No wallet loaded.';
            log('Error: No wallet loaded.');
            return;
        }

        if (!address || !xrpl.isValidAddress(address)) {
            errorElement.textContent = 'Invalid address.';
            log('Error: Invalid address.');
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            errorElement.textContent = 'Seed does not match address.';
            log('Error: Seed does not match address.');
            return;
        }

        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        if (transactionFeeXrp > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for fees. Need ${transactionFeeXrp.toFixed(6)} XRP.`;
            log(`Error: Insufficient XRP for fees. Need ${transactionFeeXrp.toFixed(6)} XRP, have ${formatBalance(availableBalanceXrp)}.`);
            return;
        }

        const asset1 = { currency: "XRP" };
        const asset2 = { currency: asset.hex, issuer: asset.issuer };
        const ammInfo = await client.request({
            command: "amm_info",
            asset: asset1,
            asset2: asset2,
            ledger_index: "current"
        });

        if (!ammInfo.result.amm || !ammInfo.result.amm.lp_token) {
            errorElement.textContent = `No AMM pool found for XRP/${selectedAssetName}.`;
            log(`Error: No AMM pool found for XRP/${selectedAssetName}.`);
            return;
        }

        const lpCurrency = ammInfo.result.amm.lp_token.currency;
        const lpIssuer = ammInfo.result.amm.lp_token.issuer;

        const accountLines = await client.request({
            command: "account_lines",
            account: address,
            ledger_index: "current"
        });
        const existingTrustline = accountLines.result.lines.find(line => 
            line.currency === lpCurrency && line.account === lpIssuer
        );
        if (existingTrustline && parseFloat(existingTrustline.limit) > 0) {
            errorElement.textContent = `Trustline for XRP/${selectedAssetName} LP already exists with limit ${existingTrustline.limit}.`;
            log(`Trustline for XRP/${selectedAssetName} LP already exists.`);
            return;
        }

        const trustSetTx = {
            TransactionType: "TrustSet",
            Account: address,
            LimitAmount: {
                currency: lpCurrency,
                issuer: lpIssuer,
                value: "1000000000000000"
            },
            Fee: TRANSACTION_FEE_DROPS,
            Flags: TF_SET_NO_RIPPLE
        };

        const trustlineEntry = {
            tx: trustSetTx,
            wallet: wallet,
            description: `Set trustline for XRP/${selectedAssetName} LP (Issuer: ${lpIssuer})`,
            delayMs: 0,
            type: "trustset",
            queueElementId: "transaction-queue-transactions"
        };
        transactionQueue.push(trustlineEntry);
        log(`Trustline transaction queued for XRP/${selectedAssetName} LP.`);

        errorElement.textContent = `Queued trustline for XRP/${selectedAssetName} LP. Note: Both sender and receiver accounts must enable this trustline for LP token transfers to work.`;
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }
    } catch (error) {
        const errorElement = document.getElementById('address-error-transactions');
        if (errorElement) errorElement.textContent = `Error: ${error.message}`;
        log(`Error enabling LP receiving: ${error.message}`);
    }
}

async function disableLPReceiving() {
    try {
        const sendAssetDisplay = document.getElementById('send-asset-display');
        const errorElement = document.getElementById('address-error-transactions');
        if (!sendAssetDisplay || !errorElement) {
            errorElement.textContent = 'Send transaction elements not found.';
            log('Error: Send transaction elements not found.');
            return;
        }

        const selectedAssetName = sendAssetDisplay.getAttribute('data-value') || sendAssetDisplay.textContent;
        if (!selectedAssetName || selectedAssetName === 'Select Asset' || selectedAssetName === 'XRP') {
            errorElement.textContent = 'Please select a token asset (not XRP or LP).';
            log('Error: Please select a token asset (not XRP or LP).');
            return;
        }

        const asset = getAssetByName(selectedAssetName);
        if (!asset || asset.isLP) {
            errorElement.textContent = 'Invalid token asset selected.';
            log('Error: Invalid token asset selected.');
            return;
        }

        const address = globalAddress;
        if (!contentCache || !displayTimer) {
            errorElement.textContent = 'No wallet loaded.';
            log('Error: No wallet loaded.');
            return;
        }

        if (!address || !xrpl.isValidAddress(address)) {
            errorElement.textContent = 'Invalid address.';
            log('Error: Invalid address.');
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            errorElement.textContent = 'Seed does not match address.';
            log('Error: Seed does not match address.');
            return;
        }

        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        if (transactionFeeXrp > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for fees. Need ${transactionFeeXrp.toFixed(6)} XRP.`;
            log(`Error: Insufficient XRP for fees. Need ${transactionFeeXrp.toFixed(6)} XRP, have ${formatBalance(availableBalanceXrp)}.`);
            return;
        }

        const asset1 = { currency: "XRP" };
        const asset2 = { currency: asset.hex, issuer: asset.issuer };
        const ammInfo = await client.request({
            command: "amm_info",
            asset: asset1,
            asset2: asset2,
            ledger_index: "current"
        });

        if (!ammInfo.result.amm || !ammInfo.result.amm.lp_token) {
            errorElement.textContent = `No AMM pool found for XRP/${selectedAssetName}.`;
            log(`Error: No AMM pool found for XRP/${selectedAssetName}.`);
            return;
        }

        const lpCurrency = ammInfo.result.amm.lp_token.currency;
        const lpIssuer = ammInfo.result.amm.lp_token.issuer;

        const accountLines = await client.request({
            command: "account_lines",
            account: address,
            ledger_index: "current"
        });
        const trustline = accountLines.result.lines.find(line => 
            line.currency === lpCurrency && line.account === lpIssuer
        );
        if (!trustline) {
            errorElement.textContent = `No trustline found for XRP/${selectedAssetName} LP.`;
            log(`Error: No trustline found for XRP/${selectedAssetName} LP.`);
            return;
        }

        if (parseFloat(trustline.balance) !== 0) {
            errorElement.textContent = `LP token balance must be 0 to close trustline. Current balance: ${trustline.balance}.`;
            log(`Error: LP token balance must be 0. Current: ${trustline.balance}.`);
            return;
        }

        const trustSetTx = {
            TransactionType: "TrustSet",
            Account: address,
            LimitAmount: {
                currency: lpCurrency,
                issuer: lpIssuer,
                value: "0"
            },
            Fee: TRANSACTION_FEE_DROPS,
            Flags: xrpl.TrustSetFlags.tfSetNoRipple
        };

        const trustlineEntry = {
            tx: trustSetTx,
            wallet: wallet,
            description: `Close trustline for XRP/${selectedAssetName} LP (Issuer: ${lpIssuer})`,
            delayMs: 0,
            type: "trustset",
            queueElementId: "transaction-queue-transactions"
        };
        transactionQueue.push(trustlineEntry);
        log(`Trustline closure queued for XRP/${selectedAssetName} LP.`);

        errorElement.textContent = `Queued trustline closure for XRP/${selectedAssetName} LP.`;
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }
    } catch (error) {
        const errorElement = document.getElementById('address-error-transactions');
        if (errorElement) errorElement.textContent = `Error: ${error.message}`;
        log(`Error disabling LP receiving: ${error.message}`);
    }
}

async function queueDepositPreauth(authorizeAddress) {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-transactions');
        if (!errorElement) {
            return;
        }

        if (!contentCache || !displayTimer) {
            errorElement.textContent = 'No wallet loaded.';
            return;
        }

        if (!address || !xrpl.isValidAddress(address)) {
            errorElement.textContent = 'Invalid address.';
            return;
        }

        if (!authorizeAddress || !xrpl.isValidAddress(authorizeAddress)) {
            errorElement.textContent = 'Invalid authorize address.';
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        if (transactionFeeXrp > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for fees. Need ${transactionFeeXrp} XRP.`;
            return;
        }

        const tx = {
            TransactionType: "DepositPreauth",
            Account: address,
            Authorize: authorizeAddress,
            Fee: TRANSACTION_FEE_DROPS
        };

        const description = `Pre-authorize ${authorizeAddress} for deposit`;
        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: description,
            delayMs: 0,
            type: "depositpreauth",
            queueElementId: "transaction-queue-transactions"
        };

        transactionQueue.push(txEntry);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }
    } catch (error) {
        const errorElement = document.getElementById('address-error-transactions');
        if (errorElement) errorElement.textContent = `Error: ${error.message}`;
    }
}

async function queueMegaTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-transactions');
        if (!errorElement) {
            log('Error: #address-error-transactions element not found in DOM.');
            return;
        }

        if (!contentCache || !displayTimer) {
            log('Error: No wallet loaded.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }

        if (!address || !xrpl.isValidAddress(address)) {
            log('Error: Invalid address.');
            errorElement.textContent = 'Invalid address.';
            return;
        }

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const destinationAddress = document.getElementById('send-destination')?.value?.trim();
        if (!destinationAddress || !xrpl.isValidAddress(destinationAddress)) {
            log('Error: Invalid destination address.');
            errorElement.textContent = 'Invalid destination address.';
            return;
        }

        const sendAssetDisplay = document.getElementById('send-asset-display');
        if (!sendAssetDisplay) {
            log('Error: Send asset display not found in DOM.');
            errorElement.textContent = 'Send Transactions section not loaded.';
            return;
        }

        const selectedAssetName = sendAssetDisplay.getAttribute('data-value') || sendAssetDisplay.textContent;
        if (!selectedAssetName || selectedAssetName === 'Select Asset') {
            log('Error: No asset selected.');
            errorElement.textContent = 'Please select an asset.';
            return;
        }

        const amountInput = document.getElementById('send-amount');
        const rawAmount = amountInput?.value?.trim();
        if (!rawAmount || isNaN(parseFloat(rawAmount)) || parseFloat(rawAmount) <= 0) {
            log('Error: Invalid amount.');
            errorElement.textContent = 'Invalid amount.';
            return;
        }

        
        let amount = parseFloat(rawAmount);
        const formattedAmountStr = truncateAmount(amount);
        amount = parseFloat(formattedAmountStr);
        if (isNaN(amount)) {
            log('Error: Amount formatting failed.');
            errorElement.textContent = 'Amount formatting failed.';
            return;
        }
        const roundedAmount = amount;

        const destinationTagInput = document.getElementById('send-destination-tag')?.value?.trim();
        let destinationTag = null;
        if (destinationTagInput) {
            destinationTag = parseInt(destinationTagInput);
            if (isNaN(destinationTag) || destinationTag < 0 || destinationTag > 4294967295) {
                log('Error: Invalid Destination Tag. Must be a number between 0 and 4294967295.');
                errorElement.textContent = 'Invalid Destination Tag.';
                return;
            }
        }

        const memo = document.getElementById('send-memo')?.value?.trim();
        const scheduleCheckbox = document.getElementById('schedule-tx-transactions');
        const delayInput = document.getElementById('schedule-delay-transactions');
        let delayMs = 0;
        if (scheduleCheckbox?.checked && delayInput?.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling mega transactions to be sent in ${delayMinutes} minutes...`);
        }

        const confirmed = await showMegaTransactionConfirmationModal(roundedAmount, selectedAssetName, destinationAddress, memo);
        if (!confirmed) {
            log('Mega transaction cancelled by user.');
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const sendAssetGrid = document.getElementById('send-asset-grid');
        const selectedOption = sendAssetGrid.querySelector(`.asset-option[data-value="${selectedAssetName}"]`);
        const isLPToken = selectedOption?.getAttribute('data-is-lp') === 'true';
        const currencyHex = selectedOption?.getAttribute('data-currency-hex') || selectedOption?.getAttribute('data-hex');
        const issuer = selectedOption?.getAttribute('data-issuer');

        let asset = selectedAssetName === "XRP" ? null : getAssetByName(selectedAssetName);
        if (isLPToken) {
            if (!currencyHex || !issuer) {
                log('Error: Missing ledger data for LP token.');
                errorElement.textContent = 'Invalid LP token data.';
                return;
            }
            asset = { hex: currencyHex, issuer: issuer, name: selectedAssetName };
        } else if (asset && !asset.hex && !asset.issuer && selectedAssetName !== "XRP") {
            log(`Error: Invalid asset data for ${selectedAssetName}.`);
            errorElement.textContent = 'Invalid asset data.';
            return;
        }

        
        await validateBalancesForTransaction(address, asset, roundedAmount, selectedAssetName !== "XRP", 5);

        
        log(`Sending 5 transactions of ${roundedAmount} ${selectedAssetName} to ${destinationAddress}${memo ? ` with memo "${memo}"` : ''}`);

        for (let i = 0; i < 5; i++) {
            const tx = {
                TransactionType: "Payment",
                Account: address,
                Destination: destinationAddress,
                Amount: asset ? {
                    currency: asset.hex,
                    issuer: asset.issuer,
                    value: formattedAmountStr
                } : xrpl.xrpToDrops(roundedAmount),
                Fee: TRANSACTION_FEE_DROPS
            };
            if (asset) {
                const sendMaxAmount = roundedAmount * 1.001; 
                const formattedSendMaxStr = truncateAmount(sendMaxAmount);
                tx.SendMax = {
                    currency: asset.hex,
                    issuer: asset.issuer,
                    value: formattedSendMaxStr
                };
            }
            if (memo) {
                tx.Memos = [{ Memo: { MemoData: stringToHex(memo), MemoType: stringToHex("Memo") } }];
            }
            if (destinationTag !== null) {
                tx.DestinationTag = destinationTag;
            }

            
            log(`Debug: Queuing Mega Send ${i + 1}/5 with Amount: ${JSON.stringify(tx.Amount)}`);

            const description = `Send ${roundedAmount} ${selectedAssetName} to ${destinationAddress}${memo ? ` with memo "${memo}"` : ''} (Mega Send ${i + 1}/5)`;
            const txEntry = {
                tx: tx,
                wallet: wallet,
                description: description,
                delayMs: delayMs + (i * 5000), 
                type: "payment",
                queueElementId: "transaction-queue-transactions",
                isMega: true 
            };
            transactionQueue.push(txEntry);
        }

        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }
    } catch (error) {
        log(`Mega transaction error: ${error.message}`);
        const errorElement = document.getElementById('address-error-transactions');
        if (errorElement) errorElement.textContent = `Error: ${error.message}`;
    }
}

async function queueTrustlineTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-trustlines');
        if (!contentCache || !displayTimer) {
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

        const issuer = document.getElementById('trust-issuer').value;
        const currency = document.getElementById('trust-currency').value;
        const limit = document.getElementById('trust-limit').value;

        if (!issuer || !currency || !limit) {
            log('Error: Missing trustline fields.');
            errorElement.textContent = 'Fill all trustline fields.';
            return;
        }
        if (!xrpl.isValidAddress(issuer)) {
            log('Error: Invalid issuer address.');
            errorElement.textContent = 'Invalid issuer address.';
            return;
        }
        if (parseFloat(limit) < 0) {
            log('Error: Trustline limit must be non-negative.');
            errorElement.textContent = 'Trustline limit must be non-negative.';
            return;
        }

        if (parseFloat(limit) === 0) {
            const confirmStasis = confirm("Warning: Setting the trustline limit to 0 will place any tokens you hold in stasis, preventing sending or receiving. You can undo this later by setting a proper limit. Proceed?");
            if (!confirmStasis) {
                log('Trustline setting cancelled.');
                return;
            }
        }

        const seed = await fetchRenderContent();
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
            log(`Error: Insufficient available balance to set trustline. Available: ${formatBalance(availableBalanceXrp)} XRP, Required: ${formatBalance(totalRequiredXrp)} XRP (Fee: ${transactionFeeXrp} XRP).`);
            errorElement.textContent = `Insufficient available balance. Available: ${formatBalance(availableBalanceXrp)} XRP.`;
            return;
        }

        const tx = {
            TransactionType: "TrustSet",
            Account: address,
            LimitAmount: { currency: currency, issuer: issuer, value: limit },
            Fee: TRANSACTION_FEE_DROPS,
            Flags: TF_SET_NO_RIPPLE
        };

        const scheduleCheckbox = document.getElementById('schedule-tx-trustlines');
        const delayInput = document.getElementById('schedule-delay-trustlines');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling trustline transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Set trustline for ${xrpl.convertHexToString(currency).replace(/\0/g, '')} (Issuer: ${issuer}) with limit ${limit}`,
            delayMs: delayMs,
            type: "trustline",
            queueElementId: "trustline-queue"
        };

        transactionQueue.push(txEntry);
        log(`Trustline transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Trustline queue error: ${error.message}`);
    }
}

async function queueSwapTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-amm');
        if (!contentCache || !displayTimer) {
            log('Error: No wallet loaded.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }
        const amountInput = document.getElementById('swap-amount');
        const slippageInput = document.getElementById('swap-slippage');
        const inputAssetDisplay = document.getElementById('swap-input-asset-display');
        const outputAssetDisplay = document.getElementById('swap-output-asset-display');
        const outputAmountInput = document.getElementById('swap-output-amount');
        if (!amountInput || !slippageInput || !inputAssetDisplay || !outputAssetDisplay || !outputAmountInput) {
            log('Error: Swap input elements not found.');
            errorElement.textContent = 'Swap input elements not found.';
            return;
        }

        const amount = amountInput.value.trim();
        const slippage = slippageInput.value.trim();
        const inputAsset = inputAssetDisplay.getAttribute('data-value') || inputAssetDisplay.textContent;
        const outputAsset = outputAssetDisplay.getAttribute('data-value') || outputAssetDisplay.textContent;
        const inputHex = inputAssetDisplay.getAttribute('data-hex') || 'XRP';
        const outputHex = outputAssetDisplay.getAttribute('data-hex') || 'XRP';
        const inputIssuer = inputAssetDisplay.getAttribute('data-issuer') || '';
        const outputIssuer = outputAssetDisplay.getAttribute('data-issuer') || '';
        const delayMs = 0;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            log('Error: Invalid swap amount.');
            errorElement.textContent = 'Invalid swap amount.';
            return;
        }

        if (!slippage || isNaN(slippage) || parseFloat(slippage) <= 0) {
            log('Error: Invalid slippage percentage.');
            errorElement.textContent = 'Invalid slippage percentage.';
            return;
        }

        const outputAmount = parseFloat(outputAmountInput.value);
        if (!outputAmount || outputAmount <= 0 || isNaN(outputAmount)) {
            log('Error: Invalid output amount calculation.');
            errorElement.textContent = 'Invalid output amount calculation.';
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        const inputAssetData = inputAsset === 'XRP' ? { currency: 'XRP' } : { currency: inputHex, issuer: inputIssuer };
        const outputAssetData = outputAsset === 'XRP' ? { currency: 'XRP' } : { currency: outputHex, issuer: outputIssuer };

        if (outputAsset !== 'XRP') {
            let hasTrustline = false;
            try {
                const accountLines = window.cachedAccountLines && window.cachedAccountLines.result && window.cachedAccountLines.result.lines
                    ? window.cachedAccountLines
                    : await client.request({ command: "account_lines", account: address, ledger_index: "current" });
                hasTrustline = accountLines.result.lines.some(line => line.currency === outputHex && line.account === outputIssuer);
            } catch (error) {
                log(`Error checking trustline for ${outputAsset}: ${error.message}`);
                throw new Error(`Failed to verify trustline for ${outputAsset}`);
            }
            if (!hasTrustline) {
                log(`No trustline found for ${outputAsset}. Queuing trustline transaction...`);
                const trustlineTx = {
                    TransactionType: "TrustSet",
                    Account: address,
                    LimitAmount: {
                        currency: outputHex,
                        issuer: outputIssuer,
                        value: "1000000000000000"
                    },
                    Fee: TRANSACTION_FEE_DROPS,
                    Flags: TF_SET_NO_RIPPLE
                };
                const trustlineEntry = {
                    tx: trustlineTx,
                    wallet: wallet,
                    description: `Set trustline for ${outputAsset} (${outputHex}) with issuer ${outputIssuer}`,
                    delayMs: 0,
                    type: "trustset",
                    queueElementId: "transaction-queue-amm"
                };
                transactionQueue.push(trustlineEntry);
                updateTransactionQueueDisplay();
                log(`Trustline transaction queued for ${outputAsset}.`);
            } else {
                log(`Trustline for ${outputAsset} already exists. Skipping trustline creation.`);
            }
        }

        const ammInfo = await client.request({
            command: "amm_info",
            asset: inputAssetData,
            asset2: outputAssetData,
            ledger_index: "current"
        });

        if (!ammInfo.result.amm) {
            log(`Error: AMM pool not found for ${inputAsset}/${outputAsset}.`);
            errorElement.textContent = 'AMM pool not found.';
            return;
        }

        const slippageTolerance = parseFloat(slippage) / 100;
        const minOutput = outputAmount * (1 - slippageTolerance);
        const formattedMinOutput = truncateAmount(minOutput);
        const maxInput = parseFloat(amount) * (1 + slippageTolerance);
        const formattedMaxInput = truncateAmount(maxInput);

        const tx = {
            TransactionType: "Payment",
            Account: address,
            Destination: address,
            Amount: outputAsset === 'XRP' ? xrpl.xrpToDrops(formattedMinOutput) : { currency: outputHex, issuer: outputIssuer, value: formattedMinOutput },
            SendMax: inputAsset === 'XRP' ? xrpl.xrpToDrops(formattedMaxInput) : { currency: inputHex, issuer: inputIssuer, value: formattedMaxInput },
            Fee: TRANSACTION_FEE_DROPS
        };

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Swap ${amount} ${inputAsset} for ${outputAmount} ${outputAsset} via AMM`,
            delayMs: delayMs,
            type: "payment",
            queueElementId: "transaction-queue-amm"
        };

        transactionQueue.push(txEntry);
        log(`Swap transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Swap transaction error: ${error.message}`);
        errorElement.textContent = `Error: ${error.message}`;
    }
}

async function queueAccountDeleteTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-deletion');

        if (!contentCache || !displayTimer) {
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

        const destination = document.getElementById('delete-destination').value.trim();
        if (!xrpl.isValidAddress(destination)) {
            log('Error: Invalid destination address.');
            errorElement.textContent = 'Invalid destination address.';
            return;
        }
        if (destination === address) {
            log('Error: Destination address cannot be the same as the account being deleted.');
            errorElement.textContent = 'Destination address cannot be the same as the account.';
            return;
        }

        const accountInfo = await client.request({ command: "account_info", account: address, ledger_index: "current" });
        const balanceXrp = xrpl.dropsToXrp(accountInfo.result.account_data.Balance);
        const sequence = accountInfo.result.account_data.Sequence;

        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedgerIndex = ledgerInfo.result.ledger_current_index;

        const accountObjects = await client.request({ command: "account_objects", account: address, ledger_index: "current" });
        const ownedObjects = accountObjects.result.account_objects;

        const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
        const trustlines = accountLines.result.lines;

        const trustlineCount = trustlines.length;
        const totalReserveXrp = BASE_RESERVE_XRP + (trustlineCount * TRUSTLINE_RESERVE_XRP);

        const sequenceRequirementMet = sequence <= (currentLedgerIndex - 256);
        if (!sequenceRequirementMet) {
            log(`Error: Sequence number (${sequence}) is too high. It must be at least 256 less than the current ledger index (${currentLedgerIndex}). Wait for more ledgers to close.`);
            errorElement.textContent = 'Sequence number too high. Wait for more ledgers to close.';
            return;
        }

        const transactionFeeXrp = ACCOUNT_DELETE_FEE_XRP;
        const minimumBalanceXrp = totalReserveXrp + transactionFeeXrp;
        const balanceSufficient = parseFloat(balanceXrp) >= minimumBalanceXrp;
        if (!balanceSufficient) {
            log(`Error: Insufficient balance (${balanceXrp} XRP). Minimum required: ${minimumBalanceXrp} XRP (Reserve: ${totalReserveXrp} XRP, Fee: ${transactionFeeXrp} XRP).`);
            errorElement.textContent = 'Insufficient balance to cover reserve and fee.';
            return;
        }

        const noOwnedObjects = ownedObjects.length === 0;
        if (!noOwnedObjects) {
            log(`Error: Account owns objects (${ownedObjects.length}). Delete all trustlines, offers, and other objects before deleting the account.`);
            errorElement.textContent = 'Account owns objects. Delete all objects first.';
            return;
        }

        try {
            await client.request({ command: "account_info", account: destination, ledger_index: "current" });
        } catch (error) {
            if (error.message.includes("actNotFound")) {
                log(`Error: Destination account (${destination}) does not exist on the ledger.`);
                errorElement.textContent = 'Destination account does not exist.';
                return;
            }
            throw error;
        }

        const remainingXrp = Math.max(0, parseFloat(balanceXrp) - totalReserveXrp - transactionFeeXrp);
        log(`Expected XRP to be sent to destination after deletion: ${remainingXrp} XRP (Balance: ${balanceXrp} XRP, Reserve: ${totalReserveXrp} XRP, Fee: ${transactionFeeXrp} XRP)`);

        const confirmMessage = `WARNING: This will PERMANENTLY delete the account ${address} and send its remaining XRP (${formatBalance(remainingXrp)} XRP, after subtracting the reserve of ${totalReserveXrp} XRP and the transaction fee of ${transactionFeeXrp} XRP) to ${destination}. This action is IRREVERSIBLE. Are you sure you want to proceed?`;
        if (!confirm(confirmMessage)) {
            log('Account deletion cancelled by user.');
            return;
        }

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const tx = {
            TransactionType: "AccountDelete",
            Account: address,
            Destination: destination,
            Fee: xrpl.xrpToDrops(ACCOUNT_DELETE_FEE_XRP)
        };

        const scheduleCheckbox = document.getElementById('schedule-tx-deletion');
        const delayInput = document.getElementById('schedule-delay-deletion');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling account deletion transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Delete account ${address} and send remaining XRP to ${destination}`,
            delayMs: delayMs,
            type: "deletion",
            queueElementId: "deletion-queue"
        };

        transactionQueue.push(txEntry);
        log(`Account deletion transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Account deletion queue error: ${error.message}`);
    }
}

async function queueNukeTrustline() {
    const address = globalAddress;
    const errorElement = document.getElementById('address-error-nuke');
    const nukeAssetDisplay = document.getElementById('nuke-asset-display');
    const nukeBalanceElement = document.getElementById('nuke-asset-balance');

    if (!contentCache || !displayTimer) {
        log('Error: No wallet loaded.');
        errorElement.textContent = 'No wallet loaded.';
        return;
    }

    if (!xrpl.isValidAddress(address)) {
        log('Error: Invalid address.');
        errorElement.textContent = 'Invalid address.';
        return;
    }

    const nukeAsset = nukeAssetDisplay.getAttribute('data-value') || nukeAssetDisplay.textContent;
    if (!nukeAsset || nukeAsset === "Select Asset") {
        log('Error: No asset selected for nuking.');
        errorElement.textContent = 'Select an asset to nuke.';
        return;
    }

    if (nukeAsset === "XRP") {
        log('Error: Cannot nuke XRP trustline.');
        errorElement.textContent = 'Cannot nuke XRP trustline.';
        return;
    }

    const preEther = spawnEtherNoise(4);
    window.etherPreFlux = preEther;

    try {
        await ensureConnected();
        const assetData = getAssetByName(nukeAsset);
        if (!assetData) {
            log(`Error: Asset ${nukeAsset} not found.`);
            errorElement.textContent = `Asset ${nukeAsset} not found.`;
            return;
        }

        const currencyHex = assetData.hex;
        const issuer = assetData.issuer;
        if (!issuer || !xrpl.isValidAddress(issuer)) {
            log('Error: Invalid issuer for trustline.');
            errorElement.textContent = 'Invalid issuer.';
            return;
        }

        let trustline = null;
        let nukeBalance = 0;
        try {
            const accountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            });
            trustline = accountLines.result.lines.find(line => line.currency === currencyHex && line.account === issuer);
            if (trustline) {
                nukeBalance = parseFloat(trustline.balance);
                nukeBalanceElement.textContent = `Current Balance: ${formatBalance(nukeBalance)} ${assetData.name}`;
                log(`Actual balance from ledger for ${nukeAsset}: ${nukeBalance}`);
            } else {
                nukeBalanceElement.textContent = `Current Balance: 0 ${assetData.name} (No Trustline)`;
                log(`No trustline found for ${nukeAsset} with issuer ${issuer}.`);
            }
        } catch (error) {
            log(`Error fetching trustline for ${nukeAsset}: ${error.message}`);
            nukeBalanceElement.textContent = 'Current Balance: Unable to fetch';
            return;
        }

        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        const totalFeeXrp = (nukeBalance !== 0 ? 2 : 1) * parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        if (totalFeeXrp > availableBalanceXrp) {
            log(`Error: Insufficient XRP for fees. Need ${totalFeeXrp.toFixed(6)} XRP, have ${formatBalance(availableBalanceXrp)}.`);
            errorElement.textContent = `Insufficient XRP for fees. Need ${totalFeeXrp.toFixed(6)} XRP, have ${formatBalance(availableBalanceXrp)}.`;
            return;
        }

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);

        if (nukeBalance !== 0) {
            const balanceStr = trustline.balance; 
            const paymentTx = {
                TransactionType: "Payment",
                Account: address,
                Destination: issuer,
                Amount: {
                    currency: currencyHex,
                    issuer: issuer,
                    value: balanceStr
                },
                Fee: TRANSACTION_FEE_DROPS
            };
            transactionQueue.push({
                tx: paymentTx,
                wallet: wallet,
                description: `💥 Nuke Trustline: Send ${balanceStr} ${nukeAsset} to issuer ${issuer}`,
                delayMs: 0,
                type: "nuke_payment",
                queueElementId: "transaction-queue-transactions"
            });
            log(`Queued payment of ${balanceStr} ${nukeAsset} to issuer. Queue length: ${transactionQueue.length}`);
            updateTransactionQueueDisplay();

            if (!isProcessingQueue) {
                log('Starting transaction queue processing for nuke payment.');
                await processTransactionQueue();
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
            const updatedAccountLines = await client.request({
                command: "account_lines",
                account: address,
                ledger_index: "current"
            });
            const updatedTrustline = updatedAccountLines.result.lines.find(line => line.currency === currencyHex && line.account === issuer);
            if (updatedTrustline && parseFloat(updatedTrustline.balance) !== 0) {
                log(`Error: Balance not reduced to 0 after payment. Current balance: ${updatedTrustline.balance}`);
                errorElement.textContent = `Failed to reduce balance to 0. Current balance: ${updatedTrustline.balance}`;
                return;
            }
        } else {
            log(`Skipping payment for ${nukeAsset}: Balance is exactly 0.`);
        }

        const trustSet = {
            TransactionType: "TrustSet",
            Account: address,
            LimitAmount: { currency: currencyHex, issuer: issuer, value: "0" },
            Fee: TRANSACTION_FEE_DROPS,
            Flags: 131072
        };

        const prepared = await client.autofill(trustSet);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 50;
        const signed = wallet.sign(prepared);
        log('Submitting Trustline closure transaction...');
        const startTime = Date.now();
        const result = await Promise.race([
            client.submitAndWait(signed.tx_blob),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction submission timed out')), 30000))
        ]);
        const endTime = Date.now();
        log(`Transaction submission took ${(endTime - startTime) / 1000} seconds`);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            log('Trustline closed successfully');
            const postEther = spawnEtherNoise(5);
            window.etherPostFlux = postEther;
            await resecureCache();
        } else {
            log(`Trustline closure failed: ${result.result.meta.TransactionResult}`);
            if (result.result.meta.TransactionResult === "tefNO_AUTH_REQUIRED") log('Info: No authorization required for this Trustline.');
        }

        await checkBalance();
    } catch (error) {
        log(`queueNukeTrustline error: ${error.message}`);
        errorElement.textContent = `Error: ${error.message}`;
    }
}

async function setTrustline(txEntry) {
    try {
        await ensureConnected();
        const { tx, wallet } = txEntry;

        tx.Flags = xrpl.TrustSetFlags.tfSetNoRipple;

        const preparedTrustSet = await client.autofill(tx);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        preparedTrustSet.LastLedgerSequence = currentLedger + 50;
        const signedTrustSet = wallet.sign(preparedTrustSet);
        log('Submitting Trustline transaction...');
        const startTimeTrustSet = Date.now();
        const trustSetResult = await Promise.race([
            client.submitAndWait(signedTrustSet.tx_blob),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Trustline transaction submission timed out')), 30000))
        ]);
        const endTimeTrustSet = Date.now();
        log(`Trustline transaction submission took ${(endTimeTrustSet - startTimeTrustSet) / 1000} seconds`);
        log(`Trustline Transaction Hash: ${trustSetResult.result.hash}`);

        if (trustSetResult.result.meta.TransactionResult !== "tesSUCCESS") {
            log(`Trustline failed: ${trustSetResult.result.meta.TransactionResult}`);
            if (trustSetResult.result.meta.TransactionResult === "tefNO_AUTH_REQUIRED") log('Info: No authorization required for this Trustline.');
            return;
        }

        log('Trustline set successfully with No Ripple flag enabled.');

        const accountLines = await client.request({ command: "account_lines", account: tx.Account, ledger_index: "current" });
        const newTrustline = accountLines.result.lines.find(line => line.currency === tx.LimitAmount.currency && line.account === tx.LimitAmount.issuer);
        if (newTrustline) {
            if (parseFloat(newTrustline.balance) < 0) {
                log('Warning: Trustline balance is negative. The No Ripple flag may not be applied due to XRPL restrictions.');
            } else {
                log(`Trustline balance: ${formatBalance(newTrustline.balance)}. No Ripple flag should be active.`);
            }
        } else {
            log('Trustline successfully closed and removed from account lines.');
        }

        await checkBalance();
    } catch (error) {
        log(`Trustline error: ${error.message || 'Unknown error occurred'}`);
        throw error;
    }
}

async function closeTrustline() {
    try {
        await ensureConnected();
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-trustlines');

        if (!contentCache || !displayTimer) {
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

        const issuer = document.getElementById('trust-issuer').value;
        const currency = document.getElementById('trust-currency').value;

        if (!issuer || !currency) {
            log('Error: Missing fields.');
            errorElement.textContent = 'Fill Issuer and Hex Code.';
            return;
        }

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const trustSet = {
            TransactionType: "TrustSet",
            Account: address,
            LimitAmount: { currency: currency, issuer: issuer, value: "0" },
            Fee: TRANSACTION_FEE_DROPS,
            Flags: 131072
        };

        const prepared = await client.autofill(trustSet);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 50;
        const signed = wallet.sign(prepared);
        log('Submitting Trustline closure transaction...');
        const startTime = Date.now();
        const result = await Promise.race([
            client.submitAndWait(signed.tx_blob),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction submission timed out')), 30000))
        ]);
        const endTime = Date.now();
        log(`Transaction submission took ${(endTime - startTime) / 1000} seconds`);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            log('Trustline closed successfully');
            await checkBalance();

            const postEther = spawnEtherNoise(5);
            window.etherPostFlux = postEther;

            await resecureCache();
        } else {
            log(`Trustline closure failed: ${result.result.meta.TransactionResult}`);
            if (result.result.meta.TransactionResult === "tefNO_AUTH_REQUIRED") log('Info: No authorization required for this Trustline.');
        }
    } catch (error) {
        log(`Close trustline error: ${error.message || 'Unknown error occurred'}`);
    }
}


let megaCounter = 0;



let sessionSavings = 0;
let lastFeeSaved = 0;
let lastSlippageSaved = 0;

function updateSavingsDisplay() {
    const ammSection = document.getElementById('amm-swap');
    if (!ammSection) return;
    let savingsLabel = ammSection.querySelector('#savings-label');
    if (!savingsLabel) {
        savingsLabel = document.createElement('div');
        savingsLabel.id = 'savings-label';
        savingsLabel.style.marginTop = '10px';
        savingsLabel.style.color = '#00ff00';
        savingsLabel.style.fontWeight = 'bold';
        savingsLabel.style.textDecoration = 'underline';
        savingsLabel.style.fontSize = '16px';  
        ammSection.appendChild(savingsLabel);
    }
    savingsLabel.innerHTML = `<strong><u>Fees saved this swap: ${lastFeeSaved.toFixed(6)} XRP / Slippage saved this swap: ${lastSlippageSaved.toFixed(6)} XRP / Total saved this session in fees+slippage: ${sessionSavings.toFixed(6)} XRP</u></strong>`;
}

async function processTransactionQueue() {
    if (transactionQueue.length === 0) {
        isProcessingQueue = false;
        log('Queue is empty. Processing stopped.');
        updateTransactionQueueDisplay();
        return;
    }

    isProcessingQueue = true;
    const txEntry = transactionQueue[0];
    const { tx, wallet, description, delayMs, type, queueElementId, isMega, retryCount = 0, maxRetries = 2 } = txEntry;

    try {
        if (delayMs > 0) {
            log(`Waiting ${delayMs / 1000} seconds before sending: ${description}`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        await ensureConnected();
        const prepared = await client.autofill(tx);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        prepared.LastLedgerSequence = ledgerInfo.result.ledger_current_index + 100;
        const signed = wallet.sign(prepared);

        if (!isMega || megaCounter === 0) {
            log(description);
            log(`Blob: ${signed.tx_blob}`, true);
        }

        const timeout = type === "ammwithdraw" ? 45000 : 15000;
        const result = await Promise.race([
            client.submitAndWait(signed.tx_blob),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction submission timed out')), timeout))
        ]);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            const confirmationMessage = isMega ? `Confirmation ${megaCounter + 1}/5: ${result.result.hash}` : `Confirmation: ${result.result.hash}`;
            log(confirmationMessage);
            if (type === "ammwithdraw") {
                const delivered = result.result.meta.delivered_amount || result.result.meta.DeliveredAmount;
                log(`Debug: AMMWithdraw result - ${JSON.stringify(result)}`);
                log(`Delivered: ${delivered ? (typeof delivered === 'string' ? xrpl.dropsToXrp(delivered) : `${delivered.value} ${delivered.currency}`) : 'Unknown'}`);
            }
            transactionQueue.shift();
            updateTransactionQueueDisplay();
            try {
                await checkBalance();
                if (type === "ammwithdraw") {
                    const accountLines = await client.request({ command: "account_lines", account: tx.Account, ledger_index: "current" });
                    const trustline = accountLines.result.lines.find(line => line.currency === tx.LPTokens?.currency && line.account === tx.LPTokens?.issuer);
                    if (trustline && parseFloat(trustline.balance) > 0) {
                        log(`Warning: LP balance not cleared after AMMWithdraw. Remaining: ${trustline.balance}`);
                    }
                }
            } catch (error) {
                if (!error.message.includes("Timeout for request")) {
                    log(`Balance check error after transaction: ${error.message}`);
                }
            }

         
            if (tx.TransactionType === "Payment" && tx.Destination === tx.Account) {
                let tradeValueXRP;
                if (typeof tx.Amount === 'string') {
                    tradeValueXRP = parseFloat(xrpl.dropsToXrp(tx.Amount));
                } else if (typeof tx.SendMax === 'string') {
                    tradeValueXRP = parseFloat(xrpl.dropsToXrp(tx.SendMax));
                } else {
                    log('Warning: Could not determine XRP trade value for savings calculation.');
                    tradeValueXRP = 0;
                }
                lastFeeSaved = tradeValueXRP * 0.01;
                const slippagePercent = (Math.random() * 2) + 1;  
                lastSlippageSaved = tradeValueXRP * (slippagePercent / 100);
                sessionSavings += lastFeeSaved + lastSlippageSaved;
                log(`Fees saved this swap: ${lastFeeSaved.toFixed(6)} XRP / Slippage saved this swap: ${lastSlippageSaved.toFixed(6)} XRP / Total saved this session: ${sessionSavings.toFixed(6)} XRP`);
                updateSavingsDisplay();
            }

            if (transactionQueue.length > 0) {
                log('Waiting 3 seconds before next transaction...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                await processTransactionQueue();
            } else {
                isProcessingQueue = false;
                log('Queue processing completed.');
            }
        } else {
            throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
        }
    } catch (error) {
        log(`Queue processing error for ${description}: ${error.message}`);
        if (type === "ammwithdraw" && retryCount < maxRetries) {
            log(`Retrying AMMWithdraw (attempt ${retryCount + 1}/${maxRetries})...`);
            transactionQueue[0].retryCount = retryCount + 1;
            await new Promise(resolve => setTimeout(resolve, 5000));
            await processTransactionQueue();
        } else {
            transactionQueue.shift();
            updateTransactionQueueDisplay();
            if (isMega) {
                megaCounter = 0;
            }
            if (transactionQueue.length > 0) {
                log('Waiting 3 seconds before next transaction...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                await processTransactionQueue();
            } else {
                isProcessingQueue = false;
                log('Queue processing completed with errors.');
            }
        }
    }
}


async function processPaymentTransaction(txEntry) {
    try {
        const { tx, wallet, description } = txEntry;
        log('Autofilling transaction...');
        const prepared = await client.autofill(tx);
        log(`Prepared transaction: ${JSON.stringify(prepared)}`);
        log('Fetching current ledger...');
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 100;
        log('Signing transaction...');

        let tempText = await fetchRenderContent();
        const activeWallet = xrpl.Wallet.fromSeed(tempText);
        const signed = activeWallet.sign(prepared);

        tempText = crypto.getRandomValues(new Uint8Array(32));
        tempText = crypto.getRandomValues(new Uint8Array(32));
        tempText = crypto.getRandomValues(new Uint8Array(32));
        tempText = null;

        log(`Submitting transaction: ${description}`);
        let result = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const startTime = Date.now();
                result = await Promise.race([
                    client.submitAndWait(signed.tx_blob),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction submission timed out')), 15000))
                ]);
                const endTime = Date.now();
                log(`Transaction submission took ${(endTime - startTime) / 1000} seconds on attempt ${attempt}`);
                break;
            } catch (error) {
                log(`Submission attempt ${attempt} failed: ${error.message}`);
                if (attempt === 2) {
                    const submitResult = await client.submit(signed.tx_blob, { failHard: true });
                    log(`Raw submit response: ${JSON.stringify(submitResult)}`);
                    throw new Error(`Failed after 2 attempts: ${error.message}`);
                }
                log(`Retrying submission (attempt ${attempt + 1}/2)...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            log(`Transaction succeeded: ${description}`);
            log(`Transaction Hash: ${result.result.hash}`);
            await checkBalance();

            const postEther = spawnEtherNoise(5);
            window.etherPostFlux = postEther;
            await resecureCache();
        } else {
            log(`Transaction failed: ${description} - ${result.result.meta.TransactionResult}`);
            throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
        }
    } catch (error) {
        log(`Payment transaction error: ${error.message}`);
        throw error;
    }
}


function updateTransactionQueueDisplay() {
    const queueElements = {
        "transaction-queue-transactions": [],
        "transaction-queue-amm": [],
        "trustline-queue": [],
        "domain-queue": [],
        "deletion-queue": [],
        "regular-key-queue": [],
        "multisign-queue": [],
        "amm-swap-queue": []
    };

    transactionQueue.forEach((item, index) => {
        if (queueElements[item.queueElementId]) queueElements[item.queueElementId].push({ item, index });
    });

    for (const [queueId, items] of Object.entries(queueElements)) {
        const queueElement = document.getElementById(queueId);
        if (!queueElement) continue;
        queueElement.innerHTML = '<p>Transaction Queue:</p>';
        if (items.length === 0) {
            queueElement.innerHTML += '<p>No transactions in queue.</p>';
        } else {
            items.forEach(({ item, index }) => {
                queueElement.innerHTML += `<p>${index + 1}. ${item.description}</p>`;
            });
        }
    }
}

function toggleScheduleOptions(checkboxId, delayId) {
    const scheduleCheckbox = document.getElementById(checkboxId);
    const delayInput = document.getElementById(delayId);
    if (scheduleCheckbox && delayInput) delayInput.disabled = !scheduleCheckbox.checked;
}

function showTransactionConfirmationModal(amount, currency, destination, memo) {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'password-modal-overlay confirmation-modal';
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Transaction</h2>
                <p>You are going to send ${amount} ${currency} to ${destination}${memo ? ` with memo "${memo}"` : ''}.</p>
                <p>This action is IRREVERSIBLE.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmTx">Send</button>
                    <button class="red-black-btn" id="cancelTx">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const confirmButton = document.getElementById('confirmTx');
        const cancelButton = document.getElementById('cancelTx');

        const resolveAndCleanup = (result) => {
            modal.remove();
            resolve(result);
        };

        confirmButton.onclick = () => resolveAndCleanup(true);
        cancelButton.onclick = () => resolveAndCleanup(false);
    });
}

function showMegaTransactionConfirmationModal(amount, currency, destination, memo) {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'password-modal-overlay confirmation-modal';
        modal.innerHTML = `
            <div class="password-modal-content">
                <h2>Confirm Mega Transaction</h2>
                <p>You are going to send this transaction 5 times: ${amount} ${currency} to ${destination}${memo ? ` with memo "${memo}"` : ''}.</p>
                <p>This action is IRREVERSIBLE.</p>
                <div class="modal-buttons">
                    <button class="green-btn" id="confirmMegaTx">Send x5</button>
                    <button class="red-black-btn" id="cancelMegaTx">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const confirmButton = document.getElementById('confirmMegaTx');
        const cancelButton = document.getElementById('cancelMegaTx');

        const resolveAndCleanup = (result) => {
            modal.remove();
            resolve(result);
        };

        confirmButton.onclick = () => resolveAndCleanup(true);
        cancelButton.onclick = () => resolveAndCleanup(false);
    });
}

function formatBalance(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (Math.abs(num) < 0.000001) return num.toFixed(8);
    return truncateAmount(num);
}

async function setSendPercentage(percentage) {
    const sendAssetDisplay = document.getElementById('send-asset-display');
    const sendAmountInput = document.getElementById('send-amount');
    const errorElement = document.getElementById('address-error-transactions');

    if (!sendAssetDisplay || !sendAmountInput || !errorElement) {
        errorElement.textContent = 'Send transaction elements not found.';
        return;
    }

    const assetName = sendAssetDisplay.getAttribute('data-value');
    const isLP = sendAssetDisplay.getAttribute('data-is-lp') === 'true';
    const currencyHex = sendAssetDisplay.getAttribute('data-hex');
    const issuer = sendAssetDisplay.getAttribute('data-issuer');

    try {
        let balance = 0;
        if (assetName === 'XRP') {
            await ensureConnected();
            if (!client || !client.isConnected()) {
                errorElement.textContent = 'No active XRPL connection.';
                return;
            }
            const { availableBalanceXrp } = await calculateAvailableBalance(globalAddress, 1);
            balance = availableBalanceXrp;
        } else if (isLP) {
            const lpToken = globalLPTokens.find(token => token.currency === currencyHex && token.issuer === issuer);
            if (!lpToken) {
                await ensureConnected();
                if (!client || !client.isConnected()) {
                    errorElement.textContent = 'No active XRPL connection.';
                    return;
                }
                const accountLines = await client.request({
                    command: "account_lines",
                    account: globalAddress,
                    ledger_index: "current"
                });
                const line = accountLines.result.lines.find(l => l.currency === currencyHex && l.account === issuer);
                balance = parseFloat(line?.balance) || 0;
            } else {
                balance = parseFloat(lpToken.balance) || 0;
            }
        } else {
            await ensureConnected();
            if (!client || !client.isConnected()) {
                errorElement.textContent = 'No active XRPL connection.';
                return;
            }
            const accountLines = await client.request({
                command: "account_lines",
                account: globalAddress,
                ledger_index: "current"
            });
            const line = accountLines.result.lines.find(l => l.currency === currencyHex && l.account === issuer);
            balance = parseFloat(line?.balance) || 0;
        }

        if (balance <= 0) {
            errorElement.textContent = `No balance available for ${assetName}.`;
            return;
        }

        const amount = (percentage / 100) * balance;
        sendAmountInput.value = amount.toFixed(6);
        errorElement.textContent = '';
    } catch (err) {
        errorElement.textContent = 'Error setting amount.';
    }
}

const prefabAssets = [
	{ name: "$Xoge", issuer: "rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1", hex: "586F676500000000000000000000000000000000" },	
    { name: "$GRD", issuer: "rDaDV5smdWjr8QcagD8UhbPZWzJBkdVAnH", hex: "GRD" },
	{ name: "$HWR", issuer: "rND47ZuHb4Jq7yCT5xjJd1xwq697FPfVxv", hex: "HWR" },
	{ name: "$RLUSD", issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De", hex: "524C555344000000000000000000000000000000" },
	{ name: "$x402", issuer: "rUCs3p2yuBQnTA1weH4TfA3NhBUxMhRSdT", hex: "5834303200000000000000000000000000000000" },
    { name: "$PUPU", issuer: "r4WfqR5DQ7PwPvVJv8Gism5cQBLGtNnvK8", hex: "5055505500000000000000000000000000000000" },
	{ name: "$Army", issuer: "rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC", hex: "41524D5900000000000000000000000000000000" },
	{ name: "$BANANA", issuer: "rpopnahpwzxiwapipm5ehq6kslehvgilqp", hex: "42414e414e410000000000000000000000000000" },
	{ name: "$589", issuer: "rfcasq9uRbvwcmLFvc4ti3j8Qt1CYCGgHz", hex: "589" },
	{ name: "$GNOSIS", issuer: "rHUQ3xYC2hwfJa9idjjmsCcb5hP3qZiiTM", hex: "474E4F5349530000000000000000000000000000" },
	{ name: "$Bert", issuer: "rpwAnF1mMZRszxdinETFHwzGQiPgsv3jHR", hex: "4245525400000000000000000000000000000000" },
	{ name: "$Scrap", issuer: "rGHtYnnigyuaHehWGfAdoEhkoirkGNdZzo", hex: "7363726170000000000000000000000000000000" },
	{ name: "$RPLS", issuer: "r93hE5FNShDdUqazHzNvwsCxL9mSqwyiru", hex: "52504C5300000000000000000000000000000000" },
	{ name: "$Nox", issuer: "rBbu9c7zyuiDH4bq7uJhdLhzsRdEkSrYFX", hex: "NOX" },
	{ name: "$BITx", issuer: "rBitcoiNXev8VoVxV7pwoQx1sSfonVP9i3", hex: "4249547800000000000000000000000000000000" },
	{ name: "$METH", issuer: "rKus1pe2EZAgaL18b8MbiJkgrniWTP625G", hex: "4D45544800000000000000000000000000000000" },
	{ name: "$Schwepe", issuer: "rUQXurByxmKni4aLpuWMYMxxV5GWT1Azw2", hex: "5343485745504500000000000000000000000000" },
	{ name: "$Xrpm", issuer: "r9mZNnos1GLtc55tkmr21G9BgXxV7w9hT1", hex: "5852504D00000000000000000000000000000000" },
	{ name: "$Flippy", issuer: "rsENFmELvj92orrCKTkDTug53MzwsB7zBd", hex: "24464C4950505900000000000000000000000000" },
	{ name: "$Lihua", issuer: "rnhtvpHsAgigmVemgtzt7pujj4gv6LVL2a", hex: "4C49485541000000000000000000000000000000" },
	{ name: "$Slt", issuer: "rfGCeDUdtbzKbXfgvrpG745qdC1hcZBz8S", hex: "SLT" },
	{ name: "$QZilla", issuer: "rUwZzhDKFLcgK87jeJumy5sfLk3XXKUDWh", hex: "515A696C6C610000000000000000000000000000" },
	{ name: "$BRV", issuer: "rGf8e4eJurwKwmc8CzfknTP9GVuw67Hrmh", hex: "BRV" },
	{ name: "$TOE", issuer: "rfCNgbLFAyCiY5FNyrNhokdcsjZ3X2atoe", hex: "TOE" },
	{ name: "$GIVER", issuer: "rHqwsGhTiGE9P8g8so47zawX4SWVrVnwD", hex: "4749564552000000000000000000000000000000" },
	{ name: "$BMT", issuer: "rE8dJChTgdF4GD84z8Ah5NoNbVvMTqRMLk", hex: "BMT" },
	{ name: "$Ripple", issuer: "rMgrYs2XYgbGaLZ19HbUXfi9rpsaFQYwgc", hex: "524950504C450000000000000000000000000000" },
	{ name: "$Xox", issuer: "rGJbFqiLdh23e9WigQ5sxTfFqTENveLX21", hex: "XOX" },
	{ name: "$Ribble", issuer: "rG7jT6D4fHsipvVmPSbcnvDtFzXwwSR4qx", hex: "524942424C450000000000000000000000000000" },
	{ name: "$Riptard", issuer: "r37NJszgETCmYqUkPH7PmtkpVdsYBfMYSc", hex: "5249505441524400000000000000000000000000" },
	{ name: "$Pidgn", issuer: "rhxmPqZGPeHTW684vbf1HAMsHff8RTDfWn", hex: "504944474E000000000000000000000000000000" },
	{ name: "$America", issuer: "rpVajoWTXFkKWY7gtWSwcpEcpLDUjtktCA", hex: "416D657269636100000000000000000000000000" },
	{ name: "$Grim", issuer: "rHLRdLwXiBZSD53ZQz8ogGJz25LzNCCjSz", hex: "4752494D00000000000000000000000000000000" },
	{ name: "$Britto", issuer: "rfxwXDzenkYoXSEbNA4cZjaT9FY3eeL47e", hex: "42524954544F0000000000000000000000000000" },
	{ name: "$Fuzzy", issuer: "rhCAT4hRdi2Y9puNdkpMzxrdKa5wkppR62", hex: "46555A5A59000000000000000000000000000000" },
	{ name: "$Barron", issuer: "rLxJv7a6uScd6qaSbuELTPkj9i2vJhn6YZ", hex: "426172726F6E0000000000000000000000000000" },
	{ name: "$Flame", issuer: "rp5CUgVjAhuthJs8LdjTXFdNWJzfQqc3p2", hex: "464C414D45000000000000000000000000000000" },
	{ name: "$Grumpy", issuer: "ra9UE2hHy4AaLeEvbj6gKFPF1DWP2K8kT6", hex: "4752554D50590000000000000000000000000000" },
	{ name: "$Mouse", issuer: "rJevHGVUzAUPSGxiECgqcNVNVjRkTBWD7T", hex: "4D4F555345000000000000000000000000000000" },
	{ name: "$Luther", issuer: "rPBWcjbyqcrGxpUe4awobqMmB2WaeUhuFb", hex: "4C55544845520000000000000000000000000000" },
	{ name: "$BitcoinOnXrp", issuer: "rhLJ2ma5pScsxVhL5EQr71w3FgASVLwP84", hex: "BOX" },
	{ name: "$Toto", issuer: "r9sH6YEVRyg8uYaKfyk1EfH36Lfq7a8PUD", hex: "544F544F00000000000000000000000000000000" },
	{ name: "$Trump", issuer: "r3iM2Ffe9Krgn6n3qhHj2oe8kiJMKB63s7", hex: "245452554D500000000000000000000000000000" },
	{ name: "$XGC", issuer: "rM4qkDcRyMDks5v1hYakKnLbTeppmgCpM1", hex: "XGC" },
	{ name: "$Kekius", issuer: "rLWCx7obzMRbFfreNR6eScPz6GWj4xbr4v", hex: "4B454B4955530000000000000000000000000000" },
	{ name: "$Doge", issuer: "rp4GXygXPM2ydNLgiDeHrrkfuaAufSZaca", hex: "444F474500000000000000000000000000000000" },
	{ name: "$Sand", issuer: "rs5zZN42NGy9VdEMuTgU6NVPqpBZQRZ2bv", hex: "AND" },
	{ name: "$Zrpy", issuer: "rsxkrpsYaeTUdciSFJwvto7MKSrgGnvYvA", hex: "5A52505900000000000000000000000000000000" },
	{ name: "$Meme", issuer: "rs98d8usUqkf9Wuww6MgMghSdQpvMmVFt4", hex: "4D454D4500000000000000000000000000000000" },
	{ name: "$Uga", issuer: "rBFJGmWj6YaabVCxfsjiCM8pfYXs8xFdeC", hex: "UGA" },
	{ name: "$Goat", issuer: "r96Ny5BTU3z4Aw4BfiMJ7RTgDa5iE17u9t", hex: "474F415400000000000000000000000000000000" },
	{ name: "$XRDOGE", issuer: "rLqUC2eCPohYvJCEBJ77eCCqVL2uEiczjA", hex: "5852646F67650000000000000000000000000000" },
	{ name: "$Xrpete", issuer: "rEBFKbaYRkzt9tBvV51xaW1RLYZaNyBztC", hex: "5852506574650000000000000000000000000000" },
	{ name: "$Denari", issuer: "rUY6tjGN8PJDVyVFLztRZLmPZ8uTBUfa2Z", hex: "DFI" },
	{ name: "$Peipei", issuer: "r9RftFhd6P9MzWsNkayH1Hb8rPzY5GkaGE", hex: "5045495045490000000000000000000000000000" },
	{ name: "$Rizzle", issuer: "rE99nDT3riuM9VjMQkVstMqRGBsnUHw6vm", hex: "52495A5A4C450000000000000000000000000000" },
	{ name: "$Alex", issuer: "rEwd8T3xMrhJwybaEPCMYY9NeDnxdmpiYw", hex: "24414C4558000000000000000000000000000000" },
	{ name: "$Normie", issuer: "rwtZ99naquDaXzHJNQVn9okoseWTWjQYcp", hex: "4E4F524D49450000000000000000000000000000" },
	{ name: "$Starbro", issuer: "rLfF6rkXsMvNBYosPmwX2kAGQ5oMtab6dW", hex: "5354415242524F00000000000000000000000000" },
	{ name: "$404", issuer: "raHJ4Jz9PYk356wWaDMYw79B17iWtfsSMi", hex: "404" },
	{ name: "$Xrpee", issuer: "r95aZmg9f6UU1CUApwS8V2hmejWrq5ESd3", hex: "5852506565000000000000000000000000000000" },
	{ name: "$Brb", issuer: "rUkuT9TCDTP2oeAPsrCN7XKcHZfdvHvFkG", hex: "BRB" },
	{ name: "$Maga", issuer: "rwH49FHnr48FeUP7NX9EuL4k1peLrPwS3d", hex: "4D41474100000000000000000000000000000000" },
	{ name: "$Stksy", issuer: "rMyKhoyQnheGEQBfLH4sjdg9pN5z72ehrT", hex: "53544B5359000000000000000000000000000000" },
	{ name: "$Bchamp", issuer: "rhYhn7s6z4HAfuJm7ehuSE7wxepRoUPwpi", hex: "424348414D500000000000000000000000000000" },
	{ name: "$Xtr", issuer: "rafe4x2fTrgFXauqEfmyjHDmhFgqB1YYGv", hex: "XTR" },
	{ name: "$Xwar", issuer: "rJAm3vMSiwCZHxLygaTdmiqCUG8YeSJFVy", hex: "5857415200000000000000000000000000000000" },	
	{ name: "$Cult", issuer: "rCULtAKrKbQjk1Tpmg5hkw4dpcf9S9KCs", hex: "43554C5400000000000000000000000000000000" },	
	{ name: "$SOLO", issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz", hex: "534F4C4F00000000000000000000000000000000" },	
	{ name: "$ELS", issuer: "rHXuEaRYnnJHbDeuBH5w8yPh5uwNVh5zAg", hex: "ELS" },	
	{ name: "$CORE", issuer: "rcoreNywaoz2ZCQ8Lg2EbSLnGuRBmun6D", hex: "434F524500000000000000000000000000000000" },	
	{ name: "$VGB", issuer: "rhcyBrowwApgNonehKBj8Po5z4gTyRknaU", hex: "VGB" },	
	{ name: "$CX1", issuer: "rKk7mu1dNB25fsPEJ4quoQd5B8QmaxewKi", hex: "CX1" },	
	{ name: "$XCORE", issuer: "r3dVizzUAS3U29WKaaSALqkieytA2LCoRe", hex: "58434F5245000000000000000000000000000000" },	
	{ name: "$BTCGatehub", issuer: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL", hex: "BTC" },	
	{ name: "$ETHGatehub", issuer: "rcA8X3TVMST1n3CJeAdGk1RdRCHii7N2h", hex: "ETH" },	
	{ name: "$Equilibrium", issuer: "rpakCr61Q92abPXJnVboKENmpKssWyHpwu", hex: "457175696C69627269756D000000000000000000" },	
	{ name: "$PHNIX", issuer: "rDFXbW2ZZCG5WgPtqwNiA2xZokLMm9ivmN", hex: "50484E4958000000000000000000000000000000" },	
	{ name: "$USDGatehub", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", hex: "USD" },	
	{ name: "$EURGatehub", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", hex: "EUR" },	
	{ name: "$XQK", issuer: "rHKrPGdpaqNRqRvmsiqQhD6azqc4npWoLC", hex: "XQK" },	
	{ name: "$NICE", issuer: "r96uXvCJxe3Yeeo9wCtJsLSpJiFUz2hvsB", hex: "4E49434500000000000000000000000000000000" },	
	{ name: "$XDX", issuer: "rMJAXYsbNzhwp7FfYnAsYP5ty3R9XnurPo", hex: "XDX" },	
	{ name: "$LCB", issuer: "r9U2eJg3FgpYKX8PrFPSxHdVu4ZheLZRJ3", hex: "LCB" },	
	{ name: "$RPR", issuer: "r3qWgpz2ry3BhcRJ8JE6rxM8esrfhuKp4R", hex: "RPR" },	
	{ name: "$Calorie", issuer: "rNqGa93B8ewQP9mUwpwqA19SApbf62U7PY", hex: "43616C6F72696500000000000000000000000000" },	
	{ name: "$FSE", issuer: "rs1MKY54miDtMFEGyNuPd3BLsXauFZUSrj", hex: "FSE" },	
	{ name: "$PASA", issuer: "rBPtuMc4HBR1SuZyZv8hs7WBVxLBYrzxbY", hex: "5041534100000000000000000000000000000000" },	
	{ name: "$CodeCoin", issuer: "rGbsKNrVURRfU1WEb1aEqaoyRJDkvssyBa", hex: "436F6465436F696E000000000000000000000000" },	
	{ name: "$CNY", issuer: "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA", hex: "CNY" },	
	{ name: "$ATM", issuer: "raDZ4t8WPXkmDfJWMLBcNZmmSHmBC523NZ", hex: "ATM" },	
	{ name: "$LUC", issuer: "rsygE5ynt2iSasscfCCeqaGBGiFKMCAUu7", hex: "LUC" },	
	{ name: "$Daric", issuer: "rK9AtihZZYWAwZQnJCYzZnyW833vbcPXPf", hex: "4461726963000000000000000000000000000000" },	
	{ name: "$TRSRY", issuer: "rLBnhMjV6ifEHYeV4gaS6jPKerZhQddFxW", hex: "5452535259000000000000000000000000000000" },	
	{ name: "$XRSHIB", issuer: "rN3EeRSxh9tLHAUDmL7Chh3vYYoUafAyyM", hex: "5852534849420000000000000000000000000000" },	
	{ name: "$XPM", issuer: "rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa", hex: "XPM" },		
	{ name: "$ShibaNFT", issuer: "rnRXAnVZTyattZXEpKpgTyvdm17DpjrzSZ", hex: "53686962614E4654000000000000000000000000" },	
	{ name: "$Editions", issuer: "rfXwi3SqywQ2gSsvHgfdVsyZdTVM15BG7Z", hex: "65646974696F6E73000000000000000000000000" },	
	{ name: "$XRPS", issuer: "rN1bCPAxHDvyJzvkUso1L2wvXufgE4gXPL", hex: "5852505300000000000000000000000000000000" },	
	{ name: "$xSTIK", issuer: "rJNV9i4Q6zvRhpE2zjxgkvff3eGHQohZht", hex: "785354494B000000000000000000000000000000" },	
	{ name: "$MRM", issuer: "rNjQ9HZYiBk1WhuscDkmJRSc3gbrBqqAaQ", hex: "MRM" },	
	{ name: "$CNY", issuer: "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y", hex: "CNY" },	
	{ name: "$xCBS", issuer: "rNvhXtgDdd4Sh3NKLXcUH9Hozs4dqu62we", hex: "7843425300000000000000000000000000000000" },	
	{ name: "$Gift", issuer: "rBXXRBZ46rwCkS9mHom3WW8u7gSytb5KcZ", hex: "4769667400000000000000000000000000000000" },	
	{ name: "$XGBL", issuer: "rMy6sCaDVF1C2BT3qmNG6kgjVDZqZ74uoF", hex: "5847424C00000000000000000000000000000000" },	
	{ name: "$xCoin", issuer: "rXCoYSUnkpygdtfpz3Df8dKQuRZjM9UFi", hex: "78436F696E000000000000000000000000000000" },	
	{ name: "$DRS", issuer: "rDrSRap6jdWqtmxjpvDUCv3q128UjL2GS2", hex: "DRS" },	
	{ name: "$TPR", issuer: "rht98AstPWmLPQMrwd9YDrcDoTjw9Tiu4B", hex: "TPR" },	
	{ name: "$Schmeckles", issuer: "rPxw83ZP6thv7KmG5DpAW4cDW55DZRZ9wu", hex: "5363686D65636B6C657300000000000000000000" },	
	{ name: "$XGF", issuer: "rJnn9jdwaBfuyq383hNiX2oowLuLUm2DZD", hex: "XGF" },	
	{ name: "$SmartNFT", issuer: "	rf8dxyFrYWEcUQAM7QXdbbtcRPzjvoQybK", hex: "536D6172744E4654000000000000000000000000" },	
	{ name: "$DBX", issuer: "rHLJNqxCoPXdm4CnLd3w63ZFRqAUU2U4vS", hex: "DBX" },	
	{ name: "$BBulldoge", issuer: "r3b8BtKC4d8r4Je7PDJhzAgNTLR64seTDu", hex: "4242756C6C646F67650000000000000000000000" },	
	{ name: "$SwissTech", issuer: "raq7pGaYrLZRa88v6Py9V5oWMYEqPYr8Tz", hex: "5377697373546563680000000000000000000000" },	
	{ name: "$Bear", issuer: "rBEARGUAsyu7tUw53rufQzFdWmJHpJEqFW", hex: "4245415200000000000000000000000000000000" },	
	{ name: "$XRTemplate", issuer: "rMX54z8VgtRhPefzqVkdG3LxsuGdFQcXxr", hex: "585254656D706C61746500000000000000000000" },	
	{ name: "$XUM", issuer: "r465PJyGWUE8su1oVoatht6cXZJTg1jc2m", hex: "XUM" },	
	{ name: "$xHulk", issuer: "r43PooeaFyp2cCfqxMkZLu47VKUDaCzQVt", hex: "7848756C6B000000000000000000000000000000" },	
	{ name: "$ELM", issuer: "rQB9HhhBCq2zAVpwQD3jV9ja39DmomdWj1", hex: "ELM" },	
	{ name: "$XRSoftware", issuer: "rJZ9Hpaeqy3fdBvjVUjx1fW1bE75HgaJbr", hex: "5852536F66747761726500000000000000000000" },	
	{ name: "$BlackFriday", issuer: "raFpHssoH3rWkMy9XLjA6NDRW2y44tiFVM", hex: "426C61636B467269646179000000000000000000" },	
	{ name: "$xSPECTAR", issuer: "rh5jzTCdMRCVjQ7LT6zucjezC47KATkuvv", hex: "7853504543544152000000000000000000000000" },	
	{ name: "$BENTLEY", issuer: "rUW7zPkKa2QqMH2jm3PE9WqL3G4oWZL3Hj", hex: "42454E544C455900000000000000000000000000" },	
	{ name: "$CCN", issuer: "rG1bDjT25WyvPz757YC9NqdRKyz9ywF8e8", hex: "CCN" },	
	{ name: "$NFTL", issuer: "r3DCE2UVaqQaGQragAjmwL6kNicF2rw6PL", hex: "4E46544C00000000000000000000000000000000" },	
	{ name: "$XRBear", issuer: "rKxqkAbT2BQUbtnknSAJon7kX89gUKpZu3", hex: "5852426561720000000000000000000000000000" },	
	{ name: "$MAG", issuer: "rXmagwMmnFtVet3uL26Q2iwk287SRvVMJ", hex: "MAG" },	
	{ name: "$SGBGatehub", issuer: "rctArjqVvTHihekzDeecKo6mkTYTUSBNc", hex: "SGB" },	
	{ name: "$PIN", issuer: "rhx9yNhbo7xtTy6rBY8xrUYkuYdyVs5Arb", hex: "PIN" },	
	{ name: "$XTriviA", issuer: "rhLr8bGvHvBgYXAHNPyXrQAcKGrQ2X5nU4", hex: "5854726976694100000000000000000000000000" },	
	{ name: "$Zinfinite", issuer: "rGMU2cbbMhzodpecrjLQ2A814DqL8LFxjY", hex: "5A696E66696E6974650000000000000000000000" },	
	{ name: "$TALENT", issuer: "r92SQCuWhYoB4w2UnKU7PKj4Mh7jSyemrH", hex: "54414C454E540000000000000000000000000000" },		
	{ name: "$XONE", issuer: "rP9v5sQR5LqcB6Bk7xJSKqUoHytkHT1one", hex: "584F4E4500000000000000000000000000000000" },	
	{ name: "$XRGary", issuer: "rCE2rxDDZtM7qkHAxorjkfLiHX71HtqTY", hex: "5852476172790000000000000000000000000000" },	
	{ name: "$Cake", issuer: "ra1XmvmraMiRYarFrHEU7XDojvRyipU5Vg", hex: "43616B6500000000000000000000000000000000" },	
	{ name: "$POKER", issuer: "rfNWXEENu93dvCBnjpFY7mRpprZzBUx8hC", hex: "504F4B4552000000000000000000000000000000" },	
	{ name: "$GOLD", issuer: "rGQtGHrgN4FK1RcEn83q4t8aK6BobzDEMK", hex: "474F4C4400000000000000000000000000000000" },	
	{ name: "$TipCoin", issuer: "rsUjMrcGu8ANoTwv3zUJE6MzSL6K7fMyPU", hex: "546970436F696E00000000000000000000000000" },	
	{ name: "$OCEAN", issuer: "rPCrPJ9Uz988tD1aQVAToioDcCGZ8nbBTn", hex: "4F4345414E000000000000000000000000000000" },	
	{ name: "$USDBitstamp", issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B", hex: "USD" },	
	{ name: "$SPREAD", issuer: "rwPzJd39swHT6NfxvgGFYE7q9q7EcqKuKW", hex: "5350524541440000000000000000000000000000" },	
	{ name: "$DROP", issuer: "rszenFJoDdiGjyezQc8pME9KWDQH43Tswh", hex: "44524F5000000000000000000000000000000000" },	
	{ name: "$RDX", issuer: "rQa3LW1Au4GxGHzDBkCMKuPcn326w4Wcj2", hex: "RDX" },	
	{ name: "$UVX", issuer: "r4XUTsMNJoT8Cs6rNHzbif5MpZ7sPH1nWF", hex: "UVX" },	
	{ name: "$XCC", issuer: "rKuuRSQM2pTtv8ZrhQbU6kBgusCD79cem3", hex: "XCC" },	
	{ name: "$PRINCE", issuer: "rKhaUHzBa78cPa44FL1GTvMLEZ1CkuB7WB", hex: "5072696E63650000000000000000000000000000" },	
	{ name: "$XrpToolKit", issuer: "rXTKdHWuppSjkbiKoEv53bfxHAn1MxmTb", hex: "XTK" },	
	{ name: "$XRTEACH", issuer: "r42RmRk42JYCAvzSifSGAgsZuJBUm2yJSE", hex: "5852544541434800000000000000000000000000" },	
	{ name: "$XRPL3DAPES", issuer: "rLBW9d9cfEY4ZFPbgqKzEpoEHjKeLrotWZ", hex: "5852504C33444150455300000000000000000000" },	
	{ name: "$XrPinoy", issuer: "rt3hn4EYMV39xd7pwqMHacJVSu2kEA18x", hex: "587250696E6F7900000000000000000000000000" },	
	{ name: "$XRPH", issuer: "rM8hNqA3jRJ5Zgp3Xf3xzdZcx2G37guiZk", hex: "5852504800000000000000000000000000000000" },	
	{ name: "$XRPets", issuer: "rESKaHTUhDD5mT2p1H99Y3KeJVc6Y7t4vx", hex: "5852506574730000000000000000000000000000" },	
	{ name: "$XRPBR", issuer: "rfnMuYiECGMAHUkZdDw5K1c7gVdoiqkmJC", hex: "5852504252000000000000000000000000000000" },	
	{ name: "$XReddog", issuer: "rUWpPmEHBQfb6xgcTtVrGUK5ppztU5GDUF", hex: "58526564646F6700000000000000000000000000" },	
	{ name: "$XParrot", issuer: "r3hmy4JpSHPWuomNsGtCkKrCqALakDAJiJ", hex: "58506172726F7400000000000000000000000000" },	
	{ name: "$XJWL", issuer: "rMatwcXVLoRq7yoRR7KNT4Kg8ft8osnJKi", hex: "584A574C00000000000000000000000000000000" },	
	{ name: "$xCIV", issuer: "rUampeA54U7Fcfwp5cxrRarS37eiaT44HB", hex: "7843495600000000000000000000000000000000" },	
	{ name: "$SmartLOX", issuer: "rBdZkMKuPnzYVVkyL2DrQKV3DsYt5PPVRh", hex: "536D6172744C4F58000000000000000000000000" },	
	{ name: "$MeowRP", issuer: "rMPEuuvWf6MvCu77NpUF37GUkdbwr9Nhhk", hex: "4D656F7752500000000000000000000000000000" },	
	{ name: "$FAITH", issuer: "rfeSrMKMvyb3MSMnQRFZ1Dwd9KHS6g49ZT", hex: "4641495448000000000000000000000000000000" },	
	{ name: "$STX", issuer: "rSTAYKxF2K77ZLZ8GoAwTqPGaphAqMyXV", hex: "STX" },	
	{ name: "$X3DPUNK", issuer: "rKGMZbfKhVhmbQU5DwGgF6tgQMzzK5ydxr", hex: "58334450554E4B00000000000000000000000000" },
	{ name: "$Women", issuer: "rGiv7xKG4ShaRz4KPxgzXC1teMBxnaPyRU", hex: "576F6D656E000000000000000000000000000000" },
	{ name: "$WEED", issuer: "raDF491dC9XF1guG5zZkWWpNQoFquwt2cp", hex: "5745454400000000000000000000000000000000" },
	{ name: "$SmartPlayToken", issuer: "rswD8h8uzKPEUh26QKeWnxP2dR2HLkhCPm", hex: "SPT" },
	{ name: "$PONGO", issuer: "rwCq6TENSo3Hh9LKipXnLaxaeXBXKubqki", hex: "504F4E474F000000000000000000000000000000" },	
	{ name: "$LOVE", issuer: "rDpdyF9LtYpwRdHZs8sghaPscE8rH9sgfs", hex: "4C4F564500000000000000000000000000000000" },	
	{ name: "$GamerXGold", issuer: "rMczrvMki7DuXsuMf3zGUrqAmWvLKZNnt2", hex: "47616D657258476F6C6400000000000000000000" },		
	{ name: "$Peas", issuer: "rPAArd4yZAJaDCR5gs41YYmGphfj6yzh3R", hex: "5065617300000000000000000000000000000000" },	
	{ name: "$SEC", issuer: "rKrjzz3fN8inpeG8fZAinuyen7ZRcsRvB9", hex: "SEC" },	
	{ name: "$BumCrack", issuer: "rBuFBE8nx5Zpojj6EY3Lfh4sd1CHskFRC7", hex: "42756D437261636B000000000000000000000000" },	
	{ name: "$IRE", issuer: "rfTYvAG86Y1L61RQjbxHTyJmphYzHgguCd", hex: "IRE" },	
	{ name: "$1MC", issuer: "rsJvPP7GVdPfe5zmQtvxAJVZAmDUGfhkV1", hex: "1MC" },	
	{ name: "$XFLOKI", issuer: "rUtXeAXonpFpgKubAa7LxcLd7NFep92T1t", hex: "58464C4F4B490000000000000000000000000000" },	
	{ name: "$FCX", issuer: "rwSgqza9DUzr8oPDkJz8xUbPbaxAyoeLus", hex: "FCX" },	
	{ name: "$JPY", issuer: "rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS", hex: "JPY" },	
	{ name: "$XWSB", issuer: "rLpL5d9qubKjht8GnkxgnVTQPq9MKNc757", hex: "5857534200000000000000000000000000000000" },	
	{ name: "$xianggang", issuer: "rMUqLuW4RpBvVAKNoaCubvbXgzuSnf6P8J", hex: "7869616E6767616E670000000000000000000000" },	
	{ name: "$CNY", issuer: "rPT74sUcTBTQhkHVD54WGncoqXEAMYbmH7", hex: "CNY" },	
	{ name: "$SimbaXRP", issuer: "rDqwjJ8fUqdyfPjJZ3h93J1XY8hz6CjEYo", hex: "53696D6261585250000000000000000000000000" },	
	{ name: "$OXP", issuer: "rrno7Nj4RkFJLzC4nRaZiLF5aHwcTVon3d", hex: "OXP" },	
	{ name: "$XDogelon", issuer: "rNFKrSUW1xKzDwHz8J9uVAs4GpxtEUoAsF", hex: "58446F67656C6F6E000000000000000000000000" },	
	{ name: "$xBANK", issuer: "rLpDQmJUpDxLXCjrwmm5rPehZyGA4GRFNZ", hex: "7842414E4B000000000000000000000000000000" },		
	{ name: "$MONTEZUMA", issuer: "rNJpp2TXWrtFfNs8mbEsrj8gj6XVHfHywD", hex: "4D4F4E54455A554D410000000000000000000000" },	
	{ name: "$icoin", issuer: "rJSTh1VLk52tFC3VRXkNWu7Q4nYmfZv7BZ", hex: "69636F696E000000000000000000000000000000" },	
	{ name: "$ADV", issuer: "rPneN8WPHZJaMT9pF4Ynyyq4pZZZSeTuHu", hex: "ADV" },	
	{ name: "$CTF", issuer: "r9Xzi4KsSF1Xtr8WHyBmUcvfP9FzTyG5wp", hex: "CTF" },	
	{ name: "$UMMO", issuer: "rfGqDiFegcMm8e9saj48ED74PkotwJCmJd", hex: "554D4D4F00000000000000000000000000000000" },	
	{ name: "$FLRGatehub", issuer: "rcxJwVnftZzXqyH9YheB8TgeiZUhNo1Eu", hex: "FLR" },	
	{ name: "$XRMOON", issuer: "rBBh2z5wsxE9gcVE2yUU39UntvRMHDKPpq", hex: "58524D4F4F4E0000000000000000000000000000" },	
	{ name: "$HADALITE", issuer: "rHiPGSMBbzDGpoTPmk2dXaTk12ZV1pLVCZ", hex: "484144414C495445000000000000000000000000" },	
	{ name: "$SSE", issuer: "rMDQTunsjE32sAkBDbwixpWr8TJdN5YLxu", hex: "SSE" },	
	{ name: "$CSC", issuer: "rCSCManTZ8ME9EoLrSHHYKW8PPwWMgkwr", hex: "CSC" },	
	{ name: "$DIA", issuer: "rQfWiU7kRbJBFSXRyQh7GTUeEP6qJ4kp2F", hex: "DIA" },	
	{ name: "$CHILLGUY", issuer: "rnMFxp6fBSzDm13MgKDNKbVy1z2gjiLCh8", hex: "4348494C4C475559000000000000000000000000" },	
	{ name: "$Cheetah", issuer: "rfLudDNMJeu3yD6wEPj37GJ9LBpQ4u42d6", hex: "4368656574616800000000000000000000000000" },	
	{ name: "$CBIRD", issuer: "rHcU3JWTp7fnea3xgvbV8pCbEp9S3HjSUz", hex: "4342495244000000000000000000000000000000" },	
	{ name: "$BRAD", issuer: "rBRAD8ntFu3yFhpoo7uLjj4EbVi2UQ1EMR", hex: "4252414400000000000000000000000000000000" },	
	{ name: "$BPUG", issuer: "rUjp8dVpWFr7WJa93uHjSN16fZgiJivPwa", hex: "4250554700000000000000000000000000000000" },	
	{ name: "$aura", issuer: "rpjuvqrH37RGzb88UVibzCQYSNrM9FxJDy", hex: "6175726100000000000000000000000000000000" },	
	{ name: "$AntiSol", issuer: "rn3dKqno4t4vXTe9dBHzXQyJtkvMcaPdyA", hex: "416E7469536F6C00000000000000000000000000" },	
	{ name: "$AnimaCoin", issuer: "rGQrZvndQsJV2S5cnSdiRFMPT1Fz1Ccvuj", hex: "416E696D61436F696E0000000000000000000000" },
	{ name: "$PGN", issuer: "rPUSoeJaHQzrXATtGniVjwBQQDEtJcdwFq", hex: "PGN" },	
	{ name: "$XAHGatehub", issuer: "rswh1fvyLqHizBS2awu1vs6QcmwTBd9qiv", hex: "XAH" },	
	{ name: "$xFlashChain", issuer: "rJgcjY1MZJjw946qRqN57V3TGg9PZEA1bw", hex: "78466C617368436861696E000000000000000000" },	
	{ name: "$666", issuer: "rhvf9fe6PP3GC8Bku2Ug7iQPjPDxYZfrxN", hex: "666" },
	{ name: "$Stb", issuer: "rw9kWBD9LwnCrvLEZFDApDDLYfwZFv1dNs", hex: "STB" },
	{ name: "$MiLady", issuer: "rhPSguKUfFLjELmXxctobqpz4NgPneBXvS", hex: "4D494C4144590000000000000000000000000000" },
	{ name: "$Burn", issuer: "rwgNTwrsZKPe7xYCy4emjFAYpgnuioHSkd", hex: "4255524E00000000000000000000000000000000" },
	{ name: "$BlueUmbrellaToken", issuer: "riQtZKAtGWGRThMNBGz8RtLGAKHd7Za8x", hex: "BUT" },
    { name: "$Dood", issuer: "rn5Y9N8APtrc7PVqXdMjkG9qvfw7FWi4kC", hex: "446F6F6400000000000000000000000000000000" },
	{ name: "$Laugh", issuer: "r32nbPw6cyt3KdxinB4ua6WSLRrrF4SXAC", hex: "4C61756768000000000000000000000000000000" },
	{ name: "$Sigma", issuer: "rfKYWZ84fm9eVEdoTcsQCo1WdqMPyaUF5z", hex: "5349474D41000000000000000000000000000000" },
	{ name: "$Xmeme", issuer: "r4UPddYeGeZgDhSGPkooURsQtmGda4oYQW", hex: "584D454D45000000000000000000000000000000" },
	{ name: "$Ascension", issuer: "r3qWgpz2ry3BhcRJ8JE6rxM8esrfhuKp4R", hex: "ASC" },
	{ name: "$ARK", issuer: "rf5Jzzy6oAFBJjLhokha1v8pXVgYYjee3b", hex: "ARK" },
    { name: "$3RDEYE", issuer: "rHjyBqFM5oQvXu1soWtATC4r1V6GBnhCQQ", hex: "3352444559450000000000000000000000000000" },
    { name: "$FWOGXRP", issuer: "rNm3VNJJ2PCmQFVDRpDR6N73UEtZh32HFi", hex: "46574F4758525000000000000000000000000000" },
	{ name: "$Joey", issuer: "rN6CXs6J7WDh8miq2C2cre6w7jipc55Ut", hex: "4A6F657900000000000000000000000000000000" },
    { name: "$HAIC", issuer: "rsEXqMHTKDfGzncfJ25XtB9ZY8jayTv7N3", hex: "4841494300000000000000000000000000000000" },
	{ name: "$FML", issuer: "rw4tietmzbPG2G66UudSGaQ5uYztNow3gQ", hex: "FML" },
	{ name: "$OBEY", issuer: "robeyK1nxGh6AKUSSXf3eqyigAWS6Frmw", hex: "4F42455900000000000000000000000000000000" },
	{ name: "$Bwif", issuer: "r33jHP8k9eFY9Vf1SLU2XKfoQ8A3SkXPEh", hex: "6277696600000000000000000000000000000000" },
	{ name: "$FARM", issuer: "rPrAEfVATUNDTJm9CUa8tYeD7oJrVdEGhU", hex: "4641524D00000000000000000000000000000000" },
	{ name: "$XCT", issuer: "r4PQgThiDmTWWYKPKkg5hLxV57ozMU89SW", hex: "XCT" },
	{ name: "$BuildX", issuer: "r4WzuU4bdTcyUtdSyhC8nsLUhv3Ce2xyDy", hex: "4275696C64580000000000000000000000000000" },
	{ name: "$Bluminati", issuer: "rwL4XszmjgpmwyLzeapk4F5JiwsuUu6vYF", hex: "426C756D696E6174690000000000000000000000" },
	{ name: "$TXT", issuer: "rTExTnvBr4Y315ZQDUdmeTitu7iPVqYPg", hex: "TXT" },
	{ name: "$FPT", issuer: "rBXRBN9gSFE4qL6DGWYHgKCLtoMzUVL5cF", hex: "FPT" },
	{ name: "$XBF", issuer: "rBoY3bDCRcmycREKuHRq1H7x9ngcVQwG7k", hex: "XBF" },
	{ name: "$Unite", issuer: "rQKSaCbjYGdYosuPSLLTjzHN19Gwtyx4U6", hex: "554E495445000000000000000000000000000000" },
	{ name: "$Merch", issuer: "rKmDRyzwwECbys6SQSp75y5SZ1q8mDFoNv", hex: "4D45524348000000000000000000000000000000" },
	{ name: "$BlueCollarDollar", issuer: "rMRo1ybMruxEkF4EgyEMpbjU95AqNnVHLF", hex: "BCD" },
	{ name: "$XFT", issuer: "rGpnoqYLzWytxwQhhz715nRbqyCHM7zhxt", hex: "XFT" },
	{ name: "$XIO", issuer: "rfuzioNFTKArnU1PQD5BEF272vpbHMRoxU", hex: "XIO" },
	{ name: "$BOO", issuer: "r4Fn7bWdtGNANq48sGBhFTXvszS47q3u79", hex: "BOO" },
	{ name: "$FIN", issuer: "rEJqyQCiqJgqWXLMMJ8cyLwBJUvBA9xmUA", hex: "FIN" },
	{ name: "$VOX", issuer: "rMfZd1hbBRAvMepbrkfpYdvsNZeSxSbRFN", hex: "VOX" },
	{ name: "$Carpet", issuer: "rGKSqipbv1DFq8uwDidnApEAxHNogpySxi", hex: "4361727065740000000000000000000000000000" },
	{ name: "$WindowsXRP", issuer: "rU9q4ToobNpm8LuXc9ArgtEzdW3VdWix21", hex: "57494E5852500000000000000000000000000000" },
	{ name: "$Miracles", issuer: "rMFu31zXNC6TDPnvCcPGdMP3ic8Z19nArT", hex: "4D697261636C6573000000000000000000000000" },
	{ name: "$DECKS", issuer: "rpCcjG2p5G1aFyEazQ85WDzdsCp9tHFvk8", hex: "4445434B53000000000000000000000000000000" },
	{ name: "$OpenEgg", issuer: "r3jQzqfGVagsWNbSxMJpQV8VK7jHHmdv5j", hex: "OVO" },
	{ name: "$Pebble", issuer: "rUNZsXtpU5NaDePcyYJmjRZjoFdGNRLaQn", hex: "506562626C650000000000000000000000000000" },
	{ name: "$SHROOMIES", issuer: "r4M4TzSypz2gRdS86hTM7oFcSs6yRmEPKZ", hex: "5348524F4F4D4945530000000000000000000000" },
	{ name: "$NBUNNU", issuer: "rsdDZFHp1GXp1GMacDFne2ekSjjfWmhvKu", hex: "4E42554E4E550000000000000000000000000000" },
	{ name: "$MOON", issuer: "rBJT957iKT4Bv1uUhRBkkyttZ4GeiZLcZG", hex: "4D4F4F4E00000000000000000000000000000000" },
	{ name: "$XRPLegion", issuer: "r9d6w9vwMm3jFwbg2S1vVBBspykXJv1xwa", hex: "5852504C00000000000000000000000000000000" },
	{ name: "$RichDucksClub", issuer: "rDuckCoinu8jntxtYoWRhEv4oNvsLYx6EQ", hex: "RDC" },
	{ name: "$XRPATRIOT", issuer: "rhT1NV9xSMLhUDwXaCfNhfVS4Vj8GRJxuZ", hex: "585250415452494F540000000000000000000000" },
	{ name: "$Win&Bixel", issuer: "raCwgDN3QmiBrDQCdsYSnZECh1qtbTqp8N", hex: "W&B" },
	{ name: "$Nuts", issuer: "rBpdegD7kqHdczjKzTKNEUZj1Fg1eYZRbe", hex: "4E75747300000000000000000000000000000000" },
	{ name: "$DarkSpaceCrypto", issuer: "rBe2ws7MSk4uT41yYABN2EntGcs5irJ8Nz", hex: "DSP" },
	{ name: "$ICE", issuer: "rhrazV7YNHhRj9YZ4VFytR8BQUZJEn9So5", hex: "ICE" },
	{ name: "$EXC", issuer: "r3t2bLDT1bxkPLHBH1vk4BFqDPhVJyooEq", hex: "EXC" },
	{ name: "$INL", issuer: "rsARtxd6M1RBoGKwoGh4ujCQ9A6iDYEu4s", hex: "INL" },
	{ name: "$LUX", issuer: "rNEWchNdJDBhDBmQrEZiFgk9WBjX7mKbvn", hex: "LUX" },
	{ name: "$PLR", issuer: "rNSYhWLhuHvmURwWbJPBKZMSPsyG5Qek17", hex: "PLR" },
	{ name: "$Fury", issuer: "rfuryz1gyiTtkEGzXcwghjkKxRHGgXCiZq", hex: "4655525900000000000000000000000000000000" },
	{ name: "$PZA", issuer: "rBi1kmPw7axgkTDG31GFhtuACaveohfYnj", hex: "PZA" },
	{ name: "$Cope", issuer: "rPLUfpGQtr75kCZxCK3fhPQyBue1GR8DuZ", hex: "434F504500000000000000000000000000000000" },
	{ name: "$QLX", issuer: "rMQhWnHuYVmjRcyptPvrueKdLvjQT2Nquc", hex: "QLX" },
	{ name: "$RUG", issuer: "rUnzTAWSTfzxv2spUuo8DrnUCT933KxUoo", hex: "RUG" },
	{ name: "$XAVA", issuer: "rDagYXTmAdYvfp2FQF5XeKaSAxAYgazuzY", hex: "5841564100000000000000000000000000000000" },
	{ name: "$CryptoForHolders", issuer: "rDTHkzTq3Acxu6QrSLVfHrR3KadFknMkfS", hex: "CFH" },
	{ name: "$BUZZ", issuer: "rPkQMC1jxuG2qpSipNzTkgPL86Ssiycvbq", hex: "42555A5A00000000000000000000000000000000" },
	{ name: "$Spiffy", issuer: "rZ4yugfiQQMWx1a2ZxvzskL75TZeGgMFp", hex: "5350494646590000000000000000000000000000" },
	{ name: "$XRPEDIA", issuer: "rGrEQmesFBv6PprFEiXyBmdYgQ3K6veFng", hex: "5852504544494100000000000000000000000000" },
	{ name: "$SellYourSol", issuer: "rLx45R3C3Gw4uThqKC9WymgdF3sD4ejBUr", hex: "SYS" },
	{ name: "$Qwaken", issuer: "rQwakn2cdSkHDCKjcsZitW7vD5Pow5g7ov", hex: "QWK" },
	{ name: "$BRIZZLY", issuer: "rpyzaT6YVM3Bjpr8kEwq2rJGtWRnRQLcz6", hex: "4252495A5A4C5900000000000000000000000000" },
	{ name: "$PUZZY", issuer: "rQa6S3JnnDVZgq3aftX9y8gN3uZHncznc8", hex: "50555A5A59000000000000000000000000000000" },
	{ name: "$SPLASH", issuer: "rwfGtVZKpPX6vb51xE5RGTgXkQ4W9wSUrz", hex: "53504C4153480000000000000000000000000000" },
	{ name: "$SOUND", issuer: "rPazDXf3XHGqftSUKa7tStN33VWNHp6Nns", hex: "534F554E44000000000000000000000000000000" },
	{ name: "$SOLRx", issuer: "rpb8xbS5M324wrRnpS3NRQLfC9aBkBhxWY", hex: "534F4C5278000000000000000000000000000000" },
	{ name: "$SNUB", issuer: "rNCRr79JC8YcA8pG4VAzhrshYxahKCodnX", hex: "534E554200000000000000000000000000000000" },
	{ name: "$Planet", issuer: "rntdU6TyFEjyf8JRkrG3ggJnsFF55zRSq3", hex: "506C616E65740000000000000000000000000000" },
	{ name: "$OnChainWhales", issuer: "rK9DrarGKnVEo2nYp5MfVRXRYf5yRX3mwD", hex: "OCW" },
	{ name: "$MORTAL", issuer: "rHyCV84JWbmhbCAJYpcd76HXcnhJ4uY4Q7", hex: "4D4F5254414C0000000000000000000000000000" },
	{ name: "$Lil2", issuer: "rENNLZVLWMLvwM69h4fR8B43qptEUUG4QH", hex: "4C696C3200000000000000000000000000000000" },
	{ name: "$InGameCredit", issuer: "raP6XZypcFR1WkDzaKjv91FtYRCURvePWW", hex: "IGC" },
	{ name: "$Himalaya", issuer: "raXY8RFAKixBZGw8nhDRHvVCKd2RzeoeLq", hex: "HMC" },
	{ name: "$GreenZoneX", issuer: "rNgsoCk6mjBq5jcqitBpg1gdfYhKajXsM2", hex: "GZX" },
	{ name: "$AMM", issuer: "rpooLMxfvoEPZcPxCfijtK3ZWaux1N1oVL", hex: "AMM" },
	{ name: "$XRPLMemeBubbles", issuer: "rGUKfQ2Sm35KFSZ6BuKsjHxgyKSYgV7pzs", hex: "24425542424C4553000000000000000000000000" },
	{ name: "$Greyhound", issuer: "rJWBaKCpQw47vF4rr7XUNqr34i4CoXqhKJ", hex: "47726579686F756E640000000000000000000000" },
	{ name: "$Fluff", issuer: "rG81ZwWpJbwvkrSPMWYRNAQ4JrYVGzDZfx", hex: "466C756666000000000000000000000000000000" },
	{ name: "$ELVC", issuer: "rLb593mo6Nerw7eWvC19gR1fLggeWX6u6s", hex: "454C564300000000000000000000000000000000" },
	{ name: "$EliteX", issuer: "rPHqxokbdbRHFZ6RLN4TqJrYd3zF3kE1Vd", hex: "456C697465580000000000000000000000000000" },
	{ name: "$DUCK", issuer: "rT5pAVAokKezWrjqnMBF3G8ah4fxVWVVx", hex: "4455434B00000000000000000000000000000000	" },
	{ name: "$HYPE", issuer: "rHypekuoohE9usrCGERxsX5HvdQTnVdMz2", hex: "4859504500000000000000000000000000000000" },
	{ name: "$BIGB", issuer: "rQwKayqFwx5kHUQJ4z4VjA8fQqgD4go4xR", hex: "4249474200000000000000000000000000000000" },
	{ name: "$LIFT", issuer: "rfxkTvVqvmJnHADMcGjZw8Naye9Vs411xk", hex: "244C494654000000000000000000000000000000" },
	{ name: "$TISM", issuer: "rN8CtmZsPa8k3gDnCWsc9oLtXrYJm4PLL5", hex: "5449534D00000000000000000000000000000000" },
	{ name: "$GovsTractors", issuer: "r4eQvtNvXAgjqy9naxRoRuaNapk97PC6qE", hex: "476F767354726163746F72730000000000000000" },
	{ name: "$FLUX", issuer: "rhbmVVzvDme96hHsb2DxKKKfxqnMexB2mz", hex: "464C555800000000000000000000000000000000" },
	{ name: "$LAMBO", issuer: "rJXsaaTBAqZRHeLLd13TpbZhraJnGunAvW", hex: "4C414D424F000000000000000000000000000000" },
	{ name: "$BREPE", issuer: "rHHB2XvFcCETHGmeuCg8tqRyx9r5cnyonE", hex: "4252455045000000000000000000000000000000" },
	{ name: "$XGHT", issuer: "rsiaKDL5VFFaujBCWQM9evkRpEEAd6ZdPR", hex: "5847485400000000000000000000000000000000" },
	{ name: "$SPAWN", issuer: "rDd2Jx5EmpSfQ55zQobx6N5HcRLP4LyRjY", hex: "535041574E000000000000000000000000000000" },
	{ name: "$BOOM", issuer: "rf6ZcoQgwKFGNbvsFfu5PzouGvJSEZwg7t", hex: "424F4F4D00000000000000000000000000000000" },
	{ name: "$WEB3", issuer: "r33Rw1DgD9qCjKjY8KTbzHayxSCFBTRmBy", hex: "5745423300000000000000000000000000000000" },
	{ name: "$TattooToken", issuer: "rG8hYB8hauigZthD1DmHfgLxCxpSXC2Vdn", hex: "546174746F6F546F6B656E000000000000000000" },
	{ name: "$FRACTIONS", issuer: "rEpjJd2X91D4vy1wctrE8o1wrFn4Mpzn4H", hex: "4652414354494F4E530000000000000000000000" },
	{ name: "$HOWEY", issuer: "rDyvo4dSVhZrVT7SNkxV4ynT5DiatDdQbk", hex: "484F574559000000000000000000000000000000" },
	{ name: "$JEZUS", issuer: "r4AgGS5mrckhY4bSTJwCWgpWKsEZGeWm1J", hex: "4A455A5553000000000000000000000000000000" },
	{ name: "$BarberCoin", issuer: "rEzHW6nqgU6fquF3jeV37H8jS9jnGJwwAu", hex: "4252425200000000000000000000000000000000" },
	{ name: "$TXRPL", issuer: "rhGFAGHm996WLGYb9QRqx1rJhJTvBvChkU", hex: "545852504C000000000000000000000000000000" },
	{ name: "$XRPMAN", issuer: "rpCB8upQziQR6P5YbHnZZAqqTMePQ8pCTR", hex: "245852504D414E00000000000000000000000000" }
];

let dexSwapDirection = 'sell';




async function queueSwapTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-amm');
        if (!contentCache || !displayTimer) {
            log('Error: No wallet loaded.');
            errorElement.textContent = 'No wallet loaded.';
            return;
        }

        const amountInput = document.getElementById('swap-amount');
        const slippageInput = document.getElementById('swap-slippage');
        const inputAssetDisplay = document.getElementById('swap-input-asset-display');
        const outputAssetDisplay = document.getElementById('swap-output-asset-display');
        const outputAmountInput = document.getElementById('swap-output-amount');
        if (!amountInput || !slippageInput || !inputAssetDisplay || !outputAssetDisplay || !outputAmountInput) {
            log('Error: Swap input elements not found.');
            errorElement.textContent = 'Swap input elements not found.';
            return;
        }

        const amount = amountInput.value.trim();
        const slippage = slippageInput.value.trim();
        const inputAsset = inputAssetDisplay.getAttribute('data-value') || inputAssetDisplay.textContent;
        const outputAsset = outputAssetDisplay.getAttribute('data-value') || outputAssetDisplay.textContent;
        const inputHex = inputAssetDisplay.getAttribute('data-hex') || 'XRP';
        const outputHex = outputAssetDisplay.getAttribute('data-hex') || 'XRP';
        const inputIssuer = inputAssetDisplay.getAttribute('data-issuer') || '';
        const outputIssuer = outputAssetDisplay.getAttribute('data-issuer') || '';
        const delayMs = 0;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            log('Error: Invalid swap amount.');
            errorElement.textContent = 'Invalid swap amount.';
            return;
        }

        if (!slippage || isNaN(slippage) || parseFloat(slippage) <= 0) {
            log('Error: Invalid slippage percentage.');
            errorElement.textContent = 'Invalid slippage percentage.';
            return;
        }

        const outputAmount = parseFloat(outputAmountInput.value);
        if (!outputAmount || outputAmount <= 0 || isNaN(outputAmount)) {
            log('Error: Invalid output amount calculation.');
            errorElement.textContent = 'Invalid output amount calculation.';
            return;
        }

        await ensureConnected();
        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        const inputAssetData = inputAsset === 'XRP' ? { currency: 'XRP' } : { currency: inputHex, issuer: inputIssuer };
        const outputAssetData = outputAsset === 'XRP' ? { currency: 'XRP' } : { currency: outputHex, issuer: outputIssuer };

        if (outputAsset !== 'XRP') {
            let hasTrustline = false;
            try {
                const accountLines = window.cachedAccountLines && window.cachedAccountLines.result && window.cachedAccountLines.result.lines
                    ? window.cachedAccountLines
                    : await client.request({ command: "account_lines", account: address, ledger_index: "current" });
                hasTrustline = accountLines.result.lines.some(line => line.currency === outputHex && line.account === outputIssuer);
            } catch (error) {
                log(`Error checking trustline for ${outputAsset}: ${error.message}`);
                throw new Error(`Failed to verify trustline for ${outputAsset}`);
            }
            if (!hasTrustline) {
                log(`No trustline found for ${outputAsset}. Queuing trustline transaction...`);
                const trustlineTx = {
                    TransactionType: "TrustSet",
                    Account: address,
                    LimitAmount: {
                        currency: outputHex,
                        issuer: outputIssuer,
                        value: "1000000000000000"
                    },
                    Fee: TRANSACTION_FEE_DROPS,
                    Flags: 0
                };
                const trustlineEntry = {
                    tx: trustlineTx,
                    wallet: wallet,
                    description: `Set trustline for ${outputAsset} (${outputHex}) with issuer ${outputIssuer}`,
                    delayMs: 0,
                    type: "trustset",
                    queueElementId: "transaction-queue-amm"
                };
                transactionQueue.push(trustlineEntry);
                updateTransactionQueueDisplay();
                log(`Trustline transaction queued for ${outputAsset}.`);
            } else {
                log(`Trustline for ${outputAsset} already exists. Skipping trustline creation.`);
            }
        }

        const ammInfo = await client.request({
            command: "amm_info",
            asset: inputAssetData,
            asset2: outputAssetData,
            ledger_index: "current"
        });

        if (!ammInfo.result.amm) {
            log(`Error: AMM pool not found for ${inputAsset}/${outputAsset}.`);
            errorElement.textContent = 'AMM pool not found.';
            return;
        }

        const slippageTolerance = parseFloat(slippage) / 100;
        const minOutput = outputAmount * (1 - slippageTolerance);
        const formattedMinOutput = truncateAmount(minOutput);
        const maxInput = parseFloat(amount) * (1 + slippageTolerance);
        const formattedMaxInput = truncateAmount(maxInput);

        const tx = {
            TransactionType: "Payment",
            Account: address,
            Destination: address,
            Amount: outputAsset === 'XRP' ? xrpl.xrpToDrops(formattedMinOutput) : { currency: outputHex, issuer: outputIssuer, value: formattedMinOutput },
            SendMax: inputAsset === 'XRP' ? xrpl.xrpToDrops(formattedMaxInput) : { currency: inputHex, issuer: inputIssuer, value: formattedMaxInput },
            Fee: TRANSACTION_FEE_DROPS
        };

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Swap ${amount} ${inputAsset} for ${outputAmount} ${outputAsset} via AMM`,
            delayMs: delayMs,
            type: "payment",
            queueElementId: "transaction-queue-amm"
        };

        transactionQueue.push(txEntry);
        log(`Swap transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Swap transaction error: ${error.message}`);
        errorElement.textContent = `Error: ${error.message}`;
    }
}


async function checkPoolPrice() {
    const address = globalAddress;
    const errorElement = document.getElementById('address-error-amm');
    const swapResult = document.getElementById('swap-result');
    const poolInfo = document.getElementById('pool-info');
    const inputAssetDisplay = document.getElementById('swap-input-asset-display');
    const outputAssetDisplay = document.getElementById('swap-output-asset-display');

    if (!inputAssetDisplay || !outputAssetDisplay || !swapResult || !errorElement || !poolInfo) {
        log('Error: Swap elements not found in DOM.');
        errorElement.textContent = 'Swap elements missing.';
        return;
    }

    const inputAsset = inputAssetDisplay.getAttribute('data-value');
    const inputHex = inputAssetDisplay.getAttribute('data-hex');
    const inputIssuer = inputAssetDisplay.getAttribute('data-issuer');
    const outputAsset = outputAssetDisplay.getAttribute('data-value');
    const outputHex = outputAssetDisplay.getAttribute('data-hex');
    const outputIssuer = outputAssetDisplay.getAttribute('data-issuer');

    if (!inputAsset || !outputAsset || !inputHex || !outputHex) {
        log('Error: Input or output asset not selected.');
        errorElement.textContent = 'Select both input and output assets.';
        return;
    }

    if (!contentCache || !displayTimer) {
        log('Error: No wallet loaded.');
        errorElement.textContent = 'No wallet loaded.';
        return;
    }

    if (!xrpl.isValidAddress(address)) {
        log('Error: Invalid address.');
        errorElement.textContent = 'Invalid address.';
        return;
    }

    try {
        await ensureConnected();
        const inputAssetData = inputAsset === "XRP" ? { currency: "XRP" } : { currency: inputHex, issuer: inputIssuer };
        const outputAssetData = outputAsset === "XRP" ? { currency: "XRP" } : { currency: outputHex, issuer: outputIssuer };

        log(`Checking pool price for ${inputAsset}/${outputAsset}`);
        const ammInfo = await throttleRequest(() =>
            client.request({
                command: "amm_info",
                asset: inputAssetData,
                asset2: outputAssetData,
                ledger_index: "current"
            })
        );

        if (!ammInfo.result.amm) {
            log(`No AMM pool found for ${inputAsset}/${outputAsset}.`);
            errorElement.textContent = 'No AMM pool found for this pair.';
            swapResult.innerHTML = '<p style="color: #fff;">Swap Result: No pool found</p>';
            poolInfo.innerHTML = `
                <p>Pool Reserves: -</p>
                <p>Pool Price: -</p>
                <p>Pool Fee: -</p>
            `;
            ammState.lastPoolPrice = null;
            ammState.lastPriceCheckTimestamp = null;
            return;
        }

        const amount1 = ammInfo.result.amm.amount;
        const amount2 = ammInfo.result.amm.amount2;
        const tradingFeeBasisPoints = ammInfo.result.amm.trading_fee || 0;
        const tradingFeePercent = (tradingFeeBasisPoints / 1000).toFixed(3);
        let poolXrp, poolToken, direction, assetName, assetHex, assetIssuer;

        if (inputAsset === "XRP") {
            poolXrp = parseFloat(xrpl.dropsToXrp(amount1));
            poolToken = parseFloat(amount2.value);
            direction = "XRP-to-Token";
            assetName = outputAsset;
            assetHex = outputHex;
            assetIssuer = outputIssuer;
        } else {
            poolXrp = parseFloat(xrpl.dropsToXrp(amount2));
            poolToken = parseFloat(amount1.value);
            direction = "Token-to-XRP";
            assetName = inputAsset;
            assetHex = inputHex;
            assetIssuer = inputIssuer;
        }

        const price = direction === "XRP-to-Token" ? poolToken / poolXrp : poolXrp / poolToken;
        const reversePrice = 1 / price;

        ammState.lastPoolPrice = { poolXrp, poolToken, direction, assetName, assetHex, assetIssuer, tradingFee: tradingFeePercent, price }; 
        ammState.lastPriceCheckTimestamp = Date.now();

        poolInfo.innerHTML = `
            <p>Pool Reserves: ${formatBalance(poolXrp)} XRP, ${formatBalance(poolToken)} ${assetName}</p>
            <p>Pool Price: 1 ${inputAsset} = ${price.toFixed(6)} ${outputAsset}, 1 ${outputAsset} = ${reversePrice.toFixed(6)} ${inputAsset}</p>
            <p>Pool Fee: ${tradingFeePercent}%</p>
        `;

        swapResult.innerHTML = `
            <p style="color: #fff;">Pool Price: 1 ${inputAsset} = ${price.toFixed(6)} ${outputAsset}</p>
            <p style="color: #fff;">Pool Reserves: ${formatBalance(poolXrp)} XRP, ${formatBalance(poolToken)} ${assetName}</p>
            <p style="color: #fff;">Pool Fee: ${tradingFeePercent}%</p>
        `;

        errorElement.textContent = '';

        const slider = document.getElementById('swap-balance-slider');
        if (slider) {
            slider.disabled = false;
            updateSwapAmountsFromSlider();
        }

        log(`Pool price checked: ${inputAsset}/${outputAsset}, Price=${price.toFixed(6)}, Fee=${tradingFeePercent}%`);
    } catch (error) {
        log(`checkPoolPrice error: ${error.message}`);
        errorElement.textContent = error.message.includes("ammNotFound") ? "No AMM pool found." : `Error: ${error.message}`;
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Error</p>';
        poolInfo.innerHTML = `
            <p>Pool Reserves: -</p>
            <p>Pool Price: -</p>
            <p>Pool Fee: -</p>
        `;
        ammState.lastPoolPrice = null;
        ammState.lastPriceCheckTimestamp = null;
    }
}







let currentFeeSaved = 0, currentSlippageSaved = 0, totalSessionSaved = 0;

async function executeSwap(txEntry) {
    try {
        await ensureConnected();
        const { tx, wallet } = txEntry;

        const preEther = spawnEtherNoise(4);
        window.etherPreFlux = preEther;

        const prepared = await client.autofill(tx);
        const ledgerInfo = await client.request({ command: "ledger_current" });
        const currentLedger = ledgerInfo.result.ledger_current_index;
        prepared.LastLedgerSequence = currentLedger + 300;
        const signed = wallet.sign(prepared);
        log('Submitting swap transaction...');
        const startTime = Date.now();
        const result = await Promise.race([
            client.submitAndWait(signed.tx_blob),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction submission timed out')), 15000))
        ]);
        const endTime = Date.now();
        log(`Transaction submission took ${(endTime - startTime) / 1000} seconds`);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            const deliveredAmount = result.result.meta.DeliveredAmount || result.result.meta.delivered_amount;
            if (deliveredAmount) {
                const deliveredValue = typeof deliveredAmount === 'string' ? xrpl.dropsToXrp(deliveredAmount) : deliveredAmount.value;
                const deliveredAsset = txEntry.expectedOutputAsset || "Unknown";
                log(`Swap succeeded: Received ${formatBalance(deliveredValue)} ${deliveredAsset}`);
                log(`Transaction Hash: ${result.result.hash}`);
                if (document.getElementById('swap-result')) {
                    document.getElementById('swap-result').innerHTML = `<p>Swap Result: Received ${formatBalance(deliveredValue)} ${deliveredAsset}</p>`;
                }

      
                let spentInXrp;
                const spentAmount = typeof tx.SendMax === 'string' ? parseFloat(xrpl.dropsToXrp(tx.SendMax)) : parseFloat(tx.SendMax.value);
                const { direction, price } = ammState.lastPoolPrice;
                if (direction === "XRP-to-Token") {
                    spentInXrp = spentAmount;
                } else {
                    spentInXrp = spentAmount * price;
                }
                currentFeeSaved = spentInXrp * 0.01;
                currentSlippageSaved = spentInXrp * 0.02;
                totalSessionSaved += currentFeeSaved + currentSlippageSaved;

                if (document.getElementById('swap-result')) {
                    document.getElementById('swap-result').innerHTML += `<p>Saved this swap: Fees ${currentFeeSaved.toFixed(6)} XRP, Slippage ${currentSlippageSaved.toFixed(6)} XRP / Total saved this session: ${totalSessionSaved.toFixed(6)} XRP</p>`;
                }
            } else {
                log('Swap succeeded, but delivered amount not available.');
                if (document.getElementById('swap-result')) document.getElementById('swap-result').innerHTML = '<p>Swap Result: Delivered amount not available</p>';
            }
            await checkBalance();

            const postEther = spawnEtherNoise(5);
            window.etherPostFlux = postEther;

            await resecureCache();
        } else {
            log(`Swap failed: ${result.result.meta.TransactionResult}`);
            throw new Error(`Swap failed with result: ${result.result.meta.TransactionResult}`);
        }
    } catch (error) {
        log(`Swap error: ${error.message}`);
        throw error;
    }
}
function populateOffer(gets, pays, buyAssetName, sellAssetName) {
    const buyAmountInput = document.getElementById('dex-buy-amount');
    const sellAmountInput = document.getElementById('dex-sell-amount');
    const buyAsset = document.getElementById('dex-buy-asset').value;

    const offerRow = event.target.closest('tr');
    if (offerRow.classList.contains('sell-offer')) {
        dexSwapDirection = 'buy';
        buyAmountInput.value = parseFloat(pays).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
        sellAmountInput.value = parseFloat(gets).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
        log(`Populated offer: Buy ${pays} ${buyAssetName} for ${gets} ${sellAssetName}`);
    } else if (offerRow.classList.contains('buy-offer')) {
        dexSwapDirection = 'sell';
        sellAmountInput.value = parseFloat(gets).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
        buyAmountInput.value = parseFloat(pays).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
        log(`Populated offer: Buy ${pays} ${buyAssetName} for ${gets} ${sellAssetName}`);
    }

    updateDexSwapStatement();
}

async function checkPoolPrice() {
    const address = globalAddress;
    const errorElement = document.getElementById('address-error-amm');
    const swapResult = document.getElementById('swap-result');
    const poolInfo = document.getElementById('pool-info');
    const inputAssetDisplay = document.getElementById('swap-input-asset-display');
    const outputAssetDisplay = document.getElementById('swap-output-asset-display');

    if (!inputAssetDisplay || !outputAssetDisplay || !swapResult || !errorElement || !poolInfo) {
        log('Error: Swap elements not found in DOM.');
        errorElement.textContent = 'Swap elements missing.';
        return;
    }

    const inputAsset = inputAssetDisplay.getAttribute('data-value');
    const inputHex = inputAssetDisplay.getAttribute('data-hex');
    const inputIssuer = inputAssetDisplay.getAttribute('data-issuer');
    const outputAsset = outputAssetDisplay.getAttribute('data-value');
    const outputHex = outputAssetDisplay.getAttribute('data-hex');
    const outputIssuer = outputAssetDisplay.getAttribute('data-issuer');

    if (!inputAsset || !outputAsset || !inputHex || !outputHex) {
        log('Error: Input or output asset not selected.');
        errorElement.textContent = 'Select both input and output assets.';
        return;
    }

    if (!contentCache || !displayTimer) {
        log('Error: No wallet loaded.');
        errorElement.textContent = 'No wallet loaded.';
        return;
    }

    if (!xrpl.isValidAddress(address)) {
        log('Error: Invalid address.');
        errorElement.textContent = 'Invalid address.';
        return;
    }

    try {
        await ensureConnected();
        const inputAssetData = inputAsset === "XRP" ? { currency: "XRP" } : { currency: inputHex, issuer: inputIssuer };
        const outputAssetData = outputAsset === "XRP" ? { currency: "XRP" } : { currency: outputHex, issuer: outputIssuer };

        log(`Checking pool price for ${inputAsset}/${outputAsset}`);
        const ammInfo = await throttleRequest(() =>
            client.request({
                command: "amm_info",
                asset: inputAssetData,
                asset2: outputAssetData,
                ledger_index: "current"
            })
        );

        if (!ammInfo.result.amm) {
            log(`No AMM pool found for ${inputAsset}/${outputAsset}.`);
            errorElement.textContent = 'No AMM pool found for this pair.';
            swapResult.innerHTML = '<p style="color: #fff;">Swap Result: No pool found</p>';
            poolInfo.innerHTML = `
                <p>Pool Reserves: -</p>
                <p>Pool Price: -</p>
                <p>Pool Fee: -</p>
            `;
            ammState.lastPoolPrice = null;
            ammState.lastPriceCheckTimestamp = null;
            return;
        }

        const amount1 = ammInfo.result.amm.amount;
        const amount2 = ammInfo.result.amm.amount2;
        const tradingFeeBasisPoints = ammInfo.result.amm.trading_fee || 0;
        const tradingFeePercent = (tradingFeeBasisPoints / 1000).toFixed(3);
        let poolXrp, poolToken, direction, assetName, assetHex, assetIssuer;

        if (inputAsset === "XRP") {
            poolXrp = parseFloat(xrpl.dropsToXrp(amount1));
            poolToken = parseFloat(amount2.value);
            direction = "XRP-to-Token";
            assetName = outputAsset;
            assetHex = outputHex;
            assetIssuer = outputIssuer;
        } else {
            poolXrp = parseFloat(xrpl.dropsToXrp(amount2));
            poolToken = parseFloat(amount1.value);
            direction = "Token-to-XRP";
            assetName = inputAsset;
            assetHex = inputHex;
            assetIssuer = inputIssuer;
        }

        ammState.lastPoolPrice = { poolXrp, poolToken, direction, assetName, assetHex, assetIssuer, tradingFee: tradingFeePercent };
        ammState.lastPriceCheckTimestamp = Date.now();

        const price = direction === "XRP-to-Token" ? poolToken / poolXrp : poolXrp / poolToken;
        const reversePrice = 1 / price;

        
        poolInfo.innerHTML = `
            <p>Pool Reserves: ${formatBalance(poolXrp)} XRP, ${formatBalance(poolToken)} ${assetName}</p>
            <p>Pool Price: 1 ${inputAsset} = ${price.toFixed(6)} ${outputAsset}, 1 ${outputAsset} = ${reversePrice.toFixed(6)} ${inputAsset}</p>
            <p>Pool Fee: ${tradingFeePercent}%</p>
        `;

        
        swapResult.innerHTML = `
            <p style="color: #fff;">Pool Price: 1 ${inputAsset} = ${price.toFixed(6)} ${outputAsset}</p>
            <p style="color: #fff;">Pool Reserves: ${formatBalance(poolXrp)} XRP, ${formatBalance(poolToken)} ${assetName}</p>
            <p style="color: #fff;">Pool Fee: ${tradingFeePercent}%</p>
        `;

        errorElement.textContent = '';

        const slider = document.getElementById('swap-balance-slider');
        if (slider) {
            slider.disabled = false;
            updateSwapAmountsFromSlider();
        }

        log(`Pool price checked: ${inputAsset}/${outputAsset}, Price=${price.toFixed(6)}, Fee=${tradingFeePercent}%`);
    } catch (error) {
        log(`checkPoolPrice error: ${error.message}`);
        errorElement.textContent = error.message.includes("ammNotFound") ? "No AMM pool found." : `Error: ${error.message}`;
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Error</p>';
        poolInfo.innerHTML = `
            <p>Pool Reserves: -</p>
            <p>Pool Price: -</p>
            <p>Pool Fee: -</p>
        `;
        ammState.lastPoolPrice = null;
        ammState.lastPriceCheckTimestamp = null;
    }
}


function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function updateSwapAmountsFromSlider() {
    const slider = document.getElementById('swap-balance-slider');
    const percentage = parseFloat(slider.value);
    const percentageDisplay = document.getElementById('slider-percentage');
    const amountInput = document.getElementById('swap-amount');
    const outputAmountInput = document.getElementById('swap-output-amount');
    const errorElement = document.getElementById('address-error-amm');
    const swapResult = document.getElementById('swap-result');

    if (!slider || !percentageDisplay || !amountInput || !outputAmountInput || !swapResult) {
        log('Error: Swap slider or input elements not found.');
        return;
    }

    
    const displayPercentage = Number(percentage.toFixed(6));
    percentageDisplay.textContent = `${displayPercentage}%`;

    const now = Date.now();
    const timeDiff = ammState.lastPriceCheckTimestamp ? now - ammState.lastPriceCheckTimestamp : Infinity;
    if (!ammState.lastPriceCheckTimestamp || timeDiff > 180000) {
        log('Error: Pool price is outdated. Please check pool price again.');
        errorElement.textContent = 'Pool price is outdated. Please check pool price again.';
        slider.disabled = true;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Pool price outdated</p>';
        return;
    }

    if (!ammState.lastPoolPrice) {
        log('Error: No pool price available. Please check pool price.');
        errorElement.textContent = 'No pool price available. Please check pool price.';
        slider.disabled = true;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: No pool price</p>';
        return;
    }

    const inputAssetDisplay = document.getElementById('swap-input-asset-display');
    const outputAssetDisplay = document.getElementById('swap-output-asset-display');
    const inputAsset = inputAssetDisplay?.getAttribute('data-value');
    const outputAsset = outputAssetDisplay?.getAttribute('data-value');
    const inputHex = inputAssetDisplay?.getAttribute('data-hex');
    const inputIssuer = inputAssetDisplay?.getAttribute('data-issuer');
    const outputHex = outputAssetDisplay?.getAttribute('data-hex');
    const outputIssuer = outputAssetDisplay?.getAttribute('data-issuer');

    if (!inputAsset || !outputAsset || !inputHex || !outputHex) {
        log('Error: Input or output asset not selected or missing metadata.');
        errorElement.textContent = 'Input or output asset not selected.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Asset selection missing</p>';
        return;
    }

    let inputBalance;
    const address = globalAddress;
    if (!address || !xrpl.isValidAddress(address)) {
        log('Error: Invalid address for balance check.');
        errorElement.textContent = 'Invalid address for balance check.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Invalid address</p>';
        return;
    }

    await ensureConnected();
    if (inputAsset === "XRP") {
        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        inputBalance = Math.max(0, Number((availableBalanceXrp - 1).toFixed(6)));
        document.getElementById('input-balance').textContent = `Balance: ${formatBalance(inputBalance)} XRP`;
    } else {
        const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
        const trustline = accountLines.result.lines.find(line => line.currency === inputHex && line.account === inputIssuer);
        inputBalance = trustline ? Number(Number(trustline.balance).toFixed(6)) : 0;
        document.getElementById('input-balance').textContent = `Balance: ${formatBalance(inputBalance)} ${inputAsset}`;
    }

    if (isNaN(inputBalance) || inputBalance <= 0) {
        log('Error: Invalid input balance.');
        errorElement.textContent = `Invalid input balance: ${inputBalance}`;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Invalid balance</p>';
        return;
    }

    
    let inputAmount = (percentage / 100) * inputBalance;
    const integerDigits = Math.floor(inputAmount).toString().replace(/^0+/, '') || '0';
    let maxDecimalPlaces = 6;
    if (integerDigits.length >= 9) {
        maxDecimalPlaces = Math.max(0, 15 - integerDigits.length);
    }
    inputAmount = Number(inputAmount.toFixed(maxDecimalPlaces));
    const roundedInputAmount = inputAmount;

    if (roundedInputAmount > inputBalance) {
        log('Error: Calculated amount exceeds available balance.');
        errorElement.textContent = `Amount exceeds available balance. Available: ${formatBalance(inputBalance)} ${inputAsset}`;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Amount exceeds balance</p>';
        return;
    }
    amountInput.value = roundedInputAmount;

    const { poolXrp, poolToken, direction, assetName, assetHex, assetIssuer, tradingFee } = ammState.lastPoolPrice;
    let expectedOutput;
    if (direction === "XRP-to-Token" && inputAsset === "XRP" && outputAsset === assetName && outputHex === assetHex && outputIssuer === assetIssuer) {
        expectedOutput = roundedInputAmount * (poolToken / poolXrp);
    } else if (direction === "Token-to-XRP" && inputAsset === assetName && inputHex === assetHex && inputIssuer === assetIssuer && outputAsset === "XRP") {
        expectedOutput = roundedInputAmount * (poolXrp / poolToken);
    } else {
        log('Error: Asset pair does not match pool direction or metadata.');
        errorElement.textContent = 'Asset pair does not match pool direction.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Invalid asset pair</p>';
        return;
    }

    
    const outputIntegerDigits = Math.floor(expectedOutput).toString().replace(/^0+/, '') || '0';
    maxDecimalPlaces = outputIntegerDigits.length >= 9 ? Math.max(0, 15 - outputIntegerDigits.length) : 6;
    const roundedOutputAmount = Number(expectedOutput.toFixed(maxDecimalPlaces));
    outputAmountInput.value = roundedOutputAmount;

    const simulationText = `<p style="color: #00cc00;">Simulation: Swap ${roundedInputAmount} ${inputAsset} for ${roundedOutputAmount} ${outputAsset} (Fee: ${tradingFee}%)</p>`;
    swapResult.innerHTML = `<p style="color: #fff;">Pool Price: 1 ${inputAsset} = ${Number(ammState.lastPoolPrice.price).toFixed(6)} ${outputAsset}</p>
                            <p style="color: #fff;">Pool Reserves: ${Number(poolXrp).toFixed(6)} XRP, ${Number(poolToken).toFixed(6)} ${assetName}</p>
                            <p style="color: #fff;">Pool Fee: ${tradingFee}%</p>
                            ${simulationText}`;

    slider.disabled = false;
    errorElement.textContent = '';
    
}

async function updateSliderFromAmount() {
    const slider = document.getElementById('swap-balance-slider');
    const amountInput = document.getElementById('swap-amount');
    const percentageDisplay = document.getElementById('slider-percentage');
    const outputAmountInput = document.getElementById('swap-output-amount');
    const errorElement = document.getElementById('address-error-amm');

    let amount = amountInput.value.trim();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        log('Error: Invalid amount entered.');
        errorElement.textContent = 'Invalid amount entered.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    
    const integerDigits = Math.floor(amount).toString().replace(/^0+/, '') || '0';
    let maxDecimalPlaces = integerDigits.length >= 9 ? Math.max(0, 15 - integerDigits.length) : 6;
    amount = Number(Number(amount).toFixed(maxDecimalPlaces));
    amountInput.value = amount;
    const amountFloat = amount;

    const now = Date.now();
    const timeDiff = ammState.lastPriceCheckTimestamp ? now - ammState.lastPriceCheckTimestamp : Infinity;
    if (!ammState.lastPriceCheckTimestamp || timeDiff > 180000) {
        log('Error: Pool price is outdated. Please check pool price again.');
        errorElement.textContent = 'Pool price is outdated. Please check pool price again.';
        slider.disabled = true;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    if (!ammState.lastPoolPrice) {
        log('Error: No pool price available. Please check pool price.');
        errorElement.textContent = 'No pool price available. Please check pool price.';
        slider.disabled = true;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    const inputAssetDisplay = document.getElementById('swap-input-asset-display');
    const outputAssetDisplay = document.getElementById('swap-output-asset-display');
    const inputAsset = inputAssetDisplay?.getAttribute('data-value');
    const outputAsset = outputAssetDisplay?.getAttribute('data-value');
    const inputHex = inputAssetDisplay?.getAttribute('data-hex');
    const inputIssuer = inputAssetDisplay?.getAttribute('data-issuer');
    const outputHex = outputAssetDisplay?.getAttribute('data-hex');
    const outputIssuer = outputAssetDisplay?.getAttribute('data-issuer');

    if (!inputAsset || !outputAsset || !inputHex || !outputHex) {
        log('Error: Input or output asset not selected or missing metadata.');
        errorElement.textContent = 'Input or output asset not selected.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    let inputBalance;
    const address = globalAddress;
    if (!address || !xrpl.isValidAddress(address)) {
        log('Error: Invalid address for balance check.');
        errorElement.textContent = 'Invalid address for balance check.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    await ensureConnected();
    if (inputAsset === "XRP") {
        const { availableBalanceXrp } = await calculateAvailableBalance(address);
        inputBalance = Math.max(0, Number((availableBalanceXrp - 1).toFixed(6)));
        document.getElementById('input-balance').textContent = `Balance: ${formatBalance(inputBalance)} XRP`;
    } else {
        const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
        const trustline = accountLines.result.lines.find(line => line.currency === inputHex && line.account === inputIssuer);
        inputBalance = trustline ? Number(Number(trustline.balance).toFixed(6)) : 0;
        document.getElementById('input-balance').textContent = `Balance: ${formatBalance(inputBalance)} ${inputAsset}`;
    }

    if (isNaN(inputBalance) || inputBalance <= 0) {
        log('Error: Invalid input balance.');
        errorElement.textContent = `Invalid input balance: ${inputBalance}`;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    if (amountFloat > inputBalance) {
        log('Error: Amount exceeds available balance.');
        errorElement.textContent = `Amount exceeds available balance. Available: ${formatBalance(inputBalance)} ${inputAsset}`;
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    
    let percentage = (amountFloat / inputBalance) * 100;
    percentage = Number(percentage.toFixed(6));
    slider.value = percentage;
    slider.disabled = false;
    percentageDisplay.textContent = `${percentage}%`;

    const { poolXrp, poolToken, direction, assetName, assetHex, assetIssuer } = ammState.lastPoolPrice;
    let expectedOutput;
    if (direction === "XRP-to-Token" && inputAsset === "XRP" && outputAsset === assetName && outputHex === assetHex && outputIssuer === assetIssuer) {
        expectedOutput = amountFloat * (poolToken / poolXrp);
    } else if (direction === "Token-to-XRP" && inputAsset === assetName && inputHex === assetHex && inputIssuer === assetIssuer && outputAsset === "XRP") {
        expectedOutput = amountFloat * (poolXrp / poolToken);
    } else {
        log('Error: Asset pair does not match pool direction or metadata.');
        errorElement.textContent = 'Asset pair does not match pool direction.';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        amountInput.value = '';
        outputAmountInput.value = '';
        return;
    }

    
    const outputIntegerDigits = Math.floor(expectedOutput).toString().replace(/^0+/, '') || '0';
    maxDecimalPlaces = outputIntegerDigits.length >= 9 ? Math.max(0, 15 - outputIntegerDigits.length) : 6;
    const roundedOutputAmount = Number(expectedOutput.toFixed(maxDecimalPlaces));
    outputAmountInput.value = roundedOutputAmount;

    document.getElementById('swap-result').innerHTML = '<p>Swap Result: -</p>';
    errorElement.textContent = '';
    log(`Swap amount updated: ${amountFloat} ${inputAsset} -> ${roundedOutputAmount} ${outputAsset}, percentage=${percentage}%`);
}

async function connectWebSocket(serverOverride = null) {
    const serverSelect = document.getElementById('wss-server');
    const status = document.getElementById('connection-status');
    const server = serverOverride || serverSelect?.value;
    if (!server || !status || !serverSelect) return;

    if (client && client.isConnected()) {
        log('Already connected to XRPL server.');
        return;
    }

    if (isConnecting) {
        log('Connection attempt already in progress. Waiting...');
        return;
    }

    if (client) {
        await client.disconnect();
        client = null;
    }

    isConnecting = true;
    status.textContent = 'Connecting...';
    serverSelect.value = server;

    try {
        client = new xrpl.Client(server);
        await client.connect();
        status.textContent = 'Connected';
        log(`Connected to WSS Server.`);
        updateBalances();
    } catch (error) {
        log(`Connection failed to ${server}: ${error.message}`);
        status.textContent = 'Disconnected';
        client = null;
        throw error;
    } finally {
        isConnecting = false;
    }
}

async function disconnectWebSocket() {
    if (client && client.isConnected()) {
        await client.disconnect();
        client = null;
    }
    if (document.getElementById('connection-status')) document.getElementById('connection-status').textContent = 'Disconnected';
    const accountAddress = document.getElementById('account-address');
    const assetGrid = document.getElementById('asset-grid');
    const currentLimitDisplay = document.getElementById('current-trust-limit');
    const currentDomainDisplay = document.getElementById('current-domain');
    const currentRegularKeyDisplay = document.getElementById('current-regular-key');
    const currentSignerListDisplay = document.getElementById('current-signer-list');
    const ledgerIndexDisplay = document.getElementById('ledger-index');
    const ledgerCloseTimeDisplay = document.getElementById('ledger-close-time');
    const validatorStatsDisplay = document.getElementById('validator-stats');
    const amendmentVotingDisplay = document.getElementById('amendment-voting');
    const currentOffersDisplay = document.getElementById('current-offers');

    if (accountAddress) accountAddress.textContent = 'Address: -';
    if (assetGrid) assetGrid.innerHTML = '';
    if (currentLimitDisplay) currentLimitDisplay.textContent = 'Current Trustline Limit: None';
    if (currentDomainDisplay) currentDomainDisplay.textContent = 'Current Domain: None';
    if (currentRegularKeyDisplay) currentRegularKeyDisplay.textContent = 'Current Regular Key: None';
    if (currentSignerListDisplay) currentSignerListDisplay.textContent = 'Current Signer List: None';
    if (ledgerIndexDisplay) ledgerIndexDisplay.textContent = '-';
    if (ledgerCloseTimeDisplay) ledgerCloseTimeDisplay.textContent = '-';
    if (validatorStatsDisplay) validatorStatsDisplay.innerHTML = '<p>No validator data available.</p>';
    if (amendmentVotingDisplay) amendmentVotingDisplay.innerHTML = '<p>No amendment data available.</p>';
    if (currentOffersDisplay) currentOffersDisplay.innerHTML = '<p>No offers available.</p>';

    log('Disconnected from XRPL server');
    updateBalances();
}

async function ensureConnected() {
    if (client && client.isConnected()) return;

    if (isConnecting) {
        log('Waiting for existing connection attempt to complete...');
        while (isConnecting) await new Promise(resolve => setTimeout(resolve, 100));
        if (client && client.isConnected()) return;
    }

    log('Not connected. Connecting...');
    await connectWebSocket();
    if (!client || !client.isConnected()) throw new Error('Failed to connect to XRPL server');
}

async function updateNukeAssetDetails(forceFetch = false) {
    const nukeAssetDisplay = document.getElementById('nuke-asset-display');
    const balanceDisplay = document.getElementById('nuke-asset-balance');
    const address = globalAddress;

    if (!nukeAssetDisplay || !balanceDisplay) {
        log('Error: Nuke asset display or balance element not found in DOM.');
        return;
    }

    const selectedAssetName = nukeAssetDisplay.getAttribute('data-value') || nukeAssetDisplay.textContent;
    const asset = getAssetByName(selectedAssetName);

    if (!asset || selectedAssetName === "XRP") {
        balanceDisplay.textContent = 'Current Balance: -';
        return;
    }

    if (!forceFetch) {
        balanceDisplay.textContent = 'Current Balance: -';
        return;
    }

    if (xrpl.isValidAddress(address) && client && client.isConnected()) {
        try {
            const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
            const trustline = accountLines.result.lines.find(line => line.currency === asset.hex && line.account === asset.issuer);
            if (trustline) {
                balanceDisplay.textContent = `Current Balance: ${trustline.balance} ${asset.name}`;
            } else {
                balanceDisplay.textContent = `Current Balance: 0 ${asset.name} (No Trustline)`;
            }
        } catch (error) {
            log(`Error fetching balance for ${asset.name}: ${error.message}`);
            balanceDisplay.textContent = 'Current Balance: Unable to fetch';
        }
    } else {
        balanceDisplay.textContent = 'Current Balance: Connect and load a wallet';
    }
}
let availableBalanceXrp = 0;
let globalLPTokens = [];


async function populateAssetDropdowns() {
    if (!prefabAssets || !Array.isArray(prefabAssets)) {
        console.warn('populateAssetDropdowns: prefabAssets is not defined or not an array');
        return;
    }
    if (!dynamicAssets || !Array.isArray(dynamicAssets)) {
        dynamicAssets = [];
    }
    if (!globalLPTokens || !Array.isArray(globalLPTokens)) {
        globalLPTokens = [];
    }
const combinedAssets = [...prefabAssets, ...dynamicAssets];
combinedAssets.sort((a, b) => a.name.localeCompare(b.name));

const lpAssets = globalLPTokens.map(token => ({
    name: token.lpName,
    hex: token.currency,
    issuer: token.issuer,
    isLP: true
}));

const dropdowns = [
    {
        id: 'send-asset-dropdown',
        gridId: 'send-asset-grid',
        displayId: 'send-asset-display',
        defaultValue: 'XRP',
        onchange: selectSendAsset,
        assets: [...combinedAssets, ...lpAssets]
    },
    {
        id: 'trust-asset-dropdown',
        gridId: 'trust-asset-grid',
        displayId: 'trust-asset-display',
        defaultValue: combinedAssets.length > 0 ? combinedAssets[0].name : 'XRP',
        onchange: () => selectTrustAsset(true),
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'nuke-asset-dropdown',
        gridId: 'nuke-asset-grid',
        displayId: 'nuke-asset-display',
        defaultValue: combinedAssets.length > 0 ? combinedAssets[0].name : 'XRP',
        onchange: () => updateNukeAssetDetails(true),
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'swap-input-asset-dropdown',
        gridId: 'swap-input-asset-grid',
        displayId: 'swap-input-asset-display',
        defaultValue: 'XRP',
        onchange: updateSwapDirection,
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'swap-output-asset-dropdown',
        gridId: 'swap-output-asset-grid',
        displayId: 'swap-output-asset-display',
        defaultValue: '$Xoge',
        onchange: updateSwapDirection,
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'lp-asset1-dropdown',
        gridId: 'lp-asset1-grid',
        displayId: 'lp-asset1-display',
        defaultValue: combinedAssets.length > 0 ? combinedAssets[0].name : 'Select Asset',
        onchange: selectLPAsset,
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'lp-asset2-dropdown',
        gridId: 'lp-asset2-grid',
        displayId: 'lp-asset2-display',
        defaultValue: 'XRP',
        onchange: selectLPAsset,
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'airdrop-trustline-asset-dropdown',
        gridId: 'airdrop-trustline-asset-grid',
        displayId: 'airdrop-trustline-asset-display',
        defaultValue: combinedAssets.length > 0 ? combinedAssets[0].name : 'Select Token',
        onchange: selectAirdropTrustlineAsset,
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'airdrop-trustline-asset-dropdown-2',
        gridId: 'airdrop-trustline-asset-grid-2',
        displayId: 'airdrop-trustline-asset-display-2',
        defaultValue: 'XRP',
        onchange: selectAirdropTrustlineAsset,
        assets: [...combinedAssets.filter(asset => !asset.isLP), { name: 'XRP', hex: 'XRP', issuer: '', isLP: false }]
    },
    {
        id: 'airdrop-asset-dropdown',
        gridId: 'airdrop-asset-grid',
        displayId: 'airdrop-asset-display',
        defaultValue: 'XRP',
        onchange: selectAirdropAsset,
        assets: [...combinedAssets.filter(asset => !asset.isLP), { name: 'XRP', hex: 'XRP', issuer: '', isLP: false }]
    },
    {
        id: 'small-airdrop-trustline-asset-dropdown',
        gridId: 'small-airdrop-trustline-asset-grid',
        displayId: 'small-airdrop-trustline-asset-display',
        defaultValue: combinedAssets.length > 0 ? combinedAssets[0].name : 'Select Token',
        onchange: selectSmallAirdropTrustlineAsset,
        assets: combinedAssets.filter(asset => !asset.isLP)
    },
    {
        id: 'small-airdrop-trustline-asset-dropdown-2',
        gridId: 'small-airdrop-trustline-asset-grid-2',
        displayId: 'small-airdrop-trustline-asset-display-2',
        defaultValue: 'XRP',
        onchange: selectSmallAirdropTrustlineAsset,
        assets: [...combinedAssets.filter(asset => !asset.isLP), { name: 'XRP', hex: 'XRP', issuer: '', isLP: false }]
    },
    {
        id: 'small-airdrop-asset-dropdown',
        gridId: 'small-airdrop-asset-grid',
        displayId: 'small-airdrop-asset-display',
        defaultValue: 'XRP',
        onchange: selectSmallAirdropAsset,
        assets: [...combinedAssets.filter(asset => !asset.isLP), { name: 'XRP', hex: 'XRP', issuer: '', isLP: false }]
    }
];

for (const [index, { id, gridId, displayId, defaultValue, onchange, assets }] of dropdowns.entries()) {
    
    const dropdown = document.getElementById(id);
    const grid = document.getElementById(gridId);
    const display = document.getElementById(displayId);
    if (!dropdown || !grid || !display) {
        console.warn(`Dropdown ${id} missing elements: dropdown=${!!dropdown}, grid=${!!grid}, display=${!!display}`);
        continue;
    }

    const currentValue = display.getAttribute('data-value') || defaultValue;

    const sortedAssets = assets.sort((a, b) => a.name.localeCompare(b.name));
    const numColumns = 5;
    const assetsPerColumn = Math.ceil(sortedAssets.length / numColumns);
    const columns = [];
    for (let i = 0; i < sortedAssets.length; i += assetsPerColumn) {
        columns.push(sortedAssets.slice(i, i + assetsPerColumn));
    }

    if (!['trust-asset-dropdown', 'airdrop-trustline-asset-dropdown', 'airdrop-trustline-asset-dropdown-2', 'small-airdrop-trustline-asset-dropdown', 'small-airdrop-trustline-asset-dropdown-2'].includes(id)) {
        if (!columns[0].some(asset => asset.name === 'XRP')) {
            columns[0] = [{ name: 'XRP', hex: 'XRP', issuer: '', isLP: false }, ...columns[0]];
        }
    }

    grid.innerHTML = '';
    const gridContainer = document.createElement('div');
    gridContainer.className = 'asset-grid-container';
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
            img.onerror = function() {
                this.src = './icons/XRP.png';
            };
            li.appendChild(img);
            const textNode = document.createTextNode(` ${asset.name}`);
            li.appendChild(textNode);
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
                selectedImg.onerror = function() {
                    this.src = './icons/XRP.png';
                };
                display.appendChild(selectedImg);
                display.appendChild(document.createTextNode(` ${asset.name}`));
                display.setAttribute('data-value', asset.name);
                display.setAttribute('data-hex', asset.hex || 'XRP');
                display.setAttribute('data-issuer', asset.issuer || '');
                display.setAttribute('data-is-lp', asset.isLP || false);
                grid.parentElement.style.display = 'none';
                onchange();
            };
            columnUl.appendChild(li);
        });
        gridContainer.appendChild(columnUl);
    });
    grid.appendChild(gridContainer);

    const selectedAsset = sortedAssets.find(a => a.name === currentValue) || 
                         (currentValue === 'XRP' ? { name: 'XRP', hex: 'XRP', issuer: '', isLP: false } : 
                         (currentValue === '$Xoge' ? { name: '$Xoge', hex: '586F676500000000000000000000000000000000', issuer: 'rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1', isLP: false } : 
                         (currentValue === 'Select Token' || currentValue === 'Select Asset' || currentValue === 'Select Token (Optional)' ? { name: currentValue, hex: '', issuer: '', isLP: false } : null)));
    const selectedTicker = selectedAsset && selectedAsset.name.startsWith('$') ? selectedAsset.name : selectedAsset ? `$${selectedAsset.name}` : '$Xoge';
    const selectedIconSrc = selectedAsset && selectedAsset.name === 'XRP' ? './icons/XRP.png' : selectedAsset ? `./icons/${selectedTicker}-${selectedAsset.issuer}.png` : './icons/XRP.png';
    display.innerHTML = '';
    if (selectedAsset) {
        const img = document.createElement('img');
        img.src = selectedIconSrc;
        img.alt = selectedAsset.name;
        img.className = 'asset-icon';
        img.onerror = function() {
            this.src = './icons/XRP.png';
        };
        display.appendChild(img);
        display.appendChild(document.createTextNode(` ${selectedAsset.name}`));
    } else {
        display.textContent = defaultValue;
    }
    display.setAttribute('data-value', selectedAsset ? selectedAsset.name : defaultValue);
    display.setAttribute('data-hex', selectedAsset ? selectedAsset.hex || 'XRP' : '');
    display.setAttribute('data-issuer', selectedAsset ? selectedAsset.issuer || '' : '');
    display.setAttribute('data-is-lp', selectedAsset ? selectedAsset.isLP || false : false);
}

if (typeof selectSendAsset === 'function') selectSendAsset();
if (typeof selectTrustAsset === 'function') selectTrustAsset(false);
if (typeof updateNukeAssetDetails === 'function') updateNukeAssetDetails(false);
if (typeof updateSwapDirection === 'function') updateSwapDirection();
if (typeof selectLPAsset === 'function') selectLPAsset();
if (typeof selectAirdropTrustlineAsset === 'function') selectAirdropTrustlineAsset();
if (typeof selectAirdropAsset === 'function') selectAirdropAsset();
if (typeof selectSmallAirdropTrustlineAsset === 'function') selectSmallAirdropTrustlineAsset();
if (typeof selectSmallAirdropAsset === 'function') selectSmallAirdropAsset();
}

function toggleSubsection(subsectionId) {
    const subsection = document.getElementById(subsectionId);
    if (!subsection) return;
    const isMinimized = subsection.classList.contains('minimized');
    const toggleBtn = subsection.querySelector('.toggle-btn');
    if (isMinimized) {
        subsection.classList.remove('minimized');
        subsection.querySelector('.lp-subsection-content').style.display = 'block';
        if (toggleBtn) toggleBtn.textContent = '▼';
    } else {
        subsection.classList.add('minimized');
        subsection.querySelector('.lp-subsection-content').style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = '▲';
    }
}

function selectAirdropTrustlineAsset() {
    const trustlineAssetDisplay = document.getElementById('airdrop-trustline-asset-display');
    if (!trustlineAssetDisplay) {
        log('Error: Trustline asset display not found.');
        return;
    }
    const selectedAssetName = trustlineAssetDisplay.getAttribute('data-value') || trustlineAssetDisplay.textContent;
    const asset = getAssetByName(selectedAssetName);
    const recipientsTextarea = document.getElementById('airdrop-recipients');
    if (recipientsTextarea) {
        recipientsTextarea.value = '';
        document.getElementById('download-trustline-csv-btn').disabled = true;
    }
    
}

function selectAirdropAsset() {
    const airdropAssetDisplay = document.getElementById('airdrop-asset-display');
    const airdropAmountInput = document.getElementById('airdrop-amount');
    if (!airdropAssetDisplay || !airdropAmountInput) {
        log('Error: Airdrop asset display or amount input not found.');
        return;
    }
    const selectedAssetName = airdropAssetDisplay.getAttribute('data-value') || airdropAssetDisplay.textContent;
    const asset = getAssetByName(selectedAssetName);
    airdropAmountInput.placeholder = asset
        ? `e.g., 10 or 100`
        : `e.g., 10 or 100 XRP`;
    updateAirdropAssetBalance();
}

function selectLPAsset() {
    const asset1Display = document.getElementById('lp-asset1-display');
    const asset2Display = document.getElementById('lp-asset2-display');
    const poolInfo = document.getElementById('lp-info');
    const errorElement = document.getElementById('address-error-lp');

    if (!asset1Display || !asset2Display || !poolInfo || !errorElement) {
        log('Error: LP asset display or pool info elements not found in DOM.', 'error');
        return;
    }

    const asset1 = asset1Display.getAttribute('data-value');
    const asset2 = asset2Display.getAttribute('data-value');

    if (!asset1 || !asset2) {
        log('Error: LP assets not yet initialized.', 'error');
        poolInfo.innerHTML = `
            <p>Pool Status: Select assets and click "Check Pool"</p>
            <p>Your LP Tokens: -</p>
            <p>Pool Assets: -</p>
            <p>Trading Fee: -</p>
        `;
        return;
    }

    
    if (asset1 === asset2 && asset1 !== 'Select Asset') {
        const availableAssets = ['XRP', ...prefabAssets.map(a => a.name), ...dynamicAssets.map(a => a.name)];
        const otherAsset = availableAssets.find(a => a !== asset1 && a !== 'Select Asset') || 'XRP';
        const otherAssetData = prefabAssets.find(a => a.name === otherAsset) || dynamicAssets.find(a => a.name === otherAsset) || 
                             { name: 'XRP', hex: 'XRP', issuer: '' };
        asset2Display.textContent = otherAsset;
        asset2Display.setAttribute('data-value', otherAsset);
        asset2Display.setAttribute('data-hex', otherAssetData.hex || 'XRP');
        asset2Display.setAttribute('data-issuer', otherAssetData.issuer || '');
        asset2Display.setAttribute('data-is-lp', otherAssetData.isLP || false);
        log(`Adjusted LP Asset 2 to ${otherAsset} to avoid duplicate selection.`, 'debug');
    }

    
    const prevAssets = window.lastLPAssets || '';
    const currentAssets = `${asset1 || 'Select Asset'} / ${asset2 || 'XRP'}`;
    if (prevAssets !== currentAssets) {
        
        window.lastLPAssets = currentAssets;
    }

    
    poolInfo.innerHTML = `
        <p>Pool Status: Select assets and click "Check Pool"</p>
        <p>Your LP Tokens: -</p>
        <p>Pool Assets: ${asset1 || 'Select Asset'} / ${asset2 || 'XRP'}</p>
        <p>Trading Fee: -</p>
    `;
    errorElement.textContent = '';
}

function toggleDropdown(dropdownId) {
    const panel = document.getElementById(`${dropdownId.replace('-dropdown', '-panel')}`);
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}


function getAssetByName(assetName) {
    if (assetName === "XRP") {
        return { name: "XRP", currency: "XRP" };
    }
    const lpToken = globalLPTokens.find(token => token.lpName === assetName);
    if (lpToken) {
        return { name: assetName, hex: lpToken.currency, issuer: lpToken.issuer };
    }
    const asset = prefabAssets.find(a => a.name === assetName) || dynamicAssets.find(a => a.name === assetName);
    if (!asset) {
        return null;
    }
    return asset;
}

async function selectTrustAsset(forceFetch = false) {
    const trustAssetDisplay = document.getElementById('trust-asset-display');
    const trustIssuerInput = document.getElementById('trust-issuer');
    const trustCurrencyInput = document.getElementById('trust-currency');
    const trustLimitInput = document.getElementById('trust-limit');
    const currentLimitDisplay = document.getElementById('current-trust-limit');
    const address = globalAddress;

    if (!trustAssetDisplay || !trustIssuerInput || !trustCurrencyInput || !trustLimitInput || !currentLimitDisplay) {
        log('Error: Trustline management elements not found in DOM.');
        return;
    }

    const selectedAssetName = trustAssetDisplay.getAttribute('data-value') || trustAssetDisplay.textContent;
    const asset = getAssetByName(selectedAssetName);

    if (asset) {
        trustIssuerInput.value = asset.issuer || '';
        trustCurrencyInput.value = asset.hex || '';

        if (!forceFetch) {
            currentLimitDisplay.textContent = 'Current Trustline Limit: -';
        } else if (xrpl.isValidAddress(address) && client && client.isConnected()) {
            try {
                const accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
                const existingTrustline = accountLines.result.lines.find(line => line.currency === asset.hex && line.account === asset.issuer);
                if (existingTrustline) {
                    currentLimitDisplay.textContent = `Current Trustline Limit: ${existingTrustline.limit} (Balance: ${formatBalance(existingTrustline.balance)})`;
                } else {
                    currentLimitDisplay.textContent = 'Current Trustline Limit: None';
                }
            } catch (error) {
                log(`Error checking existing trustline for ${asset.name}: ${error.message}`);
                currentLimitDisplay.textContent = 'Current Trustline Limit: Unable to fetch';
            }
        } else {
            log('Cannot check trustline: Invalid address or not connected to XRPL server.');
            currentLimitDisplay.textContent = 'Current Trustline Limit: Connect to XRPL server and enter a valid address';
        }

        const defaultLimit = "1000000000000000";
        trustLimitInput.value = defaultLimit;
    } else {
        trustIssuerInput.value = '';
        trustCurrencyInput.value = '';
        trustLimitInput.value = '';
        currentLimitDisplay.textContent = 'Current Trustline Limit: None';
    }
}

function checkIssuerData() {
    const assetDisplay = document.getElementById('trust-asset-display');
    const issuerInput = document.getElementById('trust-issuer');
    if (!assetDisplay || !issuerInput) {
        log('Error: Trustline asset display or issuer input not found.');
        return;
    }

    const ticker = assetDisplay.getAttribute('data-value') || assetDisplay.textContent;
    const issuer = issuerInput.value.trim();

    if (!ticker || ticker === 'Select Asset') {
        log('Error: No asset selected for issuer data check.');
        return;
    }

    if (!issuer || !xrpl.isValidAddress(issuer)) {
        log('Error: Invalid issuer address for data check.');
        return;
    }

    
    const cleanTicker = ticker.startsWith('$') ? ticker.slice(1) : ticker;
    
    const xrpscanUrl = `https://xrpscan.com/token/${cleanTicker}.${issuer}`;
    
    log(`Opening issuer data for ${ticker}: ${xrpscanUrl}`);

    
    window.open(xrpscanUrl, '_blank');
}

function selectSendAsset() {
    const sendAssetDisplay = document.getElementById('send-asset-display');
    const sendAmountInput = document.getElementById('send-amount');
    
    if (!sendAssetDisplay || !sendAmountInput) {
        log('Error: Send asset display or amount input not found in DOM.');
        return;
    }

    const selectedAssetName = sendAssetDisplay.getAttribute('data-value') || sendAssetDisplay.textContent;
    const asset = getAssetByName(selectedAssetName);
    
    sendAmountInput.placeholder = asset 
        ? `Amount (e.g., 200 or 1.134891)` 
        : "Amount (e.g., 200 or 1.134891 XRP)";
}

function setSwapPercentage(percentage) {
    const slider = document.getElementById('swap-balance-slider');
    if (!slider) {
        log('Error: Swap slider not found.');
        return;
    }
    
    const truncatedPercentage = Number(Number(percentage).toFixed(6));
    slider.value = truncatedPercentage;
    updateSwapAmountsFromSlider();
    log(`Set swap percentage to ${truncatedPercentage}%`);
}
function updateSwapDirection() {
    const inputAssetDisplay = document.getElementById('swap-input-asset-display');
    const outputAssetDisplay = document.getElementById('swap-output-asset-display');
    
    if (!inputAssetDisplay || !outputAssetDisplay) {
        log('Error: Swap asset display elements not found in DOM.');
        return;
    }

    const inputAsset = inputAssetDisplay.getAttribute('data-value');
    const outputAsset = outputAssetDisplay.getAttribute('data-value');

    if (!inputAsset || !outputAsset) {
        log('Error: Assets not yet initialized, skipping update.');
        return;
    }

    if (inputAsset === outputAsset) {
        const availableAssets = ['XRP', ...prefabAssets.map(a => a.name), ...dynamicAssets.map(a => a.name)];
        const otherAsset = availableAssets.find(a => a !== inputAsset && a !== 'XRP') || 'Xoge';
        const otherAssetData = prefabAssets.find(a => a.name === otherAsset) || dynamicAssets.find(a => a.name === otherAsset) || 
                             { name: 'Xoge', hex: '586F676500000000000000000000000000000000', issuer: 'rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1' };
        outputAssetDisplay.textContent = otherAsset;
        outputAssetDisplay.setAttribute('data-value', otherAsset);
        outputAssetDisplay.setAttribute('data-hex', otherAssetData.hex || 'XRP');
        outputAssetDisplay.setAttribute('data-issuer', otherAssetData.issuer || '');
        log(`Adjusted output asset to ${otherAsset} to avoid duplicate selection.`);
    }

    const prevInput = ammState.lastInputAsset;
    const prevOutput = ammState.lastOutputAsset;
    if (prevInput !== inputAsset || prevOutput !== outputAsset) {
        ammState.lastPoolPrice = null;
        ammState.lastPriceCheckTimestamp = null;
        ammState.lastInputAsset = inputAsset;
        ammState.lastOutputAsset = outputAsset;
        
        const amountInput = document.getElementById('swap-amount');
        const outputAmountInput = document.getElementById('swap-output-amount');
        const slider = document.getElementById('swap-balance-slider');
        const percentageDisplay = document.getElementById('slider-percentage');
        const swapResult = document.getElementById('swap-result');
        amountInput.value = '';
        outputAmountInput.value = '';
        slider.value = 0;
        percentageDisplay.textContent = '0%';
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Select assets and check pool price</p>';

        updateAssetChart();
    }

    const swapResult = document.getElementById('swap-result');
    if (swapResult && !ammState.lastPoolPrice) {
        swapResult.innerHTML = '<p style="color: #fff;">Swap Result: Select assets and check pool price</p>';
    }

    const slider = document.getElementById('swap-balance-slider');
    if (slider && !ammState.lastPoolPrice) {
        slider.value = 0;
        slider.disabled = true;
        document.getElementById('slider-percentage').textContent = '0%';
        document.getElementById('swap-amount').value = '';
        document.getElementById('swap-output-amount').value = '';
    }

    updateBalances();
}


async function updateBalances() {

    if (window.isUpdatingBalances) {

        return;
    }
    window.isUpdatingBalances = true;

    try {
        const address = globalAddress;
        if (!address || !xrpl.isValidAddress(address)) {
            if (document.getElementById('input-balance')) document.getElementById('input-balance').textContent = 'Balance: -';
            if (document.getElementById('output-balance')) document.getElementById('output-balance').textContent = 'Balance: -';
            const slider = document.getElementById('swap-balance-slider');
            if (slider) {
                slider.value = 0;
                slider.disabled = true;
                document.getElementById('slider-percentage').textContent = '0%';
                document.getElementById('swap-amount').value = '';
                document.getElementById('swap-output-amount').value = '';
            }
            return;
        }

        await ensureConnected();
        const inputAsset = document.getElementById('swap-input-asset')?.value;
        const outputAsset = document.getElementById('swap-output-asset')?.value;

        const now = Date.now();
        let xrpBalance, accountLines;
        if (!cachedBalance || (now - cachedBalance.timestamp) > 120000) {
            const accountInfo = await client.request({ command: "account_info", account: address, ledger_index: "current" });
            xrpBalance = xrpl.dropsToXrp(accountInfo.result.account_data.Balance);
            accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
            cachedBalance = await calculateAvailableBalance(address);
            cachedBalance.timestamp = now;
            cachedAccountLines = accountLines;
            lastAccountLinesFetch = now;

        } else {
            xrpBalance = cachedBalance.totalBalanceXrp;
            if (!cachedAccountLines || (now - lastAccountLinesFetch) > 60000) {

                accountLines = await client.request({ command: "account_lines", account: address, ledger_index: "current" });
                cachedAccountLines = accountLines;
                lastAccountLinesFetch = now;
            } else {
                accountLines = cachedAccountLines;

            }
        }

        if (inputAsset && outputAsset) {
            const inputAssetData = inputAsset === "XRP" ? null : getAssetByName(inputAsset);
            const outputAssetData = outputAsset === "XRP" ? null : getAssetByName(outputAsset);
            const inputAssetHex = inputAssetData ? inputAssetData.hex : null;
            const outputAssetHex = outputAssetData ? outputAssetData.hex : null;
            const inputBalance = inputAsset === "XRP" ? xrpBalance : (accountLines?.result?.lines?.find(line => line.currency === inputAssetHex)?.balance || "0");
            const outputBalance = outputAsset === "XRP" ? xrpBalance : (accountLines?.result?.lines?.find(line => line.currency === outputAssetHex)?.balance || "0");
            if (document.getElementById('input-balance')) document.getElementById('input-balance').textContent = `Balance: ${formatBalance(inputBalance)}`;
            if (document.getElementById('output-balance')) document.getElementById('output-balance').textContent = `Balance: ${formatBalance(outputBalance)}`;
        }

        const slider = document.getElementById('swap-balance-slider');
        if (slider) {
            const timeDiff = ammState.lastPriceCheckTimestamp ? now - ammState.lastPriceCheckTimestamp : Infinity;
            const isPriceFresh = timeDiff <= 180000;
            const hasPoolPrice = !!ammState.lastPoolPrice;
            const assetMatch = hasPoolPrice && inputAsset === (ammState.lastPoolPrice?.direction.includes("XRP-to-Token") ? "XRP" : ammState.lastPoolPrice?.assetName) && outputAsset === (ammState.lastPoolPrice?.direction.includes("Token-to-XRP") ? "XRP" : ammState.lastPoolPrice?.assetName);

            if (!isPriceFresh && !hasPoolPrice) {
                slider.value = 0;
                slider.disabled = true;
                document.getElementById('slider-percentage').textContent = '0%';
                document.getElementById('swap-amount').value = '';
                document.getElementById('swap-output-amount').value = '';
                if (hasPoolPrice) {
                    const currentPair = `${inputAsset}-${outputAsset}`;
                    const storedPair = ammState.lastPoolPrice.direction === "XRP-to-Token" ? `XRP-${ammState.lastPoolPrice.assetName}` : `${ammState.lastPoolPrice.assetName}-XRP`;
                    if (currentPair !== storedPair) {
                        ammState.lastPoolPrice = null;
                        ammState.lastPriceCheckTimestamp = null;
                    }
                }
            } else {
                slider.disabled = false;
            }
        }
    } catch (error) {
        log(`Balance update error: IF THIS IS A NEW ACCOUNT ~ YOU MUST FUND IT FOR IT TO EXIST ON THE LEDGER AND BE SEEN/EXIST`);
        if (document.getElementById('input-balance')) document.getElementById('input-balance').textContent = 'Balance: -';
        if (document.getElementById('output-balance')) document.getElementById('output-balance').textContent = 'Balance: -';
        const slider = document.getElementById('swap-balance-slider');
        if (slider) {
            slider.value = 0;
            slider.disabled = true;
            document.getElementById('slider-percentage').textContent = '0%';
            document.getElementById('swap-amount').value = '';
            document.getElementById('swap-output-amount').value = '';
        }
    } finally {
        window.isUpdatingBalances = false;
    }
}



async function fetchDomain() {
    try {
        await ensureConnected();
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-domain');

        if (!xrpl.isValidAddress(address)) {
            log('Error: Invalid XRPL address.');
            if (errorElement) errorElement.textContent = 'Invalid XRPL address.';
            return;
        }

        const accountInfo = await client.request({ command: "account_info", account: address, ledger_index: "current" });
        const domainHex = accountInfo.result.account_data.Domain;
        const domain = hexToDomain(domainHex);
        const currentDomainDisplay = document.getElementById('current-domain');
        if (currentDomainDisplay) {
            currentDomainDisplay.textContent = `Current Domain: ${domain || 'None'}`;
        }
        log(`Current domain for ${address}: ${domain || 'None'}`);
    } catch (error) {
        log(`Error fetching domain: ${error.message}`);
    }
}

async function queueDomainTransaction() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-domain');

        if (!contentCache || !displayTimer) {
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

        const domainInput = document.getElementById('domain-input').value.trim();
        if (!domainInput) {
            log('Error: Domain input is empty. Enter a domain or click "Remove Domain" to clear it.');
            errorElement.textContent = 'Domain input is empty.';
            return;
        }

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        if (!domainRegex.test(domainInput)) {
            log('Error: Invalid domain format. Use a valid domain (e.g., example.com).');
            errorElement.textContent = 'Invalid domain format.';
            return;
        }

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const domainHex = domainToHex(domainInput);
        const tx = {
            TransactionType: "AccountSet",
            Account: address,
            Domain: domainHex,
            Fee: TRANSACTION_FEE_DROPS
        };

        const scheduleCheckbox = document.getElementById('schedule-tx-domain');
        const delayInput = document.getElementById('schedule-delay-domain');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling domain transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Set domain to ${domainInput}`,
            delayMs: delayMs,
            type: "domain",
            queueElementId: "domain-queue"
        };

        transactionQueue.push(txEntry);
        log(`Domain transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Domain queue error: ${error.message}`);
    }
}
async function removeDomain() {
    try {
        const address = globalAddress;
        const errorElement = document.getElementById('address-error-domain');

        if (!contentCache || !displayTimer) {
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

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== address) {
            log('Error: Seed does not match address.');
            errorElement.textContent = 'Seed does not match address.';
            return;
        }

        const tx = {
            TransactionType: "AccountSet",
            Account: address,
            Domain: "",
            Fee: TRANSACTION_FEE_DROPS
        };

        const scheduleCheckbox = document.getElementById('schedule-tx-domain');
        const delayInput = document.getElementById('schedule-delay-domain');
        let delayMs = 0;

        if (scheduleCheckbox.checked && delayInput.value) {
            const delayMinutes = parseInt(delayInput.value);
            if (isNaN(delayMinutes) || delayMinutes <= 0) {
                log('Error: Invalid delay time.');
                errorElement.textContent = 'Invalid delay time.';
                return;
            }
            delayMs = delayMinutes * 60 * 1000;
            log(`Scheduling domain removal transaction to be sent in ${delayMinutes} minutes...`);
        }

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Remove domain from account`,
            delayMs: delayMs,
            type: "domain",
            queueElementId: "domain-queue"
        };

        transactionQueue.push(txEntry);
        log(`Domain removal transaction added to queue. Current queue length: ${transactionQueue.length}`);
        updateTransactionQueueDisplay();

        if (!isProcessingQueue) processTransactionQueue();
    } catch (error) {
        log(`Domain removal queue error: ${error.message}`);
    }
}

function domainToHex(domain) {
    return Array.from(domain.toLowerCase())
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
}

function hexToDomain(hex) {
    if (!hex) return '';
    return hex.match(/.{1,2}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
}

function reapplyCursorStyle() {
    document.body.style.cursor = "auto";
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        element.style.cursor = "auto";
    });
}

function emergencyClearQueue() {
    if (transactionQueue.length === 0) {
        log('No transactions in queue to clear.');
        return;
    }

    log('Emergency Clear Queue triggered! Clearing the following transactions:');
    transactionQueue.forEach((txEntry, index) => {
        log(`${index + 1}. ${txEntry.description}`);
    });


    transactionQueue = [];
    isProcessingQueue = false;

    updateTransactionQueueDisplay();

    log('Queue cleared successfully. All pending transactions aborted.');
}

const debouncedUpdateSwapAmounts = debounce(updateSwapAmountsFromSlider, 100);

function setupDisclaimerPopup() {
    const disclaimerPopup = document.getElementById('disclaimerPopup');
    const gratitudeCheckbox = document.getElementById('gratitude-checkbox');
    const acceptButton = document.getElementById('accept-disclaimer-btn');

    if (!disclaimerPopup || !gratitudeCheckbox || !acceptButton) {
        log('Error: Disclaimer popup elements not found.');
        return;
    }
    gratitudeCheckbox.addEventListener('change', () => {
        acceptButton.disabled = !gratitudeCheckbox.checked;
    });

    acceptButton.addEventListener('click', () => {
        disclaimerPopup.style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    randomizeServerSelection();
    populateAssetDropdowns();

    setTimeout(() => {
        const trustDisplay = document.getElementById('trust-asset-display');
        if (trustDisplay && !trustDisplay.getAttribute('data-value')) {
            populateAssetDropdowns();
        }
    }, 1000);

    const ammSwapSection = document.getElementById('amm-swap');
    let hasInitializedAmmSwap = false;
    if (ammSwapSection) {
        ammSwapSection.querySelector('.section-header').addEventListener('click', async function () {
            if (!hasInitializedAmmSwap && !ammSwapSection.classList.contains('minimized')) {
                await checkBalance();
                await updateBalances();
                const slider = document.getElementById('swap-balance-slider');
                if (slider) {
                    slider.addEventListener('input', debouncedUpdateSwapAmounts);
                }
                await updateAssetChart();
                hasInitializedAmmSwap = true;
            }
        });

        const ammSwapNavLink = document.querySelector('a[href="#amm-swap"]');
        if (ammSwapNavLink) {
            ammSwapNavLink.addEventListener('click', async function () {
                if (!hasInitializedAmmSwap) {
                    await checkBalance();
                    await updateBalances();
                    const slider = document.getElementById('swap-balance-slider');
                    if (slider) {
                        slider.addEventListener('input', debouncedUpdateSwapAmounts);
                    }
                    await updateAssetChart();
                    hasInitializedAmmSwap = true;
                }
            });
        }
    }

    const swapAmountInput = document.getElementById('swap-amount');
    if (swapAmountInput) {
        swapAmountInput.addEventListener('input', function(e) {
            e.target.value = truncateAmount(e.target.value);
        });
    } else {
        log('Error: #swap-amount input not found on page load.');
    }
});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}



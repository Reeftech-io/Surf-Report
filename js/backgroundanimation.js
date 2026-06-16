document.addEventListener("DOMContentLoaded", () => {
    const backgroundContainer = document.createElement("div");
    backgroundContainer.id = "backgroundAnimation";
    backgroundContainer.style.position = "fixed";
    backgroundContainer.style.top = "0";
    backgroundContainer.style.left = "0";
    backgroundContainer.style.width = "100vw";
    backgroundContainer.style.height = "100vh";
    backgroundContainer.style.pointerEvents = "none";
    backgroundContainer.style.zIndex = "-1";
    document.body.insertBefore(backgroundContainer, document.body.firstChild);

    const assets = [
        { name: "$Xoge", issuer: "rJMtvf5B3GbuFMrqybh5wYVXEH4QE8VyU1", hex: "586F676500000000000000000000000000000000" },	
        { name: "$RLUSD", issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De", hex: "524C555344000000000000000000000000000000" },
        { name: "$PUPU", issuer: "r4WfqR5DQ7PwPvVJv8Gism5cQBLGtNnvK8", hex: "5055505500000000000000000000000000000000" },
        { name: "$Army", issuer: "rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC", hex: "41524D5900000000000000000000000000000000" },
        { name: "$BANANA", issuer: "rpopnahpwzxiwapipm5ehq6kslehvgilqp", hex: "42414e414e410000000000000000000000000000" },
        { name: "$589", issuer: "rfcasq9uRbvwcmLFvc4ti3j8Qt1CYCGgHz", hex: "589" },
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
        { name: "$Kekius", issuer: "rLWCx7obzMRb4w2UnKU7PKj4Mh7jSyemrH", hex: "4B454B4955530000000000000000000000000000" },
        { name: "$Doge", issuer: "rp4GXygXPM2ydNLgiDeHrrkfuaAufSZaca", hex: "444F474500000000000000000000000000000000" },
        { name: "$Sand", issuer: "rs5zZN42NGy9VdEMuTgU6NVPqpBZQRZ2bv", hex: "AND" },
        { name: "$Zrpy", issuer: "rsxkrpsYaeTUdciSFJwvto7Q4nYmfZv7BZ", hex: "5A52505900000000000000000000000000000000" },
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
        { name: "$Maga", issuer: "rwH49FHnr48FeUP7NX9EuL4pZZZSeTuHu", hex: "4D41474100000000000000000000000000000000" },
        { name: "$Stksy", issuer: "rMyKhoyQnheGEQBfLH4sjdg9pN5z72ehrT", hex: "53544B5359000000000000000000000000000000" },
        { name: "$Bchamp", issuer: "rhYhn7s6z4HAfuJm7ehuSE7wxepRoUPwpi", hex: "424348414D500000000000000000000000000000" },
        { name: "$Xtr", issuer: "rafe4x2fTrgFXauqEfmyjHDmhFgqB1YYGv", hex: "XTR" },
        { name: "$Xwar", issuer: "rJAm3vMSiwCZHxLygaTdmiqCUG8YeSJFVy", hex: "5857415200000000000000000000000000000000" },	
        { name: "$Cult", issuer: "rCULtAKrKbQjk1Tpmg5hkw4dpcf9S9KCs", hex: "43554C5400000000000000000000000000000000" },	
        { name: "$SOLO", issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz", hex: "534F4C4F00000000000000000000000000000000" },	
        { name: "$ELS", issuer: "rHXuEaRYnnJHbDeuBH5w8yPh5uwNVh5zAg", hex: "ELS" },	
        { name: "$CORE", issuer: "rcoreNywaoz2ZCQ8Lg2EbSLnGuRBmun6D", hex: "434F524500000000000000000000000000000000" },	
        { name: "$VGB", issuer: "rhcyBrowwApgNonehKBj8Po5z4gTyRknaU", hex: "VGB" },	
        { name: "$CX1", issuer: "rKk7mu1dNB25fsPEJ4Ynyyq4pZZZSeTuHu", hex: "CX1" },	
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
        { name: "$SmartNFT", issuer: "rf8dxyFrYWEcUQAM7QXdbbtcRPzjvoQybK", hex: "536D6172744E4654000000000000000000000000" },	
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
        { name: "$SPREAD", issuer: "rwPzJd39swHT6NfxvgGFYE7q9q7EcqKuKW", hex: "5350524541440000000000000000000000000000" },	
        { name: "$DROP", issuer: "rszenFJoDdiGjyezQc8pME9KWDQH43Tswh", hex: "44524F5000000000000000000000000000000000" },	
        { name: "$RDX", issuer: "rQa3LW1Au4GxGHzDBkCMKuPcn326w4Wcj2", hex: "RDX" },	
        { name: "$UVX", issuer: "r4XUTsMNJoT8Cs6rNHzbif5MpZ7sPH1nWF", hex: "UVX" },	
        { name: "$SmartLOX", issuer: "rBdZkMKuPnzYVVkyL2DrQKV3DsYt5PPVRh", hex: "536D6172744C4F58000000000000000000000000" },	
        { name: "$MeowRP", issuer: "rMPEuuvWf6MvCu77NpUF37GUkdbwr9Nhhk", hex: "4D656F7752500000000000000000000000000000" },	
        { name: "$FAITH", issuer: "rfeSrMKMvyb3MSMnQRFZ1Dwd9KHS6g49ZT", hex: "4641495448000000000000000000000000000000" },	
        { name: "$STX", issuer: "rSTAYKxF2K77ZLZ8GoAwTqPGaphAqMyXV", hex: "STX" },	
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
        { name: "$XRMOON", issuer: "rBBh2z5wsxE9gcVE2yUU39UntvRMHDKPpq", hex: "58524D4F4E000000000000000000000000000000" },	
        { name: "$SSE", issuer: "rMDQTunsjE32sAkBDbwixpWr8TJdN5YLxu", hex: "SSE" },	
        { name: "$PGN", issuer: "rPUSoeJaHQzrXATtGnoVjwBQQDEtJcdwFq", hex: "PGN" },	
        { name: "$XAHGatehub", issuer: "rswh1fvyLqHizBS2awu1vs6QcmwTBd9qiv", hex: "XAH" },	
        { name: "$xFlashChain", issuer: "rJgcjY1MZJjw946qRqN57V3TGg9PZEA1bw", hex: "78466C617368436861696E000000000000000000" },	
        { name: "$666", issuer: "rhvf9fe6PP3GC8Bku2Ug7iQPjPDxYZfrxN", hex: "666" },
        { name: "$Stb", issuer: "rw9kWBD9LwnCrvLEZFDApDDLYfwZFv1dNs", hex: "STB" },
        { name: "$MiLady", issuer: "rhPSguKUfFLjELmXxctobqpz4NgPneBXvS", hex: "4D494C4144590000000000000000000000000000" },
        { name: "$Burn", issuer: "rwgNTwrsZKPe7xYCy4emjFAYpgnuioHSkd", hex: "4255524E00000000000000000000000000000000" },
        { name: "$BUT", issuer: "riQtZKAtGWGRThMNBGz8RtLGAKHd7Za8x", hex: "BUT" },
        { name: "$Dood", issuer: "rn5Y9N8APtrc7PVqXdMjkG9qvfw7FWi4kC", hex: "446F6F6400000000000000000000000000000000" },
        { name: "$Laugh", issuer: "r32nbPw6cyt3KdxinB4ua6WSLRrrF4SXAC", hex: "4C61756768000000000000000000000000000000" },
        { name: "$Sigma", issuer: "rfKYWZ84fm9eVEdoTcsQCo1WdqMPyaUF5z", hex: "5349474D41000000000000000000000000000000" },
        { name: "$Xmeme", issuer: "r4UPddYeGeZgDhSGPkooURsQtmGda4oYQW", hex: "584D454D45000000000000000000000000000000" },
        { name: "$Ascension", issuer: "r3qWgpz2ry3BhcRJ8JE6rxM8esrfhuKp4R", hex: "ASC" },
        { name: "$ARK", issuer: "rf5Jzzy6oAFBJjLhokha1v8pXVgYYjee3b", hex: "ARK" },
        { name: "$GRD", issuer: "rDaDV5smdWjr8QcagD8UhbPZWzJBkdVAnH", hex: "GRD" },
        { name: "$3RDEYE", issuer: "rHjyBqFM5oQvXu1soWtATC4r1V6GBnhCQQ", hex: "3352444559450000000000000000000000000000" },
        { name: "$FWOGXRP", issuer: "rNm3VNJJ2PCmQFVDRpDR6N73UEtZh32HFi", hex: "46574F4758525000000000000000000000000000" },
        { name: "$Joey", issuer: "rN6CXs6J7WDh8miq2C2cre6w7jipc55Ut", hex: "4A6F657900000000000000000000000000000000" },
        { name: "$HAIC", issuer: "rsEXqMHTKDfGzncfJ25XtB9ZY8jayTv7N3", hex: "4841494300000000000000000000000000000000" },
        { name: "$BUT", issuer: "riQtZKAtGWGRThMNBGz8RtLGAKHd7Za8x", hex: "2442555400000000000000000000000000000000" },
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
        { name: "$XRPMAN", issuer: "rpCB8upQziQR6P5YbHnZZAqqTMePQ8pCTR", hex: "245852504D414E00000000000000000000000000" }
    ];

   const style = document.createElement("style");
    style.textContent = `
        .animated-icon {
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            pointer-events: none;
            will-change: transform, opacity;
            transition: opacity 0.1s ease;
        }
        .trail::after {
            content: '';
            position: absolute;
            width: 32px;
            height: 32px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
            border-radius: 50%;
            z-index: -1;
            animation: fadeTrail 1s linear infinite;
        }
        @keyframes fadeTrail {
            0% { opacity: 0.5; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        @keyframes shine {
            0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
            50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
            100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
        }
    `;
    document.head.appendChild(style);

    const transparencyStyle = document.createElement("style");
    transparencyStyle.textContent = `
        body {
            background-color: transparent !important;
        }
        .container, .section, .sidebar-left, .sidebar-right, .nav-bar, .header, .footer, .account-overview, .trustline-controls, .output-box, .swap-tokens, .swap-info, .swap-result, .wallet-warning, .qr-modal-content, .transaction-queue, .password-modal-content, .lp-subsection, .lp-subsection-header, .lp-subsection-content, .regular-key-controls, .network-stats-controls, .nuke-trustline, .ledger-stats-box, .deep-dive-box, .warning-modal .password-modal-content, .golem-output, .golem-controls, .pair-headers, .pair-block, .pair-data, .pair-charts, .category-tab, .product-item, .wallet-history-legend, .wallet-history-summary, .wallet-history-total, .wallet-history-transactions, .wallet-history-item p, .wallet-history-item .wallet-history-details {
            background-color: rgba(26, 26, 26, 0.8) !important;
        }
        .section-header, .nav-bar a, .red-black-btn, .green-btn, .teal-btn, .clear-dom-btn, .qr-copy-btn, .qr-close-btn, .nuke-btn, .lp-action-btn, .percentage-btn, .emergency-btn, .custom-file-input .nav-link-btn, .battle-log-header, .product-link {
            background: rgba(51, 51, 51, 0.8) !important;
        }
    `;
    document.head.appendChild(transparencyStyle);

    const checkImageExists = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => {
                console.warn(`Image not found: ${src}`);
                resolve(false);
            };
            img.src = src;
        });
    };

    let confirmedAssets = [];
    const initializeConfirmedAssets = async () => {
        for (const asset of assets) {
            const src = `icons/${asset.name}-${asset.issuer}.png`;
            if (await checkImageExists(src)) {
                confirmedAssets.push(src);
            }
        }
        if (confirmedAssets.length === 0) {
            console.warn("No valid assets found, using fallback image.");
            confirmedAssets.push("icons/XRP.png");
        }
        console.log("Confirmed assets:", confirmedAssets);
    };

    let cx, cy, maxR, growthRate;
    const numberOfLaps = 10;
    const maxTheta = numberOfLaps * 2 * Math.PI;
    const updateDimensions = () => {
        cx = window.innerWidth / 2;
        cy = window.innerHeight / 2;
        maxR = window.innerWidth / 2;
        growthRate = maxR / maxTheta;
        console.log(`Window resized: cx=${cx}, cy=${cy}, maxR=${maxR}, growthRate=${growthRate}`);
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    const angularSpeed = Math.PI / 16;
    const spacing = 0.1;
    const numberOfIcons = Math.min(350, assets.length);
    let direction = -1;
    let currentTheta = maxTheta;
    let lastTime = performance.now();
    const icons = [];
    const uiElements = Array.from(document.querySelectorAll(".container, .sidebar-left-container, .sidebar-right-container, .section, .sidebar-left, .sidebar-right"));

    const checkOverlap = (icon) => {
        const iconRect = icon.getBoundingClientRect();
        return uiElements.some(element => {
            const elementRect = element.getBoundingClientRect();
            return (
                iconRect.left < elementRect.right &&
                iconRect.right > elementRect.left &&
                iconRect.top < elementRect.bottom &&
                iconRect.bottom > elementRect.top
            );
        });
    };

    const setupAndStart = async () => {
        if (Math.random() >= 0.2) {
            
            return;
        }
        console.log("Animation triggered (10% chance)");
        await initializeConfirmedAssets();
        if (confirmedAssets.length === 0) {
            console.error("No assets available to animate");
            return;
        }
        for (let i = 0; i < numberOfIcons; i++) {
            const icon = document.createElement("img");
            icon.classList.add("animated-icon");
            icon.src = confirmedAssets[i % confirmedAssets.length];
            icon.style.transform = "translate(-50%, -50%)";
            icon.style.left = `${cx}px`;
            icon.style.top = `${cy}px`;
            backgroundContainer.appendChild(icon);
            icons.push(icon);
            console.log(`Icon ${i} created with src: ${icon.src}`);
            if (Math.random() > 0.5) {
                const blinkDuration = Math.random() * 2 + 1;
                icon.style.animation = `blink ${blinkDuration}s infinite ease-in-out`;
            }
            if (Math.random() > 0.5) {
                const shineDuration = Math.random() * 3 + 1;
                icon.style.animation += `, shine ${shineDuration}s infinite ease-in-out`;
            }
            if (Math.random() > 0.5) {
                icon.classList.add("trail");
            }
            if (Math.random() > 0.5) {
                const rotateDuration = Math.random() * 4 + 2;
                icon.style.animation += `, rotate ${rotateDuration}s linear infinite`;
            }
        }
        function animate(now) {
            const delta = (now - lastTime) / 100;
            lastTime = now;
            currentTheta += direction * angularSpeed * delta;
            if (currentTheta > maxTheta && direction === 1) {
                direction = -1;
            } else if (currentTheta < 0 && direction === -1) {
                direction = 1;
            }
            for (let i = 0; i < icons.length; i++) {
                let theta = currentTheta - i * spacing * direction;
                theta = Math.max(0, Math.min(maxTheta, theta));
                if (theta < 0 || theta > maxTheta) {
                    console.log(`Icon ${i} out of bounds: theta=${theta}`);
                    icons[i].style.opacity = "0";
                    continue;
                }
                const r = growthRate * theta;
                const x = cx + r * Math.cos(theta);
                const y = cy + r * Math.sin(theta);
                if (!isNaN(x) && !isNaN(y)) {
                    icons[i].style.left = `${Math.round(x)}px`;
                    icons[i].style.top = `${Math.round(y)}px`;
                } else {
                    console.warn(`Invalid position for icon ${i}: x=${x}, y=${y}`);
                    icons[i].style.left = `${cx}px`;
                    icons[i].style.top = `${cy}px`;
                }
                console.log(`Icon ${i}: theta=${theta}, x=${x}, y=${y}, left=${icons[i].style.left}, top=${icons[i].style.top}`);
                icons[i].style.opacity = "1";
            }
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    };

    setupAndStart();
});
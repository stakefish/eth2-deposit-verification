# Eth2 Contract Data Verification Tool

This simple tool makes it easy to verify the withdrawal credentials, number of validators, and correctness of the deposit message signature users typically receive when depositing ETH with Ethereum 2.0 staking services like stakefish.

---

### Instructions

1. Navigate to https://stakefish.github.io/eth2-deposit-verification/ or run the app locally.
2. During the deposit process, copy the hex data from MetaMask to the text area.
3. Click "Check."

![Demo](https://miro.medium.com/max/700/0*WNnSrvxyiIgsTIcG)

---

If you did everything correctly, you will see a green success message along with the detected withdrawal credentials, which you can manually compare with the credentials in your `deposit_data-*.json` file. The current version of the tool only supports the stakefish Batch Deposit Contract and the official Eth2 deposit contract, and transactions to other contracts will fail the verification. We plan to implement support for other deposit contracts in the near future.

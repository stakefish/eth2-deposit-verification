import { NumberUintType, ByteVectorType, ContainerType } from "@chainsafe/ssz";

export const bufferHex = (x) => Buffer.from(x, "hex");
const DepositMessage = new ContainerType({
  fields: {
    pubkey: new ByteVectorType({
      length: 48,
    }),
    withdrawalCredentials: new ByteVectorType({
      length: 32,
    }),
    amount: new NumberUintType({
      byteLength: 8,
    }),
  },
});

export const buildMessageRoot = (depositData) => {
  const depositDataObject = {
    pubkey: bufferHex(depositData.pubkey),
    withdrawalCredentials: bufferHex(depositData.withdrawal_credentials),
    amount: Number(depositData.amount),
  };

  return DepositMessage.hashTreeRoot(depositDataObject);
};

export const SigningData = new ContainerType({
  fields: {
    objectRoot: new ByteVectorType({
      length: 32,
    }),
    domain: new ByteVectorType({
      length: 32,
    }),
  },
});
export const ForkData = new ContainerType({
  fields: {
    currentVersion: new ByteVectorType({
      length: 4,
    }),
    genesisValidatorsRoot: new ByteVectorType({
      length: 32,
    }),
  },
});

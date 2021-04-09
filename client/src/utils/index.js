import * as ethUtil from "ethereumjs-util";
import { convertUtf8ToHex } from "@walletconnect/utils";
import { SUPPORTED_CHAINS } from "./chains";
import { providers } from "ethers";
import { eip1271 } from "./eip1271";

export function encodePersonalMessage(msg) {
    const data = ethUtil.toBuffer(convertUtf8ToHex(msg));
    const buf = Buffer.concat([
      Buffer.from("\u0019Ethereum Signed Message:\n" + data.length.toString(), "utf8"),
      data,
    ]);
    return ethUtil.bufferToHex(buf);
  }

export function hashPersonalMessage(msg) {
    const data = encodePersonalMessage(msg);
    const buf = ethUtil.toBuffer(data);
    const hash = ethUtil.keccak256(buf);
    return ethUtil.bufferToHex(hash);
}

export function getChainData(chainId) {
    const chainData = SUPPORTED_CHAINS.filter((chain) => chain.chain_id === chainId)[0];
  
    if (!chainData) {
      throw new Error("ChainId missing or not supported");
    }
  
    const API_KEY = "86b075b6df644c81933ad9f85dddf38c";
  
    if (
      chainData.rpc_url.includes("infura.io") &&
      chainData.rpc_url.includes("%API_KEY%") &&
      API_KEY
    ) {
      const rpcUrl = chainData.rpc_url.replace("%API_KEY%", API_KEY);
  
      return {
        ...chainData,
        rpc_url: rpcUrl,
      };
    }
  
    return chainData;
}

export function recoverAddress(sig, hash) {
    const params = ethUtil.fromRpcSig(sig);
    const result = ethUtil.ecrecover(ethUtil.toBuffer(hash), params.v, params.r, params.s);
    const signer = ethUtil.bufferToHex(ethUtil.publicToAddress(result));
    return signer;
}

export async function verifySignature(address, sig, hash, chainId) {
    const rpcUrl = getChainData(chainId).rpc_url;
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const bytecode = await provider.getCode(address);
    if (!bytecode || bytecode === "0x" || bytecode === "0x0" || bytecode === "0x00") {
      const signer = recoverAddress(sig, hash);
      return signer.toLowerCase() === address.toLowerCase();
    } else {
      return eip1271.isValidSignature(address, sig, hash, provider);
    }
}

export const signPersonalMessage = async (address, connector, message) => {
    console.log("Sign");
    const chainId = 1;

    if (!connector) {
      return;
    }

    // encode message (hex)
    const hexMsg = convertUtf8ToHex(message);

    // personal_sign params
    const msgParams = [hexMsg, address];

    try {
      // // open modal
      // this.toggleModal();

      // // toggle pending request indicator
      // this.setState({ pendingRequest: true });

      // send message
      const result = await connector.signPersonalMessage(msgParams);

      // verify signature
      const hash = hashPersonalMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "personal_sign",
        address,
        valid,
        result,
      };

      alert(JSON.stringify(formattedResult));

      return formattedResult;
      // display result
      // this.setState({
      //   connector,
      //   pendingRequest: false,
      //   result: formattedResult || null,
      // });
    } catch (error) {
      console.error(error);
      // this.setState({ connector, pendingRequest: false, result: null });
    }
  };
import { loadFixture, expect, ethers } from "./setup";
import { AlbumTracker, Album__factory } from "../typechain-types";
import { ContractTransactionReceipt, BaseContract } from "ethers";

describe("MusicShop", function () {
  async function deploy() {
    const [owner, buyer] = await  ethers.getSigners();

    const MusicShop = await ethers.getContractFactory("MusicShop");
    const shop = await MusicShop.deploy();
    await shop.waitForDeployment();
    return { shop, owner, buyer };
  }

});

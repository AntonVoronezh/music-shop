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

  it("should allow to add  albums", async function () {
    const { shop } = await loadFixture(deploy);

    const title = "Demo";
    const price = 100;
    const uid = ethers.solidityPackedKeccak256(["string"], [title]);
    const qty = 5;
    const initialIndex = 0;

    const addTx = await shop.addAlbum(uid, title, price, qty);
    await addTx.wait();

    const album  = await shop.albums(initialIndex);

    expect(album.index).to.eq(initialIndex);
    expect(album.uid).to.eq(uid);
    expect(album.price).to.eq(price);
    expect(album.quantity).to.eq(qty);

    expect(await shop.currentIndex()).to.eq(initialIndex + 1);
  });


});

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

  it("should allow to buy  albums", async function () {
    const { shop, buyer } = await loadFixture(deploy);

    const title = "Demo";
    const price = 100;
    const uid = ethers.solidityPackedKeccak256(["string"], [title]);
    const qty = 5;
    const albumIdxToBuy = 0;
    const initialOrderId = 0;

    expect(await shop.currentOrderId()).to.eq(initialOrderId);

    const addTx = await shop.addAlbum(uid, title, price, qty);
    await addTx.wait();

    const album = await shop.albums(albumIdxToBuy);

    const buyTx = await shop.connect(buyer).buy(albumIdxToBuy, {value: price});
    const receipt = await buyTx.wait();

    await expect(buyTx).changeEtherBalances([shop, buyer], [price, -price]);

    expect(receipt).not.eq(undefined);

    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    const expectTimeStamp = block?.timestamp;

    await expect(buyTx).to.emit(shop, "AlbumBought").withArgs(uid, buyer.address, expectTimeStamp);
  });
});

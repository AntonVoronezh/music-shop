import { loadFixture, expect, ethers } from "./setup";
import { AlbumTracker, Album__factory } from "../typechain-types";
import { ContractTransactionReceipt, BaseContract } from "ethers";

describe("AlbumTracker", function () {
  async function deploy() {
    const [owner, buyer] = await  ethers.getSigners();
    const AlbumTracker = await ethers.getContractFactory("AlbumTracker");
    const tracker = await AlbumTracker.deploy();
    await tracker.waitForDeployment();
    return { tracker, owner, buyer };
  }

  it("deploy albums", async function () {
    const { tracker, buyer } = await loadFixture(deploy);
    const title = "aaa bbb ccc ddd";
    const price = ethers.parseEther("0000.5");

    await createAlbum(tracker, title, price);

    const expectedAlbumAddress = await precomputeAddress(tracker);
    const album = Album__factory.connect(expectedAlbumAddress, buyer);

    expect(await album.price()).to.equal(price);
    expect(await album.title()).to.equal(title);
    expect(await album.purchased()).to.equal(false);
    expect(await album.index()).to.equal(0);
  });

  it("creates albums", async function () {
    const { tracker } = await loadFixture(deploy);
    const title = "aaa bbb ccc ddd";
    const price = ethers.parseEther("0000.5");

    const reseiptTx = await createAlbum(tracker, title, price);

    const album =await tracker.albums(0);

    expect(album.ttile).to.equal(title);
    expect(album.price).to.equal(price);
    expect(album.state).to.equal(0);
    expect(await album.currentIndex()).to.equal(1);

    const expectedAlbumAddress = await precomputeAddress(tracker);

    expect(reseiptTx?.logs[0].topics[1]).to.equal(ethers.zeroPadValue(expectedAlbumAddress, 32));
    await expect(reseiptTx).to.emit(tracker, "AlbumStateChanged").withArgs(expectedAlbumAddress, 0, 0);
  });

  it("allows to buys albums", async function () {
    const { tracker, buyer } = await loadFixture(deploy);
    const title = "aaa bbb ccc ddd";
    const price = ethers.parseEther("0000.5");

    await createAlbum(tracker, title, price);

    const expectedAlbumAddress = await precomputeAddress(tracker);
    const album = Album__factory.connect(expectedAlbumAddress, buyer);

    const buyTxData = {
      to: expectedAlbumAddress,
      value: price
    }

    const buyTx = await buyer.sendTransaction(buyTxData);

    expect(await album.purchased()).to.equal(true);


  });

  async function precomputeAddress(
    smartContract: BaseContract,
    nonce = 1,
  ): Promise<string> {
    return ethers.getCreateAddress({
      from: await smartContract.getAddress(),
      nonce,
    });
  }

  async function createAlbum(
    tracker: AlbumTracker,
    title: string,
    price: bigint,
  ): Promise<ContractTransactionReceipt | null> {
    const createAlbumTx = await tracker.createAlbum(price, title);

    return await createAlbumTx.wait();
  }
});

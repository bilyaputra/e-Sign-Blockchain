const e_Sign = artifacts.require('eSign');

contract("e_Sign", (accounts) => {
    it("Cek apakah tanda tangan tersimpan pada Blockchain", async () => {
        let account = accounts[0];
        const contract = await e_Sign.deployed();
        await contract.setTtd(account, "QmdD22tyCgutHfpzDQHrygJg7PGx38xCMeRQnyWRohAeyD", {from: account});
        let ttd = await contract.getTtd(account);
        assert.equal(ttd, "QmdD22tyCgutHfpzDQHrygJg7PGx38xCMeRQnyWRohAeyD", "Tanda tangan tidak tersimpan pada Blockchain");
    });

    it("Cek apakah tanda tangan berhasil dipublikasi", async () => {
        let account = accounts[0];
        const contract = await e_Sign.deployed();
        let sign = "0xf1d0114ffe4a21d9a061b571ef00b3e55b9345b05b010b7c8ee26dcb05c99dda2fea3ce0efa7dd5dedf79dc47137ad4851a918fed5b4dfffc3b3deb4d7d5380a1b";
        let perihal = "pengesahan";
        let cid = "QmdD22tyCgutHfpzDQHrygJg7PGx38xCMeRQnyWRohAeyD";
        let timestamp = "1683118195175";
        let cidTtdQr = "QmWdm5jVfepBXgA6bbo86FcuWCmmEuJKWBQUjdkQQGPigQ";
        await contract.setDataTtd(sign, perihal, cid, timestamp, account, cidTtdQr, {from: account});
        let getdata = await contract.getDataTtd(sign);
        let publikasi = {0:perihal, 1:cid, 2:timestamp, 3:account, 4:cidTtdQr};
        assert.equal(JSON.stringify(getdata), JSON.stringify(publikasi), "Tanda tangan tidak terpublikasi");
    });

    it("Cek apakah tanda tangan dapat divalidasi", async () => {
        const contract = await e_Sign.deployed();
        let address = "0xBF23dEDd54F41e50C3Bc0E4B258986aFc989663D";
        let perihal = "pengesahan krs";
        let cid = "QmSFaJSgJ6XUx4ykDpB53yZH6FCjZ4zMZvct9PNRzeHxav";
        let timestamp = "1683207637454";
        let signatrue = "0xf1d0114ffe4a21d9a061b571ef00b3e55b9345b05b010b7c8ee26dcb05c99dda2fea3ce0efa7dd5dedf79dc47137ad4851a918fed5b4dfffc3b3deb4d7d5380a1b";
        const valid = await contract.verify(address, perihal, cid, timestamp, signatrue);
        assert.equal(valid, true, "Tanda tangan tidak dapat divalidasi");
    });

    it("Cek apakah riwayat tanda tangan tersimpan", async () => {
        let account = accounts[0];
        let perihal = "pengesahan";
        let timestamp = "1683118195175";
        let signatrue = "0xf1d0114ffe4a21d9a061b571ef00b3e55b9345b05b010b7c8ee26dcb05c99dda2fea3ce0efa7dd5dedf79dc47137ad4851a918fed5b4dfffc3b3deb4d7d5380a1b";
        const contract = await e_Sign.deployed();
        let getRiwayat = await contract.getRiwayat(account);
        let riwayat = [timestamp, signatrue, perihal];
        let objRiwayat = [riwayat];
        assert.equal(JSON.stringify(getRiwayat), JSON.stringify(objRiwayat), "Riwayat tanda tangan tidak tersimpan");
    });
});
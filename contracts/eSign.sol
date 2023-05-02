// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract eSign {
  mapping(address => string) public ttd;
  mapping(bytes => kumpulanData) public DataTtd;
  mapping(address => bytes[]) public riwayat;

  struct kumpulanData {
    string perihal;
    string CIDTtd;
    uint timestamp;
    address addr;
    string CIDTtdQr;
  }

  function setDataTtd(bytes memory sign, string memory perihal, string memory cidTtd, uint timestamp, address addr, string memory cidTtdQr) public {
    kumpulanData memory data = kumpulanData(perihal, cidTtd, timestamp, addr, cidTtdQr);
    DataTtd[sign] = data;
    setRiwayat(addr, sign);
  }

  function getDataTtd(bytes memory sign) public view returns (string memory, string memory, uint, address, string memory){
    kumpulanData storage data = DataTtd[sign];
    return (data.perihal, data.CIDTtd, data.timestamp, data.addr, data.CIDTtdQr);
  }

  function setRiwayat(address _addr, bytes memory sign) public {
    riwayat[_addr].push(sign);
  }

  function getRiwayat(address _addr) public view returns (bytes[] memory){
    return riwayat[_addr];
  }

  function setTtd(address _addr, string memory CID) public {
    ttd[_addr] = CID;
  }

  function getTtd(address _addr) public view returns (string memory) {
    return ttd[_addr];
  }

  //validasi
  function getMessageHash(string memory perihal, string memory cid, uint timestamp) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(perihal, cid, timestamp));
  }

  function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
  }

  function verify(address _signer, string memory perihal, string memory cid, uint timestamp, bytes memory signature) public pure returns (bool) {
    bytes32 messageHash = getMessageHash(perihal, cid, timestamp);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

    return recoverSigner(ethSignedMessageHash, signature) == _signer;
  }

  function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}

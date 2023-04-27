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
}

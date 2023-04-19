// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract eSign {
  mapping(address => string) public ttd;

  function setTtd(address _addr, string memory CID) public {
    ttd[_addr] = CID;
  }

  function getTtd(address _addr) public returns (string memory) {
    return ttd[_addr];
  }
}

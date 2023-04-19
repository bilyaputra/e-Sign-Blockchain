App = {
    
    loadMetamask: async ()=> {
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            window.ethereum.enable();
        } else {
            alert("Tidak ada ethereum terdeteksi pada browser.");
        } 
    },
}

$(document).ready(function(){
    App.loadMetamask()

    ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()        
    });        
})
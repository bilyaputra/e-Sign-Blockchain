App = {
    contracts: {},

    load: async ()=> {
        await App.loadWeb3()
        // await App.loadMetamask()
        await App.loadContract()
        await App.loadAccount()
    },

    loadWeb3: async ()=> {
        if(window.ethereum){
            App.web3Provider = window.ethereum
            web3 = new Web3(web3.currentProvider);
        }
    }, 

    // loadMetamask: async ()=> {
    //     if (window.ethereum) {
    //         window.ethereum.enable();
    //     } else {
    //         alert("Tidak ada ethereum terdeteksi pada browser.");
    //     } 
    // },

    loadContract: async ()=> {
        const e_Sign = await $.getJSON('eSign.json')
        App.contracts.eSign = TruffleContract(e_Sign)
        App.contracts.eSign.setProvider(App.web3Provider)
        App.e_Sign = await App.contracts.eSign.deployed()        
    },

    loadAccount: async ()=> {
        App.account = await ethereum.request({ method: 'eth_accounts' })
        $('#account').html("Your Account: " + App.account[0])
    },

//0xa02b0b97e08dc434967c4a8fc7777f5ff9cbdc6ab01fd4d4166e0b668f59d536676c0807f2ceb2d84cebea1455339b73cc14432842c3f90122cc325f9b213b8c1b 132
    validasi: async(signature)=> {
        const data = await App.e_Sign.getDataTtd(signature);
        
        if(data[0] == ""){
            invalid(data[0]);
        }else{
            const valid = await App.e_Sign.verify(data[3], data[0], data[1], data[2], signature)
            if(valid){
                $("#responseText").html(" ");
                var link = "https://gateway.pinata.cloud/ipfs/" + data[4];
                var date = new Date(parseInt(data[2]));
                $("#responseText").append(
                    "<h5 class='text-success'>Tanda tangan telah terdaftar pada jaringan Blockchain Ethereum</h5>" +
                    "<p>Pemilik Tanda tangan : " + data[3] + "</p>" +
                    "<img src='" + link + "' height='150px'>" +
                    "<p>Perihal : " + data[0] + "</p>" +
                    "<p>Waktu Publikasi : " + date.customFormat( "#DD# #MMMM# #YYYY# #hh#:#mm#:#ss# #AMPM#" ) + " </p>" +
                    "<a href='" + link + "' target='blank'> <button type='button' class='btn btn-primary'>Unduh Ttd + Qr</button></a>"
                );
            }else {
                invalid(data[0]);
            }
        }
        
    },

    validPage: async()=>{
        await App.load();
        var signature = window.location.search;
		signature = signature.substring(1);
		// signature = encodeURIComponent(signature);
		if(signature.length == 132){
			App.validasi(signature);
		}else if(signature == ""){
			$("#searchBtn").click(function (event) {
				signature = $("#signature").val().trim();
				if(signature.length == 132){
					App.validasi(signature);
				}else{
					invalid(signature);
				}
    		});
		}else{
			invalid(signature);
		}
    },
}

$(document).ready(function(){
    App.validPage()    
    
    ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()        
    });        
})

function invalid(invalid) {
    if(invalid == ""){
        $("#responModal").html(
            "<h5 class='text-danger'>Isi form terlebih dahulu sebelum menekan tombol Cek</h5>" 
        );
    }else{
        $("#responModal").html(
            "<h5 class='text-danger'>Hash Signature Tidak Valid</h5>" 
        );
    }

    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    var span = document.getElementsByClassName("close")[0];
        span.onclick = function () {
        modal.style.display = "none";
        window.location.href="validasi.html";
    };
}
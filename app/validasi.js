App = {
    contracts: {},

    load: async ()=> {
        await App.loadWeb3()
        await App.loadMetamask()
        await App.loadContract()
        await App.loadAccount()
    },

    loadWeb3: async ()=> {
        if(window.ethereum){
            App.web3Provider = window.ethereum
            web3 = new Web3(web3.currentProvider);
        }
    }, 

    loadMetamask: async ()=> {
        if (window.ethereum) {
            window.ethereum.enable();
        } else {
            //modal
            $("#modalHead").html(
                "Pemberitahuan"
            )
            $("#responModal").html(
                "<h5 class='text-danger'>Install Metamask terlebih dahulu pada browser Anda sebelum menggunakan aplikasi!</h5>"
            );
            var modal = document.getElementById("myModal");
            modal.style.display = "block";
            var span = document.getElementById("tutup");
            span.style.display = "none";
        } 
    },

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

    riwayat: async()=> {
        await App.load();
        const history = await App.e_Sign.getRiwayat(App.account[0]);
        if(history.length == 0){
            $("#myTable").html(
                "<tr>" + 
                "<td colspan='3' class='text-center'><h5 class='text-danger'>Tidak ada riwayat</h5></td>" +
                "<tr>"
            );
        }else{
            for(var i=0; i<history.length; i++){
                var date = new Date(parseInt(history[i].timestamp));
                // Find a <table> element with id="myTable":
                var table = document.getElementById("myTable");

                // Create an empty <tr> element and add it to the 1st position of the table:
                var row = table.insertRow(i);

                // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);

                // Add some text to the new cells:
                cell1.innerHTML = i + 1;
                cell2.innerHTML = "<p>" + date.customFormat( "#DD# #MMMM# #YYYY# #hh#:#mm#:#ss# #AMPM#" ) + "</p>" + 
                                "<small class='text-muted'><i>" + history[i].signature + "</i></small>";
                cell3.innerHTML = history[i].perihal;
            }
            
        }
    }
}

$(document).ready(function(){
    App.validPage()    
    
    ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()        
    });        
})

function invalid(invalid) {
    $("#modalHead").html(
        "Error"
    );
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
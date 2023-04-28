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

    publikasi: async (perihal)=> {
        const cid = await App.e_Sign.getTtd(App.account[0]);
        var waktu = new Date().getTime();

        var hash = web3.utils.soliditySha3(cid, perihal, waktu);
        const signature = ethereum.request({ method: "personal_sign", params: [App.account[0], hash]})
        console.log(signature);
    }
}

$(document).ready(function(){
    App.load()

    const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzZmY4N2E5OC00NDAwLTQ4YTctOTFlMi00MTAzY2QxNWU5YmQiLCJlbWFpbCI6ImJpbHlhcHV0cmFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE1MDRmMzIwM2NmN2JjZGRjMjE2Iiwic2NvcGVkS2V5U2VjcmV0IjoiMjRiN2I0OTIzYWI2MDhmZGRkYTkzYWZjMDM0MzdjMGNjYjg5NWNiZTFkNzgzZTI0NTZiYmUwYmU1N2I1MmJjZiIsImlhdCI6MTY4MDgzNDc1OH0.OsPayjQ-eT9Na2mnS8pFzZ0ZCXPeX6WstmFWp5sxahE'
    const pinFileToIPFS = async (fileName, input, fitur) => {
			const formData = new FormData();

			formData.append('file', input)
			
			const metadata = JSON.stringify({
			name: fileName,
			});
			formData.append('pinataMetadata', metadata);
			
			const options = JSON.stringify({
			cidVersion: 0,
			})
			formData.append('pinataOptions', options);

			try{
                const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                    maxBodyLength: "Infinity",
                    headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    Authorization: JWT
                    }
                });
                // console.log(res.data);
                // console.log(res.data.IpfsHash)           
                if(fitur == "unggah"){
                    await App.e_Sign.setTtd(App.account[0], res.data.IpfsHash, {from:App.account[0]});
                    $("#responseText").html(
                        "<h5>Tanda tangan berhasil diunggah ke dalam jaringan Blockchain</h5>"
                    );
                    var modal = document.getElementById("myModal");
                    modal.style.display = "block";
    
                    var span = document.getElementsByClassName("close")[0];
                    span.onclick = function () {
                        modal.style.display = "none";
                        window.location.reload();
                    };
                }else{
                    console.log("ini fitur publikasi")
                }
                
            
			} catch (error) {
			console.log(error);
			}
		}

    
    
    $("#image").change(function (event) {
        input = $("#image")[0].files[0];
        pinFileToIPFS(input.name, input, "unggah");
    })

    $("#publikasi").click(function (event) {
        perihal = $("#perihal").val();
        App.publikasi(perihal);
    });

    ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()        
    });        
})
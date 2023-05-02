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
        const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
        const TEXT_QR = 'http://localhost:3000/validasi.html?signature='  
        const cid = await App.e_Sign.getTtd(App.account[0]);
        var waktu = new Date().getTime();

        var hash = web3.utils.soliditySha3(cid, perihal, waktu);
        // var hash = web3.utils.soliditySha3(perihal);
        const signature = await ethereum.request({ method: "personal_sign", params: [App.account[0], hash]}); 
        console.log(signature);
        //combine image
        // const img = await loadImage(IPFS_GATEWAY + cid);
        // var canvas = document.createElement('canvas');
        // var ctx = canvas.getContext('2d');

        // // Menggambar kode QR
        // var qr = new QRCode(canvas, {
        // text: TEXT_QR + signature,
        // width: img.height,
        // height: img.height,
        // colorDark: '#000000',
        // colorLight: '#ffffff',
        // correctLevel: QRCode.CorrectLevel.H
        // });

        // canvas.width = img.width + qr._el.firstChild.width;
        // canvas.height = img.height;
        // // Menggabungkan kode QR dan gambar di dalam satu canvas
        // ctx.drawImage(img, 0, 0);
        // ctx.drawImage(qr._el.firstChild, img.width, 0); // _el adalah elemen DOM asli dari QRCode.js
        // const combinedImage = canvas.toDataURL();

        // var imgElement = document.createElement('img');
        // imgElement.src = combinedImage;

        // var cidTtdQr = await fetch(combinedImage)
        // .then(res => res.blob())
        // .then(blob => {
        // const file = new File([blob], 'dot.png', blob)
        // return pinFileToIPFS("ttd+qr", file, "publikasi");
        // })
        // // console.log(cidTtdQr);
        // // //save data to blockchain
        // await App.e_Sign.setDataTtd(signature, perihal, cid, waktu, App.account[0], cidTtdQr, {from:App.account[0]});
        
        // //modal
        // $("#responseText").html(
        //     "<h5 class='text-success'>Tanda tangan berhasil dipublikasi ke dalam jaringan Blockchain</h5>" +
        //     "<img src='" + combinedImage + "' height='150px'>" +
        //     "<p>Hash Signature : " + signature + "</p>" +
        //     "<a href='" + IPFS_GATEWAY + cidTtdQr + "' target='blank'> <button type='button' class='btn btn-primary'>Unduh Ttd + Qr</button></a>"
        // );
        // var modal = document.getElementById("myModal");
        // modal.style.display = "block";

        // var span = document.getElementsByClassName("close")[0];
        // span.onclick = function () {
        //     modal.style.display = "none";
        //     window.location.reload();
        // };
    }
}

$(document).ready(function(){
    App.load()    
    
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

function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.setAttribute('crossorigin', 'anonymous');
      img.src = url;
    });
}

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
            return res.data.IpfsHash;
        }
                
            
	} catch (error) {
	    console.log(error);
	}
}
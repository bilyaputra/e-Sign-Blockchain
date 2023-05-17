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

    publikasi: async (perihal)=> {
        const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
        const TEXT_QR = 'http://localhost:3000/validasi.html?'  
        const cid = await App.e_Sign.getTtd(App.account[0]);
        if(cid == ""){
            invalid("ttd");
        }else{
            var time = new Date().getTime();
            var waktu = time.toString();

            var hash = web3.utils.soliditySha3(perihal, cid, waktu);
            const signature = await ethereum.request({ method: "personal_sign", params: [App.account[0], hash]}); 
            
            //combine image
            const img = await loadImage(IPFS_GATEWAY + cid);
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            // Menggambar kode QR
            var qr = new QRCode(canvas, {
            text: TEXT_QR + signature,
            width: img.height,
            height: img.height,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
            });

            canvas.width = img.width + qr._el.firstChild.width;
            canvas.height = img.height;
            // Menggabungkan kode QR dan gambar di dalam satu canvas
            ctx.drawImage(img, 0, 0);
            ctx.drawImage(qr._el.firstChild, img.width, 0); // _el adalah elemen DOM asli dari QRCode.js
            const combinedImage = canvas.toDataURL();

            var imgElement = document.createElement('img');
            imgElement.src = combinedImage;

            var cidTtdQr = await fetch(combinedImage)
            .then(res => res.blob())
            .then(blob => {
            const file = new File([blob], 'dot.png', blob)
            return pinFileToIPFS("ttd+qr", file, "publikasi");
            })
            // console.log(cidTtdQr);
            // //save data to blockchain
            await App.e_Sign.setDataTtd(signature, perihal, cid, waktu, App.account[0], cidTtdQr, {from:App.account[0]});
            
            //modal
            $("#modalHead").html(
                "Status Publikasi"
            )
            $("#responModal").html(
                "<h5 class='text-success'>Tanda tangan berhasil dipublikasi ke dalam jaringan Blockchain</h5>" +
                "<img src='" + combinedImage + "' height='150px'>" +
                "<p>Hash Signature : " + signature + "</p>" +
                "<a href='" + IPFS_GATEWAY + cidTtdQr + "' target='blank'> <button type='button' class='btn btn-primary'>Unduh Ttd + Qr</button></a>"
            );
            var modal = document.getElementById("myModal");
            modal.style.display = "block";

            var span = document.getElementsByClassName("close")[0];
            span.onclick = function () {
                modal.style.display = "none";
                window.location.reload();
            };
        }
    },

    validasi: async(signature)=> {
        const data = await App.e_Sign.getDataTtd(signature);
        
        if(data[0] == ""){
            invalid("false");
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
                invalid("false");
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
				}else if(signature == ""){
					invalid("kosong");
				}else{
                    invalid("false");
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

// $(document).ready(function(){
//     App.load()    
    
//     $("#image").change(function (event) {
//         input = $("#image")[0].files[0];
//         pinFileToIPFS(input.name, input, "unggah");
//     })

//     $("#publikasi").click(function (event) {
//         perihal = $("#perihal").val();
//         if(perihal.length == ""){
//             invalid(perihal);
//         }
//         else{
//             App.publikasi(perihal);
//         }
//     });

//     ethereum.on('accountsChanged', function (accounts) {
//         window.location.reload()        
//     });        
// })

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
            $("#modalHead").html(
                "Status Unggah"
            )
            $("#responModal").html(
                "<h5 class='text-success'>Tanda tangan berhasil diunggah ke dalam jaringan Blockchain</h5>"
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

function invalid(invalid) {
    $("#modalHead").html(
        "Error"
    );
    if(invalid == ""){
        $("#responModal").html(
            "<h5 class='text-danger'>Isi perihal terlebih dahulu sebelum menekan tombol Publikasi</h5>" 
        );
    }else if(invalid == "ttd"){
        $("#responModal").html(
            "<h5 class='text-danger'>Unggah tanda tangan terlebih dahulu sebelum menggunakan fitur ini!</h5>" 
        );
    }else if(invalid == "kosong"){
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
        if(invalid == "" || invalid == "ttd") {
            window.location.href="publikasi.html";
        }else if(invalid == "kosong"){
            window.location.href="validasi.html";
        }else{
            window.location.href="validasi.html";
        }
        
    };
}
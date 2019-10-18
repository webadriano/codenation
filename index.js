const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const sha1 = require('sha1')

const file = 'answer.json'
const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const baseUrl = 'https://api.codenation.dev/v1/challenge/dev-ps'
const token = '506b54355e4e8a04f07fad026a7d2a36750f2062'


async function createFile() {
    let { data } = await axios.get(`${baseUrl}/generate-data?token=${token}`)
    let { numero_casas, cifrado } = data

    let decifrado = converter(cifrado, numero_casas)
    data.decifrado = decifrado
    data.resumo_criptografico = sha1(decifrado)
    fs.writeFile(
        file,
        JSON.stringify(data),
        err => err ? err : sendFile()
    )
}

function converter(frase, numeroDeCasas) {
    let mapCode = []
    let fraseNum

    for (var i in frase) {
        if (frase[i] === ' ' || frase[i] === '.') {
            mapCode.push(frase[i])
        } else {
            fraseNum = alfabeto.indexOf(frase[i].toUpperCase()) - numeroDeCasas
            if(fraseNum < 0 ) {
                fraseNum = 26 - Math.abs(fraseNum)
            }
            
            mapCode.push(alfabeto.charAt(fraseNum))
        }
    }

    return mapCode.join('').toLowerCase();
}

async function sendFile() {
    let form = new FormData()
    form.append('answer', fs.createReadStream(file), {
        filename: file
    })

    let { data } = await axios.create({
        headers: form.getHeaders() 
    }).post(`${baseUrl}/submit-solution?token=${token}`, form)

    console.log(data)
}

if (!fs.existsSync(file)) {
    createFile()
} else {
    sendFile()
}
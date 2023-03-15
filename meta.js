const bodyParser = require('body-parser')
const express = require('express');

const moment = require('moment')
const axios = require('axios')
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var date = moment();
let fromDate = date.format('MM D YYYY');
fromDate = '03 03 2023'

const findTransaction = async (address, fromDate) => {
    try {
        // Fetching the transactions which happened today
        let URL = `https://deep-index.moralis.io/api/v2/` + process.env.OWNERADDRESS + `?chain=` + process.env.CHAIN + `&from_date=` + fromDate
        return await axios
            .get(URL,
                {
                    "headers": {
                        'X-API-Key': process.env.APIKEY,
                        "accept": "application/json"
                    }
                })
            .then((val) => {
                // Looping and matching the fromaddress which is 
                // coming in request to verify if any transaction happend
                let data = val.data.result;
                for (var i = 0; i < data.length; i++)
                    // if transaction exists return it
                    if (data[i].from_address === address) {
                        console.log(data[i]);
                        // send to API for submission to DB
                        return sendToAPI(data[i])
                    }
                return []
            })
            .catch((error) => console.log(error.message))
    } catch (e) {
        console.log(e);
    }
};

app.post("/findTransaction", async (req, res) => {

    try {
        // set intervals for checking
        setInterval(() => {
            findTransaction(req.body.address, fromDate)
        }, process.env.DELAYINSECONDS)

        setInterval(() => {
            findTransaction(req.body.address, fromDate)
        }, parseInt(process.env.DELAYINSECONDS) + parseInt(process.env.DELAYINSECONDS))

        setInterval(() => {
            findTransaction(req.body.address, fromDate)
        }, parseInt(process.env.DELAYINSECONDS) + parseInt(process.env.DELAYINSECONDS) + parseInt(process.env.DELAYINSECONDS))

        res.send({ msg: true })
    } catch (e) {
        res.send({ msg: false, response: e })
    }

})

app.get('/', (req, res) => {
    res.send({ msg: "Hari" })
})

app.listen(8080, (error) => {
    if (!error)
        console.log("Server is Successfully Running")
    else
        console.log("Error occurred, server can't start", error);
});

const sendToAPI = async (data) => {
    await axios
        .post(process.env.DB_URL,
            {
                "key": process.env.appKEY,
                "data": JSON.stringify(data)
            })
        .then((val) => {
            // Looping and matching the fromaddress which is 
            // coming in request to verify if any transaction happend
            console.log(val.data);
        })
        .catch((error) => console.log(error.message))
}
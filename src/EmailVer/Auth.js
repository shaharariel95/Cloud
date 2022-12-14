const node = require("nodemailer")
const smtp = require("nodemailer-smtp-transport")
const otpGenerator = require('otp-generator')
const fs = require('fs')
const ejs = require("ejs");
const JSON = require("JSON")
const list = require("./OTP-pass.json")

// compare emails func
function StrCompare(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    return str1 === str2;
}

const verEmail = async function verEmail(email) {
    //parses the Postman JSON
    let mail = JSON.parse(email)
    //create an OTP Code
    let OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})

    //puts the ejs file into a var (the email structure)
    const data = await ejs.renderFile(__dirname + "/test.ejs", {name: 'Stranger', code: OTP});

    //the mailing metadata
    const mainOptions = {
        from: 'IamShenkar@gmail.com',
        to: mail.emailId,
        subject: 'Please Verify you Account',
        // text: 'Your OTP is: ' + OTP
        html: data
    };

    // the transport metadata
    const transporter = node.createTransport(smtp({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'IamShenkar@gmail.com',
            pass: 'vghbaugbqhwxfktf'
        }
    }));
    let json

    // checks if email already exists
    try{
        list.table.forEach(function (i) {
            if (StrCompare(JSON.stringify(i.mail), JSON.stringify(mainOptions.to))) {
                throw "Email already exists";
            }
        })
    } catch (err) {
        return console.log(err)
    }

    // puts the new email into the list
    list.table.push({mail: mainOptions.to, code: OTP});

    json = JSON.stringify(list)
    fs.writeFile("./OTP-pass.json", json, 'utf-8', callback => {
        console.log("wrote file successfully")
    })

    //send the mail with the OTP to the client email
    await transporter.sendMail(mainOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response + "\nwith OTP: " + OTP);
        }
    });
}


module.exports = {verEmail: verEmail}
// let a = verEmail("shaharariel95@gmail.com")

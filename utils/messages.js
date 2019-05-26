const moment=require('moment')
const generateMessage=(username, msg)=>{
    const message= {
        msg,
        createdAt: moment(Date.now()).format('h:mm a') ,
        username
    }
    return message;
}

module.exports={generateMessage};
const moment = require('moment');

var generateMessage = (from, text) =>{
  return{
    from,
    text,
    createdAt: moment().valueOf()
  };
};

var generateBotMessage = (from, text) =>{
  // var val;
  if(text ==='what services do you offer'){
    text = `I can provide the following services:
            1. You want to take up any quiz.
            2. Tell you the class timings and many more`;
  }
  // else if(text.contai === "")
  return{
    from,
    text,
    createdAt: moment().valueOf()
  };
};

var generateLocationMessage = (from, lat, long) =>{
  return {
    from,
    url:`https://www.google.com/maps?q=${lat},${long}`,
    createdAt: moment().valueOf()
  }
};

module.exports = {generateMessage, generateLocationMessage, generateBotMessage};

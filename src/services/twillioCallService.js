const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.initiateCall = async (phoneNumber) => {
  return client.calls.create({
    url: `${process.env.BASE_URL}/call/answer`,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
    machineDetection: 'Enable',
    statusCallback: `${process.env.BASE_URL}/call/status`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
  });
};

exports.sendSMS = async (to, body) => {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
};
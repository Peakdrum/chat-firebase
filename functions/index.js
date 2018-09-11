const functions = require('firebase-functions');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase)

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});



exports.sms = functions.https.onRequest((req, res) => {
  const twiml = new MessagingResponse();
  
  const textMessage = req.body.Body
  const fromNumber = req.body.From
  admin.database()
    .ref('chat')
    .orderByChild("phone")
    .equalTo(fromNumber)
    .limitToFirst(1)
    .once("value", 
      snap => Object.keys(snap.val()).map(
        key => saveToFirebase(key, snap.val()[key], textMessage)
      )
    )
  twiml.message('The Robots are coming! Head for the hills!');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
})


const saveToFirebase = (key, chat, textMessage) => {

  const newChatHistory = [].concat(chat.chatHistory).concat({
    context:textMessage,
    sender: chat.name,
    dateAdded: Date.now(),
    type:'text'
  })

  const newChat = Object.assign({}, chat, {chatHistory: newChatHistory})
  
  admin.database()
    .ref('chat/'+key)
    .set(newChat)
}
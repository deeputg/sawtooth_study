/* Creates custom event subscription to application specific events */
/* event alerts when a word of length between 5 and 9 is submitted */

const {
    Message,
    EventFilter,
    EventList,
    EventSubscription,
    ClientEventsSubscribeRequest,
    ClientEventsSubscribeResponse
  } = require('sawtooth-sdk/protobuf');

const { TextDecoder } = require('text-encoding/lib/encoding')
var decoder = new TextDecoder('utf8')

const {Stream} = require("sawtooth-sdk/messaging/stream")

const VALIDATOR_URL = "tcp://validator:4004"





// returns the subscription request status 
function checkStatus(response){
        let msg = ""
        if (response.status === 0){
                msg = 'subscription : OK'
        } else if (response.status === 1){
                msg = 'subscription : GOOD '
        } else {
                msg = 'subscription failed !'
        }
        return msg
}
        

//event message handler 
function getEventsMessage(message){
        // Write your event handling code here
        let eventlist = EventList.decode(message.content).events  
        eventlist.map(function(event){
                if(event.eventType == 'HelloWorld/WordLength') { 
                console.log("Event", event);
                console.log(event.data.toString());
                 
                } 
        })
}


function EventSubscribe(URL){
        // Write your code here
        console.log("Inside here"+URL);
        let stream = new Stream(URL)

        const blockCommintEventSubscription = EventSubscription.create({
                eventType : 'sawtooth/block-commit'

        }) 
        const wordLengthSubscription = EventSubscription.create({ 
                eventType: 'HelloWorld/WordLength' ,
                filters: [EventFilter.create({
                        key:'message_length',
                        matchString:'^[5-9]\d*$',
                        filterType:EventFilter.FilterType.REGEX_ANY
                })
                ]
       })
        const eventSubscriptionRequrest = ClientEventsSubscribeRequest.encode({
                subscriptions:[blockCommintEventSubscription,wordLengthSubscription]
        }).finish()

        stream.connect(()=>{
                console.log("entered in call back function");
                stream.send(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,eventSubscriptionRequrest).then((response) =>{
                        console.log("entered hereeeeee");
                        return ClientEventsSubscribeResponse.decode(response)
                }).then((decoded_respose)=>{
                        console.log("This is the respose check kkkkkkkkkkkkkkkkkkkk"+checkStatus(decoded_respose));
                        
                })
                stream.onReceive(getEventsMessage)
        })
}


EventSubscribe(VALIDATOR_URL);
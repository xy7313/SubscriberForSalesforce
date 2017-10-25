var jsforce = require('jsforce');
var ramda = require('ramda');
var EventEmitter = require('events');
const emitter = new EventEmitter();
exports.subscriptionEmitter= emitter;

var pushTopicQuery = `Select 
ID,Name,Event_Created_Date__c,Event_Message__c,Event_Name__c,Event_Replay_ID__c,Event_Type__c 
FROM
Sync_Platform_Event_Log__c 
WHERE
createddate != null 
`

var pushTopic = {
    Name: 'Sales_Order_Event__e',
    Query: pushTopicQuery,
    ApiVersion: 41.0,
    NotifyForFields: 'Referenced',
    NotifyForOperationCreate: true,
    NotifyForOperationUpdate: true,
    NotifyForOperationDelete: true,
    NotifyForOperationUndelete: true
}

var conn;
var subscribeToPushTopic = function () {
    console.log('subscribeToPushTopic...');
    var streaming = ramda.prop('streaming', conn);
    var topic = streaming.topic(pushTopic.Name);
    console.log('topic: ', topic);
    topic.subscribe(function (message) {  
        console.log(message);
        return emitter.emit(pushTopic.Name, message);
    });
    console.log("Subscribed to " + pushTopic.Name);
    log_1.default.info("Subscribed to " + pushTopic.Name);
};

var verifyPushTopicExists = function () {
    console.log('conn: ', conn);
    if (conn) {
        conn.sobject('PushTopic').find({ Name: pushTopic.Name }).execute(function (err, records) {
            if (err) {
                console.log('if err:', err);
                emitter.emit('error', err);
            }
            subscribeToPushTopic();
        });
 
    }
};

 //setup connection
var loginToSalesforce = function () {
    conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl: 'https://test.salesforce.com'
    });
    conn.login('acc', 'pwd+sec', function (err, res) {
        if (err) { return console.error(err); }
        conn.query('SELECT Id, Name FROM Account', function (err, res) {
            if (err) { return console.error(err); }
            console.log(res);
            console.log('conn.query conn: ', conn);
            verifyPushTopicExists();
        });
    });
};
loginToSalesforce();
   
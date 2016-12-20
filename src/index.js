'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');

var cache = { "time" : Date.now(), "value" : "empty"};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetUpliftingNews');
    },
    'IntentRequest': function () {
        this.emit('GetUpliftingNews');
    },
    'SessionEndedRequest': function () {},
    'GetUpliftingNews': function () {
        var reference = this;

        var getNonAdminPostEmitted = function(res) {
            var numberOfPosts = (res.data.children).length;
            var randomPostIndex = Math.floor(Math.random() * (numberOfPosts));
            var retryCount = 0;
            var post = res.data.children[randomPostIndex];

            while (retryCount <= 10) {
                if (post.data.domain != 'self.UpliftingNews') {
                    var speechOutput = post.data.title + ". For more information, please visit the Uplifting News subreddit.";
                    reference.emit(':tell', speechOutput);
                    break;
                } else {
                    console.warn("Non-admin post not found. Retrying...");
                    post = res.data.children[Math.floor(Math.random() * (numberOfPosts))];
                    if (retryCount >= 10) {
                        reference.emit(':tell', "I could not find uplifting news for you, sorry.");
                    }
                }
            }
        };

        var timeDifference = Date.now() - cache.time;

        if(cache.value == "empty" || timeDifference > 86400000) {
            request('https://www.reddit.com/r/upliftingnews/hot.json?sort=hot', function (error, response, body) {
                console.log("Querying reddit...");

                if (!error && response.statusCode == 200) {
                    var res = JSON.parse(body);

                    //Cache response
                    cache.value = res;
                    cache.time = Date.now();

                    getNonAdminPostEmitted(res);
                } else {
                    console.error("Error reaching service");
                    reference.emit(':tell', "I could not find uplifting news for you, sorry.");
                }
            });
        } else {
            console.log("Value is in the cache. Emitting post.");
            getNonAdminPostEmitted(cache.value);
        }
    },
    'Unhandled': function () {
        this.emit(':tell', "I am sorry, but I am not sure what you asked me.");
    },
    'undefined': function () {
        this.emit(':tell', "I am sorry, but I am not sure what you asked me.");
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = "OMITTED";
    alexa.registerHandlers(handlers);
    alexa.execute();
};

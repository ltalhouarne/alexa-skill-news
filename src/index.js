'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetUpliftingNews');
    },
    'IntentRequest': function () {
        this.emit('GetUpliftingNews');
    },
    'SessionEndedRequest': function () {
        return;
    },
    'GetUpliftingNews': function () {
        var reference = this;

        request('https://www.reddit.com/r/upliftingnews/hot.json?sort=hot', function (error, response, body) {
            console.log("Querying reddit...");

            if (!error && response.statusCode == 200) {
                var res = JSON.parse(body);
                var numberOfPosts = (res.data.children).length;

                console.log("Query successful: " + numberOfPosts + " posts returned.");

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
            } else {
                console.error("Error reaching service");
                reference.emit(':tell', "I could not find uplifting news for you, sorry.");
            }
        });
    },
    'Unhandled': function () {
        this.emit(':tell', "I am sorry, but I am not sure what you asked me.");
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = "amzn1.ask.skill.60f22f23-ea8e-4674-b9d1-3f25f5f8346f";
    alexa.registerHandlers(handlers);
    alexa.execute();
};

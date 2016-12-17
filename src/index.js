'use strict';

const Alexa = require('alexa-sdk');
const http = require('request');

const APP_ID = "amzn1.ask.skill.60f22f23-ea8e-4674-b9d1-3f25f5f8346f";

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetUpliftingNews');
    },
    'GetUpliftingNews': function () {
        this.emit('GetUpliftingNews');
    },
    'GetNews': function () {
        request('https://www.reddit.com/r/upliftingnews/hot.json?sort=hot', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var res = JSON.parse(body);
                var numberOfPosts = (res.data.children).length;
                var randomPost = Math.floor(Math.random() * (numberOfPosts));
                var retryCount = 0;
                var post = res.data.children[randomPost];

                while(retryCount <= 10){
                    if(post.data.domain != 'self.UpliftingNews'){
                        break;
                    } else {
                        post = res.data.children[Math.floor(Math.random() * (numberOfPosts))];
                    }
                }
            }
        });

        this.emit(':tell', post.data.title + ". For more information, please visit the UpliftingNews subreddit.");
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

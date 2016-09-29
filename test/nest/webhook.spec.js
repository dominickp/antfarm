var should = require('chai').should();
var Antfarm = require('./../../lib/antfarm');

describe('Nest Webhook', function() {

    var options = {log_out_level: "error"};
    var af, tunnel, tmpobj;

    beforeEach(function() {
        af = new Antfarm(options);
        tunnel = af.createTunnel("Nest testing");
    });

    describe('path', function() {
        it('should accept a string as the path and add a /', function() {
            var wh = af.createWebhookNest("path1");
            wh.getPath().should.not.be.empty;
            wh.getPath().should.equal("/path1");
        });
        it('should encode unsafe URI characters', function() {
            var wh = af.createWebhookNest("path&&11 something");
            wh.getPath().should.equal("/path%26%2611%20something");
        });
        it('should accept an array of URI components', function() {
            var wh = af.createWebhookNest(["path1", "path2", "path 3"]);
            wh.getPath().should.equal("/path1/path2/path%203");
        });
    });

    describe('http method', function() {
        it('should default the http method to all', function() {
            var wh = af.createWebhookNest("path1");
            wh.getHttpMethod().should.not.be.empty;
            wh.getHttpMethod().should.equal("all");
        });
        it('should be changeable in the constructor', function() {
            var wh = af.createWebhookNest("path1", "get");
            wh.getHttpMethod().should.equal("get");
        });
        it('should convert to lowercase', function() {
            var wh = af.createWebhookNest("path1", "POST");
            wh.getHttpMethod().should.equal("post");
        });
        it('should allow any valid http method', function(done) {
            var acceptableMethods = [ "get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect", "all" ];

            acceptableMethods.forEach(function(method){
                var wh = af.createWebhookNest("path1", method.toUpperCase());
                wh.getHttpMethod().should.equal(method);
            });
            done();
        });
    });


});


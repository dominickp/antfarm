var should = require("chai").should();
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');
//var mock = require('mock-fs');


xdescribe('Tunnels', function() {

    var af, tempFolderCleanupCallback;

    beforeEach("make antfarm, tunnel, and nest", function(done) {
        var tmpDir = tmp.dirSync({unsafeCleanup: true});
        af = new Antfarm({
            log_out_level: "error",
            auto_managed_folder_directory: tmpDir.name
        });
        tempFolderCleanupCallback = tmpDir.removeCallback;
        done();
    });

    afterEach("remove temporary file", function(){
        tempFolderCleanupCallback();
    });

    it('should get the tunnel _name', function () {
        var tunnel_name = "Test tunnel 123";
        var tunnel = af.createTunnel(tunnel_name);
        var nest = af.createAutoFolderNest("test-nest");
        tunnel.watch(nest);

        tunnel.name.should.equal(tunnel_name);
    });

    it('should add a run callback to the run list', function () {
        var tunnel = af.createTunnel("Test tunnel");

        tunnel.run(function(){});
        tunnel.runList.length.should.equal(1);
    });

    it('should add multiple run callbacks to the run list', function () {
        var tunnel = af.createTunnel("Test tunnel");

        tunnel.run(function(){});
        tunnel.run(function(){});
        tunnel.run(function(){});
        tunnel.runList.length.should.equal(3);
    });

    it('should execute a run callback', function () {
        var tunnel = af.createTunnel("Test tunnel");

        var myObj = {num: 0};
        var myString = "";
        tunnel.run(function(){
            myObj.num++;
            myString = "Something";
        });
        tunnel.executeRun(); // force run

        myObj.num.should.equal(1);
        myString.should.equal("Something");
    });

    describe('Nests', function() {

        // var tunnel = af.createTunnel("Test tunnel");

        var folder1, folder2;
        var tmpDir;

        beforeEach(function(done) {
            var tmpDir = tmp.dirSync({unsafeCleanup: true});
            af = new Antfarm({
                log_out_level: "error",
                auto_managed_folder_directory: tmpDir.name
            });
            tempFolderCleanupCallback = tmpDir.removeCallback;

            folder1 = af.createAutoFolderNest("folder-1");
            folder2 = af.createAutoFolderNest("folder-2");

            tmp.dir({ unsafeCleanup: true }, function(err, dir) {
                // if (err) return done(err);
                tmpDir = dir;
                setTimeout(done, 300);
            });
        });

        it('should be able to watch nests', function() {
            var tunnel = af.createTunnel("Test tunnel");

            tunnel.watch(folder1);
            tunnel.nests.length.should.be.equal(1);

            tunnel.watch(folder2);
            tunnel.nests.length.should.be.equal(2);
        });

        it('should run on a nest arrival when watching', function(done) {
            var tn = af.createTunnel("Watch tunnel");
            var nest = af.createAutoFolderNest("whatever123");
            tn.watch(nest);

            var obj = {num:0};

            tn.runSync(function(job){
                obj.num++;
                job.name.should.equal("dummy.tmp");
            });

            tn.runSync(function(){
                obj.num.should.equal(1);
            });

            var temp_file_path = nest.path + path.sep + "dummy.tmp";
            fs.writeFileSync(temp_file_path, "Some dummy data.");
            fs.unlinkSync(temp_file_path);

            done();
        });

    });


});

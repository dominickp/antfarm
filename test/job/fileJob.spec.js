var should = require('chai').should();
var expect = require('chai').expect;
var Job = require('./../../lib/job/job');
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('FileJob', function() {

    var options = {
        log_out_level: "error",
    };
    var af, tunnel, tmpDir, nest, temp_file_path;

    before("make temporary log directory", function(done){
        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            if (err) return done(err);
            setTimeout(function(){
                options.log_dir = dir;
                done()
            }, 300);
        });
    });

    beforeEach("make antfarm, tunnel, and nest", function(done) {

        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            af = new Antfarm(options);
            tunnel = af.createTunnel("Test tunnel");

            options.auto_managed_folder_directory = dir;

            if (err) return done(err);
            tmpDir = dir;
            setTimeout(function(){
                nest = af.createFolderNest(dir);
                tunnel.watch(nest);

                done()
            }, 100);
        });
    });

    afterEach("remove temporary file", function(){
        fs.unlinkSync(temp_file_path);
    });

    // Function to add a new job to the watched nest
    var triggerNewJob = function(name){
        temp_file_path = tmpDir + path.sep + name;
        fs.writeFileSync(temp_file_path, "Some dummy data.");
    };

    it('should get the size of the file', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            expect(job.size).not.to.be.undefined;
            job.size.should.equal("16 B");
            job.sizeBytes.should.equal(16);
            done();
        });

        triggerNewJob(job_name);
    });


});


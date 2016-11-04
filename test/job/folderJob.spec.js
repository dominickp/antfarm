var should = require('chai').should();
var expect = require('chai').expect;
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('FolderJob', function() {

    var options = {
        log_out_level: "error",
    };
    var af, tunnel, tmpDir, nest, tempJobDir;

    before("make temporary log directory", function(done){
        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            if (err) return done(err);
            setTimeout(function(){
                options.log_dir = dir;
                done()
            }, 600);
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
            }, 400);
        });
    });

    afterEach("remove temporary file", function(){
        deleteFolderRecursive(tempJobDir);
    });

    var deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file) {
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    // Function to add a new job to the watched nest
    var triggerNewFolderJob = function(name, files){
        tempJobDir = tmpDir + path.sep + name;
        fs.mkdirSync(tempJobDir);

        files.forEach(function(file) {
            fs.writeFileSync(tempJobDir + path.sep + file, "Some dummy data.");
        });
    };

    it('should produce folder jobs', function (done) {
        var job_name = "My job folder";
        tunnel.run(function(job){
            expect(job.isFolder()).not.to.be.undefined;
            job.isFolder().should.equal(true);
            expect(job.isFile()).not.to.be.undefined;
            job.isFile().should.equal(false);
            done();
        });

        triggerNewFolderJob(job_name, ["this.pdf", "that.pdf"]);
    });


});


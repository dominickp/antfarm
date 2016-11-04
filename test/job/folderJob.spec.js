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
        tmp.dir({ unsafeCleanup: true }, function(err, logDir) {
            if (err) return done(err);
            setTimeout(function(){
                options.log_dir = logDir;
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
                nest = af.createAutoFolderNest("general-input");
                tunnel.watch(nest);

                done()
            }, 100);
        });
    });

    afterEach("remove temporary file", function(done){
        deleteFolderRecursive(tempJobDir, function() {
            done();
        });
    });

    var deleteFolderRecursive = function(path, callback) {
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
        callback();
    };

    // Function to add a new job to the watched nest
    var triggerNewFolderJob = (name, files) => {
        tempJobDir = nest.path + path.sep + name;
        fs.mkdirSync(tempJobDir);

        files.forEach(function(file) {
            fs.writeFileSync(tempJobDir + path.sep + file, "Some dummy data.");
        });
    };

    it('should produce folder jobs with basic properties', done => {
        var job_name = "My job folder";
        tunnel.run(job => {
            expect(job.isFolder()).not.to.be.undefined;
            job.isFolder().should.equal(true);
            expect(job.isFile()).not.to.be.undefined;
            job.isFile().should.equal(false);
            job.name.should.equal(job_name);
            job.nameProper.should.equal(job_name);
            done();
        });

        triggerNewFolderJob(job_name, ["this.pdf", "that.pdf"]);
    });

    describe('files within the folder', () => {

        var assertFolderFiles = (sourceJob, antfarmJob, callback) => {
            expect(antfarmJob.files).not.to.be.undefined;
            antfarmJob.files.length.should.equal(sourceJob.files.length);
            antfarmJob.files.forEach((file, i) => {
                file.name.should.equal(sourceJob.files[i]);
            });
            callback();
        };

        it("should contain a single file", done =>{
            var job1 = {name: "My job folder 1", files: ["a brochure.pdf"]};
            tunnel.run(job => {
                assertFolderFiles(job1, job, () => { done(); });
            });
            triggerNewFolderJob(job1.name, job1.files);
        });

        it("should contain a multiple files", done => {
            var job1 = {name: "My job folder 3", files: ["1.zip", "2.pdf", "3.png", "4.jpg", "5.rar", "6.tar.gz"]};
            tunnel.run(job => {
                assertFolderFiles(job1, job, () => { done(); });
            });
            triggerNewFolderJob(job1.name, job1.files);
        });

    });

    xit('should be movable to another nest', done => {
        var job1 = {name: "My job folder to be moved", files: ["a brochure.pdf"]};


        var other_nest1 = af.createAutoFolderNest("another_folder_123");
        var other_tunnel1 = af.createTunnel("Another new tunnel");
        other_tunnel1.watch(other_nest1);

        tunnel.run((originalJob, nest) => {
            console.log("path", originalJob.path, "- arrived in", nest.name);
            originalJob.move(af.createAutoFolderNest("Whatever"), function() {
                // moved
            });
        });


        other_tunnel1.run(movedJob => {
            console.log("GOT", movedJob.path);
            movedJob.name.should.equal(job1.name);
            done();
        });

        triggerNewFolderJob(job1.name, job1.files);
    });

    xit('should be transferable to another tunnel', done => {
        var job1 = {name: "My job folder 1", files: ["a brochure.pdf"]};
        var other_tunnel = af.createTunnel("Another tunnel");

        tunnel.run(originalJob => {
            originalJob.move(other_tunnel);
        });

        other_tunnel.run(transferredJob => {
            transferredJob.name.should.equal(job1.name);
            done();
        });

        triggerNewFolderJob(job1.name, job1.files);
    });


});


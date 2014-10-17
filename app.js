var scp = require('scp'),
    sha1 = require('sha1'),
    fs = require('fs'),
    path = require('path'),
    clipboard = require("copy-paste").global(),
    notifier = require('node-notifier'),
    gaze = require('gaze');

// Should be moved to config file
var screenshotDirectory = '/Users/philipp/Desktop/';
var screenshotDirectoryArchive = '/Users/philipp/Documents/Developement/Node/ScreenUpload/tmp/'
var scpUser = 'dewey';
var scpHost = 'notmyhostna.me';
var scpPort = '22';
var scpRemotePath = '/var/www/img.notmyhostna.me/';
var scpRemoteURL = 'https://img.notmyhostna.me/';
// End of config
// 
console.log("Start ScreenUpload script")

// Watch provided path from config for new files matching the screenshot default name.
gaze('Screen\ Shot *.png', {
    cwd: screenshotDirectory
}, function(err, watcher) {
    if (err) {
        console.log("Error watching folder")
        console.log(err)
    } else {
        // Watch for 'added' event
        this.on('added', function(filepath) {
            // Create temp file name for uploading and move to archive.
            var imageName = sha1(filepath);
            var imageNameNew = imageName + path.extname(filepath);
            var filepathNew = screenshotDirectoryArchive + imageNameNew;
            var imageRemoteURL = scpRemoteURL + imageNameNew;
            console.log("Rename file")
            fs.renameSync(filepath, filepathNew)

            // Upload file
            scp.send({
                file: 'tmp/' + imageNameNew,
                user: scpUser,
                host: scpHost,
                port: scpPort,
                path: scpRemotePath
            }, function(err) {
                if (err) {
                    console.log("Uploading error")
                    console.log(err);
                } else {
                    console.log("Uploading successful")
                    // Copy to clipboard
                    copy(imageRemoteURL);

                    notifier.notify({
                        'title': 'ScreenUpload',
                        'message': 'Upload finished.'
                    });
                }
            });
        });
    }
});
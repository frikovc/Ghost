var config  = require('../config'),
    Promise = require('bluebird'),
    fs      = require('fs-extra'),
    storage = require('../storage'),
    errors  = require('../errors'),
    utils   = require('./utils'),
    path    = require('path'),

    upload;

/**
 * ## Upload API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
upload = {

    /**
     * ### Add Image
     *
     * @public
     * @param {{context}} options
     * @returns {Promise} Success
     */
    add: function (options) {
        var store = storage.getStorage(),
            filepath;

        // Check if a file was provided
        if (!utils.checkFileExists(options, 'uploadimage')) {
            return Promise.reject(new errors.NoPermissionError('Please select an image.'));
        }

        // Check if the file is valid
        if (!utils.checkFileIsValid(options.uploadimage, config.uploads.contentTypes, config.uploads.extensions)) {
            return Promise.reject(new errors.UnsupportedMediaTypeError('Please select a valid image.'));
        }

        filepath = options.uploadimage.path;

        return store.save(options.uploadimage).then(function (url) {
            return url;
        }).finally(function () {
            // Remove uploaded file from tmp location
            return Promise.promisify(fs.unlink)(filepath);
        });
    },

    /**
     * ### Browse
     */
    browse: function browse() {
        console.log('api/upload.js > browse controller');
        var appRoot = path.resolve(__dirname, '../../../');
        var baseImagePath = path.resolve(appRoot, 'content/images');
        var ext = ['jpg', 'png'];
        var extPattern = /\.(jpg|png|gif)\b/;

        return Promise.resolve({
            kaboom: 'server kabooooooom',
            appRoot: appRoot,
            baseImagePath: baseImagePath,
            files: getFiles(baseImagePath, false, extPattern)

        });

        // return Promise.resolve({paths: _.map(getValidKeys(), function (value, key) {
        //     return {
        //         key: key,
        //         value: value
        //     };
        // })});


    },
};


function getFiles (dir, files_, extPattern){
    files_ = files_ || {
        dirName: 'root',
        subdir: [],
        files: []
    };
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            var latest = files_.subdir.push({
                dirName: files[i],
                subdir:[],
                files:[]
            });
            getFiles(name, files_.subdir[ latest - 1 ], extPattern);
        } else {
            if(path.extname(files[i]).match(extPattern))
                files_.files.push(name);
            // if(path.extname(files[i]) === '.' + ext)
            //     files_.push(name);
        }
    }
    return files_;
}

module.exports = upload;

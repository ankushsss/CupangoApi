const multer = require('multer');
const {
    nanoid
} = require('nanoid');
var path = require('path')
exports.saveMedia = (req, res) => {
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, "./src/userimages/");
        },
        filename: (req, file, callback) => {
            callback(null, nanoid() + file.originalname);
        }
    });


    const upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            console.log(ext);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return callback(new Error('Only images are allowed'))
            }
            callback(null, true)
        },
        limits: {
            fileSize: 1024 * 1024
        }
    }).any('file');

    upload(req, res, (err) => {
        //console.log(err);
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: err
            });
        }
        let results = req.files.map((file) => {
            return {
                mediaName: file.filename,
                origMediaName: file.originalname,
                mediaSource: process.env.HOST_URL + "/api/v1/images/" + file.filename
            }
        });
        res.status(200).json(results);
    });
}


exports.getImg = (req, res) => {
    res.sendFile(require('path').dirname(require.main.filename) + '/userimages/' + req.params.id);
}
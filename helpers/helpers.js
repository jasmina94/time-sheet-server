const helpers = {
    makeRandomPassword,
    queryData,
    readFile,
    writeFile
};
const dataPath = './data/random.json';

function makeRandomPassword(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
};

function queryData(data, limit = 3, page = 1) {
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page))
        page = 1;
    if (isNaN(limit))
        limit = 3;

    let numOfPages = Math.ceil(data.length / limit);
    let from = limit * (page - 1);

    data = data.slice(from, from + limit);

    return { data, numOfPages };
}

function readFile(fs, callback, returnJson = false, filePath = dataPath, encoding = 'utf8') {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }

        callback(returnJson ? JSON.parse(data) : data);
    });
}

function writeFile(fs, fileData, callback, filePath = dataPath, encoding = 'utf8') {
    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }

        callback();
    });
}

module.exports = helpers;
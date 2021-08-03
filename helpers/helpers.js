const helpers = {
    makeRandomPassword,
    queryData,
    readFile,
    writeFile,
    matchClient,
    matchProject,
    matchClientByName,
    matchProjectByName
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

/**
 * Method for quering entites.
 * 
 * @param {*} data = all data from scope.
 * @param {*} queryTerm = search term.
 * @param {*} criteria = expession for filter method.
 * @param {*} limit = number of data to be returned per page.
 * @param {*} page = number of requested page.
 * @returns 
 *  { 
 *      data = collection of items from certain scope filtered by term or not,
 *      numberOfPages = total number of pages with current page and limit in consideration
 *  }
 */
function queryData(data, queryTerm = '', criteria = null, limit = 3, page = 1) {
    if (queryTerm)
        data = data.filter(x => criteria(x, queryTerm))
        
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page))
        page = 1;
    if (isNaN(limit))
        limit = 3;
    
    
    let numOfPages = Math.ceil(data.length / limit);
    let from = limit * (page - 1);
    let total = data.length;

    data = data.slice(from, from + limit);

    return { data, numOfPages, total };
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

function matchClient(client, term) {
    let match = false;
    if (client.name.toLowerCase().indexOf(term) !== -1
        || client.zip.toLowerCase().indexOf(term) !== -1
        || client.address.toLowerCase().indexOf(term) !== -1
        || client.city.toLowerCase().indexOf(term) !== -1
        || client.country.toLowerCase().indexOf(term) !== -1) {
        match = true;
    }

    return match;
}

function matchProject(project, term) {
    let match = false;
    if (project.name.toLowerCase().indexOf(term) !== -1
        || project.description.toLocaleLowerCase().indexOf(term) !== -1
        || project.customer.name.toLocaleLowerCase().indexOf(term) !== -1) {
        match = true;
    }

    return match;
}

function matchClientByName(client, letter) {
    let match = false;
    letter = letter.toLocaleLowerCase();
    if (client.name.toLocaleLowerCase().startsWith(letter))
        match = true;

    return match;
}

function matchProjectByName(project, letter) {
    let match = false;
    letter = letter.toLocaleLowerCase();

    if (project.name.toLocaleLowerCase().startsWith(letter)
        || project.description.toLocaleLowerCase().startsWith(letter))
        match = true;

    return match;
}

module.exports = helpers;
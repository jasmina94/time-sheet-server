const helpers = {
    makeRandomPassword,
    queryData,
};

function makeRandomPassword(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
};

function queryData(data, limit, page) {
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page))
        page = 1;
    if (isNaN(limit))
        limit = 3;

    let numOfPages = Math.ceil(data.length / limit);
    let from = limit * (page - 1);

    data = data.slice(from, from + limit);

    return { data, numOfPages};
}

module.exports = helpers;
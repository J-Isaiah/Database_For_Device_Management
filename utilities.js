function check_if_empty(recBody, input) {
    if (Array.isArray(recBody[input]) === true) {
        return 'YES'

    } else {
        return 'NO'
    }
}

module.exports = {check_if_empty}


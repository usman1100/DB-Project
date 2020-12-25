const get_current_date = () => {
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    let new_date = year + "-" + month + "-" + date;

    return new_date;
};

const get_formated_date = (date_unf) => {
    let date = String(date_unf);
    return date.slice(3, 15);
};

const get_age = dob => {

    let year_a = Number(dob.slice(0, 4));
    let year_b = Number(new Date().toString().slice(11, 16));

    let age = year_b - year_a;
    return age;


}

const clean_sql = (str) => {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
            default:
                return char;
        }
    });
}

const separate_post_comments = (results) => {

    const data = {};

    data.post = results[results.length - 1];
    data.post.likes = data.post.post_likes;
    data.post.title = data.post.post_title;

    data.comments = results.slice(0, results.length - 1);

    return data;


}


module.exports = {
    get_current_date: get_current_date,
    get_formated_date: get_formated_date,
    get_age:get_age,
    clean_sql:clean_sql,
    separate_post_comments:separate_post_comments
};

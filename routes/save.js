
/*
 * POST home page.
 * Saves the user styling and blog title to the database.
 * this is the line from the front end AJAX call: 
 * { 'background-color': $(this).css('background-color'), 'font': font, 'blogTitle':$('#blogTitle').val() }
 */

exports.save = function(req, res){
   db.events.update(
        {UID: req.session.userid},
        { $set: {'background-color': req.body.background-color, 'font': req.body.font, 'blogTitle': req.body.blogTitle } }, 
        function(err, updated) {
                if (err || !updated) {
                        console.log("User settings could not be saved:" + err);
                } else {
                        res.write(JSON.stringify(true).toString("utf-8"));
                        res.end();
                }
        });
};


exports.getChanges = function(req, res, client, cursor){

	var shouldPull = true;
	var cursor = null;
	var allChanges = [];

	while (shouldPull){
		client.delta(cursor, function(err, pullChanges){
			if (err){
				console.log(err);
				return;
			}
			shouldPull = pullChanges.shouldPullAgain;
			cursor = pullChanges.cursorTag;
			allChanges = allChanges.concat(pullChanges.changes);
		});
	}
	return {
		cursor: cursor
		changes: allChanges
	}

}


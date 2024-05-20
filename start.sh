#!/bin/sh

echo Running handbrake-web as $HANDBRAKE_MODE
case $HANDBRAKE_MODE in 
	server)
		node ./server/server/server.js
		;;
	worker)
		node ./worker/worker/worker.js
		;;
esac

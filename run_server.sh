#!/bin/bash
export GUNICORN_CMD_ARGS="--timeout 300"
cd PIUN
exec gunicorn --bind 0.0.0.0:5000 --reuse-port --reload --timeout 300 main:app

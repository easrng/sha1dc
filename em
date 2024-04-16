#!/usr/bin/env bash
export EMSDK_QUIET=1
. ./node_modules/emsdk/emsdk_env.sh
"$@"
exit "$?"
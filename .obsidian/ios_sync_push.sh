#!/bin/sh
(cd ./obsidian-vault-main  && lg2 add . && lg2 commit -m 'iOS sync' 2>/dev/null && lg2 push)
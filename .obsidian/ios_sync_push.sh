#!/bin/sh
(cd ./obsidian-vault-main 2>error_cd.md && lg2 add . && lg2 commit -m 'iOS sync' 2>error_commit.md && lg2 push 2>error_push.md)

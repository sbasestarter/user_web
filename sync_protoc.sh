#!/bin/bash

rm -rf proto-repo
git clone git@github.com:sbasestarter/proto-repo.git

rm -rf proto && true

mkdir proto

mkdir proto/user
mv proto-repo/gen/protorepo-user-web/* proto/user/

mkdir proto/file
mv proto-repo/gen/protorepo-file-web/* proto/file/

mkdir proto/file/share
mv proto-repo/gen/protorepo-share-web/* proto/file/share/

rm -rf proto-repo

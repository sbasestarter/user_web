#!/bin/bash

rm -rf proto-repo
git clone git@github.com:sbasestarter/proto-repo.git

mkdir proto

mkdir proto/user
mv proto-repo/gen/protorepo-user-js_grpc_web/* proto/user/

mkdir proto/file-center
mv proto-repo/gen/protorepo-file-center-js_grpc_web/* proto/file-center/


rm -rf proto-repo

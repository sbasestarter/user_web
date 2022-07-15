#!/bin/bash

root=$1
tgz=$2

pushd ${root}
rm -rf *
popd

tar xvf ${tgz} -C ${root}

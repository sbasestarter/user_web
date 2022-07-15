#/bin/sh

bin=dist.tgz

jump_ssh=root@ymipro.com

npm run build

tar zcvf ${bin} dist

deploy_root=/services/deploy/
target_root=/services/dev/user-web/

ssh ${jump_ssh} "rm -rf ${deploy_root}${bin}.bak"
ssh ${jump_ssh} "cp ${deploy_root}${bin} ${deploy_root}${bin}.bak"
scp ${bin} ${jump_ssh}:${deploy_root}
ssh ${jump_ssh} "cd ${deploy_root} && bash ./_deploy_vue.sh /services/dev/user-web ${bin}"

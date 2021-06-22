### 前端Vue项目ESLint检查

借助gitlab-runner执行代码检查，可实现云端统一的代码检查，减少代码中的坏味道，统一代码规范。

 1. 代码提交

 2. 触发ci.yml文件执行

 3. gitlab-runner首先也需要install node包，并借助cache缓存下来

 4. 执行`npm run eslint`,同时需要在package.json文件中的`script`命令里添加 `"eslint": "eslint --ext .vue --ignore-path .gitignore ."`

    (gitlab-runner的执行环境shell，`直接执行eslint --ext .vue --ignore-path .gitignore .`也是可以的，但实际上会报错，找不到eslint命令，这里稍后处理)

	5. 根据eslint的结果判断成功与否，进入下一执行阶段。

	6. 失败，执行git revert，回退一个版本，并记录下来是因为eslint出错导致提交失败（也可用git reset，但没有记录），这里目前git push失败还未找到解决方案。同时向微信群助手发送消息。

	7. 成功则只是简单发送一条消息。

.gitlab-ci.yml文件如下

```yml
stages:
  - install
  - eslint
  - notify

cache:
  key: '$CI_COMMIT_REF_SLUG'

install:
  stage: install
  cache:
    paths:
      - node_modules/
  script:
    - npm i
  tags:
    - sonar
    
eslint:
  stage: eslint
  cache:
    paths:
      - node_modules/
  only: 
    - develop
    - master
  script:
    - npm run eslint
  tags:
    - sonar

notify-fail:
  stage: notify
  cache:
    paths:
      - node_modules/
  script:
    - >
      curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=75b6a3e4-80d4-464e-9275-34939121557f'
      -H 'Content-Type: application/json'
      -d "可以发送相关的失败通知"
    - git revert -n HEAD~0
    - git commit -m 'eslint_check_failed'
    - cat .git/config
    - git push
  only:
    - master
    - develop
  when: on_failure
  tags:
    - sonar

notify-success:
  stage: notify
  script:
    - >
      curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=75b6a3e4-80d4-464e-9275-34939121557f'
      -H 'Content-Type: application/json'
      -d "相关的成功通知"
  only:
    - master
  tags:
    - sonar

```


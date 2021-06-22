# 代码提交前的ESLint自动审核

每个项目自然而然会由一位同事先行搭建，这位同事可以安装该插件，同时规范好相应的代码规范（配置好eslint）。

1. 初步框架等等时，顺便安装该开发依赖（husky）

```shell
  npm install --save-dev lint-staged husky
  // eslint 自然也要安装
```

2.配置相关的属性，用于pre-commit时执行的内容

```json
{
  "scripts": {
    "lint-staged": "lint-staged"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint-staged"
    }
  },
  "lint-staged": {
    "**/*.js": "eslint --ext .js",
    "**/*.vue": "eslint --ext .vue"
  }
}
```

原理就是在commit之前 执行husky里的命令，进行强制代码审查

审查用的是eslint里规范的规则，如果报错（不满足规则），则会commit失败，需要修改后重新提交。

同时报错的信息会在terminal中显示。

![企业微信截图_15992104454958](C:\Users\fscut\Desktop\企业微信截图_15992104454958.png)


上图为例，执行commit后，发现了报错，确实就是space的问题，

再根据给出的提示看得到是哪个文件的第多少行，去修改即可。

如果觉得该规则不合理或者不理解，可以复制error中的信息百度详情。

当然，最终还是需要大家自觉遵守规范。







这里进行了vue 与js的代码审查，其他类型文件也可添加进去。


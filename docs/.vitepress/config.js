const baseUrl = process.env.BASE || '/'
const path = require('path')

module.exports = {
  title: 'Hello VitePress',
  description: 'Just playing around.',
  base: '',
  themeConfig: {
    nav: [
      {link: ''}
    ],

    sidebar:{
      '/': [
        { text: 'css', link: '/css'},
        { text: 'js', link: '/js/promise'},
        { text: 'webpack', link: '/webpack/CopyWebpackPlugin'},
      ]
    },
    lastUpdated: true

  }
}

function getPath (path) {
  return path.replace('/', baseUrl)
}

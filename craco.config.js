const path = require('path');
module.exports = {
  webpack: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  style: {
    sass: {
      loaderOptions: {
        additionalData: `
          @import "src/assets/scss/_variables.scss";
          @import "src/assets/scss/_mixins.scss";
        `,
      },
    },
  },
};

const path = require('path');
const fs = require('fs');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const globImporter = require('node-sass-glob-importer');
const RemovePlugin = require('remove-files-webpack-plugin');

// // get files in directory

// const src_files=fs.readdirSync(path.join(__dirname, 'src'));
// console.log('src_files', src_files);

// //filter only html files
// let html_files=src_files.filter(element =>/.html$/.test(element));
// console.log('html_files', html_files);

// //add src path to html files
// html_files=html_files.map(element=>`./src/${element}`);

// console.log('html_files', html_files);


const DIST_FOLDER = path.join(__dirname, 'dist');
const SRC_FOLDER = path.join(__dirname, 'src');

//delete unused main.js
const REMOVE_MAIN_JS_PLUGIN = new RemovePlugin({
    after:{
        root:DIST_FOLDER,
        include:['main.js']
    }
});

//get html files
const htmlFiles=
    fs.readdirSync(SRC_FOLDER)
    .filter(element =>/.html$/.test(element))
    .map(element=>`./src/${element}`);

//loader for images
const IMAGES_RULE = {
    test:/\.(jpg|jpeg|gif|png|svg)$/i,
    use:[
        {
            loader:'file-loader',
            options:{
                name:'./images/[name].[ext]'
            }
        }
    ]
};
//main modules
const CSS_MODULE = {
    entry: './src/css/style.scss',
    output:{
        path: DIST_FOLDER,
        publicPath: '.'
    },
    module:{
        rules:[
            {
                test:/\.scss$/i,
                use:[{
                    loader: 'file-loader',
                    options:{
                        name:'./css/[name].css'
                    }

                },
                'extract-loader',
                'css-loader',
                {
                    loader:'postcss-loader',
                    options:{
                        postcssOptions:{
                            plugins:[
                            [
                                'autoprefixer'
                            ]
                          ]
                        }
                      }   
                    },
                    {
                        loader:'sass-loader',
                        options:{
                            sassOptions:{
                                importer: globImporter(),
                                outputStyle:'expanded'
                        }
                    }

                }
                    
                ]
            },
          IMAGES_RULE,
    {
        test:/\.(eot|ttf|svg|woff)$/i,
        use:[
            {
                loader:'file-loader',
                options:{
                    name:'./fonts/[name].[ext]'
                }
            }
        ]
    }
]
},
    plugins:[
       REMOVE_MAIN_JS_PLUGIN
    ]
};

const HTML_MODULE = {
    entry: htmlFiles,
    output:{
        path: DIST_FOLDER,
        publicPath: ''
    },
    module:{
      rules:[
          {
              test:/\.html$/i,
              use:[
                  {
                    loader:'file-loader',
                    options:{
                    name:'[name].[ext]'
                    }
                  },
                  'extract-loader',
                  {
                      loader:'html-loader',
                      options:{
                          minimize: false,
                          attributes:{
                              urlFilter:(attributes, value, resourcePath)=>{
                                  if(/.(css|js)$/.test(value)){
                                      return false;
                                  }
                                  return true;
                              }    
                          }
                      }
                  }

              ]
          },
          IMAGES_RULE
      ]
    },
    plugins:[
        REMOVE_MAIN_JS_PLUGIN
    ]
};

const JS_MODULE= {
        entry: './src/js/app.js',
        output:{
            filename: './js/app.js',
            path:DIST_FOLDER
        },
        optimization:{
            minimize:false
        },
        module:{
            rules:[
                {
                    test:/\.js$/i,
                    exclude:/node_modules/i,
                    use:{
                        loader:'babel-loader',
                        options:{
                            presets:[
                                '@babel/preset-env'
                            ]
                        }
                    }
                }
            ]
        }
}

module.exports = [
    {
        entry: {},
        output:{
            path: DIST_FOLDER
        },
            plugins:[
                new CleanWebpackPlugin()
    
            ]

        },
    HTML_MODULE,
    CSS_MODULE,
    JS_MODULE
];

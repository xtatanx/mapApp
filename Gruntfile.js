module.exports = function(grunt) {

	// PLUGINS LOADED
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-express-server');

	// PROJECT CONFIGURATION
	grunt.initConfig({
		stylus:{
			compile:{
				files:{
					"public/css/main.css": "public/css/main.styl"
				}				
			}
		},

		autoprefixer:{
			main_file:{
				src: "public/css/main.css"
			}
		},

		watch:{
			stylesheets:{
				files: ['public/css/*.styl'],
				tasks:['preproccess']
			},

			livereload: {
				options:{
					livereload: true
				},

				files:['*.html', 'css/*.css', 'js/*.js']
			},

			reload:{
				files:['*.html', 'css/*.css', 'js/*.js'],
				tasks: ['express:dev'],
				options:{
					spawn: false
				}
			}		
		}	,

		express:{
			dev:{
				options:{
					script: 'app.js'
				}
			}
		}	
	});

	// MY TASKS
	grunt.registerTask('observer', 'watch');
	grunt.registerTask('preproccess', ['stylus', 'autoprefixer']);
	grunt.registerTask('createServer', ['express:dev', 'watch']);

};
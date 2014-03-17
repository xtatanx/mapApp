module.exports = function(grunt) {

	// PLUGINS LOADED
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');

	// PROJECT CONFIGURATION
	grunt.initConfig({
		stylus:{
			compile:{
				files:{
					"css/main.css": "css/main.styl"
				}				
			}
		},

		autoprefixer:{
			main_file:{
				src: "css/main.css"
			}
		},

		watch:{
			stylesheets:{
				files: ['css/*.styl'],
				tasks:['preproccess']
			},

			livereload: {
				options:{
					livereload: true
				},

				files:['*.html', 'css/*.css', 'js/*.js']
			}		
		}		
	});

	// MY TASKS
	grunt.registerTask('observer', 'watch');
	grunt.registerTask('preproccess', ['stylus', 'autoprefixer']);

};
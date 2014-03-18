module.exports = function(grunt) {

	// PLUGINS LOADED
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');

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

				files:['.rebooted','public/*.html', 'public/css/*.css', 'public/js/*.js']
			}	
		},

		nodemon:{
			dev:{
				script:'app.js'
			}
		},

		concurrent:{
			dev:{
				tasks:['nodemon', 'watch'],
				options:{
					logConcurrentOutput: true
				},
				callback: function(nodemon){

					nodemon.on('log', function(event){
						console.log(event.colour);
					});	
					nodemon.on('restar', function(){
						setTimeout(function(){
							require('fs').fs.writeFileSync('.rebooted','rebooted');
						}, 1000);

					});

				}
			}
		}
	});

	// MY TASKS
	grunt.registerTask('observer', 'concurrent');
	grunt.registerTask('preproccess', ['stylus', 'autoprefixer']);

};
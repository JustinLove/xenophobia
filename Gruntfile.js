var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.xenophobia/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
    },
    clean: ['pa', modPath],
    // copy files from PA, transform, and put into mod
    proc: {
      // form 1: just the relative path, media src is assumed
      buidable: {
        targets: [
          'pa*/units/**/*.json'
        ],
        process: function(spec) {
          spec.buildable_types = '(' + spec.buildable_types + ') - Custom1 - Custom2 - Custom3 - Custom4'
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      var processSpec = this.data.process
      specs.forEach(function(file) {
        var spec = grunt.file.readJSON(file.abspath)
        if (spec.buildable_types && !file.relpath.match('avatar')) {
          processSpec(spec)
          grunt.file.write(file.relpath, JSON.stringify(spec, null, 2))
        }
      })
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

